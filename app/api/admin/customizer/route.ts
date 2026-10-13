import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore, defaultTheme } from '@/lib/store';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
  return NextResponse.json({
    draftTheme: store.draftTheme,
    publishedTheme: store.publishedTheme,
    history: store.themeHistory,
  });
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { draftTheme } = await req.json();
    if (!draftTheme) {
      return NextResponse.json({ error: 'Draft theme data required' }, { status: 400 });
    }

    const store = getStore();
    store.draftTheme = {
      ...store.draftTheme,
      ...draftTheme,
      version: store.publishedTheme.version,
    };

    saveStore(store);
    return NextResponse.json({ success: true, draftTheme: store.draftTheme });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { action, theme } = await req.json();
    const store = getStore();

    if (action === 'publish') {
      const themeToPublish = theme || store.draftTheme;
      const nextVersion = (store.publishedTheme.version || 1) + 1;
      const publishedAt = new Date().toISOString();

      const finalTheme = {
        ...themeToPublish,
        version: nextVersion,
        publishedAt,
      };

      store.publishedTheme = finalTheme;
      store.draftTheme = JSON.parse(JSON.stringify(finalTheme));
      store.themeHistory.unshift({
        version: nextVersion,
        publishedAt,
        theme: finalTheme,
      });

      // Keep last 10 versions
      if (store.themeHistory.length > 10) {
        store.themeHistory = store.themeHistory.slice(0, 10);
      }

      saveStore(store);
      return NextResponse.json({ success: true, publishedTheme: finalTheme });
    }

    if (action === 'reset_defaults') {
      store.draftTheme = JSON.parse(JSON.stringify(defaultTheme));
      saveStore(store);
      return NextResponse.json({ success: true, draftTheme: store.draftTheme });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
