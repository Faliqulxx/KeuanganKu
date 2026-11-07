'use client';

import React, { useState } from 'react';
import { Transaction } from '@/lib/types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { useFinance } from '@/lib/finance-context';
import { X, Trash2, Check } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, onClose }: EditTransactionModalProps) {
  const { updateTransaction, deleteTransaction } = useFinance();

  const [date, setDate] = useState(transaction.date);
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [category, setCategory] = useState(transaction.category);
  const [note, setNote] = useState(transaction.note);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSave = () => {
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    updateTransaction(transaction.id, {
      date,
      type,
      amount: parsedAmount,
      category,
      note,
      needs_review: false,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteTransaction(transaction.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4">
      <div className="bg-[var(--surface-app)] w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl neu-floating p-5 space-y-4 animate-in slide-in-from-bottom-6 duration-300">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--neu-border)]">
          <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-base">
            Edit Transaksi
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Type toggle */}
        <div className="flex rounded-2xl neu-sunken p-1">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategory('Makanan');
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 ${
              type === 'expense'
                ? 'neu-button text-rose-600 dark:text-rose-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategory('Gaji');
            }}
            className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all duration-200 ${
              type === 'income'
                ? 'neu-button text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            Pemasukan
          </button>
        </div>

        {/* Nominal input */}
        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 block">
            Nominal (Rp)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-xl font-black px-3.5 py-2.5 rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>

        {/* Date and Category */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 block">
              Tanggal
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 block">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2.5 rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c} className="bg-[var(--surface-app)]">
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1 block">
            Keterangan
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Keterangan transaksi"
            className="w-full text-xs font-medium px-3.5 py-2.5 rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleDelete}
            className="w-12 h-12 rounded-2xl neu-button text-rose-500 hover:text-rose-600 flex items-center justify-center shrink-0"
            title="Hapus transaksi"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 px-4 rounded-2xl neu-primary-btn text-xs font-extrabold flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  );
}
