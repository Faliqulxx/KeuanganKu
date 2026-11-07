'use client';

import React from 'react';
import { useFinance } from '@/lib/finance-context';
import { formatRupiah } from '@/lib/format';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { QuickInput } from '@/components/quick-input';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import { TransactionCard } from '@/components/transaction-card';
import { ArrowUpRight, ArrowDownLeft, ChevronRight, PieChart, BarChart3, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { dashboardSummary } = useFinance();

  return (
    <>
      <Header page="dashboard" showMonthPicker={true} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Neumorphic Saldo Hero Card (Bulan Berjalan) */}
        <div className="rounded-3xl neu-hero-emerald text-white p-5.5 relative overflow-hidden transition-all duration-300">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase font-bold text-emerald-100 tracking-widest block">
                  Total Saldo Saat Ini
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-50">
                  {dashboardSummary.periodLabel}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                {formatRupiah(dashboardSummary.balance)}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-white/15">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-200 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-emerald-100 block font-semibold truncate">Masuk Bulan Ini</span>
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
                    {formatRupiah(dashboardSummary.income)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
                  <ArrowUpRight className="w-4 h-4 text-rose-200 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-emerald-100 block font-semibold truncate">Keluar Bulan Ini</span>
                  <span className="text-xs sm:text-sm font-extrabold text-white truncate block">
                    {formatRupiah(dashboardSummary.expense)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Natural Language AI Input */}
        <QuickInput />

        {/* Category Donut Chart Card (Bulan Berjalan) */}
        <div className="rounded-3xl p-5 neu-card space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <PieChart className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Pengeluaran Kategori ({dashboardSummary.periodLabel})
              </h3>
            </div>
            <Link
              href="/laporan"
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 hover:underline"
            >
              Laporan Lengkap <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <CategoryPieChart
            data={dashboardSummary.byCategory}
            totalExpense={dashboardSummary.expense}
          />
        </div>

        {/* 6 Months Bar Chart Card */}
        <div className="rounded-3xl p-5 neu-card space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Tren 6 Bulan Terakhir
              </h3>
            </div>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">
              Masuk vs Keluar
            </span>
          </div>

          <MonthlyBarChart data={dashboardSummary.monthly} />
        </div>

        {/* 5 Transaksi Terbaru Bulan Berjalan */}
        <div className="rounded-3xl p-5 neu-card space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Transaksi Terbaru ({dashboardSummary.periodLabel})
              </h3>
            </div>
            <Link
              href="/transaksi"
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 hover:underline"
            >
              Lihat Semua <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {dashboardSummary.recent.length === 0 ? (
            <p className="text-center text-xs text-neutral-400 font-semibold py-6">
              Belum ada transaksi di bulan berjalan ini.
            </p>
          ) : (
            <div className="space-y-2.5">
              {dashboardSummary.recent.map((tx) => (
                <TransactionCard key={tx.id} transaction={tx} />
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}
