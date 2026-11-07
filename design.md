# DESIGN.md — Aplikasi Pencatatan Keuangan Pribadi

Web app pribadi (satu pengguna) untuk mencatat uang masuk dan uang keluar, dengan input bahasa natural dan scan struk lewat Gemini AI. Dipasang di HP sebagai PWA.

---

## 1. Ringkasan

| Item | Keputusan |
|---|---|
| Jenis | Web app pribadi, satu pengguna |
| Platform | PWA (install dari browser ke layar utama HP) |
| Framework | Next.js (App Router) + TypeScript |
| UI | Tailwind CSS + shadcn/ui, mobile-first |
| Grafik | Recharts |
| AI | Gemini API via `@google/genai` (model Flash, nama model lewat env) |
| Database | Supabase (Postgres) |
| Auth | Password tunggal + cookie sesi (JWT) |
| Deploy | Vercel |
| Bahasa UI | Indonesia |
| Mata uang | Rupiah (IDR), tanpa desimal |

### Tujuan
1. Mencatat transaksi secepat mungkin (target: < 10 detik dari buka app sampai tersimpan).
2. Angka selalu akurat. Penjumlahan dilakukan database, bukan AI.
3. Hasil AI selalu melewati pratinjau sebelum disimpan.
4. Biaya operasional mendekati Rp0.

### Bukan Tujuan
- Multi-user, role, atau berbagi data.
- Integrasi rekening bank.
- Aplikasi native (Play Store / App Store).

---

## 2. Arsitektur

```
[HP (PWA)] ──HTTPS──> [Next.js di Vercel] ──> [Gemini API]
                              │
                              └──> [Supabase Postgres]
```

Prinsip:
- Browser hanya menampilkan UI dan mengirim input.
- Semua panggilan Gemini dan database terjadi di server (Route Handlers / Server Actions).
- Browser tidak pernah mengakses Supabase secara langsung.
- Kunci rahasia hanya ada di environment variable server.

---

## 3. Struktur Folder

```
keuangan/
├─ app/
│  ├─ layout.tsx
│  ├─ manifest.ts                 # Web App Manifest (PWA)
│  ├─ offline/page.tsx            # Halaman saat offline
│  ├─ login/page.tsx
│  ├─ (app)/                      # Grup halaman yang butuh login
│  │  ├─ layout.tsx               # Bottom navigation
│  │  ├─ page.tsx                 # Beranda
│  │  ├─ transaksi/page.tsx
│  │  ├─ tambah/page.tsx
│  │  ├─ chat/page.tsx
│  │  └─ laporan/page.tsx
│  └─ api/
│     ├─ auth/login/route.ts
│     ├─ auth/logout/route.ts
│     ├─ transactions/route.ts        # GET, POST
│     ├─ transactions/[id]/route.ts   # PUT, DELETE
│     ├─ parse/route.ts               # Teks -> transaksi
│     ├─ receipt/route.ts             # Gambar -> transaksi
│     ├─ chat/route.ts                # Tanya data (function calling)
│     ├─ summary/route.ts             # Agregasi dashboard
│     └─ insight/route.ts             # Insight bulanan
├─ lib/
│  ├─ gemini.ts                   # Client + helper
│  ├─ prompts.ts                  # Prompt sistem
│  ├─ schemas.ts                  # Zod schema
│  ├─ db.ts                       # Client Supabase (service role, server only)
│  ├─ auth.ts                     # Sign/verify JWT, cek cookie
│  ├─ categories.ts               # Daftar kategori tetap
│  ├─ format.ts                   # Format Rupiah & tanggal
│  └─ rate-limit.ts
├─ components/
│  ├─ bottom-nav.tsx
│  ├─ quick-input.tsx
│  ├─ preview-cards.tsx
│  ├─ transaction-list.tsx
│  ├─ charts/
│  └─ ui/                         # shadcn
├─ public/
│  ├─ sw.js                       # Service worker
│  └─ icons/                      # 192, 512, maskable
├─ middleware.ts                  # Proteksi halaman & API
└─ .env.local
```

---

## 4. Environment Variable

| Nama | Fungsi |
|---|---|
| `APP_PASSWORD` | Password login tunggal |
| `SESSION_SECRET` | Kunci penandatangan JWT (string acak panjang) |
| `GEMINI_API_KEY` | API key Google AI Studio |
| `GEMINI_MODEL` | Nama model Flash yang dipakai |
| `SUPABASE_URL` | URL project Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Kunci service role (hanya server) |
| `TZ_APP` | Zona waktu, default `Asia/Jakarta` |

Semua variabel ini tanpa awalan `NEXT_PUBLIC_`, sehingga tidak terkirim ke browser.

---

## 5. Model Data

### 5.1 Tabel `transactions`

```sql
create table transactions (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  type        text not null check (type in ('income', 'expense')),
  amount      bigint not null check (amount > 0),
  category    text not null,
  note        text not null default '',
  source      text not null default 'manual'
              check (source in ('manual', 'ai_text', 'ai_receipt', 'recurring')),
  needs_review boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_tx_date     on transactions (date desc);
create index idx_tx_type     on transactions (type);
create index idx_tx_category on transactions (category);
```

### 5.2 Tabel `insights` (cache insight bulanan)

```sql
create table insights (
  month      text primary key,        -- format 'YYYY-MM'
  content    text not null,
  created_at timestamptz not null default now()
);
```

### 5.3 Tabel opsional (tahap akhir)

```sql
create table budgets (
  category text primary key,
  monthly_limit bigint not null check (monthly_limit > 0)
);

create table recurring (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount bigint not null,
  category text not null,
  note text not null default '',
  day_of_month int not null check (day_of_month between 1 and 28),
  active boolean not null default true
);
```

### 5.4 Keamanan Data
- Aktifkan RLS pada semua tabel tanpa policy, sehingga akses hanya lewat service role dari server.
- Nominal disimpan sebagai bilangan bulat rupiah (`bigint`).

### 5.5 Kategori (tetap di kode)

**Pengeluaran:** Makanan, Transport, Belanja, Tagihan, Kesehatan, Hiburan, Pendidikan, Sosial, Lainnya

**Pemasukan:** Gaji, Bonus, Usaha, Hadiah, Lainnya

---

## 6. Autentikasi

Alur login:
1. User memasukkan password di `/login`.
2. `POST /api/auth/login` membandingkan dengan `APP_PASSWORD` (perbandingan waktu-konstan).
3. Jika cocok, server menandatangani JWT dan menyetel cookie:
   - `httpOnly`, `secure`, `sameSite=lax`
   - masa berlaku 30 hari
4. `middleware.ts` memeriksa cookie pada semua halaman (kecuali `/login`, `/offline`, aset PWA) dan semua `/api/*` (kecuali login).
5. Tanpa cookie valid: halaman diarahkan ke `/login`, API membalas `401`.

Perlindungan brute force: maksimal 5 percobaan gagal per IP, lalu diblokir 10 menit.

---

## 7. Desain API

Semua endpoint mengembalikan JSON dan membutuhkan cookie sesi.

### 7.1 Transaksi

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/transactions` | Query: `from`, `to`, `type`, `category`, `q`, `limit`, `offset` |
| POST | `/api/transactions` | Body: satu transaksi atau array (batch simpan dari pratinjau) |
| PUT | `/api/transactions/:id` | Ubah transaksi |
| DELETE | `/api/transactions/:id` | Hapus transaksi |

Schema transaksi (Zod):

```ts
const TransactionInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  type: z.enum(['income', 'expense']),
  amount: z.number().int().positive(),
  category: z.string(),
  note: z.string().max(200).default(''),
  source: z.enum(['manual', 'ai_text', 'ai_receipt', 'recurring']).default('manual'),
  needs_review: z.boolean().default(false),
});
```

### 7.2 Ringkasan

`GET /api/summary?month=2026-11` mengembalikan:

```json
{
  "month": "2026-11",
  "income": 5000000,
  "expense": 1250000,
  "balance": 3750000,
  "byCategory": [{ "category": "Makanan", "total": 600000 }],
  "monthly": [{ "month": "2026-06", "income": 0, "expense": 0 }],
  "recent": []
}
```

Semua angka dihitung dengan query SQL (`sum`, `group by`).

### 7.3 Parse Teks

`POST /api/parse`

```json
// request
{ "text": "kemarin makan siang 25rb, tadi pagi gajian 5 juta" }

// response
{
  "items": [
    { "date": "2026-11-06", "type": "expense", "amount": 25000,
      "category": "Makanan", "note": "makan siang", "needs_review": false },
    { "date": "2026-11-07", "type": "income", "amount": 5000000,
      "category": "Gaji", "note": "gajian", "needs_review": false }
  ],
  "warnings": []
}
```

Endpoint ini tidak menyimpan apa pun. Penyimpanan dilakukan oleh `POST /api/transactions` setelah user mengonfirmasi.

### 7.4 Scan Struk

`POST /api/receipt` (multipart, field `image`)

```json
{
  "merchant": "Indomaret",
  "date": "2026-11-07",
  "total": 67500,
  "items": [{ "name": "Susu UHT", "price": 18000, "category": "Makanan" }],
  "unreadable": false,
  "warnings": []
}
```

Klien mengecilkan gambar (sisi terpanjang sekitar 1280 px, JPEG) sebelum upload. Gambar tidak disimpan.

### 7.5 Chat Tanya Data

`POST /api/chat`

```json
// request
{ "messages": [{ "role": "user", "content": "bulan ini paling boros di mana?" }] }

// response
{ "reply": "Bulan ini pengeluaran terbesar ada di Makanan..." }
```

### 7.6 Insight

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/insight?month=2026-11` | Ambil dari cache, buat baru jika belum ada |
| POST | `/api/insight?month=2026-11` | Paksa buat ulang |

---

## 8. Desain Integrasi Gemini

### 8.1 Prinsip
- Gunakan **structured output** (JSON schema) agar jawaban selalu bisa diparsing.
- Selalu validasi hasil dengan Zod di server sebelum diteruskan ke klien.
- AI tidak pernah menulis langsung ke database.
- Penjumlahan dan agregasi dilakukan SQL, bukan AI.
- Jika Gemini error atau kuota habis, UI menampilkan pesan dan mengarahkan ke form manual.

### 8.2 Prompt Parse Teks (sistem)

```
Kamu adalah pengurai catatan keuangan pribadi berbahasa Indonesia.
Tanggal hari ini: {{TODAY}} (zona waktu Asia/Jakarta, hari: {{WEEKDAY}}).

Ubah teks pengguna menjadi daftar transaksi.

Aturan:
- Nominal dalam rupiah bilangan bulat. "25rb"/"25k" = 25000, "5 juta"/"5jt" = 5000000,
  "1,5jt" = 1500000, "seratus ribu" = 100000, "2.500.000" = 2500000.
- type: "income" untuk gajian, dikasih, transfer masuk, bonus, dll.
  "expense" untuk beli, bayar, isi bensin, dll.
- Tanggal: hitung dari kata waktu relatif (kemarin, tadi pagi, Senin lalu, tanggal 3).
  Jika tidak disebut, pakai tanggal hari ini.
- category harus salah satu dari: {{CATEGORY_LIST}}.
- note: keterangan singkat, huruf kecil, tanpa nominal.
- Jika nominal tidak disebut atau ambigu, isi needs_review = true dan jelaskan di warnings.
- Jika teks tidak berisi transaksi, kembalikan items kosong.
- Jangan mengarang transaksi yang tidak ada di teks.
```

### 8.3 Prompt Scan Struk

```
Baca foto struk belanja ini. Ekstrak: nama toko, tanggal, total akhir yang dibayar,
dan daftar item bila terbaca jelas. Tentukan kategori tiap item dari daftar: {{CATEGORY_LIST}}.
Jangan menebak angka yang tidak terbaca. Jika foto terlalu buram, set unreadable = true
dan jelaskan di warnings. Total harus berupa angka bulat rupiah.
```

### 8.4 Chat dengan Function Calling

Alat yang tersedia untuk Gemini (dijalankan server):

| Fungsi | Parameter | Hasil |
|---|---|---|
| `total_by_category` | `from`, `to`, `type` | Total per kategori |
| `total_in_range` | `from`, `to`, `type`, `category?` | Satu angka total |
| `search_transactions` | `query`, `from?`, `to?`, `limit?` | Daftar transaksi cocok |
| `compare_months` | `month_a`, `month_b` | Masuk/keluar/selisih kedua bulan |
| `last_transaction` | `query` | Transaksi terakhir yang cocok |

Alur: pertanyaan -> Gemini memilih fungsi -> server menjalankan query -> hasil dikembalikan ke Gemini -> Gemini menyusun jawaban bahasa natural.

Aturan sistem chat: jawab hanya dari hasil alat, jangan mengarang angka, format rupiah `Rp25.000`, jawab singkat dan ramah, bila data tidak ada katakan terus terang.

### 8.5 Prompt Insight Bulanan

Input: angka ringkasan bulan ini dan bulan lalu (sudah dihitung SQL).
Output: 3-4 kalimat berisi perubahan terbesar, kategori dominan, dan satu saran konkret. Tidak boleh menyebut angka yang tidak ada di input.

### 8.6 Batas dan Ketahanan
- Timeout panggilan Gemini: 20 detik.
- Retry satu kali untuk error sementara.
- Batas ukuran teks input: 1000 karakter.
- Batas ukuran gambar setelah dikecilkan: sekitar 2 MB.
- Rate limit internal untuk endpoint AI agar kuota gratis tidak cepat habis.

---

## 9. Desain UI/UX

### 9.1 Prinsip
- Mobile-first, dirancang untuk satu tangan.
- Aksi utama (input) selalu terjangkau jempol.
- Hasil AI selalu terlihat dan bisa diedit sebelum disimpan.
- Angka besar dan jelas, warna konsisten: hijau = masuk, merah = keluar.

### 9.2 Tema dan Token

| Token | Nilai |
|---|---|
| Warna aksen | Emerald (`#059669`) |
| Masuk | Hijau (`#16A34A`) |
| Keluar | Merah (`#DC2626`) |
| Peringatan / perlu dicek | Kuning (`#CA8A04`) |
| Latar (terang) | `#FAFAFA`, kartu putih |
| Latar (gelap) | `#0A0A0A`, kartu `#171717` |
| Font | Inter / sistem sans-serif |
| Radius | 12-16 px |
| Mode gelap | Mengikuti pengaturan sistem |

Format:
- Rupiah: `Rp25.000` (pemisah titik).
- Tanggal: `7 Nov 2026`, dengan label "Hari ini" dan "Kemarin".

### 9.3 Navigasi

Bottom navigation, 5 tab:

| Tab | Rute |
|---|---|
| Beranda | `/` |
| Transaksi | `/transaksi` |
| Tambah | `/tambah` |
| Chat | `/chat` |
| Laporan | `/laporan` |

Area aman (safe area) iPhone diperhitungkan agar navigasi tidak tertutup.

### 9.4 Layar

**Login (`/login`)**
- Satu kolom password, tombol Masuk.
- Pesan error jelas dan info bila terkena pembatasan percobaan.

**Beranda (`/`)**
1. Pemilih bulan (← November 2026 →)
2. Kartu Saldo besar, di bawahnya kartu Masuk dan Keluar
3. Kotak input cepat dengan tombol 🎤 dan 📷
4. Donat pengeluaran per kategori
5. Batang masuk vs keluar 6 bulan
6. 5 transaksi terbaru

**Input cepat dan pratinjau**
- Kolom teks besar dengan placeholder "mis. makan siang 25rb".
- Setelah kirim, muncul daftar kartu pratinjau. Tiap kartu menampilkan tanggal, jenis, nominal, kategori, keterangan, dapat diedit inline atau dibuang.
- Kartu `needs_review` berlatar kuning dengan ikon peringatan.
- Tombol "Simpan semua" menempel di bawah layar.

**Transaksi (`/transaksi`)**
- Pencarian dan chip filter (tanggal, jenis, kategori).
- Daftar dikelompokkan per tanggal.
- Tap untuk edit, geser kiri untuk hapus (dengan konfirmasi dan "Batalkan").
- Ikon sumber: ✍️ manual, 💬 teks AI, 🧾 struk.
- Tombol Export CSV.
- Pemuatan bertahap (infinite scroll atau "muat lagi").

**Tambah (`/tambah`)**
- Segmen: Manual | Struk.
- Manual: toggle Masuk/Keluar, nominal (keyboard angka), tanggal (default hari ini), kategori, keterangan.
- Struk: tombol ambil foto (`<input type="file" accept="image/*" capture="environment">`), pratinjau hasil, pilihan "Satu transaksi" atau "Pecah per item".

**Chat (`/chat`)**
- Gelembung percakapan, kotak input di bawah.
- Chip saran: "Hari ini habis berapa?", "Bulan ini paling boros di mana?".
- Indikator mengetik saat menunggu jawaban.

**Laporan (`/laporan`)**
- Pemilih bulan.
- Ringkasan: masuk, keluar, saldo, rasio tabungan.
- Perbandingan dengan bulan lalu (persen naik/turun).
- Tabel rincian per kategori.
- Kartu Insight AI dengan tombol "Buat ulang".

### 9.5 State UI

| Kondisi | Perilaku |
|---|---|
| Loading | Skeleton pada kartu dan grafik |
| Data kosong | Ilustrasi sederhana + ajakan mencatat transaksi pertama |
| Gemini error / kuota habis | Banner informasi + tombol ke form manual |
| Teks tanpa transaksi | "Tidak ada transaksi terdeteksi" |
| Struk tidak terbaca | Pesan jelas + arahan isi manual |
| Offline | Banner "Sedang offline", fitur AI dinonaktifkan |

### 9.6 Aksesibilitas
- Target sentuh minimal 44 px.
- Kontras warna memadai pada mode terang dan gelap.
- Warna tidak jadi satu-satunya penanda (selalu ada tanda +/− dan label).
- Label ARIA pada tombol ikon.

---

## 10. Spesifikasi PWA

### 10.1 Manifest (`app/manifest.ts`)

```ts
export default function manifest() {
  return {
    name: 'Keuangan Pribadi',
    short_name: 'Keuangan',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAFAFA',
    theme_color: '#059669',
    lang: 'id',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
```

### 10.2 Service Worker (`public/sw.js`)

| Jenis permintaan | Strategi |
|---|---|
| Aset statis (JS, CSS, ikon, font) | Cache-first |
| Halaman | Network-first, fallback ke cache lalu `/offline` |
| `/api/*` | Network-only (tidak di-cache, karena data sensitif dan harus terbaru) |

### 10.3 Tambahan untuk iOS
- Meta `apple-mobile-web-app-capable` dan `apple-touch-icon` (180x180).
- Instalasi lewat Safari: Bagikan -> Tambahkan ke Layar Utama.

### 10.4 Offline
- Aplikasi shell tetap terbuka.
- Fitur yang memerlukan server dinonaktifkan dengan pesan jelas.
- Opsional: antrean transaksi offline (IndexedDB) yang dikirim otomatis saat kembali online.

---

## 11. Keamanan

| Risiko | Mitigasi |
|---|---|
| Kebocoran API key | Hanya di env server, tanpa `NEXT_PUBLIC_` |
| Akses tanpa izin | Middleware cek cookie JWT di semua halaman dan API |
| Tebak password | Rate limit login, password panjang |
| Akses DB langsung | RLS aktif, hanya service role dari server |
| Output AI berbahaya / salah | Validasi Zod, pratinjau wajib, AI tidak menulis ke DB |
| Prompt injection dari teks struk | Output dibatasi schema, hasil tetap lewat konfirmasi |
| Pencurian cookie | `httpOnly`, `secure`, `sameSite`, HTTPS wajib |
| Kuota AI habis | Rate limit internal, fallback form manual |

---

## 12. Penanganan Kasus Khusus

- **Nominal ambigu** ("bayar kos sejuta lebih dikit"): `needs_review = true`.
- **Tanggal di masa depan**: beri peringatan di pratinjau.
- **Duplikat**: peringatkan jika ada transaksi dengan tanggal, nominal, dan keterangan sama.
- **Nominal sangat besar**: konfirmasi tambahan jika di atas ambang tertentu.
- **Zona waktu**: semua perhitungan "hari ini" memakai `Asia/Jakarta`, bukan UTC server.
- **Hapus tidak sengaja**: tombol "Batalkan" sesaat setelah hapus.

---

## 13. Pengujian

| Area | Cara uji |
|---|---|
| Parser teks | Kumpulan contoh kalimat (nominal `rb/k/jt`, waktu relatif, multi-transaksi, tanpa transaksi) |
| Validasi | Unit test Zod untuk input tidak valid |
| Agregasi | Unit test query ringkasan dengan data contoh |
| Auth | Uji akses API tanpa cookie harus `401` |
| PWA | Lighthouse (kriteria installable), uji install di perangkat nyata |
| Struk | Uji dengan beberapa foto: jelas, miring, buram |
| Offline | Matikan jaringan, pastikan halaman cadangan dan banner tampil |

---

## 14. Rencana Pengerjaan

| Tahap | Isi |
|---|---|
| 1 | Setup Next.js, Tailwind, shadcn; skema Supabase; login password; middleware; konfigurasi PWA; **deploy awal ke Vercel** |
| 2 | CRUD transaksi, form manual, daftar transaksi, dashboard dan grafik |
| 3 | Input bahasa natural (`/api/parse`) + pratinjau + simpan batch |
| 4 | Scan struk (`/api/receipt`) + kompres gambar di klien |
| 5 | Chat dengan function calling |
| 6 | Laporan + insight, export CSV |
| 7 | Opsional: input suara, anggaran, transaksi berulang, antrean offline |

Deploy ke Vercel dilakukan sejak tahap 1 agar PWA bisa langsung dicoba di HP.

---

## 15. Pertanyaan Terbuka

1. HP yang dipakai: Android atau iPhone? (memengaruhi input suara dan detail instalasi PWA)
2. Daftar kategori final: pakai bawaan di atas atau ada tambahan?
3. Apakah fitur opsional (anggaran, transaksi berulang) masuk versi pertama atau menyusul?
