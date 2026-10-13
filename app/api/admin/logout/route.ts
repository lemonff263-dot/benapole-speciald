import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set('bs_admin_session', '', {
    httpOnly: true,
    path: '/',
    expires: new Date(0),
  });
  return res;
}
