'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <div className="w-9 h-9 rounded-2xl neu-button flex items-center justify-center p-1 group-hover:scale-105 transition-transform overflow-hidden shadow-sm">
            <Image
              src="/brand/freeks-app-icon.png"
              alt="FREEKS FinMate Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-neutral-900 dark:text-neutral-100 leading-none">
              FREEKS FinMate
            </h1>
          </div>
        </Link>
      </div>
    </header>
  );
}
