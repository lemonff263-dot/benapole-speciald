'use client';

import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  CheckCircle,
  Sparkles,
  Plus,
  ThumbsUp,
  X,
  User,
  MapPin,
  Send,
  Heart,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerReview } from '@/lib/types';
import { defaultReviews } from '@/lib/constants';
import { useApp } from '@/context/AppContext';

export function CustomerReviews() {
  const { lang, t } = useApp();
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'doi_chira' | 'fast_food' | '5_star'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});

  // Review Form State
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('বেনাপোল পৌরসভা');
  const [newFoodName, setNewFoodName] = useState('বেনাপোল স্পেশাল দই চিড়া');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load reviews from /api/reviews with localStorage fallback
  useEffect(() => {
    let isMounted = true;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && Array.isArray(data.reviews)) {
            setReviews(data.reviews);
            try {
              localStorage.setItem('benapole_customer_reviews', JSON.stringify(data.reviews));
            } catch {}
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to fetch reviews from server, checking local storage:', err);
      }

      // Local storage fallback
      try {
        const stored = localStorage.getItem('benapole_customer_reviews');
        if (isMounted && stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setReviews(parsed);
          }
        }
      } catch {}
    };

    fetchReviews();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLike = (id: string) => {
    setLikeCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          location: newLocation.trim() || 'বেনাপোল পৌরসভা',
          foodName: newFoodName.trim() || 'বেনাপোল স্পেশাল ফুড',
          rating: newRating,
          comment: newComment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'রিভিউ সাবমিট করতে সমস্যা হয়েছে');
        setIsSubmitting(false);
        return;
      }

      const savedReview: CustomerReview = data.review;
      const updated = [savedReview, ...reviews];
      setReviews(updated);
      try {
        localStorage.setItem('benapole_customer_reviews', JSON.stringify(updated));
      } catch {}

      setFormSuccess(true);
      setTimeout(() => {
        setFormSuccess(false);
        setIsModalOpen(false);
        setNewName('');
        setNewComment('');
        setIsSubmitting(false);
      }, 1200);
    } catch {
      setSubmitError('ইন্টারনেট সংযোগ চেক করুন এবং পুনরায় চেষ্টা করুন');
      setIsSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'doi_chira') {
      return r.foodName?.includes('দই চিড়া') || r.foodName?.toLowerCase().includes('doi chira');
    }
    if (selectedFilter === 'fast_food') {
      return (
        r.foodName?.includes('নাচোস') ||
        r.foodName?.includes('বার্গার') ||
        r.foodName?.includes('চাউমিন') ||
        r.foodName?.includes('পাস্তা')
      );
    }
    if (selectedFilter === '5_star') {
      return r.rating === 5;
    }
    return true;
  });

  return (
    <section id="reviews-section" className="py-12 sm:py-16 bg-[#FFFDF7] border-b border-stone-200/90 relative overflow-hidden">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/90 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{lang === 'bn' ? '১০০% আসল কাস্টমার রিভিউ' : '100% Genuine Reviews'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-900 tracking-tight leading-tight">
              {lang === 'bn' ? 'গ্রাহকদের রিভিউ ও সন্তুষ্টির গল্প' : 'Customer Reviews & Love'}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-xl">
              {lang === 'bn'
                ? 'বেনাপোল স্পেশালের দই চিড়া ও ফাস্টফুড খেয়ে সম্মানিত গ্রাহকরা কী বলছেন নিজের চোখে দেখুন।'
                : 'See why our guests in Benapole love our signature Doi Chira and artisan fast foods.'}
            </p>
          </div>

          {/* Overall Score & Add Review Action */}
          {(() => {
            const avgRatingNumber = reviews.length > 0
              ? reviews.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / reviews.length
              : 0;
            const avgRatingString = avgRatingNumber > 0 ? avgRatingNumber.toFixed(1) : '0.0';
            const toBnDigits = (str: string) =>
              str
                .replace(/0/g, '০')
                .replace(/1/g, '১')
                .replace(/2/g, '২')
                .replace(/3/g, '৩')
                .replace(/4/g, '৪')
                .replace(/5/g, '৫')
                .replace(/6/g, '৬')
                .replace(/7/g, '৭')
                .replace(/8/g, '৮')
                .replace(/9/g, '৯');
            const avgRatingDisplay = lang === 'bn' ? toBnDigits(avgRatingString) : avgRatingString;
            const reviewCountDisplay = lang === 'bn' ? toBnDigits(reviews.length.toString()) : reviews.length.toString();

            return (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border-2 border-stone-200 shadow-2xs">
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-black text-stone-900">{avgRatingDisplay}</span>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              reviews.length > 0 && i < Math.round(avgRatingNumber)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-stone-500">
                      {reviews.length > 0
                        ? lang === 'bn'
                          ? `${reviewCountDisplay}টি আসল রিভিউ`
                          : `${reviewCountDisplay} Verified Reviews`
                        : lang === 'bn'
                        ? '০টি রিভিউ • কোনো রেটিং নেই'
                        : '0 Reviews • No rating yet'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#F4D05F]" />
                  <span>{lang === 'bn' ? 'রিভিউ দিন' : 'Write Review'}</span>
                </button>
              </div>
            );
          })()}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              selectedFilter === 'all'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? 'সকল রিভিউ (All)' : 'All Reviews'}
          </button>
          <button
            onClick={() => setSelectedFilter('doi_chira')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              selectedFilter === 'doi_chira'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? 'দই চিড়া স্পেশাল' : 'Doi Chira'}
          </button>
          <button
            onClick={() => setSelectedFilter('fast_food')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              selectedFilter === 'fast_food'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? 'নাচোস ও ফাস্টফুড' : 'Nachos & Fast Food'}
          </button>
          <button
            onClick={() => setSelectedFilter('5_star')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
              selectedFilter === '5_star'
                ? 'bg-[#0B5D3B] text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {lang === 'bn' ? '⭐ ৫ স্টার রিভিউ' : '5 Star Reviews'}
          </button>
        </div>

        {/* Review Cards Grid or Empty State */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border-2 border-stone-200/90 shadow-2xs space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 mx-auto flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-500" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-black text-lg text-stone-900">
                {reviews.length === 0
                  ? lang === 'bn'
                    ? 'এখনো কোনো কাস্টমার রিভিউ যোগ করা হয়নি'
                    : 'No Customer Reviews Added Yet'
                  : lang === 'bn'
                  ? 'এই ফিল্টারে কোনো রিভিউ পাওয়া যায়নি'
                  : 'No reviews found in this filter'}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-medium leading-relaxed">
                {reviews.length === 0
                  ? lang === 'bn'
                    ? 'আমাদের খাবার কেমন লেগেছে? আপনি কি খাবার টেস্ট করেছেন? প্রথম রিভিউটি দিয়ে আপনার মূল্যবান মতামত জানান!'
                    : 'Have you tasted our food? Be the first to share your dining experience and leave a review!'
                  : lang === 'bn'
                  ? 'অন্য ফিল্টার নির্বাচন করে দেখুন অথবা নতুন রিভিউ দিন।'
                  : 'Try selecting another filter or write a new review.'}
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#0B5D3B] hover:bg-[#08482E] active:scale-95 text-white px-5 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#F4D05F]" />
              <span>{lang === 'bn' ? 'প্রথম রিভিউ দিন' : 'Write First Review'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredReviews.map((rev) => (
              <motion.div
                key={rev.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-5 border-2 border-stone-200/90 shadow-2xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header: User Info & Stars */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0B5D3B] font-black flex items-center justify-center text-sm">
                        {rev.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-black text-sm text-stone-900 leading-tight">
                            {rev.name}
                          </span>
                          {rev.isVerified && (
                            <span title="যাচাইকৃত গ্রাহক">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium">
                          <MapPin className="w-3 h-3 text-[#F7931E]" />
                          <span>{rev.location || 'বেনাপোল'}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] font-bold text-stone-400 shrink-0">
                      {rev.date}
                    </span>
                  </div>

                  {/* Rating Stars & Ordered Dish Tag */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-100">
                    <div className="flex text-amber-400">
                      {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {rev.foodName && (
                      <span className="text-[11px] font-black bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded-lg truncate max-w-[170px]">
                        {rev.foodName}
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-stone-700 font-medium leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>

                {/* Bottom Helpful / Like Action */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-bold">
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                    ✓ ভেরিফাইড রিভিউ
                  </span>
                  <button
                    onClick={() => handleLike(rev.id)}
                    className="flex items-center gap-1.5 hover:text-[#0B5D3B] transition-colors cursor-pointer p-1"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'bn' ? 'উপকারী' : 'Helpful'}
                      {likeCounts[rev.id] ? ` (${likeCounts[rev.id]})` : ''}
                    </span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-stone-200"
            >
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#0B5D3B] text-white flex items-center justify-center font-black">
                    <MessageSquare className="w-4 h-4 text-[#F4D05F]" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-stone-900 leading-tight">
                      {lang === 'bn' ? 'আপনার মতামত ও রিভিউ দিন' : 'Write a Review'}
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      {lang === 'bn' ? 'বেনাপোল স্পেশাল পরিবারের সাথে আপনার অভিজ্ঞতা শেয়ার করুন' : 'Share your food experience'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formSuccess ? (
                <div className="p-6 text-center space-y-2">
                  <CheckCircle className="w-12 h-12 text-[#0B5D3B] mx-auto animate-bounce" />
                  <h4 className="font-black text-base text-stone-900">
                    {lang === 'bn' ? 'ধন্যবাদ! আপনার রিভিউ যোগ হয়েছে।' : 'Thank you for your review!'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    আপনার মূল্যবান মতামতের জন্য আমরা কৃতজ্ঞ।
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
                  {/* Rating Selector */}
                  <div>
                    <label className="font-black text-stone-800 block mb-1.5">
                      {lang === 'bn' ? 'স্টার রেটিং নির্বাচন করুন *' : 'Your Rating *'}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="font-black text-sm text-stone-800 ml-2">
                        {newRating} / ৫ স্টার
                      </span>
                    </div>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="font-black text-stone-800 block mb-1">
                      {lang === 'bn' ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: তানভীর আহমেদ' : 'e.g. Tanvir Ahmed'}
                      className="w-full p-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-900 font-bold focus:border-[#0B5D3B] outline-hidden"
                    />
                  </div>

                  {/* Area Input */}
                  <div>
                    <label className="font-black text-stone-800 block mb-1">
                      {lang === 'bn' ? 'আপনার এলাকা (বেনাপোল)' : 'Your Area in Benapole'}
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: কাস্টমস মোড়, পৌরসভা...' : 'e.g. Customs Mor'}
                      className="w-full p-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-900 font-bold focus:border-[#0B5D3B] outline-hidden"
                    />
                  </div>

                  {/* Dish Name */}
                  <div>
                    <label className="font-black text-stone-800 block mb-1">
                      {lang === 'bn' ? 'কোন খাবারটি অর্ডার করেছিলেন?' : 'Dish Name'}
                    </label>
                    <input
                      type="text"
                      value={newFoodName}
                      onChange={(e) => setNewFoodName(e.target.value)}
                      placeholder="বেনাপোল স্পেশাল দই চিড়া"
                      className="w-full p-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-900 font-bold focus:border-[#0B5D3B] outline-hidden"
                    />
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="font-black text-stone-800 block mb-1">
                      {lang === 'bn' ? 'আপনার অনুভূতি ও মন্তব্য *' : 'Your Feedback *'}
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={lang === 'bn' ? 'খাবারের স্বাদ, প্যাকেজিং ও ডেলিভারি কেমন লেগেছে লিখুন...' : 'Write your experience...'}
                      className="w-full p-3 rounded-xl border-2 border-stone-200 bg-stone-50 text-stone-900 font-bold focus:border-[#0B5D3B] outline-hidden resize-none"
                    />
                  </div>

                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 disabled:opacity-60 text-white font-black text-sm py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className={`w-4 h-4 text-[#F4D05F] ${isSubmitting ? 'animate-spin' : ''}`} />
                    <span>
                      {isSubmitting
                        ? lang === 'bn'
                          ? 'সংরক্ষণ করা হচ্ছে...'
                          : 'Saving...'
                        : lang === 'bn'
                        ? 'রিভিউ সাবমিট করুন'
                        : 'Submit Review'}
                    </span>
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
