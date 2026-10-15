'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Star, ArrowRight, X, Heart, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';

export function WelcomeEntranceModal() {
  const { lang, foods, setSelectedFoodForModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show attractive intro animation on site entry, keep for exactly 2 seconds, then auto-dismiss
    setIsOpen(true);

    const autoCloseTimer = setTimeout(() => {
      setIsOpen(false);
    }, 2000);

    return () => clearTimeout(autoCloseTimer);
  }, []);

  if (!isOpen) return null;

  const signatureFood = foods.find((f) => f.id === 'doi-chira-signature') || foods[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: -20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280 }}
          className="relative w-full max-w-sm sm:max-w-md bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EE] to-white rounded-3xl shadow-2xl border-2 border-emerald-600/40 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Banner with Animated Sparkles */}
          <div className="relative h-28 sm:h-32 bg-gradient-to-tr from-[#0B5D3B] via-[#0E7A4E] to-[#F7931E] p-4 flex flex-col justify-between text-white overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/15 rounded-full blur-xl" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-amber-400/20 rounded-full blur-xl" />

            <div className="flex items-center justify-between relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black text-amber-200 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#F4D05F] animate-spin" />
                <span>স্বাগতম বেনাপোল স্পেশাল</span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative z-10">
              <h2 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-sm">
                স্বাদ ও ঐতিহ্যে বেনাপোলের সেরা!
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium">
                খাঁটি মিষ্টি দই চিড়া ও স্পেশাল ফাস্টফুডের সমাহার
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 space-y-3.5 text-center">
            {/* Signature Food Spotlight */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md group">
              <img
                src="/images/doi_chira.jpg"
                alt="Benapole Special Doi Chira"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/doi_chira_hero_1791652770180.jpg';
                }}
              />
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-black text-[#0B5D3B] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>৪.৯ ★ (১৩০+ রিভিউ)</span>
              </div>
              <div className="absolute top-2 right-2 bg-[#F7931E] text-white px-2 py-0.5 rounded-lg text-xs font-black shadow-xs">
                শুরু মাত্র ৳৪০
              </div>
            </div>

            {/* Quick Benefits Strip */}
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                <span className="text-xs font-bold text-stone-800">১৫-২৫ মিনিটে ডেলিভারি</span>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[#F7931E] shrink-0" />
                <span className="text-xs font-bold text-stone-800">১০০% খাঁটি ও ফ্রেশ</span>
              </div>
            </div>

            {/* 2-Second Auto-dismiss Progress Bar & Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: 2.2, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-[#0B5D3B] to-[#F7931E]"
                />
              </div>
              <p className="text-[10px] text-stone-500 font-medium">
                ২ সেকেন্ড পর স্বয়ংক্রিয়ভাবে বন্ধ হয়ে যাবে
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
