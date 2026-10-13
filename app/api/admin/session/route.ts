import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  const isAuth = await verifyAdminSession();
  return NextResponse.json({ authenticated: isAuth });
}
