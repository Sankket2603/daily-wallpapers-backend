import React, { useState } from 'react';
import { Wifi, Signal, BatteryMedium, Smartphone, Apple } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  isFramed: boolean;
  onToggleFrame: () => void;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  isFramed,
  onToggleFrame,
}) => {
  const [deviceType, setDeviceType] = useState<'android' | 'ios'>('android');
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  if (!isFramed) {
    return (
      <div className="w-full min-h-screen bg-[#FAFAF8] text-[#171717] flex flex-col">
        <div className="bg-white/80 backdrop-blur border-b border-neutral-200/80 px-4 py-2 flex items-center justify-between text-xs text-neutral-500 sticky top-0 z-30">
          <span className="font-medium text-neutral-700">Edge-to-Edge Responsive Mode</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setDeviceType('android');
                onToggleFrame();
              }}
              className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition font-medium flex items-center gap-1.5"
            >
              <span>Pixel 9 Pro</span>
            </button>
            <button
              onClick={() => {
                setDeviceType('ios');
                onToggleFrame();
              }}
              className="px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition font-medium flex items-center gap-1.5"
            >
              <span>iPhone 16 Pro</span>
            </button>
          </div>
        </div>
        <div className="flex-1 max-w-4xl mx-auto w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4">
      {/* Device Toolbar Controls */}
      <div className="mb-4 flex items-center gap-2 bg-neutral-100 p-1 rounded-2xl border border-neutral-200/90 text-xs shadow-2xs">
        <button
          onClick={() => setDeviceType('android')}
          className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
            deviceType === 'android'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span>🤖 Android (Pixel 9 Pro)</span>
        </button>

        <button
          onClick={() => setDeviceType('ios')}
          className={`px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 ${
            deviceType === 'ios'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <span>🍎 iOS (iPhone 16 Pro)</span>
        </button>

        <div className="h-4 w-px bg-neutral-300 mx-1" />

        <button
          onClick={onToggleFrame}
          className="px-2.5 py-1.5 rounded-xl text-neutral-600 hover:text-neutral-900 font-medium transition"
        >
          Expand
        </button>
      </div>

      {/* Device Shell */}
      {deviceType === 'android' ? (
        /* Android Pixel 9 Pro Frame */
        <div className="relative w-[390px] h-[820px] bg-black rounded-[48px] p-3 shadow-2xl ring-1 ring-black/10 border-[6px] border-neutral-900 flex flex-col overflow-hidden">
          {/* Android Punch Hole Camera */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-neutral-950 rounded-full z-40 ring-1 ring-neutral-800" />

          {/* Screen Content Container */}
          <div className="relative w-full h-full bg-[#FAFAF8] text-[#171717] rounded-[38px] overflow-hidden flex flex-col">
            {/* Android Status Bar */}
            <div className="h-10 px-6 pt-2 flex items-center justify-between text-xs font-semibold tracking-tight text-neutral-800 shrink-0 z-30 select-none bg-transparent">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1.5 opacity-85">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>

            {/* Inner Tab Screens */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar">
              {children}
            </div>

            {/* Android Gesture Navigation Bar Pill */}
            <div className="h-5 flex items-center justify-center bg-transparent shrink-0 z-30 select-none">
              <div className="w-32 h-1 bg-neutral-400/80 rounded-full" />
            </div>
          </div>
        </div>
      ) : (
        /* iPhone 16 Pro Frame with Dynamic Island */
        <div className="relative w-[390px] h-[820px] bg-[#1a1a1a] rounded-[52px] p-3 shadow-2xl ring-1 ring-black/15 border-[6px] border-[#2d2d2d] flex flex-col overflow-hidden">
          {/* Screen Content Container */}
          <div className="relative w-full h-full bg-[#FAFAF8] text-[#171717] rounded-[42px] overflow-hidden flex flex-col">
            {/* iOS Status Bar with Dynamic Island */}
            <div className="h-12 px-7 pt-2 flex items-center justify-between text-[13px] font-semibold tracking-tight text-neutral-900 shrink-0 z-30 select-none bg-transparent relative">
              <span className="font-semibold text-neutral-900">{currentTime}</span>

              {/* Dynamic Island */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-sm z-40">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-neutral-900" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#0a1b2a] ring-1 ring-blue-950/40" />
              </div>

              <div className="flex items-center gap-1.5 opacity-90">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4" />
              </div>
            </div>

            {/* Inner Tab Screens */}
            <div className="flex-1 overflow-y-auto relative no-scrollbar">
              {children}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="h-6 flex items-center justify-center bg-transparent shrink-0 z-30 select-none pb-1">
              <div className="w-36 h-1 bg-neutral-800 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
