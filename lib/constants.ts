import {
  Category,
  FoodItem,
  Offer,
  Order,
  RestaurantSettings,
  CustomizerTheme,
  CustomerReview,
} from './types';

export const defaultCategories: Category[] = [
  {
    id: 'doi_chira',
    name: { bn: 'দই চিড়া', en: 'Doi Chira' },
    icon: 'Utensils',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'nachos',
    name: { bn: 'নাচোস', en: 'Nachos' },
    icon: 'Flame',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'chowmein',
    name: { bn: 'চাউমিন', en: 'Chow Mein' },
    icon: 'Soup',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'pasta',
    name: { bn: 'পাস্তা', en: 'Pasta' },
    icon: 'CookingPot',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'burger',
    name: { bn: 'বার্গার', en: 'Burgers' },
    icon: 'Sandwich',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'chicken_fries',
    name: { bn: 'চিকেন ও ফ্রাইস', en: 'Chicken & Fries' },
    icon: 'Drumstick',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'drinks',
    name: { bn: 'ড্রিঙ্কস ও কোল্ড কফি', en: 'Drinks & Cold Coffee' },
    icon: 'Coffee',
    sortOrder: 7,
    isActive: true,
  },
];

export const defaultFoods: FoodItem[] = [];

export const defaultOffers: Offer[] = [
  {
    id: 'off_doichira15',
    code: 'DOICHIRA15',
    title: { bn: 'দই চিড়ায় ১৫% ছাড়', en: '15% Off on Doi Chira' },
    description: {
      bn: '২০০ টাকার বেশি অর্ডারে স্পেশাল ১৫% ইন্সট্যান্ট ডিসকাউন্ট!',
      en: 'Special 15% instant discount on orders above 200 BDT!',
    },
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 200,
    maxDiscount: 60,
    validTill: '2026-12-31',
    isActive: true,
  },
  {
    id: 'off_burger50',
    code: 'BURGER50',
    title: { bn: 'বার্গার কম্বো ৫০৳ ছাড়', en: '50 BDT Off on Burgers' },
    description: {
      bn: '৩০০ টাকার বেশি খাবারে ফ্ল্যাট ৫০ টাকা ক্যাশ ছাড়।',
      en: 'Flat 50 BDT discount on meal orders above 300 BDT.',
    },
    discountType: 'fixed',
    discountValue: 50,
    minOrder: 300,
    validTill: '2026-12-31',
    isActive: true,
  },
  {
    id: 'off_welcome10',
    code: 'BENAPOLE10',
    title: { bn: 'নতুন গ্রাহক ১০% ছাড়', en: 'Welcome 10% Discount' },
    description: {
      bn: 'যেকোনো ১৫০ টাকার অর্ডারে ১০% মূল্যছাড় উপভোগ করুন।',
      en: 'Enjoy 10% off on any order of 150 BDT or more.',
    },
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 150,
    maxDiscount: 40,
    validTill: '2026-12-31',
    isActive: true,
  },
];

export const defaultWeeklySchedule = [
  { day: 'saturday' as const, dayNameBn: 'শনিবার', dayNameEn: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'sunday' as const, dayNameBn: 'রবিবার', dayNameEn: 'Sunday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'monday' as const, dayNameBn: 'সোমবার', dayNameEn: 'Monday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'tuesday' as const, dayNameBn: 'মঙ্গলবার', dayNameEn: 'Tuesday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'wednesday' as const, dayNameBn: 'বুধবার', dayNameEn: 'Wednesday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'thursday' as const, dayNameBn: 'বৃহস্পতিবার', dayNameEn: 'Thursday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'friday' as const, dayNameBn: 'শুক্রবার', dayNameEn: 'Friday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
];

export const defaultSettings: RestaurantSettings = {
  restaurantName: {
    bn: 'বেনাপোল স্পেশাল',
    en: 'Benapole Special',
  },
  tagline: {
    bn: 'স্বাদে ঐতিহ্য, মনে ভালোবাসা',
    en: 'Taste • Freshness • Happiness',
  },
  phone: '01302231925',
  email: 'benapolespecial@gmail.com',
  address: {
    bn: 'বেনাপোল নিত্য হাট (মেয়র মার্কেট), পার্কিং এরিয়া, ঢাকা বিরিয়ানি হাউজ এর পেছনে, বেনাপোল, শার্শা, যশোর',
    en: 'Benapole Nitya Haat (Mayor Market), Parking Area, Behind Dhaka Biriyani House, Benapole, Sharsha, Jashore',
  },
  mapUrl: 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac',
  plusCode: '2WW3+FG7 Benapole',
  coordinates: { lat: 23.046345, lng: 88.903870 },
  openingHours: {
    bn: 'সকাল ১০:০০ টা - রাত ১১:০০ টা (সপ্তাহের ৭ দিন খোলা)',
    en: '10:00 AM - 11:00 PM (Open 7 Days a week)',
  },
  facebookUrl: 'https://facebook.com/benapolespecial',
  deliveryFee: 40,
  minOrderAmount: 60,
  freeDeliveryThreshold: 350,
  estimatedDeliveryMinutes: '২৫ - ৪০ মিনিট',
  estimatedPickupMinutes: '১৫ - ২০ মিনিট',
  isOpen: true,
  isOrderAccepting: true,
  openingTime: '10:00',
  closingTime: '23:00',
  weeklySchedule: defaultWeeklySchedule,
  deliveryAreas: [
    {
      id: 'area_benapole_city',
      name: { bn: 'বেনাপোল পৌরসভা / শহর এলাকা', en: 'Benapole Municipality' },
      fee: 40,
      landmark: 'পৌরসভা চত্বর, প্রধান সড়ক',
      isPopular: true,
      coordinates: { lat: 23.0441, lng: 88.8983 },
    },
    {
      id: 'area_mayor_market',
      name: { bn: 'মেয়র মার্কেট ও নিত্য হাট', en: 'Mayor Market & Nitya Haat' },
      fee: 40,
      landmark: 'বেনাপোল স্পেশাল (দই চিড়া), প্লাস কোড: 2WW3+FG7, নিত্য হাট পার্কিং',
      isPopular: true,
      coordinates: { lat: 23.046345, lng: 88.903870 },
    },
    {
      id: 'area_customs_mor',
      name: { bn: 'কাস্টমস মোড় ও চেকপোস্ট রোড', en: 'Customs Mor & Checkpost Road' },
      fee: 40,
      landmark: 'হোটেল গ্র্যান্ড ও চেকপোস্ট গেট',
      isPopular: true,
    },
    {
      id: 'area_railway_station',
      name: { bn: 'বেনাপোল রেলওয়ে স্টেশন এরিয়া', en: 'Benapole Railway Station' },
      fee: 40,
      landmark: 'স্টেশন রোড ও রেলগেট',
      isPopular: true,
    },
    {
      id: 'area_sharsha_bazar',
      name: { bn: 'শার্শা বাজার ও উপজেলা মোড়', en: 'Sharsha Bazar' },
      fee: 60,
      landmark: 'শার্শা বাজার জামে মসজিদ মোড়',
      isPopular: false,
    },
    {
      id: 'area_bgb_camp',
      name: { bn: 'বিজিবি ক্যাম্প ও লিংক রোড', en: 'BGB Camp & Link Road' },
      fee: 50,
      landmark: 'বিজিবি ক্যাম্প প্রধান ফটক',
      isPopular: false,
    },
    {
      id: 'area_durgapur',
      name: { bn: 'দূর্গাপুর ও সংলগ্ন এলাকা', en: 'Durgapur Area' },
      fee: 50,
      landmark: 'দূর্গাপুর প্রাথমিক বিদ্যালয় সংলগ্ন',
      isPopular: false,
    },
  ],
  paymentConfig: {
    cod: {
      enabled: true,
      label: { bn: 'ক্যাশ অন ডেলিভারি (হাতে পেয়ে টাকা)', en: 'Cash on Delivery (COD)' },
      instructions: {
        bn: 'খাবার হাতে পেয়ে ডেলিভারি ম্যানকে নগদ টাকা পরিশোধ করুন।',
        en: 'Pay cash to the delivery rider upon receiving your food order.',
      },
    },
    pickupCash: {
      enabled: true,
      label: { bn: 'রেস্টুরেন্টে গিয়ে পরিশোধ (পিকআপ)', en: 'Pay at Counter (Pickup)' },
      instructions: {
        bn: 'রেস্টুরেন্ট কাউন্টারে খাবার সংগ্রহের সময় টাকা পরিশোধ করুন।',
        en: 'Pay at the restaurant counter when collecting your order.',
      },
    },
    bkash: {
      enabled: true,
      number: '01302231925',
      type: 'Personal (Send Money)',
      instructions: {
        bn: 'বিকাশ পার্সোনাল নম্বরে "Send Money" করুন এবং ট্রানজেকশন আইডি (TrxID) প্রদান করুন।',
        en: 'Send money to our bKash personal number and enter your Transaction ID.',
      },
    },
    nagad: {
      enabled: true,
      number: '01302231925',
      type: 'Personal (Send Money)',
      instructions: {
        bn: 'নগদ পার্সোনাল নম্বরে সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) দিন।',
        en: 'Send money to our Nagad personal number and enter your Transaction ID.',
      },
    },
    rocket: {
      enabled: true,
      number: '013022319258',
      type: 'Personal (Send Money)',
      instructions: {
        bn: 'রকেট পার্সোনাল নম্বরে সেন্ড মানি করে ট্রানজেকশন আইডি (TrxID) দিন।',
        en: 'Send money to our Rocket personal number and enter your Transaction ID.',
      },
    },
  },
  telegramConfig: {
    enabled: false,
    botToken: '',
    chatId: '',
    notifyOnNewOrder: true,
    notifyOnStatusChange: true,
  },
};

export const defaultTheme: CustomizerTheme = {
  colors: {
    primary: '#0B5D3B', // deep leafy green
    secondary: '#F7931E', // warm orange
    accent: '#F4D05F', // rich golden yellow
    background: '#FFFDF7', // warm cream
    surface: '#FFFFFF',
    textPrimary: '#1F2937',
  },
  typography: {
    headingFont: 'Outfit, sans-serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    borderRadius: 'rounded-2xl',
  },
  sections: {
    header: {
      enabled: true,
      showSearch: true,
      showLanguageSwitch: true,
    },
    hero: {
      enabled: true,
      headline: {
        bn: 'বেনাপোল স্পেশাল দই চিড়া — এখন অনলাইনে!',
        en: 'Benapole Special Doi Chira — Now Online!',
      },
      subheading: {
        bn: 'এক বাটিতে স্বাদে ঐতিহ্য, সেরা খাঁটি মিষ্টি দই আর প্রিমিয়াম বাদাম-কিশমিশ। ঘরে বসেই অর্ডার করুন!',
        en: 'Authentic taste in every bowl. Rich sweet curd, premium nuts & raisins. Order fresh to your doorstep!',
      },
      badgeText: {
        bn: '🔥 বেনাপোলের সেরা ঐতিহ্যবাহী খাবার',
        en: '🔥 Benapole’s #1 Authentic Signature Delight',
      },
      ctaText: {
        bn: 'অর্ডার করুন এখনই →',
        en: 'Order Fresh Now →',
      },
      backgroundImage: '/images/doi_chira.jpg',
    },
    categories: {
      enabled: true,
      title: {
        bn: 'খাবারের ক্যাটাগরি',
        en: 'Explore Menu Categories',
      },
    },
    featuredFoods: {
      enabled: true,
      title: {
        bn: 'জনপ্রিয় ও স্পেশাল খাবার',
        en: 'Bestsellers & Special Items',
      },
      subtitle: {
        bn: 'আমাদের সবচেয়ে পছন্দের ও চাহিদাসম্পন্ন সুস্বাদু মেনু',
        en: 'Hand-picked customer favorites prepared fresh to order',
      },
    },
    offers: {
      enabled: true,
      title: {
        bn: 'আজকের বিশেষ অফার ও ছাড়',
        en: 'Today’s Special Offers & Coupons',
      },
    },
    benefits: {
      enabled: true,
      title: {
        bn: 'কেন বেনাপোল স্পেশাল সেরা?',
        en: 'Why Choose Benapole Special?',
      },
      items: [
        {
          title: { bn: '১০০% খাঁটি ও তাজা উপকরণ', en: '100% Pure & Fresh Ingredients' },
          desc: { bn: 'কোনো কৃত্রিম গন্ধ বা ক্ষতিকর রঙ নেই', en: 'Zero artificial flavors or chemicals' },
          icon: 'Sparkles',
        },
        {
          title: { bn: 'দ্রুততম গরম গরম ডেলিভারি', en: 'Superfast Warm Delivery' },
          desc: { bn: 'বেনাপোল শহর ও আশেপাশের এলাকায় সরাসরি পৌঁছায়', en: 'Direct to your door across Benapole' },
          icon: 'Bike',
        },
        {
          title: { bn: 'সহজ ও নিরাপদ পেমেন্ট', en: 'Convenient Cash & Mobile Pay' },
          desc: { bn: 'ক্যাশ অন ডেলিভারি ও বিকাশ/নগদ সুবিধা', en: 'Cash on delivery, bKash & Nagad supported' },
          icon: 'ShieldCheck',
        },
      ],
    },
    about: {
      enabled: true,
      title: {
        bn: 'আমাদের ঐতিহ্যের গল্প',
        en: 'Our Story & Tradition',
      },
      story: {
        bn: 'বেনাপোল স্পেশাল শুরু হয়েছিল সাধারণ একটি ভালোবাসার স্বপ্ন থেকে—বেনাপোলের মানুষকে খাঁটি, স্বাস্থ্যকর এবং অতুলনীয় স্বাদের স্পেশাল দই চিড়া ও ফাস্টফুড উপহার দেওয়া। প্রতিটি বাটিতে আমরা দিই নিখাদ যত্ন আর আন্তরিকতা।',
        en: 'Benapole Special was founded with a passion to bring pure, hygienic, and deliciously traditional Doi Chira and artisan fast foods to food lovers. Every bowl is made with authentic love and culinary craftsmanship.',
      },
      features: [
        { bn: 'প্রাকৃতিক ও পুষ্টিকর উপাদান', en: 'Natural & wholesome nutrition' },
        { bn: 'পরিষ্কার-পরিচ্ছন্ন স্বাস্থ্যকর কিচেন', en: 'Clean & certified hygienic preparation' },
        { bn: 'পরিবার ও বন্ধুদের সাথে বসার চমৎকার পরিবেশ', en: 'Warm ambiance for families and friends' },
      ],
      image: '/images/restaurant_interior.jpg',
    },
    gallery: {
      enabled: true,
      title: {
        bn: 'রেস্টুরেন্টের ফটো গ্যালারি',
        en: 'Restaurant Moments & Atmosphere',
      },
      images: [
        '/images/doi_chira.jpg',
        '/images/nachos.jpg',
        '/images/chowmein.jpg',
        '/images/burger.jpg',
        '/images/restaurant_interior.jpg',
      ],
    },
    contactLocation: {
      enabled: true,
      title: {
        bn: 'যোগাযোগ ও লোকেশন',
        en: 'Contact & Location',
      },
    },
    footer: {
      enabled: true,
      copyrightText: {
        bn: '© ২০২৬ বেনাপোল স্পেশাল। সর্বস্বত্ব সংরক্ষিত।',
        en: '© 2026 Benapole Special. All rights reserved.',
      },
    },
  },
  version: 1,
  publishedAt: new Date().toISOString(),
};

export const defaultSeedOrders: Order[] = [];

export const defaultReviews: CustomerReview[] = [];


