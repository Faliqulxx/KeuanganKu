'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/finance-context';
import { parseNaturalText, mockReceiptScan, ParsedItem } from '@/lib/mock-parser';
import { PreviewCards } from './preview-cards';
import { Camera, Mic, Send, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'makan siang 25rb, bensin 50rb',
  'kemarin kopi 18rb, tadi pagi gajian 5 juta',
  'bayar kos sejuta',
  'nonton bioskop 120rb kemarin',
];

export function QuickInput() {
  const { addTransactions, showToast } = useFinance();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewItems, setPreviewItems] = useState<ParsedItem[] | null>(null);
  const [previewWarnings, setPreviewWarnings] = useState<string[]>([]);
  const [isListeningVoice, setIsListeningVoice] = useState(false);

  const handleSubmit = (textToParse?: string) => {
    const text = textToParse || inputText;
    if (!text.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      const { items, warnings } = parseNaturalText(text);
      setIsProcessing(false);

      if (items.length === 0) {
        showToast('Tidak ada transaksi terdeteksi. Coba: "makan 25rb"');
      } else {
        setPreviewItems(items);
        setPreviewWarnings(warnings);
      }
    }, 400);
  };

  const handleVoiceSimulate = () => {
    setIsListeningVoice(true);
    showToast('Mendengarkan suara... (simulasi)');
    setTimeout(() => {
      setIsListeningVoice(false);
      const voiceSample = 'makan siang 35rb dan bensin pertalite 20rb';
      setInputText(voiceSample);
      handleSubmit(voiceSample);
    }, 1500);
  };

  const handleReceiptSimulate = () => {
    setIsProcessing(true);
    showToast('Memindai struk belanja dengan Gemini AI...');
    setTimeout(() => {
      setIsProcessing(false);
      const receipt = mockReceiptScan();
      const items: ParsedItem[] = receipt.items.map((item) => ({
        date: receipt.date,
        type: 'expense',
        amount: item.price,
        category: item.category,
        note: `${receipt.merchant}: ${item.name}`,
        source: 'ai_receipt',
        needs_review: false,
      }));
      setPreviewItems(items);
      setPreviewWarnings([`Berhasil membaca struk ${receipt.merchant} (${items.length} item).`]);
    }, 900);
  };

  const handleSaveConfirmed = (items: ParsedItem[]) => {
    addTransactions(items);
    setPreviewItems(null);
    setInputText('');
  };

  return (
    <div className="rounded-3xl p-5 neu-card space-y-3.5 transition-all w-full min-w-0 overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg neu-button flex items-center justify-center text-orange-600 dark:text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-extrabold text-neutral-900 dark:text-neutral-100 tracking-tight">
            Catat Cepat (AI)
          </span>
        </div>
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-semibold">
          Bahasa Natural • Struk
        </span>
      </div>

      {/* Sunken Input Box */}
      <div className="relative flex items-center rounded-2xl neu-sunken p-2 focus-within:ring-2 focus-within:ring-orange-500/40 transition-all">
        <textarea
          rows={2}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Ketik mis. makan siang 25rb, bensin 50rb..."
          className="w-full text-xs sm:text-sm bg-transparent px-3 py-1 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none resize-none font-medium"
        />

        <div className="flex flex-col gap-1 items-center pr-1">
          <button
            onClick={() => handleSubmit()}
            disabled={isProcessing || !inputText.trim()}
            className="w-9 h-9 rounded-xl neu-primary-btn disabled:opacity-40 flex items-center justify-center transition"
            title="Kirim ke AI"
          >
            {isProcessing ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Action Buttons: Voice & Receipt */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceSimulate}
            className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl transition-all ${
              isListeningVoice
                ? 'neu-sunken text-orange-600 animate-pulse'
                : 'neu-button text-neutral-700 dark:text-neutral-200'
            }`}
            title="Input suara (mic)"
          >
            <Mic className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Suara</span>
          </button>

          <button
            type="button"
            onClick={handleReceiptSimulate}
            className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-2 rounded-xl neu-button text-neutral-700 dark:text-neutral-200"
            title="Scan struk kamera"
          >
            <Camera className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
            <span>Scan Struk</span>
          </button>
        </div>

        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium hidden sm:inline">
          Tekan Enter untuk kirim
        </span>
      </div>

      {/* Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
        <span className="text-neutral-400 dark:text-neutral-500 text-[10px] shrink-0 font-bold">Contoh:</span>
        {SUGGESTIONS.map((sug, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(sug);
              handleSubmit(sug);
            }}
            className="shrink-0 px-2.5 py-1 rounded-xl neu-button text-neutral-700 dark:text-neutral-300 text-[10.5px] font-semibold hover:text-orange-600 dark:hover:text-orange-400"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Preview modal if items ready */}
      {previewItems && (
        <PreviewCards
          items={previewItems}
          warnings={previewWarnings}
          onSave={handleSaveConfirmed}
          onCancel={() => setPreviewItems(null)}
        />
      )}
    </div>
  );
}
