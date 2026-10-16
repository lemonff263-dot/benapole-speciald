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
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Order,
  OrderStatus,
  FoodItem,
  Category,
  Offer,
  RestaurantSettings,
  CustomizerTheme,
  CustomerReview,
} from './types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const message = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: message,
    operationType,
    path,
    authInfo: {
      userId: null,
      email: null,
    },
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// 1. ORDERS REPOSITORY
// ==========================================

/**
 * Save order to Firestore with durability and schema validation
 */
export async function saveOrderToFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      syncedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetch a single order by ID with guest verification support
 */
export async function getOrderFromFirestore(orderId: string): Promise<Order | null> {
  const path = `orders/${orderId}`;
  try {
    const orderRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderRef);
    if (!snap.exists()) return null;
    return snap.data() as Order;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Update order status and payment status in Firestore
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  newStatus: OrderStatus,
  note?: string,
  paymentStatus?: string
): Promise<void> {
  const path = `orders/${orderId}`;
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
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * List recent orders from Firestore
 */
export async function getOrdersFromFirestore(limitCount = 100): Promise<Order[]> {
  const path = 'orders';
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, limit(limitCount));
    const snap = await getDocs(q);
    const results: Order[] = [];
    snap.forEach((d) => {
      results.push(d.data() as Order);
    });
    // Sort in memory by createdAt desc to avoid needing complex composite Firestore index
    results.sort((a, b) => {
      const timeA = new Date(a.createdAt || 0).getTime();
      const timeB = new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
    return results;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==========================================
// 2. MENU & CATALOG REPOSITORY (With Concurrency Versioning)
// ==========================================

export interface MenuCatalogDoc {
  foods: FoodItem[];
  categories: Category[];
  offers: Offer[];
  version: number;
  updatedAt: string;
}

/**
 * Get active menu catalog from Firestore
 */
export async function getMenuFromFirestore(): Promise<MenuCatalogDoc | null> {
  const path = 'config/menu';
  try {
    const menuRef = doc(db, 'config', 'menu');
    const snap = await getDoc(menuRef);
    if (snap.exists()) {
      return snap.data() as MenuCatalogDoc;
    }

    // Check legacy fallback path 'config/menu_catalog'
    const legacyRef = doc(db, 'config', 'menu_catalog');
    const legacySnap = await getDoc(legacyRef);
    if (legacySnap.exists()) {
      const leg = legacySnap.data();
      return {
        foods: leg.foods || [],
        categories: leg.categories || [],
        offers: leg.offers || [],
        version: leg.version || 1,
        updatedAt: leg.syncedAt || new Date().toISOString(),
      };
    }

    return null;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Save menu, categories, and offers to Firestore with concurrency protection
 */
export async function saveMenuToFirestore(
  foods: FoodItem[],
  categories: Category[],
  offers: Offer[],
  expectedVersion?: number
): Promise<number> {
  const path = 'config/menu';
  try {
    const menuRef = doc(db, 'config', 'menu');
    const snap = await getDoc(menuRef);
    let nextVersion = 1;
    if (snap.exists()) {
      const current = snap.data() as MenuCatalogDoc;
      if (expectedVersion !== undefined && current.version !== expectedVersion) {
        throw new Error(
          `Concurrency Conflict: Menu was modified by another administrator (expected v${expectedVersion}, current v${current.version})`
        );
      }
      nextVersion = (current.version || 0) + 1;
    }

    const payload: MenuCatalogDoc = {
      foods,
      categories,
      offers,
      version: nextVersion,
      updatedAt: new Date().toISOString(),
    };

    // Save to primary singleton path
    await setDoc(menuRef, payload);

    // Also mirror to legacy path for compatibility
    const legacyRef = doc(db, 'config', 'menu_catalog');
    await setDoc(legacyRef, {
      foods,
      categories,
      offers,
      version: nextVersion,
      syncedAt: payload.updatedAt,
    });

    return nextVersion;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Sync menu to Firestore (backward compatible wrapper)
 */
export async function syncMenuToFirestore(
  foods: FoodItem[],
  categories: Category[]
): Promise<void> {
  await saveMenuToFirestore(foods, categories, []);
}

// ==========================================
// 3. RESTAURANT SETTINGS REPOSITORY
// ==========================================

export async function getSettingsFromFirestore(): Promise<RestaurantSettings | null> {
  const path = 'config/restaurant_settings';
  try {
    const settingsRef = doc(db, 'config', 'restaurant_settings');
    const snap = await getDoc(settingsRef);
    if (!snap.exists()) return null;
    return snap.data() as RestaurantSettings;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSettingsToFirestore(
  settings: RestaurantSettings
): Promise<void> {
  const path = 'config/restaurant_settings';
  try {
    const settingsRef = doc(db, 'config', 'restaurant_settings');
    await setDoc(settingsRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// 4. THEME & CUSTOMIZER REPOSITORY
// ==========================================

export interface ThemeConfigDoc {
  draftTheme: CustomizerTheme;
  publishedTheme: CustomizerTheme;
  history: Array<{ version: number; publishedAt: string; theme: CustomizerTheme }>;
  updatedAt: string;
}

export async function getThemeFromFirestore(): Promise<ThemeConfigDoc | null> {
  const path = 'config/theme';
  try {
    const themeRef = doc(db, 'config', 'theme');
    const snap = await getDoc(themeRef);
    if (!snap.exists()) return null;
    return snap.data() as ThemeConfigDoc;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveThemeToFirestore(
  draftTheme: CustomizerTheme,
  publishedTheme: CustomizerTheme,
  history: Array<{ version: number; publishedAt: string; theme: CustomizerTheme }>
): Promise<void> {
  const path = 'config/theme';
  try {
    const themeRef = doc(db, 'config', 'theme');
    await setDoc(themeRef, {
      draftTheme,
      publishedTheme,
      history,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// 5. ADMIN AUTH CREDENTIALS REPOSITORY
// ==========================================

export async function getAdminAuthFromFirestore(): Promise<{ adminPasswordHash: string } | null> {
  const path = 'config/admin_auth';
  try {
    const authRef = doc(db, 'config', 'admin_auth');
    const snap = await getDoc(authRef);
    if (!snap.exists()) return null;
    return snap.data() as { adminPasswordHash: string };
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveAdminAuthToFirestore(adminPasswordHash: string): Promise<void> {
  const path = 'config/admin_auth';
  try {
    const authRef = doc(db, 'config', 'admin_auth');
    await setDoc(authRef, {
      adminPasswordHash,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// 6. CUSTOMER REVIEWS REPOSITORY
// ==========================================

export async function getReviewsFromFirestore(maxCount = 50): Promise<CustomerReview[]> {
  const path = 'reviews';
  try {
    const reviewsCol = collection(db, 'reviews');
    const q = query(reviewsCol, limit(maxCount));
    const snap = await getDocs(q);
    const results: CustomerReview[] = [];
    snap.forEach((d) => {
      const data = d.data() as CustomerReview;
      if (data && data.id) {
        results.push(data);
      }
    });
    // Sort reviews newest first
    results.sort((a, b) => {
      const timeA = new Date(a.date || 0).getTime();
      const timeB = new Date(b.date || 0).getTime();
      return timeB - timeA;
    });
    return results;
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveReviewToFirestore(review: CustomerReview): Promise<void> {
  const path = `reviews/${review.id}`;
  try {
    const reviewRef = doc(db, 'reviews', review.id);
    await setDoc(reviewRef, {
      ...review,
      createdAt: new Date().toISOString(),
    });
  } catch (error: unknown) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}


