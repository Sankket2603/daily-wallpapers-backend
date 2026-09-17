import React, { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Download,
  Check,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';
import { Wallpaper } from '../types.ts';

interface WallpaperDetailModalProps {
  wallpaper: Wallpaper | null;
  isFavorite: boolean;
  isDownloaded: boolean;
  isUnlocked: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onInitiateDownload: () => void;
  onInitiateApply: () => void;
}

export const WallpaperDetailModal: React.FC<WallpaperDetailModalProps> = ({
  wallpaper,
  isFavorite,
  isDownloaded,
  isUnlocked,
  onClose,
  onToggleFavorite,
  onInitiateDownload,
  onInitiateApply,
}) => {
  const [hideUI, setHideUI] = useState(false);

  if (!wallpaper) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col select-none overflow-hidden">
      {/* Full-Screen Edge-to-Edge Wallpaper Image */}
      <div
        onClick={() => setHideUI(!hideUI)}
        className="relative flex-1 w-full h-full cursor-pointer flex items-center justify-center overflow-hidden"
      >
        <img
          src={wallpaper.full_url || wallpaper.medium_url}
          alt={wallpaper.title}
          className="w-full h-full object-cover select-none"
        />

        {/* Tap indicator hint */}
        {!hideUI && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] text-white/75 flex items-center gap-1 pointer-events-none transition-opacity">
            <Maximize2 className="w-3 h-3" />
            Tap screen to hide UI
          </div>
        )}
      </div>

      {/* Top Floating Bar */}
      <div
        className={`absolute top-0 inset-x-0 pt-10 px-4 pb-4 flex items-center justify-between transition-transform duration-300 z-10 ${
          hideUI ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <button
          onClick={onClose}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition shadow-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFavorite(wallpaper.id)}
            aria-label="Favorite"
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition shadow-lg"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Bottom Translucent Control Panel */}
      <div
        className={`absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-transform duration-300 z-10 space-y-3.5 ${
          hideUI ? 'translate-y-full opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        {/* Title & Category Info */}
        <div className="text-white">
          <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
            <span>{wallpaper.category_name}</span>
            <span>•</span>
            <span>{wallpaper.width}×{wallpaper.height}</span>
            <span>•</span>
            <span>{(wallpaper.file_size / 1024 / 1024).toFixed(1)} MB</span>
            {isUnlocked && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-semibold ml-auto">
                <Sparkles className="w-2.5 h-2.5" /> Unlocked
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold mt-0.5 leading-tight text-white drop-shadow-xs">
            {wallpaper.title}
          </h2>
          {wallpaper.description && (
            <p className="text-xs text-white/80 line-clamp-2 mt-1">
              {wallpaper.description}
            </p>
          )}
        </div>

        {/* Action Buttons: [DOWNLOAD] and [APPLY WALLPAPER] */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Download Button */}
          <button
            onClick={onInitiateDownload}
            className={`py-3 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition active:scale-98 shadow-md ${
              isDownloaded
                ? 'bg-neutral-800/90 text-white border border-neutral-700'
                : 'bg-white text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {isDownloaded ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Downloaded ✓
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download
              </>
            )}
          </button>

          {/* Apply Wallpaper Button */}
          <button
            onClick={onInitiateApply}
            className="py-3 px-4 rounded-xl font-semibold text-xs bg-[#6C63FF] hover:bg-[#5b52f5] text-white flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            Apply Wallpaper
          </button>
        </div>

        {/* Helpful Value Exchange Disclaimer */}
        {!isDownloaded && !isUnlocked && (
          <p className="text-[11px] text-white/60 text-center flex items-center justify-center gap-1">
            <Info className="w-3 h-3 shrink-0" />
            A short rewarded ad unlocks full-resolution download & apply
          </p>
        )}
      </div>
    </div>
  );
};
