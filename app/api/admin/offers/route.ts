import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore, syncStoreWithFirestore } from '@/lib/store';
import { Offer } from '@/lib/types';
import { saveMenuToFirestore } from '@/lib/firestoreService';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const store = await syncStoreWithFirestore();
  return NextResponse.json({ offers: store.offers });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const store = getStore();

    const newOffer: Offer = {
      id: `off_${Date.now()}`,
      code: data.code.toUpperCase().trim(),
      title: data.title,
      description: data.description,
      discountType: data.discountType || 'percentage',
      discountValue: Number(data.discountValue) || 10,
      minOrder: Number(data.minOrder) || 100,
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      validTill: data.validTill || '2026-12-31',
      isActive: data.isActive !== undefined ? data.isActive : true,
    };

    const updatedOffers = [...store.offers, newOffer];

    // Await durable write to Firestore
    try {
      await saveMenuToFirestore(store.foods, store.categories, updatedOffers);
    } catch (dbErr) {
      console.error('Critical: Failed to save offer to Firestore:', dbErr);
      return NextResponse.json(
        { error: 'অফারটি ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি / Failed to persist offer' },
        { status: 500 }
      );
    }

    store.offers = updatedOffers;
    saveStore(store);

    return NextResponse.json({ success: true, offer: newOffer });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create offer' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    const store = getStore();
    const idx = store.offers.findIndex((o) => o.id === data.id);
    if (idx === -1) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

    const updatedOffer: Offer = {
      ...store.offers[idx],
      ...data,
      code: data.code ? data.code.toUpperCase().trim() : store.offers[idx].code,
      discountValue: Number(data.discountValue) || store.offers[idx].discountValue,
      minOrder: Number(data.minOrder) || store.offers[idx].minOrder,
    };

    const updatedOffers = [...store.offers];
    updatedOffers[idx] = updatedOffer;

    // Await durable write to Firestore
    try {
      await saveMenuToFirestore(store.foods, store.categories, updatedOffers);
    } catch (dbErr) {
      console.error('Critical: Failed to update offer in Firestore:', dbErr);
      return NextResponse.json(
        { error: 'অফারটি ডেটাবেজে আপডেট করা সম্ভব হয়নি / Failed to persist offer' },
        { status: 500 }
      );
    }

    store.offers = updatedOffers;
    saveStore(store);

    return NextResponse.json({ success: true, offer: updatedOffer });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update offer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

  const store = getStore();
  const updatedOffers = store.offers.filter((o) => o.id !== id);

  // Await durable write to Firestore
  try {
    await saveMenuToFirestore(store.foods, store.categories, updatedOffers);
  } catch (dbErr) {
    console.error('Critical: Failed to delete offer from Firestore:', dbErr);
    return NextResponse.json(
      { error: 'অফারটি ডেটাবেজ থেকে মুছে ফেলা সম্ভব হয়নি / Failed to delete offer' },
      { status: 500 }
    );
  }

  store.offers = updatedOffers;
  saveStore(store);

  return NextResponse.json({ success: true });
}
