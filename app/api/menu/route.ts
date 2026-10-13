import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const store = getStore();

  // Strip sensitive telegram bot token from public settings
  const publicSettings = {
    ...store.settings,
    telegramConfig: {
      enabled: store.settings.telegramConfig.enabled,
      botToken: '', // do not expose
      chatId: '', // do not expose
      notifyOnNewOrder: store.settings.telegramConfig.notifyOnNewOrder,
      notifyOnStatusChange: store.settings.telegramConfig.notifyOnStatusChange,
    },
  };

  return NextResponse.json({
    categories: store.categories.filter((c) => c.isActive),
    foods: store.foods.filter((f) => f.isAvailable),
    offers: store.offers.filter((o) => o.isActive),
    settings: publicSettings,
    theme: store.publishedTheme,
  });
}
