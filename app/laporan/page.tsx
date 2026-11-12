'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/finance-context';
import { formatRupiah } from '@/lib/format';
import { BottomNav } from '@/components/bottom-nav';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { ThemeToggle } from '@/components/theme-toggle';
import { DateRangeModal } from '@/components/date-range-modal';
import { BudgetTrackerCard } from '@/components/budget-tracker-card';
import { CATEGORY_ICONS, CATEGORY_COLORS, CategoryIcon } from '@/lib/categories';
import {
  Sparkles,
  RotateCcw,
  Download,
  TrendingDown,
  TrendingUp,
  Percent,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
} from 'lucide-react';

const DUMMY_INSIGHTS = [
  'Analisis data periode ini menunjukkan pos Tagihan dan Belanja sebagai pengeluaran terbesar. Rasio tabungan berada pada level sehat. Disarankan menjaga alokasi dana darurat minimal 20% dari saldo saat ini.',
  'Arus kas tercatat positif dan pengeluaran harian berada dalam batas wajar. Kategori makanan tercatat hemat dan terkontrol. Anda berada di jalur aman untuk target tabungan akhir tahun.',
  'Total pengeluaran terpantau stabil tanpa anomali lonjakan pengeluaran mendadak. Pos pemasukan utama dan bonus projek berhasil mendongkrak saldo bersih secara signifikan.',
];

export function LaporanPage() {
  const { reportSummary, reportPeriod, exportReportCsv } = useFinance();
  const [insightIndex, setInsightIndex] = useState(0);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);

  // Compute savings ratio for report period: ((income - expense) / income) * 100
  const periodSurplus = reportSummary.income - reportSummary.expense;
  const savingsRatio =
    reportSummary.income > 0
      ? Math.max(0, Math.min(100, Math.round((periodSurplus / reportSummary.income) * 100)))
      : 0;

  // Comparison metrics
  const expenseDiffPercent = -12;
  const incomeDiffPercent = +18;

  const handleRegenerateInsight = () => {
    setIsGeneratingInsight(true);
    setTimeout(() => {
      setIsGeneratingInsight(false);
      setInsightIndex((prev) => (prev + 1) % DUMMY_INSIGHTS.length);
    }, 600);
  };

  return (
    <>
      <main className="flex-1 px-4 pt-5 pb-4 space-y-4">
        {/* Dedicated Report Analysis Period Control Card */}
        <div className="rounded-3xl p-4.5 neu-card space-y-3 border border-orange-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl neu-button text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Calendar className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Periode Analisis Laporan
                </span>
                <h2 className="text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-tight leading-none mt-0.5">
                  {reportPeriod.label}
                </h2>
              </div>
            </div>

            <button
              onClick={() => setIsDateModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-orange-600 dark:text-orange-400"
              title="Ganti rentang tanggal / bulan / tahun"
            >
              <span>Ubah Periode</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--neu-border)] text-xs">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
              Total {reportSummary.filteredTransactions.length} transaksi dianalisis
            </span>

            {/* Export CSV strictly for active report period */}
            <button
              onClick={exportReportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-button text-xs font-bold text-neutral-800 dark:text-neutral-200 hover:text-orange-600 dark:hover:text-orange-400 transition"
              title={`Unduh CSV transaksi ${reportPeriod.label}`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Export CSV Laporan</span>
            </button>
          </div>
        </div>

        {/* AI Insight Premium Card (Spesifik Periode Laporan) */}
        <div className="rounded-3xl p-5 neu-card relative overflow-hidden space-y-3.5 border border-orange-500/25">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl neu-sunken text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="font-black text-xs text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                Insight AI
              </h3>
            </div>

            <button
              onClick={handleRegenerateInsight}
              disabled={isGeneratingInsight}
              className="text-[11px] font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-button text-neutral-700 dark:text-neutral-200 transition"
            >
              <RotateCcw className={`w-3 h-3 ${isGeneratingInsight ? 'animate-spin' : ''}`} />
              <span>Buat Ulang</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
            {isGeneratingInsight ? (
              <span className="italic text-neutral-400 font-normal">
                Gemini AI sedang menganalisis data keuangan periode {reportPeriod.label}...
              </span>
            ) : (
              DUMMY_INSIGHTS[insightIndex]
            )}
          </p>
        </div>

        {/* 4 Cards Metrics Grid (Mengikuti reportSummary) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl neu-card space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                Total Masuk
              </span>
              <div className="w-7 h-7 rounded-xl neu-sunken text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-base font-black text-neutral-900 dark:text-neutral-100">
              {formatRupiah(reportSummary.income)}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>+{incomeDiffPercent}% dr periode sblm</span>
            </div>
          </div>

          <div className="p-4 rounded-3xl neu-card space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                Total Keluar
              </span>
              <div className="w-7 h-7 rounded-xl neu-sunken text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-base font-black text-neutral-900 dark:text-neutral-100">
              {formatRupiah(reportSummary.expense)}
            </p>
            <div
              className={`flex items-center gap-1 text-[10px] font-bold ${expenseDiffPercent > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-emerald-600 dark:text-emerald-400'
                }`}
            >
              {expenseDiffPercent > 0 ? (
                <>
                  <TrendingUp className="w-3 h-3" />
                  <span>+{expenseDiffPercent}% bertambah</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3" />
                  <span>{Math.abs(expenseDiffPercent)}% efisiensi</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-3xl neu-card space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                Saldo Periode Ini
              </span>
              <div className="w-7 h-7 rounded-xl neu-sunken text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Wallet className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-base font-black text-orange-600 dark:text-orange-400">
              {formatRupiah(reportSummary.balance)}
            </p>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-bold block">
              {reportSummary.balance >= 0 ? 'Arus kas surplus' : 'Arus kas defisit'}
            </span>
          </div>

          <div className="p-4 rounded-3xl neu-card space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
                Rasio Tabungan
              </span>
              <div className="w-7 h-7 rounded-xl neu-sunken text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <Percent className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
            <p className="text-base font-black text-neutral-900 dark:text-neutral-100">
              {savingsRatio}%
            </p>
            <span className="text-[10px] text-orange-600 dark:text-orange-400 font-bold block">
              {savingsRatio >= 20 ? 'Target tercapai (>20%)' : 'Perlu penghematan'}
            </span>
          </div>
        </div>

        {/* Category Breakdown Table & Chart (Mengikuti reportSummary) */}
        <div className="rounded-3xl p-5 neu-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-xs uppercase tracking-wider">
              Rincian Kategori
            </h3>
            <span className="text-[10px] text-neutral-400 font-bold">
              Total {reportSummary.byCategory.length} kategori
            </span>
          </div>

          <CategoryPieChart data={reportSummary.byCategory} totalExpense={reportSummary.expense} />

          <div className="space-y-3 pt-3 border-t border-[var(--neu-border)]">
            {reportSummary.byCategory.length === 0 ? (
              <p className="text-center text-xs text-neutral-400 font-semibold py-4">
                Tidak ada data pengeluaran pada periode {reportPeriod.label}.
              </p>
            ) : (
              reportSummary.byCategory.map((cat) => {
                const icon = CATEGORY_ICONS[cat.category] || '📦';
                const color = CATEGORY_COLORS[cat.category] || '#6B7280';

                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg neu-sunken flex items-center justify-center shrink-0"
                          style={{ color }}
                        >
                          <CategoryIcon category={cat.category} className="w-3.5 h-3.5 stroke-[2.2]" />
                        </div>
                        <span className="font-extrabold text-neutral-800 dark:text-neutral-200">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-neutral-900 dark:text-neutral-100">
                          {formatRupiah(cat.total)}
                        </span>
                        <span className="text-[11px] text-neutral-400 font-bold w-8 text-right">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Inset progress bar track */}
                    <div className="h-2 w-full rounded-full neu-sunken overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-sm"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Budget Tracker Component */}
        <BudgetTrackerCard />

        {/* Preferensi Tema */}
        <div className="rounded-3xl p-4.5 neu-card flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100">
              Tema Tampilan
            </h4>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-semibold">
              Pilih mode terang atau gelap
            </p>
          </div>
          <ThemeToggle variant="segmented" />
        </div>
      </main>

      {/* Date Range Modal dedicated to Report */}
      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
      />

      <BottomNav />
    </>
  );
}

export default LaporanPage;
