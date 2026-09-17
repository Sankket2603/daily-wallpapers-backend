import React, { useState, useEffect } from 'react';
import {
  Play,
  X,
  AlertCircle,
  WifiOff,
  Sparkles,
  Volume2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Wallpaper } from '../types.ts';

interface RewardedAdModalProps {
  wallpaper: Wallpaper;
  actionType: 'download' | 'apply';
  onRewardEarned: () => void;
  onCancel: () => void;
}

export const RewardedAdModal: React.FC<RewardedAdModalProps> = ({
  wallpaper,
  actionType,
  onRewardEarned,
  onCancel,
}) => {
  // Ad flow phases: 'prompt' | 'watching' | 'rewarded' | 'skipped_warning' | 'error'
  const [phase, setPhase] = useState<
    'prompt' | 'watching' | 'rewarded' | 'skipped_warning' | 'error'
  >('prompt');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(6);
  const [canSkipEarly, setCanSkipEarly] = useState(false);

  // Test simulation settings
  const [simulateNetworkError, setSimulateNetworkError] = useState(false);
  const [simulateAdUnavailable, setSimulateAdUnavailable] = useState(false);

  // Timer while watching ad
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'watching') {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        // Full ad completed -> emit reward!
        setPhase('rewarded');
        setTimeout(() => {
          onRewardEarned();
        }, 1200);
      }
    }
    return () => clearTimeout(timer);
  }, [phase, countdown, onRewardEarned]);

  const handleStartAd = () => {
    if (simulateNetworkError) {
      setErrorMessage('Internet connection required to unlock a new download.');
      setPhase('error');
      return;
    }
    if (simulateAdUnavailable) {
      setErrorMessage('The ad isn\'t available right now. Please try again.');
      setPhase('error');
      return;
    }

    setCountdown(6);
    setCanSkipEarly(true);
    setPhase('watching');
  };

  const handleAttemptCloseDuringAd = () => {
    // User tries to close before countdown finishes
    if (countdown > 0) {
      setPhase('skipped_warning');
    }
  };

  const handleResumeAd = () => {
    setPhase('watching');
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      {/* 1. INITIAL PROMPT PHASE */}
      {phase === 'prompt' && (
        <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-14 h-14 rounded-2xl bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#171717]">
              Unlock Wallpaper
            </h3>
            <p className="text-xs text-[#737373] mt-1.5 leading-relaxed">
              Watch a short ad to unlock{' '}
              <strong className="text-neutral-900 font-semibold">{wallpaper.title}</strong>{' '}
              for {actionType === 'download' ? 'downloading to device' : 'applying as wallpaper'}.
            </p>
          </div>

          {/* Test AdMob Unit Badge */}
          <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/80 text-[11px] text-neutral-500 text-left flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-neutral-800">AdMob Rewarded Unit</p>
              <p className="text-[10px] text-neutral-500 font-mono truncate">
                ca-app-pub-3940256099942544/5224354917
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleStartAd}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#6C63FF] hover:bg-[#584ee8] text-white flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
            >
              <Play className="w-4 h-4 fill-white" />
              WATCH AD
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-neutral-600 hover:bg-neutral-100 transition"
            >
              Maybe later
            </button>
          </div>

          {/* Simulation Toggle Drawer for QA / Testing Error States */}
          <div className="pt-2 border-t border-neutral-100 text-left">
            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              QA Test Scenarios (Section 44)
            </p>
            <div className="flex items-center justify-between text-xs text-neutral-600 py-0.5">
              <span>Simulate Network Offline</span>
              <input
                type="checkbox"
                checked={simulateNetworkError}
                onChange={(e) => setSimulateNetworkError(e.target.checked)}
                className="accent-[#6C63FF]"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-600 py-0.5">
              <span>Simulate Ad Unavailable</span>
              <input
                type="checkbox"
                checked={simulateAdUnavailable}
                onChange={(e) => setSimulateAdUnavailable(e.target.checked)}
                className="accent-[#6C63FF]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. WATCHING AD PHASE (Google AdMob Rewarded Video Mock) */}
      {phase === 'watching' && (
        <div className="relative bg-neutral-950 text-white max-w-sm w-full h-[520px] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between p-5 border border-neutral-800">
          {/* Top Bar with Timer & Early Exit Warning */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Reward in {countdown}s
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/80">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <button
                onClick={handleAttemptCloseDuringAd}
                className="w-7 h-7 rounded-full bg-black/50 hover:bg-neutral-800 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Ad Creative Video Canvas */}
          <div className="my-auto text-center space-y-4 py-8">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-tr from-[#6C63FF] to-indigo-400 mx-auto flex items-center justify-center shadow-lg animate-bounce duration-1000">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Google Test Ad
              </span>
              <h4 className="text-xl font-bold mt-2">Daily Wallpapers Pro</h4>
              <p className="text-xs text-neutral-300 max-w-xs mx-auto mt-1">
                Discover ultra 4K wallpapers every single morning on your Android device.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-48 mx-auto bg-neutral-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#6C63FF] h-full transition-all duration-1000 ease-linear"
                style={{ width: `${((6 - countdown) / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Ad Bottom Footer */}
          <div className="bg-black/50 backdrop-blur rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="text-left">
              <p className="font-semibold text-white">Google Mobile Ads</p>
              <p className="text-[10px] text-neutral-400">Rewarded Video Ad SDK 23.6</p>
            </div>
            <span className="text-[11px] font-bold text-[#6C63FF]">INSTALL</span>
          </div>
        </div>
      )}

      {/* 3. SKIPPED WARNING (Anti-Bypass Rule Section 45) */}
      {phase === 'skipped_warning' && (
        <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-[#171717]">
              Reward Not Earned
            </h3>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              Watch the complete ad to unlock the wallpaper. If you close early, no download or apply will be unlocked.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={handleResumeAd}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#6C63FF] hover:bg-[#584ee8] text-white transition active:scale-98"
            >
              Resume Watching ({countdown}s left)
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-neutral-500 hover:text-neutral-700"
            >
              Exit without unlocking
            </button>
          </div>
        </div>
      )}

      {/* 4. REWARD GRANTED SUCCESS */}
      {phase === 'rewarded' && (
        <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl text-center space-y-3 animate-in zoom-in-95">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-[#171717]">Reward Granted!</h3>
          <p className="text-xs text-neutral-600">
            Ad completed. Unlocking {actionType === 'download' ? 'download...' : 'apply preview...'}
          </p>
        </div>
      )}

      {/* 5. ERROR STATE (Section 44) */}
      {phase === 'error' && (
        <div className="bg-white max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-4 text-center animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            {simulateNetworkError ? <WifiOff className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>

          <div>
            <h3 className="text-base font-bold text-[#171717]">
              Ad Unavailable
            </h3>
            <p className="text-xs text-neutral-600 mt-1.5 leading-relaxed">
              {errorMessage}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => {
                setSimulateNetworkError(false);
                setSimulateAdUnavailable(false);
                setPhase('prompt');
              }}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-neutral-900 hover:bg-black text-white flex items-center justify-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="w-full py-2 px-4 rounded-xl font-semibold text-xs text-neutral-500 hover:text-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
