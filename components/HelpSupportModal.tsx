'use client';

import React from 'react';
import {
  X,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Clock,
  MapPin,
  Receipt,
  Bike,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';

export function HelpSupportModal({
  isOpen,
  onClose,
  onOpenTrack,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrack?: () => void;
}) {
  const { lang, settings, setIsTrackingOpen } = useApp();

  if (!isOpen) return null;

  const openStatus = checkRestaurantOpenStatus(settings);
  const phoneNumber = settings.phone || '+8801700000000';
  const whatsappRaw = settings.whatsapp || settings.phone || '8801700000000';
  const whatsappNumber = whatsappRaw.replace(/\D/g, '') || '8801700000000';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    'আসসালামু আলাইকুম, বেনাপোল স্পেশাল রেস্টুরেন্ট থেকে খাবার অর্ডার বিষয়ে জানতে চাই।'
  )}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 pb-16 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90vh] animate-in slide-in-from-bottom-8 duration-300 border border-stone-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 bg-emerald-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0B5D3B] text-white flex items-center justify-center shadow-xs">
              <HelpCircle className="w-5 h-5 text-[#F4D05F]" />
            </div>
            <div>
              <h2 className="font-black text-base sm:text-lg text-stone-900 leading-tight">
                {lang === 'bn' ? 'কাস্টমার সাপোর্ট ও হেল্প সেন্টার' : 'Customer Support & Help'}
              </h2>
              <p className="text-xs text-stone-500 font-medium">
                {lang === 'bn' ? 'বেনাপোল স্পেশাল সহায়তায় সবসময় প্রস্তুত' : 'We are here to assist you 24/7'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Restaurant Status Pill */}
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#0B5D3B]" />
              <span className="text-xs sm:text-sm font-bold text-stone-800">
                {openStatus.canAcceptOrders
                  ? lang === 'bn'
                    ? '🟢 রেস্টুরেন্ট এখন খোলা আছে'
                    : '🟢 Restaurant is Open'
                  : lang === 'bn'
                  ? '🕒 রেস্টুরেন্ট সাময়িক বন্ধ'
                  : '🕒 Restaurant is Closed'}
              </span>
            </div>
            <span className="text-xs font-black text-[#0B5D3B] bg-emerald-100/70 px-2.5 py-1 rounded-full">
              {openStatus.openingTimeFormatted} - {openStatus.closingTimeFormatted}
            </span>
          </div>

          {/* Quick Action Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Phone Call Button */}
            <a
              href={`tel:${phoneNumber}`}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all active:scale-98"
            >
              <div className="p-2 bg-white/20 rounded-xl">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-xs text-emerald-100 font-normal">সরাসরি কল করুন</span>
                <span className="text-sm font-black">{phoneNumber}</span>
              </div>
            </a>

            {/* WhatsApp Chat Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-black text-sm shadow-md transition-all active:scale-98"
            >
              <div className="p-2 bg-white/20 rounded-xl">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-xs text-emerald-50 font-normal">হোয়াটসঅ্যাপ চ্যাট</span>
                <span className="text-sm font-black">ম্যাসেজ দিন</span>
              </div>
            </a>
          </div>

          {/* Order Tracking Shortcut */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-black text-stone-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#0B5D3B]" />
                <span>আমার অর্ডার কোথায় জানুন</span>
              </span>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenTrack) {
                    onOpenTrack();
                  } else {
                    setIsTrackingOpen(true);
                  }
                }}
                className="text-xs font-black text-[#0B5D3B] hover:underline flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-stone-200"
              >
                <span>অর্ডার ট্র্যাক করুন →</span>
              </button>
            </div>
            <p className="text-xs text-stone-600">
              অর্ডার করার পর ফোন নম্বর দিয়ে আপনার খাবারের লাইভ প্রস্তুতি ও রাইডারের ডেলিভারি অবস্থান ট্র্যাক করতে পারবেন।
            </p>
          </div>

          {/* Important Delivery Information */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-stone-700 uppercase tracking-wider">
              {lang === 'bn' ? 'ডেলিভারি ও সেবা সম্পর্কিত তথ্য' : 'Delivery Highlights'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-700 font-medium">
              <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#0B5D3B] shrink-0" />
                <span>১৫-২৫ মিনিটে দ্রুততম হোম ডেলিভারি</span>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F7931E] shrink-0" />
                <span>ক্যাশ অন ডেলিভারি ও বিকাশ গ্রহণ</span>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                <span>বর্তমানে কেবল বেনাপোল ও আশেপাশের এলাকায় প্রযোজ্য</span>
              </div>
              <div className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-600 shrink-0" />
                <span>সকাল ১০টা থেকে রাত ১১টা পর্যন্ত খোলা</span>
              </div>
            </div>
          </div>

          {/* Restaurant Location */}
          <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#0B5D3B] shrink-0" />
              <span className="font-bold text-stone-800">বেনাপোল পৌরসভা ও বাজার এলাকা, যশোর</span>
            </div>
            <a
              href="https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0B5D3B] font-black underline flex items-center gap-1 shrink-0 ml-2"
            >
              <span>ম্যাপ দেখুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-stone-50 border-t border-stone-200 text-center shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-bold text-xs sm:text-sm cursor-pointer transition-colors"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
