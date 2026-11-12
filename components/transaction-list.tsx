'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Transaction } from '@/lib/types';
import { formatDateIndo } from '@/lib/format';
import { TransactionCard } from './transaction-card';
import { EditTransactionModal } from './edit-transaction-modal';
import { Calendar, Download, Filter, Plus, RotateCcw } from 'lucide-react';
import { useFinance } from '@/lib/finance-context';
import Link from 'next/link';

interface TransactionListProps {
  transactions: Transaction[];
  showFilters?: boolean;
  limit?: number;
}

function formatLocalYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultDateRange(): { start: string; end: string } {
  const today = formatLocalYMD(new Date());
  return {
    start: today,
    end: today,
  };
}

export function TransactionList({ transactions, showFilters = true, limit }: TransactionListProps) {
  const { exportCsv } = useFinance();
  const [defaultRange, setDefaultRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  useEffect(() => {
    const range = getDefaultDateRange();
    setDefaultRange(range);
    setStartDate(range.start);
    setEndDate(range.end);
  }, []);

  const isCustomRange =
    Boolean(defaultRange.start) &&
    (startDate !== defaultRange.start || endDate !== defaultRange.end);

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (startDate) {
      list = list.filter((t) => t.date >= startDate);
    }

    if (endDate) {
      list = list.filter((t) => t.date <= endDate);
    }

    // Sort by date desc, then created_at desc
    list.sort((a, b) => {
      if (b.date === a.date) {
        return b.created_at.localeCompare(a.created_at);
      }
      return b.date.localeCompare(a.date);
    });

    if (limit) {
      list = list.slice(0, limit);
    }

    return list;
  }, [transactions, startDate, endDate, limit]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filteredTransactions) {
      const dateKey = tx.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(tx);
    }
    return Array.from(map.entries());
  }, [filteredTransactions]);

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="p-3.5 rounded-3xl neu-card space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Calendar className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span>Filter Tanggal</span>
            </div>

            <div className="flex items-center gap-2">
              {isCustomRange && (
                <button
                  type="button"
                  onClick={() => {
                    setStartDate(defaultRange.start);
                    setEndDate(defaultRange.end);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl neu-button text-[11px] font-bold text-orange-600 dark:text-orange-400 transition"
                  title="Kembalikan ke tanggal hari ini"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}

              <button
                type="button"
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl neu-button text-[11px] font-bold text-neutral-700 dark:text-neutral-300 transition"
                title="Unduh file CSV"
              >
                <Download className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1">
              <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 px-1">
                Dari Tanggal
              </span>
              <input
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark] focus:outline-none transition-all"
              />
            </label>

            <label className="space-y-1">
              <span className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 px-1">
                Sampai Tanggal
              </span>
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 dark:[color-scheme:dark] focus:outline-none transition-all"
              />
            </label>
          </div>
        </div>
      )}

      {/* List items grouped by date */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl neu-card space-y-3">
          <div className="w-12 h-12 rounded-2xl neu-sunken text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Filter className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
              Tidak Ada Transaksi
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 max-w-xs font-medium">
              Belum ada catatan transaksi yang cocok dengan filter atau rentang tanggal yang dipilih.
            </p>
          </div>
          <Link
            href="/tambah"
            className="px-4 py-2.5 rounded-2xl neu-primary-btn text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Tambah Transaksi Baru
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  {formatDateIndo(dateKey)}
                </span>
                <span className="text-[11px] text-neutral-400 font-bold">
                  {items.length} transaksi
                </span>
              </div>

              <div className="space-y-2.5">
                {items.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onClick={() => setEditingTransaction(tx)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}
