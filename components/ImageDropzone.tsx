'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, CheckCircle2, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface ImageDropzoneProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function ImageDropzone({
  value,
  onChange,
  label = 'খাবারের ছবি আপলোড',
  hint = 'ড্র্যাগ করে ছেড়ে দিন অথবা গ্যালারি থেকে সিলেক্ট করুন',
  className = '',
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('অনুগ্রহ করে একটি ছবি ফাইল (JPG, PNG, WebP) নির্বাচন করুন।');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        setIsProcessing(false);
        return;
      }

      // Always resize and compress smoothly using canvas to ensure crisp, lightweight images
      const img = new Image();
      img.onload = () => {
        const maxWidth = 600;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.72);
          onChange(compressed);
          setIsProcessing(false);
          return;
        }

        onChange(result);
        setIsProcessing(false);
      };

      img.onerror = () => {
        onChange(result);
        setIsProcessing(false);
      };

      img.src = result;
    };

    reader.onerror = () => {
      setIsProcessing(false);
      alert('ছবি লোড করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#0B5D3B]" />
          <span>{label}</span>
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#0B5D3B] hover:underline font-bold flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'ড্রপজোন ব্যবহার করুন' : 'সরাসরি লিঙ্ক দিন'}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-[#0B5D3B] outline-none"
          />
        </div>
      ) : (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {value ? (
            /* Image Preview Card */
            <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 bg-stone-50 group shadow-xs">
              <div className="aspect-[16/9] w-full max-h-48 relative overflow-hidden bg-stone-100 flex items-center justify-center">
                <img
                  src={value}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
                  }}
                />
              </div>

              <div className="p-2.5 bg-white border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">ছবি সফলভাবে যুক্ত হয়েছে</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-[#0B5D3B] hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>পরিবর্তন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>মুছুন</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Drag & Drop Upload Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-[#0B5D3B] bg-emerald-50 scale-[1.01] shadow-md'
                  : 'border-stone-300 hover:border-[#0B5D3B] hover:bg-stone-50 bg-stone-50/50'
              }`}
            >
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-2">
                  <div className="w-8 h-8 border-3 border-[#0B5D3B] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-stone-700">ছবি প্রস্তুত হচ্ছে...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-emerald-50 text-[#0B5D3B] rounded-2xl border border-emerald-100 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-extrabold text-stone-900 block">
                      {isDragging ? 'এখানে ছেড়ে দিন!' : 'ছবি এখানে ড্র্যাগ করে এনে ছেড়ে দিন'}
                    </span>
                    <span className="text-[11px] text-stone-500 font-semibold block mt-0.5">
                      অথবা মোবাইলের গ্যালারি / ফাইল থেকে নির্বাচন করতে চাপুন
                    </span>
                  </div>
                  <span className="inline-block text-[10px] font-bold text-[#0B5D3B] bg-white px-2.5 py-1 rounded-full border border-stone-200 shadow-2xs">
                    JPG, PNG, WebP সমর্থিত
                  </span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
