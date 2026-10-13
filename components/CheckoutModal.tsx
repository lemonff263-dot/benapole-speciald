'use client';

import React, { useState } from 'react';
import {
  X,
  Bike,
  Store,
  CheckCircle,
  Copy,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  Sparkles,
  Phone,
  User,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BkashLogo, NagadLogo, RocketLogo } from './BrandLogos';
import { DeliveryLocationPicker, LocationPickerValue } from './DeliveryLocationPicker';
import { defaultSettings } from '@/lib/constants';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';
import { saveCustomerOrder } from '@/lib/customerOrders';

export function CheckoutModal({
  onOrderSuccess,
}: {
  onOrderSuccess: (order: any) => void;
}) {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartSubtotal,
    settings,
    appliedCoupon,
    clearCart,
    lang,
    t,
  } = useApp();

  const [orderMode, setOrderMode] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const activeAreas = settings.deliveryAreas && settings.deliveryAreas.length > 0 ? settings.deliveryAreas : defaultSettings.deliveryAreas;
  const initialArea = activeAreas[0];
  const [locationPicker, setLocationPicker] = useState<LocationPickerValue>({
    area: initialArea?.name?.bn || 'বেনাপোল পৌরসভা / শহর এলাকা',
    landmark: initialArea?.landmark ? initialArea.landmark.split(',')[0].trim() : 'পৌরসভা চত্বর',
    address: '',
    coordinates: initialArea?.coordinates || { lat: 23.046345, lng: 88.903870 },
    googleMapsUrl: initialArea?.coordinates
      ? `https://www.google.com/maps?q=${initialArea.coordinates.lat},${initialArea.coordinates.lng}`
      : 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac',
    deliveryFee: initialArea?.fee !== undefined ? initialArea.fee : settings.deliveryFee,
  });
  const [pickupTime, setPickupTime] = useState('যত দ্রুত সম্ভব (১৫-২০ মিনিট)');
  const [instructions, setInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'pickup_cash' | 'bkash' | 'nagad' | 'rocket'>('cod');
  const [transactionId, setTransactionId] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedAccount, setCopiedAccount] = useState('');

  if (!isCheckoutOpen) return null;

  // Pricing
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

  const freeThreshold = settings.freeDeliveryThreshold || 350;
  const baseDeliveryFee =
    locationPicker.deliveryFee !== undefined ? locationPicker.deliveryFee : settings.deliveryFee;
  const deliveryFee =
    orderMode === 'pickup' || cartSubtotal >= freeThreshold ? 0 : baseDeliveryFee;
  const totalAmount = Math.max(0, cartSubtotal - discountAmount + deliveryFee);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(text);
    setTimeout(() => setCopiedAccount(''), 2500);
  };

  const openStatus = checkRestaurantOpenStatus(settings);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!openStatus.canAcceptOrders) {
      setErrorMessage(
        openStatus.reasonBn ||
          'রেস্টুরেন্টে বর্তমানে অর্ডার গ্রহণ সাময়িক বন্ধ রয়েছে। অনুগ্রহ করে খোলার পর অর্ডার করুন।'
      );
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your full name');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage(
        lang === 'bn'
          ? 'সঠিক মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
          : 'Please enter a valid Bangladeshi mobile number'
      );
      return;
    }

    if (orderMode === 'delivery' && (!locationPicker.address || locationPicker.address.trim().length < 2)) {
      setErrorMessage(
        lang === 'bn'
          ? 'ডেলিভারির পূর্ণ ঠিকানা বা বাড়ি/রোড বিবরণ লিখুন'
          : 'Please provide delivery address or house/road details'
      );
      return;
    }

    if (['bkash', 'nagad', 'rocket'].includes(paymentMethod) && !transactionId.trim()) {
      setErrorMessage(
        lang === 'bn'
          ? 'অনুগ্রহ করে পেমেন্ট ট্রানজেকশন আইডি (TrxID) দিন'
          : 'Please enter your payment Transaction ID (TrxID)'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        orderMode,
        address: orderMode === 'delivery' ? locationPicker.address.trim() : undefined,
        area: orderMode === 'delivery' ? locationPicker.area : undefined,
        landmark: orderMode === 'delivery' ? locationPicker.landmark : undefined,
        mapCoordinates: orderMode === 'delivery' ? locationPicker.coordinates : undefined,
        googleMapsUrl: orderMode === 'delivery' ? locationPicker.googleMapsUrl : undefined,
        pickupTime: orderMode === 'pickup' ? pickupTime : undefined,
        instructions: instructions.trim() || undefined,
        items: cart.map((i) => ({
          foodId: i.foodId,
          variantId: i.variantId,
          selectedAddOns: i.selectedAddOns,
          quantity: i.quantity,
          notes: i.notes,
        })),
        couponCode: appliedCoupon?.code,
        paymentMethod:
          orderMode === 'pickup' && paymentMethod === 'cod' ? 'pickup_cash' : paymentMethod,
        transactionId: transactionId.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে');
      }

      // Success! Save order to customer history, clear cart, close checkout, pass order to success view
      saveCustomerOrder(data.order);
      clearCart();
      setIsCheckoutOpen(false);
      onOrderSuccess(data.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'অর্ডারে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setIsCheckoutOpen(false)}
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center p-0 pb-16 sm:p-4 sm:pb-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-xl max-h-[90dvh] sm:max-h-[90vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-5 h-5 text-[#F4D05F]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                {lang === 'bn' ? 'অর্ডার কনফার্ম ও চেকআউট' : 'Order Checkout'}
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                {lang === 'bn' ? 'কোনো রেজিস্ট্রেশন ছাড়াই দ্রুত অর্ডার সম্পন্ন করুন' : 'Fast guest checkout • No signup needed'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-2 rounded-xl hover:bg-stone-200 text-stone-600 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmitOrder} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 pb-12 sm:pb-8 space-y-5 overscroll-contain">
          {/* Restaurant Closed Warning Banner */}
          {!openStatus.canAcceptOrders && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2 text-sm text-amber-950 animate-in fade-in">
              <div className="flex items-center gap-2 font-black text-base text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>{openStatus.statusTextBn} ({openStatus.openingTimeFormatted} - {openStatus.closingTimeFormatted})</span>
              </div>
              <p className="leading-relaxed text-stone-700">
                {openStatus.reasonBn}
              </p>
              <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl inline-block">
                🕒 বর্তমান বাংলাদেশ সময়: {openStatus.currentBangladeshTime}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center gap-2.5 text-sm text-red-800 font-bold animate-in shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cart Mini-recap */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-700">
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#0B5D3B]" />
                <span>আপনার খাবারের তালিকা ({cart.length} আইটেম)</span>
              </span>
              <span className="text-[#0B5D3B] font-extrabold text-sm sm:text-base">৳{cartSubtotal}</span>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 shrink-0 text-xs font-semibold shadow-2xs">
                  <img src={item.image} alt={item.name.en} className="w-7 h-7 rounded-lg object-cover" />
                  <span>{t(item.name)} <strong className="text-[#0B5D3B]">×{item.quantity}</strong></span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery vs Pickup Selector */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider block">
              {lang === 'bn' ? 'ডেলিভারি নাকি পিকআপ নির্বাচন করুন *' : 'Delivery or Pickup *'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setOrderMode('delivery');
                  if (paymentMethod === 'pickup_cash') setPaymentMethod('cod');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                  orderMode === 'delivery'
                    ? 'border-[#0B5D3B] bg-emerald-50/90 shadow-sm ring-2 ring-emerald-300'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    orderMode === 'delivery' ? 'bg-[#0B5D3B] text-white shadow-xs' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Bike className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
                    {lang === 'bn' ? 'হোম ডেলিভারি' : 'Home Delivery'}
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5 font-medium">
                    {cartSubtotal >= freeThreshold ? (
                      <span className="text-[#0B5D3B] font-black">🎉 ফ্রি ডেলিভারি</span>
                    ) : (
                      `চার্জ: ৳${locationPicker.deliveryFee}`
                    )}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOrderMode('pickup');
                  if (paymentMethod === 'cod') setPaymentMethod('pickup_cash');
                }}
                className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer ${
                  orderMode === 'pickup'
                    ? 'border-[#0B5D3B] bg-emerald-50/90 shadow-sm ring-2 ring-emerald-300'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl shrink-0 ${
                    orderMode === 'pickup' ? 'bg-[#0B5D3B] text-white shadow-xs' : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-stone-900 leading-tight">
                    {lang === 'bn' ? 'রেস্টুরেন্ট পিকআপ' : 'Pickup'}
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5 font-medium">
                    {lang === 'bn' ? 'কাউন্টার থেকে নিন (০ চার্জ)' : 'Free Takeaway'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Customer Contact Details */}
          <div className="space-y-3.5 pt-1">
            <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <User className="w-4 h-4 text-[#0B5D3B]" />
              <span>{lang === 'bn' ? 'আপনার যোগাযোগের তথ্য' : 'Your Contact Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs sm:text-sm font-bold text-stone-800 mb-1.5 block">
                  {lang === 'bn' ? 'আপনার নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: মোহাম্মদ আরিফ' : 'Enter your name'}
                  className="w-full text-sm sm:text-base p-3.5 rounded-2xl border-2 border-stone-200 focus:border-[#0B5D3B] outline-hidden bg-stone-50/50 font-medium text-stone-900 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-stone-800 mb-1.5 block">
                  {lang === 'bn' ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full text-sm sm:text-base p-3.5 rounded-2xl border-2 border-stone-200 focus:border-[#0B5D3B] outline-hidden bg-stone-50/50 font-mono font-bold text-stone-900 transition-colors"
                />
              </div>
            </div>

            {/* Delivery Fields: Upgraded Interactive Map, Landmark & Address Picker */}
            {orderMode === 'delivery' && (
              <div className="pt-2">
                <DeliveryLocationPicker
                  deliveryAreas={activeAreas}
                  value={locationPicker}
                  onChange={setLocationPicker}
                />
              </div>
            )}

            {/* Pickup Time when pickup selected */}
            {orderMode === 'pickup' && (
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0B5D3B]" />
                  <span>{lang === 'bn' ? 'কখন খাবার নিতে চান?' : 'Pickup Time'}</span>
                </label>
                <select
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full text-sm sm:text-base p-3 rounded-xl border border-stone-200 bg-white font-semibold text-stone-800 focus:border-[#0B5D3B]"
                >
                  <option value="যত দ্রুত সম্ভব (১৫-২০ মিনিট)">যত দ্রুত সম্ভব (১৫-২০ মিনিট)</option>
                  <option value="৩০ মিনিট পর">৩০ মিনিট পর</option>
                  <option value="১ ঘণ্টা পর">১ ঘণ্টা পর</option>
                  <option value="আজ সন্ধ্যায়">আজ সন্ধ্যায়</option>
                </select>
                <div className="pt-2 border-t border-stone-200 text-xs text-stone-600 space-y-1.5">
                  <p className="font-semibold text-stone-800">
                    📍 রেস্টুরেন্টের ঠিকানা: বেনাপোল নিত্য হাট (মেয়র মার্কেট), ঢাকা বিরিয়ানি হাউজ সংলগ্ন।
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-emerald-50 border border-emerald-300 font-mono font-bold text-emerald-800 text-[11px] px-2 py-0.5 rounded-md">
                      প্লাস কোড: 2WW3+FG7 Benapole
                    </span>
                    <a
                      href={settings.mapUrl || 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#0B5D3B] hover:text-[#08482E] font-bold underline inline-flex items-center gap-1"
                    >
                      <span>গুগল ম্যাপে লোকেশন দেখুন</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Special Cooking/Delivery Instructions */}
            <div>
              <label className="text-xs sm:text-sm font-bold text-stone-800 mb-1.5 block">
                {lang === 'bn' ? 'বিশেষ কোনো নির্দেশনা (ঐচ্ছিক)' : 'Special Instructions (Optional)'}
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'যেমন: মিষ্টি দই বেশি দেবেন, ঝাল কম, কলিং বেল বাজাবেন না...'
                    : 'Any special cooking or delivery notes...'
                }
                className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border-2 border-stone-200 bg-stone-50/50 focus:border-[#0B5D3B] outline-hidden font-medium text-stone-800"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#0B5D3B]" />
              <span>{lang === 'bn' ? 'পেমেন্ট পদ্ধতি বেছে নিন *' : 'Payment Method *'}</span>
            </h3>

            <div className="space-y-3">
              {/* Cash On Delivery / Cash at Pickup */}
              <label
                className={`p-4 rounded-2xl border-2 block cursor-pointer transition-all ${
                  paymentMethod === 'cod' || paymentMethod === 'pickup_cash'
                    ? 'border-[#0B5D3B] bg-emerald-50/80 shadow-sm ring-2 ring-emerald-300'
                    : 'border-stone-200 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <input
                    type="radio"
                    name="paymethod"
                    checked={paymentMethod === 'cod' || paymentMethod === 'pickup_cash'}
                    onChange={() => setPaymentMethod(orderMode === 'pickup' ? 'pickup_cash' : 'cod')}
                    className="accent-[#0B5D3B] w-5 h-5 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm sm:text-base font-extrabold text-stone-900 block">
                      {orderMode === 'delivery'
                        ? lang === 'bn'
                          ? '💵 ক্যাশ অন ডেলিভারি (খাবার পেয়ে নগদ টাকা দিন)'
                          : 'Cash on Delivery (COD)'
                        : lang === 'bn'
                        ? '💵 পিকআপ কাউন্টারে নগদ পরিশোধ'
                        : 'Pay Cash at Counter'}
                    </span>
                    <span className="text-xs text-stone-600 font-medium mt-0.5 block">
                      {lang === 'bn' ? 'কোনো অগ্রিম পেমেন্ট নেই, খাবার হাতে পেয়ে টাকা দিন।' : 'No advance payment required.'}
                    </span>
                  </div>
                </div>
              </label>

              {/* bKash Manual */}
              {settings.paymentConfig.bkash.enabled && (
                <div
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-[#E2136E] bg-pink-50/70 shadow-md ring-2 ring-[#E2136E]/40'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3.5">
                      <input
                        type="radio"
                        name="paymethod"
                        checked={paymentMethod === 'bkash'}
                        onChange={() => setPaymentMethod('bkash')}
                        className="accent-[#E2136E] w-5 h-5 cursor-pointer"
                      />
                      <div className="flex items-center gap-2.5">
                        <BkashLogo className="h-7 w-auto" />
                        <span className="text-sm sm:text-base font-black text-stone-900">বিকাশ (bKash)</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#E2136E] bg-white px-2.5 py-1 rounded-full border border-pink-200 shadow-2xs">
                      Send Money
                    </span>
                  </label>

                  {paymentMethod === 'bkash' && (
                    <div className="mt-3.5 pt-3.5 border-t border-pink-200 text-xs sm:text-sm space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-white p-3.5 rounded-2xl border border-pink-200 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 font-bold block uppercase tracking-wider">
                            বিকাশ পার্সোনাল নম্বর (Send Money):
                          </span>
                          <span className="font-mono font-black text-stone-900 text-base sm:text-lg tracking-wide">
                            {settings.paymentConfig.bkash.number}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.paymentConfig.bkash.number)}
                          className="px-3.5 py-2 bg-[#E2136E] hover:bg-[#c20f5e] active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          {copiedAccount === settings.paymentConfig.bkash.number ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>নম্বর কপি</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 bg-pink-100/70 rounded-xl border border-pink-200 text-xs text-stone-800 leading-relaxed space-y-1 font-medium">
                        <div className="font-extrabold text-[#E2136E]">পেমেন্টের ধাপসমূহ:</div>
                        <div>১. বিকাশ অ্যাপে গিয়ে <strong>Send Money</strong> অপশন চাপুন।</div>
                        <div>২. প্রাপক নম্বরে <strong>{settings.paymentConfig.bkash.number}</strong> দিন এবং টাকার পরিমাণ <strong>৳{totalAmount}</strong> লিখুন।</div>
                        <div>৩. সেন্ড মানি সফল হলে মেসেজের <strong>TrxID</strong> টি নিচের বক্সে লিখুন।</div>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-black text-stone-800 block mb-1.5">
                          বিকাশ ট্রানজেকশন আইডি (TrxID) লিখুন: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="যেমন: BKH9482X7Q"
                          className="w-full p-3.5 rounded-2xl border-2 border-pink-300 focus:border-[#E2136E] uppercase font-mono font-bold text-sm sm:text-base bg-white outline-hidden shadow-2xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nagad Manual */}
              {settings.paymentConfig.nagad.enabled && (
                <div
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-[#ED1C24] bg-orange-50/70 shadow-md ring-2 ring-[#ED1C24]/40'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3.5">
                      <input
                        type="radio"
                        name="paymethod"
                        checked={paymentMethod === 'nagad'}
                        onChange={() => setPaymentMethod('nagad')}
                        className="accent-[#ED1C24] w-5 h-5 cursor-pointer"
                      />
                      <div className="flex items-center gap-2.5">
                        <NagadLogo className="h-7 w-auto" />
                        <span className="text-sm sm:text-base font-black text-stone-900">নগদ (Nagad)</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#ED1C24] bg-white px-2.5 py-1 rounded-full border border-orange-200 shadow-2xs">
                      Send Money
                    </span>
                  </label>

                  {paymentMethod === 'nagad' && (
                    <div className="mt-3.5 pt-3.5 border-t border-orange-200 text-xs sm:text-sm space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="bg-white p-3.5 rounded-2xl border border-orange-200 shadow-2xs flex items-center justify-between">
                        <div>
                          <span className="text-xs text-stone-500 font-bold block uppercase tracking-wider">
                            নগদ পার্সোনাল নম্বর (Send Money):
                          </span>
                          <span className="font-mono font-black text-stone-900 text-base sm:text-lg tracking-wide">
                            {settings.paymentConfig.nagad.number}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(settings.paymentConfig.nagad.number)}
                          className="px-3.5 py-2 bg-[#ED1C24] hover:bg-[#c4151b] active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Copy className="w-4 h-4" />
                          <span>{copiedAccount === settings.paymentConfig.nagad.number ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                        </button>
                      </div>

                      <div>
                        <label className="text-xs sm:text-sm font-black text-stone-800 block mb-1.5">
                          নগদ ট্রানজেকশন আইডি (TrxID) লিখুন: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="নগদ TrxID লিখুন"
                          className="w-full p-3.5 rounded-2xl border-2 border-orange-300 focus:border-[#ED1C24] uppercase font-mono font-bold text-sm sm:text-base bg-white outline-hidden shadow-2xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border-2 border-stone-200 space-y-2.5">
            <div className="flex justify-between text-stone-700 text-xs sm:text-sm font-semibold">
              <span>{lang === 'bn' ? 'খাবারের মোট মূল্য (সাবটোটাল)' : 'Subtotal'}</span>
              <span className="font-extrabold text-stone-900">৳{cartSubtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-800 text-xs sm:text-sm font-bold">
                <span>{lang === 'bn' ? 'কুপন ছাড়' : 'Discount'} ({appliedCoupon?.code})</span>
                <span>-৳{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-700 text-xs sm:text-sm font-semibold">
              <span>{lang === 'bn' ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</span>
              <span className="font-extrabold text-stone-900">
                {deliveryFee === 0 ? <span className="text-[#0B5D3B] font-black">{lang === 'bn' ? 'ফ্রি' : 'FREE'}</span> : `৳${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between font-black text-stone-900 text-base sm:text-xl pt-2.5 border-t-2 border-stone-200">
              <span>{lang === 'bn' ? 'সর্বমোট পরিশোধযোগ্য:' : 'Grand Total:'}</span>
              <span className="text-[#0B5D3B] text-xl sm:text-2xl font-black">৳{totalAmount}</span>
            </div>
          </div>

          {/* Submit Button (Extra Large & Touch-Friendly) */}
          <button
            type="submit"
            disabled={isSubmitting || !openStatus.canAcceptOrders}
            className={`w-full font-black text-base sm:text-lg py-4 px-6 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              !openStatus.canAcceptOrders
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
                : 'bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 disabled:opacity-70 text-white shadow-emerald-900/25 ring-2 ring-emerald-500/20'
            }`}
          >
            {!openStatus.canAcceptOrders ? (
              <>
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span>{lang === 'bn' ? `${openStatus.statusTextBn} — অর্ডার গ্রহণ বন্ধ` : 'Closed — Orders Paused'}</span>
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#F4D05F]" />
                <span>{lang === 'bn' ? 'অর্ডার জমা হচ্ছে...' : 'Placing Order...'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6 text-[#F4D05F]" />
                <span>{lang === 'bn' ? `অর্ডার নিশ্চিত করুন (৳${totalAmount})` : `Confirm Order (৳${totalAmount})`}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
