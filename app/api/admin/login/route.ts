import { NextRequest, NextResponse } from 'next/server';
import { checkAdminPassword, getAdminCookieHeader } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || !checkAdminPassword(password)) {
      return NextResponse.json({ error: 'ভুল পাসওয়ার্ড / Incorrect admin password' }, { status: 401 });
    }

    const cookieInfo = getAdminCookieHeader();
    const res = NextResponse.json({ success: true, message: 'এডমিন লগইন সফল / Login successful' });

    res.cookies.set(cookieInfo.name, cookieInfo.value, cookieInfo.options as any);
    return res;
  } catch (err) {
    return NextResponse.json({ error: 'লগইনে সমস্যা হয়েছে / Server error' }, { status: 500 });
  }
}
