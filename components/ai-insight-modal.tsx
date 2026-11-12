'use client';

import React from 'react';
import { useFinance } from '@/lib/finance-context';
import { formatRupiah } from '@/lib/format';
import {
  Sparkles,
  X,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Bot,
  Lightbulb,
} from 'lucide-react';
import Link from 'next/link';

interface AiInsightModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiInsightModal({ isOpen, onClose }: AiInsightModalProps) {
  const { dashboardSummary } = useFinance();

  if (!isOpen) return null;

  const topCategory = dashboardSummary.byCategory[0];
  const isSurplus = dashboardSummary.income >= dashboardSummary.expense;
  const netSavings = dashboardSummary.income - dashboardSummary.expense;
  const savingsRate =
    dashboardSummary.income > 0
      ? Math.round((netSavings / dashboardSummary.income) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface-app)] w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl neu-floating p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl neu-button text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                Insight AI FinMate
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold">
                Evaluasi cerdas kondisi keuanganmu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center justify-center transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Ringkasan Kesehatan Finansial */}
        <div className="p-4 rounded-2xl neu-sunken space-y-2.5 border border-orange-500/20">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-neutral-500 dark:text-neutral-400">Skor Kesehatan Kas</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                isSurplus
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
              }`}
            >
              {isSurplus ? (
                <>
                  <ShieldCheck className="w-3 h-3" />
                  Arus Kas Surplus
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3 h-3" />
                  Arus Kas Defisit
                </>
              )}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-lg font-black text-neutral-900 dark:text-neutral-100">
              {formatRupiah(netSavings)}
            </span>
            <span className="text-[11px] font-bold text-neutral-400">
              Sisa kas {dashboardSummary.periodLabel}
            </span>
          </div>

          <div className="pt-2 border-t border-[var(--neu-border-subtle)] text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {isSurplus ? (
              <span>
                Pemasukanmu berhasil menutupi seluruh pengeluaran bulan ini dengan rasio tabungan{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 font-black">
                  {savingsRate}%
                </strong>
                . Pertahankan pola konsumsi ini!
              </span>
            ) : (
              <span>
                Pengeluaranmu saat ini melebihi total pemasukan bulan berjalan. Disarankan menahan pos
                pengeluaran sekunder hingga akhir bulan.
              </span>
            )}
          </div>
        </div>

        {/* Highlight Analisis AI */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
            Temuan Cerdas Bulan Ini
          </h4>

          {/* Temuan 1: Kategori Terbesar */}
          {topCategory && (
            <div className="p-3 rounded-2xl neu-card flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl neu-sunken text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingUp className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-neutral-400 font-bold block">
                  Pengeluaran Terbesar
                </span>
                <p className="text-xs font-black text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {topCategory.category} — {formatRupiah(topCategory.total)} ({topCategory.percentage}%)
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Kategori ini mengambil porsi paling dominan dari anggaran bulananmu.
                </p>
              </div>
            </div>
          )}

          {/* Temuan 2: Rekomendasi Cerdas */}
          <div className="p-3 rounded-2xl neu-card flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl neu-sunken text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-neutral-400 font-bold block">
                Saran AI FinMate
              </span>
              <p className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 mt-0.5">
                Alokasikan Minimal 20% ke Tabungan Darurat
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                Amankan surplus saldo ke pos tabungan atau reksadana sebelum digunakan untuk belanja impulsif.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 space-y-2">
          <Link
            href="/chat"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl neu-primary-btn text-xs font-extrabold flex items-center justify-center gap-2"
          >
            <Bot className="w-4 h-4 stroke-[2.2]" />
            <span>Tanya Lebih Lanjut ke AI Assistant</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2]" />
          </Link>

          <Link
            href="/laporan"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl neu-button text-xs font-bold text-neutral-600 dark:text-neutral-300 hover:text-orange-600 dark:hover:text-orange-400 flex items-center justify-center transition"
          >
            Lihat Laporan Lengkap
          </Link>
        </div>
      </div>
    </div>
  );
}

