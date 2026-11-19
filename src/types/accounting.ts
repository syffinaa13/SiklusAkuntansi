export type AccountCategory = 
  | 'ASET_LANCAR'
  | 'ASET_TETAP'
  | 'AKUMULASI_PENYUSUTAN'
  | 'KEWAJIBAN_LANCAR'
  | 'KEWAJIBAN_JANGKA_PANJANG'
  | 'EKUITAS'
  | 'PRIVE'
  | 'PENDAPATAN'
  | 'BEBAN_OPERASIONAL'
  | 'BEBAN_NON_OPERASIONAL'
  | 'PENDAPATAN_NON_OPERASIONAL';

export type NormalBalance = 'DEBIT' | 'KREDIT';

export interface Account {
  id: string;
  code: string;
  name: string;
  category: AccountCategory;
  normalBalance: NormalBalance;
  initialBalance: number;
  description?: string;
}

export interface JournalLine {
  id: string;
  accountId: string;
  debit: number;
  credit: number;
  memo?: string;
}

export type TransactionType = 'GENERAL' | 'RECEIPT' | 'PAYMENT';

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  refNumber: string; // e.g. JU-01, BKM-01, BKK-01, AJP-01
  description: string;
  isAdjusting: boolean; // false = Jurnal Umum, true = Jurnal Penyesuaian
  transactionType?: TransactionType; // 'RECEIPT' = Penerimaan Kas, 'PAYMENT' = Pembayaran Kas, 'GENERAL' = Non-kas / Jurnal Umum
  counterparty?: string; // Diterima dari / Dibayar kepada
  lines: JournalLine[];
  createdAt: string;
}

export type UserRole = 'ADMINISTRATOR' | 'OPERATOR';

export interface UserSession {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  avatarColor?: string;
  email?: string;
}

export interface CompanyProfile {
  name: string;
  period: string; // e.g. "Oktober 2026"
  ownerName: string;
  address?: string;
}

export interface LedgerPosting {
  date: string;
  refNumber: string;
  description: string;
  debit: number;
  credit: number;
  balanceDebit: number;
  balanceCredit: number;
  isAdjusting: boolean;
}

export interface AccountLedger {
  account: Account;
  postings: LedgerPosting[];
  unadjustedBalance: {
    debit: number;
    credit: number;
  };
  adjustedBalance: {
    debit: number;
    credit: number;
  };
}

export interface TrialBalanceRow {
  account: Account;
  debit: number;
  credit: number;
}

export interface WorksheetRow {
  account: Account;
  // 1 & 2: Neraca Saldo
  trialDebit: number;
  trialCredit: number;
  // 3 & 4: Penyesuaian
  adjDebit: number;
  adjCredit: number;
  // 5 & 6: Neraca Saldo Setelah Penyesuaian (NSD)
  adjTrialDebit: number;
  adjTrialCredit: number;
  // 7 & 8: Laba Rugi
  incomeDebit: number;
  incomeCredit: number;
  // 9 & 10: Neraca Akhir
  balanceDebit: number;
  balanceCredit: number;
}

export interface WorksheetData {
  rows: WorksheetRow[];
  totals: {
    trialDebit: number;
    trialCredit: number;
    adjDebit: number;
    adjCredit: number;
    adjTrialDebit: number;
    adjTrialCredit: number;
    incomeDebit: number;
    incomeCredit: number;
    balanceDebit: number;
    balanceCredit: number;
  };
  netIncome: number; // Positive = Laba Bersih, Negative = Rugi Bersih
  isTrialBalanced: boolean;
  isAdjBalanced: boolean;
  isAdjTrialBalanced: boolean;
}
