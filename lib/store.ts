import fs from 'fs';
import path from 'path';
import {
  Category,
  FoodItem,
  Offer,
  Order,
  RestaurantSettings,
  CustomizerTheme,
} from './types';
import {
  defaultCategories,
  defaultFoods,
  defaultOffers,
  defaultSettings,
  defaultTheme,
} from './constants';
import {
  getMenuFromFirestore,
  getSettingsFromFirestore,
  getThemeFromFirestore,
  getAdminAuthFromFirestore,
  saveMenuToFirestore,
  saveSettingsToFirestore,
  saveThemeToFirestore,
} from './firestoreService';

export {
  defaultCategories,
  defaultFoods,
  defaultOffers,
  defaultSettings,
  defaultTheme,
};

export interface DataStore {
  categories: Category[];
  foods: FoodItem[];
  offers: Offer[];
  orders: Order[];
  settings: RestaurantSettings;
  draftTheme: CustomizerTheme;
  publishedTheme: CustomizerTheme;
  themeHistory: { version: number; publishedAt: string; theme: CustomizerTheme }[];
  adminPasswordHash: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'store.json');

// In-memory cache to guarantee rapid responses
let inMemoryStore: DataStore | null = null;
let isFirestoreInitialized = false;

export function getStore(): DataStore {
  if (inMemoryStore) {
    return inMemoryStore;
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryStore = JSON.parse(raw);
      if (inMemoryStore) {
        let changed = false;
        if (!inMemoryStore.settings) {
          inMemoryStore.settings = { ...defaultSettings };
          changed = true;
        }
        if (!inMemoryStore.settings.deliveryAreas || inMemoryStore.settings.deliveryAreas.length === 0) {
          inMemoryStore.settings.deliveryAreas = defaultSettings.deliveryAreas;
          changed = true;
        }
        if (!inMemoryStore.settings.telegramConfig) {
          inMemoryStore.settings.telegramConfig = { ...defaultSettings.telegramConfig };
          changed = true;
        }
        if (!inMemoryStore.orders) {
          inMemoryStore.orders = [];
          changed = true;
        }
        if (!inMemoryStore.foods) {
          inMemoryStore.foods = [];
          changed = true;
        }
        if (changed) {
          saveStore(inMemoryStore);
        }
        return inMemoryStore;
      }
    }
  } catch (err) {
    console.error('Failed to read data file, initializing fresh store:', err);
  }

  // Initialize fresh store
  const fresh: DataStore = {
    categories: defaultCategories,
    foods: defaultFoods,
    offers: defaultOffers,
    orders: [],
    settings: defaultSettings,
    draftTheme: defaultTheme,
    publishedTheme: defaultTheme,
    themeHistory: [{ version: 1, publishedAt: defaultTheme.publishedAt, theme: defaultTheme }],
    adminPasswordHash: 'benapole123',
  };

  saveStore(fresh);
  return fresh;
}

export function saveStore(store: DataStore): void {
  inMemoryStore = store;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store to disk:', err);
  }
}

/**
 * Hydrates store from Firestore live database if available,
 * or pushes initial store to Firestore if Firestore is unseeded.
 */
export async function syncStoreWithFirestore(): Promise<DataStore> {
  const store = getStore();
  if (isFirestoreInitialized) {
    return store;
  }

  try {
    const [remoteMenu, remoteSettings, remoteTheme, remoteAuth] = await Promise.allSettled([
      getMenuFromFirestore(),
      getSettingsFromFirestore(),
      getThemeFromFirestore(),
      getAdminAuthFromFirestore(),
    ]);

    // 1. Menu hydration
    if (remoteMenu.status === 'fulfilled' && remoteMenu.value) {
      if (remoteMenu.value.foods) store.foods = remoteMenu.value.foods;
      if (remoteMenu.value.categories) store.categories = remoteMenu.value.categories;
      if (remoteMenu.value.offers) store.offers = remoteMenu.value.offers;
    } else if (remoteMenu.status === 'fulfilled' && !remoteMenu.value) {
      // Seed Firestore with baseline
      void saveMenuToFirestore(store.foods, store.categories, store.offers);
    }

    // 2. Settings hydration
    if (remoteSettings.status === 'fulfilled' && remoteSettings.value) {
      store.settings = { ...store.settings, ...remoteSettings.value };
    } else if (remoteSettings.status === 'fulfilled' && !remoteSettings.value) {
      void saveSettingsToFirestore(store.settings);
    }

    // 3. Theme hydration
    if (remoteTheme.status === 'fulfilled' && remoteTheme.value) {
      if (remoteTheme.value.draftTheme) store.draftTheme = remoteTheme.value.draftTheme;
      if (remoteTheme.value.publishedTheme) store.publishedTheme = remoteTheme.value.publishedTheme;
      if (remoteTheme.value.history) store.themeHistory = remoteTheme.value.history;
    } else if (remoteTheme.status === 'fulfilled' && !remoteTheme.value) {
      void saveThemeToFirestore(store.draftTheme, store.publishedTheme, store.themeHistory);
    }

    // 4. Admin Auth Password
    if (remoteAuth.status === 'fulfilled' && remoteAuth.value?.adminPasswordHash) {
      store.adminPasswordHash = remoteAuth.value.adminPasswordHash;
    }

    saveStore(store);
    isFirestoreInitialized = true;
  } catch (err) {
    console.warn('Initial Firestore store hydration deferred:', err);
  }

  return store;
}

