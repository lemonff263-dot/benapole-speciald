import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore } from '@/lib/store';
import { OrderStatus } from '@/lib/types';
import { formatStatusUpdateMessage, sendTelegramMessage } from '@/lib/telegram';
import {
  updateOrderStatusInFirestore,
  deleteOrderFromFirestore,
  getOrdersFromFirestore,
} from '@/lib/firestoreService';

export async function GET(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'অননুমোদিত এক্সেস / Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase();

  const store = getStore();

  // Hydrate with latest orders from Firestore live database
  try {
    const firestoreOrders = await getOrdersFromFirestore();
    if (firestoreOrders && firestoreOrders.length > 0) {
      const orderMap = new Map(store.orders.map((o) => [o.id, o]));
      for (const fo of firestoreOrders) {
        orderMap.set(fo.id, fo);
      }
      store.orders = Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      saveStore(store);
    }
  } catch (err) {
    console.warn('Firestore orders sync notice, using local store cache:', err);
  }

  let filtered = [...store.orders];

  if (status && status !== 'all') {
    const targetStatus =
      status === 'pending'
        ? 'received'
        : status === 'delivered'
        ? 'completed'
        : status === 'out_for_delivery' || status === 'ready_for_pickup'
        ? 'ready_or_out'
        : status;
    filtered = filtered.filter((o) => o.status === targetStatus || o.status === status);
  }

  if (search) {
    filtered = filtered.filter(
      (o) =>
        o.id.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerPhone.includes(search)
    );
  }

  // Calculate summary metrics
  const totalOrders = store.orders.length;
  const pendingOrders = store.orders.filter((o) => o.status === 'received').length;
  const preparingOrders = store.orders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length;
  const readyOrOutOrders = store.orders.filter((o) => o.status === 'ready_or_out').length;
  const completedOrders = store.orders.filter((o) => o.status === 'completed').length;
  const cancelledOrders = store.orders.filter((o) => o.status === 'cancelled').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todaySales = store.orders
    .filter((o) => o.createdAt.startsWith(todayStr) && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const totalSales = store.orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  return NextResponse.json({
    orders: filtered,
    stats: {
      totalOrders,
      pendingOrders,
      preparingOrders,
      readyOrOutOrders,
      completedOrders,
      cancelledOrders,
      todaySales,
      totalSales,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'অননুমোদিত এক্সেস / Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, newStatus, paymentStatus, note } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'অর্ডার আইডি আবশ্যক / Order ID is required' }, { status: 400 });
    }

    const store = getStore();
    const orderIndex = store.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json({ error: 'অর্ডার পাওয়া যায়নি / Order not found' }, { status: 404 });
    }

    const order = store.orders[orderIndex];
    let statusChanged = false;

    // Normalizing status alias
    const normalizedStatus: OrderStatus | undefined =
      newStatus === 'pending'
        ? 'received'
        : newStatus === 'delivered'
        ? 'completed'
        : newStatus === 'out_for_delivery' || newStatus === 'ready_for_pickup'
        ? 'ready_or_out'
        : (newStatus as OrderStatus);

    if (normalizedStatus && normalizedStatus !== order.status) {
      const validStatuses: OrderStatus[] = [
        'received',
        'confirmed',
        'preparing',
        'ready_or_out',
        'completed',
        'cancelled',
      ];

      if (validStatuses.includes(normalizedStatus)) {
        order.status = normalizedStatus;
        order.statusHistory.push({
          status: normalizedStatus,
          timestamp: new Date().toISOString(),
          note: note || undefined,
        });
        statusChanged = true;
      }
    }

    if (paymentStatus && ['unpaid', 'pending_verification', 'verified'].includes(paymentStatus)) {
      order.paymentStatus = paymentStatus;
    }

    order.updatedAt = new Date().toISOString();

    // Await status change to Firestore live database first
    if (normalizedStatus) {
      try {
        await updateOrderStatusInFirestore(orderId, normalizedStatus, note, paymentStatus);
      } catch (dbErr) {
        console.error('Critical: Failed to update order status in Firestore:', dbErr);
        return NextResponse.json(
          { error: 'ডেটাবেজে অর্ডারের স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে / Database update failed' },
          { status: 500 }
        );
      }
    }

    store.orders[orderIndex] = order;
    saveStore(store);

    // Telegram notification if status updated
    if (
      statusChanged &&
      store.settings?.telegramConfig?.enabled &&
      store.settings?.telegramConfig?.notifyOnStatusChange &&
      store.settings?.telegramConfig?.botToken &&
      store.settings?.telegramConfig?.chatId
    ) {
      const msg = formatStatusUpdateMessage(order, order.status);
      sendTelegramMessage(
        store.settings.telegramConfig.botToken,
        store.settings.telegramConfig.chatId,
        msg
      ).catch((err) => console.error('Telegram status update error:', err));
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    return NextResponse.json({ error: 'আপডেটে সমস্যা হয়েছে / Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'অননুমোদিত এক্সেস / Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id') || searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'অর্ডার আইডি আবশ্যক / Order ID is required' }, { status: 400 });
    }

    // Await deletion in Firestore first
    try {
      await deleteOrderFromFirestore(orderId);
    } catch (dbErr) {
      console.error('Critical: Failed to delete order in Firestore:', dbErr);
      return NextResponse.json(
        { error: 'ডেটাবেজ থেকে অর্ডার মুছে ফেলা সম্ভব হয়নি / Database delete failed' },
        { status: 500 }
      );
    }

    const store = getStore();
    store.orders = store.orders.filter((o) => o.id !== orderId);
    saveStore(store);

    return NextResponse.json({ success: true, message: 'অর্ডার মুছে ফেলা হয়েছে' });
  } catch (err) {
    return NextResponse.json({ error: 'অর্ডার মুছতে সমস্যা হয়েছে' }, { status: 500 });
  }
}

