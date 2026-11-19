import { Account, CompanyProfile, JournalEntry } from '../types/accounting';

export const DEFAULT_COMPANY: CompanyProfile = {
  name: 'PT Prima Auto Solusi',
  period: 'Oktober 2026',
  ownerName: 'Drs. Hendra Gunawan, M.M.',
  address: 'Jl. Sudirman No. 45, Jakarta Selatan'
};

export const DEFAULT_ACCOUNTS: Account[] = [
  // 1-xxx Aset Lancar
  {
    id: 'acc-101',
    code: '101',
    name: 'Kas',
    category: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Uang tunai dan rekening bank operasional'
  },
  {
    id: 'acc-102',
    code: '102',
    name: 'Piutang Usaha',
    category: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Tagihan kepada pelanggan atas jasa yang telah diselesaikan'
  },
  {
    id: 'acc-103',
    code: '103',
    name: 'Perlengkapan',
    category: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Bahan habis pakai dan peralatan kecil'
  },
  {
    id: 'acc-104',
    code: '104',
    name: 'Sewa Dibayar Dimuka',
    category: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Pembayaran sewa gedung/ruko di muka untuk periode mendatang'
  },
  {
    id: 'acc-105',
    code: '105',
    name: 'Asuransi Dibayar Dimuka',
    category: 'ASET_LANCAR',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Premi asuransi operasional dibayar di muka'
  },
  // 1-2xx Aset Tetap
  {
    id: 'acc-121',
    code: '121',
    name: 'Peralatan Bengkel & Kantor',
    category: 'ASET_TETAP',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Mesin, lift hidrolik, dan komputer kantor'
  },
  {
    id: 'acc-122',
    code: '122',
    name: 'Akumulasi Penyusutan Peralatan',
    category: 'AKUMULASI_PENYUSUTAN',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Kontra aset pengurang nilai perolehan peralatan'
  },
  // 2-xxx Kewajiban
  {
    id: 'acc-201',
    code: '201',
    name: 'Utang Usaha',
    category: 'KEWAJIBAN_LANCAR',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Kewajiban kepada pemasok atau kreditur dagang'
  },
  {
    id: 'acc-202',
    code: '202',
    name: 'Utang Gaji',
    category: 'KEWAJIBAN_LANCAR',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Beban gaji karyawan yang telah terjadi namun belum dibayarkan'
  },
  {
    id: 'acc-203',
    code: '203',
    name: 'Pendapatan Diterima di Muka',
    category: 'KEWAJIBAN_LANCAR',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Uang muka dari pelanggan sebelum jasa selesai diserahkan'
  },
  // 3-xxx Ekuitas
  {
    id: 'acc-301',
    code: '301',
    name: 'Modal Pemilik',
    category: 'EKUITAS',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Investasi dan penyertaan modal awal pemilik'
  },
  {
    id: 'acc-302',
    code: '302',
    name: 'Prive Pemilik',
    category: 'PRIVE',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Pengambilan uang tunai/aset untuk keperluan pribadi pemilik'
  },
  // 4-xxx Pendapatan
  {
    id: 'acc-401',
    code: '401',
    name: 'Pendapatan Jasa Servis',
    category: 'PENDAPATAN',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Penghasilan dari layanan jasa perbaikan dan servis'
  },
  {
    id: 'acc-402',
    code: '402',
    name: 'Pendapatan Jasa Detailing',
    category: 'PENDAPATAN',
    normalBalance: 'KREDIT',
    initialBalance: 0,
    description: 'Penghasilan dari layanan cuci dan perawatan mobil'
  },
  // 5-xxx Beban Operasional
  {
    id: 'acc-501',
    code: '501',
    name: 'Beban Gaji Karyawan',
    category: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Kompensasi gaji teknisi dan staf administrasi'
  },
  {
    id: 'acc-502',
    code: '502',
    name: 'Beban Sewa',
    category: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Alokasi biaya sewa tempat usaha bulan berjalan'
  },
  {
    id: 'acc-503',
    code: '503',
    name: 'Beban Utilitas (Listrik & Air)',
    category: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Tagihan listrik PLN, air PDAM, dan internet'
  },
  {
    id: 'acc-504',
    code: '504',
    name: 'Beban Perlengkapan',
    category: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Biaya perlengkapan yang terpakai selama periode'
  },
  {
    id: 'acc-505',
    code: '505',
    name: 'Beban Penyusutan Peralatan',
    category: 'BEBAN_OPERASIONAL',
    normalBalance: 'DEBIT',
    initialBalance: 0,
    description: 'Beban amortisasi/depresiasi peralatan bulan berjalan'
  }
];

export const DEFAULT_GENERAL_ENTRIES: JournalEntry[] = [
  {
    id: 'ju-001',
    date: '2026-10-01',
    refNumber: 'BKM-001',
    description: 'Setoran modal awal pemilik berupa uang tunai',
    isAdjusting: false,
    transactionType: 'RECEIPT',
    counterparty: 'Drs. Hendra Gunawan',
    createdAt: '2026-10-01T08:00:00.000Z',
    lines: [
      { id: 'jul-1', accountId: 'acc-101', debit: 65000000, credit: 0, memo: 'Kas operasional' },
      { id: 'jul-2', accountId: 'acc-301', debit: 0, credit: 65000000, memo: 'Modal Hendra' }
    ]
  },
  {
    id: 'ju-002',
    date: '2026-10-02',
    refNumber: 'BKK-001',
    description: 'Pembayaran sewa ruko bengkel untuk masa 1 tahun',
    isAdjusting: false,
    transactionType: 'PAYMENT',
    counterparty: 'Pemilik Gedung Ruko',
    createdAt: '2026-10-02T09:30:00.000Z',
    lines: [
      { id: 'jul-3', accountId: 'acc-104', debit: 12000000, credit: 0, memo: 'Sewa ruko 12 bulan' },
      { id: 'jul-4', accountId: 'acc-101', debit: 0, credit: 12000000, memo: 'Kas keluar' }
    ]
  },
  {
    id: 'ju-003',
    date: '2026-10-04',
    refNumber: 'BKK-002',
    description: 'Pembelian perlengkapan bengkel dan suku cadang habis pakai tunai',
    isAdjusting: false,
    transactionType: 'PAYMENT',
    counterparty: 'Toko Perlengkapan Otomotif',
    createdAt: '2026-10-04T10:15:00.000Z',
    lines: [
      { id: 'jul-5', accountId: 'acc-103', debit: 3500000, credit: 0, memo: 'Perlengkapan bengkel' },
      { id: 'jul-6', accountId: 'acc-101', debit: 0, credit: 3500000, memo: 'Pembayaran tunai' }
    ]
  },
  {
    id: 'ju-004',
    date: '2026-10-06',
    refNumber: 'JU-001',
    description: 'Pembelian peralatan hidrolik dan mesin servis secara kredit dari PT Mesinindo',
    isAdjusting: false,
    transactionType: 'GENERAL',
    counterparty: 'PT Mesinindo',
    createdAt: '2026-10-06T14:00:00.000Z',
    lines: [
      { id: 'jul-7', accountId: 'acc-121', debit: 25000000, credit: 0, memo: 'Peralatan bengkel' },
      { id: 'jul-8', accountId: 'acc-201', debit: 0, credit: 25000000, memo: 'Faktur PT Mesinindo' }
    ]
  },
  {
    id: 'ju-005',
    date: '2026-10-09',
    refNumber: 'BKM-002',
    description: 'Penerimaan pendapatan jasa servis mobil tunai',
    isAdjusting: false,
    transactionType: 'RECEIPT',
    counterparty: 'Pelanggan Servis Harian',
    createdAt: '2026-10-09T16:00:00.000Z',
    lines: [
      { id: 'jul-9', accountId: 'acc-101', debit: 8400000, credit: 0, memo: 'Kas masuk jasa servis' },
      { id: 'jul-10', accountId: 'acc-401', debit: 0, credit: 8400000, memo: 'Pendapatan servis' }
    ]
  },
  {
    id: 'ju-006',
    date: '2026-10-12',
    refNumber: 'JU-002',
    description: 'Penyelesaian jasa perawatan armada PT Logistik Prima (pembayaran tempo 30 hari)',
    isAdjusting: false,
    transactionType: 'GENERAL',
    counterparty: 'PT Logistik Prima',
    createdAt: '2026-10-12T11:00:00.000Z',
    lines: [
      { id: 'jul-11', accountId: 'acc-102', debit: 6200000, credit: 0, memo: 'Tagihan invoice #012' },
      { id: 'jul-12', accountId: 'acc-401', debit: 0, credit: 6200000, memo: 'Pendapatan jasa tempo' }
    ]
  },
  {
    id: 'ju-007',
    date: '2026-10-15',
    refNumber: 'BKK-003',
    description: 'Pembayaran sebagian utang usaha atas pembelian peralatan kepada PT Mesinindo',
    isAdjusting: false,
    transactionType: 'PAYMENT',
    counterparty: 'PT Mesinindo',
    createdAt: '2026-10-15T13:30:00.000Z',
    lines: [
      { id: 'jul-13', accountId: 'acc-201', debit: 10000000, credit: 0, memo: 'Cicilan utang peralatan' },
      { id: 'jul-14', accountId: 'acc-101', debit: 0, credit: 10000000, memo: 'Kas keluar' }
    ]
  },
  {
    id: 'ju-008',
    date: '2026-10-18',
    refNumber: 'BKM-003',
    description: 'Penerimaan pembayaran sebagian piutang dari PT Logistik Prima',
    isAdjusting: false,
    transactionType: 'RECEIPT',
    counterparty: 'PT Logistik Prima',
    createdAt: '2026-10-18T15:20:00.000Z',
    lines: [
      { id: 'jul-15', accountId: 'acc-101', debit: 4000000, credit: 0, memo: 'Pelunasan parsial' },
      { id: 'jul-16', accountId: 'acc-102', debit: 0, credit: 4000000, memo: 'Pengurangan piutang' }
    ]
  },
  {
    id: 'ju-009',
    date: '2026-10-22',
    refNumber: 'BKK-004',
    description: 'Pembayaran rekening listrik, air dan paket internet wifi bengkel',
    isAdjusting: false,
    transactionType: 'PAYMENT',
    counterparty: 'PLN & Telkom',
    createdAt: '2026-10-22T10:00:00.000Z',
    lines: [
      { id: 'jul-17', accountId: 'acc-503', debit: 1750000, credit: 0, memo: 'Beban utilitas' },
      { id: 'jul-18', accountId: 'acc-101', debit: 0, credit: 1750000, memo: 'Kas keluar' }
    ]
  },
  {
    id: 'ju-010',
    date: '2026-10-25',
    refNumber: 'BKK-005',
    description: 'Pembayaran gaji teknisi dan staf termin 1 secara tunai',
    isAdjusting: false,
    transactionType: 'PAYMENT',
    counterparty: 'Teknisi & Staf Bengkel',
    createdAt: '2026-10-25T17:00:00.000Z',
    lines: [
      { id: 'jul-19', accountId: 'acc-501', debit: 4500000, credit: 0, memo: 'Gaji karyawan' },
      { id: 'jul-20', accountId: 'acc-101', debit: 0, credit: 4500000, memo: 'Kas keluar' }
    ]
  },
  {
    id: 'ju-011',
    date: '2026-10-28',
    refNumber: 'BKK-006',
    description: 'Penarikan kas oleh pemilik untuk keperluan pribadi (Prive)',
    isAdjusting: false,
    transactionType: 'PAYMENT',
    counterparty: 'Drs. Hendra Gunawan',
    createdAt: '2026-10-28T14:45:00.000Z',
    lines: [
      { id: 'jul-21', accountId: 'acc-302', debit: 2000000, credit: 0, memo: 'Prive Tn. Hendra' },
      { id: 'jul-22', accountId: 'acc-101', debit: 0, credit: 2000000, memo: 'Kas keluar' }
    ]
  },
  {
    id: 'ju-012',
    date: '2026-10-30',
    refNumber: 'BKM-004',
    description: 'Penerimaan pendapatan jasa detailing dan salon mobil',
    isAdjusting: false,
    transactionType: 'RECEIPT',
    counterparty: 'Pelanggan Salon Mobil',
    createdAt: '2026-10-30T16:30:00.000Z',
    lines: [
      { id: 'jul-23', accountId: 'acc-101', debit: 5600000, credit: 0, memo: 'Kas masuk detailing' },
      { id: 'jul-24', accountId: 'acc-402', debit: 0, credit: 5600000, memo: 'Pendapatan detailing' }
    ]
  }
];

export const DEFAULT_ADJUSTING_ENTRIES: JournalEntry[] = [
  {
    id: 'ajp-001',
    date: '2026-10-31',
    refNumber: 'AJP-001',
    description: 'Penyesuaian pemakaian perlengkapan (sisa fisik akhir bulan Rp 1.500.000)',
    isAdjusting: true,
    createdAt: '2026-10-31T18:00:00.000Z',
    lines: [
      { id: 'ajpl-1', accountId: 'acc-504', debit: 2000000, credit: 0, memo: 'Beban perlengkapan terpakai' },
      { id: 'ajpl-2', accountId: 'acc-103', debit: 0, credit: 2000000, memo: 'Pengurangan perlengkapan' }
    ]
  },
  {
    id: 'ajp-002',
    date: '2026-10-31',
    refNumber: 'AJP-002',
    description: 'Penyusutan peralatan bengkel & kantor untuk bulan Oktober',
    isAdjusting: true,
    createdAt: '2026-10-31T18:15:00.000Z',
    lines: [
      { id: 'ajpl-3', accountId: 'acc-505', debit: 500000, credit: 0, memo: 'Beban penyusutan peralatan' },
      { id: 'ajpl-4', accountId: 'acc-122', debit: 0, credit: 500000, memo: 'Akumulasi penyusutan' }
    ]
  },
  {
    id: 'ajp-003',
    date: '2026-10-31',
    refNumber: 'AJP-003',
    description: 'Penyesuaian beban sewa ruko yang telah jatuh tempo (1 bulan dari 12 bulan)',
    isAdjusting: true,
    createdAt: '2026-10-31T18:30:00.000Z',
    lines: [
      { id: 'ajpl-5', accountId: 'acc-502', debit: 1000000, credit: 0, memo: 'Beban sewa bulan Oktober' },
      { id: 'ajpl-6', accountId: 'acc-104', debit: 0, credit: 1000000, memo: 'Sewa dibayar dimuka terpakai' }
    ]
  },
  {
    id: 'ajp-004',
    date: '2026-10-31',
    refNumber: 'AJP-004',
    description: 'Pengakuan beban gaji yang masih harus dibayar (terutang) akhir bulan',
    isAdjusting: true,
    createdAt: '2026-10-31T18:45:00.000Z',
    lines: [
      { id: 'ajpl-7', accountId: 'acc-501', debit: 2500000, credit: 0, memo: 'Beban gaji terutang' },
      { id: 'ajpl-8', accountId: 'acc-202', debit: 0, credit: 2500000, memo: 'Utang gaji karyawan' }
    ]
  }
];
