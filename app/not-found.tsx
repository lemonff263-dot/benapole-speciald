import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#0B5D3B] flex items-center justify-center font-black text-2xl mb-4">
        404
      </div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">পেজটি খুঁজে পাওয়া যায়নি</h2>
      <p className="text-stone-600 text-sm max-w-sm mb-6">
        আপনি যে পেজটি খুঁজছেন তা স্থানান্তরিত বা মুছে ফেলা হয়েছে।
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-[#0B5D3B] hover:bg-[#08482E] text-white font-bold text-sm rounded-xl transition-all shadow-md"
      >
        হোম পেজে ফিরে যান
      </Link>
    </div>
  );
}
