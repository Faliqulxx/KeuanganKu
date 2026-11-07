'use client';

import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { Wallet } from 'lucide-react';
import Link from 'next/link';

export function Header({
  page = 'dashboard',
  showMonthPicker = false,
}: {
  page?: 'dashboard' | 'transaction' | 'report' | 'simple';
  showMonthPicker?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-app)]/90 backdrop-blur-md border-b border-[var(--neu-border)] px-4 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Logo Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-2xl neu-button flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <Wallet className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
              KeuanganKu
            </h1>
            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest block mt-0.5">
              Soft UI • PWA
            </span>
          </div>
        </Link>

        {/* Top Right Action: Dark/Light Mode Theme Toggle */}
        <div className="flex items-center gap-2">
          <ThemeToggle variant="icon" />
        </div>
      </div>
    </header>
  );
}
