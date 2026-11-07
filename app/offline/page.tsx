'use client';

import React from 'react';
import Link from 'next/link';
import { WifiOff, RotateCcw, Plus } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 text-center">
      <div className="w-18 h-18 rounded-3xl neu-sunken text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-5">
        <WifiOff className="w-8 h-8 stroke-[2.2]" />
      </div>

      <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-100 mb-2 tracking-tight">
        Sedang Offline
      </h2>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-xs mx-auto mb-8 font-medium leading-relaxed">
        Koneksi internet tidak terdeteksi. Fitur AI (parse teks dan scan struk) dinonaktifkan sementara. Kamu tetap dapat melihat data lokal dan mencatat transaksi manual.
      </p>

      <div className="space-y-3.5 w-full max-w-xs">
        <Link
          href="/"
          className="w-full py-3.5 px-4 rounded-2xl neu-primary-btn text-xs font-extrabold flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.2]" />
          Coba Muat Ulang
        </Link>
        <Link
          href="/tambah"
          className="w-full py-3.5 px-4 rounded-2xl neu-button text-neutral-700 dark:text-neutral-300 text-xs font-extrabold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.2]" />
          Input Manual
        </Link>
      </div>
    </div>
  );
}
