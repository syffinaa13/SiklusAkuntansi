import React, { useState } from 'react';
import { Account, CompanyProfile, JournalEntry } from '../types/accounting';
import { calculateWorksheet, formatRupiah } from '../utils/accountingCalculations';
import { CheckCircle2, AlertCircle, Download, Printer, Table2 } from 'lucide-react';

interface WorksheetViewProps {
  company: CompanyProfile;
  accounts: Account[];
  generalEntries: JournalEntry[];
  adjustingEntries: JournalEntry[];
}

export const WorksheetView: React.FC<WorksheetViewProps> = ({
  company,
  accounts,
  generalEntries,
  adjustingEntries
}) => {
  const [hideZeroRows, setHideZeroRows] = useState(false);

  const worksheet = calculateWorksheet(accounts, generalEntries, adjustingEntries);
  const { rows, totals, netIncome, isTrialBalanced, isAdjBalanced, isAdjTrialBalanced } = worksheet;

  const filteredRows = hideZeroRows
    ? rows.filter(r => 
        r.trialDebit > 0 || r.trialCredit > 0 ||
        r.adjDebit > 0 || r.adjCredit > 0 ||
        r.adjTrialDebit > 0 || r.adjTrialCredit > 0
      )
    : rows;

  const isProfit = netIncome >= 0;
  const absNetIncome = Math.abs(netIncome);

  // Balanced totals for Laba Rugi & Neraca
  const balancedIncomeDebit = isProfit ? totals.incomeDebit + absNetIncome : totals.incomeDebit;
  const balancedIncomeCredit = !isProfit ? totals.incomeCredit + absNetIncome : totals.incomeCredit;

  const balancedNeracaDebit = !isProfit ? totals.balanceDebit + absNetIncome : totals.balanceDebit;
  const balancedNeracaCredit = isProfit ? totals.balanceCredit + absNetIncome : totals.balanceCredit;

  const isWorksheetBalanced = 
    Math.abs(balancedIncomeDebit - balancedIncomeCredit) < 1 &&
    Math.abs(balancedNeracaDebit - balancedNeracaCredit) < 1;

  const exportCSV = () => {
    const headers = [
      'No. Akun',
      'Nama Akun',
      'NS Debit',
      'NS Kredit',
      'AJP Debit',
      'AJP Kredit',
      'NSD Debit',
      'NSD Kredit',
      'L/R Debit',
      'L/R Kredit',
      'Neraca Debit',
      'Neraca Kredit'
    ];

    const dataRows = rows.map(r => [
      `"${r.account.code}"`,
      `"${r.account.name}"`,
      r.trialDebit,
      r.trialCredit,
      r.adjDebit,
      r.adjCredit,
      r.adjTrialDebit,
      r.adjTrialCredit,
      r.incomeDebit,
      r.incomeCredit,
      r.balanceDebit,
      r.balanceCredit
    ].join(','));

    // Totals
    const subtotalRow = [
      '""',
      '"Subtotal"',
      totals.trialDebit,
      totals.trialCredit,
      totals.adjDebit,
      totals.adjCredit,
      totals.adjTrialDebit,
      totals.adjTrialCredit,
      totals.incomeDebit,
      totals.incomeCredit,
      totals.balanceDebit,
      totals.balanceCredit
    ].join(',');

    const netIncomeRow = [
      '""',
      isProfit ? '"Laba Bersih"' : '"Rugi Bersih"',
      0, 0, 0, 0, 0, 0,
      isProfit ? absNetIncome : 0,
      !isProfit ? absNetIncome : 0,
      !isProfit ? absNetIncome : 0,
      isProfit ? absNetIncome : 0
    ].join(',');

    const balancedTotalRow = [
      '""',
      '"Total Seimbang"',
      totals.trialDebit,
      totals.trialCredit,
      totals.adjDebit,
      totals.adjCredit,
      totals.adjTrialDebit,
      totals.adjTrialCredit,
      balancedIncomeDebit,
      balancedIncomeCredit,
      balancedNeracaDebit,
      balancedNeracaCredit
    ].join(',');

    const csvContent = [headers.join(','), ...dataRows, subtotalRow, netIncomeRow, balancedTotalRow].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Neraca_Lajur_10_Kolom_${company.name.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  const [mobileColumnFilter, setMobileColumnFilter] = useState<'ALL' | 'NS' | 'AJP' | 'NSD' | 'LR' | 'NERACA'>('ALL');

  const isColVisible = (colType: 'NS' | 'AJP' | 'NSD' | 'LR' | 'NERACA') => {
    if (mobileColumnFilter === 'ALL') return '';
    return mobileColumnFilter === colType ? '' : 'hidden md:table-cell';
  };

  return (
    <div className="space-y-6">
      {/* Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Neraca Lajur 10 Kolom (Worksheet)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kertas kerja akuntansi komprehensif penghubung antara jurnal penyesuaian dan laporan keuangan
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={hideZeroRows}
              onChange={e => setHideZeroRows(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span>Sembunyikan Saldo Nol</span>
          </label>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ekspor CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>
        </div>
      </div>

      {/* Mobile Column Segment Switcher */}
      <div className="md:hidden bg-white p-2 rounded-xl border border-slate-200 no-print space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-500 px-1 block">
          Pilih Tampilan Kolom di Layar HP:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'Semua (Geser)' },
            { id: 'NS', label: '1. Neraca Saldo' },
            { id: 'AJP', label: '2. Penyesuaian' },
            { id: 'NSD', label: '3. NSD' },
            { id: 'LR', label: '4. Laba Rugi' },
            { id: 'NERACA', label: '5. Neraca' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileColumnFilter(tab.id as any)}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                mobileColumnFilter === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Balance Banner */}
      <div className={`p-4 rounded-lg border text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3 no-print ${
        isWorksheetBalanced
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-2">
          {isWorksheetBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <strong className="font-semibold block">
              {isWorksheetBalanced 
                ? `Neraca Lajur Seimbang Sempurna · ${isProfit ? 'Laba Bersih' : 'Rugi Bersih'}: ${formatRupiah(absNetIncome)}`
                : 'Terdapat Ketidakseimbangan dalam Neraca Lajur'}
            </strong>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Semua 5 pasang kolom (Neraca Saldo, Penyesuaian, NSD, Laba Rugi, dan Neraca) telah diverifikasi secara matematis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="text-center px-2 py-1 bg-white/80 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block">Total Pendapatan</span>
            <strong>{formatRupiah(totals.incomeCredit)}</strong>
          </div>
          <div className="text-center px-2 py-1 bg-white/80 rounded border border-slate-200">
            <span className="text-[10px] text-slate-500 font-sans block">Total Beban</span>
            <strong>{formatRupiah(totals.incomeDebit)}</strong>
          </div>
          <div className={`text-center px-2 py-1 rounded border ${isProfit ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900' : 'bg-rose-100 border-rose-300 text-rose-900'}`}>
            <span className="text-[10px] font-sans block">{isProfit ? 'Laba Bersih' : 'Rugi Bersih'}</span>
            <strong>{formatRupiah(absNetIncome)}</strong>
          </div>
        </div>
      </div>

      {/* Full 10-Column Spreadsheet Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-container">
        {/* Formal Header for Print */}
        <div className="text-center py-5 px-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            {company.name}
          </h2>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mt-0.5">
            KERTAS KERJA / NERACA LAJUR (10 KOLOM)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Periode yang berakhir pada {company.period}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 border-b-2 border-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              {/* Row 1: Group Headers */}
              <tr>
                <th rowSpan={2} className="py-2.5 px-3 w-16 text-center border-r border-slate-200 sticky left-0 bg-slate-100 z-20">
                  Kode
                </th>
                <th rowSpan={2} className="py-2.5 px-4 w-48 border-r border-slate-300 sticky left-16 bg-slate-100 z-20 shadow-xs">
                  Nama Akun
                </th>
                <th colSpan={2} className={`py-1 px-2 text-center border-r border-slate-200 bg-slate-100 ${isColVisible('NS')}`}>
                  Neraca Saldo
                </th>
                <th colSpan={2} className={`py-1 px-2 text-center border-r border-slate-200 bg-amber-50/70 text-amber-950 ${isColVisible('AJP')}`}>
                  Penyesuaian (AJP)
                </th>
                <th colSpan={2} className={`py-1 px-2 text-center border-r border-slate-200 bg-blue-50/60 text-blue-950 ${isColVisible('NSD')}`}>
                  NSD (Disesuaikan)
                </th>
                <th colSpan={2} className={`py-1 px-2 text-center border-r border-slate-200 bg-emerald-50/70 text-emerald-950 ${isColVisible('LR')}`}>
                  Laba / Rugi
                </th>
                <th colSpan={2} className={`py-1 px-2 text-center bg-indigo-50/60 text-indigo-950 ${isColVisible('NERACA')}`}>
                  Neraca Akhir
                </th>
              </tr>
              {/* Row 2: Debit / Kredit Sub-headers */}
              <tr className="border-t border-slate-200">
                {/* Neraca Saldo */}
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 ${isColVisible('NS')}`}>D</th>
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 ${isColVisible('NS')}`}>K</th>
                {/* Penyesuaian */}
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-amber-50/40 ${isColVisible('AJP')}`}>D</th>
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-amber-50/40 ${isColVisible('AJP')}`}>K</th>
                {/* NSD */}
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-blue-50/30 ${isColVisible('NSD')}`}>D</th>
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-blue-50/30 ${isColVisible('NSD')}`}>K</th>
                {/* Laba Rugi */}
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-emerald-50/40 ${isColVisible('LR')}`}>D</th>
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-emerald-50/40 ${isColVisible('LR')}`}>K</th>
                {/* Neraca */}
                <th className={`py-1 px-2 text-right w-24 border-r border-slate-200 bg-indigo-50/30 ${isColVisible('NERACA')}`}>D</th>
                <th className={`py-1 px-2 text-right w-24 bg-indigo-50/30 ${isColVisible('NERACA')}`}>K</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredRows.map(r => (
                <tr key={r.account.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-1.5 px-3 text-center border-r border-slate-200 text-slate-500 font-medium sticky left-0 bg-white z-10">
                    {r.account.code}
                  </td>
                  <td className="py-1.5 px-4 font-sans text-slate-900 border-r border-slate-300 truncate max-w-[180px] sticky left-16 bg-white z-10 shadow-xs" title={r.account.name}>
                    {r.account.name}
                  </td>
                  {/* Neraca Saldo */}
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 ${isColVisible('NS')}`}>
                    {r.trialDebit > 0 ? formatRupiah(r.trialDebit) : '-'}
                  </td>
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 ${isColVisible('NS')}`}>
                    {r.trialCredit > 0 ? formatRupiah(r.trialCredit) : '-'}
                  </td>
                  {/* Penyesuaian */}
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-amber-50/20 ${isColVisible('AJP')}`}>
                    {r.adjDebit > 0 ? formatRupiah(r.adjDebit) : '-'}
                  </td>
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-amber-50/20 ${isColVisible('AJP')}`}>
                    {r.adjCredit > 0 ? formatRupiah(r.adjCredit) : '-'}
                  </td>
                  {/* NSD */}
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-blue-50/15 ${isColVisible('NSD')}`}>
                    {r.adjTrialDebit > 0 ? formatRupiah(r.adjTrialDebit) : '-'}
                  </td>
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-blue-50/15 ${isColVisible('NSD')}`}>
                    {r.adjTrialCredit > 0 ? formatRupiah(r.adjTrialCredit) : '-'}
                  </td>
                  {/* Laba Rugi */}
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-emerald-50/20 ${isColVisible('LR')}`}>
                    {r.incomeDebit > 0 ? formatRupiah(r.incomeDebit) : '-'}
                  </td>
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-emerald-50/20 ${isColVisible('LR')}`}>
                    {r.incomeCredit > 0 ? formatRupiah(r.incomeCredit) : '-'}
                  </td>
                  {/* Neraca */}
                  <td className={`py-1.5 px-2 text-right border-r border-slate-200 bg-indigo-50/15 ${isColVisible('NERACA')}`}>
                    {r.balanceDebit > 0 ? formatRupiah(r.balanceDebit) : '-'}
                  </td>
                  <td className={`py-1.5 px-2 text-right bg-indigo-50/15 ${isColVisible('NERACA')}`}>
                    {r.balanceCredit > 0 ? formatRupiah(r.balanceCredit) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Footer Summary Blocks */}
            <tfoot className="border-t-2 border-slate-300 font-mono text-[11px] font-bold text-slate-900 bg-slate-50">
              {/* 1. Subtotal Row */}
              <tr className="border-b border-slate-200">
                <td colSpan={2} className="py-2 px-4 text-right font-sans uppercase tracking-wider text-[11px] border-r border-slate-300 sticky left-0 bg-slate-50 z-10 shadow-xs">
                  Subtotal:
                </td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('NS')}`}>{formatRupiah(totals.trialDebit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('NS')}`}>{formatRupiah(totals.trialCredit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('AJP')}`}>{formatRupiah(totals.adjDebit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('AJP')}`}>{formatRupiah(totals.adjCredit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('NSD')}`}>{formatRupiah(totals.adjTrialDebit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('NSD')}`}>{formatRupiah(totals.adjTrialCredit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-rose-700 ${isColVisible('LR')}`}>{formatRupiah(totals.incomeDebit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-emerald-700 ${isColVisible('LR')}`}>{formatRupiah(totals.incomeCredit)}</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 ${isColVisible('NERACA')}`}>{formatRupiah(totals.balanceDebit)}</td>
                <td className={`py-2 px-2 text-right ${isColVisible('NERACA')}`}>{formatRupiah(totals.balanceCredit)}</td>
              </tr>

              {/* 2. Net Income Balancing Row */}
              <tr className="border-b border-slate-300 bg-amber-50/50">
                <td colSpan={2} className="py-2 px-4 text-right font-sans uppercase tracking-wider text-[11px] border-r border-slate-300 text-amber-950 sticky left-0 bg-amber-50/50 z-10 shadow-xs">
                  {isProfit ? 'Laba Bersih Usaha:' : 'Rugi Bersih Usaha:'}
                </td>
                {/* NS & AJP & NSD empty */}
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-slate-400 ${isColVisible('NS')}`}>-</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-slate-400 ${isColVisible('NS')}`}>-</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-slate-400 ${isColVisible('AJP')}`}>-</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-slate-400 ${isColVisible('AJP')}`}>-</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-slate-400 ${isColVisible('NSD')}`}>-</td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-slate-400 ${isColVisible('NSD')}`}>-</td>
                {/* Laba Rugi Balancing */}
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-emerald-800 ${isColVisible('LR')}`}>
                  {isProfit ? formatRupiah(absNetIncome) : '-'}
                </td>
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-rose-800 ${isColVisible('LR')}`}>
                  {!isProfit ? formatRupiah(absNetIncome) : '-'}
                </td>
                {/* Neraca Balancing */}
                <td className={`py-2 px-2 text-right border-r border-slate-200 text-rose-800 ${isColVisible('NERACA')}`}>
                  {!isProfit ? formatRupiah(absNetIncome) : '-'}
                </td>
                <td className={`py-2 px-2 text-right text-emerald-800 ${isColVisible('NERACA')}`}>
                  {isProfit ? formatRupiah(absNetIncome) : '-'}
                </td>
              </tr>

              {/* 3. Grand Total Seimbang */}
              <tr className="bg-slate-100 text-slate-950 font-extrabold text-[12px]">
                <td colSpan={2} className="py-2.5 px-4 text-right font-sans uppercase tracking-wider border-r border-slate-300 sticky left-0 bg-slate-100 z-10 shadow-xs">
                  Total Seimbang:
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('NS')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(totals.trialDebit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('NS')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(totals.trialCredit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('AJP')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(totals.adjDebit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('AJP')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(totals.adjCredit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('NSD')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(totals.adjTrialDebit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('NSD')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(totals.adjTrialCredit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('LR')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(balancedIncomeDebit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('LR')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(balancedIncomeCredit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right border-r border-slate-200 ${isColVisible('NERACA')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(balancedNeracaDebit)}</div>
                </td>
                <td className={`py-2.5 px-2 text-right ${isColVisible('NERACA')}`}>
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">{formatRupiah(balancedNeracaCredit)}</div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
