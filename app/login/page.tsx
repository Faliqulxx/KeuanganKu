'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { Wallet, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Password tidak boleh kosong.');
      return;
    }

    if (password === 'salah') {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setErrorMsg('Terlalu banyak percobaan gagal. Silakan tunggu 10 menit.');
      } else {
        setErrorMsg(`Password salah. Percobaan ${newAttempts}/5.`);
      }
      return;
    }

    router.push('/');
  };

  const handleDemoBypass = () => {
    router.push('/');
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 relative">
      <div className="absolute top-5 right-5">
        <ThemeToggle variant="pill" />
      </div>

      <div className="text-center space-y-3 mb-8">
        <div className="w-18 h-18 rounded-3xl neu-hero-emerald text-white flex items-center justify-center mx-auto transition-transform hover:scale-105">
          <Wallet className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h2 className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
          KeuanganKu
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium max-w-xs mx-auto">
          Pencatatan keuangan pribadi dengan AI & Modern Neumorphism.
        </p>
      </div>

      <div className="rounded-3xl p-6 neu-card space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest block mb-2">
              Password Aplikasi
            </label>
            <div className="relative rounded-2xl neu-sunken p-1.5 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-all">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan password..."
                className="w-full pl-10 pr-4 py-2 bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 text-xs sm:text-sm font-semibold focus:outline-none"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3.5 rounded-2xl neu-sunken text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-400/40">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-2xl neu-primary-btn font-extrabold text-xs flex items-center justify-center gap-2"
          >
            <span>Masuk ke Aplikasi</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="pt-2 border-t border-[var(--neu-border)]">
          <button
            type="button"
            onClick={handleDemoBypass}
            className="w-full py-3 px-4 rounded-2xl neu-button text-emerald-600 dark:text-emerald-400 text-xs font-extrabold flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            <span>Mode Demo: Masuk Langsung</span>
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <span className="text-[11px] text-neutral-400 font-semibold">
          Soft UI • PWA Pribadi • Sesi 30 Hari
        </span>
      </div>
    </div>
  );
}
