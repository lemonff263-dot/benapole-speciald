'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Sparkles, Clock, CheckCircle2, Bike, Flame, Star, ShieldCheck, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '@/context/AppContext';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';
import { defaultReviews } from '@/lib/constants';

export function HeroBanner({
  onOrderNowClick,
  onTrackOrderClick,
}: {
  onOrderNowClick: () => void;
  onTrackOrderClick?: () => void;
}) {
  const { lang, t, theme, settings, foods, setSelectedFoodForModal } = useApp();
  const hero = theme.sections.hero;

  const openStatus = checkRestaurantOpenStatus(settings);
  const signatureFood = foods.find((f) => f.id === 'doi-chira-signature') || foods[0];

  // Load genuine reviews from localStorage
  const [realReviews, setRealReviews] = useState<any[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('benapole_customer_reviews');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const valid = parsed.filter((p) => p && p.id && !p.id.startsWith('rev_'));
          setRealReviews(valid);
        }
      }
    } catch {
      // non-blocking
    }
  }, []);

  const avgRatingNum = realReviews.length > 0
    ? realReviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0) / realReviews.length
    : 0;
  const toBnDigits = (str: string) =>
    str
      .replace(/0/g, '০')
      .replace(/1/g, '১')
      .replace(/2/g, '২')
      .replace(/3/g, '৩')
      .replace(/4/g, '৪')
      .replace(/5/g, '৫')
      .replace(/6/g, '৬')
      .replace(/7/g, '৭')
      .replace(/8/g, '৮')
      .replace(/9/g, '৯');
  const avgRatingDisplay = lang === 'bn' ? toBnDigits(avgRatingNum > 0 ? avgRatingNum.toFixed(1) : '০.০') : (avgRatingNum > 0 ? avgRatingNum.toFixed(1) : '0.0');

  // Live rotating food review ticker (changes randomly every 1 second across foods or real reviews)
  const [tickerIndex, setTickerIndex] = useState(0);

  const reviewPool = useMemo(() => {
    if (!foods || foods.length === 0) return [];

    return foods.map((f) => {
      const matched = realReviews.find(
        (r) =>
          r.foodName?.toLowerCase().includes(f.name.bn.toLowerCase()) ||
          r.foodName?.toLowerCase().includes(f.name.en.toLowerCase())
      );
      return {
        food: f,
        rating: matched ? matched.rating : 0,
        ratingText: matched ? (lang === 'bn' ? `${toBnDigits(matched.rating.toString())}.০` : `${matched.rating}.0`) : (lang === 'bn' ? 'তাজা' : 'Fresh'),
        quote: matched ? matched.comment : (lang === 'bn' ? '১০০% খাঁটি ও তাজা উপকরণে প্রস্তুত' : 'Made with 100% pure & fresh ingredients'),
      };
    });
  }, [foods, realReviews, lang]);

  useEffect(() => {
    if (reviewPool.length <= 1) return;
    const interval = setInterval(() => {
      setTickerIndex((prev) => {
        let next = Math.floor(Math.random() * reviewPool.length);
        if (next === prev && reviewPool.length > 1) {
          next = (prev + 1) % reviewPool.length;
        }
        return next;
      });
    }, 1000); // 1-second interval

    return () => clearInterval(interval);
  }, [reviewPool.length]);

  if (!hero.enabled) return null;

  const currentReviewedItem = reviewPool[tickerIndex] || reviewPool[0];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FFFDF7] via-[#FFF9EE] to-[#F7F5EE] border-b border-stone-200/80 pt-6 pb-10 sm:py-16">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-0 w-80 sm:w-96 h-80 sm:h-96 bg-[#0B5D3B]/8 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-72 sm:w-80 h-72 sm:h-80 bg-[#F7931E]/8 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column: Mobile-first Headlines & Call to Action */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-4 sm:space-y-6">
            {/* Top Restaurant Status & Rating Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div
                suppressHydrationWarning
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-extrabold shadow-2xs border ${
                  openStatus.canAcceptOrders
                    ? 'bg-emerald-50 border-emerald-300 text-[#0B5D3B]'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    openStatus.canAcceptOrders ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                <span suppressHydrationWarning>
                  {openStatus.canAcceptOrders
                    ? lang === 'bn'
                      ? `🟢 এখন খোলা আছে (${openStatus.openingTimeFormatted} - ${openStatus.closingTimeFormatted})`
                      : `Open Now (${openStatus.openingTimeFormatted} - ${openStatus.closingTimeFormatted})`
                    : lang === 'bn'
                    ? `🕒 এখন বন্ধ (${openStatus.openingTimeFormatted} এ খুলবে)`
                    : `Closed Now`}
                </span>
              </div>

              <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm font-extrabold shadow-2xs">
                {realReviews.length > 0 ? (
                  <>
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>
                      {lang === 'bn'
                        ? `${avgRatingDisplay} স্টার (${toBnDigits(realReviews.length.toString())} রিভিউ)`
                        : `${avgRatingDisplay} Star (${realReviews.length} Reviews)`}
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{lang === 'bn' ? '১০০% খাঁটি ও স্বাস্থ্যকর' : '100% Pure & Hygienic'}</span>
                  </>
                )}
              </div>
            </div>

            {/* Main Headline (Prominent & Clear) */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-stone-900 tracking-tight leading-[1.2] text-balance">
              {t(hero.headline, 'বেনাপোল স্পেশাল দই চিড়া — এখন অনলাইনে সরাসরি ডেলিভারি!')}
            </h1>

            {/* Subtitle with High Readability */}
            <p className="text-sm sm:text-base lg:text-lg text-stone-700 leading-relaxed font-normal max-w-xl">
              {t(
                hero.subheading,
                'এক বাটিতে স্বাদে ঐতিহ্য, সেরা খাঁটি মিষ্টি দই আর প্রিমিয়াম বাদাম-কিশমিশ। বেনাপোলের যে কোনো প্রান্তে দ্রুততম সময়ে ফ্রেশ ও গরম খাবার পৌঁছে দেব আমরা!'
              )}
            </p>

            {/* Quick Benefits Strip (Large readable icons) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full pt-1">
              <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="p-1.5 rounded-xl bg-emerald-50 text-[#0B5D3B]">
                  <Bike className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                    {settings.estimatedDeliveryMinutes}
                  </span>
                  <span className="text-[11px] text-stone-500 font-medium">দ্রুত ডেলিভারি</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-2.5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="p-1.5 rounded-xl bg-orange-50 text-[#F7931E]">
                  <Flame className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black text-stone-900 block leading-tight">
                    ৳{settings.freeDeliveryThreshold}+
                  </span>
                  <span className="text-[11px] text-[#0B5D3B] font-bold">ফ্রি ডেলিভারি</span>
                </div>
              </div>

              {/* 3. Live 1-Second Random Food Review Animated Ticker Box (User Requested) */}
              <div
                onClick={() => {
                  if (currentReviewedItem?.food) {
                    setSelectedFoodForModal(currentReviewedItem.food);
                  }
                }}
                className="col-span-2 sm:col-span-1 bg-white hover:bg-emerald-50/50 p-2 sm:p-2.5 rounded-2xl border-2 border-amber-300/80 shadow-2xs hover:shadow-md transition-all cursor-pointer overflow-hidden min-h-[64px] flex items-center"
                title="খাবারটির রিভিউ দেখতে ক্লিক করুন"
              >
                <AnimatePresence mode="wait">
                  {currentReviewedItem && (
                    <motion.div
                      key={`${currentReviewedItem.food.id}-${tickerIndex}`}
                      initial={{ opacity: 0, y: 7, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -7, scale: 0.96 }}
                      transition={{ duration: 0.28, ease: 'easeOut' }}
                      className="flex items-center gap-2.5 w-full min-w-0"
                    >
                      {/* Square Food Image */}
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-stone-100 border border-amber-300 shrink-0 shadow-2xs">
                        <img
                          src={currentReviewedItem.food.image}
                          alt={currentReviewedItem.food.name.bn}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
                          }}
                        />
                      </div>

                      {/* Food Name, Star Rating & Review Quote */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-black text-stone-900 truncate leading-tight block">
                            {currentReviewedItem.food.name.bn}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black text-amber-900">
                              {currentReviewedItem.ratingText}
                            </span>
                          </div>
                        </div>

                        <p className="text-[10px] sm:text-[11px] text-stone-600 truncate italic font-medium mt-0.5">
                          "{currentReviewedItem.quote}"
                        </p>

                        <div className="flex items-center justify-between text-[9px] text-stone-500 font-bold mt-0.5">
                          <span className="text-[#0B5D3B] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>১ সেঃ লাইভ রিভিউ</span>
                          </span>
                          <span className="text-stone-400">ক্যাশ ও বিকাশ</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Action CTA Buttons (Big & Touch-Friendly) */}
            <div className="pt-2 flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onOrderNowClick}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-black text-sm sm:text-base px-6 py-4 rounded-2xl shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
              >
                <span>{t(hero.ctaText, 'অর্ডার করুন এখনই →')}</span>
                <ArrowRight className="w-5 h-5 text-[#F4D05F]" />
              </button>

              {onTrackOrderClick && (
                <button
                  onClick={onTrackOrderClick}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold text-[#0B5D3B] hover:text-[#08482E] bg-white hover:bg-emerald-50 border-2 border-[#0B5D3B]/40 hover:border-[#0B5D3B] px-6 py-4 rounded-2xl transition-all shadow-md cursor-pointer"
                >
                  <Receipt className="w-5 h-5 text-[#0B5D3B]" />
                  <span>{lang === 'bn' ? 'আমার অর্ডার' : 'My Orders'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Hero Visual Food Card */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              {/* Outer Decorative Gradient Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#F7931E]/25 to-[#0B5D3B]/25 rounded-3xl transform rotate-2 scale-98 filter blur-lg -z-10" />

              {/* Main Food Showcase Card */}
              <div className="relative bg-white rounded-3xl p-3.5 sm:p-5 shadow-2xl border-2 border-stone-200/90 overflow-hidden">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-stone-100 group">
                  <img
                    src={hero.backgroundImage || '/images/doi_chira.jpg'}
                    alt="Benapole Special Doi Chira"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/doi_chira_hero_1791652770180.jpg';
                    }}
                  />

                  {/* Floating Price Tag */}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-lg border border-stone-200 flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-500 uppercase">{lang === 'bn' ? 'শুরু মাত্র' : 'From'}</span>
                    <span className="text-base sm:text-lg font-black text-[#0B5D3B]">৳৪০</span>
                  </div>

                  {/* Rating / Signature Dish Badge */}
                  <div className="absolute top-3 right-3 bg-[#0B5D3B] text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-black shadow-md flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-[#F4D05F] fill-[#F4D05F]" />
                    <span>৪.৯ (১২০+ রিভিউ)</span>
                  </div>
                </div>

                {/* Bottom Card Title & Quick Order Trigger */}
                <div className="mt-3.5 px-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-stone-900 text-base sm:text-lg">
                        {lang === 'bn' ? 'বেনাপোল স্পেশাল দই চিড়া' : 'Benapole Special Doi Chira'}
                      </h3>
                      <p className="text-xs text-stone-500 font-medium">
                        {lang === 'bn' ? 'খাঁটি মিষ্টি দই, মাওয়া, বেদানা ও পেস্তা বাদাম' : 'Pure Sweet Curd, Mawa, Pomegranate & Nuts'}
                      </p>
                    </div>
                  </div>

                  {signatureFood && (
                    <button
                      onClick={() => setSelectedFoodForModal(signatureFood)}
                      className="w-full bg-emerald-50 hover:bg-[#0B5D3B] text-[#0B5D3B] hover:text-white border border-emerald-300 hover:border-[#0B5D3B] font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                    >
                      <Sparkles className="w-4 h-4 text-[#F7931E]" />
                      <span>{lang === 'bn' ? 'বাটি সাইজ ও অপশন বেছে নিন (৳৪০ - ৳৮০)' : 'Customize & Order Bowl'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
