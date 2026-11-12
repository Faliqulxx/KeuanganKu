'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useFinance } from '@/lib/finance-context';
import { formatRupiah } from '@/lib/format';
import { BottomNav } from '@/components/bottom-nav';
import { QuickInput } from '@/components/quick-input';
import { CategoryPieChart } from '@/components/charts/category-pie-chart';
import { MonthlyBarChart } from '@/components/charts/monthly-bar-chart';
import { BalanceSparkline } from '@/components/charts/balance-sparkline';
import { TransactionCard } from '@/components/transaction-card';
import { AiInsightModal } from '@/components/ai-insight-modal';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  PieChart,
  BarChart3,
  Clock,
  Bell,
  Eye,
  EyeOff,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  ScanLine,
  Bot,
  FileBarChart,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const QUICK_ACTIONS = [
  {
    label: 'Tambah',
    href: '/tambah',
    icon: Plus,
    tint: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    label: 'Scan Struk',
    href: '/tambah',
    icon: ScanLine,
    tint: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    label: 'AI Assistant',
    href: '/chat',
    icon: Bot,
    tint: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
  {
    label: 'Laporan',
    href: '/laporan',
    icon: FileBarChart,
    tint: 'bg-orange-500/10 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400',
  },
];

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

function SummaryTile({
  label,
  amount,
  change,
  icon,
  tone,
}: {
  label: string;
  amount: number;
  change: number | null;
  icon: React.ReactNode;
  tone: 'income' | 'expense';
}) {
  const isIncome = tone === 'income';
  // Untuk pengeluaran, jika persentase naik berarti pengeluaran bertambah (merah),
  // sedangkan jika turun berarti penghematan (hijau).
  const isPositiveMetric = change === null ? true : isIncome ? change >= 0 : change <= 0;

  return (
    <div className="rounded-3xl p-4 neu-card relative overflow-hidden">
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none ${
          isIncome ? 'bg-emerald-500/10' : 'bg-rose-500/10'
        }`}
      />
      <div className="relative flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isIncome
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}
        >
          {icon}
        </div>
        <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">{label}</span>
      </div>
      <p className="relative mt-2.5 text-sm font-black text-neutral-900 dark:text-neutral-100 tracking-tight truncate" suppressHydrationWarning>
        {formatRupiah(amount)}
      </p>
      <span
        suppressHydrationWarning
        className={`relative mt-1.5 inline-flex items-center gap-0.5 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
          change === null
            ? 'bg-neutral-500/10 text-neutral-500'
            : isPositiveMetric
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
        }`}
      >
        {change === null ? (
          'Bulan pertama'
        ) : (
          <>
            {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? '+' : ''}
            {change}% vs bln lalu
          </>
        )}
      </span>
    </div>
  );
}

export default function HomePage() {
  const { dashboardSummary, transactions } = useFinance();
  const [hideBalance, setHideBalance] = useState(false);
  const [greeting, setGreeting] = useState('Halo');
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);

  // Sapaan berdasarkan jam (dihitung di klien agar aman untuk prerender)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 11) setGreeting('Selamat pagi');
    else if (hour < 15) setGreeting('Selamat siang');
    else if (hour < 19) setGreeting('Selamat sore');
    else setGreeting('Selamat malam');
  }, []);

  // Tren saldo akumulatif per akhir bulan (6 bulan)
  const balanceTrend = useMemo(
    () =>
      dashboardSummary.monthly.map((m) => {
        const cutoff = `${m.month}-31`;
        const balance = transactions.reduce(
          (acc, t) => (t.date <= cutoff ? acc + (t.type === 'income' ? t.amount : -t.amount) : acc),
          0
        );
        return { label: m.label, balance };
      }),
    [dashboardSummary.monthly, transactions]
  );

  const prevMonth = dashboardSummary.monthly[dashboardSummary.monthly.length - 2];
  const prevBalance = balanceTrend[balanceTrend.length - 2]?.balance ?? 0;
  const balanceGrowth = percentChange(dashboardSummary.balance, prevBalance) ?? 0;
  const incomeChange = prevMonth ? percentChange(dashboardSummary.income, prevMonth.income) : null;
  const expenseChange = prevMonth ? percentChange(dashboardSummary.expense, prevMonth.expense) : null;

  return (
    <>
      <main className="flex-1 px-4 pt-5 pb-4 space-y-4">
        {/* Sapaan pengguna */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-2xl neu-button p-0.5 flex items-center justify-center overflow-hidden ring-2 ring-orange-500/25 bg-gradient-to-b from-orange-500/10 to-orange-500/20 shadow-sm">
                <Image
                  src="/brand/profile-avatar.png"
                  alt="Foto Profil Faliq"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover object-top rounded-xl"
                  priority
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-[var(--bg-app)] shadow-sm" title="Online" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-neutral-900 dark:text-neutral-100 tracking-tight truncate" suppressHydrationWarning>
                {greeting}, Faliq
              </h2>
              <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 truncate">
                Semoga keuanganmu makin sehat hari ini!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsInsightModalOpen(true)}
            aria-label="Lihat Insight AI FinMate"
            className="relative w-10 h-10 rounded-2xl neu-button flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0 group active:scale-95 transition"
          >
            <Bell className="w-4 h-4 stroke-[2.2] group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-orange-500 ring-2 ring-[var(--surface-app)] animate-pulse" />
          </button>
        </div>

        {/* Kartu Saldo Utama (Akumulatif) */}
        <div className="rounded-3xl neu-hero-card p-5 relative overflow-hidden transition-all duration-300">
          {/* Ornamen dekoratif */}
          <div className="absolute -top-14 -right-10 w-44 h-44 rounded-full border-[18px] border-orange-500/[0.06] dark:border-white/[0.05] pointer-events-none" />
          <div className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full bg-orange-500/10 blur-2xl pointer-events-none" />
          <div
            className="absolute inset-0 opacity-[0.08] dark:opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(rgba(245,130,32,0.6) 1px, transparent 1px)',
              backgroundSize: '14px 14px',
              maskImage: 'linear-gradient(135deg, black 0%, transparent 55%)',
              WebkitMaskImage: 'linear-gradient(135deg, black 0%, transparent 55%)',
            }}
          />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                <span className="text-[11px] uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-widest">
                  Total Saldo
                </span>
                <button
                  type="button"
                  onClick={() => setHideBalance((v) => !v)}
                  aria-label={hideBalance ? 'Tampilkan saldo' : 'Sembunyikan saldo'}
                  className="ml-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-neutral-400 hover:text-orange-500 dark:text-neutral-400 dark:hover:text-orange-400 transition"
                >
                  {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span
                suppressHydrationWarning
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  balanceGrowth >= 0
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
                title="Dibanding akhir bulan lalu"
              >
                {balanceGrowth >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {balanceGrowth >= 0 ? '+' : ''}
                {balanceGrowth}%
              </span>
            </div>

            <h2 className="text-[28px] leading-none font-black text-neutral-900 dark:text-neutral-100 tracking-tight" suppressHydrationWarning>
              {hideBalance ? 'Rp •••••••' : formatRupiah(dashboardSummary.balance)}
            </h2>

            <BalanceSparkline data={balanceTrend} />

            <div className="flex items-center justify-between text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 -mt-1">
              <span>Tren saldo 6 bulan</span>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 font-bold text-orange-600 dark:text-orange-400">
                {dashboardSummary.periodLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Cepat */}
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="flex flex-col items-center gap-1.5 group"
              >
                <div className="w-14 h-14 rounded-2xl neu-button flex items-center justify-center group-active:scale-95 transition">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${action.tint}`}>
                    <Icon className="w-[18px] h-[18px] stroke-[2.2]" />
                  </div>
                </div>
                <span className="text-[10.5px] font-bold text-neutral-700 dark:text-neutral-300 text-center leading-tight">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Ringkasan Bulan Ini */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
              Ringkasan Bulan Ini
            </h3>
            <Link
              href="/transaksi"
              className="text-[11px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-0.5 hover:underline"
            >
              Lihat Detail <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SummaryTile
              label="Pemasukan"
              amount={dashboardSummary.income}
              change={incomeChange}
              icon={<ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />}
              tone="income"
            />
            <SummaryTile
              label="Pengeluaran"
              amount={dashboardSummary.expense}
              change={expenseChange}
              icon={<ArrowUpRight className="w-4 h-4 stroke-[2.5]" />}
              tone="expense"
            />
          </div>
        </div>

        {/* Quick Natural Language AI Input */}
        <QuickInput />

        {/* Category Donut Chart Card (Bulan Berjalan) */}
        <div className="rounded-3xl p-5 neu-card space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-orange-600 dark:text-orange-400">
                <PieChart className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Pengeluaran Kategori ({dashboardSummary.periodLabel})
              </h3>
            </div>
            <Link
              href="/laporan"
              className="text-[11px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-0.5 hover:underline"
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
              <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-orange-600 dark:text-orange-400">
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
              <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
                Transaksi Terbaru ({dashboardSummary.periodLabel})
              </h3>
            </div>
            <Link
              href="/transaksi"
              className="text-[11px] text-orange-600 dark:text-orange-400 font-bold flex items-center gap-0.5 hover:underline"
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

      <AiInsightModal
        isOpen={isInsightModalOpen}
        onClose={() => setIsInsightModalOpen(false)}
      />

      <BottomNav />
    </>
  );
}
