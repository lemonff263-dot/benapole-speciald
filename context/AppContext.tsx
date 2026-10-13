'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  FoodItem,
  Category,
  Offer,
  RestaurantSettings,
  CustomizerTheme,
  CartItem,
} from '@/lib/types';
import { defaultSettings, defaultTheme } from '@/lib/constants';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (bilingual?: { bn: string; en: string } | null, fallback?: string) => string;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  foods: FoodItem[];
  categories: Category[];
  offers: Offer[];
  settings: RestaurantSettings;
  theme: CustomizerTheme;
  appliedCoupon: Offer | null;
  setAppliedCoupon: (coupon: Offer | null) => void;
  refreshMenuData: () => Promise<void>;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  activeTrackingId: string | null;
  setActiveTrackingId: (id: string | null) => void;
  activeTrackingToken: string | null;
  setActiveTrackingToken: (token: string | null) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isCustomizerOpen: boolean;
  setIsCustomizerOpen: (open: boolean) => void;
  selectedFoodForModal: FoodItem | null;
  setSelectedFoodForModal: (food: FoodItem | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('bn');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>(defaultSettings);
  const [theme, setTheme] = useState<CustomizerTheme>(defaultTheme);
  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [activeTrackingToken, setActiveTrackingToken] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedFoodForModal, setSelectedFoodForModal] = useState<FoodItem | null>(null);

  // Load language and cart from localStorage
  useEffect(() => {
    let isMounted = true;
    void (async () => {
      try {
        const savedLang = localStorage.getItem('benapole_lang') as Language;
        if (isMounted && savedLang && (savedLang === 'bn' || savedLang === 'en')) {
          setLangState(savedLang);
        }

        const savedCart = localStorage.getItem('benapole_cart');
        if (isMounted && savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (e) {
        console.warn('Storage read failed', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('benapole_lang', newLang);
    } catch {}
  };

  const t = (bilingual?: { bn: string; en: string } | null, fallback = ''): string => {
    if (!bilingual) return fallback;
    return bilingual[lang] || bilingual.bn || bilingual.en || fallback;
  };

  const persistCart = (updated: CartItem[]) => {
    setCart(updated);
    try {
      localStorage.setItem('benapole_cart', JSON.stringify(updated));
    } catch {}
  };

  const addToCart = (newItem: CartItem) => {
    const existingIndex = cart.findIndex((item) => item.id === newItem.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += newItem.quantity;
      persistCart(updated);
    } else {
      persistCart([...cart, newItem]);
    }
    setIsCartOpen(true);
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === itemId) {
          const nextQty = item.quantity + delta;
          return nextQty > 0 ? { ...item, quantity: nextQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    persistCart(updated);
  };

  const removeFromCart = (itemId: string) => {
    const updated = cart.filter((item) => item.id !== itemId);
    persistCart(updated);
  };

  const clearCart = () => {
    persistCart([]);
    setAppliedCoupon(null);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const refreshMenuData = async () => {
    try {
      const res = await fetch(`/api/menu?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.foods) setFoods(data.foods);
        if (data.categories) setCategories(data.categories);
        if (data.offers) setOffers(data.offers);
        if (data.settings) setSettings(data.settings);
        if (data.theme) setTheme(data.theme);
      }
    } catch (e) {
      console.error('Failed to fetch menu data', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await fetch(`/api/menu?t=${Date.now()}`, { cache: 'no-store' });
        if (isMounted && res.ok) {
          const data = await res.json();
          if (data.foods) setFoods(data.foods);
          if (data.categories) setCategories(data.categories);
          if (data.offers) setOffers(data.offers);
          if (data.settings) setSettings(data.settings);
          if (data.theme) setTheme(data.theme);
        }
      } catch (e) {
        console.error('Failed to fetch menu data', e);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        t,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        foods,
        categories,
        offers,
        settings,
        theme,
        appliedCoupon,
        setAppliedCoupon,
        refreshMenuData,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeTrackingId,
        setActiveTrackingId,
        activeTrackingToken,
        setActiveTrackingToken,
        isAdminOpen,
        setIsAdminOpen,
        isCustomizerOpen,
        setIsCustomizerOpen,
        selectedFoodForModal,
        setSelectedFoodForModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
