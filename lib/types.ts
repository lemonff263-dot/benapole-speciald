export type Language = 'bn' | 'en';

export interface BilingualText {
  bn: string;
  en: string;
}

export interface PortionVariant {
  id: string;
  name: BilingualText;
  price: number;
  isDefault?: boolean;
}

export interface FoodAddOn {
  id: string;
  name: BilingualText;
  price: number;
}

export interface FoodItem {
  id: string;
  name: BilingualText;
  description: BilingualText;
  categoryId: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  isAvailable: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  portionVariants?: PortionVariant[];
  addOns?: FoodAddOn[];
  prepTime?: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: BilingualText;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Offer {
  id: string;
  code: string;
  title: BilingualText;
  description: BilingualText;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  validTill: string;
  isActive: boolean;
  bannerImage?: string;
}

export interface OrderItemSnapshot {
  foodId: string;
  name: BilingualText;
  image: string;
  variantId?: string;
  variantName?: BilingualText;
  selectedAddOns?: Array<{ id: string; name: BilingualText; price: number }>;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  notes?: string;
}

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'ready_or_out'
  | 'completed'
  | 'cancelled';

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string; // e.g. BS-261010-4821
  trackingToken: string;
  customerName: string;
  customerPhone: string;
  orderMode: 'delivery' | 'pickup';
  address?: string;
  area?: string;
  landmark?: string;
  mapCoordinates?: { lat: number; lng: number };
  googleMapsUrl?: string;
  pickupTime?: string;
  instructions?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  paymentMethod: 'cod' | 'pickup_cash' | 'bkash' | 'nagad' | 'rocket';
  paymentStatus: 'unpaid' | 'pending_verification' | 'verified';
  transactionId?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryArea {
  id: string;
  name: BilingualText;
  fee?: number;
  landmark?: string;
  isPopular?: boolean;
  coordinates?: { lat: number; lng: number };
}

export interface RestaurantSettings {
  restaurantName: BilingualText;
  tagline: BilingualText;
  phone: string;
  email: string;
  address: BilingualText;
  mapUrl: string;
  plusCode?: string;
  coordinates?: { lat: number; lng: number };
  openingHours: BilingualText;
  facebookUrl: string;
  deliveryFee: number;
  minOrderAmount: number;
  freeDeliveryThreshold: number;
  estimatedDeliveryMinutes: string;
  estimatedPickupMinutes: string;
  isOpen: boolean;
  isOrderAccepting?: boolean;
  openingTime?: string;
  closingTime?: string;
  deliveryAreas: DeliveryArea[];
  paymentConfig: {
    cod: { enabled: boolean; label: BilingualText; instructions: BilingualText };
    pickupCash: { enabled: boolean; label: BilingualText; instructions: BilingualText };
    bkash: { enabled: boolean; number: string; type: string; instructions: BilingualText };
    nagad: { enabled: boolean; number: string; type: string; instructions: BilingualText };
    rocket: { enabled: boolean; number: string; type: string; instructions: BilingualText };
  };
  telegramConfig: {
    enabled: boolean;
    botToken: string;
    chatId: string;
    notifyOnNewOrder: boolean;
    notifyOnStatusChange: boolean;
    lastTestedAt?: string;
  };
}

export interface CustomizerTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    textPrimary: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    borderRadius: 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl';
  };
  sections: {
    header: { enabled: boolean; showSearch: boolean; showLanguageSwitch: boolean };
    hero: {
      enabled: boolean;
      headline: BilingualText;
      subheading: BilingualText;
      badgeText: BilingualText;
      ctaText: BilingualText;
      backgroundImage: string;
    };
    categories: { enabled: boolean; title: BilingualText };
    featuredFoods: { enabled: boolean; title: BilingualText; subtitle: BilingualText };
    offers: { enabled: boolean; title: BilingualText };
    benefits: {
      enabled: boolean;
      title: BilingualText;
      items: Array<{ title: BilingualText; desc: BilingualText; icon: string }>;
    };
    about: {
      enabled: boolean;
      title: BilingualText;
      story: BilingualText;
      features: Array<BilingualText>;
      image: string;
    };
    gallery: { enabled: boolean; title: BilingualText; images: string[] };
    contactLocation: { enabled: boolean; title: BilingualText };
    footer: { enabled: boolean; copyrightText: BilingualText };
  };
  version: number;
  publishedAt: string;
}

export interface CartItem {
  id: string; // unique item key including variant & add-ons
  foodId: string;
  name: BilingualText;
  image: string;
  variantId?: string;
  variantName?: BilingualText;
  selectedAddOns: Array<{ id: string; name: BilingualText; price: number }>;
  unitPrice: number;
  quantity: number;
  notes?: string;
}
