'use client';

import React from 'react';
import { useFinance } from '@/lib/finance-context';
import { CheckCircle2, RotateCcw } from 'lucide-react';

export function ToastContainer() {
  const { toast } = useFinance();

  if (!toast) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl neu-floating text-neutral-900 dark:text-neutral-100 text-xs font-bold">
        <div className="flex items-center gap-2.5 truncate">
          <div className="w-6 h-6 rounded-lg neu-button text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="truncate">{toast.message}</span>
        </div>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 neu-button shrink-0 transition-transform active:scale-95"
          >
            <RotateCcw className="w-3 h-3" />
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  );
}
