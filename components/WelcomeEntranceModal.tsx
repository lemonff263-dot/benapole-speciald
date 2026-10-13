'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Star, ArrowRight, X, Heart, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';

export function WelcomeEntranceModal() {
  const { lang, foods, setSelectedFoodForModal } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Only show once per session or after 12 hours
    try {
      const seen = sessionStorage.getItem('bs_welcome_intro_seen');
      if (!seen) {
        const timer = setTimeout(() => {
          setIsOpen(true);
          sessionStorage.setItem('bs_welcome_intro_seen', 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // non-blocking
    }
  }, []);

  if (!isOpen) return null;

  const signatureFood = foods.find((f) => f.id === 'doi-chira-signature') || foods[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EE] to-white rounded-3xl shadow-2xl border-2 border-emerald-600/30 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Banner with Sparkles */}
          <div className="relative h-32 sm:h-36 bg-gradient-to-tr from-[#0B5D3B] via-[#0E7A4E] to-[#F7931E] p-4 flex flex-col justify-between text-white overflow-hidden">
            {/* Ambient Background Circles */}
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
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">
                স্বাদ ও ঐতিহ্যে বেনাপোলের সেরা!
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                খাঁটি মিষ্টি দই চিড়া ও সুস্বাদু ফাস্টফুডের রাজকীয় সমাহার
              </p>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4 text-center">
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
              <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-black text-[#0B5D3B] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>৪.৯ স্টার (১২০+ রিভিউ)</span>
              </div>
              <div className="absolute top-2 right-2 bg-[#F7931E] text-white px-2.5 py-1 rounded-lg text-xs font-black shadow-xs">
                শুরু মাত্র ৳৪০
              </div>
            </div>

            {/* Quick Benefits Strip */}
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                <span className="text-xs font-bold text-stone-800">১৫-২৫ মিনিটে ডেলিভারি</span>
              </div>
              <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#F7931E] shrink-0" />
                <span className="text-xs font-bold text-stone-800">১০০% স্বাস্থ্যকর খাবার</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (signatureFood) {
                    setSelectedFoodForModal(signatureFood);
                  } else {
                    const el = document.getElementById('menu-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="w-full bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-black text-sm sm:text-base py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>স্পেশাল দই চিড়া অর্ডার করুন এখনই</span>
                <ArrowRight className="w-4 h-4 text-[#F4D05F]" />
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  const el = document.getElementById('menu-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2.5 text-xs sm:text-sm font-extrabold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                সকল খাবার ও মেনু দেখুন →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
