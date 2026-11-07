'use client';

import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '@/lib/types';
import { formatDateIndo } from '@/lib/format';
import { TransactionCard } from './transaction-card';
import { EditTransactionModal } from './edit-transaction-modal';
import { Search, Download, Filter, Plus } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { useFinance } from '@/lib/finance-context';
import Link from 'next/link';

interface TransactionListProps {
  transactions: Transaction[];
  showFilters?: boolean;
  limit?: number;
}

export function TransactionList({ transactions, showFilters = true, limit }: TransactionListProps) {
  const { exportCsv } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TransactionType | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.note.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
      );
    }

    if (selectedType !== 'all') {
      list = list.filter((t) => t.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      list = list.filter((t) => t.category === selectedCategory);
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
  }, [transactions, searchQuery, selectedType, selectedCategory, limit]);

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

  const allCategories = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="space-y-3">
          {/* Search bar & Export button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari keterangan, kategori, atau nominal..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs font-medium rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none transition-all"
              />
            </div>

            <button
              onClick={exportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl neu-button text-xs font-bold text-neutral-700 dark:text-neutral-300 transition"
              title="Unduh file CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>CSV</span>
            </button>
          </div>

          {/* Type filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
                selectedType === 'all'
                  ? 'neu-sunken text-emerald-600 dark:text-emerald-400'
                  : 'neu-button text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setSelectedType('expense')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
                selectedType === 'expense'
                  ? 'neu-sunken text-rose-600 dark:text-rose-400'
                  : 'neu-button text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setSelectedType('income')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold shrink-0 transition-all ${
                selectedType === 'income'
                  ? 'neu-sunken text-emerald-600 dark:text-emerald-400'
                  : 'neu-button text-neutral-600 dark:text-neutral-400'
              }`}
            >
              Pemasukan
            </button>

            {/* Category dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold neu-button text-neutral-700 dark:text-neutral-300 shrink-0 focus:outline-none"
            >
              <option value="all" className="bg-[var(--surface-app)]">Semua Kategori</option>
              {allCategories.map((c) => (
                <option key={c} value={c} className="bg-[var(--surface-app)]">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* List items grouped by date */}
      {grouped.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-3xl neu-card space-y-3">
          <div className="w-12 h-12 rounded-2xl neu-sunken text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
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
