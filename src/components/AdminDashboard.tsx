import React, { useState } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  Calendar,
  Layers,
  BarChart3,
  LogOut,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import { Wallpaper, Category, AdminStats } from '../types.ts';

interface AdminDashboardProps {
  wallpapers: Wallpaper[];
  categories: Category[];
  stats: AdminStats;
  onUploadWallpaper: (newWp: Partial<Wallpaper>) => Promise<boolean>;
  onDeleteWallpaper: (id: string) => Promise<boolean>;
  onToggleStatus: (id: string, field: 'is_featured' | 'is_daily') => Promise<void>;
  onAddCategory: (name: string, imageUrl: string) => Promise<boolean>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  wallpapers,
  categories,
  stats,
  onUploadWallpaper,
  onDeleteWallpaper,
  onToggleStatus,
  onAddCategory,
}) => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('admin@dailywallpapers.app');
  const [password, setPassword] = useState('admin123');
  const [authError, setAuthError] = useState('');

  // Active sub-view: 'overview' | 'upload' | 'wallpapers' | 'categories'
  const [activeView, setActiveView] = useState<'overview' | 'upload' | 'wallpapers' | 'categories'>('overview');

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDaily, setIsDaily] = useState(true);
  const [uploadError, setUploadError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // New category form
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@dailywallpapers.app' && password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid credentials. Use admin@dailywallpapers.app / admin123');
    }
  };

  // Handle Image File Selection & Auto Dimension Reading (Section 25 & 26)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (JPG, JPEG, PNG, WEBP)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setUploadError('Invalid format. Accepted: JPG, JPEG, PNG, WEBP.');
      return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File exceeds 20 MB limit.');
      return;
    }

    setUploadFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Read image dimensions
    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;

    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  // Sample presets for quick testing
  const handleUseSampleImage = (url: string, sampleTitle: string, w: number, h: number) => {
    setPreviewUrl(url);
    setImageDimensions({ width: w, height: h });
    setTitle(sampleTitle);
    setUploadFile(new File([''], 'sample.jpg', { type: 'image/jpeg' }));
  };

  // Handle Wallpaper Publishing
  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !title || !categoryId) {
      setUploadError('Please provide an image, title, and category.');
      return;
    }

    setIsPublishing(true);
    setUploadError('');

    try {
      const success = await onUploadWallpaper({
        title,
        description,
        category_id: categoryId,
        original_url: previewUrl,
        width: imageDimensions?.width || 1080,
        height: imageDimensions?.height || 1920,
        file_size: uploadFile?.size || 3450000,
        is_featured: isFeatured,
        is_daily: isDaily,
      });

      if (success) {
        setPublishSuccess(true);
        setTitle('');
        setDescription('');
        setUploadFile(null);
        setPreviewUrl('');
        setImageDimensions(null);
        setTimeout(() => {
          setPublishSuccess(false);
          setActiveView('wallpapers');
        }, 1200);
      } else {
        setUploadError('Upload failed. Please check server logs.');
      }
    } catch {
      setUploadError('Error publishing wallpaper.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-4">
        <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-xl border border-neutral-200/80 space-y-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#171717]">Admin Portal</h2>
            <p className="text-xs text-[#737373] mt-1">
              Authenticate to manage wallpapers, categories, and analytics.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 text-left">
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#6C63FF]"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#6C63FF]"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-[#6C63FF] hover:bg-[#584ee8] text-white transition mt-2 shadow-xs"
            >
              Sign In to Admin
            </button>
          </form>

          <p className="text-[11px] text-neutral-400">
            Demo credentials prefilled for testing convenience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Admin Navigation Bar */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#171717] flex items-center gap-2">
            <span>Daily Wallpapers Admin</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700">
              Android & iOS Synced
            </span>
          </h2>
          <p className="text-xs text-neutral-500">
            Unified Cloud Control Panel • Changes reflect instantly on Android and iOS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'overview' ? 'bg-white text-[#171717] shadow-xs' : 'text-neutral-600'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('upload')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'upload' ? 'bg-white text-[#171717] shadow-xs' : 'text-neutral-600'
              }`}
            >
              Upload Wallpaper
            </button>
            <button
              onClick={() => setActiveView('wallpapers')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'wallpapers' ? 'bg-white text-[#171717] shadow-xs' : 'text-neutral-600'
              }`}
            >
              Wallpapers ({wallpapers.length})
            </button>
            <button
              onClick={() => setActiveView('categories')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeView === 'categories' ? 'bg-white text-[#171717] shadow-xs' : 'text-neutral-600'
              }`}
            >
              Categories ({categories.length})
            </button>
          </div>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-2 rounded-xl text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW & ANALYTICS VIEW (Section 23) */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
              <p className="text-xs text-neutral-500 font-medium">Total Wallpapers</p>
              <p className="text-2xl font-bold text-[#171717] mt-1">{stats.totalWallpapers}</p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Published in catalogue
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
              <p className="text-xs text-neutral-500 font-medium">Total Downloads</p>
              <p className="text-2xl font-bold text-[#171717] mt-1">
                {stats.totalDownloads.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Verified unlocks
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
              <p className="text-xs text-neutral-500 font-medium">Downloads Today</p>
              <p className="text-2xl font-bold text-[#6C63FF] mt-1">
                {stats.downloadsToday.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Live AdMob conversions</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
              <p className="text-xs text-neutral-500 font-medium">Views Today</p>
              <p className="text-2xl font-bold text-[#171717] mt-1">
                {stats.viewsToday.toLocaleString()}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">Detail page impressions</p>
            </div>
          </div>

          {/* Quick Action Banner */}
          <div className="p-6 bg-linear-to-r from-neutral-900 to-neutral-800 text-white rounded-3xl flex items-center justify-between shadow-md">
            <div>
              <h3 className="text-base font-bold">Upload Daily Wallpaper</h3>
              <p className="text-xs text-neutral-300 mt-0.5 max-w-md">
                Automatic dimension detection, multi-resolution WebP compression, and Wallpaper of the Day scheduling.
              </p>
            </div>
            <button
              onClick={() => setActiveView('upload')}
              className="px-4 py-2.5 rounded-xl bg-white text-neutral-900 text-xs font-bold hover:bg-neutral-100 transition shadow-xs"
            >
              Upload Now
            </button>
          </div>
        </div>
      )}

      {/* 2. UPLOAD WALLPAPER VIEW (Sections 24, 25, 26, 48) */}
      {activeView === 'upload' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs max-w-2xl mx-auto space-y-5">
          <div>
            <h3 className="text-lg font-bold text-[#171717]">Upload Wallpaper</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Images will be automatically validated, resized into thumbnail/medium/full, and stored.
            </p>
          </div>

          {/* Copyright Disclosure Warning (Section 48) */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <strong>Copyright Notice:</strong> Only upload wallpapers that you own, created, or have appropriate rights/licenses to distribute.
            </span>
          </div>

          <form onSubmit={handlePublish} className="space-y-4">
            {/* Image Dropzone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Wallpaper Image (JPG, JPEG, PNG, WEBP — Max 20MB)
              </label>

              <div className="relative border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center hover:border-[#6C63FF] transition cursor-pointer bg-neutral-50/50">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {previewUrl ? (
                  <div className="flex items-center justify-center gap-4">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-24 h-36 object-cover rounded-xl shadow-md"
                    />
                    <div className="text-left text-xs space-y-1">
                      <p className="font-semibold text-neutral-900">
                        {uploadFile?.name || 'Selected Wallpaper'}
                      </p>
                      {imageDimensions && (
                        <p className="text-neutral-600">
                          Dimensions: <strong>{imageDimensions.width} × {imageDimensions.height}</strong>
                        </p>
                      )}
                      <p className="text-neutral-500">
                        Size: {((uploadFile?.size || 3500000) / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <span className="text-[11px] text-[#6C63FF] font-medium">Click to replace</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto" />
                    <p className="text-xs font-medium text-neutral-700">
                      Drag and drop image here, or <span className="text-[#6C63FF] font-semibold">browse file</span>
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Supports 9:16, 16:9, 4:5, 1:1, 20:9 dimensions
                    </p>
                  </div>
                )}
              </div>

              {/* Sample high-res presets for one-click testing */}
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-neutral-500 text-[11px]">Or use sample:</span>
                <button
                  type="button"
                  onClick={() =>
                    handleUseSampleImage(
                      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2160&auto=format&fit=crop&q=95',
                      'Golden Coast Dune',
                      1440,
                      2560
                    )
                  }
                  className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px]"
                >
                  Minimal Coastal (9:16)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleUseSampleImage(
                      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=2160&auto=format&fit=crop&q=95',
                      'Vortex Blackhole',
                      1080,
                      2400
                    )
                  }
                  className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[11px]"
                >
                  AMOLED Deep (20:9)
                </button>
              </div>
            </div>

            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Wallpaper Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Minimal Sunset Horizon"
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#6C63FF]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 outline-none focus:border-[#6C63FF]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Brief visual description..."
                className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-[#6C63FF]"
              />
            </div>

            {/* Featured & Daily Toggles */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={isDaily}
                  onChange={(e) => setIsDaily(e.target.checked)}
                  className="accent-[#6C63FF] w-4 h-4 rounded"
                />
                <Calendar className="w-3.5 h-3.5 text-[#6C63FF]" />
                Wallpaper of the Day
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="accent-[#6C63FF] w-4 h-4 rounded"
                />
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Featured Collection
              </label>
            </div>

            {uploadError && (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {uploadError}
              </p>
            )}

            {publishSuccess && (
              <p className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Wallpaper successfully published to live catalogue!
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPublishing}
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#6C63FF] hover:bg-[#584ee8] disabled:opacity-50 text-white transition active:scale-98 shadow-md"
            >
              {isPublishing ? 'Publishing & Generating CDN Versions...' : 'PUBLISH WALLPAPER'}
            </button>
          </form>
        </div>
      )}

      {/* 3. MANAGE WALLPAPERS VIEW */}
      {activeView === 'wallpapers' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#171717]">
              Manage Catalogue ({wallpapers.length})
            </h3>
            <button
              onClick={() => setActiveView('upload')}
              className="px-3 py-1.5 rounded-xl bg-[#6C63FF] text-white text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add New
            </button>
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {wallpapers.map((wp) => (
              <div key={wp.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={wp.thumbnail_url}
                    alt={wp.title}
                    className="w-12 h-16 object-cover rounded-lg bg-neutral-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#171717] truncate">
                      {wp.title}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {wp.category_name} • {wp.width}×{wp.height} ({wp.aspect_ratio})
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      <span>{wp.downloads} Downloads</span>
                      <span>•</span>
                      <span>{wp.views} Views</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Toggle Daily */}
                  <button
                    onClick={() => onToggleStatus(wp.id, 'is_daily')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      wp.is_daily
                        ? 'bg-[#6C63FF]/10 text-[#6C63FF] border-[#6C63FF]/30'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}
                  >
                    {wp.is_daily ? 'Daily ✓' : '+ Daily'}
                  </button>

                  {/* Toggle Featured */}
                  <button
                    onClick={() => onToggleStatus(wp.id, 'is_featured')}
                    className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      wp.is_featured
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-neutral-50 text-neutral-500 border-neutral-200'
                    }`}
                  >
                    {wp.is_featured ? 'Featured ✓' : '+ Featured'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => onDeleteWallpaper(wp.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-neutral-50 transition"
                    title="Delete Wallpaper"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CATEGORIES VIEW */}
      {activeView === 'categories' && (
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#171717]">
              Manage Categories ({categories.length})
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Organize discovery filters for the mobile application.
            </p>
          </div>

          {/* Add Category Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newCatName || !newCatImage) return;
              await onAddCategory(newCatName, newCatImage);
              setNewCatName('');
              setNewCatImage('');
            }}
            className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end"
          >
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Travel"
                className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-[#6C63FF]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                value={newCatImage}
                onChange={(e) => setNewCatImage(e.target.value)}
                placeholder="https://..."
                className="w-full text-xs bg-white border border-neutral-200 rounded-xl px-3 py-2 outline-none focus:border-[#6C63FF]"
                required
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-4 rounded-xl font-bold text-xs bg-[#6C63FF] hover:bg-[#584ee8] text-white transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </form>

          {/* Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 shadow-2xs border border-neutral-200"
              >
                <img
                  src={c.image_url}
                  alt={c.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-2.5 text-white">
                  <p className="text-xs font-bold">{c.name}</p>
                  <p className="text-[10px] text-white/80">
                    {c.wallpaper_count ?? 0} Wallpapers
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
