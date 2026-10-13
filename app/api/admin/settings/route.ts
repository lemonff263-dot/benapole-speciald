import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore } from '@/lib/store';
import { saveSettingsToFirestore } from '@/lib/firestoreService';
import { sendTelegramMessage, formatRestaurantToggleMessage, formatScheduleUpdateMessage } from '@/lib/telegram';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
  return NextResponse.json({ settings: store.settings });
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const updatedSettings = await req.json();
    const store = getStore();
    const prevAccepting = store.settings.isOrderAccepting !== false;

    const newIsOrderAccepting = updatedSettings.isOrderAccepting !== undefined 
      ? Boolean(updatedSettings.isOrderAccepting) 
      : (store.settings.isOrderAccepting !== false);

    store.settings = {
      ...store.settings,
      ...updatedSettings,
      deliveryFee: Number(updatedSettings.deliveryFee) !== undefined && !isNaN(Number(updatedSettings.deliveryFee)) ? Number(updatedSettings.deliveryFee) : store.settings.deliveryFee,
      minOrderAmount: Number(updatedSettings.minOrderAmount) !== undefined && !isNaN(Number(updatedSettings.minOrderAmount)) ? Number(updatedSettings.minOrderAmount) : store.settings.minOrderAmount,
      freeDeliveryThreshold:
        Number(updatedSettings.freeDeliveryThreshold) !== undefined && !isNaN(Number(updatedSettings.freeDeliveryThreshold)) ? Number(updatedSettings.freeDeliveryThreshold) : store.settings.freeDeliveryThreshold,
      deliveryAreas: Array.isArray(updatedSettings.deliveryAreas) ? updatedSettings.deliveryAreas : store.settings.deliveryAreas,
      isOrderAccepting: newIsOrderAccepting,
      isOpen: updatedSettings.isOpen !== undefined ? Boolean(updatedSettings.isOpen) : (store.settings.isOpen !== false),
      openingTime: updatedSettings.openingTime || store.settings.openingTime || '10:00',
      closingTime: updatedSettings.closingTime || store.settings.closingTime || '23:00',
      weeklySchedule: Array.isArray(updatedSettings.weeklySchedule) ? updatedSettings.weeklySchedule : store.settings.weeklySchedule,
      telegramConfig: {
        ...store.settings.telegramConfig,
        ...(updatedSettings.telegramConfig || {}),
      },
    };

    saveStore(store);

    // Sync to Firestore in background
    void saveSettingsToFirestore(store.settings);

    // Send Telegram Notification if order accepting status was toggled
    if (store.settings.telegramConfig?.enabled && store.settings.telegramConfig.botToken && store.settings.telegramConfig.chatId) {
      if (prevAccepting !== newIsOrderAccepting) {
        const msg = formatRestaurantToggleMessage(newIsOrderAccepting);
        void sendTelegramMessage(store.settings.telegramConfig.botToken, store.settings.telegramConfig.chatId, msg);
      } else if (Array.isArray(updatedSettings.weeklySchedule)) {
        const summary = updatedSettings.weeklySchedule
          .map((d: any) => `${d.dayNameBn}: ${d.isOpen ? `${d.openTime} - ${d.closeTime}` : 'সাপ্তাহিক বন্ধ'}`)
          .join('\n');
        const msg = formatScheduleUpdateMessage(summary);
        void sendTelegramMessage(store.settings.telegramConfig.botToken, store.settings.telegramConfig.chatId, msg);
      }
    }

    return NextResponse.json({ success: true, settings: store.settings });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
