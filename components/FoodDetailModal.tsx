'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { FoodItem, PortionVariant, FoodAddOn } from '@/lib/types';

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
      className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300 border border-stone-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Visual Image with Close Button */}
      <div className="relative h-44 sm:h-56 w-full bg-stone-100 shrink-0">
        <img
          src={food.image}
          alt={food.name.en}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
          }}
        />
        <button
          onClick={() => setSelectedFoodForModal(null)}
          className="absolute top-3.5 right-3.5 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        {food.isBestseller && (
          <div className="absolute top-3.5 left-3.5 bg-[#0B5D3B] text-white text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F4D05F]" />
            <span>{lang === 'bn' ? 'বেনাপোল স্পেশাল সেরা পছন্দ' : 'Customer Favorite'}</span>
          </div>
        )}
      </div>

      {/* Scrollable Modal Body */}
      <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 min-h-0 overscroll-contain">
        {/* Title & Description */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
            {t(food.name)}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 font-bold mt-0.5">
            {lang === 'bn' ? food.name.en : food.name.bn}
          </p>
          <p className="text-sm sm:text-base text-stone-700 leading-relaxed mt-2 font-normal">
            {t(food.description)}
          </p>
        </div>

        {/* Portion Size Variants */}
        {food.portionVariants && food.portionVariants.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider flex items-center justify-between">
              <span>{lang === 'bn' ? 'সাইজ / বাটির সাইজ বেছে নিন *' : 'Choose Portion Size *'}</span>
              <span className="text-stone-500 font-semibold lowercase">
                ({lang === 'bn' ? 'একটি নির্বাচন করুন' : 'select one'})
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
                        ? 'border-[#0B5D3B] bg-emerald-50 shadow-sm ring-2 ring-emerald-300'
                        : 'border-stone-200 hover:border-stone-300 bg-white'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900 leading-tight">{t(variant.name)}</span>
                    <span className="text-base sm:text-lg font-black text-[#0B5D3B] mt-1.5">৳{variant.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add-ons / Extras Checklist */}
        {food.addOns && food.addOns.length > 0 && (
          <div className="space-y-2.5">
            <label className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-wider block">
              {lang === 'bn' ? 'এক্সট্রা টপিং বা উপাদান যোগ করুন (ঐচ্ছিক)' : 'Add Extra Toppings (Optional)'}
            </label>

            <div className="space-y-2.5">
              {food.addOns.map((addOn) => {
                const isChecked = selectedAddOns.some((a) => a.id === addOn.id);
                return (
                  <div
                    key={addOn.id}
                    onClick={() => handleToggleAddOn(addOn)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 cursor-pointer select-none transition-all ${
                      isChecked
                        ? 'border-[#0B5D3B] bg-emerald-50/70 shadow-2xs'
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
                      <span className="text-sm sm:text-base font-bold text-stone-900">
                        {t(addOn.name)}
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-black text-[#0B5D3B]">+৳{addOn.price}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Special Cooking Note */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-bold text-stone-800 block">
            {lang === 'bn' ? 'বিশেষ রান্নার অনুরোধ / নোট' : 'Special Kitchen Instructions'}
          </label>
          <input
            type="text"
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
            placeholder={lang === 'bn' ? 'যেমন: মিষ্টি বেশি বা বাদাম বেশি দেবেন...' : 'e.g., extra sweet or less spicy...'}
            className="w-full text-sm sm:text-base p-3.5 rounded-2xl border-2 border-stone-200 focus:border-[#0B5D3B] outline-hidden bg-stone-50/50 font-medium text-stone-800"
            maxLength={150}
          />
        </div>
      </div>

      {/* Bottom Sticky Action Bar (never cut off on mobile) */}
      <div className="p-4 sm:p-5 pb-6 sm:pb-5 border-t-2 border-stone-200 bg-white flex items-center gap-3 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-bottom">
        {/* Quantity Stepper */}
        <div className="flex items-center border-2 border-stone-200 rounded-2xl bg-white p-1 shrink-0 shadow-2xs">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="w-10 text-center font-black text-base sm:text-lg text-stone-900">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-800 transition-colors cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="flex-1 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-black text-sm sm:text-base py-3.5 sm:py-4 px-4 rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-between transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#F4D05F]" />
            <span>{lang === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart'}</span>
          </span>
          <span className="bg-white/20 px-2.5 py-1 rounded-xl text-sm sm:text-base font-black">
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 pb-16 sm:p-4 sm:pb-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <FoodDetailContent key={food.id} food={food} />
    </div>
  );
}
