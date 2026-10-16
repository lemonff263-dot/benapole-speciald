import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore, syncStoreWithFirestore, defaultTheme } from '@/lib/store';
import { saveThemeToFirestore } from '@/lib/firestoreService';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const store = await syncStoreWithFirestore();
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
    const updatedDraftTheme = {
      ...store.draftTheme,
      ...draftTheme,
      version: store.publishedTheme.version,
    };

    // Await durable write to Firestore
    try {
      await saveThemeToFirestore(updatedDraftTheme, store.publishedTheme, store.themeHistory);
    } catch (dbErr) {
      console.error('Critical: Failed to save draft theme to Firestore:', dbErr);
      return NextResponse.json(
        { error: 'ড্রাফট থিম ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি / Failed to persist draft theme' },
        { status: 500 }
      );
    }

    store.draftTheme = updatedDraftTheme;
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

      const updatedHistory = [
        {
          version: nextVersion,
          publishedAt,
          theme: finalTheme,
        },
        ...store.themeHistory,
      ].slice(0, 10);

      // Await durable write to Firestore
      try {
        await saveThemeToFirestore(finalTheme, finalTheme, updatedHistory);
      } catch (dbErr) {
        console.error('Critical: Failed to publish theme to Firestore:', dbErr);
        return NextResponse.json(
          { error: 'থিমটি ডেটাবেজে পাবলিশ করা সম্ভব হয়নি / Failed to publish theme to database' },
          { status: 500 }
        );
      }

      store.publishedTheme = finalTheme;
      store.draftTheme = JSON.parse(JSON.stringify(finalTheme));
      store.themeHistory = updatedHistory;
      saveStore(store);

      return NextResponse.json({ success: true, publishedTheme: finalTheme });
    }

    if (action === 'reset_defaults') {
      const resetTheme = JSON.parse(JSON.stringify(defaultTheme));

      try {
        await saveThemeToFirestore(resetTheme, store.publishedTheme, store.themeHistory);
      } catch (dbErr) {
        console.error('Critical: Failed to reset draft theme in Firestore:', dbErr);
        return NextResponse.json(
          { error: 'রিসেট থিম ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি' },
          { status: 500 }
        );
      }

      store.draftTheme = resetTheme;
      saveStore(store);

      return NextResponse.json({ success: true, draftTheme: store.draftTheme });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
