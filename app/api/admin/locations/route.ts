import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore, defaultSettings } from '@/lib/store';
import { DeliveryArea } from '@/lib/types';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = getStore();
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
      fee: Number(body.fee) !== undefined && !isNaN(Number(body.fee)) ? Number(body.fee) : store.settings.deliveryFee,
      landmark: body.landmark ? body.landmark.trim() : undefined,
      isPopular: Boolean(body.isPopular),
      coordinates: body.coordinates
        ? {
            lat: Number(body.coordinates.lat) || 23.0441,
            lng: Number(body.coordinates.lng) || 88.8983,
          }
        : undefined,
    };

    if (!store.settings.deliveryAreas) {
      store.settings.deliveryAreas = [...defaultSettings.deliveryAreas];
    }

    store.settings.deliveryAreas.push(newLocation);
    saveStore(store);

    return NextResponse.json({ success: true, location: newLocation, locations: store.settings.deliveryAreas });
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
      store.settings.deliveryAreas = JSON.parse(JSON.stringify(defaultSettings.deliveryAreas));
      saveStore(store);
      return NextResponse.json({ success: true, locations: store.settings.deliveryAreas });
    }

    if (body.locations && Array.isArray(body.locations)) {
      store.settings.deliveryAreas = body.locations;
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

    areas[index] = {
      ...areas[index],
      name: body.name ? { bn: body.name.bn, en: body.name.en || body.name.bn } : areas[index].name,
      fee: body.fee !== undefined ? Number(body.fee) : areas[index].fee,
      landmark: body.landmark !== undefined ? body.landmark : areas[index].landmark,
      isPopular: body.isPopular !== undefined ? Boolean(body.isPopular) : areas[index].isPopular,
      coordinates: body.coordinates ? body.coordinates : areas[index].coordinates,
    };

    store.settings.deliveryAreas = areas;
    saveStore(store);

    return NextResponse.json({ success: true, location: areas[index], locations: store.settings.deliveryAreas });
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
    store.settings.deliveryAreas = areas.filter((a) => a.id !== id);
    saveStore(store);

    return NextResponse.json({ success: true, locations: store.settings.deliveryAreas });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete location';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
