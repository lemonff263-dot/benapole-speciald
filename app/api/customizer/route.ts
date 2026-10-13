import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  const store = getStore();
  return NextResponse.json({
    theme: store.publishedTheme,
  });
}
