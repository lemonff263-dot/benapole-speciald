import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Order, OrderStatus } from './types';

export class FirestorePermissionError extends Error {
  constructor(public context: Record<string, unknown>) {
    super(
      `Firestore Permission Denied: ${JSON.stringify(context, null, 2)}`
    );
    this.name = 'FirestorePermissionError';
  }
}

/**
 * Save or update order in Firestore
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('permission-denied') || err.message?.includes('Missing or insufficient permissions')) {
      throw new FirestorePermissionError({
        action: 'saveOrder',
        orderId: order.id,
        operation: 'setDoc',
        collection: 'orders',
      });
    }
    console.warn('Firestore save order non-blocking fallback:', err.message);
  }
}

/**
 * Fetch a single order from Firestore by Order ID
 */
export async function getOrderFromFirestore(orderId: string): Promise<Order | null> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return null;
    return snap.data() as Order;
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('permission-denied')) {
      throw new FirestorePermissionError({
        action: 'getOrder',
        orderId,
        operation: 'getDoc',
        collection: 'orders',
      });
    }
    console.warn('Firestore get order non-blocking fallback:', err.message);
    return null;
  }
}

/**
 * Update order status in Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  paymentStatus?: string
): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const updates: Record<string, unknown> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    await updateDoc(orderRef, updates);
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message?.includes('permission-denied')) {
      throw new FirestorePermissionError({
        action: 'updateOrderStatus',
        orderId,
        newStatus,
        operation: 'updateDoc',
        collection: 'orders',
      });
    }
    console.warn('Firestore update order status non-blocking fallback:', err.message);
  }
}

/**
 * Delete order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Firestore delete order non-blocking fallback:', err.message);
  }
}

/**
 * Fetch recent orders from Firestore
 */
export async function getOrdersFromFirestore(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, limit(100));
    const snap = await getDocs(q);
    const results: Order[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Order);
    });
    return results;
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Firestore list orders non-blocking fallback:', err.message);
    return [];
  }
}

/**
 * Save restaurant settings to Firestore
 */
export async function saveSettingsToFirestore(settings: any): Promise<void> {
  try {
    const settingsRef = doc(db, 'config', 'restaurant_settings');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Firestore save settings non-blocking fallback:', err.message);
  }
}

/**
 * Sync entire menu and categories to Firestore
 */
export async function syncMenuToFirestore(foods: any[], categories: any[]): Promise<void> {
  try {
    const menuRef = doc(db, 'config', 'menu_catalog');
    await setDoc(menuRef, {
      foods,
      categories,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Firestore sync menu non-blocking fallback:', err.message);
  }
}

/**
 * Save customer review to Firestore
 */
export async function saveReviewToFirestore(review: any): Promise<void> {
  try {
    const reviewRef = doc(db, 'config', `review_${review.id}`);
    await setDoc(reviewRef, {
      ...review,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.warn('Firestore save review non-blocking fallback:', err.message);
  }
}

