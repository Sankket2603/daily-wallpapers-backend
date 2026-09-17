import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Check,
  Crop,
  Lock,
  Home,
  CheckCheck,
} from 'lucide-react';
import { Wallpaper, ApplyTarget, CropMode } from '../types.ts';

interface ApplyWallpaperModalProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  onApplySuccess: (target: ApplyTarget) => void;
}

export const ApplyWallpaperModal: React.FC<ApplyWallpaperModalProps> = ({
  wallpaper,
  onClose,
  onApplySuccess,
}) => {
  const [target, setTarget] = useState<ApplyTarget>('both');
  const [cropMode, setCropMode] = useState<CropMode>('fill');
  const [previewTab, setPreviewTab] = useState<'lock' | 'home'>('lock');
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setIsApplied(true);
      setTimeout(() => {
        onApplySuccess(target);
      }, 1400);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-neutral-900 text-white max-w-sm w-full rounded-3xl p-5 shadow-2xl space-y-4 border border-neutral-800 flex flex-col max-h-[95vh] overflow-y-auto no-scrollbar">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-1 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-white">Wallpaper Preview</h3>
            <p className="text-[11px] text-neutral-400">Android WallpaperManager API</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Interactive Phone Mockup Preview (Section 43) */}
        <div className="relative mx-auto w-[220px] h-[390px] rounded-[32px] overflow-hidden border-4 border-neutral-700 shadow-2xl bg-black select-none flex flex-col">
          {/* Wallpaper Image Canvas with Fit vs Fill */}
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <img
              src={wallpaper.full_url || wallpaper.medium_url}
              alt={wallpaper.title}
              className={`w-full h-full ${
                cropMode === 'fill' ? 'object-cover' : 'object-contain'
              }`}
            />
          </div>

          {/* Android Punch Hole */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black rounded-full z-30" />

          {/* Screen Overlay Content (Lock screen vs Home screen) */}
          {previewTab === 'lock' ? (
            <div className="relative z-20 flex-1 flex flex-col items-center justify-between p-4 bg-black/20 text-white">
              <div className="pt-6 text-center">
                <p className="text-3xl font-light tracking-tight drop-shadow-md">
                  {currentTime}
                </p>
                <p className="text-[11px] font-medium opacity-90 drop-shadow-xs mt-0.5">
                  {currentDate}
                </p>
              </div>

              <div className="flex items-center gap-1.5 pb-2 text-[10px] text-white/80 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-xs">
                <Lock className="w-3 h-3" />
                Swipe up to unlock
              </div>
            </div>
          ) : (
            <div className="relative z-20 flex-1 flex flex-col justify-between p-3 bg-black/10 text-white">
              {/* Home Screen Widgets */}
              <div className="pt-5 px-1 flex items-center justify-between text-[11px]">
                <span className="font-semibold drop-shadow">{currentTime}</span>
                <span className="drop-shadow">22°C Clear</span>
              </div>

              {/* App Icon Grid Mockup */}
              <div className="grid grid-cols-4 gap-2 pb-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex flex-col items-center gap-0.5">
                    <div className="w-8 h-8 rounded-xl bg-white/30 backdrop-blur-md border border-white/20 shadow-xs" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Preview Mode Switcher (Lock vs Home) & Crop Mode (Fit vs Fill) */}
        <div className="flex items-center justify-between gap-2">
          {/* Lock vs Home switcher */}
          <div className="flex bg-neutral-800 p-1 rounded-xl flex-1 text-xs">
            <button
              onClick={() => setPreviewTab('lock')}
              className={`flex-1 py-1 rounded-lg font-medium transition ${
                previewTab === 'lock' ? 'bg-[#6C63FF] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Lock Screen
            </button>
            <button
              onClick={() => setPreviewTab('home')}
              className={`flex-1 py-1 rounded-lg font-medium transition ${
                previewTab === 'home' ? 'bg-[#6C63FF] text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Home Screen
            </button>
          </div>

          {/* Fit vs Fill Switcher */}
          <div className="flex bg-neutral-800 p-1 rounded-xl text-xs shrink-0">
            <button
              onClick={() => setCropMode('fill')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                cropMode === 'fill' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Fill Screen (Crop)"
            >
              Fill
            </button>
            <button
              onClick={() => setCropMode('fit')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                cropMode === 'fit' ? 'bg-neutral-600 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Fit Screen (Letterbox)"
            >
              Fit
            </button>
          </div>
        </div>

        {/* Target Destination Selection (Section 12: Home screen, Lock screen, Both) */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Apply to:
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setTarget('home')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                target === 'home'
                  ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white'
                  : 'border-neutral-800 bg-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home Screen</span>
            </button>

            <button
              type="button"
              onClick={() => setTarget('lock')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                target === 'lock'
                  ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white'
                  : 'border-neutral-800 bg-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Lock Screen</span>
            </button>

            <button
              type="button"
              onClick={() => setTarget('both')}
              className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center gap-1 transition ${
                target === 'both'
                  ? 'border-[#6C63FF] bg-[#6C63FF]/20 text-white'
                  : 'border-neutral-800 bg-neutral-800/60 text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Both Screens</span>
            </button>
          </div>
        </div>

        {/* Confirm Apply Button */}
        <div className="pt-1">
          {isApplied ? (
            <div className="py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-2">
              <CheckCheck className="w-4 h-4" />
              Wallpaper applied successfully.
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#6C63FF] hover:bg-[#584ee8] disabled:opacity-50 text-white flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
            >
              {isApplying ? (
                <>Applying via WallpaperManager...</>
              ) : (
                <>Set Wallpaper</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
