'use client';

import React, { useState, useEffect } from 'react';
import { Home, Utensils, ShoppingBag, Receipt, PhoneCall } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getCustomerOrders } from '@/lib/customerOrders';

export function BottomNav({
  activeTab,
  setActiveTab,
  onOpenTrack,
  onOpenHelp,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTrack: () => void;
  onOpenHelp?: () => void;
}) {
  const {
    lang,
    cartCount,
    isCartOpen,
    setIsCartOpen,
    setSelectedFoodForModal,
    setIsCheckoutOpen,
    isTrackingOpen,
    setIsTrackingOpen,
  } = useApp();
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

  const closeAllOverlays = () => {
    setIsCartOpen(false);
    setSelectedFoodForModal(null);
    setIsCheckoutOpen(false);
    setIsTrackingOpen(false);
  };

  const navigateTo = (tab: string, scrollTargetId?: string) => {
    closeAllOverlays();
    setActiveTab(tab);
    if (scrollTargetId) {
      setTimeout(() => {
        const el = document.getElementById(scrollTargetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    } else {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 60);
    }
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-[100] bg-white/98 backdrop-blur-md border-t-2 border-stone-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.15)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {/* Home */}
        <button
          onClick={() => navigateTo('home')}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all cursor-pointer ${
            activeTab === 'home' ? 'text-[#0B5D3B] font-extrabold scale-105' : 'text-stone-600 hover:text-stone-900 font-semibold'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-xs leading-none">
            {lang === 'bn' ? 'হোম' : 'Home'}
          </span>
        </button>

        {/* Menu */}
        <button
          onClick={() => navigateTo('menu', 'menu-section')}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all cursor-pointer ${
            activeTab === 'menu' ? 'text-[#0B5D3B] font-extrabold scale-105' : 'text-stone-600 hover:text-stone-900 font-semibold'
          }`}
        >
          <Utensils className="w-5 h-5 mb-0.5" />
          <span className="text-xs leading-none">
            {lang === 'bn' ? 'মেনু' : 'Menu'}
          </span>
        </button>

        {/* Cart */}
        <button
          onClick={() => {
            setSelectedFoodForModal(null);
            setIsCheckoutOpen(false);
            setIsTrackingOpen(false);
            setIsCartOpen(!isCartOpen);
            setActiveTab('cart');
          }}
          className={`relative flex flex-col items-center justify-center min-h-[50px] py-1 transition-all cursor-pointer ${
            isCartOpen ? 'text-[#0B5D3B] font-extrabold scale-105' : 'text-stone-700 hover:text-[#0B5D3B]'
          }`}
        >
          <div className="relative">
            <div className={`p-1 rounded-full ${cartCount > 0 || isCartOpen ? 'bg-emerald-50 text-[#0B5D3B]' : ''}`}>
              <ShoppingBag className="w-5 h-5" />
            </div>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#F7931E] text-white text-[11px] font-black rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold leading-none mt-0.5">
            {lang === 'bn' ? 'কার্ট' : 'Cart'}
          </span>
        </button>

        {/* My Orders */}
        <button
          onClick={() => {
            closeAllOverlays();
            setActiveTab('orders');
            setIsTrackingOpen(true);
            onOpenTrack();
          }}
          className="relative flex flex-col items-center justify-center min-h-[50px] py-1 text-stone-700 hover:text-[#0B5D3B] transition-all cursor-pointer font-bold"
        >
          <div className="relative">
            <Receipt className="w-5 h-5 mb-0.5 text-[#0B5D3B]" />
            {savedOrdersCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-[#0B5D3B] text-white text-[10px] font-black rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-0.5 shadow-xs">
                {savedOrdersCount}
              </span>
            )}
          </div>
          <span className="text-xs leading-none">
            {lang === 'bn' ? 'আমার অর্ডার' : 'My Orders'}
          </span>
        </button>

        {/* Contact / Help */}
        <button
          onClick={() => {
            closeAllOverlays();
            setActiveTab('help');
            if (onOpenHelp) {
              onOpenHelp();
            } else {
              navigateTo('help', 'about-section');
            }
          }}
          className={`flex flex-col items-center justify-center min-h-[50px] py-1 transition-all cursor-pointer ${
            activeTab === 'help' ? 'text-[#0B5D3B] font-extrabold scale-105' : 'text-stone-600 hover:text-[#0B5D3B] font-semibold'
          }`}
        >
          <PhoneCall className="w-5 h-5 mb-0.5" />
          <span className="text-xs leading-none">
            {lang === 'bn' ? 'হেল্প' : 'Help'}
          </span>
        </button>
      </div>
    </nav>
  );
}
