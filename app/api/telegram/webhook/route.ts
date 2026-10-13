import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore } from '@/lib/store';
import { sendTelegramMessage } from '@/lib/telegram';
import { checkRestaurantOpenStatus } from '@/lib/openingHours';

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    const message = update?.message || update?.edited_message || update?.channel_post;
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat?.id;
    const text = message.text?.trim() || '';

    if (!text || !chatId) {
      return NextResponse.json({ ok: true });
    }

    const store = getStore();
    const botToken = store.settings?.telegramConfig?.botToken;

    if (!botToken) {
      return NextResponse.json({ ok: true });
    }

    const lower = text.toLowerCase();

    // 1. Command to turn orders ON: /order_on or /on
    if (lower === '/order_on' || lower.startsWith('/order_on') || lower === '/on') {
      store.settings.isOrderAccepting = true;
      store.settings.isOpen = true;
      saveStore(store);

      const status = checkRestaurantOpenStatus(store.settings);
      const replyMsg = `🟢 <b>বেনাপোল স্পেশাল - অর্ডার গ্রহণ চালু করা হয়েছে!</b>\n\n` +
        `✅ গ্রাহকরা এখন ওয়েবসাইট থেকে খাবার অর্ডার করতে পারবেন।\n` +
        `🕒 খোলার সময়: ${status.openingTimeFormatted} - ${status.closingTimeFormatted}\n` +
        `🇧🇩 বর্তমান সময়: ${status.currentBangladeshTime}\n\n` +
        `<i>অর্ডার বন্ধ করতে পাঠান: /order_off</i>`;

      await sendTelegramMessage(botToken, String(chatId), replyMsg).catch((err) => console.error(err));
      return NextResponse.json({ ok: true, action: 'order_on' });
    }

    // 2. Command to turn orders OFF: /order_off or /off
    if (lower === '/order_off' || lower.startsWith('/order_off') || lower === '/off') {
      store.settings.isOrderAccepting = false;
      saveStore(store);

      const replyMsg = `🔴 <b>বেনাপোল স্পেশাল - অর্ডার গ্রহণ সাময়িক বন্ধ করা হয়েছে!</b>\n\n` +
        `⛔ গ্রাহকরা এখন ওয়েবসাইট থেকে অর্ডার করতে পারবেন না।\n` +
        `⚠️ চেকআউট ও হোমপেজে "অর্ডার গ্রহণ সাময়িক স্থগিত" বিজ্ঞপ্তি প্রদর্শিত হচ্ছে।\n\n` +
        `<i>পুনরায় চালু করতে পাঠান: /order_on</i>`;

      await sendTelegramMessage(botToken, String(chatId), replyMsg).catch((err) => console.error(err));
      return NextResponse.json({ ok: true, action: 'order_off' });
    }

    // 3. Command to check status: /status
    if (lower === '/status' || lower.startsWith('/status')) {
      const status = checkRestaurantOpenStatus(store.settings);
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayOrders = store.orders.filter((o) => o.createdAt.startsWith(todayStr));
      const todaySales = todayOrders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0);

      const replyMsg = `📊 <b>বেনাপোল স্পেশাল - বর্তমান রেস্টুরেন্ট অবস্থা:</b>\n\n` +
        `📌 অর্ডার অবস্থা: ${status.canAcceptOrders ? '🟢 <b>চালু আছে (OPEN)</b>' : '🔴 <b>বন্ধ আছে (CLOSED)</b>'}\n` +
        `🕒 নির্ধারিত সময়: সকাল ${status.openingTimeFormatted} - রাত ${status.closingTimeFormatted}\n` +
        `🇧🇩 বর্তমান বাংলাদেশ সময়: ${status.currentBangladeshTime}\n` +
        `🛍️ আজকের মোট অর্ডার: <b>${todayOrders.length}</b> টি\n` +
        `💰 আজকের বিক্রয়: <b>৳${todaySales}</b>\n\n` +
        `<i>কমান্ডসমূহ:</i>\n` +
        `/order_on - অর্ডার গ্রহণ চালু করুন\n` +
        `/order_off - অর্ডার গ্রহণ বন্ধ করুন\n` +
        `/status - বর্তমান অবস্থা দেখুন`;

      await sendTelegramMessage(botToken, String(chatId), replyMsg).catch((err) => console.error(err));
      return NextResponse.json({ ok: true, action: 'status' });
    }

    // 4. Command for Help / Start
    if (lower === '/start' || lower === '/help') {
      const replyMsg = `👋 <b>স্বাগতম! বেনাপোল স্পেশাল রেস্টুরেন্ট ম্যানেজমেন্ট বট</b>\n\n` +
        `আপনি এই বটের মাধ্যমে সরাসরি অর্ডার গ্রহণ নিয়ন্ত্রণ করতে পারেন:\n\n` +
        `🟢 <b>/order_on</b> - গ্রাহকদের জন্য অর্ডার গ্রহণ চালু করুন\n` +
        `🔴 <b>/order_off</b> - অর্ডার গ্রহণ সাময়িকভাবে বন্ধ করুন\n` +
        `📊 <b>/status</b> - আজকের অর্ডার সংখ্যা ও রেস্টুরেন্ট অবস্থা দেখুন\n` +
        `❓ <b>/help</b> - এই নির্দেশিকাটি পুনরায় দেখুন`;

      await sendTelegramMessage(botToken, String(chatId), replyMsg).catch((err) => console.error(err));
      return NextResponse.json({ ok: true, action: 'help' });
    }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Telegram webhook error:', errorMsg);
    return NextResponse.json({ ok: true }); // Always return 200 to Telegram
  }
}
