import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore } from '@/lib/store';
import { sendTelegramMessage } from '@/lib/telegram';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { isAccepting } = await req.json();
    const store = getStore();

    store.settings.isOrderAccepting = Boolean(isAccepting);
    store.settings.isOpen = Boolean(isAccepting);
    saveStore(store);

    const status = checkRestaurantOpenStatus(store.settings);

    // Send Telegram broadcast if enabled
    if (
      store.settings?.telegramConfig?.enabled &&
      store.settings?.telegramConfig?.botToken &&
      store.settings?.telegramConfig?.chatId
    ) {
      const msg = isAccepting
        ? `🟢 <b>[এডমিন প্যানেল] অর্ডার গ্রহণ চালু করা হয়েছে!</b>\n\nগ্রাহকরা এখন ওয়েবসাইট থেকে সরাসরি খাবার অর্ডার করতে পারবেন।\n🕒 সময়: সকাল ${status.openingTimeFormatted} - রাত ${status.closingTimeFormatted}`
        : `🔴 <b>[এডমিন প্যানেল] অর্ডার গ্রহণ সাময়িক বন্ধ করা হয়েছে!</b>\n\nগ্রাহকদের অর্ডার গ্রহণ সাময়িকভাবে স্থগিত রাখা হয়েছে।`;

      sendTelegramMessage(
        store.settings.telegramConfig.botToken,
        store.settings.telegramConfig.chatId,
        msg
      ).catch((err) => console.error('Telegram broadcast error:', err));
    }

    return NextResponse.json({
      success: true,
      isOrderAccepting: store.settings.isOrderAccepting,
      status,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to toggle order status';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
