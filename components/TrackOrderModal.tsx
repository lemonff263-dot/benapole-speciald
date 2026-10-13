'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  CheckCircle,
  Clock,
  Bike,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  Receipt,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  RotateCcw,
  ShoppingBag,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { useApp } from '@/context/AppContext';
import {
  getCustomerOrders,
  saveCustomerOrder,
  updateCustomerOrderStatus,
  SavedCustomerOrder,
} from '@/lib/customerOrders';

const statusSteps: Array<{ key: OrderStatus; labelBn: string; labelEn: string; icon: React.ReactNode }> = [
  {
    key: 'received',
    labelBn: 'অর্ডার গ্রহণ করা হয়েছে',
    labelEn: 'Order Received',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    key: 'confirmed',
    labelBn: 'নিশ্চিত করা হয়েছে',
    labelEn: 'Order Confirmed',
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    key: 'preparing',
    labelBn: 'খাবার প্রস্তুত করা হচ্ছে',
    labelEn: 'Kitchen Preparing',
    icon: <RefreshCw className="w-4 h-4" />,
  },
  {
    key: 'ready_or_out',
    labelBn: 'ডেলিভারির জন্য বের হয়েছে / প্রস্তুত',
    labelEn: 'Out for Delivery / Ready',
    icon: <Bike className="w-4 h-4" />,
  },
  {
    key: 'completed',
    labelBn: 'ডেলিভারি সম্পন্ন হয়েছে',
    labelEn: 'Delivered / Completed',
    icon: <PackageCheck className="w-4 h-4" />,
  },
];

function getStatusBadge(status: OrderStatus, lang: 'bn' | 'en') {
  switch (status) {
    case 'received':
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-300',
        text: lang === 'bn' ? '⏱️ অর্ডার গৃহীত' : '⏱️ Received',
      };
    case 'confirmed':
      return {
        bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        text: lang === 'bn' ? '✓ নিশ্চিত হয়েছে' : '✓ Confirmed',
      };
    case 'preparing':
      return {
        bg: 'bg-orange-100 text-orange-950 border-orange-300 animate-pulse',
        text: lang === 'bn' ? '🍳 রান্না হচ্ছে' : '🍳 Cooking',
      };
    case 'ready_or_out':
      return {
        bg: 'bg-teal-100 text-teal-950 border-teal-300',
        text: lang === 'bn' ? '🛵 ডেলিভারিতে বের হয়েছে' : '🛵 On the Way',
      };
    case 'completed':
      return {
        bg: 'bg-green-100 text-green-950 border-green-300',
        text: lang === 'bn' ? '✅ ডেলিভারি সম্পন্ন' : '✅ Delivered',
      };
    case 'cancelled':
      return {
        bg: 'bg-red-100 text-red-900 border-red-300',
        text: lang === 'bn' ? '❌ অর্ডার বাতিল' : '❌ Cancelled',
      };
    default:
      return {
        bg: 'bg-stone-100 text-stone-700 border-stone-300',
        text: status,
      };
  }
}

function TrackOrderContent({
  onClose,
  initialOrderId,
  initialToken,
}: {
  onClose: () => void;
  initialOrderId?: string | null;
  initialToken?: string | null;
}) {
  const { lang, t, settings, addToCart, setIsCartOpen, foods } = useApp();

  const [savedOrders, setSavedOrders] = useState<SavedCustomerOrder[]>([]);
  const [activeTab, setActiveTab] = useState<'my_orders' | 'search'>(
    initialOrderId ? 'my_orders' : 'search'
  );

  const [orderId, setOrderId] = useState(initialOrderId || '');
  const [phone, setPhone] = useState('');
  const [token, setToken] = useState(initialToken || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const list = getCustomerOrders();
      setSavedOrders(list);
      if (!initialOrderId && list.length > 0) {
        setActiveTab('my_orders');
      }
    };
    const timer = setTimeout(handleUpdate, 0);
    window.addEventListener('benapole_orders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('benapole_orders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [initialOrderId]);

  const fetchTracking = async (searchId: string, searchToken?: string, searchPhone?: string) => {
    if (!searchId.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.set('orderId', searchId.trim());
      if (searchToken) params.set('token', searchToken);
      if (searchPhone) params.set('phone', searchPhone.trim());

      const res = await fetch(`/api/orders?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'অর্ডার তথ্য পাওয়া যায়নি');
        setOrder(null);
      } else {
        setOrder(data.order);
        setOrderId(data.order.id);
        if (data.order.trackingToken) setToken(data.order.trackingToken);
        // Save or update in customer orders
        saveCustomerOrder(data.order);
        setSavedOrders(getCustomerOrders());
      }
    } catch {
      setError('ট্র্যাকিং লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (initialOrderId) {
      const load = async () => {
        setIsLoading(true);
        setError('');
        try {
          const params = new URLSearchParams();
          params.set('orderId', initialOrderId.trim());
          if (initialToken) params.set('token', initialToken);

          const res = await fetch(`/api/orders?${params.toString()}`);
          const data = await res.json();
          if (!isMounted) return;

          if (!res.ok) {
            setError(data.error || 'অর্ডার তথ্য পাওয়া যায়নি');
            setOrder(null);
          } else {
            setOrder(data.order);
            saveCustomerOrder(data.order);
            setSavedOrders(getCustomerOrders());
          }
        } catch {
          if (isMounted) setError('ট্র্যাকিং লোড করতে সমস্যা হয়েছে');
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      load();
    }
    return () => {
      isMounted = false;
    };
  }, [initialOrderId, initialToken]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderId, token || undefined, phone || undefined);
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleReorder = (orderToReorder: Order | SavedCustomerOrder) => {
    // If we have full Order object
    if ('items' in orderToReorder && Array.isArray(orderToReorder.items)) {
      orderToReorder.items.forEach((item) => {
        const food = foods.find((f) => f.id === item.foodId);
        if (food) {
          addToCart({
            id: `${item.foodId}_${item.variantId || 'def'}`,
            foodId: item.foodId,
            name: food.name,
            image: food.image,
            variantId: item.variantId,
            variantName: item.variantName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            selectedAddOns: item.selectedAddOns || [],
          });
        }
      });
      onClose();
      setIsCartOpen(true);
    } else {
      // Re-fetch full order to reorder
      fetchTracking(orderToReorder.id, orderToReorder.trackingToken);
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'received':
        return 0;
      case 'confirmed':
        return 1;
      case 'preparing':
        return 2;
      case 'ready_or_out':
        return 3;
      case 'completed':
        return 4;
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div
      className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 border border-stone-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center shadow-xs">
            <Receipt className="w-5 h-5 text-[#F4D05F]" />
          </div>
          <div>
            <h2 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
              {lang === 'bn' ? 'আমার অর্ডার ও লাইভ ট্র্যাকিং' : 'My Orders & Live Tracking'}
            </h2>
            <p className="text-xs text-stone-600 font-medium">
              {lang === 'bn' ? 'অর্ডারের রিয়েলটাইম অবস্থা ও হিস্ট্রি দেখুন' : 'View order progress and past orders'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* VIEW 1: DETAILED ORDER TRACKING TIMELINE */}
        {order ? (
          <div className="space-y-4 animate-in fade-in">
            {/* Back Button to List */}
            <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
              <button
                onClick={() => setOrder(null)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-[#0B5D3B] hover:text-[#08482E] transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'bn' ? '← আমার সকল অর্ডার দেখুন' : '← Back to All Orders'}</span>
              </button>
              <button
                onClick={() => fetchTracking(order.id, token || order.trackingToken, phone)}
                disabled={isLoading}
                className="p-1.5 text-stone-600 hover:text-[#0B5D3B] rounded-lg transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                title="রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">রিফ্রেশ</span>
              </button>
            </div>

            {/* Order Card Header */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50/70 p-4 rounded-2xl border-2 border-emerald-200 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] text-stone-600 font-bold uppercase tracking-wider block">
                    {lang === 'bn' ? 'অর্ডার নম্বর:' : 'Order ID:'}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-stone-900 text-base sm:text-lg">
                      {order.id}
                    </span>
                    <button
                      onClick={() => handleCopy(order.id)}
                      className="p-1 hover:bg-white rounded-md text-stone-500 cursor-pointer"
                      title="কপি করুন"
                    >
                      {copiedId === order.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  {(() => {
                    const badge = getStatusBadge(order.status, lang);
                    return (
                      <span className={`px-3 py-1 rounded-full text-xs font-black border shadow-2xs ${badge.bg}`}>
                        {badge.text}
                      </span>
                    );
                  })()}
                  <span className="text-[11px] text-stone-500 mt-1 font-semibold">
                    {new Date(order.createdAt).toLocaleDateString('bn-BD', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-1 border-t border-emerald-200/70 text-xs text-stone-700">
                <span>
                  <strong>গ্রাহক:</strong> {order.customerName} ({order.customerPhone})
                </span>
                <span className="font-black text-[#0B5D3B] text-sm">
                  সর্বমোট: ৳{order.total}
                </span>
              </div>
            </div>

            {/* Status Timeline */}
            {order.status === 'cancelled' ? (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-center space-y-1">
                <span className="text-red-700 font-black text-sm block">
                  ❌ {lang === 'bn' ? 'অর্ডারটি বাতিল করা হয়েছে' : 'Order has been cancelled'}
                </span>
                <span className="text-xs text-stone-600">
                  {lang === 'bn' ? 'কোনো তথ্যের জন্য আমাদের হটলাইনে কল করুন।' : 'Please call hotline for details.'}
                </span>
              </div>
            ) : (
              <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200">
                <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#F7931E]" />
                  <span>{lang === 'bn' ? 'অর্ডার প্রগ্রেস টাইমলাইন (লাইভ)' : 'Live Progress Timeline'}</span>
                </h3>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {statusSteps.map((step, idx) => {
                    const isPassed = currentStep >= idx;
                    const isCurrent = currentStep === idx;

                    return (
                      <div key={step.key} className="relative flex items-start gap-3">
                        <div
                          className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ring-4 ring-white shadow-2xs ${
                            isPassed
                              ? 'bg-[#0B5D3B] text-white font-bold'
                              : 'bg-stone-200 text-stone-500'
                          }`}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-xs sm:text-sm leading-tight ${
                              isCurrent
                                ? 'text-[#0B5D3B] font-black'
                                : isPassed
                                ? 'text-stone-900 font-bold'
                                : 'text-stone-400 font-medium'
                            }`}
                          >
                            {lang === 'bn' ? step.labelBn : step.labelEn}
                          </p>
                          {isCurrent && (
                            <span className="inline-block mt-0.5 text-[10px] font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                              {lang === 'bn' ? '● বর্তমানে এই পর্যায়ে রয়েছে' : '● Current Stage'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items Recap */}
            <div className="space-y-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <span className="text-xs font-black text-stone-800 block">
                {lang === 'bn' ? 'অর্ডারের খাবারের তালিকা:' : 'Items in this order:'}
              </span>
              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs sm:text-sm py-1 border-b border-stone-200/60 last:border-0">
                    <span className="font-semibold text-stone-800">
                      {t(item.name)} <strong className="text-[#0B5D3B]">× {item.quantity}</strong>
                    </span>
                    <span className="font-black text-stone-900">৳{item.totalPrice}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-xs font-bold text-stone-700">
                <span>পেমেন্ট: {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : order.paymentMethod}</span>
                <span className="text-sm font-black text-[#0B5D3B]">মোট: ৳{order.total}</span>
              </div>
            </div>

            {/* Address & Google Maps Location */}
            {order.orderMode === 'delivery' && (
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                <span className="font-bold text-stone-700 block">{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
                <p className="font-semibold text-stone-900 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>
                    {order.area ? `${order.area}` : ''}
                    {order.landmark ? ` (${order.landmark})` : ''}
                    {order.address ? ` — ${order.address}` : ''}
                  </span>
                </p>
              </div>
            )}

            {order.orderMode === 'pickup' && (
              <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs space-y-1.5">
                <span className="font-bold text-emerald-950 block">{lang === 'bn' ? 'পিকআপ লোকেশন (রেস্টুরেন্ট):' : 'Pickup Location:'}</span>
                <p className="font-bold text-stone-900">
                  বেনাপোল নিত্য হাট (মেয়র মার্কেট), ঢাকা বিরিয়ানি হাউজ সংলগ্ন
                </p>
                <div className="flex items-center gap-2">
                  <span className="bg-white border border-emerald-300 font-mono font-bold text-emerald-900 text-[11px] px-2 py-0.5 rounded-md">
                    2WW3+FG7 Benapole
                  </span>
                  <a
                    href="https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0B5D3B] font-bold underline inline-flex items-center gap-1"
                  >
                    <span>গুগল ম্যাপে ডিরেকশন</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-1">
              <a
                href={`tel:${settings.phone}`}
                className="flex-1 bg-stone-100 hover:bg-stone-200 active:scale-98 text-stone-800 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-[#0B5D3B]" />
                <span>{lang === 'bn' ? 'হটলাইনে কল করুন' : 'Call Restaurant'}</span>
              </a>
              <button
                onClick={() => handleReorder(order)}
                className="flex-1 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#F4D05F]" />
                <span>{lang === 'bn' ? 'পুনরায় অর্ডার করুন' : 'Reorder Items'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 2: TABS (MY ORDERS LIST vs SEARCH BY ORDER ID) */
          <div className="space-y-4">
            {/* View Mode Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setActiveTab('my_orders')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'my_orders'
                    ? 'bg-white text-[#0B5D3B] shadow-sm font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{lang === 'bn' ? 'আমার অর্ডারসমূহ' : 'My Orders'}</span>
                {savedOrders.length > 0 && (
                  <span className="bg-[#0B5D3B] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {savedOrders.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'search'
                    ? 'bg-white text-[#0B5D3B] shadow-sm font-black'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>{lang === 'bn' ? 'অন্য অর্ডার খুঁজুন' : 'Find Order'}</span>
              </button>
            </div>

            {/* TAB 1: SAVED ORDERS LIST */}
            {activeTab === 'my_orders' && (
              <div className="space-y-3">
                {savedOrders.length === 0 ? (
                  <div className="p-8 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 space-y-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0B5D3B] flex items-center justify-center mx-auto">
                      <ShoppingBag className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-stone-800">
                        {lang === 'bn' ? 'এখনো কোনো অর্ডার করেননি' : 'No orders found yet'}
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                        {lang === 'bn'
                          ? 'বেনাপোল স্পেশাল দই চিড়া বা অন্যান্য খাবার অর্ডার করলে এখানে আপনার সকল অর্ডার দেখতে পাবেন।'
                          : 'Orders placed on this device will automatically appear here.'}
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          onClose();
                          const el = document.getElementById('menu-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-[#0B5D3B] hover:bg-[#08482E] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        {lang === 'bn' ? 'মেনু খাবার দেখুন' : 'Browse Menu'}
                      </button>
                      <button
                        onClick={() => setActiveTab('search')}
                        className="text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                      >
                        {lang === 'bn' ? 'অর্ডার নম্বর দিয়ে খুঁজুন' : 'Search by ID'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-stone-500 px-1 font-semibold">
                      <span>মোট {savedOrders.length}টি সংরক্ষিত অর্ডার:</span>
                      <span>১-ক্লিকে স্ট্যাটাস দেখুন</span>
                    </div>

                    {savedOrders.map((saved) => {
                      const badge = getStatusBadge(saved.status, lang);
                      return (
                        <div
                          key={saved.id}
                          className="bg-white p-4 rounded-2xl border-2 border-stone-200 hover:border-[#0B5D3B] shadow-2xs transition-all space-y-2.5 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-stone-900 text-sm sm:text-base">
                                {saved.id}
                              </span>
                              <button
                                onClick={() => handleCopy(saved.id)}
                                className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                                title="কপি করুন"
                              >
                                {copiedId === saved.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border ${badge.bg}`}>
                              {badge.text}
                            </span>
                          </div>

                          <div className="text-xs text-stone-600 space-y-0.5">
                            <p className="font-medium text-stone-800 line-clamp-1">
                              🍽️ {saved.itemsSummary}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                              <span>
                                {saved.orderMode === 'delivery' ? '🛵 হোম ডেলিভারি' : '🛍️ পিকআপ'} •{' '}
                                {new Date(saved.createdAt).toLocaleDateString('bn-BD', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              <span className="font-black text-[#0B5D3B] text-xs sm:text-sm">
                                ৳{saved.total}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
                            <button
                              onClick={() => fetchTracking(saved.id, saved.trackingToken)}
                              disabled={isLoading}
                              className="flex-1 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                            >
                              <Clock className="w-3.5 h-3.5 text-[#F4D05F]" />
                              <span>{lang === 'bn' ? 'লাইভ স্ট্যাটাস দেখুন' : 'Track Status'}</span>
                            </button>
                            <button
                              onClick={() => handleReorder(saved)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="পুনরায় এই খাবার অর্ডার করুন"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">পুনরায় অর্ডার</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SEARCH BY ORDER ID FORM */}
            {activeTab === 'search' && (
              <form onSubmit={handleManualSearch} className="space-y-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">
                    {lang === 'bn' ? 'অর্ডার নম্বর বা ফোন নম্বর দিয়ে ট্র্যাকিং' : 'Search by Order Reference'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {lang === 'bn'
                      ? 'অর্ডার নিশ্চিত করার সময় পাওয়া অর্ডার আইডি (যেমন BS-261011-XXXX) লিখুন'
                      : 'Enter order ID received during checkout'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {lang === 'bn' ? 'অর্ডার নম্বর (Order ID) *' : 'Order ID *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      placeholder="BS-XXXXXX-XXXX"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 uppercase font-mono font-bold bg-white focus:border-[#0B5D3B] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-700 block mb-1">
                      {lang === 'bn' ? 'মোবাইল নম্বর (নিরাপত্তা যাচাই)' : 'Phone Number'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full text-xs p-2.5 rounded-xl border border-stone-200 bg-white focus:border-[#0B5D3B] outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'খোঁজা হচ্ছে...' : lang === 'bn' ? 'স্ট্যাটাস দেখুন' : 'Check Status'}</span>
                </button>
              </form>
            )}

            {/* Error Message Feedback */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TrackOrderModal({
  isOpen,
  onClose,
  initialOrderId,
  initialToken,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string | null;
  initialToken?: string | null;
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 pb-20 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <TrackOrderContent
        key={`${initialOrderId || 'manual'}-${initialToken || 'none'}`}
        onClose={onClose}
        initialOrderId={initialOrderId}
        initialToken={initialToken}
      />
    </div>
  );
}
