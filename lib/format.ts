/**
 * Utility functions for Rupiah and Indonesian date formatting
 */

export function formatRupiah(amount: number): string {
  const formatted = Math.round(amount).toLocaleString('id-ID');
  return `Rp${formatted}`;
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '';

  // Specific check for today and yesterday relative to PRD date (2026-11-07)
  if (dateStr === '2026-11-07') {
    return 'Hari ini';
  }
  if (dateStr === '2026-11-06') {
    return 'Kemarin';
  }

  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    return `${day} ${months[month - 1] || ''} ${year}`;
  }

  return dateStr;
}

export function formatMonthYear(monthStr: string): string {
  // input: "2026-11"
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const mIndex = parseInt(month, 10) - 1;
  return `${monthNames[mIndex] || month} ${year}`;
}
