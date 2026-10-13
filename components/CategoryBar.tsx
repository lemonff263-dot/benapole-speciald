'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Utensils,
  Flame,
  Soup,
  CookingPot,
  Sandwich,
  Drumstick,
  Coffee,
  Sparkles,
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Utensils: <Utensils className="w-5 h-5" />,
  Flame: <Flame className="w-5 h-5" />,
  Soup: <Soup className="w-5 h-5" />,
  CookingPot: <CookingPot className="w-5 h-5" />,
  Sandwich: <Sandwich className="w-5 h-5" />,
  Drumstick: <Drumstick className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
};

export function CategoryBar({
  selectedCategory,
  onSelectCategory,
}: {
  selectedCategory: string;
  onSelectCategory: (catId: string) => void;
}) {
  const { lang, t, categories, theme } = useApp();

  if (!theme.sections.categories.enabled) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md border-b-2 border-stone-200/90 sticky top-16 z-20 py-3 shadow-xs">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
          {/* "All" button */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0B5D3B] text-white shadow-md ring-2 ring-emerald-300'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200/90 font-bold'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#F4D05F]" />
            <span>{lang === 'bn' ? 'সব খাবার' : 'All Items'}</span>
          </button>

          {/* Dynamic categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const icon = iconMap[cat.icon] || <Utensils className="w-4 h-4" />;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B5D3B] text-white shadow-md font-black ring-2 ring-emerald-300'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/90 font-bold'
                }`}
              >
                <span className={isSelected ? 'text-[#F4D05F]' : 'text-stone-500'}>{icon}</span>
                <span>{t(cat.name)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
