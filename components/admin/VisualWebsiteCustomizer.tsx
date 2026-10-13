'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Undo2,
  Redo2,
  Save,
  Send,
  RotateCcw,
  Smartphone,
  Monitor,
  Eye,
  Sliders,
  Palette,
  LayoutGrid,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { CustomizerTheme } from '@/lib/types';
import { defaultTheme } from '@/lib/constants';
import { BenapoleLogo } from '../BrandLogos';

const getAdminHeaders = () => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('bs_admin_token') || 'bs_admin_session_valid_2026'
      : 'bs_admin_session_valid_2026';
  return {
    'Content-Type': 'application/json',
    'x-admin-token': token,
    Authorization: `Bearer ${token}`,
  };
};

export function VisualWebsiteCustomizer({
  onClose,
  onPublishSuccess,
}: {
  onClose: () => void;
  onPublishSuccess: () => void;
}) {
  const [theme, setTheme] = useState<CustomizerTheme>(defaultTheme);
  const [history, setHistory] = useState<CustomizerTheme[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isEditMode, setIsEditMode] = useState(true);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'sections' | 'style' | 'settings'>('sections');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>('hero');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Fetch draft theme on mount
  useEffect(() => {
    const fetchDraft = async () => {
      try {
        const res = await fetch('/api/admin/customizer', { headers: getAdminHeaders() });
        if (res.ok) {
          const data = await res.json();
          if (data.draftTheme) {
            setTheme(data.draftTheme);
            setHistory([data.draftTheme]);
            setHistoryIndex(0);
          }
        }
      } catch (e) {
        console.error('Failed to load customizer draft', e);
      }
    };
    fetchDraft();
  }, []);

  const updateTheme = (newTheme: CustomizerTheme) => {
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newTheme);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
    setTheme(newTheme);
    setHasUnsavedChanges(true);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setTheme(prev);
      setHasUnsavedChanges(true);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setTheme(next);
      setHasUnsavedChanges(true);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/customizer', {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify({ draftTheme: theme }),
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        showToast('খসড়া সফলভাবে সংরক্ষণ হয়েছে (Draft Saved)');
      }
    } catch {
      showToast('সংরক্ষণে সমস্যা হয়েছে');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('আপনি কি এই কাস্টমাইজেশন লাইভ ওয়েবসাইটে প্রকাশ করতে চান?')) return;
    setIsPublishing(true);
    try {
      const res = await fetch('/api/admin/customizer', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'publish', theme }),
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        showToast('সফলভাবে লাইভ ওয়েবসাইটে পাবলিশ হয়েছে! (Published Live)');
        onPublishSuccess();
      }
    } catch {
      showToast('পাবলিশ ব্যর্থ হয়েছে');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm('আপনি কি সব কাস্টমাইজেশন বাতিল করে ডিফল্ট ডিজাইনে ফিরতে চান?')) return;
    try {
      const res = await fetch('/api/admin/customizer', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ action: 'reset_defaults' }),
      });
      if (res.ok) {
        const data = await res.json();
        setTheme(data.draftTheme);
        setHasUnsavedChanges(true);
        showToast('ডিফল্ট থিমে ফিরিয়ে দেওয়া হয়েছে');
      }
    } catch {
      showToast('রিসেট ব্যর্থ হয়েছে');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900 text-stone-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#0B5D3B] text-white px-4 py-2 rounded-xl shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Top Workspace Header Bar */}
      <header className="h-14 bg-stone-950 border-b border-stone-800 px-4 flex items-center justify-between shrink-0">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-stone-800 text-stone-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">এডমিন ড্যাশবোর্ড</span>
          </button>
          <div className="h-4 w-px bg-stone-800" />
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xs sm:text-sm text-white">ওয়েবসাইট কাস্টমাইজ</span>
            {hasUnsavedChanges && (
              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                অসংরক্ষিত পরিবর্তন
              </span>
            )}
          </div>
        </div>

        {/* Center: Device & Mode Switcher */}
        <div className="flex items-center gap-2">
          {/* Mobile / Desktop Toggle */}
          <div className="hidden sm:flex bg-stone-900 border border-stone-800 p-0.5 rounded-xl text-xs">
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                previewDevice === 'mobile' ? 'bg-[#0B5D3B] text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Mobile Device (Android/iOS)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">মোবাইল</span>
            </button>
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                previewDevice === 'desktop' ? 'bg-[#0B5D3B] text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">ডেস্কটপ</span>
            </button>
          </div>

          {/* Edit Mode vs Preview Mode Switch */}
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isEditMode
                ? 'bg-emerald-950/80 border-[#0B5D3B] text-emerald-300'
                : 'bg-stone-800 border-stone-700 text-stone-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isEditMode ? 'এডিট মোড অন' : 'লাইভ প্রিভিউ'}</span>
          </button>
        </div>

        {/* Right: Actions (Undo/Redo, Save Draft, Publish) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-stone-800 transition-colors"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 text-stone-400 hover:text-white disabled:opacity-30 rounded-lg hover:bg-stone-800 transition-colors"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetDefaults}
            className="hidden md:flex items-center gap-1 text-[11px] text-stone-400 hover:text-red-400 px-2 py-1.5 rounded-lg hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-700 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ড্রাফট সংরক্ষণ</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-1.5 bg-[#F7931E] hover:bg-[#E58210] active:scale-95 text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-md transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>প্রকাশ করুন (Publish)</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Left Controls Panel + Center Live Simulator */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Properties & Sections Inspector Panel */}
        <div className="w-80 md:w-96 bg-stone-950 border-r border-stone-800 flex flex-col shrink-0">
          {/* Panel Tabs */}
          <div className="flex border-b border-stone-800 text-xs font-bold">
            <button
              onClick={() => setActiveSidebarTab('sections')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'sections'
                  ? 'border-[#0B5D3B] text-emerald-400 bg-stone-900/40'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>সেকশন সমূহ</span>
            </button>

            <button
              onClick={() => setActiveSidebarTab('style')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
                activeSidebarTab === 'style'
                  ? 'border-[#0B5D3B] text-emerald-400 bg-stone-900/40'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>রং ও স্টাইল</span>
            </button>
          </div>

          {/* Panel Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* TAB: SECTIONS MANAGER */}
            {activeSidebarTab === 'sections' && (
              <div className="space-y-3">
                <p className="text-[11px] text-stone-400">
                  নিচের যেকোনো সেকশনে ক্লিক করে লেখা, ছবি ও বাটন পরিবর্তন করুন:
                </p>

                {/* Section Cards */}
                {[
                  { id: 'hero', name: 'হিরো ও ব্যানার (Hero Section)', active: theme.sections.hero.enabled },
                  { id: 'header', name: 'হেডার ও নেভিগেশন', active: theme.sections.header.enabled },
                  { id: 'categories', name: 'ক্যাটাগরি শর্টকাট', active: theme.sections.categories.enabled },
                  { id: 'featured', name: 'জনপ্রিয় খাবার সেকশন', active: theme.sections.featuredFoods.enabled },
                  { id: 'offers', name: 'অফার ও প্রোমো ব্যানার', active: theme.sections.offers.enabled },
                  { id: 'benefits', name: 'সার্ভিস ও সুবিধাসমূহ', active: theme.sections.benefits.enabled },
                  { id: 'about', name: 'রেস্টুরেন্টের গল্প ও পরিবেশ', active: theme.sections.about.enabled },
                  { id: 'gallery', name: 'ফটো গ্যালারি', active: theme.sections.gallery.enabled },
                  { id: 'contact', name: 'যোগাযোগ ও লোকেশন', active: theme.sections.contactLocation.enabled },
                  { id: 'footer', name: 'ফুটার ও কপিরাইট', active: theme.sections.footer.enabled },
                ].map((sec) => (
                  <div
                    key={sec.id}
                    className={`rounded-xl border transition-all ${
                      selectedSection === sec.id
                        ? 'border-[#0B5D3B] bg-emerald-950/30'
                        : 'border-stone-800 bg-stone-900 hover:border-stone-700'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedSection(sec.id)}
                      className="p-3 flex items-center justify-between cursor-pointer"
                    >
                      <span className="font-bold text-stone-200">{sec.name}</span>
                      <ChevronRight
                        className={`w-4 h-4 text-stone-500 transition-transform ${
                          selectedSection === sec.id ? 'rotate-90 text-emerald-400' : ''
                        }`}
                      />
                    </div>

                    {/* Expanded Edit Form for the Selected Section */}
                    {selectedSection === sec.id && (
                      <div className="p-3 border-t border-stone-800 bg-stone-950/50 space-y-3 animate-in fade-in">
                        {/* HERO SECTION EDIT */}
                        {sec.id === 'hero' && (
                          <>
                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">
                                প্রধান শিরোনাম (বাংলা)
                              </label>
                              <input
                                type="text"
                                value={theme.sections.hero.headline.bn}
                                onChange={(e) =>
                                  updateTheme({
                                    ...theme,
                                    sections: {
                                      ...theme.sections,
                                      hero: {
                                        ...theme.sections.hero,
                                        headline: { ...theme.sections.hero.headline, bn: e.target.value },
                                      },
                                    },
                                  })
                                }
                                className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">
                                সাব-হেডিং / বিবরণ (বাংলা)
                              </label>
                              <textarea
                                rows={2}
                                value={theme.sections.hero.subheading.bn}
                                onChange={(e) =>
                                  updateTheme({
                                    ...theme,
                                    sections: {
                                      ...theme.sections,
                                      hero: {
                                        ...theme.sections.hero,
                                        subheading: { ...theme.sections.hero.subheading, bn: e.target.value },
                                      },
                                    },
                                  })
                                }
                                className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">
                                ব্যাজ লেখা (Offer Badge)
                              </label>
                              <input
                                type="text"
                                value={theme.sections.hero.badgeText.bn}
                                onChange={(e) =>
                                  updateTheme({
                                    ...theme,
                                    sections: {
                                      ...theme.sections,
                                      hero: {
                                        ...theme.sections.hero,
                                        badgeText: { ...theme.sections.hero.badgeText, bn: e.target.value },
                                      },
                                    },
                                  })
                                }
                                className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">
                                বাটন টেক্সট (CTA Button)
                              </label>
                              <input
                                type="text"
                                value={theme.sections.hero.ctaText.bn}
                                onChange={(e) =>
                                  updateTheme({
                                    ...theme,
                                    sections: {
                                      ...theme.sections,
                                      hero: {
                                        ...theme.sections.hero,
                                        ctaText: { ...theme.sections.hero.ctaText, bn: e.target.value },
                                      },
                                    },
                                  })
                                }
                                className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                              />
                            </div>
                          </>
                        )}

                        {/* ABOUT SECTION EDIT */}
                        {sec.id === 'about' && (
                          <>
                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">সেকশন টাইটেল</label>
                              <input
                                type="text"
                                value={theme.sections.about.title.bn}
                                onChange={(e) =>
                                  updateTheme({
                                    ...theme,
                                    sections: {
                                      ...theme.sections,
                                      about: {
                                        ...theme.sections.about,
                                        title: { ...theme.sections.about.title, bn: e.target.value },
                                      },
                                    },
                                  })
                                }
                                className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] text-stone-400 block mb-1">আমাদের গল্প</label>
                              <textarea
                                rows={3}
                                value={theme.sections.about.story.bn}
                                onChange={(e) =>
                                  updateTheme({
                                    ...theme,
                                    sections: {
                                      ...theme.sections,
                                      about: {
                                        ...theme.sections.about,
                                        story: { ...theme.sections.about.story, bn: e.target.value },
                                      },
                                    },
                                  })
                                }
                                className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                              />
                            </div>
                          </>
                        )}

                        {/* OFFERS SECTION EDIT */}
                        {sec.id === 'offers' && (
                          <div>
                            <label className="text-[11px] text-stone-400 block mb-1">অফার টাইটেল</label>
                            <input
                              type="text"
                              value={theme.sections.offers.title.bn}
                              onChange={(e) =>
                                updateTheme({
                                  ...theme,
                                  sections: {
                                    ...theme.sections,
                                    offers: {
                                      ...theme.sections.offers,
                                      title: { ...theme.sections.offers.title, bn: e.target.value },
                                    },
                                  },
                                })
                              }
                              className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                            />
                          </div>
                        )}

                        {/* FOOTER SECTION EDIT */}
                        {sec.id === 'footer' && (
                          <div>
                            <label className="text-[11px] text-stone-400 block mb-1">কপিরাইট টেক্সট</label>
                            <input
                              type="text"
                              value={theme.sections.footer.copyrightText.bn}
                              onChange={(e) =>
                                updateTheme({
                                  ...theme,
                                  sections: {
                                    ...theme.sections,
                                    footer: {
                                      ...theme.sections.footer,
                                      copyrightText: {
                                        ...theme.sections.footer.copyrightText,
                                        bn: e.target.value,
                                      },
                                    },
                                  },
                                })
                              }
                              className="w-full p-2 bg-stone-900 border border-stone-800 rounded-lg text-white"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB: STYLE / DESIGN TOKENS */}
            {activeSidebarTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-stone-200 mb-2">ব্র্যান্ড কালার প্যালেট (Brand Colors)</h4>
                  <div className="space-y-3">
                    {/* Primary Color */}
                    <div className="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                      <div>
                        <span className="font-bold block text-stone-200">প্রাইমারি কালার (Primary)</span>
                        <span className="text-[10px] text-stone-400 font-mono">{theme.colors.primary}</span>
                      </div>
                      <input
                        type="color"
                        value={theme.colors.primary}
                        onChange={(e) =>
                          updateTheme({
                            ...theme,
                            colors: { ...theme.colors, primary: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>

                    {/* Secondary Color */}
                    <div className="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                      <div>
                        <span className="font-bold block text-stone-200">সেকেন্ডারি কালার (Secondary)</span>
                        <span className="text-[10px] text-stone-400 font-mono">{theme.colors.secondary}</span>
                      </div>
                      <input
                        type="color"
                        value={theme.colors.secondary}
                        onChange={(e) =>
                          updateTheme({
                            ...theme,
                            colors: { ...theme.colors, secondary: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>

                    {/* Accent Color */}
                    <div className="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                      <div>
                        <span className="font-bold block text-stone-200">একসেন্ট কালার (Accent)</span>
                        <span className="text-[10px] text-stone-400 font-mono">{theme.colors.accent}</span>
                      </div>
                      <input
                        type="color"
                        value={theme.colors.accent}
                        onChange={(e) =>
                          updateTheme({
                            ...theme,
                            colors: { ...theme.colors, accent: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>

                    {/* Background Color */}
                    <div className="flex items-center justify-between p-2.5 bg-stone-900 rounded-xl border border-stone-800">
                      <div>
                        <span className="font-bold block text-stone-200">ব্যাকগ্রাউন্ড (Canvas)</span>
                        <span className="text-[10px] text-stone-400 font-mono">{theme.colors.background}</span>
                      </div>
                      <input
                        type="color"
                        value={theme.colors.background}
                        onChange={(e) =>
                          updateTheme({
                            ...theme,
                            colors: { ...theme.colors, background: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Corner Radius */}
                <div className="space-y-2 pt-2 border-t border-stone-800">
                  <h4 className="font-bold text-stone-200">কার্ড ও বাটনের কোণা (Radius)</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {['rounded-xl', 'rounded-2xl', 'rounded-3xl'].map((r) => (
                      <button
                        key={r}
                        onClick={() =>
                          updateTheme({
                            ...theme,
                            typography: {
                              ...theme.typography,
                              borderRadius: r as any,
                            },
                          })
                        }
                        className={`p-2 rounded-xl text-center font-bold text-[11px] border transition-colors ${
                          theme.typography.borderRadius === r
                            ? 'bg-[#0B5D3B] border-[#0B5D3B] text-white'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                        }`}
                      >
                        {r.replace('rounded-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center Live Website Interactive Simulator Canvas */}
        <div className="flex-1 bg-stone-900/60 p-4 md:p-6 overflow-y-auto flex items-start justify-center">
          <div
            className={`transition-all duration-300 shadow-2xl overflow-hidden bg-white text-stone-900 rounded-3xl border-4 border-stone-800 relative flex flex-col ${
              previewDevice === 'mobile'
                ? 'w-[390px] min-h-[780px] max-h-[850px]'
                : 'w-full max-w-4xl min-h-[780px]'
            }`}
          >
            {/* Phone Notch/Header for realistic device mockup */}
            {previewDevice === 'mobile' && (
              <div className="h-6 bg-stone-100 flex items-center justify-between px-6 shrink-0 border-b border-stone-200 text-[10px] font-bold text-stone-500">
                <span>9:41</span>
                <div className="w-16 h-3 bg-stone-300 rounded-full mx-auto" />
                <span>5G 100%</span>
              </div>
            )}

            {/* Scrollable Simulated Web App Preview */}
            <div className="flex-1 overflow-y-auto">
              {/* Simulated Header */}
              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BenapoleLogo className="h-7 w-auto" />
                  <span className="font-extrabold text-xs text-[#0B5D3B]">
                    {theme.sections.hero.headline.bn.split('—')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-[#0B5D3B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    কার্ট (০)
                  </span>
                </div>
              </div>

              {/* Simulated Hero */}
              <div className="p-4 bg-gradient-to-b from-[#FFFDF7] to-stone-50 border-b border-stone-200 space-y-3">
                <div className="inline-block bg-emerald-50 text-[#0B5D3B] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {theme.sections.hero.badgeText.bn}
                </div>
                <h1 className="text-xl font-black text-stone-900 leading-tight">
                  {theme.sections.hero.headline.bn}
                </h1>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {theme.sections.hero.subheading.bn}
                </p>
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={theme.sections.hero.backgroundImage || '/images/doi_chira.jpg'}
                    alt="Hero"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/doi_chira.jpg';
                    }}
                  />
                </div>
                <button
                  style={{ backgroundColor: theme.colors.primary }}
                  className="w-full text-white font-bold text-xs py-3 rounded-xl shadow-xs"
                >
                  {theme.sections.hero.ctaText.bn}
                </button>
              </div>

              {/* Simulated Food Highlights */}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs text-stone-900">
                    {theme.sections.featuredFoods.title.bn}
                  </h3>
                  <span className="text-[10px] text-[#0B5D3B] font-bold">সব খাবার →</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl border border-stone-200 bg-white space-y-1.5 shadow-2xs">
                    <img
                      src="/images/doi_chira.jpg"
                      alt="Doi Chira"
                      className="aspect-square rounded-lg object-cover"
                    />
                    <p className="font-bold text-[11px] truncate">দই চিড়া (হাফ বাটি)</p>
                    <p className="text-xs font-black text-[#0B5D3B]">৳৬০</p>
                  </div>
                  <div className="p-2 rounded-xl border border-stone-200 bg-white space-y-1.5 shadow-2xs">
                    <img
                      src="/images/nachos.jpg"
                      alt="Nachos"
                      className="aspect-square rounded-lg object-cover"
                    />
                    <p className="font-bold text-[11px] truncate">চিকেন চিজি নাচোস</p>
                    <p className="text-xs font-black text-[#0B5D3B]">৳৮০</p>
                  </div>
                </div>
              </div>

              {/* Simulated Story */}
              <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-2">
                <h4 className="font-bold text-xs text-stone-900">
                  {theme.sections.about.title.bn}
                </h4>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  {theme.sections.about.story.bn}
                </p>
              </div>

              {/* Simulated Footer */}
              <div className="p-4 text-center border-t border-stone-200 text-[10px] text-stone-400">
                <p>{theme.sections.footer.copyrightText.bn}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
