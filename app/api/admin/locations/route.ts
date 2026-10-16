import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore, syncStoreWithFirestore, defaultSettings } from '@/lib/store';
import { DeliveryArea } from '@/lib/types';
import { saveSettingsToFirestore } from '@/lib/firestoreService';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const store = await syncStoreWithFirestore();
  const areas = store.settings.deliveryAreas || defaultSettings.deliveryAreas;
  return NextResponse.json({ locations: areas });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const store = getStore();

    if (!body.name || !body.name.bn) {
      return NextResponse.json({ error: 'লোকেশন বা এলাকার নাম আবশ্যক' }, { status: 400 });
    }

    const newLocation: DeliveryArea = {
      id: body.id || 'area_' + Date.now().toString(36),
      name: {
        bn: body.name.bn.trim(),
        en: (body.name.en || body.name.bn).trim(),
      },
      fee:
        Number(body.fee) !== undefined && !isNaN(Number(body.fee))
          ? Number(body.fee)
          : store.settings.deliveryFee,
      landmark: body.landmark ? body.landmark.trim() : undefined,
      isPopular: Boolean(body.isPopular),
      coordinates: body.coordinates
        ? {
            lat: Number(body.coordinates.lat) || 23.0441,
            lng: Number(body.coordinates.lng) || 88.8983,
          }
        : undefined,
    };

    const currentAreas = store.settings.deliveryAreas || [...defaultSettings.deliveryAreas];
    const updatedAreas = [...currentAreas, newLocation];
    const updatedSettings = {
      ...store.settings,
      deliveryAreas: updatedAreas,
    };

    // Await durable write to Firestore
    try {
      await saveSettingsToFirestore(updatedSettings);
    } catch (dbErr) {
      console.error('Critical: Failed to save location to Firestore:', dbErr);
      return NextResponse.json(
        { error: 'লোকেশনটি ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি / Failed to persist location' },
        { status: 500 }
      );
    }

    store.settings = updatedSettings;
    saveStore(store);

    return NextResponse.json({
      success: true,
      location: newLocation,
      locations: store.settings.deliveryAreas,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const store = getStore();

    if (body.resetToDefault) {
      const resetAreas = JSON.parse(JSON.stringify(defaultSettings.deliveryAreas));
      const updatedSettings = {
        ...store.settings,
        deliveryAreas: resetAreas,
      };

      try {
        await saveSettingsToFirestore(updatedSettings);
      } catch (dbErr) {
        console.error('Critical: Failed to reset locations in Firestore:', dbErr);
        return NextResponse.json(
          { error: 'লোকেশন রিসেট ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি / Failed to reset locations' },
          { status: 500 }
        );
      }

      store.settings = updatedSettings;
      saveStore(store);

      return NextResponse.json({ success: true, locations: store.settings.deliveryAreas });
    }

    if (body.locations && Array.isArray(body.locations)) {
      const updatedSettings = {
        ...store.settings,
        deliveryAreas: body.locations,
      };

      try {
        await saveSettingsToFirestore(updatedSettings);
      } catch (dbErr) {
        console.error('Critical: Failed to save locations list in Firestore:', dbErr);
        return NextResponse.json(
          { error: 'লোকেশন তালিকা ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি' },
          { status: 500 }
        );
      }

      store.settings = updatedSettings;
      saveStore(store);

      return NextResponse.json({ success: true, locations: store.settings.deliveryAreas });
    }

    if (!body.id) {
      return NextResponse.json({ error: 'লোকেশন আইডি আবশ্যক' }, { status: 400 });
    }

    const areas = store.settings.deliveryAreas || [...defaultSettings.deliveryAreas];
    const index = areas.findIndex((a) => a.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: 'লোকেশন পাওয়া যায়নি' }, { status: 404 });
    }

    const updatedAreas = [...areas];
    updatedAreas[index] = {
      ...updatedAreas[index],
      name: body.name ? { bn: body.name.bn, en: body.name.en || body.name.bn } : updatedAreas[index].name,
      fee: body.fee !== undefined ? Number(body.fee) : updatedAreas[index].fee,
      landmark: body.landmark !== undefined ? body.landmark : updatedAreas[index].landmark,
      isPopular: body.isPopular !== undefined ? Boolean(body.isPopular) : updatedAreas[index].isPopular,
      coordinates: body.coordinates ? body.coordinates : updatedAreas[index].coordinates,
    };

    const updatedSettings = {
      ...store.settings,
      deliveryAreas: updatedAreas,
    };

    try {
      await saveSettingsToFirestore(updatedSettings);
    } catch (dbErr) {
      console.error('Critical: Failed to update location in Firestore:', dbErr);
      return NextResponse.json(
        { error: 'লোকেশন আপডেট ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি' },
        { status: 500 }
      );
    }

    store.settings = updatedSettings;
    saveStore(store);

    return NextResponse.json({
      success: true,
      location: updatedAreas[index],
      locations: store.settings.deliveryAreas,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json({ error: 'মুছে ফেলার আইডি দিন' }, { status: 400 });
    }

    const store = getStore();
    const areas = store.settings.deliveryAreas || [...defaultSettings.deliveryAreas];
    const updatedAreas = areas.filter((a) => a.id !== id);

    const updatedSettings = {
      ...store.settings,
      deliveryAreas: updatedAreas,
    };

    try {
      await saveSettingsToFirestore(updatedSettings);
    } catch (dbErr) {
      console.error('Critical: Failed to delete location in Firestore:', dbErr);
      return NextResponse.json(
        { error: 'লোকেশনটি ডেটাবেজ থেকে মুছে ফেলা সম্ভব হয়নি' },
        { status: 500 }
      );
    }

    store.settings = updatedSettings;
    saveStore(store);

    return NextResponse.json({ success: true, locations: store.settings.deliveryAreas });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
