import React, { useState } from 'react';
import {
  Bell,
  Wifi,
  Trash2,
  Shield,
  FileText,
  Info,
  Check,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

interface SettingsTabProps {
  onClearCache: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onClearCache }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [wifiOnly, setWifiOnly] = useState(true);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleClear = () => {
    onClearCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 2500);
  };

  return (
    <div className="px-4 pb-20 pt-2 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Settings
        </h1>
        <p className="text-xs text-[#737373] mt-0.5">
          Preferences & Application Info
        </p>
      </div>

      {/* Preferences Section */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Preferences
        </span>

        <div className="bg-white rounded-2xl border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-2xs">
          {/* Daily Notification */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#6C63FF]/10 text-[#6C63FF] flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171717]">
                  Daily Wallpaper Alert
                </p>
                <p className="text-xs text-[#737373] mt-0.5">
                  🌅 &quot;Your new wallpaper is ready&quot; at 08:00 AM
                </p>
              </div>
            </div>

            <button
              onClick={handleToggleNotifications}
              role="switch"
              aria-checked={notificationsEnabled}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                notificationsEnabled ? 'bg-[#6C63FF]' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Wi-Fi Only Downloads */}
          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171717]">
                  Download over Wi-Fi only
                </p>
                <p className="text-xs text-[#737373] mt-0.5">
                  Conserves mobile cellular data
                </p>
              </div>
            </div>

            <button
              onClick={() => setWifiOnly(!wifiOnly)}
              role="switch"
              aria-checked={wifiOnly}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
                wifiOnly ? 'bg-[#6C63FF]' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  wifiOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Clear Cache */}
          <button
            onClick={handleClear}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-50 transition"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-700 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#171717]">
                  Clear Cached Wallpapers
                </p>
                <p className="text-xs text-[#737373] mt-0.5">
                  Frees temporary offline thumbnail storage
                </p>
              </div>
            </div>

            {cacheCleared ? (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Cleared
              </span>
            ) : (
              <span className="text-xs font-medium text-neutral-400">~14 MB</span>
            )}
          </button>
        </div>
      </div>

      {/* Legal & About Section */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
          Legal & About
        </span>

        <div className="bg-white rounded-2xl border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-2xs">
          <button
            onClick={() => setShowPrivacy(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-50 transition"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-[#171717]">Privacy Policy</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <button
            onClick={() => setShowTerms(true)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-neutral-50 transition"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-[#171717]">Terms of Service</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <div className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-[#171717]">App Version</span>
            </div>
            <span className="text-xs font-semibold text-neutral-500">1.0.0 (Native Compose)</span>
          </div>
        </div>
      </div>

      {/* Philosophy Card */}
      <div className="p-4 bg-neutral-100/80 rounded-2xl border border-neutral-200/60 text-xs text-neutral-600 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-[#171717] mb-1">
          <Info className="w-3.5 h-3.5 text-[#6C63FF]" />
          Ad Value Exchange Policy
        </div>
        No ads on launch, while browsing, or scrolling. Rewarded ads are only shown when explicitly unlocking a wallpaper download or apply operation.
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 max-h-[80vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#171717]">Privacy Policy</h3>
              <button
                onClick={() => setShowPrivacy(false)}
                className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded-md"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>Daily Wallpapers</strong> respects your privacy. We do not require accounts, logins, or collection of personal names and passwords to enjoy our wallpapers.
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>Advertising:</strong> We utilize Google AdMob to serve non-intrusive rewarded advertisements only upon user request. Google AdMob may process device advertising identifiers in compliance with privacy regulations.
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>Storage:</strong> Wallpapers are saved directly to your device&apos;s Pictures folder using modern Android Scoped Storage. No arbitrary device files are accessed.
            </p>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTerms && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-5 max-h-[80vh] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-[#171717]">Terms of Service</h3>
              <button
                onClick={() => setShowTerms(false)}
                className="text-xs font-semibold px-2 py-1 bg-neutral-100 rounded-md"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Wallpapers provided through Daily Wallpapers are intended for personal, non-commercial device personalization.
            </p>
            <p className="text-xs text-neutral-600 leading-relaxed">
              All wallpapers are licensed or curated with appropriate distribution rights. Automated scraping or mass redistribution is prohibited.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
