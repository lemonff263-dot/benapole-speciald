'use client';

import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export function AdminLoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}) {
  const { lang } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'ভুল পাসওয়ার্ড');
        setIsLoading(false);
        return;
      }

      localStorage.setItem('bs_admin_token', 'bs_admin_session_valid_2026');
      if (rememberMe) {
        localStorage.setItem('bs_admin_remember_me', 'true');
      } else {
        localStorage.removeItem('bs_admin_remember_me');
      }

      setPassword('');
      onLoginSuccess();
    } catch {
      setError('লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#0B5D3B] ring-4 ring-emerald-100/50">
          <Lock className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-black text-stone-900">
            {lang === 'bn' ? 'এডমিন লগইন' : 'Admin Login'}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            {lang === 'bn' ? 'ম্যানেজমেন্ট প্যানেল অ্যাক্সেস করতে পাসওয়ার্ড দিন' : 'Enter admin password to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-stone-700 block mb-1">
              {lang === 'bn' ? 'এডমিন পাসওয়ার্ড' : 'Password'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm p-3 rounded-xl border border-stone-200 focus:border-[#0B5D3B] outline-hidden pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-700"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer select-none bg-stone-50 p-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 transition-colors">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-[#0B5D3B] focus:ring-[#0B5D3B] accent-[#0B5D3B] cursor-pointer"
            />
            <div className="text-left">
              <span className="text-xs font-bold text-stone-800 block">
                {lang === 'bn' ? 'আমাকে মনে রাখুন (Remember Me)' : 'Remember Me'}
              </span>
              <span className="text-[10px] text-stone-500 block leading-tight">
                {lang === 'bn'
                  ? 'পরবর্তীতে পাসওয়ার্ড ছাড়াই স্বয়ংক্রিয়ভাবে সরাসরি এডমিন প্যানেলে প্রবেশ করবেন'
                  : 'Auto-login on future visits without entering password'}
              </span>
            </div>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0B5D3B] hover:bg-[#08482E] active:scale-98 disabled:opacity-70 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#F4D05F]" />
            )}
            <span>{lang === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
