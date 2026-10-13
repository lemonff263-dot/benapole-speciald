'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle,
  Truck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    settings,
    appliedCoupon,
    setAppliedCoupon,
    offers,
    lang,
    t,
    setIsCheckoutOpen,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  if (!isCartOpen) return null;

  // Coupon discount calculation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((cartSubtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  // Delivery fee calculation
  const freeThreshold = settings.freeDeliveryThreshold || 350;
  const isFreeDelivery = cartSubtotal >= freeThreshold;
  const deliveryFee = isFreeDelivery || cart.length === 0 ? 0 : settings.deliveryFee;
  const remainingForFreeDelivery = Math.max(0, freeThreshold - cartSubtotal);

  const grandTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee);
  const openStatus = checkRestaurantOpenStatus(settings);

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const matched = offers.find((o) => o.code.toUpperCase() === code && o.isActive);
    if (!matched) {
      setCouponError(lang === 'bn' ? 'অচল অথবা ভুল কুপন কোড' : 'Invalid coupon code');
      return;
    }

    if (cartSubtotal < matched.minOrder) {
      setCouponError(
        lang === 'bn'
          ? `ন্যূনতম ৳${matched.minOrder} টাকার অর্ডারে প্রযোজ্য`
          : `Minimum order of ৳${matched.minOrder} required`
      );
      return;
    }

    setAppliedCoupon(matched);
    setCouponSuccess(
      lang === 'bn' ? 'কুপন সফলভাবে যুক্ত হয়েছে!' : 'Coupon applied successfully!'
    );
    setCouponInput('');
  };

  const handleProceedCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      onClick={() => setIsCartOpen(false)}
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-white h-[calc(100%-4rem)] md:h-full mb-16 md:mb-0 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b-2 border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#F4D05F]" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
                {lang === 'bn' ? 'আপনার খাবারের কার্ট' : 'Your Food Cart'}
              </h2>
              <span className="text-xs text-stone-500 font-bold">
                {cart.reduce((s, i) => s + i.quantity, 0)}টি আইটেম সিলেক্টেড
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Goal Bar */}
        {cart.length > 0 && (
          <div className="bg-emerald-50 px-5 py-3 border-b-2 border-emerald-100 flex items-center gap-2.5 text-xs sm:text-sm text-emerald-950 font-bold">
            <Truck className="w-5 h-5 text-[#0B5D3B] shrink-0" />
            {isFreeDelivery ? (
              <span className="text-[#0B5D3B]">
                🎉 {lang === 'bn' ? 'অভিনন্দন! আপনি ফ্রি ডেলিভারি পাচ্ছেন!' : 'You qualify for Free Delivery!'}
              </span>
            ) : (
              <span>
                {lang === 'bn'
                  ? `আর ৳${remainingForFreeDelivery} টাকার খাবার নিলেই ফ্রি ডেলিভারি!`
                  : `Add ৳${remainingForFreeDelivery} more to get Free Delivery!`}
              </span>
            )}
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-3.5 overscroll-contain">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div className="space-y-1.5">
                <p className="font-black text-lg text-stone-800">
                  {lang === 'bn' ? 'আপনার কার্ট এখন খালি' : 'Your cart is empty'}
                </p>
                <p className="text-xs sm:text-sm text-stone-500 max-w-xs leading-relaxed">
                  {lang === 'bn'
                    ? 'মেনু থেকে সুস্বাদু দই চিড়া অথবা পছন্দের স্নাক্স যোগ করুন।'
                    : 'Explore our delicious menu items and treat yourself!'}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  setTimeout(() => {
                    const el = document.getElementById('menu-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                }}
                className="mt-2 text-sm font-black text-white bg-[#0B5D3B] hover:bg-[#08482E] px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <span>{lang === 'bn' ? 'মেনু দেখুন ও খাবার যোগ করুন' : 'Browse Menu & Add Food'}</span>
                <span>→</span>
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3.5 p-3.5 rounded-2xl border-2 border-stone-200/90 bg-white hover:border-stone-300 transition-all shadow-2xs"
              >
                {/* Thumbnail */}
                <img
                  src={item.image}
                  alt={item.name.en}
                  className="w-18 h-18 rounded-xl object-cover bg-stone-100 shrink-0"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
                  }}
                />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-black text-sm sm:text-base text-stone-900 truncate">
                      {t(item.name)}
                    </h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition-colors cursor-pointer"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.variantName && (
                    <p className="text-xs text-stone-600 font-bold mt-0.5">
                      {t(item.variantName)}
                    </p>
                  )}

                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                      + {item.selectedAddOns.map((a) => t(a.name)).join(', ')}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-xs text-stone-500 italic mt-0.5 truncate">
                      নোট: {item.notes}
                    </p>
                  )}

                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="text-base sm:text-lg font-black text-[#0B5D3B]">
                      ৳{item.unitPrice * item.quantity}
                    </span>

                    {/* Stepper */}
                    <div className="flex items-center border-2 border-stone-200 rounded-xl bg-stone-50 p-0.5">
                      <button
                        onClick={() => updateCartQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-7 text-center text-xs sm:text-sm font-black text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-stone-800 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Area: Coupon & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t-2 border-stone-200 bg-stone-50/95 space-y-3 shrink-0 shadow-[0_-4px_15px_rgba(0,0,0,0.06)]">
            {/* Coupon Code Input */}
            <div className="space-y-1.5">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm">
                  <div className="flex items-center gap-2 text-[#0B5D3B] font-black">
                    <CheckCircle className="w-4 h-4" />
                    <span>{appliedCoupon.code}</span>
                    <span className="text-stone-700 font-medium">
                      (-৳{discountAmount})
                    </span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-red-600 hover:underline font-bold text-xs cursor-pointer"
                  >
                    {lang === 'bn' ? 'মুছে ফেলুন' : 'Remove'}
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder={lang === 'bn' ? 'কুপন কোড (যেমন: BENAPOLE30)' : 'Promo Code'}
                      className="w-full text-xs sm:text-sm pl-9 pr-3 py-3 rounded-2xl border-2 border-stone-200 bg-white uppercase font-bold focus:border-[#0B5D3B] outline-hidden"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="px-5 py-3 bg-stone-800 hover:bg-stone-900 text-white rounded-2xl text-xs sm:text-sm font-black transition-colors cursor-pointer"
                  >
                    {lang === 'bn' ? 'প্রয়োগ' : 'Apply'}
                  </button>
                </div>
              )}

              {couponError && <p className="text-xs text-red-600 font-bold">{couponError}</p>}
              {couponSuccess && <p className="text-xs text-[#0B5D3B] font-bold">{couponSuccess}</p>}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs sm:text-sm text-stone-700 pt-1 border-t border-stone-200">
              <div className="flex justify-between font-semibold">
                <span>{lang === 'bn' ? 'খাবারের মূল্য (সাবটোটাল)' : 'Subtotal'}</span>
                <span className="font-extrabold text-stone-900">৳{cartSubtotal}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>{lang === 'bn' ? 'ডিসকাউন্ট' : 'Discount'}</span>
                  <span>-৳{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Charge'}</span>
                <span className="font-extrabold text-stone-900">
                  {isFreeDelivery ? (
                    <span className="text-[#0B5D3B] font-black">{lang === 'bn' ? 'ফ্রি' : 'FREE'}</span>
                  ) : (
                    `৳${deliveryFee}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-stone-900 pt-2 border-t-2 border-stone-200">
                <span>{lang === 'bn' ? 'সর্বমোট প্রদেয়' : 'Total'}</span>
                <span className="text-[#0B5D3B] text-xl font-black">৳{grandTotal}</span>
              </div>
            </div>

            {/* Closed Warning Banner if orders not accepted */}
            {!openStatus.canAcceptOrders && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-red-900">
                    {lang === 'bn' ? 'অর্ডার গ্রহণ সাময়িকভাবে বন্ধ' : 'Orders Currently Closed'}
                  </div>
                  <div className="text-xs text-red-700 mt-0.5">
                    {openStatus.reasonBn || (lang === 'bn' ? 'রেস্টুরেন্ট খোলার পর পুনরায় অর্ডার করতে পারবেন।' : 'You can place orders when the restaurant opens.')}
                  </div>
                </div>
              </div>
            )}

            {/* Add More Items or Continue Browsing */}
            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                setTimeout(() => {
                  const el = document.getElementById('menu-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 60);
              }}
              className="w-full text-center py-2 text-xs font-black text-[#0B5D3B] hover:text-[#08482E] hover:underline flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>+</span>
              <span>{lang === 'bn' ? 'আরও খাবার যোগ করতে মেনুতে যান' : 'Add more items from menu'}</span>
            </button>

            {/* Checkout Action Button */}
            <div className="pt-1 flex gap-2.5">
              <button
                onClick={clearCart}
                className="p-3.5 border-2 border-stone-200 text-stone-500 hover:text-red-600 rounded-2xl transition-colors cursor-pointer"
                title="Clear Cart"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleProceedCheckout}
                disabled={!openStatus.canAcceptOrders}
                className={`flex-1 font-black text-base py-4 px-5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  openStatus.canAcceptOrders
                    ? 'bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white shadow-emerald-900/20'
                    : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                }`}
              >
                <span>
                  {openStatus.canAcceptOrders
                    ? lang === 'bn' ? `চেকআউট করুন (৳${grandTotal})` : `Checkout (৳${grandTotal})`
                    : lang === 'bn' ? 'অর্ডার গ্রহণ বন্ধ' : 'Orders Closed'}
                </span>
                {openStatus.canAcceptOrders && <ArrowRight className="w-5 h-5 text-[#F4D05F]" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
