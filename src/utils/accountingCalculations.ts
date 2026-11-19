import {
  Account,
  AccountLedger,
  JournalEntry,
  LedgerPosting,
  TrialBalanceRow,
  WorksheetData,
  WorksheetRow
} from '../types/accounting';

export function formatRupiah(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(absVal);
  return isNegative ? `(${formatted})` : formatted;
}

export function formatNumber(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '0';
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  const formatted = new Intl.NumberFormat('id-ID').format(absVal);
  return isNegative ? `(${formatted})` : formatted;
}

/**
 * Calculates General Ledger (Buku Besar) for all accounts
 */
export function calculateLedger(
  accounts: Account[],
  generalEntries: JournalEntry[],
  adjustingEntries: JournalEntry[]
): AccountLedger[] {
  // Sort entries chronologically
  const sortedGeneral = [...generalEntries].sort((a, b) => a.date.localeCompare(b.date));
  const sortedAdj = [...adjustingEntries].sort((a, b) => a.date.localeCompare(b.date));

  return accounts.map(account => {
    const postings: LedgerPosting[] = [];
    let currentBalance = account.initialBalance || 0;
    let balanceDebit = account.normalBalance === 'DEBIT' ? currentBalance : 0;
    let balanceCredit = account.normalBalance === 'KREDIT' ? currentBalance : 0;

    // Process General Entries
    sortedGeneral.forEach(entry => {
      const matchingLines = entry.lines.filter(l => l.accountId === account.id);
      matchingLines.forEach(line => {
        const debit = line.debit || 0;
        const credit = line.credit || 0;

        if (account.normalBalance === 'DEBIT') {
          currentBalance += debit - credit;
          balanceDebit = currentBalance >= 0 ? currentBalance : 0;
          balanceCredit = currentBalance < 0 ? Math.abs(currentBalance) : 0;
        } else {
          currentBalance += credit - debit;
          balanceCredit = currentBalance >= 0 ? currentBalance : 0;
          balanceDebit = currentBalance < 0 ? Math.abs(currentBalance) : 0;
        }

        postings.push({
          date: entry.date,
          refNumber: entry.refNumber,
          description: line.memo || entry.description,
          debit,
          credit,
          balanceDebit,
          balanceCredit,
          isAdjusting: false
        });
      });
    });

    const unadjustedBalance = {
      debit: balanceDebit,
      credit: balanceCredit
    };

    // Process Adjusting Entries
    sortedAdj.forEach(entry => {
      const matchingLines = entry.lines.filter(l => l.accountId === account.id);
      matchingLines.forEach(line => {
        const debit = line.debit || 0;
        const credit = line.credit || 0;

        if (account.normalBalance === 'DEBIT') {
          currentBalance += debit - credit;
          balanceDebit = currentBalance >= 0 ? currentBalance : 0;
          balanceCredit = currentBalance < 0 ? Math.abs(currentBalance) : 0;
        } else {
          currentBalance += credit - debit;
          balanceCredit = currentBalance >= 0 ? currentBalance : 0;
          balanceDebit = currentBalance < 0 ? Math.abs(currentBalance) : 0;
        }

        postings.push({
          date: entry.date,
          refNumber: entry.refNumber,
          description: line.memo || entry.description,
          debit,
          credit,
          balanceDebit,
          balanceCredit,
          isAdjusting: true
        });
      });
    });

    const adjustedBalance = {
      debit: balanceDebit,
      credit: balanceCredit
    };

    return {
      account,
      postings,
      unadjustedBalance,
      adjustedBalance
    };
  });
}

/**
 * Calculates Neraca Saldo (Trial Balance) before adjustment
 */
export function calculateTrialBalance(
  accounts: Account[],
  generalEntries: JournalEntry[]
): { rows: TrialBalanceRow[]; totalDebit: number; totalCredit: number; isBalanced: boolean } {
  const ledgers = calculateLedger(accounts, generalEntries, []);
  
  const rows: TrialBalanceRow[] = ledgers.map(l => ({
    account: l.account,
    debit: l.unadjustedBalance.debit,
    credit: l.unadjustedBalance.credit
  })).filter(r => r.debit > 0 || r.credit > 0 || r.account.initialBalance > 0);

  // If no transactions exist, list all accounts with 0
  const finalRows = rows.length > 0 ? rows : accounts.map(acc => ({
    account: acc,
    debit: 0,
    credit: 0
  }));

  const totalDebit = finalRows.reduce((sum, r) => sum + r.debit, 0);
  const totalCredit = finalRows.reduce((sum, r) => sum + r.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;

  return {
    rows: finalRows,
    totalDebit,
    totalCredit,
    isBalanced
  };
}

/**
 * Calculates 10-Column Worksheet (Neraca Lajur)
 */
export function calculateWorksheet(
  accounts: Account[],
  generalEntries: JournalEntry[],
  adjustingEntries: JournalEntry[]
): WorksheetData {
  const sortedAccounts = [...accounts].sort((a, b) => a.code.localeCompare(b.code));

  // Compute adjusting sums per account
  const adjSums = new Map<string, { debit: number; credit: number }>();
  adjustingEntries.forEach(entry => {
    entry.lines.forEach(line => {
      const current = adjSums.get(line.accountId) || { debit: 0, credit: 0 };
      current.debit += line.debit || 0;
      current.credit += line.credit || 0;
      adjSums.set(line.accountId, current);
    });
  });

  const trialRes = calculateTrialBalance(accounts, generalEntries);
  const trialMap = new Map<string, { debit: number; credit: number }>();
  trialRes.rows.forEach(r => {
    trialMap.set(r.account.id, { debit: r.debit, credit: r.credit });
  });

  const rows: WorksheetRow[] = [];

  sortedAccounts.forEach(acc => {
    const trial = trialMap.get(acc.id) || { debit: 0, credit: 0 };
    const adj = adjSums.get(acc.id) || { debit: 0, credit: 0 };

    // Calculate NSD (Neraca Saldo Disesuaikan)
    let net = 0;
    if (acc.normalBalance === 'DEBIT') {
      net = (trial.debit - trial.credit) + (adj.debit - adj.credit);
    } else {
      net = (trial.credit - trial.debit) + (adj.credit - adj.debit);
    }

    let adjTrialDebit = 0;
    let adjTrialCredit = 0;

    if (acc.normalBalance === 'DEBIT') {
      if (net >= 0) {
        adjTrialDebit = net;
      } else {
        adjTrialCredit = Math.abs(net);
      }
    } else {
      if (net >= 0) {
        adjTrialCredit = net;
      } else {
        adjTrialDebit = Math.abs(net);
      }
    }

    // Determine classification: Nominal (Laba Rugi) vs Riil (Neraca)
    const isNominal = [
      'PENDAPATAN',
      'PENDAPATAN_NON_OPERASIONAL',
      'BEBAN_OPERASIONAL',
      'BEBAN_NON_OPERASIONAL'
    ].includes(acc.category);

    let incomeDebit = 0;
    let incomeCredit = 0;
    let balanceDebit = 0;
    let balanceCredit = 0;

    if (isNominal) {
      incomeDebit = adjTrialDebit;
      incomeCredit = adjTrialCredit;
    } else {
      balanceDebit = adjTrialDebit;
      balanceCredit = adjTrialCredit;
    }

    // Include row if there is any activity or non-zero value
    const hasActivity =
      trial.debit !== 0 ||
      trial.credit !== 0 ||
      adj.debit !== 0 ||
      adj.credit !== 0 ||
      adjTrialDebit !== 0 ||
      adjTrialCredit !== 0;

    if (hasActivity || true) {
      rows.push({
        account: acc,
        trialDebit: trial.debit,
        trialCredit: trial.credit,
        adjDebit: adj.debit,
        adjCredit: adj.credit,
        adjTrialDebit,
        adjTrialCredit,
        incomeDebit,
        incomeCredit,
        balanceDebit,
        balanceCredit
      });
    }
  });

  // Calculate totals
  const totals = {
    trialDebit: rows.reduce((s, r) => s + r.trialDebit, 0),
    trialCredit: rows.reduce((s, r) => s + r.trialCredit, 0),
    adjDebit: rows.reduce((s, r) => s + r.adjDebit, 0),
    adjCredit: rows.reduce((s, r) => s + r.adjCredit, 0),
    adjTrialDebit: rows.reduce((s, r) => s + r.adjTrialDebit, 0),
    adjTrialCredit: rows.reduce((s, r) => s + r.adjTrialCredit, 0),
    incomeDebit: rows.reduce((s, r) => s + r.incomeDebit, 0),
    incomeCredit: rows.reduce((s, r) => s + r.incomeCredit, 0),
    balanceDebit: rows.reduce((s, r) => s + r.balanceDebit, 0),
    balanceCredit: rows.reduce((s, r) => s + r.balanceCredit, 0)
  };

  // Net income: Total Kredit Laba Rugi (Pendapatan) - Total Debit Laba Rugi (Beban)
  const netIncome = totals.incomeCredit - totals.incomeDebit;

  return {
    rows,
    totals,
    netIncome,
    isTrialBalanced: Math.abs(totals.trialDebit - totals.trialCredit) < 1,
    isAdjBalanced: Math.abs(totals.adjDebit - totals.adjCredit) < 1,
    isAdjTrialBalanced: Math.abs(totals.adjTrialDebit - totals.adjTrialCredit) < 1
  };
}

/**
 * Calculates All Financial Statements (Laporan Keuangan)
 */
export function calculateFinancialStatements(
  accounts: Account[],
  worksheet: WorksheetData
) {
  // 1. Laba Rugi
  const revenues = worksheet.rows.filter(r =>
    ['PENDAPATAN', 'PENDAPATAN_NON_OPERASIONAL'].includes(r.account.category) &&
    r.incomeCredit > 0
  );
  const totalRevenue = revenues.reduce((s, r) => s + r.incomeCredit, 0);

  const expenses = worksheet.rows.filter(r =>
    ['BEBAN_OPERASIONAL', 'BEBAN_NON_OPERASIONAL'].includes(r.account.category) &&
    r.incomeDebit > 0
  );
  const totalExpense = expenses.reduce((s, r) => s + r.incomeDebit, 0);

  const netProfit = totalRevenue - totalExpense;

  // 2. Perubahan Modal
  const modalAccount = accounts.find(a => a.category === 'EKUITAS');
  const priveAccount = accounts.find(a => a.category === 'PRIVE');
  
  // Modal awal from worksheet balanceCredit before net income
  const initialEquity = worksheet.rows.find(r => r.account.category === 'EKUITAS')?.balanceCredit || 0;
  const priveAmount = worksheet.rows.find(r => r.account.category === 'PRIVE')?.balanceDebit || 0;
  
  const equityChange = netProfit - priveAmount;
  const endingEquity = initialEquity + equityChange;

  // 3. Neraca (Laporan Posisi Keuangan)
  const currentAssets = worksheet.rows.filter(r =>
    r.account.category === 'ASET_LANCAR' && r.balanceDebit > 0
  );
  const totalCurrentAssets = currentAssets.reduce((s, r) => s + r.balanceDebit, 0);

  const fixedAssets = worksheet.rows.filter(r =>
    r.account.category === 'ASET_TETAP' && r.balanceDebit > 0
  );
  const totalFixedAssetsCost = fixedAssets.reduce((s, r) => s + r.balanceDebit, 0);

  const contraAssets = worksheet.rows.filter(r =>
    r.account.category === 'AKUMULASI_PENYUSUTAN' && r.balanceCredit > 0
  );
  const totalAccumulatedDepreciation = contraAssets.reduce((s, r) => s + r.balanceCredit, 0);

  const netFixedAssets = totalFixedAssetsCost - totalAccumulatedDepreciation;
  const totalAssets = totalCurrentAssets + netFixedAssets;

  const currentLiabilities = worksheet.rows.filter(r =>
    r.account.category === 'KEWAJIBAN_LANCAR' && r.balanceCredit > 0
  );
  const totalCurrentLiabilities = currentLiabilities.reduce((s, r) => s + r.balanceCredit, 0);

  const longTermLiabilities = worksheet.rows.filter(r =>
    r.account.category === 'KEWAJIBAN_JANGKA_PANJANG' && r.balanceCredit > 0
  );
  const totalLongTermLiabilities = longTermLiabilities.reduce((s, r) => s + r.balanceCredit, 0);

  const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;
  const totalLiabilitiesAndEquity = totalLiabilities + endingEquity;
  const isBalanceSheetBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 1;

  return {
    incomeStatement: {
      revenues,
      totalRevenue,
      expenses,
      totalExpense,
      netProfit,
      isProfit: netProfit >= 0
    },
    equityStatement: {
      modalAccountName: modalAccount?.name || 'Modal Pemilik',
      initialEquity,
      netProfit,
      priveAmount,
      equityChange,
      endingEquity
    },
    balanceSheet: {
      currentAssets,
      totalCurrentAssets,
      fixedAssets,
      totalFixedAssetsCost,
      contraAssets,
      totalAccumulatedDepreciation,
      netFixedAssets,
      totalAssets,
      currentLiabilities,
      totalCurrentLiabilities,
      longTermLiabilities,
      totalLongTermLiabilities,
      totalLiabilities,
      endingEquity,
      totalLiabilitiesAndEquity,
      isBalanced: isBalanceSheetBalanced
    }
  };
}
