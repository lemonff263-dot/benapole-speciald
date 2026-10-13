import { RestaurantSettings } from './types';

export interface RestaurantOpenStatus {
  isOpen: boolean;
  canAcceptOrders: boolean;
  statusTextBn: string;
  statusTextEn: string;
  badgeColor: 'green' | 'red' | 'amber';
  reasonBn?: string;
  reasonEn?: string;
  currentBangladeshTime: string;
  openingTimeFormatted: string;
  closingTimeFormatted: string;
}

export function formatTime12h(time24: string): string {
  if (!time24) return '১০:০০ AM';
  const parts = time24.split(':');
  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1] || '0', 10);
  if (isNaN(h)) h = 10;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${h12}:${mm} ${ampm}`;
}

export function checkRestaurantOpenStatus(settings?: Partial<RestaurantSettings>): RestaurantOpenStatus {
  const isOrderAccepting = settings?.isOrderAccepting !== false && settings?.isOpen !== false;

  // Calculate Bangladesh Time (BST, UTC+6)
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const bdDate = new Date(utcMs + 6 * 3600000);
  const currentHour = bdDate.getHours();
  const currentMinute = bdDate.getMinutes();
  const currentDayIndex = bdDate.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  const currentTotalMin = currentHour * 60 + currentMinute;

  const currentBdTimeStr = formatTime12h(`${currentHour}:${currentMinute}`);

  // Map JS getDay to day key
  const dayKeyMap: Record<number, 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday',
  };
  const todayKey = dayKeyMap[currentDayIndex];

  // Check today's schedule if weeklySchedule exists
  let openingTime = settings?.openingTime || '10:00';
  let closingTime = settings?.closingTime || '23:00';
  let isTodayScheduledOpen = true;
  let todayDayName = 'আজ';

  if (settings?.weeklySchedule && settings.weeklySchedule.length > 0) {
    const todaySched = settings.weeklySchedule.find((d) => d.day === todayKey);
    if (todaySched) {
      todayDayName = todaySched.dayNameBn;
      isTodayScheduledOpen = todaySched.isOpen;
      if (todaySched.openTime) openingTime = todaySched.openTime;
      if (todaySched.closeTime) closingTime = todaySched.closeTime;
    }
  }

  const openParts = openingTime.split(':');
  const closeParts = closingTime.split(':');
  const openH = parseInt(openParts[0] || '10', 10);
  const openM = parseInt(openParts[1] || '0', 10);
  const closeH = parseInt(closeParts[0] || '23', 10);
  const closeM = parseInt(closeParts[1] || '0', 10);

  const openTotalMin = openH * 60 + openM;
  const closeTotalMin = closeH * 60 + closeM;

  const openFormatted = formatTime12h(openingTime);
  const closeFormatted = formatTime12h(closingTime);

  // If manual toggle is explicitly turned off:
  if (!isOrderAccepting) {
    return {
      isOpen: false,
      canAcceptOrders: false,
      statusTextBn: 'অর্ডার গ্রহণ সাময়িক বন্ধ',
      statusTextEn: 'Orders Paused',
      badgeColor: 'amber',
      reasonBn: 'রেস্টুরেন্টে বর্তমানে নতুন অর্ডার গ্রহণ সাময়িকভাবে বন্ধ রাখা হয়েছে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।',
      reasonEn: 'Orders are temporarily paused. Please check back shortly.',
      currentBangladeshTime: currentBdTimeStr,
      openingTimeFormatted: openFormatted,
      closingTimeFormatted: closeFormatted,
    };
  }

  // If closed specifically on this day according to weekly schedule
  if (!isTodayScheduledOpen) {
    return {
      isOpen: false,
      canAcceptOrders: false,
      statusTextBn: `${todayDayName} সাপ্তাহিক বন্ধ`,
      statusTextEn: 'Closed Today',
      badgeColor: 'red',
      reasonBn: `আজ ${todayDayName} আমাদের রেস্টুরেন্ট বন্ধ থাকে। পরবর্তী কার্যদিবসে সকাল ${openFormatted} টা থেকে অর্ডার করতে পারবেন।`,
      reasonEn: `The restaurant is closed today (${todayDayName}). Please order on next open day from ${openFormatted}.`,
      currentBangladeshTime: currentBdTimeStr,
      openingTimeFormatted: openFormatted,
      closingTimeFormatted: closeFormatted,
    };
  }

  // Check if current Bangladesh time is within opening and closing times
  let isWithinHours = false;
  if (openTotalMin <= closeTotalMin) {
    isWithinHours = currentTotalMin >= openTotalMin && currentTotalMin < closeTotalMin;
  } else {
    // Crosses midnight, e.g. 18:00 to 02:00
    isWithinHours = currentTotalMin >= openTotalMin || currentTotalMin < closeTotalMin;
  }

  if (!isWithinHours) {
    return {
      isOpen: false,
      canAcceptOrders: false,
      statusTextBn: 'এখন বন্ধ আছে',
      statusTextEn: 'Currently Closed',
      badgeColor: 'red',
      reasonBn: `রেস্টুরেন্ট এখন বন্ধ আছে। আমাদের অর্ডার গ্রহণের সময় সকাল ${openFormatted} থেকে রাত ${closeFormatted} পর্যন্ত। অনুগ্রহ করে নির্দিষ্ট সময়ে অর্ডার করুন।`,
      reasonEn: `Restaurant is currently closed. Opening hours: ${openFormatted} - ${closeFormatted}.`,
      currentBangladeshTime: currentBdTimeStr,
      openingTimeFormatted: openFormatted,
      closingTimeFormatted: closeFormatted,
    };
  }

  return {
    isOpen: true,
    canAcceptOrders: true,
    statusTextBn: 'খোলা আছে',
    statusTextEn: 'Open Now',
    badgeColor: 'green',
    currentBangladeshTime: currentBdTimeStr,
    openingTimeFormatted: openFormatted,
    closingTimeFormatted: closeFormatted,
  };
}
