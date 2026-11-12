/**
 * Ornamen latar dekoratif (orb gradasi lembut + pola titik) agar tampilan tidak polos.
 * Diletakkan di belakang konten (-z-10) dan tidak menerima klik.
 */
export function DecorBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-md -z-10 overflow-hidden"
    >
      {/* Orb kanan atas */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-orange-500/12 dark:bg-orange-500/10 blur-3xl" />
      {/* Orb kiri tengah */}
      <div className="absolute top-1/3 -left-28 w-64 h-64 rounded-full bg-orange-500/8 dark:bg-orange-500/6 blur-3xl" />
      {/* Orb kanan bawah */}
      <div className="absolute bottom-24 -right-20 w-60 h-60 rounded-full bg-orange-500/10 dark:bg-orange-500/8 blur-3xl" />

      {/* Pola titik halus */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage: 'radial-gradient(var(--neu-shadow-dark) 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 45%, transparent 70%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 45%, transparent 70%, black 100%)',
        }}
      />

      {/* Gelombang dekoratif bawah */}
      <svg
        className="absolute -bottom-6 left-0 w-full h-40 text-orange-500/10 dark:text-orange-400/[0.06]"
        viewBox="0 0 400 160"
        preserveAspectRatio="none"
      >
        <path
          d="M0,80 C80,40 160,120 240,80 C300,50 350,60 400,90 L400,160 L0,160 Z"
          fill="currentColor"
        />
        <path
          d="M0,110 C90,80 170,140 260,110 C320,90 360,100 400,120 L400,160 L0,160 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

