import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStore, saveStore, syncStoreWithFirestore } from '@/lib/store';
import { FoodItem, Category } from '@/lib/types';
import { saveMenuToFirestore } from '@/lib/firestoreService';

export async function GET() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const store = await syncStoreWithFirestore();
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
      const bnName = data.name?.bn?.trim();
      if (!bnName) {
        return NextResponse.json(
          { error: 'খাবারের বাংলা নাম আবশ্যক (Food name in Bengali is required)' },
          { status: 400 }
        );
      }

      const enName = data.name?.en?.trim() || bnName;

      const newFood: FoodItem = {
        id: data.id || `food_${Date.now()}`,
        name: { bn: bnName, en: enName },
        description: {
          bn: data.description?.bn?.trim() || '',
          en: data.description?.en?.trim() || '',
        },
        categoryId: data.categoryId || (store.categories[0]?.id || 'doi_chira'),
        price: Number(data.price) > 0 ? Number(data.price) : 0,
        compareAtPrice: data.compareAtPrice && Number(data.compareAtPrice) > 0 ? Number(data.compareAtPrice) : undefined,
        image: data.image || '/images/doi_chira.jpg',
        isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
        isBestseller: !!data.isBestseller,
        isFeatured: !!data.isFeatured,
        isNew: !!data.isNew,
        portionVariants: Array.isArray(data.portionVariants) ? data.portionVariants : [],
        addOns: Array.isArray(data.addOns) ? data.addOns : [],
        prepTime: data.prepTime || '১০ মিনিট',
        sortOrder: store.foods.length + 1,
      };

      const updatedFoods = [newFood, ...store.foods];

      // Await durable write to Firestore
      try {
        await saveMenuToFirestore(updatedFoods, store.categories, store.offers);
      } catch (dbErr: any) {
        console.error('Critical: Failed to save food to Firestore:', dbErr);
        return NextResponse.json(
          { error: `খাবারটি ডেটাবেজে সংরক্ষণ করা যায়নি: ${dbErr?.message || dbErr}` },
          { status: 500 }
        );
      }

      store.foods = updatedFoods;
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

      const updatedCategories = [...store.categories, newCategory];

      // Await durable write to Firestore
      try {
        await saveMenuToFirestore(store.foods, updatedCategories, store.offers);
      } catch (dbErr) {
        console.error('Critical: Failed to save category to Firestore:', dbErr);
        return NextResponse.json(
          { error: 'ক্যাটাগরিটি ডেটাবেজে সংরক্ষণ করা যায়নি / Failed to persist to database' },
          { status: 500 }
        );
      }

      store.categories = updatedCategories;
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

      const updatedFood = {
        ...store.foods[idx],
        ...data,
        name: {
          bn: data.name?.bn ? data.name.bn.trim() : store.foods[idx].name.bn,
          en: data.name?.en ? data.name.en.trim() : (data.name?.bn ? data.name.bn.trim() : store.foods[idx].name.en),
        },
        price: data.price !== undefined && !isNaN(Number(data.price)) ? Number(data.price) : store.foods[idx].price,
        compareAtPrice: data.compareAtPrice !== undefined ? (Number(data.compareAtPrice) > 0 ? Number(data.compareAtPrice) : undefined) : store.foods[idx].compareAtPrice,
      };

      const updatedFoods = [...store.foods];
      updatedFoods[idx] = updatedFood;

      // Await durable write to Firestore
      try {
        await saveMenuToFirestore(updatedFoods, store.categories, store.offers);
      } catch (dbErr) {
        console.error('Critical: Failed to update food in Firestore:', dbErr);
        return NextResponse.json(
          { error: 'খাবারের তথ্য ডেটাবেজে আপডেট করা যায়নি / Failed to persist to database' },
          { status: 500 }
        );
      }

      store.foods = updatedFoods;
      saveStore(store);

      return NextResponse.json({ success: true, item: updatedFood });
    }

    if (type === 'category') {
      const idx = store.categories.findIndex((c) => c.id === data.id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }

      const updatedCategory = {
        ...store.categories[idx],
        ...data,
      };

      const updatedCategories = [...store.categories];
      updatedCategories[idx] = updatedCategory;

      // Await durable write to Firestore
      try {
        await saveMenuToFirestore(store.foods, updatedCategories, store.offers);
      } catch (dbErr) {
        console.error('Critical: Failed to update category in Firestore:', dbErr);
        return NextResponse.json(
          { error: 'ক্যাটাগরি ডেটাবেজে আপডেট করা যায়নি / Failed to persist to database' },
          { status: 500 }
        );
      }

      store.categories = updatedCategories;
      saveStore(store);

      return NextResponse.json({ success: true, item: updatedCategory });
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
      const updatedFoods = store.foods.filter((f) => f.id !== id);

      // Await durable write to Firestore
      try {
        await saveMenuToFirestore(updatedFoods, store.categories, store.offers);
      } catch (dbErr) {
        console.error('Critical: Failed to delete food from Firestore:', dbErr);
        return NextResponse.json(
          { error: 'খাবারটি ডেটাবেজ থেকে মুছে ফেলা যায়নি / Failed to delete from database' },
          { status: 500 }
        );
      }

      store.foods = updatedFoods;
      saveStore(store);

      return NextResponse.json({ success: true });
    }

    if (type === 'category') {
      const updatedCategories = store.categories.filter((c) => c.id !== id);

      // Await durable write to Firestore
      try {
        await saveMenuToFirestore(store.foods, updatedCategories, store.offers);
      } catch (dbErr) {
        console.error('Critical: Failed to delete category from Firestore:', dbErr);
        return NextResponse.json(
          { error: 'ক্যাটাগরি ডেটাবেজ থেকে মুছে ফেলা যায়নি / Failed to delete from database' },
          { status: 500 }
        );
      }

      store.categories = updatedCategories;
      saveStore(store);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
