'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-2xl mb-4">
        !
      </div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">কিছু একটি সমস্যা হয়েছে</h2>
      <p className="text-stone-600 text-sm max-w-sm mb-6">
        দুঃখিত, কোনো একটি ত্রুটি ঘটেছে। পুনরায় চেষ্টা করুন অথবা হোম পেজে যান।
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#0B5D3B] hover:bg-[#08482E] text-white font-bold text-sm rounded-xl transition-all shadow-md"
        >
          পুনরায় চেষ্টা করুন
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl transition-all"
        >
          হোমে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
