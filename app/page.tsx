'use client';

import React, { useState, useMemo } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { HeroBanner } from '@/components/HeroBanner';
import { CategoryBar } from '@/components/CategoryBar';
import { FoodCard } from '@/components/FoodCard';
import { FoodDetailModal } from '@/components/FoodDetailModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { TrackOrderModal } from '@/components/TrackOrderModal';
import { OffersSection } from '@/components/OffersSection';
import { AboutAndContact } from '@/components/AboutAndContact';
import { BottomNav } from '@/components/BottomNav';
import { CustomerReviews } from '@/components/CustomerReviews';
import { HelpSupportModal } from '@/components/HelpSupportModal';
import { WelcomeEntranceModal } from '@/components/WelcomeEntranceModal';
import { AdminLoginModal } from '@/components/admin/AdminLoginModal';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { VisualWebsiteCustomizer } from '@/components/admin/VisualWebsiteCustomizer';
import { Search, X, Sparkles, AlertCircle } from 'lucide-react';
import { Order } from '@/lib/types';

function RestaurantApp() {
  const {
    foods,
    categories,
    lang,
    t,
    theme,
    isAdminOpen,
    setIsAdminOpen,
    isCustomizerOpen,
    setIsCustomizerOpen,
    refreshMenuData,
    cartCount,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    isCheckoutOpen,
    isTrackingOpen,
    setIsTrackingOpen,
    selectedFoodForModal,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBottomNavTab, setActiveBottomNavTab] = useState('home');

  // Order success & tracking state
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [trackingTargetId, setTrackingTargetId] = useState<string | null>(null);
  const [trackingTargetToken, setTrackingTargetToken] = useState<string | null>(null);

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Auto-login admin if remembered on device
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isRemembered = localStorage.getItem('bs_admin_remember_me') === 'true';
      const token = localStorage.getItem('bs_admin_token');
      if (isRemembered && token) {
        setIsAdminAuthenticated(true);
      }
    }
  }, [isAdminOpen]);

  // Filter foods by selected category
  const filteredFoods = useMemo(() => {
    let list = foods;
    if (selectedCategory !== 'all') {
      list = list.filter((f) => f.categoryId === selectedCategory);
    }
    return list;
  }, [foods, selectedCategory]);

  // Search filtered foods
  const searchedFoods = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return foods.filter(
      (f) =>
        f.name.bn.toLowerCase().includes(q) ||
        f.name.en.toLowerCase().includes(q) ||
        f.description.bn.toLowerCase().includes(q) ||
        f.description.en.toLowerCase().includes(q)
    );
  }, [foods, searchQuery]);

  const handleOrderSuccess = (newOrder: Order) => {
    setCompletedOrder(newOrder);
  };

  const handleOpenTrackingFromSuccess = (orderId: string, token: string) => {
    setCompletedOrder(null);
    setTrackingTargetId(orderId);
    setTrackingTargetToken(token);
    setIsTrackingOpen(true);
  };

  return (
    <div
      className="min-h-screen bg-[#FFFDF7] text-stone-900 font-sans selection:bg-[#F7931E]/20 pb-24 md:pb-0 overflow-x-hidden w-full max-w-full"
      style={{
        backgroundColor: theme.colors.background || '#FFFDF7',
        color: theme.colors.textPrimary || '#1F2937',
      }}
    >
      {/* 1. Header Navigation */}
      <Navbar
        onSearchClick={() => setSearchOverlayOpen(true)}
        onOrdersClick={() => {
          setTrackingTargetId(null);
          setTrackingTargetToken(null);
          setIsTrackingOpen(true);
        }}
      />

      {/* 2. Hero Banner Showcase */}
      <HeroBanner
        onOrderNowClick={() => {
          const menuSection = document.getElementById('menu-section');
          if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
        }}
        onTrackOrderClick={() => {
          setTrackingTargetId(null);
          setTrackingTargetToken(null);
          setIsTrackingOpen(true);
        }}
      />

      {/* 3. Category Bar Navigation */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 4. Food Menu Section */}
      <main id="menu-section" className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Section Headline */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 border-b-2 border-stone-200/90 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-black text-[#0B5D3B] uppercase tracking-wider mb-1.5">
              <Sparkles className="w-4 h-4 text-[#F7931E]" />
              <span>
                {selectedCategory === 'all'
                  ? lang === 'bn'
                    ? 'তাজা ও গরম খাবারের স্পেশাল সমাহার'
                    : 'Fresh Culinary Delights'
                  : categories.find((c) => c.id === selectedCategory)?.name[lang] || 'খাবার'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              {selectedCategory === 'all'
                ? t(theme.sections.featuredFoods.title, 'জনপ্রিয় ও স্পেশাল খাবার')
                : categories.find((c) => c.id === selectedCategory)?.name[lang]}
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-stone-600 font-bold bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 self-start sm:self-auto">
            {lang === 'bn'
              ? `🔥 ${filteredFoods.length}টি সুস্বাদু খাবার তৈরি আছে`
              : `${filteredFoods.length} delicious items available`}
          </span>
        </div>

        {/* Food Items Responsive Grid (Mobile-First: 1 col on small phones, 2 on phablet, 3-4 on tablet/desktop) */}
        {filteredFoods.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border-2 border-stone-200 text-stone-500 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-stone-400" />
            <p className="font-extrabold text-base text-stone-700">
              {lang === 'bn' ? 'এই ক্যাটাগরিতে বর্তমানে কোনো খাবার নেই' : 'No items found in this category'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </main>

      {/* 5. Offers Section */}
      <OffersSection />

      {/* 5.5 Customer Reviews & Ratings Section (Verified Feedback) */}
      <CustomerReviews />

      {/* 6. About Us, Interior, Location & Contact */}
      <AboutAndContact />

      {/* 6.5 Floating Quick Cart & Checkout Bar for Mobile */}
      {cartCount > 0 && !isCartOpen && !selectedFoodForModal && !isCheckoutOpen && !searchOverlayOpen && (
        <aside aria-label="Quick cart" className="md:hidden fixed bottom-18 left-3 right-3 z-40 animate-in slide-in-from-bottom-3 duration-200">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-[#0B5D3B] hover:bg-[#08482E] text-white p-3 px-4 rounded-2xl shadow-xl shadow-emerald-950/25 flex items-center justify-between border border-emerald-600/40 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="bg-[#F7931E] text-white text-xs font-black px-2 py-0.5 rounded-full min-w-[22px] text-center shadow-xs">
                {cartCount}
              </span>
              <span className="font-extrabold text-xs sm:text-sm text-stone-100">
                {lang === 'bn' ? 'কার্টে খাবার যোগ হয়েছে' : 'Items in Cart'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-[#F4D05F]">৳{cartSubtotal}</span>
              <span className="text-xs font-black bg-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1">
                <span>{lang === 'bn' ? 'চেকআউট করুন' : 'Checkout'}</span>
                <span>→</span>
              </span>
            </div>
          </button>
        </aside>
      )}

      {/* 7. Mobile Sticky Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeBottomNavTab}
        setActiveTab={setActiveBottomNavTab}
        onOpenTrack={() => {
          setTrackingTargetId(null);
          setTrackingTargetToken(null);
          setIsTrackingOpen(true);
        }}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Search Overlay Modal */}
      {searchOverlayOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs p-4 flex flex-col items-center pt-16 animate-in fade-in duration-200">
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-5 space-y-4 max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <Search className="w-5 h-5 text-stone-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: দই চিড়া, চাউমিন, বার্গার...' : 'Search food items...'}
                className="w-full text-sm outline-hidden font-medium"
              />
              <button
                onClick={() => {
                  setSearchOverlayOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 hover:bg-stone-100 rounded-lg text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {searchQuery.trim() === '' ? (
                <p className="text-xs text-stone-400 text-center py-8">
                  {lang === 'bn' ? 'খাবারের নাম লিখে খুঁজুন...' : 'Type food name to search...'}
                </p>
              ) : searchedFoods.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-8">
                  {lang === 'bn' ? 'কোনো খাবার পাওয়া যায়নি।' : 'No matching food items found.'}
                </p>
              ) : (
                searchedFoods.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-stone-50 border border-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={f.image}
                        alt={f.name.en}
                        className="w-12 h-12 rounded-lg object-cover bg-stone-100"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
                        }}
                      />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-stone-900">{t(f.name)}</p>
                        <p className="text-[11px] text-[#0B5D3B] font-extrabold">৳{f.price}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSearchOverlayOpen(false);
                        const menuSection = document.getElementById('menu-section');
                        if (menuSection) menuSection.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 bg-[#0B5D3B] text-white rounded-lg text-xs font-bold"
                    >
                      দেখুন
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals & Overlays */}
      <FoodDetailModal />
      <CartDrawer />
      <CheckoutModal onOrderSuccess={handleOrderSuccess} />

      {completedOrder && (
        <OrderSuccessModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onTrackOrder={handleOpenTrackingFromSuccess}
        />
      )}

      <TrackOrderModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        initialOrderId={trackingTargetId}
        initialToken={trackingTargetToken}
      />

      {/* Dedicated Help & Customer Support Modal */}
      <HelpSupportModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        onOpenTrack={() => {
          setIsHelpModalOpen(false);
          setIsTrackingOpen(true);
        }}
      />

      {/* Eye-Catching Welcome Entrance Modal */}
      <WelcomeEntranceModal />

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminOpen && !isAdminAuthenticated}
        onClose={() => setIsAdminOpen(false)}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
        }}
      />

      {/* Admin Dashboard Overlay (when authenticated) */}
      {isAdminOpen && isAdminAuthenticated && (
        <div className="fixed inset-0 z-50 bg-stone-100 overflow-y-auto">
          <AdminDashboard
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onClose={() => setIsAdminOpen(false)}
            onLogout={() => {
              if (typeof window !== 'undefined') {
                localStorage.removeItem('bs_admin_remember_me');
                localStorage.removeItem('bs_admin_token');
              }
              setIsAdminAuthenticated(false);
              setIsAdminOpen(false);
            }}
          />
        </div>
      )}

      {/* Visual Website Customizer Workspace */}
      {isCustomizerOpen && (
        <VisualWebsiteCustomizer
          onClose={() => setIsCustomizerOpen(false)}
          onPublishSuccess={() => {
            refreshMenuData();
            setIsCustomizerOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <RestaurantApp />
    </AppProvider>
  );
}
