'use client';

import React from 'react';
import { Tag, Sparkles, Copy, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Offer } from '@/lib/types';

export function OffersSection() {
  const { lang, t, offers, theme } = useApp();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  if (!theme.sections.offers.enabled || offers.length === 0) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <section id="offers-section" className="py-8 bg-stone-50/60 border-b border-stone-200/60">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F7931E]/10 text-[#F7931E] rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-tight">
                {t(theme.sections.offers.title, 'আজকের বিশেষ অফার ও ছাড়')}
              </h2>
              <p className="text-xs text-stone-500">
                {lang === 'bn' ? 'কুপন কোড ব্যবহার করে অতিরিক্ত ডিসকাউন্ট নিন' : 'Apply promo codes at checkout'}
              </p>
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {offers.map((offer: Offer) => (
            <div
              key={offer.id}
              className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-[#F7931E]/50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F7931E] flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% ছাড়`
                        : `৳${offer.discountValue} ফ্ল্যাট ছাড়`}
                    </span>
                  </span>
                  <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-semibold">
                    মিন. ৳{offer.minOrder}
                  </span>
                </div>

                <h3 className="font-extrabold text-stone-900 text-sm sm:text-base leading-snug">
                  {t(offer.title)}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {t(offer.description)}
                </p>
              </div>

              {/* Code Box */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="bg-stone-50 border border-dashed border-stone-300 rounded-lg px-2.5 py-1">
                  <span className="font-mono font-black text-stone-800 text-xs tracking-wider">
                    {offer.code}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(offer.code)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 hover:bg-[#0B5D3B] text-[#0B5D3B] hover:text-white rounded-lg text-xs font-bold transition-all"
                >
                  {copiedCode === offer.code ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'কোড নিন' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
