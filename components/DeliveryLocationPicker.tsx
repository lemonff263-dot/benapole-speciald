'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  CheckCircle,
  ExternalLink,
  Building,
  Store,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { DeliveryArea } from '@/lib/types';
import { useApp } from '@/context/AppContext';

// Exact location for Benapole Special (Mayor Market / Nitya Haat) from Google Maps (2WW3+FG7 Benapole)
const BENAPOLE_CENTER = { lat: 23.046345, lng: 88.903870 };
const BENAPOLE_PLUS_CODE = '2WW3+FG7 Benapole';
const BENAPOLE_MAPS_URL = 'https://maps.app.goo.gl/XE34ykXBwjMPAH9L9?g_st=ac';

export interface LocationPickerValue {
  area: string;
  landmark: string;
  address: string;
  coordinates: { lat: number; lng: number };
  googleMapsUrl: string;
  deliveryFee: number;
}

export function DeliveryLocationPicker({
  deliveryAreas,
  value,
  onChange,
}: {
  deliveryAreas: DeliveryArea[];
  value: LocationPickerValue;
  onChange: (val: LocationPickerValue) => void;
}) {
  const { lang } = useApp();

  const [activeMode, setActiveMode] = useState<'map' | 'landmarks' | 'list'>('map');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Default coordinate if none provided
  const currentCoords = value.coordinates?.lat
    ? value.coordinates
    : BENAPOLE_CENTER;

  // Calculate distance in km from Benapole center
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const distanceKm = getDistanceKm(
    BENAPOLE_CENTER.lat,
    BENAPOLE_CENTER.lng,
    currentCoords.lat,
    currentCoords.lng
  );

  // Map coordinate to SVG percentage (bounding box roughly 23.025 to 23.085 N, 88.875 to 88.935 E)
  const minLat = 23.025;
  const maxLat = 23.085;
  const minLng = 88.875;
  const maxLng = 88.935;

  const getSvgPos = (lat: number, lng: number) => {
    const x = Math.max(5, Math.min(95, ((lng - minLng) / (maxLng - minLng)) * 100));
    // lat increases upwards, so y is inverted
    const y = Math.max(5, Math.min(95, (1 - (lat - minLat) / (maxLat - minLat)) * 100));
    return { x, y };
  };

  const pinPos = getSvgPos(currentCoords.lat, currentCoords.lng);

  // Handle clicking/tapping on interactive map
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    const clickX = Math.max(0.05, Math.min(0.95, (clientX - rect.left) / rect.width));
    const clickY = Math.max(0.05, Math.min(0.95, (clientY - rect.top) / rect.height));

    const newLng = Number((minLng + clickX * (maxLng - minLng)).toFixed(4));
    const newLat = Number((maxLat - clickY * (maxLat - minLat)).toFixed(4));

    // Find closest delivery area
    let closestArea = deliveryAreas[0];
    let minD = 9999;
    deliveryAreas.forEach((area) => {
      const areaLat = area.coordinates?.lat || BENAPOLE_CENTER.lat;
      const areaLng = area.coordinates?.lng || BENAPOLE_CENTER.lng;
      const dist = Math.hypot(newLat - areaLat, newLng - areaLng);
      if (dist < minD) {
        minD = dist;
        closestArea = area;
      }
    });

    const googleMapsUrl = `https://www.google.com/maps?q=${newLat},${newLng}`;
    const detectedLandmark = closestArea?.landmark ? closestArea.landmark.split(',')[0].trim() : 'চিহ্নিত স্থান';

    onChange({
      ...value,
      coordinates: { lat: newLat, lng: newLng },
      googleMapsUrl,
      area: closestArea ? (closestArea.name.bn || closestArea.name.en) : value.area,
      deliveryFee: closestArea?.fee !== undefined ? closestArea.fee : value.deliveryFee,
      landmark: detectedLandmark,
      address: value.address || `${detectedLandmark} সংলগ্ন`,
    });

    setGpsMessage({
      type: 'success',
      text: lang === 'bn' ? `📍 ম্যাপে লোকেশন চিহ্নিত হয়েছে: ${closestArea?.name?.bn || 'বেনাপোল'}` : `📍 Location pinned: ${closestArea?.name?.en || 'Benapole'}`,
    });
    setTimeout(() => setGpsMessage(null), 3500);
  };

  // Robust GPS Current Location Locator
  const handleGetLiveLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // Fallback to nearest area
      const fallbackArea = deliveryAreas[0] || { name: { bn: 'বেনাপোল পৌরসভা' }, fee: 40 };
      onChange({
        ...value,
        coordinates: BENAPOLE_CENTER,
        googleMapsUrl: `https://www.google.com/maps?q=${BENAPOLE_CENTER.lat},${BENAPOLE_CENTER.lng}`,
        area: fallbackArea.name.bn,
      });
      setGpsMessage({
        type: 'info',
        text: lang === 'bn'
          ? 'ব্রাউজারে জিপিএস পাওয়া যায়নি। বেনাপোল প্রধান কেন্দ্র সেট করা হয়েছে, নিচে পরিবর্তন করতে পারেন।'
          : 'GPS not found. Set to Benapole center, you can adjust below.',
      });
      return;
    }

    setGpsLoading(true);
    setGpsMessage(null);

    const applyCoords = (latitude: number, longitude: number) => {
      setGpsLoading(false);
      const lat = Number(latitude.toFixed(4));
      const lng = Number(longitude.toFixed(4));

      // Check closest area
      let matchedArea = deliveryAreas[0];
      let shortestDist = 9999;
      deliveryAreas.forEach((area) => {
        const aLat = area.coordinates?.lat || BENAPOLE_CENTER.lat;
        const aLng = area.coordinates?.lng || BENAPOLE_CENTER.lng;
        const dist = Math.hypot(lat - aLat, lng - aLng);
        if (dist < shortestDist) {
          shortestDist = dist;
          matchedArea = area;
        }
      });

      const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      const mainLandmark = matchedArea?.landmark ? matchedArea.landmark.split(',')[0].trim() : 'বর্তমান অবস্থান';

      onChange({
        ...value,
        coordinates: { lat, lng },
        googleMapsUrl,
        area: matchedArea ? matchedArea.name.bn : value.area,
        deliveryFee: matchedArea?.fee !== undefined ? matchedArea.fee : value.deliveryFee,
        landmark: mainLandmark,
        address:
          value.address ||
          (lang === 'bn' ? `${matchedArea.name.bn} (${mainLandmark} সংলগ্ন)` : `Near ${matchedArea.name.en}`),
      });

      setGpsMessage({
        type: 'success',
        text:
          lang === 'bn'
            ? `✅ বর্তমান লোকেশন সফলভাবে পাওয়া গেছে! (${matchedArea.name.bn})`
            : `✅ Current location acquired! (${matchedArea.name.en})`,
      });
      setTimeout(() => setGpsMessage(null), 4000);
    };

    // First try standard fast location (reliable on mobile network/Wi-Fi)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (fastErr) => {
        // If quick check failed, try with high accuracy fallback
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            applyCoords(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            setGpsLoading(false);
            // Automatic smart fallback: choose Benapole center and guide user
            const currentSelected = deliveryAreas.find(a => a.name.bn === value.area) || deliveryAreas[0];
            const fallbackLat = currentSelected?.coordinates?.lat || BENAPOLE_CENTER.lat;
            const fallbackLng = currentSelected?.coordinates?.lng || BENAPOLE_CENTER.lng;

            onChange({
              ...value,
              coordinates: { lat: fallbackLat, lng: fallbackLng },
              googleMapsUrl: `https://www.google.com/maps?q=${fallbackLat},${fallbackLng}`,
            });

            setGpsMessage({
              type: 'info',
              text:
                lang === 'bn'
                  ? '💡 ডিভাইসের জিপিএস বন্ধ বা পারমিশন নেই। নিচে ম্যাপে আঙুল দিয়ে টাচ করুন বা প্রিয় ল্যান্ডমার্কে চাপ দিন।'
                  : '💡 GPS signal unavailable. Tap anywhere on the map or choose a landmark below.',
            });
            setTimeout(() => setGpsMessage(null), 6000);
          },
          { enableHighAccuracy: true, timeout: 6000, maximumAge: 300000 }
        );
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  };

  // Landmark button clicked
  const handleSelectLandmark = (area: DeliveryArea) => {
    const lat = area.coordinates?.lat || BENAPOLE_CENTER.lat;
    const lng = area.coordinates?.lng || BENAPOLE_CENTER.lng;
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const mainLandmark = area.landmark ? area.landmark.split(',')[0].trim() : area.name.bn;

    onChange({
      ...value,
      area: area.name.bn || area.name.en,
      landmark: mainLandmark,
      deliveryFee: area.fee !== undefined ? area.fee : value.deliveryFee,
      coordinates: { lat, lng },
      googleMapsUrl,
      address: value.address ? value.address : `${mainLandmark} এর কাছে`,
    });

    setGpsMessage({
      type: 'success',
      text: lang === 'bn' ? `📍 নির্বাচিত হয়েছে: ${area.name.bn}` : `📍 Selected: ${area.name.en}`,
    });
    setTimeout(() => setGpsMessage(null), 3000);
  };

  return (
    <div className="space-y-4">
      {/* Selector Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2.5">
        <label className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2 tracking-tight">
          <MapPin className="w-5 h-5 text-[#0B5D3B] shrink-0" />
          <span>{lang === 'bn' ? 'ডেলিভারি লোকেশন ও ম্যাপ পিন' : 'Delivery Location & Map Pin'}</span>
        </label>

        <div className="flex bg-stone-100 p-1 rounded-2xl text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveMode('map')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'map' ? 'bg-white text-[#0B5D3B] shadow-sm font-extrabold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'bn' ? '🗺️ লাইভ ম্যাপ' : '🗺️ Live Map'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('landmarks')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'landmarks' ? 'bg-white text-[#0B5D3B] shadow-sm font-extrabold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'bn' ? '🏛️ ল্যান্ডমার্ক' : '🏛️ Landmarks'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('list')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeMode === 'list' ? 'bg-white text-[#0B5D3B] shadow-sm font-extrabold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {lang === 'bn' ? '📋 এরিয়া লিস্ট' : '📋 Area List'}
          </button>
        </div>
      </div>

      {/* Primary GPS Live Locate Button (Big, Prominent, Mobile-Friendly) */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50/60 p-3 sm:p-3.5 rounded-2xl border-2 border-emerald-200/90 shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleGetLiveLocation}
            disabled={gpsLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 text-white font-bold text-sm sm:text-base py-3 px-4 rounded-xl shadow-md transition-all cursor-pointer"
          >
            {gpsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#F4D05F]" />
            ) : (
              <Navigation className="w-5 h-5 text-[#F4D05F]" />
            )}
            <span>
              {gpsLoading
                ? lang === 'bn'
                  ? 'জিপিএস খোঁজা হচ্ছে...'
                  : 'Locating GPS...'
                : lang === 'bn'
                ? '📍 আমার লোকেশন নিন (GPS)'
                : '📍 Use My Current Location'}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-stone-700 bg-white/80 py-2 px-3 rounded-xl border border-emerald-200/70">
            <Compass className="w-4 h-4 text-[#F7931E]" />
            <span>
              {lang === 'bn' ? 'রেস্টুরেন্ট থেকে দূরত্ব:' : 'Distance:'} <strong className="text-stone-900 font-extrabold">{distanceKm} কিমি</strong>
            </span>
          </div>
        </div>

        {/* GPS Status Message Feedback */}
        {gpsMessage && (
          <div
            className={`p-3 rounded-xl text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in transition-all ${
              gpsMessage.type === 'success'
                ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold'
                : gpsMessage.type === 'info'
                ? 'bg-amber-100/90 border border-amber-300 text-amber-900 font-medium'
                : 'bg-red-100 border border-red-300 text-red-900'
            }`}
          >
            {gpsMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            )}
            <span className="leading-snug">{gpsMessage.text}</span>
          </div>
        )}
      </div>

      {/* TAB 1: INTERACTIVE MAP CANVAS */}
      {activeMode === 'map' && (
        <div className="space-y-2.5">
          {/* Real Interactive Map Canvas */}
          <div className="relative w-full h-72 sm:h-80 rounded-3xl overflow-hidden border-2 border-stone-300 bg-stone-100 shadow-md">
            <iframe
              title="Delivery Location Map"
              width="100%"
              height="100%"
              className="border-0 w-full h-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentCoords.lng - 0.007}%2C${currentCoords.lat - 0.005}%2C${currentCoords.lng + 0.007}%2C${currentCoords.lat + 0.005}&layer=mapnik&marker=${currentCoords.lat}%2C${currentCoords.lng}`}
            />

            {/* Live Pin Overlay Card */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-stone-200 text-xs flex items-center gap-2 max-w-[80%] pointer-events-none">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shrink-0" />
              <div className="truncate">
                <span className="font-extrabold text-stone-900 block truncate">
                  {value.area || 'বেনাপোল ডেলিভারি পয়েন্ট'}
                </span>
                <span className="text-[11px] font-mono text-[#0B5D3B] font-bold">
                  {currentCoords.lat}, {currentCoords.lng}
                </span>
              </div>
            </div>

            {/* Direct GPS Locate Button on Map */}
            <button
              type="button"
              onClick={handleGetLiveLocation}
              disabled={gpsLoading}
              className="absolute bottom-3 right-3 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white text-xs font-black px-3.5 py-2.5 rounded-xl shadow-lg flex items-center gap-1.5 transition-all cursor-pointer border border-white/30"
            >
              {gpsLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#F4D05F]" />
              ) : (
                <Navigation className="w-4 h-4 text-[#F4D05F]" />
              )}
              <span>{lang === 'bn' ? 'আমার পয়েন্টে পিন নিন' : 'Detect My Point'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-stone-600 px-1 font-medium">
            <span>
              {lang === 'bn' ? 'পিন করা স্থানাঙ্ক:' : 'Pinned Coords:'}{' '}
              <strong className="font-mono text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg border border-stone-200">
                {currentCoords.lat}, {currentCoords.lng}
              </strong>
            </span>
            <a
              href={value.googleMapsUrl || `https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0B5D3B] hover:text-[#08482E] flex items-center gap-1.5 font-bold underline underline-offset-2"
            >
              <span>{lang === 'bn' ? 'গুগল ম্যাপে যাচাই করুন' : 'View on Google Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Restaurant Location & Plus Code Info Box */}
          <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse shrink-0" />
              <span className="text-stone-700">
                <strong>{lang === 'bn' ? 'রেস্টুরেন্ট লোকেশন:' : 'Restaurant:'}</strong>{' '}
                <span className="font-bold text-emerald-950">বেনাপোল স্পেশাল</span>
              </span>
              <span className="bg-white border border-emerald-300 font-mono font-black text-emerald-900 text-[11px] sm:text-xs px-2 py-0.5 rounded-lg shadow-2xs">
                {BENAPOLE_PLUS_CODE}
              </span>
            </div>
            <a
              href={BENAPOLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#0B5D3B] hover:text-[#08482E] font-black underline underline-offset-2 shrink-0"
            >
              <span>{lang === 'bn' ? 'গুগল ম্যাপে রেস্টুরেন্ট' : 'Open in Maps'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* QUICK 1-TAP POPULAR LANDMARK CHIPS */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#F7931E]" />
            <span>{lang === 'bn' ? '১-ক্লিকে জনপ্রিয় ল্যান্ডমার্ক সিলেক্ট করুন:' : '1-Tap Famous Landmarks:'}</span>
          </label>
          <span className="text-xs text-stone-500 font-medium">{deliveryAreas.length}টি এলাকা</span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-stone-50/80 rounded-2xl border border-stone-200">
          {deliveryAreas.map((area) => {
            const isSelected = value.area === area.name.bn || value.landmark === area.landmark;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => handleSelectLandmark(area)}
                className={`text-xs sm:text-sm px-3 py-2 rounded-xl border transition-all text-left flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B5D3B] text-white border-[#0B5D3B] shadow-sm font-extrabold ring-2 ring-emerald-300'
                    : 'bg-white text-stone-800 border-stone-200 hover:border-[#0B5D3B]/40 hover:bg-stone-50 font-medium'
                }`}
              >
                <Building className="w-3.5 h-3.5 shrink-0 opacity-80" />
                <span>{area.name.bn}</span>
                {area.fee !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-lg font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-[#0B5D3B]'
                    }`}
                  >
                    ৳{area.fee}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* AREA DROPDOWN SELECTOR & LANDMARK INPUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs sm:text-sm font-bold text-stone-800 block mb-1.5">
            {lang === 'bn' ? 'ডেলিভারি এরিয়া / এলাকা *' : 'Delivery Area *'}
          </label>
          <select
            value={value.area}
            onChange={(e) => {
              const selectedArea = deliveryAreas.find(
                (a) => a.name.bn === e.target.value || a.name.en === e.target.value
              );
              if (selectedArea) {
                handleSelectLandmark(selectedArea);
              } else {
                onChange({ ...value, area: e.target.value });
              }
            }}
            className="w-full text-sm sm:text-base p-3.5 rounded-2xl border-2 border-stone-200 bg-white font-semibold text-stone-900 focus:border-[#0B5D3B] outline-hidden shadow-2xs transition-colors"
          >
            {deliveryAreas.map((a) => (
              <option key={a.id} value={a.name.bn}>
                {a.name.bn} (ডেলিভারি চার্জ: ৳{a.fee !== undefined ? a.fee : 40})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs sm:text-sm font-bold text-stone-800 block mb-1.5">
            {lang === 'bn' ? 'পরিচিত স্থান / ল্যান্ডমার্ক' : 'Nearby Landmark'}
          </label>
          <input
            type="text"
            value={value.landmark}
            onChange={(e) => onChange({ ...value, landmark: e.target.value })}
            placeholder={lang === 'bn' ? 'যেমন: চেকপোস্ট গেট, পৌরসভা মোড়...' : 'e.g. Near Customs Gate'}
            className="w-full text-sm sm:text-base p-3.5 rounded-2xl border-2 border-stone-200 bg-stone-50/50 text-stone-900 focus:border-[#0B5D3B] outline-hidden shadow-2xs font-medium transition-colors"
          />
        </div>
      </div>

      {/* DETAILED STREET / BUILDING ADDRESS */}
      <div>
        <label className="text-xs sm:text-sm font-bold text-stone-800 block mb-1.5">
          {lang === 'bn' ? 'পূর্ণ ঠিকানা (বাড়ি/রোড/ফ্ল্যাট নম্বর বা বিস্তারিত নির্দেশনা) *' : 'Detailed House/Road Address *'}
        </label>
        <textarea
          rows={2}
          required
          value={value.address}
          onChange={(e) => onChange({ ...value, address: e.target.value })}
          placeholder={
            lang === 'bn'
              ? 'রোড নম্বর, বাড়ি/ভবনের নাম, তলা বা বিশেষ পরিচিতি লিখুন (যেমন: বাড়ি নং ১২, রোড ৩, ঢাকা বিরিয়ানি হাউজের পেছনে)'
              : 'House #, Road #, Building name, or floor details...'
          }
          className="w-full text-sm sm:text-base p-3.5 rounded-2xl border-2 border-stone-200 bg-stone-50/50 text-stone-900 focus:border-[#0B5D3B] outline-hidden shadow-2xs resize-none font-medium transition-colors"
        />
      </div>

      {/* Location Confirmation Pill */}
      <div className="p-3.5 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex items-start gap-3 text-sm text-stone-800 shadow-2xs">
        <CheckCircle className="w-5 h-5 text-[#0B5D3B] shrink-0 mt-0.5" />
        <div className="flex-1 space-y-0.5">
          <div className="font-extrabold text-stone-900 text-sm sm:text-base flex items-center justify-between">
            <span>
              {value.area || 'বেনাপোল'} {value.landmark ? `• ${value.landmark}` : ''}
            </span>
            <span className="text-[#0B5D3B] font-black text-base sm:text-lg">
              চার্জ: ৳{value.deliveryFee}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-600 line-clamp-1">
            {value.address ? value.address : 'বিস্তারিত ঠিকানা প্রদান করুন'}
          </p>
        </div>
      </div>
    </div>
  );
}
