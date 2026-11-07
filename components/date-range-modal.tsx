'use client';

import React, { useState } from 'react';
import { useFinance } from '@/lib/finance-context';
import { DateFilterMode } from '@/lib/types';
import { Calendar, ChevronLeft, ChevronRight, Check, X, CalendarDays, Layers } from 'lucide-react';

interface DateRangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MONTHS = [
  { num: 1, name: 'Jan', full: 'Januari' },
  { num: 2, name: 'Feb', full: 'Februari' },
  { num: 3, name: 'Mar', full: 'Maret' },
  { num: 4, name: 'Apr', full: 'April' },
  { num: 5, name: 'Mei', full: 'Mei' },
  { num: 6, name: 'Jun', full: 'Juni' },
  { num: 7, name: 'Jul', full: 'Juli' },
  { num: 8, name: 'Agu', full: 'Agustus' },
  { num: 9, name: 'Sep', full: 'September' },
  { num: 10, name: 'Okt', full: 'Oktober' },
  { num: 11, name: 'Nov', full: 'November' },
  { num: 12, name: 'Des', full: 'Desember' },
];

const YEARS = [2024, 2025, 2026, 2027];

export function DateRangeModal({ isOpen, onClose }: DateRangeModalProps) {
  const {
    reportPeriod,
    setReportMonthFilter,
    setReportDateRangeFilter,
    setReportYearFilter,
    setReportAllFilter,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<DateFilterMode>(reportPeriod.mode === 'all' ? 'month' : reportPeriod.mode);
  
  // Local state for Month & Year tab
  const [selectedYear, setSelectedYear] = useState<number>(reportPeriod.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(reportPeriod.month);

  // Local state for Range tab
  const [startDate, setStartDate] = useState<string>(reportPeriod.startDate || '2026-11-01');
  const [endDate, setEndDate] = useState<string>(reportPeriod.endDate || '2026-11-07');

  if (!isOpen) return null;

  const handleApply = () => {
    if (activeTab === 'month') {
      setReportMonthFilter(selectedYear, selectedMonth);
    } else if (activeTab === 'range') {
      if (startDate && endDate) {
        setReportDateRangeFilter(startDate, endDate);
      }
    } else if (activeTab === 'year') {
      setReportYearFilter(selectedYear);
    } else if (activeTab === 'all') {
      setReportAllFilter();
    }
    onClose();
  };

  const handleApplyPreset = (preset: 'this_month' | 'last_month' | 'last_7_days' | 'last_30_days' | 'all') => {
    if (preset === 'this_month') {
      setReportMonthFilter(2026, 11);
    } else if (preset === 'last_month') {
      setReportMonthFilter(2026, 10);
    } else if (preset === 'last_7_days') {
      setReportDateRangeFilter('2026-11-01', '2026-11-07', '7 Hari Terakhir');
    } else if (preset === 'last_30_days') {
      setReportDateRangeFilter('2026-10-09', '2026-11-07', '30 Hari Terakhir');
    } else if (preset === 'all') {
      setReportAllFilter();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex flex-col justify-end sm:justify-center p-0 sm:p-4">
      <div className="bg-[var(--surface-app)] w-full sm:max-w-md mx-auto rounded-t-3xl sm:rounded-3xl neu-floating flex flex-col overflow-hidden max-h-[90vh] animate-in slide-in-from-bottom-6 duration-300">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--neu-border)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl neu-button text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 dark:text-neutral-100 text-sm">
                Filter Periode Laporan
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                Pilih periode analisis untuk grafik & ekspor CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Mode Tabs */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-4 neu-sunken p-1 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('month')}
              className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'month'
                  ? 'neu-button text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Bulanan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('range')}
              className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'range'
                  ? 'neu-button text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Rentang
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('year')}
              className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'year'
                  ? 'neu-button text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Tahunan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                activeTab === 'all'
                  ? 'neu-button text-emerald-600 dark:text-emerald-400'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Semua
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* TAB 1: BULANAN */}
          {activeTab === 'month' && (
            <div className="space-y-4">
              {/* Year Selector */}
              <div className="flex items-center justify-between p-2 rounded-2xl neu-sunken">
                <button
                  type="button"
                  onClick={() => setSelectedYear((prev) => prev - 1)}
                  className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-neutral-600 dark:text-neutral-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-neutral-900 dark:text-neutral-100">
                    Tahun {selectedYear}
                  </span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="text-xs bg-transparent border-0 text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none cursor-pointer"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y} className="bg-[var(--surface-app)] text-neutral-900 dark:text-neutral-100">
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedYear((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl neu-button flex items-center justify-center text-neutral-600 dark:text-neutral-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* 12 Months Grid */}
              <div className="grid grid-cols-3 gap-2.5">
                {MONTHS.map((m) => {
                  const isTarget = selectedMonth === m.num;

                  return (
                    <button
                      key={m.num}
                      type="button"
                      onClick={() => setSelectedMonth(m.num)}
                      className={`py-3 px-2 rounded-2xl text-xs font-bold flex flex-col items-center justify-center transition-all duration-200 ${
                        isTarget
                          ? 'neu-primary-btn scale-102 font-black'
                          : 'neu-button text-neutral-700 dark:text-neutral-200'
                      }`}
                    >
                      <span className="text-xs">{m.name}</span>
                      <span className={`text-[10px] font-normal ${isTarget ? 'text-emerald-100' : 'text-neutral-400'}`}>
                        {m.full}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: RENTANG TANGGAL DENGAN SHORTCUT */}
          {activeTab === 'range' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl neu-card space-y-3">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Tentukan Tanggal Awal & Akhir:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 block mb-1">
                      Tanggal Awal
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-neutral-400 block mb-1">
                      Tanggal Akhir
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2 rounded-xl neu-sunken text-neutral-900 dark:text-neutral-100 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
                  <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Rentang: {startDate} s/d {endDate}
                  </span>
                </div>
              </div>

              {/* 4 Shortcut Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                  Shortcut Cepat:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('last_7_days')}
                    className="p-3 rounded-2xl neu-button text-left font-bold text-neutral-700 dark:text-neutral-200"
                  >
                    ⚡ 7 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('last_30_days')}
                    className="p-3 rounded-2xl neu-button text-left font-bold text-neutral-700 dark:text-neutral-200"
                  >
                    ⚡ 30 Hari Terakhir
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('this_month')}
                    className="p-3 rounded-2xl neu-button text-left font-bold text-neutral-700 dark:text-neutral-200"
                  >
                    📅 Bulan Ini (Nov 2026)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('last_month')}
                    className="p-3 rounded-2xl neu-button text-left font-bold text-neutral-700 dark:text-neutral-200"
                  >
                    📅 Bulan Lalu (Okt 2026)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TAHUNAN */}
          {activeTab === 'year' && (
            <div className="space-y-3">
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">
                Pilih Tahun Lengkap:
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setSelectedYear(y)}
                    className={`py-4 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-between ${
                      selectedYear === y
                        ? 'neu-primary-btn scale-102 font-black'
                        : 'neu-button text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    <span>Tahun {y}</span>
                    {selectedYear === y && <Check className="w-4 h-4 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEMUA TRANSAKSI */}
          {activeTab === 'all' && (
            <div className="p-4 rounded-3xl neu-card text-center space-y-2">
              <div className="w-10 h-10 rounded-2xl neu-sunken text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <Layers className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h4 className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">
                Semua Riwayat Transaksi
              </h4>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
                Menganalisis dan mengekspor seluruh transaksi yang tercatat di database tanpa batasan rentang tanggal.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--neu-border)] flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl neu-button text-xs font-bold text-neutral-700 dark:text-neutral-300"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-2 py-3 px-4 rounded-2xl neu-primary-btn text-xs font-bold flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            Terapkan Filter
          </button>
        </div>
      </div>
    </div>
  );
}
