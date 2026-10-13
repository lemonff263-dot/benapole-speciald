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
  defaultSeedOrders,
} from './constants';

export {
  defaultCategories,
  defaultFoods,
  defaultOffers,
  defaultSettings,
  defaultTheme,
  defaultSeedOrders,
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

// In-memory cache to guarantee rapid responses and fallback if filesystem has read delays
let inMemoryStore: DataStore | null = null;

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
    orders: defaultSeedOrders,
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
