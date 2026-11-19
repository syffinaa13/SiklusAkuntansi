import React, { useState } from 'react';
import { Account, CompanyProfile, JournalEntry } from '../types/accounting';
import { calculateWorksheet, calculateFinancialStatements, formatRupiah, calculateLedger } from '../utils/accountingCalculations';
import { Printer, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface FinancialStatementsViewProps {
  company: CompanyProfile;
  accounts: Account[];
  generalEntries: JournalEntry[];
  adjustingEntries: JournalEntry[];
}

type StatementTab = 'laba_rugi' | 'perubahan_modal' | 'neraca' | 'arus_kas' | 'semua';

export const FinancialStatementsView: React.FC<FinancialStatementsViewProps> = ({
  company,
  accounts,
  generalEntries,
  adjustingEntries
}) => {
  const [activeSubTab, setActiveSubTab] = useState<StatementTab>('laba_rugi');

  const worksheet = calculateWorksheet(accounts, generalEntries, adjustingEntries);
  const statements = calculateFinancialStatements(accounts, worksheet);
  const { incomeStatement, equityStatement, balanceSheet } = statements;

  // For cash flow statement:
  const ledgers = calculateLedger(accounts, generalEntries, adjustingEntries);
  const cashLedger = ledgers.find(l => l.account.code === '101' || l.account.name.toLowerCase().includes('kas'));
  const cashPostings = cashLedger?.postings || [];
  
  const cashInflows = cashPostings.filter(p => p.debit > 0);
  const cashOutflows = cashPostings.filter(p => p.credit > 0);
  const totalCashIn = cashInflows.reduce((s, p) => s + p.debit, 0);
  const totalCashOut = cashOutflows.reduce((s, p) => s + p.credit, 0);
  const netCashChange = totalCashIn - totalCashOut;
  const initialCash = cashLedger?.account.initialBalance || 0;
  const endingCash = initialCash + netCashChange;

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Laporan Keuangan (Financial Statements)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Laporan resmi hasil akhir siklus akuntansi: Laba Rugi, Perubahan Modal, Neraca, dan Arus Kas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-fit overflow-x-auto no-print">
        <button
          onClick={() => setActiveSubTab('laba_rugi')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'laba_rugi'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          1. Laba Rugi
        </button>
        <button
          onClick={() => setActiveSubTab('perubahan_modal')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'perubahan_modal'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          2. Perubahan Modal
        </button>
        <button
          onClick={() => setActiveSubTab('neraca')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'neraca'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          3. Neraca (Posisi Keuangan)
        </button>
        <button
          onClick={() => setActiveSubTab('arus_kas')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'arus_kas'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          4. Arus Kas
        </button>
        <button
          onClick={() => setActiveSubTab('semua')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
            activeSubTab === 'semua'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Lihat Semua Sekaligus
        </button>
      </div>

      {/* Reports Display Container */}
      <div className="space-y-8">
        {/* 1. LAPORAN LABA RUGI */}
        {(activeSubTab === 'laba_rugi' || activeSubTab === 'semua') && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-container">
            {/* Header */}
            <div className="text-center py-6 px-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {company.name}
              </h2>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mt-0.5">
                LAPORAN LABA RUGI (INCOME STATEMENT)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Untuk Periode yang Berakhir pada {company.period}
              </p>
            </div>

            <div className="p-6 max-w-3xl mx-auto space-y-6">
              {/* Pendapatan */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                  Pendapatan Operasional (Revenues)
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {incomeStatement.revenues.map(r => (
                    <div key={r.account.id} className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-700">{r.account.name}</span>
                      <span className="font-mono font-medium text-slate-900">
                        {formatRupiah(r.incomeCredit)}
                      </span>
                    </div>
                  ))}
                  {incomeStatement.revenues.length === 0 && (
                    <div className="py-2 text-slate-400 italic">Tidak ada pendapatan tercatat</div>
                  )}
                  <div className="py-3 flex justify-between items-center font-bold bg-slate-50/70 px-2 rounded">
                    <span className="text-slate-900">Total Pendapatan:</span>
                    <span className="font-mono text-slate-950">
                      {formatRupiah(incomeStatement.totalRevenue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Beban */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                  Beban Usaha & Operasional (Operating Expenses)
                </h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {incomeStatement.expenses.map(r => (
                    <div key={r.account.id} className="py-2.5 flex justify-between items-center">
                      <span className="text-slate-700">{r.account.name}</span>
                      <span className="font-mono font-medium text-slate-900">
                        {formatRupiah(r.incomeDebit)}
                      </span>
                    </div>
                  ))}
                  {incomeStatement.expenses.length === 0 && (
                    <div className="py-2 text-slate-400 italic">Tidak ada beban tercatat</div>
                  )}
                  <div className="py-3 flex justify-between items-center font-bold bg-slate-50/70 px-2 rounded">
                    <span className="text-slate-900">Total Beban Usaha:</span>
                    <span className="font-mono text-slate-950">
                      {formatRupiah(incomeStatement.totalExpense)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Laba / Rugi Bersih */}
              <div className={`p-4 rounded-lg border flex justify-between items-center text-sm font-bold ${
                incomeStatement.isProfit
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}>
                <div>
                  <span className="block text-xs uppercase tracking-wider font-semibold opacity-80">
                    Hasil Bersih Periode Berjalan
                  </span>
                  <span>{incomeStatement.isProfit ? 'Laba Bersih Usaha (Net Income)' : 'Rugi Bersih Usaha (Net Loss)'}</span>
                </div>
                <div className="text-base font-mono">
                  <div className="inline-block border-b-4 border-double border-current pb-0.5">
                    {formatRupiah(Math.abs(incomeStatement.netProfit))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. LAPORAN PERUBAHAN MODAL */}
        {(activeSubTab === 'perubahan_modal' || activeSubTab === 'semua') && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-container">
            {/* Header */}
            <div className="text-center py-6 px-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {company.name}
              </h2>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mt-0.5">
                LAPORAN PERUBAHAN MODAL (STATEMENT OF OWNER'S EQUITY)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Untuk Periode yang Berakhir pada {company.period}
              </p>
            </div>

            <div className="p-6 max-w-3xl mx-auto space-y-4 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-700 font-medium">
                  {equityStatement.modalAccountName} (Awal Periode)
                </span>
                <span className="font-mono font-medium text-slate-900">
                  {formatRupiah(equityStatement.initialEquity)}
                </span>
              </div>

              <div className="pl-4 space-y-2 text-slate-600">
                <div className="flex justify-between py-1">
                  <span>
                    {equityStatement.netProfit >= 0 ? 'Ditambah: Laba Bersih Usaha' : 'Dikurangi: Rugi Bersih Usaha'}
                  </span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatRupiah(Math.abs(equityStatement.netProfit))}
                  </span>
                </div>

                <div className="flex justify-between py-1">
                  <span>Dikurangi: Penarikan Pemilik (Prive)</span>
                  <span className="font-mono font-medium text-slate-900">
                    ({formatRupiah(equityStatement.priveAmount)})
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-2 bg-slate-50 px-2 rounded font-semibold text-slate-900 border-t border-slate-200">
                <span>
                  {equityStatement.equityChange >= 0 ? 'Kenaikan Bersih Modal' : 'Penurunan Bersih Modal'}
                </span>
                <span className="font-mono">
                  {formatRupiah(equityStatement.equityChange)}
                </span>
              </div>

              <div className="flex justify-between items-center py-3 px-3 bg-slate-100 rounded-lg text-sm font-bold text-slate-950 border border-slate-300">
                <span>
                  {equityStatement.modalAccountName} (Akhir Periode)
                </span>
                <div className="font-mono">
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">
                    {formatRupiah(equityStatement.endingEquity)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. NERACA (LAPORAN POSISI KEUANGAN) */}
        {(activeSubTab === 'neraca' || activeSubTab === 'semua') && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-container">
            {/* Header */}
            <div className="text-center py-6 px-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {company.name}
              </h2>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mt-0.5">
                NERACA / LAPORAN POSISI KEUANGAN (BALANCE SHEET)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Per {company.period}
              </p>
            </div>

            <div className="p-6">
              {/* 2-Column Split: Aset (Kiri) vs Liabilitas & Ekuitas (Kanan) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                {/* SISI KIRI: ASET / AKTIVA */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-slate-900">
                      Aset Lancar (Current Assets)
                    </h4>
                    <div className="divide-y divide-slate-100 mt-1">
                      {balanceSheet.currentAssets.map(r => (
                        <div key={r.account.id} className="py-2 flex justify-between">
                          <span className="text-slate-700">{r.account.name}</span>
                          <span className="font-mono text-slate-900">{formatRupiah(r.balanceDebit)}</span>
                        </div>
                      ))}
                      <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50/80 px-2 rounded">
                        <span>Total Aset Lancar:</span>
                        <span className="font-mono">{formatRupiah(balanceSheet.totalCurrentAssets)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-slate-900">
                      Aset Tetap (Fixed Assets)
                    </h4>
                    <div className="divide-y divide-slate-100 mt-1">
                      {balanceSheet.fixedAssets.map(r => (
                        <div key={r.account.id} className="py-2 flex justify-between">
                          <span className="text-slate-700">{r.account.name}</span>
                          <span className="font-mono text-slate-900">{formatRupiah(r.balanceDebit)}</span>
                        </div>
                      ))}
                      {balanceSheet.contraAssets.map(r => (
                        <div key={r.account.id} className="py-2 flex justify-between text-slate-600">
                          <span>Dikurangi: {r.account.name}</span>
                          <span className="font-mono">({formatRupiah(r.balanceCredit)})</span>
                        </div>
                      ))}
                      <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50/80 px-2 rounded">
                        <span>Nilai Buku Aset Tetap:</span>
                        <span className="font-mono">{formatRupiah(balanceSheet.netFixedAssets)}</span>
                      </div>
                    </div>
                  </div>

                  {/* TOTAL ASET */}
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center text-sm font-bold text-slate-950">
                    <span>TOTAL ASET (AKTIVA):</span>
                    <div className="font-mono">
                      <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">
                        {formatRupiah(balanceSheet.totalAssets)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SISI KANAN: KEWAJIBAN & EKUITAS / PASIVA */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-slate-900">
                      Kewajiban / Liabilitas Lancar
                    </h4>
                    <div className="divide-y divide-slate-100 mt-1">
                      {balanceSheet.currentLiabilities.map(r => (
                        <div key={r.account.id} className="py-2 flex justify-between">
                          <span className="text-slate-700">{r.account.name}</span>
                          <span className="font-mono text-slate-900">{formatRupiah(r.balanceCredit)}</span>
                        </div>
                      ))}
                      {balanceSheet.currentLiabilities.length === 0 && (
                        <div className="py-2 text-slate-400 italic">Tidak ada kewajiban lancar</div>
                      )}
                      <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50/80 px-2 rounded">
                        <span>Total Kewajiban Lancar:</span>
                        <span className="font-mono">{formatRupiah(balanceSheet.totalCurrentLiabilities)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-2 border-b-2 border-slate-900">
                      Ekuitas / Modal Pemilik
                    </h4>
                    <div className="divide-y divide-slate-100 mt-1">
                      <div className="py-2 flex justify-between">
                        <span className="text-slate-700">{equityStatement.modalAccountName} (Akhir)</span>
                        <span className="font-mono text-slate-900">{formatRupiah(balanceSheet.endingEquity)}</span>
                      </div>
                      <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50/80 px-2 rounded">
                        <span>Total Ekuitas:</span>
                        <span className="font-mono">{formatRupiah(balanceSheet.endingEquity)}</span>
                      </div>
                    </div>
                  </div>

                  {/* TOTAL LIABILITAS & EKUITAS */}
                  <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 flex justify-between items-center text-sm font-bold text-slate-950">
                    <span>TOTAL LIABILITAS & EKUITAS:</span>
                    <div className="font-mono">
                      <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">
                        {formatRupiah(balanceSheet.totalLiabilitiesAndEquity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Balance Validation Card */}
              <div className={`mt-6 p-3 rounded-lg border text-xs flex items-center justify-between no-print ${
                balanceSheet.isBalanced
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2">
                  {balanceSheet.isBalanced ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    {balanceSheet.isBalanced
                      ? 'Persamaan Dasar Akuntansi Terpenuhi: Aset = Liabilitas + Ekuitas (Seimbang Sempurna)'
                      : 'Neraca Belum Seimbang! Periksa kembali jurnal penyesuaian dan modal.'}
                  </span>
                </div>
                <span className="font-mono font-bold">
                  {formatRupiah(balanceSheet.totalAssets)} = {formatRupiah(balanceSheet.totalLiabilitiesAndEquity)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. LAPORAN ARUS KAS */}
        {(activeSubTab === 'arus_kas' || activeSubTab === 'semua') && (
          <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-container">
            {/* Header */}
            <div className="text-center py-6 px-4 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                {company.name}
              </h2>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mt-0.5">
                LAPORAN ARUS KAS (CASH FLOW STATEMENT)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Untuk Periode yang Berakhir pada {company.period}
              </p>
            </div>

            <div className="p-6 max-w-3xl mx-auto space-y-6 text-xs">
              {/* Penerimaan Kas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                  Arus Kas Masuk (Cash Inflows)
                </h4>
                <div className="divide-y divide-slate-100 mt-1">
                  {cashInflows.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between text-slate-700">
                      <span>{item.date} · {item.description} ({item.refNumber})</span>
                      <span className="font-mono text-emerald-700">+{formatRupiah(item.debit)}</span>
                    </div>
                  ))}
                  <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50 px-2 rounded">
                    <span>Total Penerimaan Kas:</span>
                    <span className="font-mono text-emerald-800">+{formatRupiah(totalCashIn)}</span>
                  </div>
                </div>
              </div>

              {/* Pengeluaran Kas */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
                  Arus Kas Keluar (Cash Outflows)
                </h4>
                <div className="divide-y divide-slate-100 mt-1">
                  {cashOutflows.map((item, idx) => (
                    <div key={idx} className="py-2 flex justify-between text-slate-700">
                      <span>{item.date} · {item.description} ({item.refNumber})</span>
                      <span className="font-mono text-rose-700">-{formatRupiah(item.credit)}</span>
                    </div>
                  ))}
                  <div className="py-2.5 flex justify-between font-semibold text-slate-900 bg-slate-50 px-2 rounded">
                    <span>Total Pengeluaran Kas:</span>
                    <span className="font-mono text-rose-800">-{formatRupiah(totalCashOut)}</span>
                  </div>
                </div>
              </div>

              {/* Rekonsiliasi Kas Akhir */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between py-1 text-slate-700 font-medium">
                  <span>Kenaikan / (Penurunan) Kas Bersih:</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(netCashChange)}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Saldo Kas Awal Periode:</span>
                  <span className="font-mono">{formatRupiah(initialCash)}</span>
                </div>
                <div className="flex justify-between items-center py-3 px-3 bg-slate-100 rounded-lg text-sm font-bold text-slate-950 border border-slate-300">
                  <span>SALDO KAS AKHIR PERIODE:</span>
                  <div className="font-mono">
                    <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">
                      {formatRupiah(endingCash)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
