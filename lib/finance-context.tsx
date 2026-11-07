'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Transaction, MonthSummary, ChatMessage, DateFilter, DateFilterMode, CategoryBudgetStatus } from './types';
import { INITIAL_TRANSACTIONS, INITIAL_CHAT_MESSAGES } from './dummy-data';
import { formatRupiah, formatDateIndo, formatMonthYear } from './format';

const DEFAULT_BUDGETS: Record<string, number> = {
  Makanan: 1500000,
  Transport: 600000,
  Belanja: 1000000,
  Tagihan: 1500000,
  Hiburan: 400000,
  Kesehatan: 300000,
};

interface FinanceContextType {
  transactions: Transaction[];
  
  // 1. Dashboard Operational Period
  dashboardPeriod: string; // 'YYYY-MM'
  setDashboardPeriod: (period: string) => void;
  goToPrevDashboardMonth: () => void;
  goToNextDashboardMonth: () => void;
  dashboardSummary: MonthSummary;
  summary: MonthSummary; // alias for dashboard compatibility

  // 2. Transaction Page Period
  transactionPeriod: string; // 'YYYY-MM'
  setTransactionPeriod: (period: string) => void;
  goToPrevTransactionMonth: () => void;
  goToNextTransactionMonth: () => void;
  transactionFilteredList: Transaction[];

  // 3. Report Analysis Period (Isolated from dashboard & transactions)
  reportPeriod: DateFilter;
  setReportPeriod: (filter: DateFilter) => void;
  setReportMonthFilter: (year: number, month: number) => void;
  setReportDateRangeFilter: (startDate: string, endDate: string, label?: string) => void;
  setReportYearFilter: (year: number) => void;
  setReportAllFilter: () => void;
  goToPrevReportMonth: () => void;
  goToNextReportMonth: () => void;
  reportSummary: MonthSummary;
  exportReportCsv: () => void;
  exportCsv: () => void; // alias for exportReportCsv

  // CRUD & Budget
  addTransaction: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => void;
  addTransactions: (txs: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]) => void;
  updateTransaction: (id: string, updated: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  undoDelete: () => void;
  canUndo: boolean;
  budgets: Record<string, number>;
  updateBudget: (category: string, limit: number) => void;
  toast: { message: string; action?: { label: string; onClick: () => void } } | null;
  showToast: (message: string, action?: { label: string; onClick: () => void }) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (content: string) => void;
  resetToDummy: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'keuanganku_transactions';
const BUDGET_STORAGE_KEY = 'keuanganku_budgets';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// Helper to compute summary metrics from any list of transactions
function calculateSummary(
  allTransactions: Transaction[],
  filtered: Transaction[],
  periodLabel: string,
  referenceMonth: string,
  budgets: Record<string, number>,
  cutoffDate?: string
): MonthSummary {
  let income = 0;
  let expense = 0;
  const catMap: Record<string, number> = {};

  // Total Masuk, Total Keluar, dan Kategori hanya untuk transaksi di periode/bulan berjalan
  filtered.forEach((t) => {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    }
  });

  // Saldo Diteruskan (Akumulatif / Carry-Over):
  // Menghitung seluruh pemasukan dikurangi seluruh pengeluaran dari awal hingga akhir bulan/periode aktif
  const effectiveCutoff = cutoffDate || `${referenceMonth}-31`;
  let cumulativeIncome = 0;
  let cumulativeExpense = 0;
  allTransactions.forEach((t) => {
    if (t.date <= effectiveCutoff) {
      if (t.type === 'income') {
        cumulativeIncome += t.amount;
      } else {
        cumulativeExpense += t.amount;
      }
    }
  });

  const balance = cumulativeIncome - cumulativeExpense;

  const byCategory = Object.entries(catMap)
    .map(([category, total]) => ({
      category,
      total,
      percentage: expense > 0 ? Math.round((total / expense) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Budget status calculation
  const budgetStatuses: CategoryBudgetStatus[] = Object.entries(budgets).map(
    ([category, limit]) => {
      const spent = catMap[category] || 0;
      const percentage = Math.round((spent / limit) * 100);
      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (percentage >= 100) {
        status = 'exceeded';
      } else if (percentage >= 75) {
        status = 'warning';
      }
      return {
        category,
        spent,
        limit,
        percentage,
        status,
      };
    }
  );

  // 6-month historical overview based on reference month (YYYY-MM)
  const [refY, refM] = referenceMonth.split('-').map(Number);
  const monthlyData = [];
  const monthShorts = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  for (let i = 5; i >= 0; i--) {
    let targetM = refM - i;
    let targetY = refY;
    while (targetM <= 0) {
      targetM += 12;
      targetY -= 1;
    }
    const mStr = `${targetY}-${String(targetM).padStart(2, '0')}`;
    const mLabel = monthShorts[targetM - 1];

    const mTx = allTransactions.filter((t) => t.date.startsWith(mStr));
    const mIncome = mTx.filter((t) => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
    const mExpense = mTx.filter((t) => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

    monthlyData.push({
      month: mStr,
      label: mLabel,
      income: mIncome,
      expense: mExpense,
    });
  }

  const recent = [...filtered]
    .sort((a, b) => (b.date === a.date ? b.created_at.localeCompare(a.created_at) : b.date.localeCompare(a.date)))
    .slice(0, 5);

  return {
    periodLabel,
    month: referenceMonth,
    income,
    expense,
    balance,
    byCategory,
    budgetStatuses,
    monthly: monthlyData,
    recent,
    filteredTransactions: filtered,
  };
}

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing stored transactions', e);
        }
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<Record<string, number>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing stored budgets', e);
        }
      }
    }
    return DEFAULT_BUDGETS;
  });

  // 1. Dashboard Operational Period (Default: bulan berjalan November 2026)
  const [dashboardPeriod, setDashboardPeriod] = useState<string>('2026-11');

  // 2. Transaction Page Period (Default: bulan berjalan November 2026)
  const [transactionPeriod, setTransactionPeriod] = useState<string>('2026-11');

  // 3. Report Analysis Period (Independent state for Laporan & CSV export)
  const [reportPeriod, setReportPeriod] = useState<DateFilter>({
    mode: 'month',
    year: 2026,
    month: 11,
    startDate: '2026-11-01',
    endDate: '2026-11-30',
    label: 'November 2026',
  });

  const [deletedTxBuffer, setDeletedTxBuffer] = useState<Transaction | null>(null);
  const [toast, setToast] = useState<{ message: string; action?: { label: string; onClick: () => void } } | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgets));
    }
  }, [budgets]);

  const showToast = (message: string, action?: { label: string; onClick: () => void }) => {
    setToast({ message, action });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // --- Dashboard period navigation ---
  const goToPrevDashboardMonth = () => {
    const [y, m] = dashboardPeriod.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setDashboardPeriod(newMonth);
  };

  const goToNextDashboardMonth = () => {
    const [y, m] = dashboardPeriod.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setDashboardPeriod(newMonth);
  };

  // --- Transaction period navigation ---
  const goToPrevTransactionMonth = () => {
    const [y, m] = transactionPeriod.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setTransactionPeriod(newMonth);
  };

  const goToNextTransactionMonth = () => {
    const [y, m] = transactionPeriod.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setTransactionPeriod(newMonth);
  };

  // --- Report period functions ---
  const setReportMonthFilter = (year: number, month: number) => {
    const mStr = String(month).padStart(2, '0');
    const lastDay = new Date(year, month, 0).getDate();
    setReportPeriod({
      mode: 'month',
      year,
      month,
      startDate: `${year}-${mStr}-01`,
      endDate: `${year}-${mStr}-${String(lastDay).padStart(2, '0')}`,
      label: `${MONTH_NAMES[month - 1]} ${year}`,
    });
  };

  const setReportDateRangeFilter = (startDate: string, endDate: string, customLabel?: string) => {
    const startFormatted = formatDateIndo(startDate);
    const endFormatted = formatDateIndo(endDate);
    const label = customLabel || `${startFormatted} – ${endFormatted}`;
    setReportPeriod({
      mode: 'range',
      year: parseInt(startDate.slice(0, 4), 10) || 2026,
      month: parseInt(startDate.slice(5, 7), 10) || 11,
      startDate,
      endDate,
      label,
    });
  };

  const setReportYearFilter = (year: number) => {
    setReportPeriod({
      mode: 'year',
      year,
      month: 1,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
      label: `Tahun ${year}`,
    });
  };

  const setReportAllFilter = () => {
    setReportPeriod({
      mode: 'all',
      year: 2026,
      month: 11,
      startDate: '2020-01-01',
      endDate: '2030-12-31',
      label: 'Semua Periode',
    });
  };

  const goToPrevReportMonth = () => {
    let newMonth = reportPeriod.month - 1;
    let newYear = reportPeriod.year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setReportMonthFilter(newYear, newMonth);
  };

  const goToNextReportMonth = () => {
    let newMonth = reportPeriod.month + 1;
    let newYear = reportPeriod.year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setReportMonthFilter(newYear, newMonth);
  };

  // --- CRUD Actions ---
  const addTransaction = (txData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    const now = '2026-11-07T14:30:00Z';
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: now,
      updated_at: now,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast('Transaksi berhasil disimpan');
  };

  const addTransactions = (txsData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>[]) => {
    const now = '2026-11-07T14:30:00Z';
    const newTxs: Transaction[] = txsData.map((t, idx) => ({
      ...t,
      id: `tx-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      created_at: now,
      updated_at: now,
    }));
    setTransactions((prev) => [...newTxs, ...prev]);
    showToast(`${newTxs.length} transaksi berhasil disimpan!`);
  };

  const updateTransaction = (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((tx) =>
        tx.id === id ? { ...tx, ...updated, updated_at: '2026-11-07T14:30:00Z' } : tx
      )
    );
    showToast('Transaksi diperbarui');
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;
    setDeletedTxBuffer(target);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast('Transaksi dihapus', {
      label: 'Batalkan',
      onClick: () => undoDelete(),
    });
  };

  const undoDelete = () => {
    if (deletedTxBuffer) {
      setTransactions((prev) => [deletedTxBuffer, ...prev]);
      setDeletedTxBuffer(null);
      showToast('Penghapusan dibatalkan');
    }
  };

  const updateBudget = (category: string, limit: number) => {
    setBudgets((prev) => ({
      ...prev,
      [category]: limit,
    }));
    showToast(`Anggaran ${category} diperbarui`);
  };

  const resetToDummy = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
    setDashboardPeriod('2026-11');
    setTransactionPeriod('2026-11');
    setReportMonthFilter(2026, 11);
    showToast('Data direset ke contoh awal');
  };

  // =========================================================================
  // 1. DASHBOARD SUMMARY (Strictly calculated for dashboardPeriod)
  // =========================================================================
  const dashboardSummary: MonthSummary = useMemo(() => {
    const filtered = transactions.filter((t) => t.date.startsWith(dashboardPeriod));
    const label = formatMonthYear(dashboardPeriod);
    return calculateSummary(transactions, filtered, label, dashboardPeriod, budgets);
  }, [transactions, dashboardPeriod, budgets]);

  // =========================================================================
  // 2. TRANSACTION LIST (Strictly filtered by transactionPeriod)
  // =========================================================================
  const transactionFilteredList: Transaction[] = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(transactionPeriod));
  }, [transactions, transactionPeriod]);

  // =========================================================================
  // 3. REPORT SUMMARY (Strictly calculated for reportPeriod)
  // =========================================================================
  const reportSummary: MonthSummary = useMemo(() => {
    let filtered: Transaction[] = [];
    let cutoff = '9999-12-31';

    if (reportPeriod.mode === 'month') {
      const mStr = `${reportPeriod.year}-${String(reportPeriod.month).padStart(2, '0')}`;
      filtered = transactions.filter((t) => t.date.startsWith(mStr));
      cutoff = `${mStr}-31`;
    } else if (reportPeriod.mode === 'year') {
      filtered = transactions.filter((t) => t.date.startsWith(`${reportPeriod.year}-`));
      cutoff = `${reportPeriod.year}-12-31`;
    } else if (reportPeriod.mode === 'range') {
      filtered = transactions.filter(
        (t) => t.date >= reportPeriod.startDate && t.date <= reportPeriod.endDate
      );
      cutoff = reportPeriod.endDate;
    } else {
      filtered = [...transactions];
      cutoff = '9999-12-31';
    }

    const refMonth = `${reportPeriod.year}-${String(reportPeriod.month).padStart(2, '0')}`;
    return calculateSummary(transactions, filtered, reportPeriod.label, refMonth, budgets, cutoff);
  }, [transactions, reportPeriod, budgets]);

  // =========================================================================
  // 4. EXPORT REPORT CSV (Strictly exports active report period)
  // =========================================================================
  const exportReportCsv = () => {
    const targetData = reportSummary.filteredTransactions;
    const headers = ['ID', 'Tanggal', 'Jenis', 'Nominal', 'Kategori', 'Keterangan', 'Sumber'];
    const rows = targetData.map((t) => [
      t.id,
      t.date,
      t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      t.amount,
      `"${t.category.replace(/"/g, '""')}"`,
      `"${t.note.replace(/"/g, '""')}"`,
      t.source,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Clean safe filename
    const safeLabel = reportPeriod.label.replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `transaksi_laporan_${safeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`File CSV Laporan (${reportPeriod.label}) berhasil diunduh!`);
  };

  // =========================================================================
  // 5. CHAT AI (Dynamic multi-period queries against real database transactions)
  // =========================================================================
  const sendChatMessage = (userText: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: '14:28',
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      const lower = userText.toLowerCase();
      let reply = '';

      // Helper for sum
      const getSum = (txs: Transaction[], type: 'income' | 'expense') =>
        txs.filter((t) => t.type === type).reduce((acc, t) => acc + t.amount, 0);

      // Question 1: Perbandingan Oktober dan November
      if (
        (lower.includes('bandingkan') || lower.includes('perbandingan') || lower.includes('dibanding')) &&
        lower.includes('oktober') &&
        lower.includes('november')
      ) {
        const oktTxs = transactions.filter((t) => t.date.startsWith('2026-10'));
        const novTxs = transactions.filter((t) => t.date.startsWith('2026-11'));

        const oktExp = getSum(oktTxs, 'expense');
        const novExp = getSum(novTxs, 'expense');
        const diff = novExp - oktExp;
        const diffPercent = oktExp > 0 ? Math.round((Math.abs(diff) / oktExp) * 100) : 0;

        if (diff < 0) {
          reply = `Perbandingan pengeluaran:\n• **Oktober 2026**: ${formatRupiah(oktExp)}\n• **November 2026**: ${formatRupiah(novExp)}\n\nPengeluaran bulan November **lebih hemat ${formatRupiah(Math.abs(diff))} (-${diffPercent}%)** dibandingkan bulan Oktober.`;
        } else {
          reply = `Perbandingan pengeluaran:\n• **Oktober 2026**: ${formatRupiah(oktExp)}\n• **November 2026**: ${formatRupiah(novExp)}\n\nPengeluaran bulan November **naik ${formatRupiah(diff)} (+${diffPercent}%)** dibandingkan bulan Oktober.`;
        }
      }
      // Question 2: 7 Hari Terakhir
      else if (lower.includes('7 hari') || lower.includes('seminggu')) {
        const txs7 = transactions.filter(
          (t) => t.date >= '2026-11-01' && t.date <= '2026-11-07' && t.type === 'expense'
        );
        const total7 = txs7.reduce((acc, t) => acc + t.amount, 0);
        reply = `Total pengeluaran Anda selama **7 hari terakhir** (1 – 7 Nov 2026) adalah **${formatRupiah(total7)}** dari ${txs7.length} transaksi.`;
      }
      // Question 3: 30 Hari Terakhir
      else if (lower.includes('30 hari') || lower.includes('sebulan terakhir')) {
        const txs30 = transactions.filter(
          (t) => t.date >= '2026-10-09' && t.date <= '2026-11-07' && t.type === 'expense'
        );
        const total30 = txs30.reduce((acc, t) => acc + t.amount, 0);
        reply = `Total pengeluaran Anda selama **30 hari terakhir** adalah **${formatRupiah(total30)}**.`;
      }
      // Question 4: Sepanjang tahun 2026 / tahunan
      else if (lower.includes('sepanjang tahun') || lower.includes('tahun 2026') || lower.includes('total tahun')) {
        const txs2026 = transactions.filter((t) => t.date.startsWith('2026-'));
        const inc2026 = getSum(txs2026, 'income');
        const exp2026 = getSum(txs2026, 'expense');
        const bal2026 = inc2026 - exp2026;

        if (lower.includes('masuk') || lower.includes('pemasukan') || lower.includes('gaji')) {
          reply = `Total pemasukan Anda **sepanjang tahun 2026** tercatat sebesar **${formatRupiah(inc2026)}**.`;
        } else if (lower.includes('keluar') || lower.includes('pengeluaran')) {
          reply = `Total pengeluaran Anda **sepanjang tahun 2026** adalah sebesar **${formatRupiah(exp2026)}**.`;
        } else {
          reply = `Rekap keuangan Anda **sepanjang tahun 2026**:\n• Total Pemasukan: **${formatRupiah(inc2026)}**\n• Total Pengeluaran: **${formatRupiah(exp2026)}**\n• Akumulasi Saldo Bersih: **${formatRupiah(bal2026)}**.`;
        }
      }
      // Question 5: Bulan Oktober secara spesifik
      else if (lower.includes('oktober')) {
        const oktTxs = transactions.filter((t) => t.date.startsWith('2026-10'));
        const expOkt = getSum(oktTxs, 'expense');
        const incOkt = getSum(oktTxs, 'income');
        reply = `Pada bulan **Oktober 2026**, total pengeluaran Anda adalah **${formatRupiah(expOkt)}** dan total pemasukan **${formatRupiah(incOkt)}** (Saldo: ${formatRupiah(incOkt - expOkt)}).`;
      }
      // Question 6: Hari ini (7 Nov 2026)
      else if (lower.includes('hari ini')) {
        const todayTxs = transactions.filter((t) => t.date === '2026-11-07' && t.type === 'expense');
        const todayTotal = todayTxs.reduce((sum, t) => sum + t.amount, 0);
        if (todayTotal > 0) {
          const itemsStr = todayTxs.map((t) => `${t.note} (${formatRupiah(t.amount)})`).join(', ');
          reply = `Hari ini Anda telah mengeluarkan total **${formatRupiah(todayTotal)}** untuk: ${itemsStr}.`;
        } else {
          reply = 'Hari ini belum ada pengeluaran yang tercatat.';
        }
      }
      // Question 7: Anggaran / Budget
      else if (lower.includes('anggaran') || lower.includes('budget')) {
        const exceeded = dashboardSummary.budgetStatuses.filter((b) => b.status === 'exceeded');
        const warning = dashboardSummary.budgetStatuses.filter((b) => b.status === 'warning');
        if (exceeded.length > 0) {
          reply = `Perhatian! Kategori **${exceeded.map((e) => e.category).join(', ')}** telah melebihi batas anggaran bulanan berjalan.`;
        } else if (warning.length > 0) {
          reply = `Kategori **${warning.map((w) => w.category).join(', ')}** sudah mendekati batas anggaran (di atas 75%).`;
        } else {
          reply = 'Semua pos anggaran kategori Anda pada bulan berjalan masih dalam status **Aman** (di bawah 75%).';
        }
      }
      // Question 8: Bulan berjalan (November 2026) / Paling boros
      else if (lower.includes('boros') || lower.includes('paling banyak')) {
        const novSummary = dashboardSummary;
        if (novSummary.byCategory.length > 0) {
          const top = novSummary.byCategory[0];
          reply = `Pada bulan berjalan (${novSummary.periodLabel}), pengeluaran terbesarmu ada di kategori **${top.category}** sebesar **${formatRupiah(top.total)}** (${top.percentage}% dari total).`;
        } else {
          reply = 'Belum ada data pengeluaran untuk bulan ini.';
        }
      }
      // Question 9: Saldo Akumulatif (Diteruskan)
      else if (lower.includes('saldo')) {
        reply = `**Total Saldo Akumulatif** Anda saat ini adalah **${formatRupiah(dashboardSummary.balance)}** (diteruskan dari bulan-bulan sebelumnya).\n\nUntuk bulan berjalan (**${dashboardSummary.periodLabel}**):\n• Total Masuk: **${formatRupiah(dashboardSummary.income)}**\n• Total Keluar: **${formatRupiah(dashboardSummary.expense)}**`;
      }
      // Default: Specific items lookup (listrik, kos, kopi, dll.)
      else {
        const match = transactions.find((t) =>
          lower.split(' ').some((word) => word.length > 3 && t.note.toLowerCase().includes(word))
        );
        if (match) {
          reply = `Terakhir kali tercatat transaksi **${match.note}** pada **${formatDateIndo(match.date)}** sebesar **${formatRupiah(match.amount)}** (${match.type === 'income' ? 'Masuk' : 'Keluar'}).`;
        } else {
          reply = `Berdasarkan data bulan berjalan (${dashboardSummary.periodLabel}), total pemasukan adalah **${formatRupiah(dashboardSummary.income)}** dan pengeluaran **${formatRupiah(dashboardSummary.expense)}**. Anda juga dapat menanyakan perbandingan bulan lalu atau rekap tahunan.`;
        }
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: '14:28',
      };
      setChatMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <FinanceContext.Provider
      value={{
        transactions,

        // 1. Dashboard
        dashboardPeriod,
        setDashboardPeriod,
        goToPrevDashboardMonth,
        goToNextDashboardMonth,
        dashboardSummary,
        summary: dashboardSummary, // alias

        // 2. Transaction
        transactionPeriod,
        setTransactionPeriod,
        goToPrevTransactionMonth,
        goToNextTransactionMonth,
        transactionFilteredList,

        // 3. Report
        reportPeriod,
        setReportPeriod,
        setReportMonthFilter,
        setReportDateRangeFilter,
        setReportYearFilter,
        setReportAllFilter,
        goToPrevReportMonth,
        goToNextReportMonth,
        reportSummary,
        exportReportCsv,
        exportCsv: exportReportCsv,

        // Common
        addTransaction,
        addTransactions,
        updateTransaction,
        deleteTransaction,
        undoDelete,
        canUndo: !!deletedTxBuffer,
        budgets,
        updateBudget,
        toast,
        showToast,
        chatMessages,
        sendChatMessage,
        resetToDummy,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
