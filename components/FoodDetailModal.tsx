'use client';

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  Star,
  CheckCircle2,
  Bike,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FoodItem, PortionVariant, FoodAddOn } from '@/lib/types';
import { defaultReviews } from '@/lib/constants';

function FoodDetailContent({ food }: { food: FoodItem }) {
  const { setSelectedFoodForModal, lang, t, addToCart, setIsCartOpen } = useApp();

  const [selectedVariant, setSelectedVariant] = useState<PortionVariant | null>(() => {
    return (
      food.portionVariants?.find((v) => v.isDefault) ||
      food.portionVariants?.[0] ||
      null
    );
  });
  const [selectedAddOns, setSelectedAddOns] = useState<FoodAddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');

  // Calculate live total price
  const basePrice = selectedVariant ? selectedVariant.price : food.price;
  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const unitPrice = basePrice + addOnsTotal;
  const totalPrice = unitPrice * quantity;

  // Calculate delivery stats dynamically (seeded based on food ID)
  const deliveryCount = React.useMemo(() => {
    let hash = 0;
    for (let i = 0; i < food.id.length; i++) {
      hash = (hash << 5) - hash + food.id.charCodeAt(i);
    }
    const count = 350 + Math.abs(hash % 380);
    return count;
  }, [food.id]);

  // Filter or select reviews matching this food or top reviews
  const relevantReviews = React.useMemo(() => {
    const matched = defaultReviews.filter(
      (r) =>
        r.foodName?.includes(food.name.bn) ||
        r.foodName?.includes(food.name.en) ||
        food.name.bn.includes('দই চিড়া') && r.foodName?.includes('দই চিড়া')
    );
    if (matched.length > 0) return matched;
    return defaultReviews.slice(0, 3);
  }, [food.name]);

  const handleToggleAddOn = (addOn: FoodAddOn) => {
    if (selectedAddOns.some((a) => a.id === addOn.id)) {
      setSelectedAddOns(selectedAddOns.filter((a) => a.id !== addOn.id));
    } else {
      setSelectedAddOns([...selectedAddOns, addOn]);
    }
  };

  const handleAddToCart = () => {
    const itemKey = `${food.id}_${selectedVariant?.id || 'base'}_${selectedAddOns
      .map((a) => a.id)
      .sort()
      .join('-')}_${specialNote.trim()}`;

    addToCart({
      id: itemKey,
      foodId: food.id,
      name: food.name,
      image: food.image,
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,
      selectedAddOns: selectedAddOns.map((a) => ({
        id: a.id,
        name: a.name,
        price: a.price,
      })),
      unitPrice,
      quantity,
      notes: specialNote.trim() || undefined,
    });

    setSelectedFoodForModal(null);
    setIsCartOpen(true);
  };

  return (
    <div
      className="w-full max-w-xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto sm:max-h-[92vh] border border-stone-200 animate-in slide-in-from-bottom-6 duration-300"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Top Mobile App-Style Header Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-stone-200/80 flex items-center justify-between shrink-0 shadow-2xs">
        <button
          onClick={() => setSelectedFoodForModal(null)}
          className="p-2 -ml-1 rounded-xl hover:bg-stone-100 text-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-stone-800" />
          <span className="text-xs sm:text-sm font-bold text-stone-700">
            {lang === 'bn' ? 'ফিরে যান' : 'Back'}
          </span>
        </button>

        <h3 className="font-black text-sm sm:text-base text-stone-900 truncate max-w-[200px] text-center">
          {t(food.name)}
        </h3>

        <button
          onClick={() => setSelectedFoodForModal(null)}
          className="p-2 -mr-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto space-y-5 p-4 sm:p-6 overscroll-contain">
        {/* Header Food Image Showcase */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-stone-100 shadow-sm border border-stone-200">
          <img
            src={food.image}
            alt={food.name.en}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
            }}
          />

          {/* Floating Best Choice Badge */}
          {food.isBestseller && (
            <div className="absolute top-3 left-3 bg-[#0B5D3B] text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#F4D05F]" />
              <span>{lang === 'bn' ? 'বেনাপোল স্পেশাল সেরা পছন্দ' : 'Customer Favorite'}</span>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-stone-200 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs sm:text-sm font-black text-stone-900">৪.৯ ★</span>
            <span className="text-[11px] text-stone-500 font-semibold">(১৩০+ রিভিউ)</span>
          </div>
        </div>

        {/* Title, Category & Price Strip */}
        <div className="border-b border-stone-200/80 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {t(food.name)}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 font-bold mt-0.5">
                {lang === 'bn' ? food.name.en : food.name.bn}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-[#0B5D3B]">৳{basePrice}</span>
              {food.compareAtPrice && (
                <span className="block text-xs sm:text-sm text-stone-400 line-through font-medium">
                  ৳{food.compareAtPrice}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mt-2.5 font-normal">
            {t(food.description)}
          </p>

          {/* SUCCESSFUL DELIVERY COUNTER (User Requested) */}
          <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 flex items-center gap-2.5 shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center shrink-0">
              <Bike className="w-4 h-4 text-[#F4D05F]" />
            </div>
            <div className="flex-1">
              <span className="text-xs sm:text-sm font-black text-[#0B5D3B] block leading-tight">
                🎉 এই খাবারটি বেনাপোলে {deliveryCount}+ বার সফলভাবে ডেলিভারি হয়েছে!
              </span>
              <span className="text-[11px] text-stone-600 font-medium">
                ১০০% খাঁটি ও তাজা উপকরণে প্রস্তুতকৃত সেরা মান
              </span>
            </div>
          </div>
        </div>

        {/* Portion Size Variants (Big Touch Targets) */}
        {food.portionVariants && food.portionVariants.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'bn' ? 'সাইজ / বাটির মাপ বেছে নিন *' : 'Choose Portion Size *'}</span>
              <span className="text-emerald-700 text-xs font-bold lowercase">
                ({lang === 'bn' ? 'বাধ্যতামূলক' : 'required'})
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {food.portionVariants.map((variant) => {
                const isSelected = selectedVariant?.id === variant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#0B5D3B] bg-emerald-50 shadow-md ring-2 ring-emerald-400'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">
                      {t(variant.name)}
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#0B5D3B] mt-2">
                      ৳{variant.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons Checklist */}
        {food.addOns && food.addOns.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider block">
              {lang === 'bn' ? 'এক্সট্রা টপিং বা উপাদান যোগ করুন (ঐচ্ছিক)' : 'Extra Toppings (Optional)'}
            </label>

            <div className="space-y-2">
              {food.addOns.map((addOn) => {
                const isChecked = selectedAddOns.some((a) => a.id === addOn.id);
                return (
                  <div
                    key={addOn.id}
                    onClick={() => handleToggleAddOn(addOn)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-[#0B5D3B] bg-emerald-50/80 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${
                          isChecked
                            ? 'bg-[#0B5D3B] border-[#0B5D3B] text-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-stone-900">
                        {t(addOn.name)}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-black text-[#0B5D3B]">+৳{addOn.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Cooking Note */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-bold text-stone-800 block">
            {lang === 'bn' ? 'বিশেষ রান্নার অনুরোধ / নোট (ঐচ্ছিক)' : 'Special Request / Instructions'}
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder={lang === 'bn' ? 'যেমন: মিষ্টি বেশি বা বাদাম বেশি দেবেন...' : 'e.g., extra sweet or less spicy...'}
            className="w-full text-xs sm:text-sm p-3.5 rounded-2xl border-2 border-stone-200 focus:border-[#0B5D3B] outline-hidden bg-stone-50/50 font-medium text-stone-800"
            maxLength={150}
          />
        </div>

        {/* CUSTOMER REVIEWS & FEEDBACK SECTION (User Requested on food page) */}
        <div className="border-t border-stone-200 pt-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0B5D3B]" />
              <h4 className="font-black text-sm sm:text-base text-stone-900">
                {lang === 'bn' ? 'গ্রাহকদের রিভিউ ও মতামত' : 'Customer Reviews'}
              </h4>
            </div>
            <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <span>৪.৯ / ৫.০</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {relevantReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-stone-900">{rev.name}</span>
                    {rev.isVerified && (
                      <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>যাচাইকৃত ক্রেতা</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed font-normal">
                  "{rev.comment}"
                </p>
                <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                  <span>{rev.location || 'বেনাপোল'}</span>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="p-3.5 sm:p-5 border-t-2 border-stone-200 bg-white flex items-center gap-3 shrink-0 shadow-[0_-4px_25px_rgba(0,0,0,0.1)] pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Quantity Stepper */}
        <div className="flex items-center border-2 border-stone-200 rounded-2xl bg-white p-1 shrink-0 shadow-2xs">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer text-lg font-black"
            aria-label="Decrease quantity"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="w-10 text-center font-black text-base sm:text-lg text-stone-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer text-lg font-black"
            aria-label="Increase quantity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-black text-sm sm:text-base py-3.5 sm:py-4 px-4 rounded-2xl shadow-lg shadow-emerald-900/25 flex items-center justify-between transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F4D05F]" />
            <span>{lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
          </span>
          <span className="bg-white/20 px-3 py-1 rounded-xl text-sm sm:text-base font-black">
            ৳{totalPrice}
          </span>
        </button>
      </div>
    </div>
  );
}

export function FoodDetailModal() {
  const { selectedFoodForModal: food, setSelectedFoodForModal } = useApp();

  if (!food) return null;

  return (
    <div
      onClick={() => setSelectedFoodForModal(null)}
      className="fixed inset-0 z-[115] flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <FoodDetailContent key={food.id} food={food} />
    </div>
  );
}
