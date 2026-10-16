import { NextRequest, NextResponse } from 'next/server';
import { CustomerReview } from '@/lib/types';
import {
  getReviewsFromFirestore,
  saveReviewToFirestore,
} from '@/lib/firestoreService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const reviews = await getReviewsFromFirestore(50);
    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.warn('Failed to fetch reviews from Firestore, returning empty list:', err);
    return NextResponse.json({ success: true, reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, location, foodName, rating, comment } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'নাম প্রদান করা আবশ্যক / Name is required' },
        { status: 400 }
      );
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'মতামত বা রিভিউ লেখা আবশ্যক / Review comment is required' },
        { status: 400 }
      );
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return NextResponse.json(
        { error: 'রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে / Rating must be 1 to 5' },
        { status: 400 }
      );
    }

    const newReview: CustomerReview = {
      id: 'rev_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      name: name.trim().slice(0, 100),
      location: (location && typeof location === 'string' ? location.trim() : 'বেনাপোল').slice(0, 80),
      foodName: (foodName && typeof foodName === 'string' ? foodName.trim() : 'বেনাপোল স্পেশাল ফুড').slice(0, 120),
      rating: Math.round(numRating),
      comment: comment.trim().slice(0, 500),
      date: new Date().toISOString(),
      isVerified: true,
    };

    // Await durable write to Firestore
    try {
      await saveReviewToFirestore(newReview);
    } catch (dbErr) {
      console.error('Critical: Failed to save review to Firestore:', dbErr);
      return NextResponse.json(
        { error: 'রিভিউটি ডেটাবেজে সংরক্ষণ করা সম্ভব হয়নি / Failed to persist review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, review: newReview });
  } catch (err) {
    return NextResponse.json(
      { error: 'রিভিউ সাবমিট করতে ত্রুটি হয়েছে' },
      { status: 500 }
    );
  }
}
