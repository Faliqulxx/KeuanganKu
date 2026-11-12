'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Tampilkan splash screen saat aplikasi pertama kali dimuat
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 450); // Durasi transisi fade out
    }, 1300); // Tampil selama 1.3 detik

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsFadingOut(true);
        setTimeout(() => setIsVisible(false), 300);
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-app)] cursor-pointer select-none transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="Splash Screen FREEKS FinMate"
    >
      {/* Ambient Radial Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-orange-500/20 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xs space-y-5 animate-in zoom-in-95 duration-500">
        {/* App Icon dengan Efek Neumorphic & Glow */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-[28px] neu-floating p-2 flex items-center justify-center relative overflow-hidden ring-1 ring-orange-500/30 shadow-2xl shadow-orange-500/25">
            <Image
              src="/brand/freeks-app-icon.png"
              alt="FREEKS FinMate Logo"
              width={96}
              height={96}
              className="w-full h-full object-contain rounded-2xl"
              priority
            />
          </div>
          {/* Subtle ring accent */}
          <div className="absolute -inset-1 rounded-[32px] bg-gradient-to-tr from-orange-500/20 to-amber-400/20 -z-10 blur-sm" />
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-neutral-100">
            FREEKS <span className="text-orange-500">FinMate</span>
          </h1>
          <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 tracking-wide">
            Your Smart Financial Companion.
          </p>
        </div>

        {/* Loading Progress Bar Indicator */}
        <div className="w-36 h-1.5 rounded-full bg-neutral-200 dark:bg-stone-800 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 rounded-full w-full animate-[progress_1.2s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Powered By Footer */}
      <div className="absolute bottom-8 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          Powered by FREEKS
        </span>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

