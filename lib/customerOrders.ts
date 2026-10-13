import { Order, OrderStatus } from './types';

export interface SavedCustomerOrder {
  id: string;
  trackingToken: string;
  customerName: string;
  customerPhone: string;
  itemsSummary: string;
  itemCount: number;
  total: number;
  status: OrderStatus;
  orderMode: 'delivery' | 'pickup';
  address?: string;
  createdAt: string;
}

const STORAGE_KEY = 'benapole_customer_orders';

export function getCustomerOrders(): SavedCustomerOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('Failed to parse customer orders from storage', e);
    return [];
  }
}

export function saveCustomerOrder(order: Order): SavedCustomerOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getCustomerOrders();
    const itemsSummary = order.items
      .map((i) => `${typeof i.name === 'object' ? i.name.bn : i.name} × ${i.quantity}`)
      .join(', ');
    const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

    const newEntry: SavedCustomerOrder = {
      id: order.id,
      trackingToken: order.trackingToken || '',
      customerName: order.customerName || '',
      customerPhone: order.customerPhone || '',
      itemsSummary: itemsSummary || 'খাবার আইটেম',
      itemCount,
      total: order.total,
      status: order.status || 'received',
      orderMode: order.orderMode,
      address: order.address || order.area,
      createdAt: order.createdAt || new Date().toISOString(),
    };

    // Keep unique by ID, newest first, max 20 orders
    const filtered = existing.filter((o) => o.id !== order.id);
    const updated = [newEntry, ...filtered].slice(0, 20);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch storage event so all tabs/components update reactively
    window.dispatchEvent(new Event('benapole_orders_updated'));
    return updated;
  } catch (e) {
    console.warn('Failed to save customer order to storage', e);
    return [];
  }
}

export function updateCustomerOrderStatus(orderId: string, status: OrderStatus): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getCustomerOrders();
    const index = existing.findIndex((o) => o.id === orderId);
    if (index > -1) {
      existing[index].status = status;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
      window.dispatchEvent(new Event('benapole_orders_updated'));
    }
  } catch (e) {
    console.warn('Failed to update customer order status', e);
  }
}
