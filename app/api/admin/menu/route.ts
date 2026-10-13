import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore } from '@/lib/store';
import { FoodItem, Category } from '@/lib/types';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = getStore();
  return NextResponse.json({
    categories: store.categories,
    foods: store.foods,
  });
}

export async function POST(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;
    const store = getStore();

    if (type === 'food') {
      const newFood: FoodItem = {
        id: data.id || `food_${Date.now()}`,
        name: data.name || { bn: 'নতুন খাবার', en: 'New Food' },
        description: data.description || { bn: '', en: '' },
        categoryId: data.categoryId || 'doi_chira',
        price: Number(data.price) || 0,
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : undefined,
        image: data.image || '/images/doi_chira.jpg',
        isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
        isBestseller: !!data.isBestseller,
        isFeatured: !!data.isFeatured,
        isNew: !!data.isNew,
        portionVariants: data.portionVariants || [],
        addOns: data.addOns || [],
        prepTime: data.prepTime || '১০ মিনিট',
        sortOrder: store.foods.length + 1,
      };

      store.foods.unshift(newFood);
      saveStore(store);
      return NextResponse.json({ success: true, item: newFood });
    }

    if (type === 'category') {
      const newCategory: Category = {
        id: data.id || `cat_${Date.now()}`,
        name: data.name || { bn: 'নতুন ক্যাটাগরি', en: 'New Category' },
        icon: data.icon || 'Utensils',
        sortOrder: store.categories.length + 1,
        isActive: true,
      };

      store.categories.push(newCategory);
      saveStore(store);
      return NextResponse.json({ success: true, item: newCategory });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;
    const store = getStore();

    if (type === 'food') {
      const idx = store.foods.findIndex((f) => f.id === data.id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Food not found' }, { status: 404 });
      }

      store.foods[idx] = {
        ...store.foods[idx],
        ...data,
        price: Number(data.price) || store.foods[idx].price,
      };
      saveStore(store);
      return NextResponse.json({ success: true, item: store.foods[idx] });
    }

    if (type === 'category') {
      const idx = store.categories.findIndex((c) => c.id === data.id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      store.categories[idx] = {
        ...store.categories[idx],
        ...data,
      };
      saveStore(store);
      return NextResponse.json({ success: true, item: store.categories[idx] });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ error: 'Type and ID are required' }, { status: 400 });
    }

    const store = getStore();
    if (type === 'food') {
      store.foods = store.foods.filter((f) => f.id !== id);
      saveStore(store);
      return NextResponse.json({ success: true });
    }

    if (type === 'category') {
      store.categories = store.categories.filter((c) => c.id !== id);
      saveStore(store);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
