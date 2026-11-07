'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ReceiptText, Plus, MessageSquareText, PieChart } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/transaksi', label: 'Transaksi', icon: ReceiptText },
  { href: '/tambah', label: 'Tambah', icon: Plus, isMain: true },
  { href: '/chat', label: 'Chat AI', icon: MessageSquareText },
  { href: '/laporan', label: 'Laporan', icon: PieChart },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-app)]/95 backdrop-blur-lg border-t border-[var(--neu-border)] pb-[max(env(safe-area-inset-bottom),14px)] transition-colors duration-200">
      <div className="max-w-md mx-auto flex items-center justify-around px-3 pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-7 group"
                aria-label="Tambah Transaksi"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200 ${
                    isActive
                      ? 'neu-primary-btn ring-4 ring-emerald-500/30 scale-105'
                      : 'neu-primary-btn hover:scale-105 active:scale-95'
                  }`}
                >
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-extrabold mt-1 text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-14 py-1.5 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'neu-sunken text-emerald-600 dark:text-emerald-400 font-extrabold scale-102'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 active:scale-95'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] tracking-tight mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
