import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { botToken, chatId } = await req.json();

    if (!botToken || !chatId) {
      return NextResponse.json(
        { error: 'বট টোকেন এবং চ্যাট আইডি প্রদান করুন / Bot token and chat ID are required' },
        { status: 400 }
      );
    }

    const testMessage = `🧪 <b>বেনাপোল স্পেশাল - টেলিগ্রাম টেস্ট মেসেজ</b>\n━━━━━━━━━━━━━━━━━━\nআপনার টেলিগ্রাম বট সংযোগ সফলভাবে কাজ করছে! নতুন অর্ডার আসলেই এখানে স্বয়ংক্রিয়ভাবে নোটিফিকেশন পৌঁছে যাবে।\n\n⏰ সময়: ${new Date().toLocaleString('bn-BD')}`;

    const result = await sendTelegramMessage(botToken, chatId, testMessage);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send message' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'টেস্ট মেসেজ সফলভাবে পাঠানো হয়েছে!' });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
