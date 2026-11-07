# PRD — Aplikasi Pencatatan Keuangan Pribadi

| Item | Isi |
|---|---|
| Nama produk | Keuangan Pribadi (nama sementara) |
| Versi dokumen | 1.0 |
| Tanggal | 7 November 2026 |
| Pemilik | Pengguna tunggal (pemilik aplikasi) |
| Status | Draft, siap dikembangkan |
| Dokumen terkait | `design.md` (desain teknis dan UI) |

---

## 1. Latar Belakang

Mencatat uang masuk dan keluar sering terhenti karena prosesnya merepotkan: harus membuka aplikasi, memilih kategori, mengisi banyak kolom. Akibatnya catatan tidak konsisten dan pengguna tidak tahu ke mana uangnya pergi.

Produk ini menyelesaikan masalah tersebut dengan input bahasa natural dan scan struk yang diproses Gemini AI, sehingga mencatat transaksi cukup dengan mengetik satu kalimat atau memotret struk. Aplikasi berupa web app yang dipasang di HP sebagai PWA, untuk pemakaian pribadi satu orang.

## 2. Masalah yang Diselesaikan

| # | Masalah | Dampak |
|---|---|---|
| 1 | Mencatat manual terlalu lama dan membosankan | Catatan sering terlewat |
| 2 | Tidak tahu total pengeluaran per kategori | Sulit mengendalikan pengeluaran |
| 3 | Struk belanja menumpuk dan tidak tercatat | Data tidak lengkap |
| 4 | Aplikasi keuangan umum terlalu kompleks atau berbayar | Tidak dipakai jangka panjang |
| 5 | Rekap bulanan harus dihitung sendiri | Tidak ada gambaran jelas kondisi keuangan |

## 3. Tujuan dan Metrik Keberhasilan

### 3.1 Tujuan Produk
1. Pencatatan transaksi cepat dan hampir tanpa usaha.
2. Angka keuangan akurat dan bisa dipercaya.
3. Memberi gambaran jelas arus uang per bulan.
4. Biaya operasional mendekati nol.

### 3.2 Metrik

| Metrik | Target |
|---|---|
| Waktu dari buka aplikasi sampai transaksi tersimpan (input teks) | < 10 detik |
| Akurasi parsing nominal dan jenis (masuk/keluar) pada kalimat umum | ≥ 95% |
| Akurasi kategori yang langsung diterima tanpa diubah | ≥ 85% |
| Waktu respons parsing teks | < 3 detik (rata-rata) |
| Waktu respons scan struk | < 8 detik (rata-rata) |
| Frekuensi pencatatan | Minimal 5 hari per minggu |
| Biaya bulanan | Rp0 (tier gratis) |

## 4. Pengguna

**Persona tunggal: pemilik aplikasi.**
- Individu yang ingin mengatur keuangan pribadi.
- Mengakses terutama lewat HP, kadang lewat laptop.
- Mencatat transaksi kecil berkali-kali sehari.
- Menulis santai dalam bahasa Indonesia ("ngopi 20k", "bayar kos sejuta").
- Tidak ingin mengurus akun, langganan, atau pengaturan rumit.

## 5. Ruang Lingkup

### 5.1 Dalam Lingkup (MVP)
- Login dengan password tunggal.
- Catat transaksi lewat input bahasa natural (Gemini).
- Catat transaksi lewat scan struk (Gemini).
- Catat transaksi lewat form manual.
- Pratinjau dan edit hasil AI sebelum disimpan.
- Dashboard: saldo, total masuk, total keluar, grafik kategori, tren 6 bulan.
- Daftar transaksi dengan pencarian, filter, edit, hapus, export CSV.
- Chat tanya data berbasis function calling.
- Laporan bulanan dengan insight AI.
- PWA yang bisa dipasang di HP.

### 5.2 Fase Lanjutan (Setelah MVP)
- Input suara.
- Anggaran per kategori.
- Transaksi berulang.
- Antrean transaksi offline.

### 5.3 Di Luar Lingkup
- Multi-pengguna, role, berbagi data.
- Koneksi otomatis ke rekening bank atau dompet digital.
- Multi-mata uang.
- Aplikasi native di Play Store / App Store.
- Pencatatan hutang-piutang dan investasi.

## 6. Asumsi dan Batasan

- Pengguna tunggal, sehingga tidak ada kolom `user_id`.
- Mata uang Rupiah, nominal bilangan bulat.
- Zona waktu `Asia/Jakarta`.
- Bahasa antarmuka dan input utama: Indonesia.
- Memerlukan internet untuk fitur AI dan penyimpanan data.
- Memakai tier gratis Gemini, Supabase, dan Vercel; ada batas kuota.
- Hasil AI tidak dijamin 100% benar, sehingga wajib melewati konfirmasi pengguna.

---

## 7. Kebutuhan Fungsional

Prioritas: **P0** = wajib MVP, **P1** = penting, **P2** = fase lanjutan.

### 7.1 Autentikasi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| AUTH-1 | Pengguna masuk dengan satu password yang dikonfigurasi di environment variable | P0 |
| AUTH-2 | Sesi tersimpan lewat cookie aman berumur 30 hari | P0 |
| AUTH-3 | Semua halaman dan API menolak akses tanpa sesi valid | P0 |
| AUTH-4 | Pembatasan percobaan login gagal (5 kali, tunggu 10 menit) | P0 |
| AUTH-5 | Tombol keluar (logout) | P1 |

**Kriteria penerimaan:** Mengakses `/api/transactions` tanpa cookie mengembalikan `401`. Password salah menampilkan pesan error dan menghitung percobaan.

### 7.2 Input Bahasa Natural

| ID | Kebutuhan | Prioritas |
|---|---|---|
| NLP-1 | Pengguna mengetik teks bebas dan sistem mengubahnya menjadi satu atau beberapa transaksi terstruktur | P0 |
| NLP-2 | Memahami format nominal: `25rb`, `25k`, `5 juta`, `1,5jt`, `seratus ribu`, `2.500.000` | P0 |
| NLP-3 | Memahami waktu relatif: kemarin, tadi pagi, Senin lalu, tanggal 3 | P0 |
| NLP-4 | Menentukan jenis masuk/keluar dari konteks kalimat | P0 |
| NLP-5 | Menentukan kategori dari daftar kategori tetap | P0 |
| NLP-6 | Hasil tampil sebagai pratinjau yang bisa diedit atau dibuang per transaksi | P0 |
| NLP-7 | Transaksi baru tersimpan hanya setelah pengguna menekan "Simpan semua" | P0 |
| NLP-8 | Transaksi yang tidak pasti (nominal tidak jelas) ditandai "perlu dicek" | P0 |
| NLP-9 | Teks tanpa transaksi menampilkan pesan "Tidak ada transaksi terdeteksi" | P0 |
| NLP-10 | Peringatan untuk tanggal di masa depan dan kemungkinan duplikat | P1 |

**Kriteria penerimaan (contoh):**

| Input | Hasil yang diharapkan |
|---|---|
| `makan siang 25rb` | Keluar, 25.000, Makanan, hari ini |
| `kemarin kopi 18rb, tadi pagi gajian 5 juta` | Keluar 18.000 (kemarin) + Masuk 5.000.000 (hari ini) |
| `bayar kos sejuta` | Keluar, 1.000.000, Tagihan |
| `halo apa kabar` | Tidak ada transaksi terdeteksi |
| `beli sesuatu kemarin` | Ditandai perlu dicek (nominal tidak ada) |

### 7.3 Scan Struk

| ID | Kebutuhan | Prioritas |
|---|---|---|
| RCP-1 | Tombol kamera membuka kamera HP untuk memotret struk | P0 |
| RCP-2 | Gambar dikecilkan di perangkat sebelum dikirim | P0 |
| RCP-3 | Sistem mengekstrak nama toko, tanggal, dan total | P0 |
| RCP-4 | Sistem mengekstrak daftar item bila terbaca | P1 |
| RCP-5 | Pengguna memilih simpan sebagai satu transaksi atau dipecah per item | P1 |
| RCP-6 | Hasil tampil sebagai pratinjau yang bisa diedit sebelum disimpan | P0 |
| RCP-7 | Struk tidak terbaca menampilkan pesan jelas dan arahan isi manual | P0 |
| RCP-8 | Foto struk tidak disimpan permanen | P0 |

### 7.4 Form Manual

| ID | Kebutuhan | Prioritas |
|---|---|---|
| MAN-1 | Form: jenis, nominal, tanggal (default hari ini), kategori, keterangan | P0 |
| MAN-2 | Keyboard angka muncul untuk kolom nominal | P0 |
| MAN-3 | Validasi: nominal > 0, tanggal valid, kategori wajib | P0 |

### 7.5 Dashboard (Beranda)

| ID | Kebutuhan | Prioritas |
|---|---|---|
| DSH-1 | Pemilih bulan dengan navigasi bulan sebelumnya/berikutnya | P0 |
| DSH-2 | Kartu saldo, total masuk, total keluar untuk bulan terpilih | P0 |
| DSH-3 | Grafik donat pengeluaran per kategori | P0 |
| DSH-4 | Grafik batang masuk vs keluar 6 bulan terakhir | P1 |
| DSH-5 | Lima transaksi terbaru | P0 |
| DSH-6 | Kotak input cepat di beranda | P0 |
| DSH-7 | Semua angka dihitung oleh database, bukan AI | P0 |

### 7.6 Daftar Transaksi

| ID | Kebutuhan | Prioritas |
|---|---|---|
| TRX-1 | Daftar dikelompokkan per tanggal (Hari ini, Kemarin, tanggal) | P0 |
| TRX-2 | Pencarian kata kunci pada keterangan | P0 |
| TRX-3 | Filter: rentang tanggal, jenis, kategori | P0 |
| TRX-4 | Edit transaksi | P0 |
| TRX-5 | Hapus transaksi dengan konfirmasi dan opsi "Batalkan" | P0 |
| TRX-6 | Penanda sumber (manual, teks AI, struk) | P1 |
| TRX-7 | Export CSV | P1 |
| TRX-8 | Pemuatan bertahap untuk daftar panjang | P1 |

### 7.7 Chat Tanya Data

| ID | Kebutuhan | Prioritas |
|---|---|---|
| CHT-1 | Pengguna bertanya tentang keuangannya dalam bahasa natural | P0 |
| CHT-2 | Angka dalam jawaban berasal dari query database melalui function calling | P0 |
| CHT-3 | AI tidak mengarang angka; jika data tidak ada, dikatakan terus terang | P0 |
| CHT-4 | Chip saran pertanyaan untuk memulai | P1 |
| CHT-5 | Mendukung pertanyaan: total per kategori, total rentang waktu, pencarian transaksi, perbandingan bulan, transaksi terakhir | P0 |

**Contoh pertanyaan yang harus bisa dijawab:**
- "Hari ini habis berapa?"
- "Bulan ini paling banyak habis di kategori apa?"
- "Bandingkan pengeluaran bulan ini dengan Oktober."
- "Kapan terakhir saya bayar listrik?"

### 7.8 Laporan Bulanan

| ID | Kebutuhan | Prioritas |
|---|---|---|
| RPT-1 | Ringkasan bulan: masuk, keluar, saldo, rasio tabungan | P0 |
| RPT-2 | Perbandingan dengan bulan sebelumnya (persen) | P1 |
| RPT-3 | Rincian per kategori | P0 |
| RPT-4 | Insight AI berdasarkan angka yang sudah dihitung server | P1 |
| RPT-5 | Insight disimpan (cache) per bulan, dengan tombol "Buat ulang" | P1 |

### 7.9 PWA

| ID | Kebutuhan | Prioritas |
|---|---|---|
| PWA-1 | Manifest dengan nama, warna tema, mode layar penuh | P0 |
| PWA-2 | Ikon 192, 512, dan maskable | P0 |
| PWA-3 | Bisa di-install di Android (Chrome) dan iPhone (Safari) | P0 |
| PWA-4 | Service worker untuk cache aset statis | P1 |
| PWA-5 | Halaman offline dan banner status offline | P1 |
| PWA-6 | Fitur AI dinonaktifkan dengan pesan jelas saat offline | P1 |
| PWA-7 | Antrean transaksi offline yang dikirim otomatis saat online | P2 |

### 7.10 Fitur Fase Lanjutan

| ID | Kebutuhan | Prioritas |
|---|---|---|
| VOI-1 | Input suara yang hasilnya diproses seperti input teks | P2 |
| BUD-1 | Anggaran bulanan per kategori dengan bar progres dan peringatan | P2 |
| REC-1 | Transaksi berulang otomatis tiap bulan (kos, internet, langganan) | P2 |

---

## 8. Kebutuhan Non-Fungsional

| Area | Kebutuhan |
|---|---|
| **Performa** | Halaman utama tampil < 2 detik pada koneksi 4G; parsing teks < 3 detik; scan struk < 8 detik |
| **Akurasi** | Penjumlahan dan agregasi 100% akurat karena dihitung SQL |
| **Keamanan** | API key hanya di server; cookie `httpOnly`, `secure`, `sameSite`; RLS aktif di Supabase; HTTPS wajib; validasi semua input |
| **Privasi** | Foto struk tidak disimpan; data hanya dapat diakses lewat sesi login |
| **Ketersediaan** | Mengikuti SLA tier gratis Vercel dan Supabase; fitur manual tetap berfungsi bila Gemini bermasalah |
| **Kompatibilitas** | Chrome Android versi terbaru, Safari iOS versi terbaru, browser desktop modern |
| **Responsif** | Mobile-first, nyaman dipakai satu tangan, mendukung safe area iPhone |
| **Aksesibilitas** | Target sentuh ≥ 44 px, kontras memadai, label ARIA, warna bukan satu-satunya penanda |
| **Biaya** | Rp0 pada pemakaian pribadi wajar |
| **Pemeliharaan** | Daftar kategori dan prompt AI mudah diubah di satu tempat dalam kode |

---

## 9. Alur Pengguna Utama

### 9.1 Mencatat dengan Teks
1. Buka aplikasi dari ikon layar utama.
2. Ketik "makan siang 25rb, bensin 50rb" di kotak input beranda.
3. Sistem menampilkan dua kartu pratinjau.
4. Pengguna memeriksa atau mengedit, lalu menekan **Simpan semua**.
5. Saldo dan grafik beranda ter-update.

### 9.2 Mencatat dengan Struk
1. Buka tab Tambah, pilih Struk (atau tekan 📷 di beranda).
2. Foto struk, tunggu proses.
3. Pilih simpan satu transaksi atau pecah per item.
4. Periksa pratinjau, **Simpan**.

### 9.3 Bertanya ke AI
1. Buka tab Chat.
2. Ketik "hari ini habis berapa?".
3. Server menjalankan query, Gemini menyusun jawaban.
4. Pengguna membaca jawaban berisi total dan rincian.

### 9.4 Meninjau Bulan
1. Buka tab Laporan, pilih bulan.
2. Lihat ringkasan, perbandingan, dan insight AI.
3. Jika perlu, telusuri transaksi di tab Transaksi atau ekspor CSV.

---

## 10. Data

### 10.1 Entitas Utama

**Transaction**

| Field | Tipe | Keterangan |
|---|---|---|
| id | uuid | Kunci utama |
| date | date | Tanggal transaksi |
| type | enum | `income` / `expense` |
| amount | bigint | Rupiah, > 0 |
| category | text | Dari daftar kategori tetap |
| note | text | Keterangan singkat |
| source | enum | `manual` / `ai_text` / `ai_receipt` / `recurring` |
| needs_review | boolean | Penanda perlu dicek |
| created_at / updated_at | timestamptz | Jejak waktu |

**Insight:** `month` (YYYY-MM), `content`, `created_at`.

### 10.2 Kategori Bawaan

- **Pengeluaran:** Makanan, Transport, Belanja, Tagihan, Kesehatan, Hiburan, Pendidikan, Sosial, Lainnya
- **Pemasukan:** Gaji, Bonus, Usaha, Hadiah, Lainnya

Detail skema SQL ada di `design.md`.

---

## 11. Risiko dan Mitigasi

| Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|
| AI salah membaca nominal atau jenis | Sedang | Tinggi | Pratinjau wajib, tanda "perlu dicek", validasi server |
| AI salah hitung pada pertanyaan chat | Sedang | Tinggi | Function calling, angka dari SQL |
| Kuota gratis Gemini habis | Rendah | Sedang | Rate limit internal, fallback form manual, cache insight |
| Project Supabase gratis dijeda karena tidak aktif | Rendah | Sedang | Dipakai harian; ekspor CSV berkala sebagai cadangan |
| Password bocor atau ditebak | Rendah | Tinggi | Password panjang, rate limit login, cookie aman |
| Struk buram atau format tidak umum | Tinggi | Rendah | Pesan jelas, isi manual |
| Input suara tidak didukung di iPhone | Sedang | Rendah | Tombol mikrofon pada keyboard bawaan sebagai alternatif |
| Kehilangan data | Rendah | Tinggi | Ekspor CSV rutin, backup bawaan Supabase bila tersedia |
| Perubahan model/API Gemini | Sedang | Sedang | Nama model lewat env, logika AI terpusat di `lib/gemini.ts` |

---

## 12. Rencana Rilis

| Fase | Cakupan | Hasil yang bisa dicoba |
|---|---|---|
| **1. Fondasi** | Setup proyek, skema database, login, PWA, deploy ke Vercel | Aplikasi bisa di-install di HP dan dilindungi password |
| **2. Inti** | CRUD transaksi, form manual, daftar transaksi, dashboard | Pencatatan manual dan ringkasan |
| **3. AI Teks** | Parse bahasa natural, pratinjau, simpan batch | Mencatat dengan satu kalimat |
| **4. AI Struk** | Scan struk, kompres gambar | Mencatat dari foto |
| **5. AI Chat** | Function calling, chat tanya data | Tanya jawab keuangan |
| **6. Laporan** | Laporan bulanan, insight, export CSV | Evaluasi bulanan |
| **7. Lanjutan** | Suara, anggaran, transaksi berulang, antrean offline | Kenyamanan tambahan |

**MVP selesai** setelah fase 1 sampai 6.

---

## 13. Kriteria Peluncuran MVP

- [ ] Semua kebutuhan P0 terpenuhi.
- [ ] Aplikasi berhasil di-install dan berjalan di HP pengguna.
- [ ] Mengakses API tanpa login ditolak.
- [ ] Contoh input pada bagian 7.2 menghasilkan hasil sesuai harapan.
- [ ] Total di dashboard cocok dengan penjumlahan manual dari daftar transaksi.
- [ ] Struk uji (jelas, miring, buram) ditangani dengan benar atau dengan pesan yang jelas.
- [ ] Lighthouse menyatakan aplikasi installable.
- [ ] Fitur manual tetap berfungsi saat Gemini dimatikan.
- [ ] Tidak ada API key atau kredensial yang terlihat di sisi browser.

---

## 14. Pertanyaan Terbuka

| # | Pertanyaan | Dampak |
|---|---|---|
| 1 | HP yang dipakai Android atau iPhone? | Input suara dan detail instalasi PWA |
| 2 | Apakah daftar kategori bawaan sudah cukup? | Prompt AI dan filter |
| 3 | Apakah fitur anggaran dan transaksi berulang masuk versi pertama? | Cakupan MVP |
| 4 | Apakah perlu cadangan data otomatis (misalnya ekspor CSV terjadwal)? | Risiko kehilangan data |
| 5 | Apakah aplikasi akan dibuka juga lewat laptop? | Prioritas desain responsif desktop |

---

## 15. Glosarium

| Istilah | Arti |
|---|---|
| PWA | Progressive Web App, web app yang bisa dipasang seperti aplikasi |
| Function calling | Teknik agar AI memanggil fungsi di server (misalnya query database) lalu menyusun jawaban dari hasilnya |
| Structured output | Jawaban AI dipaksa mengikuti format JSON tertentu |
| RLS | Row Level Security, pengaman akses baris data di Postgres/Supabase |
| Pratinjau | Tampilan hasil AI yang bisa diperiksa dan diedit sebelum disimpan |
| Rasio tabungan | Persentase pemasukan yang tersisa setelah pengeluaran |
