import React, { useState } from 'react';
import { Heart, Download, CheckCircle2, ArrowRight } from 'lucide-react';
import { Wallpaper, DownloadRecord } from '../types.ts';

interface FavoritesTabProps {
  favorites: string[];
  wallpapers: Wallpaper[];
  downloads: DownloadRecord[];
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  favorites,
  wallpapers,
  downloads,
  onSelectWallpaper,
  onToggleFavorite,
}) => {
  const [subTab, setSubTab] = useState<'favorites' | 'downloads'>('favorites');

  const favoriteWallpapers = wallpapers.filter((w) => favorites.includes(w.id));
  const downloadedWallpapers = downloads
    .map((dl) => wallpapers.find((w) => w.id === dl.wallpaper_id))
    .filter((w): w is Wallpaper => Boolean(w));

  return (
    <div className="px-4 pb-20 pt-2 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Saved
        </h1>
        <p className="text-xs text-[#737373] mt-0.5">
          Your favorite & downloaded wallpapers
        </p>
      </div>

      {/* Sub tabs: Favorites vs Downloads */}
      <div className="flex bg-neutral-100 p-1 rounded-xl">
        <button
          onClick={() => setSubTab('favorites')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            subTab === 'favorites'
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          Favorites ({favoriteWallpapers.length})
        </button>
        <button
          onClick={() => setSubTab('downloads')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
            subTab === 'downloads'
              ? 'bg-white text-[#171717] shadow-xs'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Download className="w-3.5 h-3.5 text-[#6C63FF]" />
          Downloads ({downloadedWallpapers.length})
        </button>
      </div>

      {subTab === 'favorites' && (
        <>
          {favoriteWallpapers.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-neutral-200">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">
                No favorites yet
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Save wallpapers you love and they&apos;ll appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favoriteWallpapers.map((wallpaper) => (
                <div
                  key={wallpaper.id}
                  onClick={() => onSelectWallpaper(wallpaper)}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs hover:shadow-md transition cursor-pointer"
                >
                  <img
                    src={wallpaper.thumbnail_url || wallpaper.medium_url}
                    alt={wallpaper.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(wallpaper.id, e)}
                    aria-label="Remove favorite"
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition"
                  >
                    <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  </button>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                    <p className="text-xs font-semibold leading-tight line-clamp-1">
                      {wallpaper.title}
                    </p>
                    <p className="text-[10px] text-white/80 mt-0.5">
                      {wallpaper.category_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {subTab === 'downloads' && (
        <>
          {downloadedWallpapers.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white rounded-2xl border border-dashed border-neutral-200">
              <div className="w-12 h-12 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-800">
                No downloads yet
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Unlocked wallpapers saved to phone storage appear here for offline access and instant apply.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {downloads.map((dl) => {
                const wp = wallpapers.find((w) => w.id === dl.wallpaper_id);
                if (!wp) return null;
                return (
                  <div
                    key={dl.id}
                    onClick={() => onSelectWallpaper(wp)}
                    className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-neutral-200/70 hover:border-neutral-300 transition cursor-pointer shadow-2xs"
                  >
                    <img
                      src={wp.thumbnail_url}
                      alt={wp.title}
                      className="w-14 h-20 rounded-lg object-cover bg-neutral-100"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-semibold text-emerald-700">
                          Saved to Phone
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#171717] truncate mt-0.5">
                        {wp.title}
                      </p>
                      <p className="text-xs text-[#737373] truncate">
                        {wp.category_name} • {(wp.file_size / 1024 / 1024).toFixed(1)} MB
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {dl.local_file_path || 'Pictures/Wallpapers'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 shrink-0 mr-1" />
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
