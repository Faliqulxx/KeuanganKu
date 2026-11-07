'use client';

import React, { useState } from 'react';
import { ParsedItem } from '@/lib/mock-parser';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { formatRupiah } from '@/lib/format';
import { AlertTriangle, Check, Trash2, X, Sparkles } from 'lucide-react';

interface PreviewCardsProps {
  items: ParsedItem[];
  warnings?: string[];
  onSave: (confirmedItems: ParsedItem[]) => void;
  onCancel: () => void;
}

export function PreviewCards({ items: initialItems, warnings = [], onSave, onCancel }: PreviewCardsProps) {
  const [items, setItems] = useState<ParsedItem[]>(initialItems);

  const handleUpdate = (index: number, patch: Partial<ParsedItem>) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch, needs_review: false } : item))
    );
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAll = () => {
    if (items.length === 0) return;
    onSave(items);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4">
      <div className="bg-[var(--surface-app)] w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl neu-floating max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--neu-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl neu-button text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                Pratinjau Hasil AI ({items.length})
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                Periksa & edit data sebelum disimpan ke catatan
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Warnings list if any */}
        {warnings.length > 0 && (
          <div className="mx-4 mt-3 p-3.5 neu-sunken rounded-2xl text-xs text-amber-700 dark:text-amber-400 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              {warnings.map((w, i) => (
                <div key={i} className="font-medium">{w}</div>
              ))}
            </div>
          </div>
        )}

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-8 text-neutral-400 text-xs font-semibold">
              Semua item telah dihapus.
            </div>
          ) : (
            items.map((item, index) => {
              const categories = item.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-3xl transition-all ${
                    item.needs_review
                      ? 'neu-sunken border border-amber-400/50'
                      : 'neu-card'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <select
                        value={item.type}
                        onChange={(e) =>
                          handleUpdate(index, {
                            type: e.target.value as any,
                            category: e.target.value === 'income' ? 'Gaji' : 'Makanan',
                          })
                        }
                        className={`text-xs font-extrabold px-3 py-1 rounded-xl neu-button border-0 uppercase tracking-wider ${
                          item.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        <option value="expense">Keluar</option>
                        <option value="income">Masuk</option>
                      </select>

                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => handleUpdate(index, { date: e.target.value })}
                        className="text-xs bg-transparent text-neutral-500 font-bold border-0 focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={() => handleRemove(index)}
                      className="w-7 h-7 rounded-lg neu-button flex items-center justify-center text-neutral-400 hover:text-rose-600 transition"
                      title="Hapus dari daftar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.needs_review && (
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      Perlu dicek: mohon masukkan nominal yang valid
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider block mb-1">
                          Nominal (Rp)
                        </label>
                        <input
                          type="number"
                          value={item.amount || ''}
                          placeholder="0"
                          onChange={(e) =>
                            handleUpdate(index, { amount: parseInt(e.target.value, 10) || 0 })
                          }
                          className="w-full text-sm font-extrabold px-3 py-2 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
                        />
                      </div>

                      <div className="flex-1">
                        <label className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider block mb-1">
                          Kategori
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdate(index, { category: e.target.value })}
                          className="w-full text-xs font-bold px-3 py-2 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
                        >
                          {categories.map((c) => (
                            <option key={c} value={c} className="bg-[var(--surface-app)]">
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-neutral-400 dark:text-neutral-500 uppercase font-bold tracking-wider block mb-1">
                        Keterangan
                      </label>
                      <input
                        type="text"
                        value={item.note}
                        onChange={(e) => handleUpdate(index, { note: e.target.value })}
                        className="w-full text-xs font-medium px-3 py-2 rounded-xl neu-sunken text-neutral-800 dark:text-neutral-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[var(--neu-border)] flex items-center gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-2xl neu-button text-xs font-bold text-neutral-700 dark:text-neutral-300"
          >
            Batal
          </button>
          <button
            onClick={handleSaveAll}
            disabled={items.length === 0}
            className="flex-2 py-3 px-4 rounded-2xl neu-primary-btn disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Simpan Semua ({items.length})
          </button>
        </div>
      </div>
    </div>
  );
}
