import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { FinanceProvider } from "@/lib/finance-context";
import { ToastContainer } from "@/components/toast";
import { DecorBackground } from "@/components/decor-background";
import { SplashScreen } from "@/components/splash-screen";

export const metadata: Metadata = {
  title: "FREEKS FinMate — Catatan Keuangan Pribadi AI",
  description: "Web app PWA pencatatan keuangan pribadi dengan input bahasa natural dan scan struk Gemini AI.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FREEKS FinMate",
  },
};

export const viewport: Viewport = {
  themeColor: "#FF8A1C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('keuanganku_theme');
                if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen overflow-x-hidden bg-[var(--bg-app)] text-[var(--text-primary)] font-sans antialiased flex justify-center selection:bg-orange-500 selection:text-white">
        <ThemeProvider>
          {/* Mobile frame container */}
          <div className="w-full max-w-md min-h-screen overflow-x-hidden bg-[var(--bg-app)] shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-x border-[var(--neu-border-subtle)] relative isolate flex flex-col pb-24">
            <SplashScreen />
            <DecorBackground />
            <FinanceProvider>
              {children}
              <ToastContainer />
            </FinanceProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
