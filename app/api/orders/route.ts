import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import { Order, OrderItemSnapshot, OrderStatus } from '@/lib/types';
import { formatNewOrderMessage, sendTelegramMessage } from '@/lib/telegram';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';
import { saveOrderToFirestore } from '@/lib/firestoreService';

function generateOrderId(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BS-${yy}${mm}${dd}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      orderMode,
      address,
      area,
      landmark,
      mapCoordinates,
      googleMapsUrl,
      pickupTime,
      instructions,
      items,
      couponCode,
      paymentMethod,
      transactionId,
    } = body;

    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
      return NextResponse.json({ error: 'গ্রাহকের নাম আবশ্যক / Customer name is required' }, { status: 400 });
    }

    if (!customerPhone || typeof customerPhone !== 'string') {
      return NextResponse.json({ error: 'মোবাইল নম্বর আবশ্যক / Phone number is required' }, { status: 400 });
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন / Invalid mobile number' },
        { status: 400 }
      );
    }

    if (!orderMode || !['delivery', 'pickup'].includes(orderMode)) {
      return NextResponse.json({ error: 'অর্ডার মোড নির্বাচন করুন / Invalid order mode' }, { status: 400 });
    }

    if (orderMode === 'delivery' && (!address || address.trim().length < 3)) {
      return NextResponse.json({ error: 'ডেলিভারির পূর্ণ ঠিকানা দিন / Delivery address is required' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'কার্টে কোনো খাবার নেই / Cart is empty' }, { status: 400 });
    }

    const store = getStore();

    // Check operating hours & order taking status strictly
    const openStatus = checkRestaurantOpenStatus(store.settings);
    if (!openStatus.canAcceptOrders) {
      return NextResponse.json(
        {
          error: openStatus.reasonBn || 'রেস্টুরেন্টে বর্তমানে অর্ডার গ্রহণ বন্ধ আছে।',
          isStoreClosed: true,
          details: openStatus,
        },
        { status: 400 }
      );
    }

    // SPAM PREVENTION: Max 2 active running orders per phone number at any time
    const activeRunningOrders = (store.orders || []).filter((o) => {
      const oClean = o.customerPhone.replace(/\D/g, '');
      const isSamePhone =
        oClean.length >= 10 &&
        cleanPhone.length >= 10 &&
        (oClean.endsWith(cleanPhone.slice(-10)) || cleanPhone.endsWith(oClean.slice(-10)));
      const isRunning = ['received', 'confirmed', 'preparing', 'ready_or_out'].includes(o.status);
      return isSamePhone && isRunning;
    });

    if (activeRunningOrders.length >= 2) {
      return NextResponse.json(
        {
          error: 'স্প্যাম প্রতিরোধ: আপনার এই ফোন নম্বর থেকে ইতিমধ্যে ২টি রানিং অর্ডার প্রক্রিয়াধীন রয়েছে। পূর্ববর্তী যেকোনো একটি অর্ডার ডেলিভারি সম্পন্ন হলে নতুন অর্ডার করতে পারবেন।',
          activeOrdersCount: activeRunningOrders.length,
          activeOrderIds: activeRunningOrders.map((o) => o.id),
        },
        { status: 429 }
      );
    }

    const foodMap = new Map(store.foods.map((f) => [f.id, f]));

    // Calculate server-side prices strictly from database
    const orderItems: OrderItemSnapshot[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const food = foodMap.get(item.foodId);
      if (!food) {
        return NextResponse.json({ error: `খাবারটি পাওয়া যায়নি / Food item not found: ${item.foodId}` }, { status: 400 });
      }

      let unitPrice = food.price;
      let variantName = undefined;

      if (item.variantId && food.portionVariants) {
        const variant = food.portionVariants.find((v) => v.id === item.variantId);
        if (variant) {
          unitPrice = variant.price;
          variantName = variant.name;
        }
      }

      const verifiedAddOns: Array<{ id: string; name: { bn: string; en: string }; price: number }> = [];
      if (Array.isArray(item.selectedAddOns) && food.addOns) {
        const addOnMap = new Map(food.addOns.map((a) => [a.id, a]));
        for (const userAddOn of item.selectedAddOns) {
          const matched = addOnMap.get(userAddOn.id);
          if (matched) {
            unitPrice += matched.price;
            verifiedAddOns.push({ id: matched.id, name: matched.name, price: matched.price });
          }
        }
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemTotal = unitPrice * qty;
      calculatedSubtotal += itemTotal;

      orderItems.push({
        foodId: food.id,
        name: food.name,
        image: food.image,
        variantId: item.variantId,
        variantName,
        selectedAddOns: verifiedAddOns,
        unitPrice,
        quantity: qty,
        totalPrice: itemTotal,
        notes: item.notes ? String(item.notes).slice(0, 200) : undefined,
      });
    }

    // Minimum order check
    if (calculatedSubtotal < store.settings.minOrderAmount) {
      return NextResponse.json(
        {
          error: `ন্যূনতম অর্ডার মূল্য ৳${store.settings.minOrderAmount} হতে হবে / Minimum order is ৳${store.settings.minOrderAmount}`,
        },
        { status: 400 }
      );
    }

    // Server-side coupon verification
    let discount = 0;
    let appliedCoupon = undefined;
    if (couponCode && typeof couponCode === 'string') {
      const foundOffer = store.offers.find(
        (o) => o.code.toUpperCase() === couponCode.trim().toUpperCase() && o.isActive
      );
      if (foundOffer) {
        if (calculatedSubtotal >= foundOffer.minOrder) {
          if (foundOffer.discountType === 'percentage') {
            discount = Math.round((calculatedSubtotal * foundOffer.discountValue) / 100);
            if (foundOffer.maxDiscount && discount > foundOffer.maxDiscount) {
              discount = foundOffer.maxDiscount;
            }
          } else {
            discount = foundOffer.discountValue;
          }
          appliedCoupon = foundOffer.code;
        }
      }
    }

    // Delivery fee calculation
    let deliveryFee = 0;
    if (orderMode === 'delivery') {
      if (calculatedSubtotal >= store.settings.freeDeliveryThreshold) {
        deliveryFee = 0;
      } else {
        deliveryFee = store.settings.deliveryFee;
      }
    }

    const total = Math.max(0, calculatedSubtotal - discount + deliveryFee);

    // Payment validation
    const validPaymentMethods = ['cod', 'pickup_cash', 'bkash', 'nagad', 'rocket'];
    const chosenMethod = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'cod';
    const isManualPay = ['bkash', 'nagad', 'rocket'].includes(chosenMethod);

    const newOrder: Order = {
      id: generateOrderId(),
      trackingToken: 'tok_' + Math.random().toString(36).substring(2, 12),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      orderMode,
      address: address?.trim(),
      area: area?.trim(),
      landmark: landmark?.trim(),
      mapCoordinates: mapCoordinates || undefined,
      googleMapsUrl: googleMapsUrl || undefined,
      pickupTime: pickupTime?.trim(),
      instructions: instructions?.trim(),
      items: orderItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      discount,
      couponCode: appliedCoupon,
      total,
      paymentMethod: chosenMethod,
      paymentStatus: isManualPay ? 'pending_verification' : 'unpaid',
      transactionId: transactionId ? String(transactionId).trim().slice(0, 50) : undefined,
      status: 'received' as OrderStatus,
      statusHistory: [
        {
          status: 'received',
          timestamp: new Date().toISOString(),
          note: 'অর্ডার সফলভাবে সিস্টেমে যুক্ত হয়েছে',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.orders.unshift(newOrder);
    saveStore(store);

    // Synchronize to Firestore live database (non-blocking)
    saveOrderToFirestore(newOrder).catch((err) => {
      console.warn('Firestore live sync note:', err?.message || err);
    });

    // Asynchronous Telegram notification dispatch (non-blocking)
    if (
      store.settings?.telegramConfig?.enabled &&
      store.settings?.telegramConfig?.notifyOnNewOrder &&
      store.settings?.telegramConfig?.botToken &&
      store.settings?.telegramConfig?.chatId
    ) {
      const msg = formatNewOrderMessage(newOrder, store.settings);
      sendTelegramMessage(
        store.settings.telegramConfig.botToken,
        store.settings.telegramConfig.chatId,
        msg
      ).catch((err) => console.error('Telegram notification error:', err));
    }

    return NextResponse.json({
      success: true,
      orderId: newOrder.id,
      trackingToken: newOrder.trackingToken,
      order: newOrder,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Order creation error:', errorMsg);
    return NextResponse.json({ error: 'অর্ডার তৈরিতে ত্রুটি হয়েছে / Failed to place order' }, { status: 500 });
  }
}

// Guest Order Tracking Endpoint (Order ID + verification token or phone)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const token = searchParams.get('token');
  const phone = searchParams.get('phone');

  if (!orderId) {
    return NextResponse.json({ error: 'অর্ডার নম্বর প্রদান করুন / Order ID is required' }, { status: 400 });
  }

  const store = getStore();
  const order = store.orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());

  if (!order) {
    return NextResponse.json({ error: 'অর্ডারটি খুঁজে পাওয়া যায়নি / Order not found' }, { status: 404 });
  }

  // Verification protection: must provide matching token or matching phone number
  const isTokenMatch = token && order.trackingToken === token;
  const isPhoneMatch = phone && order.customerPhone.replace(/\D/g, '') === phone.replace(/\D/g, '');

  if (!isTokenMatch && !isPhoneMatch) {
    return NextResponse.json(
      {
        error:
          'নিরাপত্তার স্বার্থে সঠিক মোবাইল নম্বর বা ট্র্যাকিং লিংক দিন / Phone number or token verification required',
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ success: true, order });
}
