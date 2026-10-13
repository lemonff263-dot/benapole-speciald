'use client';

import React from 'react';
import {
  CheckCircle2,
  ArrowRight,
  Clock,
  PhoneCall,
  Copy,
  Check,
  Bike,
  MapPin,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Order } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export function OrderSuccessModal({
  order,
  onClose,
  onTrackOrder,
}: {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string, token: string) => void;
}) {
  const { lang, t, settings } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!order) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 pb-20 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg max-h-[92vh] bg-white rounded-3xl shadow-2xl overflow-y-auto p-5 sm:p-7 text-center space-y-5 animate-in zoom-in-95 duration-200 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Celebration Badge */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-200/60 rounded-full animate-ping opacity-75" />
          <div className="w-20 h-20 bg-gradient-to-tr from-[#0B5D3B] to-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-900/20 ring-8 ring-emerald-50 relative z-10">
            <CheckCircle2 className="w-11 h-11" />
          </div>
        </div>

        {/* Headline & Friendly Reassurance */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-[#0B5D3B] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#F7931E]" />
            <span>{lang === 'bn' ? 'অর্ডার গ্রহণ সম্পন্ন হয়েছে' : 'Order Placed'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {lang === 'bn' ? 'আলহামদুলিল্লাহ! আপনার অর্ডার সফল হয়েছে' : 'Order Placed Successfully!'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            {lang === 'bn'
              ? 'ধন্যবাদ! আমাদের কিচেনে আপনার অর্ডার পৌঁছে গেছে এবং তাজা ও গরম খাবার প্রস্তুত করা হচ্ছে।'
              : 'Thank you! Our kitchen is preparing your fresh & delicious meal right now.'}
          </p>
        </div>

        {/* Order Reference Box (High Contrast) */}
        <div className="bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="text-left">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider block">
              {lang === 'bn' ? 'অর্ডার নম্বর (Order ID)' : 'Order Reference'}
            </span>
            <span className="font-mono font-black text-stone-900 text-lg sm:text-xl tracking-wide">
              {order.id}
            </span>
          </div>
          <button
            onClick={handleCopyId}
            className="p-2.5 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl text-stone-700 flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-4 h-4 text-[#0B5D3B]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি করুন' : 'Copy')}</span>
          </button>
        </div>

        {/* 4-Step Live Delivery Progress Visual Tracker */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-black text-[#0B5D3B] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#F7931E]" />
              <span>{lang === 'bn' ? 'অর্ডার স্ট্যাটাস' : 'Live Status'}</span>
            </span>
            <span className="text-xs font-bold text-stone-600 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
              {order.orderMode === 'delivery' ? '⏱️ আনুমানিক ২৫-৩৫ মিনিট' : '⏱️ আনুমানিক ১৫-২০ মিনিট'}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 pt-1 text-center">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center mx-auto text-xs font-black shadow-xs">
                ✓
              </div>
              <span className="text-[11px] font-bold text-[#0B5D3B] block leading-tight">
                {lang === 'bn' ? 'অর্ডার গৃহীত' : 'Received'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center mx-auto text-xs font-black animate-pulse shadow-xs">
                🍳
              </div>
              <span className="text-[11px] font-extrabold text-amber-800 block leading-tight">
                {lang === 'bn' ? 'রান্না হচ্ছে' : 'Cooking'}
              </span>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto text-xs font-bold">
                🛵
              </div>
              <span className="text-[11px] font-medium text-stone-600 block leading-tight">
                {lang === 'bn' ? 'ডেলিভারি' : 'On Way'}
              </span>
            </div>
            <div className="space-y-1 opacity-50">
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center mx-auto text-xs font-bold">
                🏠
              </div>
              <span className="text-[11px] font-medium text-stone-600 block leading-tight">
                {lang === 'bn' ? 'পৌঁছেছে' : 'Delivered'}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="text-left text-xs sm:text-sm text-stone-700 bg-stone-50 rounded-2xl p-4 space-y-2 border border-stone-200">
          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-semibold">{lang === 'bn' ? 'গ্রাহক:' : 'Customer:'}</span>
            <span className="font-extrabold text-stone-900">{order.customerName} ({order.customerPhone})</span>
          </div>

          <div className="flex justify-between items-center border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-semibold">{lang === 'bn' ? 'অর্ডার মোড:' : 'Mode:'}</span>
            <span className="font-bold text-stone-800 flex items-center gap-1">
              {order.orderMode === 'delivery' ? (
                <>
                  <Bike className="w-4 h-4 text-[#0B5D3B]" />
                  <span>{lang === 'bn' ? 'হোম ডেলিভারি' : 'Home Delivery'}</span>
                </>
              ) : (
                <span>{lang === 'bn' ? 'রেস্টুরেন্ট পিকআপ' : 'Pickup'}</span>
              )}
            </span>
          </div>

          {order.orderMode === 'delivery' && (
            <div className="border-b border-stone-200 pb-2">
              <span className="text-stone-500 font-semibold block mb-0.5">{lang === 'bn' ? 'ডেলিভারি ঠিকানা:' : 'Address:'}</span>
              <p className="font-bold text-stone-900 flex items-start gap-1">
                <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>
                  {order.area ? `${order.area}` : ''}
                  {order.landmark ? ` (${order.landmark})` : ''}
                  {order.address ? ` — ${order.address}` : ''}
                </span>
              </p>
            </div>
          )}

          {order.orderMode === 'pickup' && (
            <div className="border-b border-stone-200 pb-2 space-y-1">
              <span className="text-stone-500 font-semibold block mb-0.5">{lang === 'bn' ? 'খাবার সংগ্রহের ঠিকানা (পিকআপ):' : 'Pickup Location:'}</span>
              <p className="font-bold text-stone-900 flex items-start gap-1">
                <MapPin className="w-4 h-4 text-[#0B5D3B] shrink-0 mt-0.5" />
                <span>বেনাপোল নিত্য হাট (মেয়র মার্কেট), ঢাকা বিরিয়ানি হাউজ সংলগ্ন</span>
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="bg-emerald-50 border border-emerald-300 font-mono font-bold text-emerald-800 text-[11px] px-2 py-0.5 rounded-md">
                  2WW3+FG7 Benapole
                </span>
                <a
                  href={settings.mapUrl || 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac'}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#0B5D3B] hover:text-[#08482E] font-bold underline inline-flex items-center gap-1"
                >
                  <span>গুগল ম্যাপে ডিরেকশন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Items Recap */}
          <div className="pt-1 space-y-1.5 border-b border-stone-200 pb-2">
            <span className="text-stone-500 font-semibold block">{lang === 'bn' ? 'খাবারের তালিকা:' : 'Items Ordered:'}</span>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs sm:text-sm">
                <span className="font-medium text-stone-800">
                  {t(item.name)} <strong className="text-[#0B5D3B]">× {item.quantity}</strong>
                </span>
                <span className="font-extrabold text-stone-900">৳{item.totalPrice}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-1">
            <span className="text-sm sm:text-base font-black text-stone-900">{lang === 'bn' ? 'সর্বমোট পরিশোধযোগ্য:' : 'Total Amount:'}</span>
            <span className="font-black text-[#0B5D3B] text-lg sm:text-xl">৳{order.total}</span>
          </div>

          <div className="flex justify-between text-xs text-stone-500 pt-0.5">
            <span>{lang === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
            <span className="font-bold text-stone-800 uppercase">
              {order.paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি (নগদ)' : order.paymentMethod}
            </span>
          </div>
        </div>

        {/* Action Buttons (Big & Touch-Friendly) */}
        <div className="space-y-2.5 pt-1">
          <button
            onClick={() => onTrackOrder(order.id, order.trackingToken)}
            className="w-full bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-black text-base py-4 px-5 rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Clock className="w-5 h-5 text-[#F4D05F]" />
            <span>{lang === 'bn' ? '🛵 লাইভ অর্ডার ট্র্যাক করুন' : 'Track Order Status'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-sm sm:text-base py-3.5 px-5 rounded-2xl transition-colors cursor-pointer"
          >
            {lang === 'bn' ? '🏠 নতুন খাবার দেখুন (হোম পেজে ফিরে যান)' : 'Back to Home'}
          </button>
        </div>

        {/* Support Help */}
        <div className="text-xs text-stone-600 pt-1 flex items-center justify-center gap-1.5 font-medium">
          <PhoneCall className="w-4 h-4 text-[#0B5D3B]" />
          <span>
            {lang === 'bn' ? 'যেকোনো প্রয়োজনে সরাসরি কল করুন:' : 'Helpline:'}{' '}
            <a href={`tel:${settings.phone}`} className="font-extrabold text-[#0B5D3B] underline underline-offset-2">
              {settings.phone}
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
