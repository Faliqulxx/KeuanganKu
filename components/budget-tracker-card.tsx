'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/finance-context';
import { formatRupiah } from '@/lib/format';
import { CATEGORY_ICONS } from '@/lib/categories';
import { Target, Settings2, Check, X, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';

export function BudgetTrackerCard() {
  const { summary, budgets, updateBudget } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, number>>(budgets);

  const handleSaveBudgets = () => {
    Object.entries(editValues).forEach(([cat, val]) => {
      if (val > 0) {
        updateBudget(cat, val);
      }
    });
    setIsEditing(false);
  };

  return (
    <>
      <div className="rounded-3xl p-5 neu-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Anggaran Bulanan (Budget)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditValues(budgets);
              setIsEditing(true);
            }}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 neu-button px-2.5 py-1 rounded-xl"
            title="Atur batas anggaran per kategori"
          >
            <Settings2 className="w-3 h-3" />
            <span>Atur Batas</span>
          </button>
        </div>

        {/* List of category budgets */}
        <div className="space-y-3.5">
          {summary.budgetStatuses.map((item) => {
            const icon = CATEGORY_ICONS[item.category] || '📦';
            const isExceeded = item.status === 'exceeded';
            const isWarning = item.status === 'warning';

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{icon}</span>
                    <span className="font-extrabold text-neutral-800 dark:text-neutral-200">
                      {item.category}
                    </span>
                    {isExceeded ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md neu-sunken text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> Over
                      </span>
                    ) : isWarning ? (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md neu-sunken text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> Waspada
                      </span>
                    ) : (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md neu-sunken text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Aman
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 font-bold">
                    <span className={isExceeded ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-neutral-900 dark:text-neutral-100'}>
                      {formatRupiah(item.spent)}
                    </span>
                    <span className="text-neutral-400 font-medium">/</span>
                    <span className="text-neutral-500 font-medium text-[11px]">
                      {formatRupiah(item.limit)}
                    </span>
                  </div>
                </div>

                {/* Neumorphic Inset Progress Bar */}
                <div className="h-2 w-full rounded-full neu-sunken overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                        : isWarning
                        ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                        : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
                    }`}
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Budget Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4">
          <div className="bg-[var(--surface-app)] w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl neu-floating p-5 space-y-4 animate-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-border)]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                  Atur Batas Anggaran Bulanan
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {Object.keys(budgets).map((category) => (
                <div key={category} className="flex items-center justify-between gap-3 p-3 rounded-2xl neu-sunken-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{CATEGORY_ICONS[category] || '📦'}</span>
                    <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      {category}
                    </span>
                  </div>

                  <div className="relative w-36 shrink-0">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-neutral-400">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={editValues[category] || ''}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          [category]: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full pl-8 pr-2.5 py-1.5 text-xs font-black rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none text-right"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 px-3 rounded-2xl neu-button text-xs font-bold text-neutral-600 dark:text-neutral-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveBudgets}
                className="flex-2 py-3 px-4 rounded-2xl neu-primary-btn text-xs font-extrabold flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                Simpan Anggaran
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

