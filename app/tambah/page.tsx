'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/finance-context';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { mockReceiptScan, SAMPLE_RECEIPTS, ReceiptResult, ParsedItem } from '@/lib/mock-parser';
import { PreviewCards } from '@/components/preview-cards';
import { formatRupiah } from '@/lib/format';
import { Camera, Check, Sparkles, Layers, FileText, ArrowDownLeft, ArrowUpRight, UploadCloud, Store } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TambahPage() {
  const router = useRouter();
  const { addTransaction, addTransactions, showToast } = useFinance();

  const [activeTab, setActiveTab] = useState<'manual' | 'receipt'>('manual');

  // Manual form state
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('2026-11-07');
  const [category, setCategory] = useState('Makanan');
  const [note, setNote] = useState('');

  // Receipt state
  const [isScanning, setIsScanning] = useState(false);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);
  const [receiptResult, setReceiptResult] = useState<ReceiptResult | null>(null);
  const [receiptMode, setReceiptMode] = useState<'single' | 'split'>('single');
  const [previewItems, setPreviewItems] = useState<ParsedItem[] | null>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount, 10);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast('Mohon masukkan nominal yang valid (> 0)');
      return;
    }

    addTransaction({
      date,
      type,
      amount: parsedAmount,
      category,
      note: note.trim() || category,
      source: 'manual',
      needs_review: false,
    });

    setAmount('');
    setNote('');
    router.push('/transaksi');
  };

  const handleScanReceipt = (sampleIndex = selectedSampleIndex) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const res = mockReceiptScan(sampleIndex);
      setReceiptResult(res);
      showToast(`Berhasil membaca struk ${res.merchant}`);
    }, 900);
  };

  const handleProcessReceiptConfirm = () => {
    if (!receiptResult) return;

    if (receiptMode === 'single') {
      const singleItem: ParsedItem = {
        date: receiptResult.date,
        type: 'expense',
        amount: receiptResult.total,
        category: receiptResult.items[0]?.category || 'Belanja',
        note: `Belanja di ${receiptResult.merchant}`,
        source: 'ai_receipt',
        needs_review: false,
      };
      setPreviewItems([singleItem]);
    } else {
      const items: ParsedItem[] = receiptResult.items.map((item) => ({
        date: receiptResult.date,
        type: 'expense',
        amount: item.price,
        category: item.category,
        note: `${receiptResult.merchant}: ${item.name}`,
        source: 'ai_receipt',
        needs_review: false,
      }));
      setPreviewItems(items);
    }
  };

  const handleSavePreview = (items: ParsedItem[]) => {
    addTransactions(items);
    setPreviewItems(null);
    setReceiptResult(null);
    router.push('/transaksi');
  };

  return (
    <>
      <Header showMonthPicker={false} />

      <main className="flex-1 px-4 py-4 space-y-4">
        {/* Segmented Switch: Manual vs Struk */}
        <div className="flex neu-sunken p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'manual'
                ? 'neu-button text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Input Manual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('receipt')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === 'receipt'
                ? 'neu-button text-emerald-600 dark:text-emerald-400'
                : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Struk (AI)</span>
          </button>
        </div>

        {activeTab === 'manual' ? (
          /* Manual Input Form */
          <form
            onSubmit={handleManualSubmit}
            className="rounded-3xl p-5 neu-card space-y-4"
          >
            {/* Type selector */}
            <div>
              <label className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
                Jenis Transaksi
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('Makanan');
                  }}
                  className={`py-3 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                    type === 'expense'
                      ? 'neu-sunken text-rose-600 dark:text-rose-400 font-black'
                      : 'neu-button text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-500 stroke-[2.5]" />
                  Pengeluaran
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('Gaji');
                  }}
                  className={`py-3 px-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all duration-200 ${
                    type === 'income'
                      ? 'neu-sunken text-emerald-600 dark:text-emerald-400 font-black'
                      : 'neu-button text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
                  Pemasukan
                </button>
              </div>
            </div>

            {/* Nominal input with Neumorphic Inset */}
            <div>
              <label className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-2">
                Nominal (Rp)
              </label>
              <div className="relative rounded-2xl neu-sunken p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-neutral-400 text-lg">
                  Rp
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full text-2xl font-black pl-12 pr-4 py-2.5 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Tanggal & Kategori */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1.5">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1.5">
                  Kategori
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="bg-[var(--surface-app)]">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="text-[10px] font-extrabold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest block mb-1.5">
                Keterangan
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="mis. Makan siang ayam geprek"
                className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl neu-primary-btn font-extrabold text-xs flex items-center justify-center gap-2 mt-2"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Simpan Transaksi
            </button>
          </form>
        ) : (
          /* Scan Struk Section */
          <div className="rounded-3xl p-5 neu-card space-y-4">
            <div className="text-center py-2 space-y-2">
              <div className="w-14 h-14 rounded-2xl neu-button text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Camera className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                Foto atau Unggah Struk Belanja
              </h3>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-xs mx-auto font-medium">
                Gemini AI akan otomatis mengekstrak merchant, tanggal, total, dan rincian item.
              </p>
            </div>

            {!receiptResult && (
              <div className="space-y-3.5">
                {/* Sample selector */}
                <div className="space-y-2">
                  <span className="text-[11px] font-extrabold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block">
                    Pilih Contoh Struk:
                  </span>
                  <div className="grid grid-cols-1 gap-2.5">
                    {SAMPLE_RECEIPTS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedSampleIndex(idx);
                          handleScanReceipt(idx);
                        }}
                        className="flex items-center justify-between p-3.5 rounded-2xl neu-button text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl neu-sunken flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <Store className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-neutral-900 dark:text-neutral-100 block">
                              {s.merchant}
                            </span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                              {s.items.length} item • {s.date}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(s.total)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload or Camera input */}
                <label className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-2xl neu-sunken hover:neu-button text-neutral-600 dark:text-neutral-300 text-xs font-extrabold cursor-pointer transition-all">
                  <UploadCloud className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ambil Foto Kamera / Unggah Gambar</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={() => handleScanReceipt(0)}
                  />
                </label>

                {isScanning && (
                  <div className="p-4 rounded-2xl neu-sunken text-center space-y-2">
                    <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-extrabold text-emerald-700 dark:text-emerald-300">
                      Gemini Vision AI sedang membaca struk...
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Realistic Physical Receipt Card */}
            {receiptResult && (
              <div className="space-y-4 animate-in fade-in">
                <div className="rounded-3xl p-5 neu-card font-mono text-xs relative overflow-hidden">
                  {/* Receipt header */}
                  <div className="text-center pb-3 border-b border-dashed border-neutral-300 dark:border-neutral-700 space-y-1">
                    <p className="font-black text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
                      *** {receiptResult.merchant.toUpperCase()} ***
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Tgl: {receiptResult.date} • 14:28 WIB
                    </p>
                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-sans font-bold">
                      ✓ Terbaca oleh Gemini AI (Structured Output)
                    </p>
                  </div>

                  {/* Items list */}
                  <div className="py-3 border-b border-dashed border-neutral-300 dark:border-neutral-700 space-y-2">
                    {receiptResult.items.map((it, i) => (
                      <div key={i} className="flex justify-between items-center text-xs">
                        <span className="truncate pr-2 text-neutral-800 dark:text-neutral-200">
                          {it.name}
                        </span>
                        <span className="shrink-0 font-bold text-neutral-900 dark:text-neutral-100">
                          {formatRupiah(it.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-3 space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-black">
                      <span className="text-neutral-900 dark:text-neutral-100">TOTAL BAYAR</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {formatRupiah(receiptResult.total)}
                      </span>
                    </div>
                    <p className="text-[9px] text-neutral-400 text-center pt-2 tracking-widest">
                      ||||| | |||| ||||| ||| |||||||
                    </p>
                  </div>
                </div>

                {/* Storage Mode: Single vs Split */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                    Pilihan Penyimpanan:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setReceiptMode('single')}
                      className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        receiptMode === 'single'
                          ? 'neu-sunken text-emerald-600 dark:text-emerald-400'
                          : 'neu-button text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      1 Transaksi Total
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptMode('split')}
                      className={`p-3 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                        receiptMode === 'split'
                          ? 'neu-sunken text-emerald-600 dark:text-emerald-400'
                          : 'neu-button text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Pecah {receiptResult.items.length} Item
                    </button>
                  </div>
                </div>

                {/* Confirm actions */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setReceiptResult(null)}
                    className="flex-1 py-3 px-3 rounded-2xl neu-button text-xs font-bold text-neutral-600 dark:text-neutral-300"
                  >
                    Foto Ulang
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessReceiptConfirm}
                    className="flex-2 py-3 px-4 rounded-2xl neu-primary-btn text-xs font-extrabold flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Lanjut ke Pratinjau ({receiptMode === 'single' ? '1 Transaksi' : `${receiptResult.items.length} Item`})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Preview modal if items confirmed from receipt */}
      {previewItems && (
        <PreviewCards
          items={previewItems}
          onSave={handleSavePreview}
          onCancel={() => setPreviewItems(null)}
        />
      )}

      <BottomNav />
    </>
  );
}
