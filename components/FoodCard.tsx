'use client';

import React from 'react';
import { Plus, Flame, Clock, Sparkles } from 'lucide-react';
import { FoodItem } from '@/lib/types';
import { useApp } from '@/context/AppContext';

export function FoodCard({ food }: { food: FoodItem }) {
  const { lang, t, setSelectedFoodForModal, addToCart, cart, updateCartQuantity } = useApp();

  const matchingCartItems = cart.filter((i) => i.foodId === food.id);
  const inCartQty = matchingCartItems.reduce((sum, i) => sum + i.quantity, 0);
  const primaryCartItem = matchingCartItems[0];

  const handleCardClick = () => {
    setSelectedFoodForModal(food);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If food has variants or add-ons, open modal for options selection
    if (
      (food.portionVariants && food.portionVariants.length > 1) ||
      (food.addOns && food.addOns.length > 0)
    ) {
      setSelectedFoodForModal(food);
      return;
    }

    // Direct add default
    const defaultVariant = food.portionVariants?.[0];
    addToCart({
      id: `${food.id}_default`,
      foodId: food.id,
      name: food.name,
      image: food.image,
      variantId: defaultVariant?.id,
      variantName: defaultVariant?.name,
      selectedAddOns: [],
      unitPrice: defaultVariant?.price || food.price,
      quantity: 1,
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-3xl border-2 border-stone-200/90 p-3.5 sm:p-4 flex flex-col justify-between hover:shadow-xl hover:border-[#0B5D3B]/50 transition-all duration-300 cursor-pointer relative overflow-hidden active:scale-99"
    >
      <div>
        {/* Food Image */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 mb-3 shadow-2xs">
          <img
            src={food.image}
            alt={food.name.en}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
            }}
          />

          {/* Bestseller Badge */}
          {food.isBestseller && (
            <div className="absolute top-2.5 left-2.5 bg-[#0B5D3B] text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-[#F7931E]" />
              <span>{lang === 'bn' ? 'জনপ্রিয়' : 'Popular'}</span>
            </div>
          )}

          {/* Prep Time */}
          {food.prepTime && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-md text-white text-xs font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
              <Clock className="w-3 h-3 text-[#F4D05F]" />
              <span>{food.prepTime}</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-1">
          <h3 className="font-black text-stone-900 text-base sm:text-lg leading-tight group-hover:text-[#0B5D3B] transition-colors line-clamp-1">
            {t(food.name)}
          </h3>
          <p className="text-xs text-stone-500 font-semibold line-clamp-1">
            {lang === 'bn' ? food.name.en : food.name.bn}
          </p>
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-2 leading-relaxed pt-1">
            {t(food.description)}
          </p>
        </div>
      </div>

      {/* Pricing & Add Button */}
      <div className="mt-3.5 pt-3 border-t-2 border-stone-100 flex items-center justify-between gap-2.5">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#0B5D3B]">৳{food.price}</span>
            {food.compareAtPrice && (
              <span className="text-xs sm:text-sm text-stone-400 line-through font-medium">৳{food.compareAtPrice}</span>
            )}
          </div>
          <span className="text-[10px] text-emerald-800 font-extrabold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>বেনাপোলে দ্রুত ডেলিভারি</span>
          </span>
        </div>

        {inCartQty > 0 && primaryCartItem ? (
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center bg-[#0B5D3B] text-white rounded-2xl p-1 shadow-md gap-1 border-2 border-emerald-700 shrink-0 h-12 sm:h-13"
          >
            <button
              onClick={() => updateCartQuantity(primaryCartItem.id, -1)}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl hover:bg-black/20 flex items-center justify-center font-black text-lg active:scale-90 transition-all cursor-pointer"
              aria-label="কমান"
            >
              −
            </button>
            <span className="font-mono font-black text-base sm:text-lg px-2 min-w-[28px] text-center text-white">
              {inCartQty}
            </span>
            <button
              onClick={handleQuickAdd}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl hover:bg-black/20 flex items-center justify-center font-black text-lg active:scale-90 transition-all cursor-pointer"
              aria-label="বাড়ান"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={handleQuickAdd}
            className="flex items-center justify-center h-12 sm:h-13 px-5 sm:px-6 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white rounded-2xl font-black text-sm sm:text-base gap-2 transition-all shadow-lg shadow-emerald-900/25 hover:shadow-xl cursor-pointer shrink-0 border border-emerald-600"
            aria-label={`অর্ডার করুন ${food.name.bn}`}
          >
            <Plus className="w-5 h-5 text-[#F4D05F] stroke-[3]" />
            <span className="tracking-tight">{lang === 'bn' ? 'অর্ডার করুন' : 'Order Now'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
