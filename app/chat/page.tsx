'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '@/lib/finance-context';
import { Header } from '@/components/header';
import { BottomNav } from '@/components/bottom-nav';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const PROMPT_SUGGESTIONS = [
  'Berapa pengeluaran bulan ini?',
  'Bandingkan pengeluaran bulan Oktober dan November',
  'Berapa total pengeluaran saya selama 7 hari terakhir?',
  'Berapa total pemasukan sepanjang tahun 2026?',
  'Hari ini habis berapa?',
  'Berapa saldo bulan ini?',
];

export function ChatPage() {
  const { chatMessages, sendChatMessage } = useFinance();
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSend = (text?: string) => {
    const query = text || inputVal;
    if (!query.trim()) return;

    setInputVal('');
    setIsTyping(true);
    sendChatMessage(query);

    setTimeout(() => {
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 w-full max-w-md mx-auto flex flex-col overflow-hidden bg-[var(--bg-app)] border-x border-[var(--neu-border-subtle)] z-20">
      {/* Topbar tetap di atas */}
      <div className="shrink-0 w-full">
        <Header page="simple" showMonthPicker={false} />

        {/* Chat status bar */}
        <div className="px-4 py-2.5 bg-[var(--surface-app)] border-b border-[var(--neu-border)] flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-xs font-extrabold text-neutral-800 dark:text-neutral-200 truncate">
              Asisten Keuangan Cerdas
            </span>
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase shrink-0">
            Lintas Periode • AI
          </span>
        </div>
      </div>

      {/* Area isi chat — HANYA bagian ini yang bisa di-scroll ke atas/bawah */}
      <main className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden p-4 space-y-4 overscroll-contain">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 w-full ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'neu-button text-neutral-800 dark:text-neutral-200'
                    : 'neu-button text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4 stroke-[2.2]" /> : <Bot className="w-4 h-4 stroke-[2.2]" />}
              </div>

              <div
                className={`max-w-[78%] min-w-0 break-words rounded-3xl px-4 py-3 text-xs sm:text-sm leading-relaxed transition-all ${
                  isUser
                    ? 'neu-hero-emerald text-white rounded-tr-none font-medium'
                    : 'neu-card text-neutral-900 dark:text-neutral-100 rounded-tl-none font-medium'
                }`}
              >
                <div
                  className="break-words"
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-black text-inherit">$1</strong>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
                <span
                  className={`block text-[9px] mt-1.5 text-right font-semibold ${
                    isUser ? 'text-emerald-200' : 'text-neutral-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl neu-button text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="neu-card rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Area Bawah Tetap (Suggestion Chips + Tempat Tulis Chat) — Tidak ikut tergeser */}
      <div className="shrink-0 w-full bg-[var(--bg-app)] border-t border-[var(--neu-border)] pb-[calc(4.75rem+max(env(safe-area-inset-bottom),14px))]">
        {/* Suggestion chips horizontal scroll khusus di dalam barisnya */}
        <div className="w-full min-w-0 px-4 py-2 border-b border-[var(--neu-border-subtle)] overflow-x-auto no-scrollbar flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(sug)}
              className="shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold neu-button text-neutral-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 whitespace-nowrap"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input box tempat tulis chat */}
        <div className="p-3 w-full">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 w-full"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tanyakan keuanganmu..."
              className="flex-1 min-w-0 text-xs sm:text-sm px-4 py-3 rounded-2xl neu-sunken text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none font-medium"
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="w-11 h-11 rounded-2xl neu-primary-btn disabled:opacity-40 flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4 stroke-[2.2]" />
            </button>
          </form>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

export default ChatPage;
