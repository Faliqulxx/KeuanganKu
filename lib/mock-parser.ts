import { TransactionType, TransactionSource } from './types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './categories';

export interface ParsedItem {
  date: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  source: TransactionSource;
  needs_review: boolean;
  warning?: string;
}

export function parseNaturalText(input: string): { items: ParsedItem[]; warnings: string[] } {
  const text = input.trim();
  const lower = text.toLowerCase();
  const warnings: string[] = [];

  if (!text || lower === 'halo' || lower.includes('apa kabar') || lower.length < 3) {
    return {
      items: [],
      warnings: ['Tidak ada transaksi terdeteksi. Silakan coba contoh: "makan siang 25rb, bensin 50rb"'],
    };
  }

  const items: ParsedItem[] = [];
  const today = '2026-11-07';
  const yesterday = '2026-11-06';

  // Split by comma, "dan", "lalu", semicolon, newline
  const segments = text.split(/[,;\n]|\bdan\b|\blalu\b/).map((s) => s.trim()).filter(Boolean);

  for (const seg of segments) {
    const segLower = seg.toLowerCase();
    
    // Determine date
    let date = today;
    if (segLower.includes('kemarin')) {
      date = yesterday;
    } else if (segLower.includes('tanggal 5') || segLower.includes('tgl 5')) {
      date = '2026-11-05';
    } else if (segLower.includes('tanggal 3') || segLower.includes('tgl 3')) {
      date = '2026-11-03';
    } else if (segLower.includes('senin')) {
      date = '2026-11-02';
    }

    // Determine type
    const isIncome =
      segLower.includes('gaji') ||
      segLower.includes('gajian') ||
      segLower.includes('bonus') ||
      segLower.includes('transfer masuk') ||
      segLower.includes('dikasih') ||
      segLower.includes('untung');

    const type: TransactionType = isIncome ? 'income' : 'expense';

    // Parse amount
    let amount = 0;
    let needs_review = false;
    let warning: string | undefined;

    // Check patterns
    const jtMatch = segLower.match(/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)/);
    const rbMatch = segLower.match(/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)/);
    const rawNumMatch = segLower.match(/(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d+)/);

    if (jtMatch) {
      const num = parseFloat(jtMatch[1].replace(',', '.'));
      amount = Math.round(num * 1000000);
    } else if (rbMatch) {
      const num = parseFloat(rbMatch[1].replace(',', '.'));
      amount = Math.round(num * 1000);
    } else if (segLower.includes('sejuta')) {
      amount = 1000000;
    } else if (segLower.includes('dua juta')) {
      amount = 2000000;
    } else if (segLower.includes('seratus ribu')) {
      amount = 100000;
    } else if (rawNumMatch) {
      const clean = rawNumMatch[1].replace(/\./g, '');
      const parsed = parseInt(clean, 10);
      if (!isNaN(parsed) && parsed > 0) {
        amount = parsed;
      }
    }

    if (!amount || amount <= 0) {
      needs_review = true;
      amount = 0;
      warning = 'Nominal tidak terdeteksi jelas, mohon isi manual';
      warnings.push(`Transaksi "${seg}" nominal tidak jelas.`);
    }

    // Determine category
    let category = type === 'income' ? 'Gaji' : 'Makanan';
    if (type === 'income') {
      if (segLower.includes('bonus')) category = 'Bonus';
      else if (segLower.includes('usaha') || segLower.includes('jual')) category = 'Usaha';
      else if (segLower.includes('hadiah') || segLower.includes('dikasih')) category = 'Hadiah';
      else category = 'Gaji';
    } else {
      if (segLower.includes('makan') || segLower.includes('kopi') || segLower.includes('soto') || segLower.includes('ayam') || segLower.includes('bakso') || segLower.includes('snack') || segLower.includes('sarapan')) {
        category = 'Makanan';
      } else if (segLower.includes('bensin') || segLower.includes('ojol') || segLower.includes('grab') || segLower.includes('gojek') || segLower.includes('parkir') || segLower.includes('tol') || segLower.includes('transport')) {
        category = 'Transport';
      } else if (segLower.includes('kos') || segLower.includes('listrik') || segLower.includes('air') || segLower.includes('pulsa') || segLower.includes('paket') || segLower.includes('wifi') || segLower.includes('tagihan')) {
        category = 'Tagihan';
      } else if (segLower.includes('beli') || segLower.includes('belanja') || segLower.includes('indomaret') || segLower.includes('alfamart') || segLower.includes('tokopedia') || segLower.includes('shopee') || segLower.includes('sepatu') || segLower.includes('baju')) {
        category = 'Belanja';
      } else if (segLower.includes('obat') || segLower.includes('dokter') || segLower.includes('apotek') || segLower.includes('vitamin')) {
        category = 'Kesehatan';
      } else if (segLower.includes('nonton') || segLower.includes('bioskop') || segLower.includes('game') || segLower.includes('netflix')) {
        category = 'Hiburan';
      } else if (segLower.includes('buku') || segLower.includes('kursus') || segLower.includes('kuliah')) {
        category = 'Pendidikan';
      } else if (segLower.includes('sedekah') || segLower.includes('donasi') || segLower.includes('kondangan')) {
        category = 'Sosial';
      } else {
        category = 'Lainnya';
      }
    }

    // Clean note
    let note = seg
      .replace(/kemarin|tadi pagi|hari ini|senin lalu/gi, '')
      .replace(/\d+\s*(?:juta|jt|ribu|rb|k)/gi, '')
      .replace(/sejuta|seratus ribu/gi, '')
      .replace(/rp\.?\s*\d+/gi, '')
      .trim();

    if (!note) {
      note = seg;
    }

    items.push({
      date,
      type,
      amount,
      category,
      note,
      source: 'ai_text',
      needs_review,
      warning,
    });
  }

  return { items, warnings };
}

export interface ReceiptItem {
  name: string;
  price: number;
  category: string;
}

export interface ReceiptResult {
  merchant: string;
  date: string;
  total: number;
  items: ReceiptItem[];
  unreadable: boolean;
  warnings: string[];
}

export const SAMPLE_RECEIPTS: ReceiptResult[] = [
  {
    merchant: 'Superindo Tebet',
    date: '2026-11-07',
    total: 84500,
    items: [
      { name: 'Susu UHT Full Cream 1L', price: 21500, category: 'Makanan' },
      { name: 'Roti Gandum Serba Enak', price: 18000, category: 'Makanan' },
      { name: 'Sabun Cuci Piring 750ml', price: 15000, category: 'Belanja' },
      { name: 'Minyak Goreng 1L', price: 30000, category: 'Belanja' },
    ],
    unreadable: false,
    warnings: [],
  },
  {
    merchant: 'Kopi Kenangan Senopati',
    date: '2026-11-07',
    total: 48000,
    items: [
      { name: 'Kopi Kenangan Mantan Large', price: 26000, category: 'Makanan' },
      { name: 'Roti Coklat Klasik', price: 22000, category: 'Makanan' },
    ],
    unreadable: false,
    warnings: [],
  },
  {
    merchant: 'SPBU Pertamina MT Haryono',
    date: '2026-11-07',
    total: 100000,
    items: [
      { name: 'Pertamax 92 (7.87 Liter)', price: 100000, category: 'Transport' },
    ],
    unreadable: false,
    warnings: [],
  },
];

export function mockReceiptScan(index = 0): ReceiptResult {
  return SAMPLE_RECEIPTS[index % SAMPLE_RECEIPTS.length];
}
