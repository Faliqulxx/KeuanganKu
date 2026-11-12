'use client';

import React from 'react';
import { useTheme } from '@/lib/theme-context';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({
  variant = 'icon',
  className = '',
}: {
  variant?: 'icon' | 'pill' | 'segmented';
  className?: string;
}) {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'segmented') {
    return (
      <div
        className={`flex items-center p-1 rounded-2xl neu-sunken ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            !isDark
              ? 'neu-button text-neutral-800'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Sun className="w-3.5 h-3.5 text-orange-500" />
          <span>Terang</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
            isDark
              ? 'neu-button text-orange-400'
              : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
          }`}
        >
          <Moon className="w-3.5 h-3.5 text-orange-400" />
          <span>Gelap</span>
        </button>
      </div>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl neu-button text-xs font-bold text-neutral-700 dark:text-neutral-200 ${className}`}
      >
        {isDark ? (
          <>
            <Moon className="w-3.5 h-3.5 text-orange-400" />
            <span>Mode Gelap</span>
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-orange-500" />
            <span>Mode Terang</span>
          </>
        )}
      </button>
    );
  }

  // Default: compact icon button
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
      className={`w-9 h-9 rounded-xl neu-button flex items-center justify-center text-neutral-600 dark:text-neutral-300 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-orange-400 transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-orange-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
