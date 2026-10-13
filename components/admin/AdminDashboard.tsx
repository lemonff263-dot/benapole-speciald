'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Settings,
  Palette,
  Send,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ExternalLink,
  Phone,
  Bike,
  Utensils,
  Tag,
  Store,
  MapPin,
  Compass,
  Navigation,
  RotateCcw,
  HelpCircle,
  CheckCheck,
  Building,
} from 'lucide-react';
import { Order, FoodItem, Category, Offer, RestaurantSettings, DeliveryArea } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import { defaultSettings, defaultWeeklySchedule } from '@/lib/constants';
import { ImageDropzone } from '../ImageDropzone';
import { checkRestaurantOpenStatus, formatTime12h } from '@/lib/openingHours';

const getAdminHeaders = () => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('bs_admin_token') || 'bs_admin_session_valid_2026'
      : 'bs_admin_session_valid_2026';
  return {
    'Content-Type': 'application/json',
    'x-admin-token': token,
    Authorization: `Bearer ${token}`,
  };
};

export function AdminDashboard({
  onOpenCustomizer,
  onClose,
  onLogout,
}: {
  onOpenCustomizer: () => void;
  onClose?: () => void;
  onLogout: () => void;
}) {
  const { lang, t, refreshMenuData } = useApp();

  const [activeTab, setActiveTab] = useState<
    'orders' | 'foods' | 'categories' | 'offers' | 'locations' | 'telegram' | 'settings'
  >('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrOutOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todaySales: 0,
    totalSales: 0,
  });
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Foods state
  const [foodsList, setFoodsList] = useState<FoodItem[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [offersList, setOffersList] = useState<Offer[]>([]);
  const [settingsState, setSettingsState] = useState<RestaurantSettings>(defaultSettings);
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryArea[]>(defaultSettings.deliveryAreas);

  // Edit/Add food modal states
  const [isEditingFood, setIsEditingFood] = useState<FoodItem | null>(null);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [foodFormData, setFoodFormData] = useState<any>({});

  // Category Add/Edit modal states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<any>({ name: { bn: '', en: '' }, icon: 'Utensils' });

  // Offer Add/Edit modal states
  const [isAddingOffer, setIsAddingOffer] = useState(false);
  const [isEditingOffer, setIsEditingOffer] = useState<Offer | null>(null);
  const [offerFormData, setOfferFormData] = useState<any>({});

  // Location Add/Edit modal states
  const [isAddingLocation, setIsAddingLocation] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState<DeliveryArea | null>(null);
  const [locationFormData, setLocationFormData] = useState<any>({});

  // Universal Delete Confirmation state (no browser alert/confirm)
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'food' | 'category' | 'offer' | 'location' | 'order';
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Telegram test status
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<{
    loading: boolean;
    message?: string;
    error?: string;
  }>({
    loading: false,
  });
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);

  const [feedbackToast, setFeedbackToast] = useState('');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(''), 3000);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(
        `/api/admin/orders?status=${orderStatusFilter}&search=${encodeURIComponent(orderSearchQuery)}`,
        { headers: getAdminHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/menu', { headers: getAdminHeaders() });
      if (res.ok) {
        const data = await res.json();
        setFoodsList(data.foods || []);
        setCategoriesList(data.categories || []);
      }

      const offRes = await fetch('/api/admin/offers', { headers: getAdminHeaders() });
      if (offRes.ok) {
        const data = await offRes.json();
        setOffersList(data.offers || []);
      }

      const setRes = await fetch('/api/admin/settings', { headers: getAdminHeaders() });
      if (setRes.ok) {
        const data = await setRes.json();
        if (data.settings) {
          setSettingsState({
            ...defaultSettings,
            ...data.settings,
            telegramConfig: {
              ...defaultSettings.telegramConfig,
              ...(data.settings.telegramConfig || {}),
            },
            deliveryAreas: data.settings.deliveryAreas || defaultSettings.deliveryAreas,
          });
          if (data.settings.deliveryAreas) {
            setDeliveryLocations(data.settings.deliveryAreas);
          }
        }
      }

      const locRes = await fetch('/api/admin/locations', { headers: getAdminHeaders() });
      if (locRes.ok) {
        const locData = await locRes.json();
        if (locData.locations) {
          setDeliveryLocations(locData.locations);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      try {
        const res = await fetch(
          `/api/admin/orders?status=${orderStatusFilter}&search=${encodeURIComponent(orderSearchQuery)}`,
          { headers: getAdminHeaders() }
        );
        if (isMounted && res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
          if (data.stats) setStats(data.stats);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [orderStatusFilter, orderSearchQuery]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        const res = await fetch('/api/admin/menu', { headers: getAdminHeaders() });
        if (isMounted && res.ok) {
          const data = await res.json();
          setFoodsList(data.foods || []);
          setCategoriesList(data.categories || []);
        }

        const offRes = await fetch('/api/admin/offers', { headers: getAdminHeaders() });
        if (isMounted && offRes.ok) {
          const data = await offRes.json();
          setOffersList(data.offers || []);
        }

        const setRes = await fetch('/api/admin/settings', { headers: getAdminHeaders() });
        if (isMounted && setRes.ok) {
          const data = await setRes.json();
          if (data.settings) {
            setSettingsState({
              ...defaultSettings,
              ...data.settings,
              telegramConfig: {
                ...defaultSettings.telegramConfig,
                ...(data.settings.telegramConfig || {}),
              },
              deliveryAreas: data.settings.deliveryAreas || defaultSettings.deliveryAreas,
            });
            if (data.settings.deliveryAreas) {
              setDeliveryLocations(data.settings.deliveryAreas);
            }
          }
        }

        const locRes = await fetch('/api/admin/locations', { headers: getAdminHeaders() });
        if (isMounted && locRes.ok) {
          const locData = await locRes.json();
          if (locData.locations) {
            setDeliveryLocations(locData.locations);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: getAdminHeaders(),
        body: JSON.stringify({ orderId, newStatus, paymentStatus }),
      });
      if (res.ok) {
        showToast(lang === 'bn' ? 'অর্ডার স্ট্যাটাস আপডেট হয়েছে' : 'Order updated');
        fetchOrders();
        if (selectedOrderForView && selectedOrderForView.id === orderId) {
          const updated = await res.json();
          setSelectedOrderForView(updated.order);
        }
      }
    } catch {
      showToast('আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleToggleFoodStock = async (food: FoodItem) => {
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'food',
          data: { id: food.id, isAvailable: !food.isAvailable },
        }),
      });
      if (res.ok) {
        showToast(`"${food.name.bn}" স্টক স্ট্যাটাস পরিবর্তিত হয়েছে`);
        fetchAdminData();
        refreshMenuData();
      }
    } catch {
      showToast('স্টক পরিবর্তন ব্যর্থ হয়েছে');
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const { type, id, name } = deleteConfirmTarget;
      if (type === 'food') {
        const res = await fetch(`/api/admin/menu?type=food&id=${id}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        });
        if (res.ok) {
          showToast(`খাবার "${name}" মুছে ফেলা হয়েছে`);
          setIsEditingFood(null);
          setIsAddingFood(false);
          fetchAdminData();
          refreshMenuData();
        } else {
          showToast('খাবার মুছতে ব্যর্থ হয়েছে');
        }
      } else if (type === 'category') {
        const res = await fetch(`/api/admin/menu?type=category&id=${id}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        });
        if (res.ok) {
          showToast(`ক্যাটাগরি "${name}" মুছে ফেলা হয়েছে`);
          setIsEditingCategory(null);
          setIsAddingCategory(false);
          fetchAdminData();
          refreshMenuData();
        } else {
          showToast('ক্যাটাগরি মুছতে ব্যর্থ হয়েছে');
        }
      } else if (type === 'offer') {
        const res = await fetch(`/api/admin/offers?id=${id}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        });
        if (res.ok) {
          showToast(`কুপন "${name}" মুছে ফেলা হয়েছে`);
          setIsEditingOffer(null);
          setIsAddingOffer(false);
          fetchAdminData();
          refreshMenuData();
        } else {
          showToast('কুপন মুছতে ব্যর্থ হয়েছে');
        }
      } else if (type === 'location') {
        if (id === '__RESET_DEFAULT__') {
          const res = await fetch('/api/admin/locations', {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify({ resetToDefault: true }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.locations) {
              setDeliveryLocations(data.locations);
              setSettingsState((prev) => ({ ...prev, deliveryAreas: data.locations }));
            }
            showToast('ডিফল্ট লোকেশন তালিকা পুনরুদ্ধার করা হয়েছে');
            refreshMenuData();
          } else {
            showToast('রিসেট করতে ব্যর্থ হয়েছে');
          }
        } else {
          const res = await fetch(`/api/admin/locations?id=${id}`, {
            method: 'DELETE',
            headers: getAdminHeaders(),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.locations) {
              setDeliveryLocations(data.locations);
              setSettingsState((prev) => ({ ...prev, deliveryAreas: data.locations }));
            }
            showToast(`লোকেশন "${name}" মুছে ফেলা হয়েছে`);
            setIsEditingLocation(null);
            setIsAddingLocation(false);
            refreshMenuData();
          } else {
            showToast('লোকেশন মুছতে ব্যর্থ হয়েছে');
          }
        }
      } else if (type === 'order') {
        const res = await fetch(`/api/admin/orders?id=${id}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
        });
        if (res.ok) {
          showToast(`অর্ডার "${name}" মুছে ফেলা হয়েছে`);
          setSelectedOrderForView(null);
          fetchOrders();
        } else {
          showToast('অর্ডার মুছতে ব্যর্থ হয়েছে');
        }
      }
    } catch {
      showToast('মুছে ফেলার সময় সার্ভার এরর');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  const handleDeleteFood = (foodId: string, foodName?: string) => {
    setDeleteConfirmTarget({
      type: 'food',
      id: foodId,
      name: foodName || 'খাবার পদ',
    });
  };

  const handleDeleteCategory = (catId: string, catName?: string) => {
    setDeleteConfirmTarget({
      type: 'category',
      id: catId,
      name: catName || 'ক্যাটাগরি',
    });
  };

  const handleDeleteOffer = (offId: string, offCode?: string) => {
    setDeleteConfirmTarget({
      type: 'offer',
      id: offId,
      name: offCode || 'কুপন',
    });
  };

  const handleDeleteLocation = (id: string, nameBn?: string) => {
    setDeleteConfirmTarget({
      type: 'location',
      id,
      name: nameBn || 'লোকেশন',
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    setDeleteConfirmTarget({
      type: 'order',
      id: orderId,
      name: `অর্ডার #${orderId.slice(-6)}`,
    });
  };


  const handleSaveFoodForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = isEditingFood ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/menu', {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'food',
          data: foodFormData,
        }),
      });
      if (res.ok) {
        showToast(isEditingFood ? 'খাবার আপডেট হয়েছে' : 'নতুন খাবার যোগ করা হয়েছে');
        setIsEditingFood(null);
        setIsAddingFood(false);
        fetchAdminData();
        refreshMenuData();
      }
    } catch {
      showToast('সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  const handleToggleOrderAcceptance = async () => {
    const newStatus = settingsState.isOrderAccepting === false;
    try {
      const res = await fetch('/api/admin/orders/toggle', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ isAccepting: newStatus }),
      });
      if (res.ok) {
        setSettingsState((prev) => ({
          ...prev,
          isOrderAccepting: newStatus,
          isOpen: newStatus,
        }));
        showToast(
          newStatus
            ? 'অর্ডার গ্রহণ চালু করা হয়েছে! গ্রাহকরা এখন অর্ডার করতে পারবেন।'
            : 'অর্ডার গ্রহণ সাময়িক বন্ধ করা হয়েছে!'
        );
        refreshMenuData();
      } else {
        showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  // Category Handlers
  const handleOpenAddCategory = () => {
    setCategoryFormData({
      id: 'cat_' + Date.now().toString(36),
      name: { bn: '', en: '' },
      icon: 'Utensils',
      sortOrder: categoriesList.length + 1,
      isActive: true,
    });
    setIsAddingCategory(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setCategoryFormData({
      id: cat.id,
      name: { bn: cat.name.bn, en: cat.name.en || '' },
      icon: cat.icon || 'Utensils',
      sortOrder: cat.sortOrder || 1,
      isActive: cat.isActive !== false,
    });
    setIsEditingCategory(cat);
  };

  const handleSaveCategoryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name?.bn) {
      showToast('ক্যাটাগরির বাংলা নাম আবশ্যক');
      return;
    }
    try {
      const method = isEditingCategory ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/menu', {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify({
          type: 'category',
          data: categoryFormData,
        }),
      });
      if (res.ok) {
        showToast(isEditingCategory ? 'ক্যাটাগরি আপডেট হয়েছে' : 'নতুন ক্যাটাগরি তৈরি হয়েছে');
        setIsEditingCategory(null);
        setIsAddingCategory(false);
        fetchAdminData();
        refreshMenuData();
      } else {
        showToast('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };


  // Offer / Coupon Handlers
  const handleOpenAddOffer = () => {
    setOfferFormData({
      code: 'SPECIAL' + Math.floor(10 + Math.random() * 90),
      title: { bn: 'বিশেষ মূল্যছাড়', en: 'Special Discount' },
      description: { bn: 'সকল খাবারে প্রযোজ্য', en: 'Valid on all items' },
      discountType: 'percentage',
      discountValue: 10,
      minOrder: 150,
      maxDiscount: 100,
      validTill: '2026-12-31',
      isActive: true,
    });
    setIsAddingOffer(true);
  };

  const handleOpenEditOffer = (off: Offer) => {
    setOfferFormData({
      id: off.id,
      code: off.code,
      title: { bn: off.title.bn, en: off.title.en || '' },
      description: { bn: off.description.bn, en: off.description.en || '' },
      discountType: off.discountType || 'percentage',
      discountValue: off.discountValue || 10,
      minOrder: off.minOrder || 100,
      maxDiscount: off.maxDiscount,
      validTill: off.validTill || '2026-12-31',
      isActive: off.isActive !== false,
    });
    setIsEditingOffer(off);
  };

  const handleSaveOfferForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerFormData.code) {
      showToast('কুপন কোড আবশ্যক');
      return;
    }
    try {
      const method = isEditingOffer ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/offers', {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(offerFormData),
      });
      if (res.ok) {
        showToast(isEditingOffer ? 'কুপন আপডেট হয়েছে' : 'নতুন কুপন যুক্ত হয়েছে');
        setIsEditingOffer(null);
        setIsAddingOffer(false);
        fetchAdminData();
        refreshMenuData();
      } else {
        showToast('সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleToggleOfferActive = async (off: Offer) => {
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ id: off.id, isActive: !off.isActive }),
      });
      if (res.ok) {
        showToast(`কুপন "${off.code}" ${!off.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করা হয়েছে`);
        fetchAdminData();
        refreshMenuData();
      }
    } catch {
      showToast('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
    }
  };


  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsState) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(settingsState),
      });

      if (res.ok) {
        showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে');
        refreshMenuData();
      }
    } catch {
      showToast('সংরক্ষণ ব্যর্থ হয়েছে');
    }
  };

  const handleToggleDayOpen = async (dayKey: string) => {
    const currentList = settingsState.weeklySchedule && settingsState.weeklySchedule.length > 0
      ? settingsState.weeklySchedule
      : defaultWeeklySchedule;
    
    const updated = currentList.map((d) => {
      if (d.day === dayKey) {
        return { ...d, isOpen: !d.isOpen };
      }
      return d;
    });

    const newSettings = { ...settingsState, weeklySchedule: updated };
    setSettingsState(newSettings);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        const targetDay = updated.find((d) => d.day === dayKey);
        showToast(`${targetDay?.dayNameBn} ${targetDay?.isOpen ? 'সফলভাবে খোলা (ON) করা হয়েছে' : 'সফলভাবে বন্ধ (OFF) করা হয়েছে'}`);
        refreshMenuData();
      }
    } catch {
      showToast('আপডেট ব্যর্থ হয়েছে');
    }
  };

  const handleDayTimeChange = async (dayKey: string, field: 'openTime' | 'closeTime', val: string) => {
    const currentList = settingsState.weeklySchedule && settingsState.weeklySchedule.length > 0
      ? settingsState.weeklySchedule
      : defaultWeeklySchedule;
    
    const updated = currentList.map((d) => {
      if (d.day === dayKey) {
        return { ...d, [field]: val };
      }
      return d;
    });

    const newSettings = { ...settingsState, weeklySchedule: updated };
    setSettingsState(newSettings);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(newSettings),
      });
      if (res.ok) {
        refreshMenuData();
      }
    } catch {
      // non-blocking
    }
  };

  // Dedicated Save Telegram Configuration
  const handleSaveTelegramConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingTelegram(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          telegramConfig: settingsState.telegramConfig,
        }),
      });

      if (res.ok) {
        showToast('টেলিগ্রাম বট কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
        refreshMenuData();
      } else {
        showToast('টেলিগ্রাম সেটিংস সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সংরক্ষণ ব্যর্থ হয়েছে');
    } finally {
      setIsSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    const token = settingsState?.telegramConfig?.botToken;
    const chat = settingsState?.telegramConfig?.chatId;
    if (!token || !chat) {
      setTelegramTestStatus({
        loading: false,
        error: 'অনুগ্রহ করে প্রথমে বট টোকেন এবং চ্যাট আইডি প্রদান করুন।',
      });
      return;
    }

    setTelegramTestStatus({ loading: true, message: undefined, error: undefined });

    try {
      const res = await fetch('/api/admin/telegram/test', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          botToken: token,
          chatId: chat,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTelegramTestStatus({
          loading: false,
          message: 'টেলিগ্রামে টেস্ট নোটিফিকেশন সফলভাবে পৌঁছেছে! আপনার গ্রুপ বা চ্যানেল চেক করুন।',
        });
      } else {
        setTelegramTestStatus({
          loading: false,
          error: data.error || 'টেলিগ্রাম সংযোগ ব্যর্থ হয়েছে। টোকেন ও চ্যাট আইডি যাচাই করুন।',
        });
      }
    } catch {
      setTelegramTestStatus({ loading: false, error: 'নেটওয়ার্ক এরর। আবার চেষ্টা করুন।' });
    }
  };

  // Delivery Locations Handlers
  const handleOpenAddLocation = () => {
    setLocationFormData({
      id: 'area_' + Date.now().toString(36),
      name: { bn: '', en: '' },
      fee: settingsState.deliveryFee || 40,
      landmark: '',
      isPopular: false,
      coordinates: { lat: 23.0441, lng: 88.8983 },
    });
    setIsAddingLocation(true);
  };

  const handleOpenEditLocation = (loc: DeliveryArea) => {
    setLocationFormData({
      id: loc.id,
      name: { bn: loc.name.bn, en: loc.name.en || loc.name.bn },
      fee: loc.fee !== undefined ? loc.fee : settingsState.deliveryFee,
      landmark: loc.landmark || '',
      isPopular: Boolean(loc.isPopular),
      coordinates: loc.coordinates || { lat: 23.0441, lng: 88.8983 },
    });
    setIsEditingLocation(loc);
  };

  const handleSaveLocationForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationFormData.name?.bn) {
      showToast('এলাকার নাম আবশ্যক');
      return;
    }

    try {
      const method = isEditingLocation ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/locations', {
        method,
        headers: getAdminHeaders(),
        body: JSON.stringify(locationFormData),
      });

      if (res.ok) {
        const data = await res.json();
        setDeliveryLocations(data.locations);
        setSettingsState((prev) => ({ ...prev, deliveryAreas: data.locations }));
        showToast(isEditingLocation ? 'লোকেশন আপডেট হয়েছে' : 'নতুন লোকেশন যোগ করা হয়েছে');
        setIsEditingLocation(null);
        setIsAddingLocation(false);
        refreshMenuData();
      } else {
        showToast('লোকেশন সংরক্ষণ ব্যর্থ হয়েছে');
      }
    } catch {
      showToast('সার্ভার এরর');
    }
  };

  const handleResetLocations = () => {
    setDeleteConfirmTarget({
      type: 'location',
      id: '__RESET_DEFAULT__',
      name: 'সকল ডেলিভারি এলাকা ডিফল্ট অবস্থায় রিসেট',
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/70 pb-20 text-stone-900 font-sans">
      {/* Toast Notification */}
      {feedbackToast && (
        <div className="fixed top-4 right-4 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
          {feedbackToast}
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center font-black text-lg shadow-xs">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base text-stone-900 leading-tight">
                  {lang === 'bn' ? 'বেনাপোল স্পেশাল এডমিন প্যানেল' : 'Benapole Special Admin'}
                </h1>
                <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-[11px] text-stone-500">
                {lang === 'bn' ? 'অর্ডার, খাবার, লোকেশন ও টেলিগ্রাম বট' : 'Restaurant Management Console'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Master Order Acceptance Toggle */}
            <button
              onClick={handleToggleOrderAcceptance}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
                settingsState.isOrderAccepting !== false
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
              title="ক্লিক করে অর্ডার গ্রহণ চালু বা বন্ধ করুন"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  settingsState.isOrderAccepting !== false ? 'bg-emerald-200 animate-ping' : 'bg-red-200'
                }`}
              />
              <span>
                {settingsState.isOrderAccepting !== false ? 'অর্ডার: চালু (ON)' : 'অর্ডার: বন্ধ (OFF)'}
              </span>
            </button>

            {/* Visual Customizer Launch Button */}
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 bg-[#F7931E] hover:bg-[#E58210] active:scale-95 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Palette className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ওয়েবসাইট কাস্টমাইজ' : 'Customize Website'}</span>
            </button>

            {/* Back to Website (Without destroying login session) */}
            {onClose && (
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-[#0B5D3B] font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                title={lang === 'bn' ? 'ওয়েবসাইটে ফিরে যান (লগইন সংরক্ষিত থাকবে)' : 'Back to Store (Login saved)'}
              >
                <Store className="w-4 h-4 text-[#0B5D3B]" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'ওয়েবসাইটে ফিরে যান' : 'Back to Store'}</span>
                <span className="sm:hidden">{lang === 'bn' ? 'ওয়েবসাইট' : 'Store'}</span>
              </button>
            )}

            {/* Logout */}
            <button
              onClick={() => {
                if (confirm(lang === 'bn' ? 'আপনি কি নিশ্চিত যে এডমিন থেকে লগআউট করতে চান?' : 'Are you sure you want to log out?')) {
                  onLogout();
                }
              }}
              className="p-2 text-stone-500 hover:text-red-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-500 block uppercase">
              {lang === 'bn' ? 'মোট অর্ডার' : 'Total Orders'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-stone-900">{stats.totalOrders}</span>
              <ShoppingBag className="w-4 h-4 text-[#0B5D3B]" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-500 block uppercase">
              {lang === 'bn' ? 'পেন্ডিং অর্ডার' : 'Pending Orders'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-600">{stats.pendingOrders}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-500 block uppercase">
              {lang === 'bn' ? 'প্রস্তুত / ডেলিভারিতে' : 'In Progress'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-blue-600">
                {stats.preparingOrders + stats.readyOrOutOrders}
              </span>
              <Bike className="w-4 h-4 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
            <span className="text-[11px] font-bold text-stone-500 block uppercase">
              {lang === 'bn' ? 'সম্পন্ন হয়েছে' : 'Completed'}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#0B5D3B]">{stats.completedOrders}</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-stone-500 block uppercase">
              {lang === 'bn' ? 'আজকের বিক্রয়' : "Today's Sales"}
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-[#0B5D3B]">৳{stats.todaySales}</span>
              <TrendingUp className="w-4 h-4 text-[#F7931E]" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-stone-200 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'orders'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {lang === 'bn' ? 'অর্ডার তালিকা' : 'Orders'} ({orders.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('foods')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'foods'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>
              {lang === 'bn' ? 'খাবার ও মেনু' : 'Menu'} ({foodsList.length})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'categories'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ক্যাটাগরি' : 'Categories'}</span>
          </button>

          <button
            onClick={() => setActiveTab('offers')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'offers'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অফার ও কুপন' : 'Offers'}</span>
          </button>

          {/* Dedicated Tab for Delivery Locations & Landmarks */}
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'locations'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <MapPin className="w-4 h-4 text-[#F7931E]" />
            <span>
              {lang === 'bn' ? 'ডেলিভারি লোকেশন ও ল্যান্ডমার্ক' : 'Locations'} ({deliveryLocations.length})
            </span>
          </button>

          {/* Dedicated Tab for Telegram Bot Notification */}
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors relative ${
              activeTab === 'telegram'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>{lang === 'bn' ? 'টেলিগ্রাম নোটিফিকেশন' : 'Telegram Bot'}</span>
            {settingsState?.telegramConfig?.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{lang === 'bn' ? 'সাধারণ সেটিংস' : 'Settings'}</span>
          </button>
        </div>

        {/* TAB 1: ORDERS LIST */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            {/* Search and Filters Bar */}
            <div className="p-4 border-b border-stone-200 flex flex-wrap gap-3 items-center justify-between bg-stone-50/50">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={
                    lang === 'bn'
                      ? 'অর্ডার আইডি, গ্রাহকের নাম বা মোবাইল দিয়ে খুঁজুন...'
                      : 'Search by order ID, name, phone...'
                  }
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:border-[#0B5D3B] outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-500" />
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="all">সকল অর্ডার (All)</option>
                  <option value="received">নতুন প্রাপ্ত (Received)</option>
                  <option value="confirmed">নিশ্চিত (Confirmed)</option>
                  <option value="preparing">রান্না হচ্ছে (Preparing)</option>
                  <option value="ready_or_out">প্রস্তুত / ডেলিভারিতে (Ready/Out)</option>
                  <option value="completed">সম্পন্ন (Completed)</option>
                  <option value="cancelled">বাতিল (Cancelled)</option>
                </select>

                <button
                  onClick={fetchOrders}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-xl"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3.5">অর্ডার আইডি</th>
                    <th className="p-3.5">গ্রাহক ও মোবাইল</th>
                    <th className="p-3.5">ডেলিভারি লোকেশন</th>
                    <th className="p-3.5">খাবারের পরিমাণ</th>
                    <th className="p-3.5">মোট মূল্য</th>
                    <th className="p-3.5">পেমেন্ট</th>
                    <th className="p-3.5">স্ট্যাটাস</th>
                    <th className="p-3.5 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-400">
                        কোনো অর্ডার পাওয়া যায়নি
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-[#0B5D3B]">{ord.id}</td>
                        <td className="p-3.5">
                          <div className="font-extrabold text-stone-900">{ord.customerName}</div>
                          <div className="text-[11px] text-stone-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            <span>{ord.customerPhone}</span>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-block mb-1 ${
                              ord.orderMode === 'delivery'
                                ? 'bg-emerald-50 text-[#0B5D3B]'
                                : 'bg-blue-50 text-blue-700'
                            }`}
                          >
                            {ord.orderMode === 'delivery' ? '🛵 হোম ডেলিভারি' : '🛍️ পিকআপ'}
                          </span>
                          <div className="text-[11px] text-stone-600 line-clamp-1">
                            {ord.address ? `${ord.address} (${ord.area || 'বেনাপোল'})` : 'পিকআপ কাউন্টার'}
                          </div>
                          {ord.landmark && (
                            <div className="text-[10px] text-amber-700 font-medium">
                              কাছে: {ord.landmark}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold">{ord.items.length} টি পদ</span>
                          <span className="text-[11px] text-stone-500 block">
                            (মোট {ord.items.reduce((s, i) => s + i.quantity, 0)} পিস)
                          </span>
                        </td>
                        <td className="p-3.5 font-extrabold text-stone-900 text-sm">৳{ord.total}</td>
                        <td className="p-3.5">
                          <div className="font-bold uppercase text-[11px]">{ord.paymentMethod}</div>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              ord.paymentStatus === 'verified'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.paymentStatus === 'pending_verification'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {ord.paymentStatus === 'verified'
                              ? 'পরিশোধিত'
                              : ord.paymentStatus === 'pending_verification'
                              ? 'যাচাই বাকি'
                              : 'অপরিশোধিত'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="text-[11px] font-bold p-1.5 rounded-lg border border-stone-200 bg-white"
                          >
                            <option value="received">নতুন প্রাপ্ত (Received)</option>
                            <option value="confirmed">নিশ্চিত (Confirmed)</option>
                            <option value="preparing">রান্না হচ্ছে (Preparing)</option>
                            <option value="ready_or_out">প্রস্তুত / ডেলিভারিতে (Ready/Out)</option>
                            <option value="completed">সম্পন্ন হয়েছে (Completed)</option>
                            <option value="cancelled">বাতিল (Cancelled)</option>
                          </select>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedOrderForView(ord)}
                              className="p-1.5 hover:bg-stone-200 rounded-lg text-stone-600 transition-colors"
                              title="বিস্তারিত দেখুন"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              title="অর্ডার মুছে ফেলুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FOODS & MENU */}
        {activeTab === 'foods' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200">
              <div>
                <h3 className="font-extrabold text-sm text-stone-900">খাবার ও মেনু আইটেম</h3>
                <p className="text-xs text-stone-500">মেনুর পদ যোগ, স্টক অন/অফ এবং দাম পরিবর্তন করুন</p>
              </div>
              <button
                onClick={() => {
                  setFoodFormData({
                    id: 'food_' + Date.now().toString(36),
                    name: { bn: '', en: '' },
                    description: { bn: '', en: '' },
                    price: 100,
                    categoryId: categoriesList[0]?.id || 'doi_chira',
                    image: '/images/doi_chira.jpg',
                    isAvailable: true,
                  });
                  setIsAddingFood(true);
                }}
                className="flex items-center gap-1.5 bg-[#0B5D3B] text-white text-xs font-bold px-3.5 py-2 rounded-xl hover:bg-[#08482E]"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন খাবার যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {foodsList.map((food) => (
                <div
                  key={food.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 flex gap-3 items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={food.image || '/images/doi_chira.jpg'}
                      alt={food.name.bn}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-stone-900">{food.name.bn}</h4>
                      <span className="text-[11px] text-stone-500 block">{food.name.en}</span>
                      <span className="text-xs font-extrabold text-[#0B5D3B]">৳{food.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleFoodStock(food)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        food.isAvailable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {food.isAvailable ? 'স্টক আছে' : 'স্টক শেষ'}
                    </button>
                    <button
                      onClick={() => {
                        setFoodFormData(food);
                        setIsEditingFood(food);
                      }}
                      className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFood(food.id, food.name.bn)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                      title="খাবারটি মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#0B5D3B]" />
                  <span>{lang === 'bn' ? 'মেনু ক্যাটাগরি তালিকা' : 'Food Categories'} ({categoriesList.length})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'bn' ? 'নতুন ক্যাটাগরি তৈরি, নাম পরিবর্তন ও পরিচালনা করুন' : 'Manage menu categories and groupings'}
                </p>
              </div>
              <button
                onClick={handleOpenAddCategory}
                className="flex items-center gap-1.5 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন ক্যাটাগরি যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categoriesList.map((cat) => {
                const count = foodsList.filter((f) => f.categoryId === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col justify-between space-y-3 hover:border-emerald-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
                          {cat.id}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {count} টি খাবার
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-stone-900">{cat.name.bn}</h4>
                      <div className="text-xs text-stone-500 font-medium">{cat.name.en}</div>
                    </div>

                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-bold flex items-center gap-1"
                        title="সম্পাদনা"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name.bn)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: OFFERS & COUPONS */}
        {activeTab === 'offers' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#0B5D3B]" />
                  <span>{lang === 'bn' ? 'অফার ও কুপন কোড ব্যবস্থাপনা' : 'Offers & Coupons'} ({offersList.length})</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'bn' ? 'কাস্টমারদের জন্য ডিসকাউন্ট কুপন তৈরি, সক্রিয়/নিষ্ক্রিয় ও নিয়ন্ত্রণ করুন' : 'Manage promotional coupons and discount rules'}
                </p>
              </div>
              <button
                onClick={handleOpenAddOffer}
                className="flex items-center gap-1.5 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন কুপন যোগ করুন</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offersList.map((off) => (
                <div
                  key={off.id}
                  className={`bg-white p-5 rounded-2xl border shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                    off.isActive !== false ? 'border-emerald-200 hover:border-emerald-400' : 'border-stone-200 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-[#0B5D3B] bg-emerald-100/80 px-2.5 py-1 rounded-lg tracking-wider border border-emerald-300">
                        {off.code}
                      </span>
                      <button
                        onClick={() => handleToggleOfferActive(off)}
                        className={`text-[10px] font-black px-2.5 py-1 rounded-full cursor-pointer transition-colors ${
                          off.isActive !== false
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                      >
                        {off.isActive !== false ? 'সক্রিয় (Active)' : 'বন্ধ (Inactive)'}
                      </button>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900">{off.title.bn}</h4>
                      <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">{off.description.bn}</p>
                    </div>

                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>ছাড়ের পরিমাণ:</span>
                        <span className="text-[#0B5D3B] font-extrabold">
                          {off.discountType === 'percentage' ? `${off.discountValue}% মূল্যছাড়` : `৳${off.discountValue} ছাড়`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>সর্বনিম্ন অর্ডার:</span>
                        <span>৳{off.minOrder}</span>
                      </div>
                      {off.maxDiscount && (
                        <div className="flex justify-between">
                          <span>সর্বোচ্চ ছাড়:</span>
                          <span>৳{off.maxDiscount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-stone-400 text-[10px] pt-1 border-t border-stone-200">
                        <span>মেয়াদ:</span>
                        <span>{off.validTill || 'স্থায়ী'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleOpenEditOffer(off)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>এডিট</span>
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(off.id, off.code)}
                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>মুছুন</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DELIVERY LOCATIONS & LANDMARKS (NEW DEDICATED MANAGER) */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            {/* Header with Add & Reset Actions */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div>
                <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#0B5D3B]" />
                  <span>{lang === 'bn' ? 'ডেলিভারি এলাকা ও ল্যান্ডমার্ক ব্যবস্থাপনা' : 'Delivery Locations & Landmarks'}</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  {lang === 'bn'
                    ? 'গ্রাহকরা যেসমস্ত এলাকায় ডেলিভারি নিতে পারবে সেগুলো যোগ, সম্পাদনা বা চার্জ পরিবর্তন করুন'
                    : 'Customize available delivery zones, delivery fees, and landmark tags for customer checkout'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetLocations}
                  className="flex items-center gap-1.5 px-3 py-2 border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-bold text-stone-700 transition-colors"
                  title="ডিফল্ট লোকেশন ফিরিয়ে আনুন"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>ডিফল্ট রিসেট</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddLocation}
                  className="flex items-center gap-1.5 bg-[#0B5D3B] hover:bg-[#08482E] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন লোকেশন যোগ করুন</span>
                </button>
              </div>
            </div>

            {/* Locations Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {deliveryLocations.map((loc) => (
                <div
                  key={loc.id}
                  className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 relative group hover:border-[#0B5D3B]/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-stone-900">{loc.name.bn}</h4>
                        {loc.isPopular && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                            জনপ্রিয়
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block">{loc.name.en}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-[#0B5D3B] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 block">
                        ৳{loc.fee !== undefined ? loc.fee : settingsState.deliveryFee} চার্জ
                      </span>
                    </div>
                  </div>

                  {loc.landmark && (
                    <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-700 flex items-start gap-1.5">
                      <Building className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold block uppercase">পরিচিত ল্যান্ডমার্ক:</span>
                        <span className="line-clamp-2">{loc.landmark}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                    <div className="text-stone-400 font-mono text-[10px]">
                      {loc.coordinates ? `${loc.coordinates.lat}, ${loc.coordinates.lng}` : 'Benapole'}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditLocation(loc)}
                        className="px-2.5 py-1 text-xs font-bold text-stone-700 hover:text-black hover:bg-stone-100 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>এডিট</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLocation(loc.id, loc.name.bn)}
                        className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>মুছুন</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: TELEGRAM BOT NOTIFICATION (DEDICATED FULL TAB) */}
        {activeTab === 'telegram' && (
          <div className="space-y-6">
            {/* Real-time Order Acceptance Switch Card */}
            <div className="bg-white p-6 rounded-3xl border-2 border-emerald-500/30 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                    টেলিগ্রাম ও ওয়েবসাইট লাইভ কন্ট্রোল
                  </span>
                  <h4 className="font-black text-base text-stone-900 mt-1">
                    অর্ডার গ্রহণ চালু বা বন্ধ করুন (Order Taking Status)
                  </h4>
                  <p className="text-xs text-stone-500">
                    এখান থেকে অথবা টেলিগ্রামের মাধ্যমে সরাসরি রেস্টুরেন্টের অর্ডার গ্রহণ চালু বা বন্ধ করতে পারেন
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 ${
                      settingsState.isOrderAccepting !== false
                        ? 'bg-emerald-100 text-[#0B5D3B]'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        settingsState.isOrderAccepting !== false
                          ? 'bg-emerald-600 animate-pulse'
                          : 'bg-red-600'
                      }`}
                    />
                    <span>
                      {settingsState.isOrderAccepting !== false ? 'অর্ডার গ্রহণ চালু' : 'অর্ডার গ্রহণ বন্ধ'}
                    </span>
                  </span>

                  <button
                    type="button"
                    onClick={handleToggleOrderAcceptance}
                    className={`px-4 py-2 rounded-xl text-xs font-black text-white shadow-xs transition-all active:scale-95 ${
                      settingsState.isOrderAccepting !== false
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {settingsState.isOrderAccepting !== false
                      ? 'অর্ডার বন্ধ করুন (Turn OFF)'
                      : 'অর্ডার চালু করুন (Turn ON)'}
                  </button>
                </div>
              </div>

              {/* Telegram Bot Commands Help Box */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  <Send className="w-3.5 h-3.5 text-blue-600" />
                  <span>টেলিগ্রাম গ্রুপের মাধ্যমে যেভাবে অর্ডার অন/অফ করবেন:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <strong className="text-emerald-700">/order_on</strong>
                    <div className="font-sans text-[10px] text-stone-600 mt-0.5">গ্রুপে এটি লিখলে ওয়েবসাইটে অর্ডার চালু হবে</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <strong className="text-red-700">/order_off</strong>
                    <div className="font-sans text-[10px] text-stone-600 mt-0.5">গ্রুপে এটি লিখলে ওয়েবসাইটে অর্ডার বন্ধ হবে</div>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-blue-100">
                    <strong className="text-blue-700">/status</strong>
                    <div className="font-sans text-[10px] text-stone-600 mt-0.5">আজকের বিক্রয় ও স্ট্যাটাস রিপোর্ট দেখুন</div>
                  </div>
                </div>
                <div className="text-[11px] text-stone-600 pt-1 flex items-center justify-between flex-wrap gap-2">
                  <span>
                    বট ওয়েবহুক পাথ: <code className="bg-white px-2 py-0.5 rounded border border-blue-200 text-stone-800 font-bold">/api/telegram/webhook</code>
                  </span>
                  <span className="text-[10px] text-stone-500">গ্রুপ অ্যাডমিন যে কেউ এই কমান্ড দিতে পারবেন</span>
                </div>
              </div>
            </div>

            {/* Telegram Overview Banner */}
            <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl shadow-md space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-xs rounded-2xl flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-white">
                      টেলিগ্রাম ইনস্ট্যান্ট নোটিফিকেশন সিস্টেম
                    </h3>
                    <p className="text-xs text-blue-100">
                      কোনো কাস্টমার অর্ডার করার সাথে সাথে আপনার টেলিগ্রাম গ্রুপ বা ফোনে নোটিফিকেশন ও রসিদ পৌঁছাবে।
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                      settingsState?.telegramConfig?.enabled
                        ? 'bg-emerald-400 text-emerald-950 font-black'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        settingsState?.telegramConfig?.enabled ? 'bg-emerald-900 animate-ping' : 'bg-stone-300'
                      }`}
                    />
                    <span>
                      {settingsState?.telegramConfig?.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Telegram Configuration Form Card */}
            <form
              onSubmit={handleSaveTelegramConfig}
              className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h4 className="font-extrabold text-base text-stone-900">
                    টেলিগ্রাম বট এপিআই ক্রেডেনশিয়াল
                  </h4>
                  <p className="text-xs text-stone-500">
                    BotFather থেকে প্রাপ্ত টোকেন এবং টার্গেট গ্রুপের চ্যাট আইডি বসান
                  </p>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200">
                  <input
                    type="checkbox"
                    checked={Boolean(settingsState?.telegramConfig?.enabled)}
                    onChange={(e) =>
                      setSettingsState({
                        ...settingsState,
                        telegramConfig: {
                          ...(settingsState.telegramConfig || defaultSettings.telegramConfig),
                          enabled: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-stone-800">নোটিফিকেশন সক্রিয় রাখুন</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    টেলিগ্রাম বট টোকেন (Telegram Bot Token) *
                  </label>
                  <div className="relative">
                    <input
                      type={showTelegramToken ? 'text' : 'password'}
                      value={settingsState?.telegramConfig?.botToken || ''}
                      onChange={(e) =>
                        setSettingsState({
                          ...settingsState,
                          telegramConfig: {
                            ...(settingsState.telegramConfig || defaultSettings.telegramConfig),
                            botToken: e.target.value.trim(),
                          },
                        })
                      }
                      placeholder="যেমন: 789123456:AAFl9h-xAbC..."
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono pr-10 focus:border-blue-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTelegramToken(!showTelegramToken)}
                      className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
                    >
                      {showTelegramToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    টেলিগ্রামে @BotFather এ গিয়ে /newbot কমান্ড দিয়ে টোকেন পাবেন।
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    টার্গেট চ্যাট আইডি / গ্রুপ আইডি (Chat ID) *
                  </label>
                  <input
                    type="text"
                    value={settingsState?.telegramConfig?.chatId || ''}
                    onChange={(e) =>
                      setSettingsState({
                        ...settingsState,
                        telegramConfig: {
                          ...(settingsState.telegramConfig || defaultSettings.telegramConfig),
                          chatId: e.target.value.trim(),
                        },
                      })
                    }
                    placeholder="যেমন: -100XXXXXXXXXX বা আপনার ইউজার আইডি"
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono focus:border-blue-500 outline-hidden"
                  />
                  <span className="text-[10px] text-stone-400 mt-1 block">
                    গ্রুপের চ্যাট আইডি সাধারণত -100 দিয়ে শুরু হয় (@userinfobot দিয়ে দেখতে পারেন)।
                  </span>
                </div>
              </div>

              {/* Notification Trigger Preferences */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <h5 className="font-bold text-xs text-stone-800">কখন নোটিফিকেশন পাঠানো হবে:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                    <input
                      type="checkbox"
                      checked={Boolean(settingsState?.telegramConfig?.notifyOnNewOrder)}
                      onChange={(e) =>
                        setSettingsState({
                          ...settingsState,
                          telegramConfig: {
                            ...(settingsState.telegramConfig || defaultSettings.telegramConfig),
                            notifyOnNewOrder: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>নতুন কোনো গ্রাহক অর্ডার প্লেস করলে বার্তা যাবে</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                    <input
                      type="checkbox"
                      checked={Boolean(settingsState?.telegramConfig?.notifyOnStatusChange)}
                      onChange={(e) =>
                        setSettingsState({
                          ...settingsState,
                          telegramConfig: {
                            ...(settingsState.telegramConfig || defaultSettings.telegramConfig),
                            notifyOnStatusChange: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>অর্ডারের স্ট্যাটাস পরিবর্তন হলে আপডেট বার্তা যাবে</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons: Test Message & Save */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={telegramTestStatus.loading}
                  className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {telegramTestStatus.loading ? 'মেসেজ পাঠানো হচ্ছে...' : '🧪 টেস্ট নোটিফিকেশন পাঠান'}
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={isSavingTelegram}
                  className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>{isSavingTelegram ? 'সংরক্ষণ হচ্ছে...' : 'টেলিগ্রাম সেটিংস সংরক্ষণ করুন'}</span>
                </button>
              </div>

              {/* Test Message Result Box */}
              {telegramTestStatus.message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{telegramTestStatus.message}</span>
                </div>
              )}
              {telegramTestStatus.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-bold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{telegramTestStatus.error}</span>
                </div>
              )}
            </form>

            {/* Telegram Setup Tutorial Guide Box */}
            <div className="bg-stone-50 border border-stone-200 p-6 rounded-3xl space-y-4">
              <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                <span>টেলিগ্রাম বট কীভাবে চালু করবেন? (সহজ গাইড)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-600 leading-relaxed">
                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    ১
                  </span>
                  <h5 className="font-bold text-stone-900">বট তৈরি করুন (@BotFather)</h5>
                  <p>
                    টেলিগ্রাম অ্যাপে <strong>@BotFather</strong> সার্চ করুন। <code>/newbot</code> লিখে পাঠান
                    এবং বটের নাম ও ইউজারনেম দিন।
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    ২
                  </span>
                  <h5 className="font-bold text-stone-900">টোকেন কপি করুন</h5>
                  <p>
                    BotFather আপনাকে একটি <strong>HTTP API Token</strong> দেবে। সেটি কপি করে উপরের বট টোকেন
                    ঘরে পেস্ট করুন।
                  </p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-1">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                    ৩
                  </span>
                  <h5 className="font-bold text-stone-900">গ্রুপে এড করে চ্যাট আইডি দিন</h5>
                  <p>
                    আপনার রেস্টুরেন্টের টেলিগ্রাম গ্রুপে বটটিকে অ্যাড করে এডমিন বানান। এরপর চ্যাট আইডি
                    পেস্ট করে টেস্ট পাঠান।
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: GENERAL SETTINGS */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveGeneralSettings} className="bg-white p-6 rounded-2xl border border-stone-200 space-y-6">
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                {lang === 'bn' ? 'রেস্টুরেন্ট সাধারণ সেটিংস' : 'General Restaurant Settings'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'bn' ? 'রেস্টুরেন্টের নাম, হটলাইন নম্বর ও বেস ডেলিভারি চার্জ' : 'Update basic info and delivery rates'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">রেস্টুরেন্টের নাম (বাংলা)</label>
                <input
                  type="text"
                  value={settingsState.restaurantName.bn}
                  onChange={(e) =>
                    setSettingsState({
                      ...settingsState,
                      restaurantName: { ...settingsState.restaurantName, bn: e.target.value },
                    })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">ফোন নম্বর (Hotline)</label>
                <input
                  type="text"
                  value={settingsState.phone}
                  onChange={(e) => setSettingsState({ ...settingsState, phone: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">ডিফল্ট বেস ডেলিভারি চার্জ (টাকা)</label>
                <input
                  type="number"
                  value={settingsState.deliveryFee}
                  onChange={(e) => setSettingsState({ ...settingsState, deliveryFee: Number(e.target.value) })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">ফ্রি ডেলিভারি থ্রেশহোল্ড (টাকা)</label>
                <input
                  type="number"
                  value={settingsState.freeDeliveryThreshold}
                  onChange={(e) =>
                    setSettingsState({ ...settingsState, freeDeliveryThreshold: Number(e.target.value) })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">সর্বনিম্ন অর্ডার মূল্য (টাকা)</label>
                <input
                  type="number"
                  value={settingsState.minOrderAmount}
                  onChange={(e) =>
                    setSettingsState({ ...settingsState, minOrderAmount: Number(e.target.value) })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">খোলার সময় (Opening Hours)</label>
                <input
                  type="text"
                  value={settingsState.openingHours.bn}
                  onChange={(e) =>
                    setSettingsState({
                      ...settingsState,
                      openingHours: { ...settingsState.openingHours, bn: e.target.value },
                    })
                  }
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">রেস্টুরেন্টের ঠিকানা (বাংলা)</label>
              <textarea
                rows={2}
                value={settingsState.address.bn}
                onChange={(e) =>
                  setSettingsState({
                    ...settingsState,
                    address: { ...settingsState.address, bn: e.target.value },
                  })
                }
                className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">গুগল ম্যাপ লিংক (Google Maps URL)</label>
                <input
                  type="text"
                  value={settingsState.mapUrl || ''}
                  onChange={(e) => setSettingsState({ ...settingsState, mapUrl: e.target.value })}
                  placeholder="https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac"
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">গুগল প্লাস কোড (Google Plus Code)</label>
                <input
                  type="text"
                  value={settingsState.plusCode || ''}
                  onChange={(e) => setSettingsState({ ...settingsState, plusCode: e.target.value })}
                  placeholder="2WW3+FG7 Benapole"
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-50 font-mono"
                />
              </div>
            </div>

            {/* WEEKLY OPERATING SCHEDULE & OPEN/CLOSED DAYS */}
            <div className="bg-stone-50/80 p-5 rounded-2xl border-2 border-stone-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#0B5D3B] text-white flex items-center justify-center">
                    <Clock className="w-4 h-4 text-[#F4D05F]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-stone-900 leading-tight">
                      সাপ্তাহিক সময়সূচি ও বন্ধের দিন (Weekly Schedule)
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium">
                      সপ্তাহের বার অনুযায়ী অন/অফ করুন ও খোলা-বন্ধের সময় নির্ধারণ করুন (অটো সেভ হয়)
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  সরাসরি কার্যকর (Auto-Updates)
                </span>
              </div>

              <div className="space-y-2.5">
                {(settingsState.weeklySchedule && settingsState.weeklySchedule.length > 0
                  ? settingsState.weeklySchedule
                  : defaultWeeklySchedule
                ).map((dayItem) => (
                  <div
                    key={dayItem.day}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      dayItem.isOpen
                        ? 'bg-white border-emerald-300 shadow-2xs'
                        : 'bg-stone-100/90 border-stone-200 opacity-80'
                    }`}
                  >
                    {/* Day Name and Toggle Switch */}
                    <div className="flex items-center justify-between sm:justify-start gap-3 min-w-[170px]">
                      <div>
                        <span className="font-black text-sm text-stone-900 block leading-tight">
                          {dayItem.dayNameBn}
                        </span>
                        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                          {dayItem.dayNameEn}
                        </span>
                      </div>

                      {/* ON/OFF Switch Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleDayOpen(dayItem.day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                          dayItem.isOpen
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            : 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            dayItem.isOpen ? 'bg-emerald-200 animate-pulse' : 'bg-red-200'
                          }`}
                        />
                        <span>{dayItem.isOpen ? 'খোলা (ON)' : 'বন্ধ (OFF)'}</span>
                      </button>
                    </div>

                    {/* Time Controls: ONLY SHOWN IF DAY IS OPEN (HIDES IF OFF AS REQUESTED) */}
                    {dayItem.isOpen ? (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-emerald-50/60 p-2 sm:px-3 rounded-xl border border-emerald-200">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-700 text-[11px]">শুরু:</span>
                          <input
                            type="time"
                            value={dayItem.openTime || '10:00'}
                            onChange={(e) => handleDayTimeChange(dayItem.day, 'openTime', e.target.value)}
                            className="bg-white px-2 py-1 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:border-[#0B5D3B] outline-hidden"
                          />
                        </div>

                        <span className="text-stone-400 font-black">থেকে</span>

                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-700 text-[11px]">শেষ:</span>
                          <input
                            type="time"
                            value={dayItem.closeTime || '23:00'}
                            onChange={(e) => handleDayTimeChange(dayItem.day, 'closeTime', e.target.value)}
                            className="bg-white px-2 py-1 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:border-[#0B5D3B] outline-hidden"
                          />
                        </div>

                        <span className="text-[11px] font-bold text-emerald-800 ml-auto bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          {formatTime12h(dayItem.openTime)} - {formatTime12h(dayItem.closeTime)}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span>এই বার পুরো দিন বন্ধ থাকবে (সাপ্তাহিক ছুটি)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#0B5D3B] hover:bg-[#08482E] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition-all"
            >
              সাধারণ সেটিংস সংরক্ষণ করুন
            </button>
          </form>
        )}
      </main>

      {/* Order Detail View Modal */}
      {selectedOrderForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-stone-900">
                  অর্ডার বিস্তারিত: {selectedOrderForView.id}
                </h3>
                <span className="text-xs text-stone-500">
                  {new Date(selectedOrderForView.createdAt).toLocaleString('bn-BD')}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-500"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2 text-stone-700">
              <p>
                <strong>গ্রাহকের নাম:</strong> {selectedOrderForView.customerName}
              </p>
              <p>
                <strong>মোবাইল:</strong> {selectedOrderForView.customerPhone}
              </p>
              <p>
                <strong>মোড:</strong>{' '}
                {selectedOrderForView.orderMode === 'delivery' ? '🛵 হোম ডেলিভারি' : '🛍️ পিকআপ'}
              </p>
              {selectedOrderForView.address && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <p>
                    <strong>ডেলিভারি ঠিকানা:</strong> {selectedOrderForView.address}
                  </p>
                  <p>
                    <strong>এলাকা:</strong> {selectedOrderForView.area || 'বেনাপোল'}
                  </p>
                  {selectedOrderForView.landmark && (
                    <p className="text-amber-800 font-bold">
                      🏛️ <strong>নিকটবর্তী ল্যান্ডমার্ক:</strong> {selectedOrderForView.landmark}
                    </p>
                  )}
                  {selectedOrderForView.mapCoordinates && (
                    <p className="text-[11px] text-stone-500">
                      📍 <strong>ম্যাপ পিন:</strong> {selectedOrderForView.mapCoordinates.lat},{' '}
                      {selectedOrderForView.mapCoordinates.lng}
                    </p>
                  )}
                  {selectedOrderForView.googleMapsUrl && (
                    <a
                      href={selectedOrderForView.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B5D3B] hover:underline flex items-center gap-1 font-bold text-xs pt-1"
                    >
                      <span>গুগল ম্যাপে লোকেশন দেখুন</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              )}
              {selectedOrderForView.instructions && (
                <p>
                  <strong>বিশেষ নোট:</strong> {selectedOrderForView.instructions}
                </p>
              )}
              <p>
                <strong>পেমেন্ট মাধ্যম:</strong> {selectedOrderForView.paymentMethod.toUpperCase()} (স্ট্যাটাস:{' '}
                {selectedOrderForView.paymentStatus})
              </p>
              {selectedOrderForView.transactionId && (
                <p>
                  <strong>TrxID:</strong>{' '}
                  <span className="font-mono bg-stone-100 px-1.5 py-0.5 rounded">
                    {selectedOrderForView.transactionId}
                  </span>
                </p>
              )}
            </div>

            <div className="border-t pt-3 space-y-2">
              <h4 className="font-bold text-xs text-stone-800">খাবারের তালিকা:</h4>
              {selectedOrderForView.items.map((it, idx) => (
                <div key={idx} className="flex justify-between text-xs py-1 border-b border-stone-100">
                  <span>
                    {it.name.bn} ({it.variantName?.bn || 'স্ট্যান্ডার্ড'}) × {it.quantity}
                  </span>
                  <span className="font-bold">৳{it.totalPrice}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-extrabold pt-2 text-[#0B5D3B]">
                <span>সর্বমোট:</span>
                <span>৳{selectedOrderForView.total}</span>
              </div>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrderForView.id)}
                className="px-3.5 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold flex items-center gap-1.5 text-xs transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>অর্ডার মুছে ফেলুন</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedOrderForView(null)}
                className="px-5 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Food Edit / Add Modal */}
      {(isAddingFood || isEditingFood) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-stone-900">
              {isEditingFood ? 'খাবার সম্পাদনা করুন' : 'নতুন খাবার যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveFoodForm} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">খাবারের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={foodFormData.name?.bn || ''}
                  onChange={(e) =>
                    setFoodFormData({
                      ...foodFormData,
                      name: { ...foodFormData.name, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">খাবারের নাম (English) *</label>
                <input
                  type="text"
                  required
                  value={foodFormData.name?.en || ''}
                  onChange={(e) =>
                    setFoodFormData({
                      ...foodFormData,
                      name: { ...foodFormData.name, en: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">মূল্য (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={foodFormData.price || 0}
                    onChange={(e) => setFoodFormData({ ...foodFormData, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">ক্যাটাগরি</label>
                  <select
                    value={foodFormData.categoryId || 'doi_chira'}
                    onChange={(e) => setFoodFormData({ ...foodFormData, categoryId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    {categoriesList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.bn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ImageDropzone
                value={foodFormData.image || ''}
                onChange={(img) => setFoodFormData({ ...foodFormData, image: img })}
                label="খাবারের ছবি আপলোড (গ্যালারি বা ড্রপ)"
                hint="ছবি টেনে এনে ছাড়ুন অথবা মোবাইলের গ্যালারি থেকে সিলেক্ট করুন"
              />

              <div>
                <label className="font-bold block mb-1">বিবরণ (বাংলা)</label>
                <textarea
                  rows={2}
                  value={foodFormData.description?.bn || ''}
                  onChange={(e) =>
                    setFoodFormData({
                      ...foodFormData,
                      description: { ...foodFormData.description, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-3 justify-end border-t">
                {isEditingFood && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFood(isEditingFood.id, isEditingFood.name?.bn || 'খাবার পদ')}
                    className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold flex items-center gap-1.5 transition-all mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingFood(false);
                    setIsEditingFood(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-stone-600 font-bold hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B5D3B] text-white rounded-xl font-bold shadow-xs hover:bg-[#08482E]"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delivery Location Add / Edit Modal */}
      {(isAddingLocation || isEditingLocation) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-base text-stone-900">
              {isEditingLocation ? 'ডেলিভারি লোকেশন সম্পাদনা' : 'নতুন ডেলিভারি লোকেশন যোগ করুন'}
            </h3>

            <form onSubmit={handleSaveLocationForm} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold block mb-1">এলাকা / লোকেশনের নাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বেনাপোল পৌরসভা / চেকপোস্ট মোড়"
                  value={locationFormData.name?.bn || ''}
                  onChange={(e) =>
                    setLocationFormData({
                      ...locationFormData,
                      name: { ...locationFormData.name, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#0B5D3B] outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">নাম (English)</label>
                <input
                  type="text"
                  placeholder="e.g. Benapole Municipality"
                  value={locationFormData.name?.en || ''}
                  onChange={(e) =>
                    setLocationFormData({
                      ...locationFormData,
                      name: { ...locationFormData.name, en: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#0B5D3B] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">ডেলিভারি ফি (টাকা) *</label>
                  <input
                    type="number"
                    required
                    value={locationFormData.fee !== undefined ? locationFormData.fee : 40}
                    onChange={(e) =>
                      setLocationFormData({ ...locationFormData, fee: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">জনপ্রিয় এলাকা?</label>
                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(locationFormData.isPopular)}
                      onChange={(e) =>
                        setLocationFormData({ ...locationFormData, isPopular: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#0B5D3B]"
                    />
                    <span className="text-xs font-bold text-stone-700">জনপ্রিয় ব্যাজ দিন</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">পরিচিত ল্যান্ডমার্কসমূহ</label>
                <input
                  type="text"
                  placeholder="যেমন: পৌরসভা চত্বর, প্রধান সড়ক, হোটেল গ্র্যান্ড..."
                  value={locationFormData.landmark || ''}
                  onChange={(e) => setLocationFormData({ ...locationFormData, landmark: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  কমা দিয়ে একাধিক ল্যান্ডমার্ক লিখতে পারেন।
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">ম্যাপ Latitude (অক্ষাংশ)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationFormData.coordinates?.lat || 23.0441}
                    onChange={(e) =>
                      setLocationFormData({
                        ...locationFormData,
                        coordinates: {
                          ...locationFormData.coordinates,
                          lat: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">ম্যাপ Longitude (দ্রাঘিমাংশ)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={locationFormData.coordinates?.lng || 88.8983}
                    onChange={(e) =>
                      setLocationFormData({
                        ...locationFormData,
                        coordinates: {
                          ...locationFormData.coordinates,
                          lng: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 justify-end border-t">
                {isEditingLocation && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(isEditingLocation.id, isEditingLocation.name?.bn || 'লোকেশন')}
                    className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold flex items-center gap-1.5 transition-all mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingLocation(false);
                    setIsEditingLocation(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-stone-600 font-bold hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B5D3B] text-white rounded-xl font-bold shadow-xs hover:bg-[#08482E]"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Add / Edit Modal */}
      {(isAddingCategory || isEditingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-[#0B5D3B]" />
                <span>{isEditingCategory ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCategory(false);
                  setIsEditingCategory(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategoryForm} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  ক্যাটাগরি আইডি (ID) *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(isEditingCategory)}
                  placeholder="যেমন: burger, biryani, dessert"
                  value={categoryFormData.id || ''}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      id: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 font-mono disabled:bg-stone-100 disabled:text-stone-500 focus:border-[#0B5D3B] outline-hidden"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  আইডি শুধুমাত্র ইংরেজি ছোট অক্ষরে লিখুন (যেমন: snacks)
                </span>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  ক্যাটাগরির নাম (বাংলা) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বার্গার ও স্ন্যাক্স"
                  value={categoryFormData.name?.bn || ''}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: { ...categoryFormData.name, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#0B5D3B] outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  ক্যাটাগরির নাম (English)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Burgers & Snacks"
                  value={categoryFormData.name?.en || ''}
                  onChange={(e) =>
                    setCategoryFormData({
                      ...categoryFormData,
                      name: { ...categoryFormData.name, en: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#0B5D3B] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">ক্রম নম্বর (Sort Order)</label>
                  <input
                    type="number"
                    value={categoryFormData.sortOrder || 1}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, sortOrder: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-800 block mb-1">আইকন নাম</label>
                  <input
                    type="text"
                    placeholder="Utensils"
                    value={categoryFormData.icon || 'Utensils'}
                    onChange={(e) =>
                      setCategoryFormData({ ...categoryFormData, icon: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 justify-end border-t">
                {isEditingCategory && (
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(isEditingCategory.id, isEditingCategory.name?.bn || 'ক্যাটাগরি')}
                    className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold flex items-center gap-1.5 transition-all mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setIsEditingCategory(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-stone-600 font-bold hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B5D3B] text-white rounded-xl font-bold shadow-xs hover:bg-[#08482E]"
                >
                  {isEditingCategory ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Offer / Coupon Add / Edit Modal */}
      {(isAddingOffer || isEditingOffer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#0B5D3B]" />
                <span>{isEditingOffer ? 'কুপন / অফার সম্পাদনা' : 'নতুন কুপন কোড তৈরি করুন'}</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddingOffer(false);
                  setIsEditingOffer(null);
                }}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOfferForm} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">কুপন কোড (Promo Code) *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: EAT50, SPECIAL10"
                    value={offerFormData.code || ''}
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        code: e.target.value.toUpperCase().replace(/\s+/g, ''),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono font-bold text-[#0B5D3B] focus:border-[#0B5D3B] outline-hidden uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">ডিসকাউন্ট ধরন</label>
                  <select
                    value={offerFormData.discountType || 'percentage'}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, discountType: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value="percentage">শতাংশ (%) ছাড়</option>
                    <option value="fixed">নির্দিষ্ট টাকা (৳) ছাড়</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">অফারের নাম / শিরোনাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: বিশেষ ১০% মূল্যছাড়"
                  value={offerFormData.title?.bn || ''}
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      title: { ...offerFormData.title, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:border-[#0B5D3B] outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-800 block mb-1">অফারের বিবরণ (বাংলা)</label>
                <input
                  type="text"
                  placeholder="যেমন: যেকোনো খাবারে ৩০০ টাকার উপরে অর্ডারে প্রযোজ্য"
                  value={offerFormData.description?.bn || ''}
                  onChange={(e) =>
                    setOfferFormData({
                      ...offerFormData,
                      description: { ...offerFormData.description, bn: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-stone-200"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">
                    ছাড়ের পরিমাণ {offerFormData.discountType === 'percentage' ? '(%)' : '(৳)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={offerFormData.discountValue || 10}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, discountValue: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">সর্বনিম্ন অর্ডার (৳)</label>
                  <input
                    type="number"
                    min={0}
                    value={offerFormData.minOrder || 100}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, minOrder: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">সর্বোচ্চ ছাড় (৳)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="সীমাহীন"
                    value={offerFormData.maxDiscount || ''}
                    onChange={(e) =>
                      setOfferFormData({
                        ...offerFormData,
                        maxDiscount: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-800 block mb-1">মেয়াদ শেষ হওয়ার তারিখ</label>
                  <input
                    type="date"
                    value={offerFormData.validTill || '2026-12-31'}
                    onChange={(e) =>
                      setOfferFormData({ ...offerFormData, validTill: e.target.value })
                    }
                    className="w-full p-2.5 rounded-xl border border-stone-200 font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-800 block mb-1">স্ট্যাটাস</label>
                  <label className="flex items-center gap-2 p-2.5 border rounded-xl cursor-pointer bg-stone-50">
                    <input
                      type="checkbox"
                      checked={offerFormData.isActive !== false}
                      onChange={(e) =>
                        setOfferFormData({ ...offerFormData, isActive: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#0B5D3B]"
                    />
                    <span className="text-xs font-bold text-stone-700">কুপন সক্রিয় রাখুন</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 justify-end border-t">
                {isEditingOffer && (
                  <button
                    type="button"
                    onClick={() => handleDeleteOffer(isEditingOffer.id, isEditingOffer.code)}
                    className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl font-bold flex items-center gap-1.5 transition-all mr-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>মুছে ফেলুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingOffer(false);
                    setIsEditingOffer(null);
                  }}
                  className="px-4 py-2 border rounded-xl text-stone-600 font-bold hover:bg-stone-50"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0B5D3B] text-white rounded-xl font-bold shadow-xs hover:bg-[#08482E]"
                >
                  {isEditingOffer ? 'আপডেট করুন' : 'কুপন যোগ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Universal In-App Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                মুছে ফেলতে চান?
              </h3>
              <p className="text-xs text-stone-600 mt-1">
                আপনি কি নিশ্চিত <strong>&ldquo;{deleteConfirmTarget.name}&rdquo;</strong> মুছে ফেলতে চান?
              </p>
            </div>
            <div className="flex gap-2 pt-2 justify-center">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConfirmTarget(null)}
                className="flex-1 py-2.5 px-4 border border-stone-200 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-50"
              >
                বাতিল
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={executeDelete}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 shadow-md flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <span>মুছে ফেলা হচ্ছে...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>হ্যাঁ, মুছুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
