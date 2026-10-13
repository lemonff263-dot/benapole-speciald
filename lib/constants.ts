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

export const defaultFoods: FoodItem[] = [
  {
    id: 'doi-chira-signature',
    name: { bn: 'বেনাপোল স্পেশাল দই চিড়া', en: 'Benapole Special Doi Chira' },
    description: {
      bn: 'ঐতিহ্যবাহী গাঢ় মিষ্টি দই, ভেজা চিড়া, মাওয়া, বেদানা/ডালিম, কিশমিশ এবং রোস্টেড বাদামের রাজকীয় সুস্বাদু কম্বিনেশন।',
      en: 'Signature rich sweet curd, soft soaked flattened rice, mawa, ruby pomegranate seeds, golden raisins, and roasted nuts.',
    },
    categoryId: 'doi_chira',
    price: 60,
    compareAtPrice: 80,
    image: '/images/doi_chira.jpg',
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    isNew: false,
    prepTime: '৫-৭ মিনিট',
    sortOrder: 1,
    portionVariants: [
      { id: 'v_normal', name: { bn: 'নরমাল বাটি', en: 'Normal Bowl' }, price: 40 },
      { id: 'v_half', name: { bn: 'স্পেশাল হাফ বাটি', en: 'Special Half' }, price: 60, isDefault: true },
      { id: 'v_full', name: { bn: 'স্পেশাল ফুল বাটি', en: 'Special Full' }, price: 80 },
    ],
    addOns: [
      { id: 'add_badam', name: { bn: 'এক্সট্রা কাজু ও পেস্তা বাদাম', en: 'Extra Nuts (Cashew/Pista)' }, price: 20 },
      { id: 'add_kismis', name: { bn: 'এক্সট্রা কিশমিশ', en: 'Extra Raisins' }, price: 15 },
      { id: 'add_mawa', name: { bn: 'স্পেশাল মাওয়া ক্ষীর', en: 'Special Mawa Khoya' }, price: 25 },
    ],
  },
  {
    id: 'nachos-chicken-supreme',
    name: { bn: 'চিকেন চিজি নাচোস', en: 'Chicken Cheesy Nachos' },
    description: {
      bn: 'মুচমুচে কর্ন টর্টিলা চিপস, সিজনিং চিকেন, গলানো হট চিডার চিজ সস এবং ফ্রেশ পিকো দে গ্যালো সালসা।',
      en: 'Crisp tortilla corn chips topped with seasoned chicken, melting hot cheddar sauce, and fresh salsa dip.',
    },
    categoryId: 'nachos',
    price: 80,
    compareAtPrice: 100,
    image: '/images/nachos.jpg',
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    prepTime: '১০-১৫ মিনিট',
    sortOrder: 2,
    portionVariants: [
      { id: 'v_nachos_half', name: { bn: 'হাফ প্লেট', en: 'Half Plate' }, price: 80, isDefault: true },
      { id: 'v_nachos_full', name: { bn: 'ফুল প্লেট', en: 'Full Plate' }, price: 120 },
    ],
    addOns: [
      { id: 'add_extra_cheese', name: { bn: 'এক্সট্রা গলানো চিজ সস', en: 'Extra Cheese Sauce' }, price: 30 },
      { id: 'add_extra_chicken', name: { bn: 'এক্সট্রা চিকেন টপিং', en: 'Extra Chicken Topping' }, price: 35 },
    ],
  },
  {
    id: 'chowmein-chicken-wok',
    name: { bn: 'চিকেন চাউমিন স্পেশাল', en: 'Special Chicken Chowmein' },
    description: {
      bn: 'হট ওক-টস্ট ফ্রেশ নুডুলস, স্ক্র্যাম্বলড ডিম, রসালো চিকেন স্ট্রিপস, ক্যাপসিকাম ও শেফের স্পেশাল সস।',
      en: 'Wok-tossed noodles with scrambled egg ribbons, juicy chicken strips, bell peppers, and savory chef sauce.',
    },
    categoryId: 'chowmein',
    price: 80,
    compareAtPrice: 95,
    image: '/images/chowmein.jpg',
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    prepTime: '১০ মিনিট',
    sortOrder: 3,
    portionVariants: [
      { id: 'v_egg_chow', name: { bn: 'এগ চাউমিন', en: 'Egg Chowmein' }, price: 60 },
      { id: 'v_chicken_chow', name: { bn: 'চিকেন চাউমিন', en: 'Chicken Chowmein' }, price: 80, isDefault: true },
    ],
    addOns: [
      { id: 'add_chow_sauce', name: { bn: 'স্পাইসি হট চিলি সস', en: 'Hot Chili Garlic Sauce' }, price: 10 },
      { id: 'add_chow_egg', name: { bn: 'এক্সট্রা ফ্রাইড এগ', en: 'Extra Fried Egg' }, price: 20 },
    ],
  },
  {
    id: 'burger-crispy-chicken',
    name: { bn: 'চিকেন ক্রিস্পি চিজ বার্গার', en: 'Chicken Crispy Cheese Burger' },
    description: {
      bn: 'স্বর্ণালী ক্রাঞ্চি ফ্রাইড চিকেন ফিলে, প্রিমিয়াম চিডার চিজ স্লাইস, তাজা লেটুস ও মেয়োনেজ সমৃদ্ধ তিলের বান।',
      en: 'Golden crispy chicken fillet, premium cheddar slice, crisp lettuce, garlic mayo, in a toasted sesame bun.',
    },
    categoryId: 'burger',
    price: 80,
    compareAtPrice: 110,
    image: '/images/burger.jpg',
    isAvailable: true,
    isBestseller: true,
    isFeatured: true,
    prepTime: '১২-১৫ মিনিট',
    sortOrder: 4,
    portionVariants: [
      { id: 'v_burger_regular', name: { bn: 'চিকেন বার্গার', en: 'Chicken Burger' }, price: 60 },
      { id: 'v_burger_cheese', name: { bn: 'চিকেন চিজ বার্গার', en: 'Chicken Cheese Burger' }, price: 80, isDefault: true },
      { id: 'v_burger_crispy_pro', name: { bn: 'চিকেন ক্রিস্পি বিগ চিজ', en: 'Crispy Big Cheese' }, price: 150 },
    ],
    addOns: [
      { id: 'add_cheese_slice', name: { bn: 'এক্সট্রা চিজ স্লাইস', en: 'Extra Cheese Slice' }, price: 25 },
      { id: 'add_patty', name: { bn: 'এক্সট্রা ক্রিস্পি চিকেন প্যাটি', en: 'Extra Chicken Patty' }, price: 60 },
    ],
  },
  {
    id: 'pasta-chicken-cheese',
    name: { bn: 'চিকেন চিজ পাস্তা', en: 'Chicken Cheese Pasta' },
    description: {
      bn: 'ওভেন বেকড মাখনের মতো নরম মোজারেলা চিজ, মশলাদার চিকেন কিউবস এবং হট ইতালিয়ান টমেটো বেস পাস্তা।',
      en: 'Baked penne pasta enveloped with melted mozzarella, spiced chicken chunks, and rich Italian tomato herb sauce.',
    },
    categoryId: 'pasta',
    price: 99,
    compareAtPrice: 120,
    image: '/images/nachos.jpg',
    isAvailable: true,
    isBestseller: false,
    isFeatured: false,
    prepTime: '১৫ মিনিট',
    sortOrder: 5,
    portionVariants: [
      { id: 'v_pasta_mixed', name: { bn: 'চিকেন হট মিক্সড পাস্তা', en: 'Hot Mixed Pasta' }, price: 80 },
      { id: 'v_pasta_cheese', name: { bn: 'চিকেন চিজ পাস্তা (বেকিং)', en: 'Chicken Cheese Pasta' }, price: 99, isDefault: true },
    ],
  },
  {
    id: 'chicken-fry-crispy',
    name: { bn: 'চিকেন ফ্রাই ও ললিপপ', en: 'Crispy Chicken Fry & Lollipop' },
    description: {
      bn: 'বাইরে মুচমুচে খাস্তা, ভেতরে রসালো গরম গরম ফ্রাইড চিকেন। সাথে পুদিনা চাটনি ও চিলি সস।',
      en: 'Crispy golden batter crust with juicy tender chicken inside. Served with dipping sauce.',
    },
    categoryId: 'chicken_fries',
    price: 70,
    image: '/images/burger.jpg',
    isAvailable: true,
    sortOrder: 6,
    portionVariants: [
      { id: 'v_chicken_lolly', name: { bn: 'চিকেন ললিপপ (১ পিস)', en: 'Chicken Lollipop (1 pc)' }, price: 30 },
      { id: 'v_french_fries', name: { bn: 'ফ্রেঞ্চ ফ্রাইস বাটি', en: 'French Fries' }, price: 50 },
      { id: 'v_chicken_fry', name: { bn: 'ক্রিস্পি চিকেন ফ্রাই (১ পিস)', en: 'Crispy Chicken Fry' }, price: 70, isDefault: true },
    ],
  },
  {
    id: 'drinks-beverages',
    name: { bn: 'স্পেশাল কোল্ড কফি ও লাচ্ছি', en: 'Special Cold Coffee & Lassi' },
    description: {
      bn: 'ঠান্ডা ফ্রস্টেড ব্লেন্ডেড কোল্ড কফি এবং আসল মিষ্টি দইয়ের রিফ্রেশিং বরফ লাচ্ছি।',
      en: 'Rich frosted blended iced coffee and refreshing traditional sweet yogurt lassi.',
    },
    categoryId: 'drinks',
    price: 80,
    image: '/images/doi_chira.jpg',
    isAvailable: true,
    sortOrder: 7,
    portionVariants: [
      { id: 'v_lassi_normal', name: { bn: 'মিষ্টি লাচ্ছি', en: 'Sweet Lassi' }, price: 50 },
      { id: 'v_mojito', name: { bn: 'লেমন মিন্ট মোহিতো', en: 'Lemon Mint Mojito' }, price: 80 },
      { id: 'v_cold_coffee', name: { bn: 'কোল্ড কফি', en: 'Cold Coffee' }, price: 80, isDefault: true },
      { id: 'v_special_cold_coffee', name: { bn: 'স্পেশাল কোল্ড কফি (আইসক্রিম টপ)', en: 'Special Cold Coffee w/ Ice Cream' }, price: 150 },
    ],
  },
];

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

export const defaultSeedOrders: Order[] = [
  {
    id: 'BS-261010-9281',
    trackingToken: 'tr_seed_9281',
    customerName: 'Rahim Islam',
    customerPhone: '01712345678',
    orderMode: 'delivery',
    address: 'মেয়র মার্কেট রোড, বাড়ি #১২, ফ্ল্যাট ৩বি',
    area: 'বেনাপোল পৌরসভা',
    instructions: 'দয়া করে বেশি ঝাল ছাড়া বানাবেন।',
    items: [
      {
        foodId: 'doi-chira-signature',
        name: { bn: 'বেনাপোল স্পেশাল দই চিড়া', en: 'Benapole Special Doi Chira' },
        image: '/images/doi_chira.jpg',
        variantId: 'v_full',
        variantName: { bn: 'স্পেশাল ফুল বাটি', en: 'Special Full' },
        selectedAddOns: [
          { id: 'add_badam', name: { bn: 'এক্সট্রা কাজু ও পেস্তা বাদাম', en: 'Extra Nuts' }, price: 20 },
        ],
        unitPrice: 100,
        quantity: 2,
        totalPrice: 200,
      },
      {
        foodId: 'burger-crispy-chicken',
        name: { bn: 'চিকেন ক্রিস্পি চিজ বার্গার', en: 'Chicken Crispy Cheese Burger' },
        image: '/images/burger.jpg',
        variantId: 'v_burger_cheese',
        variantName: { bn: 'চিকেন চিজ বার্গার', en: 'Chicken Cheese Burger' },
        unitPrice: 80,
        quantity: 1,
        totalPrice: 80,
      },
    ],
    subtotal: 280,
    deliveryFee: 40,
    discount: 0,
    total: 320,
    paymentMethod: 'cod',
    paymentStatus: 'unpaid',
    status: 'preparing',
    statusHistory: [
      { status: 'received', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString() },
      { status: 'preparing', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'BS-261010-8419',
    trackingToken: 'tr_seed_8419',
    customerName: 'Nusrat Jahan',
    customerPhone: '01798765432',
    orderMode: 'pickup',
    pickupTime: 'আজ দুপুর ১:৩০',
    items: [
      {
        foodId: 'nachos-chicken-supreme',
        name: { bn: 'চিকেন চিজি নাচোস', en: 'Chicken Cheesy Nachos' },
        image: '/images/nachos.jpg',
        variantId: 'v_nachos_full',
        variantName: { bn: 'ফুল প্লেট', en: 'Full Plate' },
        unitPrice: 120,
        quantity: 2,
        totalPrice: 240,
      },
      {
        foodId: 'drinks-beverages',
        name: { bn: 'স্পেশাল কোল্ড কফি ও লাচ্ছি', en: 'Special Cold Coffee & Lassi' },
        image: '/images/doi_chira.jpg',
        variantId: 'v_cold_coffee',
        variantName: { bn: 'কোল্ড কফি', en: 'Cold Coffee' },
        unitPrice: 80,
        quantity: 2,
        totalPrice: 160,
      },
    ],
    subtotal: 400,
    deliveryFee: 0,
    discount: 50,
    couponCode: 'BURGER50',
    total: 350,
    paymentMethod: 'bkash',
    paymentStatus: 'pending_verification',
    transactionId: 'BK9X27KL91',
    status: 'confirmed',
    statusHistory: [
      { status: 'received', timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString() },
      { status: 'confirmed', timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString() },
    ],
    createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
];

export const defaultReviews: CustomerReview[] = [
  {
    id: 'rev_1',
    name: 'তানভীর আহমেদ',
    location: 'বেনাপোল পৌরসভা',
    foodName: 'বেনাপোল স্পেশাল দই চিড়া',
    rating: 5,
    comment: 'দই চিড়াটা সত্যিই অসাধারণ! দইয়ের গাঢ় মিষ্টি আর বাদাম-বেদানার রাজকীয় কম্বিনেশন বেনাপোলে এর চেয়ে সেরা আর কোথাও পাইনি। অর্ডার করার ২০ মিনিটের মধ্যে পেয়েছি।',
    date: 'গতকাল',
    isVerified: true,
  },
  {
    id: 'rev_2',
    name: 'রাশেদুল ইসলাম',
    location: 'কাস্টমস মোড় এলাকা',
    foodName: 'ক্রিস্পি চিকেন নাচোস প্ল্যাটটার',
    rating: 5,
    comment: 'অফিসে লাঞ্চের জন্য অর্ডার করেছিলাম। একদম গরম গরম ক্রাঞ্চি নাচোস আর চিজি সস। প্যাকেজিং খুব প্রিমিয়াম ছিল। নিয়মিত অর্ডার করব ইনশাআল্লাহ।',
    date: '২ দিন আগে',
    isVerified: true,
  },
  {
    id: 'rev_3',
    name: 'সায়মা রহমান',
    location: 'শার্শা বাজার রোড',
    foodName: 'চিকেন চাউমিন ও কোল্ড কফি',
    rating: 5,
    comment: 'খাবারের স্বাদ আর মান দুটোই দারুণ। সব চেয়ে ভালো লেগেছে মোবাইল থেকে কোনো রেজিস্ট্রেশন ছাড়াই সরাসরি অর্ডার দেওয়া যায় এবং লাইভ ট্র্যাক করা যায়।',
    date: '৩ দিন আগে',
    isVerified: true,
  },
  {
    id: 'rev_4',
    name: 'মোঃ আল-আমিন',
    location: 'বেনাপোল রেলওয়ে স্টেশন',
    foodName: 'ডাবল চিজ বিফ/চিকেন বার্গার',
    rating: 5,
    comment: 'বার্গারের প্যাটিটা খুবই জুসি এবং ফ্রেশ বান। রাইডারের ব্যবহারও চমৎকার। বেনাপোল স্পেশাল সত্যিই বেনাপোলের সেরা ফাস্টফুড!',
    date: '৪ দিন আগে',
    isVerified: true,
  },
  {
    id: 'rev_5',
    name: 'ফারহানা ইয়াসমিন',
    location: 'মেয়র মার্কেট এলাকা',
    foodName: 'বেনাপোল স্পেশাল দই চিড়া',
    rating: 5,
    comment: 'পরিবারের সবার জন্যই দই চিড়া অর্ডার করেছিলাম, সবাই খুব প্রশংসা করেছে। ১০০% স্বাস্থ্যকর এবং অথেনটিক টেস্ট।',
    date: '৫ দিন আগে',
    isVerified: true,
  },
];

