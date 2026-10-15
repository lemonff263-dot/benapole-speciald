'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="bn">
      <body className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-black text-2xl mb-4">
          !
        </div>
        <h2 className="text-2xl font-black text-stone-900 mb-2">সিস্টেমে ত্রুটি হয়েছে</h2>
        <p className="text-stone-600 text-sm max-w-sm mb-6">
          পেজটি লোড হতে সমস্যা হয়েছে। দয়া করে রিফ্রেশ করুন।
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[#0B5D3B] hover:bg-[#08482E] text-white font-bold text-sm rounded-xl transition-all shadow-md"
        >
          আবার চেষ্টা করুন
        </button>
      </body>
    </html>
  );
}
