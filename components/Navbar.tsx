'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Globe, Shield, Receipt } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BenapoleLogo } from './BrandLogos';
import { getCustomerOrders } from '@/lib/customerOrders';

export function Navbar({
  onSearchClick,
  onOrdersClick,
}: {
  onSearchClick?: () => void;
  onOrdersClick?: () => void;
}) {
  const { lang, setLang, t, cartCount, setIsCartOpen, setIsAdminOpen, theme, settings } = useApp();
  const [savedOrdersCount, setSavedOrdersCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      setSavedOrdersCount(getCustomerOrders().length);
    };
    const timer = setTimeout(updateCount, 0);
    window.addEventListener('benapole_orders_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('benapole_orders_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-stone-200/90 shadow-2xs transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Zone 1: Brand Wordmark & Logo */}
        <div className="flex items-center gap-2 min-w-0">
          <a href="#" className="flex items-center gap-2 group min-w-0">
            <BenapoleLogo className="h-9 sm:h-12 w-auto shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-black text-sm sm:text-xl leading-tight text-[#0B5D3B] tracking-tight truncate">
                {t(settings.restaurantName, 'বেনাপোল স্পেশাল')}
              </span>
              <span className="text-[10px] sm:text-xs text-[#F7931E] font-bold leading-none truncate hidden xs:inline mt-0.5">
                {lang === 'bn' ? 'খাঁটি মিষ্টি দই ও ফাস্টফুড' : 'Special Sweets & Fast Food'}
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links & Utility Controls */}
        <nav className="flex items-center gap-1 sm:gap-3 shrink-0">
          <a
            href="#menu-section"
            className="hidden md:inline-block text-xs uppercase tracking-wider font-bold text-stone-700 hover:text-[#0B5D3B] transition-colors py-1.5 px-2.5"
          >
            {lang === 'bn' ? 'মেনু খাবার' : 'Menu Items'}
          </a>
          <a
            href="#offers-section"
            className="hidden md:inline-block text-xs uppercase tracking-wider font-bold text-stone-700 hover:text-[#0B5D3B] transition-colors py-1.5 px-2.5"
          >
            {lang === 'bn' ? 'অফার ও ছাড়' : 'Offers'}
          </a>
          <a
            href="#about-section"
            className="hidden md:inline-block text-xs uppercase tracking-wider font-bold text-stone-700 hover:text-[#0B5D3B] transition-colors py-1.5 px-2.5"
          >
            {lang === 'bn' ? 'আমাদের গল্প' : 'About Us'}
          </a>

          {/* Search Trigger */}
          {theme.sections.header.showSearch && (
            <button
              onClick={onSearchClick}
              className="p-1.5 sm:p-2.5 text-stone-700 hover:text-[#0B5D3B] hover:bg-stone-100 rounded-2xl transition-colors flex items-center justify-center min-w-[36px] min-h-[36px] cursor-pointer"
              aria-label="খাবার অনুসন্ধান করুন"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          {/* Language Switcher */}
          {theme.sections.header.showLanguageSwitch && (
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-2xl border-2 border-stone-300 text-stone-800 hover:border-[#0B5D3B] hover:text-[#0B5D3B] transition-colors bg-stone-50 cursor-pointer shadow-2xs"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0B5D3B]" />
              <span>{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>
          )}

          {/* Admin portal shortcut */}
          <button
            onClick={() => setIsAdminOpen(true)}
            className="p-1.5 sm:p-2.5 text-stone-500 hover:text-[#0B5D3B] hover:bg-stone-100 rounded-2xl transition-colors cursor-pointer"
            title="Admin Login & Visual Customizer"
            aria-label="Admin Portal"
          >
            <Shield className="w-4 h-4" />
          </button>
        </nav>

        {/* Zone 3: Primary Actions (Desktop/Tablet: My Orders + Cart Drawer. Mobile uses BottomNav) */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          {/* My Orders Button */}
          <button
            onClick={onOrdersClick}
            className="relative flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0B5D3B] border-2 border-emerald-300/80 active:scale-95 text-xs sm:text-sm font-extrabold px-2.5 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl shadow-2xs transition-all cursor-pointer"
            aria-label="আমার অর্ডার ও ট্র্যাকিং"
            title={lang === 'bn' ? 'আমার অর্ডার ও লাইভ ট্র্যাকিং' : 'My Orders & Live Tracking'}
          >
            <Receipt className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#0B5D3B] shrink-0" />
            <span className="hidden xs:inline">{lang === 'bn' ? 'আমার অর্ডার' : 'My Orders'}</span>
            <span className="xs:hidden">{lang === 'bn' ? 'অর্ডার' : 'Orders'}</span>
            {savedOrdersCount > 0 && (
              <span className="bg-[#0B5D3B] text-white text-[10px] sm:text-xs font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-xs">
                {savedOrdersCount}
              </span>
            )}
          </button>

          {/* Cart Drawer Trigger with Total Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-md shadow-emerald-900/15 transition-all cursor-pointer"
            aria-label="View shopping cart"
          >
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#F4D05F]" />
            <span className="hidden xs:inline">{lang === 'bn' ? 'কার্ট' : 'Cart'}</span>
            {cartCount > 0 && (
              <span className="bg-[#F7931E] text-white text-xs font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
