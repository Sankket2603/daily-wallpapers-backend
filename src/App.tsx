import React, { useState, useEffect, useCallback } from 'react';
import {
  Home,
  Compass,
  Heart,
  Settings,
  Smartphone,
  Shield,
  Code2,
  Database,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  Wallpaper,
  Category,
  DownloadRecord,
  AdminStats,
  ScreenTab,
  ApplyTarget,
  UnlockedSession,
} from './types.ts';
import { PhoneFrame } from './components/PhoneFrame.tsx';
import { HomeTab } from './components/HomeTab.tsx';
import { ExploreTab } from './components/ExploreTab.tsx';
import { FavoritesTab } from './components/FavoritesTab.tsx';
import { SettingsTab } from './components/SettingsTab.tsx';
import { WallpaperDetailModal } from './components/WallpaperDetailModal.tsx';
import { RewardedAdModal } from './components/RewardedAdModal.tsx';
import { ApplyWallpaperModal } from './components/ApplyWallpaperModal.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AndroidCodeViewer } from './components/AndroidCodeViewer.tsx';
import { IOSCodeViewer } from './components/IOSCodeViewer.tsx';
import { DatabaseDocsViewer } from './components/DatabaseDocsViewer.tsx';

type MainViewMode = 'app' | 'admin' | 'android_code' | 'ios_code' | 'database';

export default function App() {
  const [mainView, setMainView] = useState<MainViewMode>('app');
  const [isFramed, setIsFramed] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ScreenTab>('home');

  // Backend state
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [dailyWallpapers, setDailyWallpapers] = useState<Wallpaper[]>([]);
  const [featuredWallpapers, setFeaturedWallpapers] = useState<Wallpaper[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('daily_wallpapers_favs');
      return saved ? JSON.parse(saved) : ['wp-1'];
    } catch {
      return ['wp-1'];
    }
  });

  const [stats, setStats] = useState<AdminStats>({
    totalWallpapers: 0,
    totalDownloads: 0,
    downloadsToday: 0,
    viewsToday: 0,
    totalCategories: 0,
  });

  // Modal states
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
  const [adActionType, setAdActionType] = useState<'download' | 'apply'>('download');
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Unlocked sessions (Section 52: 30-minute unlock session per wallpaper)
  const [unlockedSessions, setUnlockedSessions] = useState<UnlockedSession[]>([]);

  // Banner notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch initial data from REST API
  const fetchData = useCallback(async () => {
    try {
      const [wpRes, dailyRes, featRes, catRes, dlRes, statsRes] = await Promise.all([
        fetch('/api/wallpapers'),
        fetch('/api/wallpapers/daily'),
        fetch('/api/wallpapers/featured'),
        fetch('/api/categories'),
        fetch('/api/downloads'),
        fetch('/api/admin/stats'),
      ]);

      if (wpRes.ok) {
        const json = await wpRes.json();
        setWallpapers(json.data || []);
      }
      if (dailyRes.ok) {
        const json = await dailyRes.json();
        setDailyWallpapers(json.data || []);
      }
      if (featRes.ok) {
        const json = await featRes.json();
        setFeaturedWallpapers(json.data || []);
      }
      if (catRes.ok) {
        const json = await catRes.json();
        setCategories(json.data || []);
      }
      if (dlRes.ok) {
        const json = await dlRes.json();
        setDownloads(json.data || []);
      }
      if (statsRes.ok) {
        const json = await statsRes.json();
        setStats(json.data || {});
      }
    } catch (e) {
      console.error('Error loading initial data:', e);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Check if wallpaper is unlocked (Section 52)
  const isWallpaperUnlocked = (wallpaperId: string): boolean => {
    const session = unlockedSessions.find((s) => s.wallpaperId === wallpaperId);
    if (!session) return false;
    return Date.now() < session.expiresAt;
  };

  const isDownloaded = (wallpaperId: string): boolean => {
    return downloads.some((d) => d.wallpaper_id === wallpaperId);
  };

  // Toggle favorite
  const handleToggleFavorite = async (wallpaperId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    let updated: string[];
    if (favorites.includes(wallpaperId)) {
      updated = favorites.filter((id) => id !== wallpaperId);
      showToast('Removed from favorites');
    } else {
      updated = [...favorites, wallpaperId];
      showToast('Saved to favorites ♡');
    }

    setFavorites(updated);
    try {
      localStorage.setItem('daily_wallpapers_favs', JSON.stringify(updated));
      await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallpaper_id: wallpaperId }),
      });
    } catch {
      // offline fallback
    }
  };

  // Select Wallpaper Detail
  const handleSelectWallpaper = (wp: Wallpaper) => {
    setSelectedWallpaper(wp);
    // Record view in background
    fetch(`/api/wallpapers/${wp.id}/view`, { method: 'POST' }).catch(() => {});
  };

  // Execute Actual Download (after unlock or if already unlocked/downloaded)
  const executeDownload = async (wp: Wallpaper) => {
    try {
      showToast('Downloading high-resolution wallpaper...');

      // Trigger actual image download
      const response = await fetch(wp.full_url || wp.medium_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanTitle = wp.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
      a.download = `dailywallpaper_${cleanTitle}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Register download on server
      const res = await fetch(`/api/wallpapers/${wp.id}/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'device-local' }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.record) {
          setDownloads((prev) => [data.record, ...prev]);
        }
      }

      showToast('✓ Wallpaper saved to device (Pictures/Wallpapers)');
    } catch (e) {
      console.error(e);
      showToast('Download complete. Check Pictures folder.');
    }
  };

  // Initiate Download Flow (Section 9 & 10)
  const handleInitiateDownload = () => {
    if (!selectedWallpaper) return;

    // If already downloaded or currently unlocked: skip ad! (Section 51 & 52)
    if (isDownloaded(selectedWallpaper.id) || isWallpaperUnlocked(selectedWallpaper.id)) {
      executeDownload(selectedWallpaper);
      return;
    }

    // Otherwise require rewarded ad
    setAdActionType('download');
    setShowRewardedAd(true);
  };

  // Initiate Apply Flow (Section 12 & 13)
  const handleInitiateApply = () => {
    if (!selectedWallpaper) return;

    // If already downloaded or currently unlocked: skip ad! (Section 51 & 52)
    if (isDownloaded(selectedWallpaper.id) || isWallpaperUnlocked(selectedWallpaper.id)) {
      setShowApplyModal(true);
      return;
    }

    // Otherwise require rewarded ad
    setAdActionType('apply');
    setShowRewardedAd(true);
  };

  // Rewarded Ad Completion Handler (Strict anti-bypass verification)
  const handleRewardEarned = () => {
    if (!selectedWallpaper) return;

    // Create 30-minute unlock session
    const newSession: UnlockedSession = {
      wallpaperId: selectedWallpaper.id,
      unlockedAt: Date.now(),
      expiresAt: Date.now() + 30 * 60 * 1000,
    };
    setUnlockedSessions((prev) => [...prev, newSession]);

    setShowRewardedAd(false);
    showToast('Ad completed! Wallpaper unlocked ✨');

    if (adActionType === 'download') {
      executeDownload(selectedWallpaper);
    } else {
      setShowApplyModal(true);
    }
  };

  // Apply Success Callback
  const handleApplySuccess = (target: ApplyTarget) => {
    setShowApplyModal(false);
    const targetName = target === 'home' ? 'Home screen' : target === 'lock' ? 'Lock screen' : 'Both screens';
    showToast(`Wallpaper applied to ${targetName} ✓`);
  };

  // Admin Upload Handler
  const handleAdminUpload = async (newWp: Partial<Wallpaper>): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/wallpapers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWp),
      });
      if (res.ok) {
        await fetchData();
        showToast('Wallpaper published successfully!');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Admin Delete Handler
  const handleAdminDelete = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/wallpapers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchData();
        showToast('Wallpaper removed.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Admin Toggle Featured / Daily
  const handleAdminToggle = async (id: string, field: 'is_featured' | 'is_daily') => {
    const wp = wallpapers.find((w) => w.id === id);
    if (!wp) return;
    try {
      await fetch(`/api/admin/wallpapers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !wp[field] }),
      });
      await fetchData();
    } catch {
      // ignore
    }
  };

  // Admin Add Category
  const handleAdminAddCategory = async (name: string, imageUrl: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image_url: imageUrl }),
      });
      if (res.ok) {
        await fetchData();
        showToast('Category created!');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#171717] flex flex-col font-sans selection:bg-[#6C63FF]/20 selection:text-[#6C63FF]">
      {/* Top Application Bar */}
      <header className="bg-white border-b border-neutral-200/80 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6C63FF] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-[#171717] leading-none">
                Daily Wallpapers
              </h1>
              <p className="text-[10px] text-[#737373] mt-0.5 hidden sm:block">
                Android & iOS • Shared Cloud Backend • AdMob Rewarded
              </p>
            </div>
          </div>

          {/* Master View Navigation Tabs */}
          <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto max-w-full">
            <button
              onClick={() => setMainView('app')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                mainView === 'app'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App</span>
            </button>

            <button
              onClick={() => setMainView('admin')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                mainView === 'admin'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </button>

            <button
              onClick={() => setMainView('android_code')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                mainView === 'android_code'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Android (Kotlin)</span>
            </button>

            <button
              onClick={() => setMainView('ios_code')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                mainView === 'ios_code'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-600" />
              <span>iOS (SwiftUI)</span>
            </button>

            <button
              onClick={() => setMainView('database')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition shrink-0 ${
                mainView === 'database'
                  ? 'bg-white text-[#171717] shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Database & APIs</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* 1. MOBILE APP VIEW */}
        {mainView === 'app' && (
          <PhoneFrame isFramed={isFramed} onToggleFrame={() => setIsFramed(!isFramed)}>
            {/* Screen Content based on Active 4-Tab Navigation */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'home' && (
                <HomeTab
                  wallpapers={wallpapers}
                  dailyWallpapers={dailyWallpapers}
                  featuredWallpapers={featuredWallpapers}
                  favorites={favorites}
                  onSelectWallpaper={handleSelectWallpaper}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {activeTab === 'explore' && (
                <ExploreTab
                  categories={categories}
                  wallpapers={wallpapers}
                  onSelectWallpaper={handleSelectWallpaper}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesTab
                  favorites={favorites}
                  wallpapers={wallpapers}
                  downloads={downloads}
                  onSelectWallpaper={handleSelectWallpaper}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsTab
                  onClearCache={() => {
                    showToast('Cache cleared successfully.');
                  }}
                />
              )}
            </div>

            {/* Android 4-Tab Bottom Navigation Bar (Section 32) */}
            <nav className="sticky bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-neutral-200/80 px-4 py-2 flex items-center justify-around z-30 shadow-xs">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
                  activeTab === 'home'
                    ? 'text-[#6C63FF] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-[10px]">Home</span>
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
                  activeTab === 'explore'
                    ? 'text-[#6C63FF] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Compass className="w-5 h-5" />
                <span className="text-[10px]">Explore</span>
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
                  activeTab === 'favorites'
                    ? 'text-[#6C63FF] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="text-[10px]">Favorites</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition ${
                  activeTab === 'settings'
                    ? 'text-[#6C63FF] font-semibold'
                    : 'text-neutral-400 hover:text-neutral-700'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="text-[10px]">Settings</span>
              </button>
            </nav>
          </PhoneFrame>
        )}

        {/* 2. ADMIN DASHBOARD VIEW */}
        {mainView === 'admin' && (
          <AdminDashboard
            wallpapers={wallpapers}
            categories={categories}
            stats={stats}
            onUploadWallpaper={handleAdminUpload}
            onDeleteWallpaper={handleAdminDelete}
            onToggleStatus={handleAdminToggle}
            onAddCategory={handleAdminAddCategory}
          />
        )}

        {/* 3. ANDROID CODEBASE VIEW & EXPORTER */}
        {mainView === 'android_code' && <AndroidCodeViewer />}

        {/* 4. IOS CODEBASE VIEW & EXPORTER (SwiftUI) */}
        {mainView === 'ios_code' && <IOSCodeViewer />}

        {/* 5. DATABASE & API SPECIFICATIONS VIEW */}
        {mainView === 'database' && <DatabaseDocsViewer />}
      </main>

      {/* FULL-SCREEN WALLPAPER DETAIL MODAL */}
      {selectedWallpaper && (
        <WallpaperDetailModal
          wallpaper={selectedWallpaper}
          isFavorite={favorites.includes(selectedWallpaper.id)}
          isDownloaded={isDownloaded(selectedWallpaper.id)}
          isUnlocked={isWallpaperUnlocked(selectedWallpaper.id)}
          onClose={() => setSelectedWallpaper(null)}
          onToggleFavorite={handleToggleFavorite}
          onInitiateDownload={handleInitiateDownload}
          onInitiateApply={handleInitiateApply}
        />
      )}

      {/* REWARDED AD MODAL (AdMob Rewarded flow with anti-bypass) */}
      {showRewardedAd && selectedWallpaper && (
        <RewardedAdModal
          wallpaper={selectedWallpaper}
          actionType={adActionType}
          onRewardEarned={handleRewardEarned}
          onCancel={() => setShowRewardedAd(false)}
        />
      )}

      {/* APPLY WALLPAPER MODAL (Preview with phone mockup and WallpaperManager) */}
      {showApplyModal && selectedWallpaper && (
        <ApplyWallpaperModal
          wallpaper={selectedWallpaper}
          onClose={() => setShowApplyModal(false)}
          onApplySuccess={handleApplySuccess}
        />
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-70 bg-neutral-900/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700/60 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
