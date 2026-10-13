'use client';

import React from 'react';
import {
  MapPin,
  Clock,
  PhoneCall,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Bike,
  HeartHandshake,
  Code2,
  MessageCircle,
  CheckCircle2,
  Navigation,
  Compass,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function AboutAndContact() {
  const { lang, t, settings, theme } = useApp();
  const about = theme.sections.about;
  const gallery = theme.sections.gallery;

  return (
    <div id="about-section" className="space-y-12 py-10 bg-white">
      {/* 1. Benefits Section */}
      {theme.sections.benefits.enabled && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-4">
              <div className="p-3 bg-[#0B5D3B] text-white rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5 text-[#F4D05F]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-stone-900">
                  {lang === 'bn' ? '১০০% খাঁটি ও তাজা উপকরণ' : '100% Pure & Fresh Ingredients'}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'bn'
                    ? 'আসল মিষ্টি দই, পুষ্টিকর চিড়া ও সেরা ড্রাই ফ্রুটসের নিখাদ মিশ্রণ।'
                    : 'Natural sweet curd, soft flattened rice, and premium nuts.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-orange-50/60 border border-orange-100 flex items-start gap-4">
              <div className="p-3 bg-[#F7931E] text-white rounded-xl shadow-xs">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-stone-900">
                  {lang === 'bn' ? 'দ্রুততম সময়ে ডেলিভারি' : 'Fast Local Delivery'}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'bn'
                    ? 'বেনাপোল পৌরসভা ও আশপাশের এলাকায় গরম গরম খাবার পৌঁছে দেওয়া হয়।'
                    : 'Swift door-to-door delivery across Benapole town.'}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-start gap-4">
              <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-sm sm:text-base text-stone-900">
                  {lang === 'bn' ? 'স্বাস্থ্যসম্মত ও নিরাপদ' : 'Certified Hygienic Kitchen'}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'bn'
                    ? 'পরিষ্কার-পরিচ্ছন্ন পরিবেশে সর্বোচ্চ মান বজায় রেখে রান্না।'
                    : 'Prepared following top culinary hygiene standards.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Restaurant Story & Ambience */}
      {about.enabled && (
        <section className="max-w-6xl mx-auto px-4">
          <div className="bg-stone-50 rounded-3xl p-6 sm:p-10 border border-stone-200/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-[#0B5D3B] text-xs font-bold">
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'আমাদের ঐতিহ্যের অঙ্গীকার' : 'Our Culinary Heritage'}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                {t(about.title, 'বেনাপোল স্পেশাল-এর গল্প ও আতিথেয়তা')}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                {t(
                  about.story,
                  'বেনাপোল স্পেশাল শুরু হয়েছিল সাধারণ একটি ভালোবাসার স্বপ্ন থেকে—বেনাপোলের মানুষকে খাঁটি, স্বাস্থ্যকর এবং অতুলনীয় স্বাদের স্পেশাল দই চিড়া ও ফাস্টফুড উপহার দেওয়া। প্রতিটি বাটিতে আমরা দিই নিখাদ যত্ন আর আন্তরিকতা।'
                )}
              </p>

              <div className="space-y-2 pt-2">
                {about.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs text-stone-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B5D3B] shrink-0" />
                    <span>{t(feat)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-stone-200">
                <img
                  src={about.image || '/images/restaurant_interior.jpg'}
                  alt="Benapole Special Restaurant Ambience"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/restaurant_dining_interior_1791652815079.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                  <span className="text-white text-xs font-bold">
                    {lang === 'bn' ? 'পরিবার ও বন্ধুদের সাথে বসার মনোরম পরিবেশ' : 'Warm ambience for dining with friends & family'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Photo Gallery */}
      {gallery.enabled && (
        <section className="max-w-6xl mx-auto px-4">
          <h2 className="text-lg sm:text-xl font-black text-stone-900 mb-4">
            {t(gallery.title, 'রেস্টুরেন্টের ফটো গ্যালারি')}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {gallery.images.map((imgSrc, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200 group relative shadow-2xs"
              >
                <img
                  src={imgSrc}
                  alt={`Gallery moment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Contact & Location Details */}
      <section id="contact-section" className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#0B5D3B] to-[#08482E] rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Location */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#F4D05F] text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-4 h-4" />
                <span>{lang === 'bn' ? 'রেস্টুরেন্টের ঠিকানা' : 'Address'}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-100 leading-relaxed">
                {t(settings.address)}
              </p>
              <div className="pt-1 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-black bg-white/15 px-2.5 py-0.5 rounded-lg text-[#F4D05F] border border-[#F4D05F]/40 shadow-2xs">
                  প্লাস কোড: 2WW3+FG7 Benapole
                </span>
                <a
                  href={settings.mapUrl || 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac'}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F4D05F] hover:underline font-bold"
                >
                  <span>{lang === 'bn' ? 'ম্যাপে ওপেন করুন' : 'Open Map'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#F4D05F] text-xs font-bold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                <span>{lang === 'bn' ? 'খোলার সময়' : 'Opening Hours'}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-100 leading-relaxed">
                {t(settings.openingHours)}
              </p>
              <div suppressHydrationWarning className="inline-block bg-white/10 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-200">
                {settings.isOpen
                  ? lang === 'bn'
                    ? '🟢 এখন অর্ডার নেওয়া হচ্ছে'
                    : '🟢 Open Now • Taking Orders'
                  : '🔴 বর্তমানে বন্ধ'}
              </div>
            </div>

            {/* Call to Order */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#F4D05F] text-xs font-bold uppercase tracking-wider">
                <PhoneCall className="w-4 h-4" />
                <span>{lang === 'bn' ? 'ফোন ও অর্ডার হটলাইন' : 'Hotline'}</span>
              </div>
              <p className="text-xs text-stone-200">
                {lang === 'bn' ? 'সরাসরি রেস্টুরেন্টে কথা বলতে কল করুন:' : 'Call directly for inquiries:'}
              </p>
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 bg-[#F7931E] hover:bg-[#E58210] active:scale-95 text-white font-extrabold text-sm sm:text-base px-5 py-3 rounded-xl shadow-md transition-all"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </div>

          {/* Interactive Live Map Card with Google Maps Integration */}
          <div className="mt-8 pt-6 border-t border-white/15 relative z-10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <h4 className="font-extrabold text-sm sm:text-base text-white">
                    {lang === 'bn' ? 'ম্যাপে রেস্টুরেন্টের লোকেশন (Live Map Location)' : 'Live Map Location'}
                  </h4>
                </div>
                <p className="text-xs text-stone-200 mt-0.5">
                  {lang === 'bn'
                    ? 'বেনাপোল নিত্য হাট (মেয়র মার্কেট) • গুগল প্লাস কোড: 2WW3+FG7 Benapole'
                    : 'Benapole Nitya Haat (Mayor Market) • Google Plus Code: 2WW3+FG7 Benapole'}
                </p>
              </div>

              <a
                href={settings.mapUrl || 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#F7931E] hover:bg-[#E58210] active:scale-95 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4 text-white" />
                <span>{lang === 'bn' ? 'গুগল ম্যাপে ডিরেকশন ও রুট দেখুন' : 'Get Directions on Google Maps'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Embedded Map Container */}
            <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden border-2 border-white/20 shadow-inner bg-stone-900 group">
              <iframe
                title="Benapole Special Restaurant Location"
                width="100%"
                height="100%"
                className="border-0 w-full h-full filter saturate-110"
                loading="lazy"
                allowFullScreen
                src="https://www.openstreetmap.org/export/embed.html?bbox=88.892%2C23.040%2C88.915%2C23.052&layer=mapnik&marker=23.046345%2C88.903870"
              />

              {/* Live Overlay Pin Card */}
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-stone-900 px-3.5 py-2.5 rounded-xl shadow-lg border border-stone-200/80 max-w-[280px] pointer-events-none">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
                  <span className="font-extrabold text-xs text-stone-900 leading-tight">
                    বেনাপোল স্পেশাল (দই চিড়া)
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#0B5D3B]">
                  <span>2WW3+FG7 Benapole</span>
                </div>
              </div>

              {/* Bottom Quick-Tap Open in App Banner */}
              <a
                href={settings.mapUrl || 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac'}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 bg-stone-900/90 hover:bg-stone-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5 transition-all border border-white/20"
              >
                <span>গুগল ম্যাপে সরাসরি খুলুন</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#F4D05F]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Web Developer Profile & Hire Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 sm:p-8 border border-stone-700/80 shadow-2xl">
          {/* Subtle decorative background glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F7931E]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Developer Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'ওয়েব ডেভেলপার পরিচিতি' : 'Web Developer Portfolio'}</span>
              </div>

              <div>
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-linear-to-tr from-[#0B5D3B] via-emerald-600 to-[#F7931E] flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-emerald-950/60 ring-2 ring-emerald-400/30">
                    লি
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 flex-wrap">
                      <span>{lang === 'bn' ? 'লিমন ইসলাম' : 'Limon Islam'}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-[11px] font-extrabold text-emerald-300 border border-emerald-500/40">
                        ওয়েব ডেভেলপার
                      </span>
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 font-medium">
                      {lang === 'bn'
                        ? 'প্রফেশনাল ওয়েব ও মোবাইল অ্যাপ্লিকেশন ডেভেলপার'
                        : 'Professional Full-Stack Web & App Developer'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-stone-800/70 p-4 sm:p-5 rounded-2xl border border-stone-700/70 space-y-2">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed">
                  {lang === 'bn'
                    ? 'এই আধুনিক ও সম্পূর্ণ ফুড অর্ডারিং ওয়েবসাইটটি তৈরি করেছেন লিমন ইসলাম। আপনি কি আপনার রেস্টুরেন্ট, দোকান, ই-কমার্স বা যেকোনো ব্যবসায়ের জন্য আকর্ষণীয়, দ্রুতগতির ও মোবাইল-বান্ধব ওয়েবসাইট তৈরি করতে চান?'
                    : 'This full-featured online food ordering website was developed by Limon Islam. Want a high-performance, modern, mobile-friendly website or web app for your own business?'}
                </p>
                <p className="text-xs font-bold text-[#F4D05F]">
                  {lang === 'bn'
                    ? '⚡ আজই সরাসরি যোগাযোগ করুন এবং বানিয়ে নিন আপনার স্বপ্নের ওয়েবসাইট!'
                    : '⚡ Connect today to build your custom website!'}
                </p>
              </div>

              {/* Badges / What Limon offers */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-stone-300">
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-2 rounded-xl border border-stone-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'bn' ? 'ফুড ও রেস্টুরেন্ট সাইট' : 'Restaurant Websites'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-2 rounded-xl border border-stone-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'bn' ? '১০০% মোবাইল রেসপনসিভ' : 'Mobile Responsive'}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-stone-800/80 px-3 py-2 rounded-xl border border-stone-700/50">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{lang === 'bn' ? 'বিকাশ/নগদ পেমেন্ট' : 'bKash / Nagad Payment'}</span>
                </div>
              </div>
            </div>

            {/* Direct Contact & WhatsApp CTAs */}
            <div className="lg:col-span-5 bg-stone-800/90 rounded-3xl p-5 sm:p-6 border border-stone-700 space-y-4 shadow-xl">
              <div>
                <p className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'ওয়েবসাইট অর্ডার করতে যোগাযোগ' : 'Contact For Web Projects'}</span>
                </p>
                <p className="text-sm font-black text-stone-100 mt-1">
                  {lang === 'bn'
                    ? 'হোয়াটসঅ্যাপ বা সরাসরি কলে যোগাযোগ করুন:'
                    : 'Direct WhatsApp & Phone Consultation:'}
                </p>
              </div>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/8801878777341?text=%E0%A6%86%E0%A6%B8%E0%A6%B8%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%AE%E0%A7%81%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%95%E0%A7%81%E0%A6%AE%20%E0%A6%B2%E0%A6%BF%E0%A6%AE%E0%A6%A8%20%E0%A6%AD%E0%A6%BE%E0%A6%8F%2C%20%E0%A6%86%E0%A6%AE%E0%A6%BF%20%E0%A6%8F%E0%A6%95%E0%A6%9F%E0%A6%BF%20%E0%A6%93%E0%A7%9F%E0%A7%87%E0%A6%AC%E0%A6%B8%E0%A6%BE%E0%A6%87%E0%A6%9F%20%E0%A6%AC%E0%A6%BE%E0%A6%A8%E0%A6%BE%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A7%A4"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-between gap-3 bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white px-4 py-3.5 rounded-2xl shadow-lg transition-all group font-bold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] text-emerald-100 font-medium">
                      {lang === 'bn' ? 'হোয়াটসঅ্যাপ মেসেজ দিন' : 'Message on WhatsApp'}
                    </p>
                    <p className="text-base font-extrabold tracking-wide text-white">01878777341</p>
                  </div>
                </div>
                <div className="bg-white/20 group-hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shrink-0">
                  {lang === 'bn' ? 'চ্যাট করুন 💬' : 'Chat'}
                </div>
              </a>

              {/* Direct Phone Call Button */}
              <a
                href="tel:01878777341"
                className="w-full flex items-center justify-between gap-3 bg-stone-700/80 hover:bg-stone-700 active:scale-98 text-white px-4 py-3 rounded-2xl border border-stone-600 transition-all font-semibold"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-stone-400">
                      {lang === 'bn' ? 'সরাসরি কল করতে ট্যাপ করুন' : 'Direct Phone Call'}
                    </p>
                    <p className="text-sm font-bold text-stone-100">01878777341</p>
                  </div>
                </div>
                <span className="text-xs text-stone-200 font-bold bg-stone-600/70 px-3 py-1 rounded-lg">
                  {lang === 'bn' ? 'কল দিন' : 'Call'}
                </span>
              </a>

              <div className="pt-1 text-center">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{lang === 'bn' ? 'নতুন প্রজেক্টের জন্য যোগাযোগ করতে পারেন' : 'Available for new client projects'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-stone-200/80 pt-6 pb-24 md:pb-8 text-center text-xs text-stone-500 space-y-3">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>{t(theme.sections.footer.copyrightText)}</p>
          <div className="flex items-center gap-4 text-xs font-medium text-stone-600">
            <a href="#menu-section" className="hover:text-[#0B5D3B]">{lang === 'bn' ? 'মেনু' : 'Menu'}</a>
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-[#0B5D3B]">
              Facebook
            </a>
            <a href={settings.mapUrl} target="_blank" rel="noreferrer" className="hover:text-[#0B5D3B]">
              Google Map
            </a>
          </div>
        </div>

        {/* Developer Attribution strip */}
        <div className="max-w-6xl mx-auto px-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-center gap-2 text-xs text-stone-600">
          <span>{lang === 'bn' ? 'ওয়েবসাইট তৈরি করেছেন:' : 'Website Developed by:'}</span>
          <a
            href="https://wa.me/8801878777341?text=%E0%A6%86%E0%A6%B8%E0%A6%B8%E0%A6%BE%E0%A6%B2%E0%A6%BE%E0%A6%AE%E0%A7%81%20%E0%A6%86%E0%A6%B2%E0%A6%BE%E0%A6%87%E0%A6%95%E0%A7%81%E0%A6%AE%20%E0%A6%B2%E0%A6%BF%E0%A6%AE%E0%A6%A8%20%E0%A6%AD%E0%A6%BE%E0%A6%8F%2C%20%E0%A6%86%E0%A6%AE%E0%A6%BF%20%E0%A6%8F%E0%A6%95%E0%A6%9F%E0%A6%BF%20%E0%A6%93%E0%A7%9F%E0%A7%87%E0%A6%AC%E0%A6%B8%E0%A6%BE%E0%A6%87%E0%A6%9F%20%E0%A6%AC%E0%A6%BE%E0%A6%A8%E0%A6%BE%E0%A6%A4%E0%A7%87%20%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A7%A4"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[#0B5D3B] hover:text-[#08482E] hover:underline inline-flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60"
          >
            <span>লিমন ইসলাম (ওয়েব ডেভেলপার)</span>
            <span className="text-stone-300">|</span>
            <span className="text-[#25D366] font-bold">WhatsApp: 01878777341</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
