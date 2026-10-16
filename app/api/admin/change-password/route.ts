import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore } from '@/lib/store';
import { saveAdminAuthToFirestore } from '@/lib/firestoreService';

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return NextResponse.json(
        { error: 'অননুমোদিত অনুরোধ / Unauthorized. Please log in first.' },
        { status: 401 }
      );
    }

    const { newPassword } = await req.json();
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 4) {
      return NextResponse.json(
        {
          error:
            'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে / Password must be at least 4 characters long',
        },
        { status: 400 }
      );
    }

    const cleanPass = newPassword.trim();

    // Await durable write to Firestore first
    try {
      await saveAdminAuthToFirestore(cleanPass);
    } catch (dbErr) {
      console.error('Critical: Failed to save admin password in Firestore:', dbErr);
      return NextResponse.json(
        {
          error:
            'পাসওয়ার্ড ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন। / Database write failed',
        },
        { status: 500 }
      );
    }

    const store = getStore();
    store.adminPasswordHash = cleanPass;
    saveStore(store);

    return NextResponse.json({
      success: true,
      message:
        'এডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন ও সুরক্ষিতভাবে সংরক্ষণ করা হয়েছে! পরবর্তী লগইনে নতুন পাসওয়ার্ড ব্যবহার করুন।',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
