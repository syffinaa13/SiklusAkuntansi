import React, { useState } from 'react';
import { Account, CompanyProfile, JournalEntry } from '../types/accounting';
import { calculateTrialBalance, formatRupiah } from '../utils/accountingCalculations';
import { CheckCircle2, AlertCircle, Search, Printer, Download } from 'lucide-react';

interface TrialBalanceViewProps {
  company: CompanyProfile;
  accounts: Account[];
  generalEntries: JournalEntry[];
}

export const TrialBalanceView: React.FC<TrialBalanceViewProps> = ({
  company,
  accounts,
  generalEntries
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { rows, totalDebit, totalCredit, isBalanced } = calculateTrialBalance(
    accounts,
    generalEntries
  );

  const filteredRows = rows.filter(r => {
    if (!searchTerm) return true;
    return (
      r.account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.account.code.includes(searchTerm)
    );
  });

  const exportCSV = () => {
    const headers = ['Kode Akun', 'Nama Akun', 'Debit', 'Kredit'];
    const csvRows = [
      headers.join(','),
      ...rows.map(r => `"${r.account.code}","${r.account.name}",${r.debit},${r.credit}`),
      `"","TOTAL",${totalDebit},${totalCredit}`
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Neraca_Saldo_${company.name.replace(/\s+/g, '_')}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Neraca Saldo (Trial Balance)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar saldo debit dan kredit akun buku besar sebelum penyesuaian akhir periode
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      <div className={`p-4 rounded-lg border text-xs flex items-center justify-between no-print ${
        isBalanced
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-rose-50 border-rose-200 text-rose-900'
      }`}>
        <div className="flex items-center gap-2">
          {isBalanced ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <div>
            <strong className="font-semibold block">
              {isBalanced ? 'Neraca Saldo Seimbang (Balance)' : 'Neraca Saldo Belum Seimbang!'}
            </strong>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {isBalanced
                ? 'Total Debit sama persis dengan Total Kredit. Pembukuan siap dilanjutkan ke Jurnal Penyesuaian.'
                : `Terdapat selisih sebesar ${formatRupiah(Math.abs(totalDebit - totalCredit))}. Periksa kembali jurnal umum dan buku besar.`}
            </p>
          </div>
        </div>
        <div className="text-right font-mono text-xs hidden md:block">
          <div>Debit: <strong>{formatRupiah(totalDebit)}</strong></div>
          <div>Kredit: <strong>{formatRupiah(totalCredit)}</strong></div>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between gap-3 no-print">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari kode atau nama akun..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>
        <span className="text-xs text-slate-500">
          Menampilkan {filteredRows.length} akun aktif
        </span>
      </div>

      {/* Formal Accounting Report Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-2xs overflow-hidden print-container">
        {/* Formal Header for Print & Audit */}
        <div className="text-center py-6 px-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
            {company.name}
          </h2>
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-widest mt-0.5">
            NERACA SALDO (SEBELUM PENYESUAIAN)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Per {company.period}
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-28 text-center border-r border-slate-200">No. Akun</th>
                <th className="py-2.5 px-6 border-r border-slate-200">Nama Akun</th>
                <th className="py-2.5 px-6 text-right w-48 border-r border-slate-200">Debit (Rp)</th>
                <th className="py-2.5 px-6 text-right w-48">Kredit (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRows.map(r => (
                <tr key={r.account.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-4 text-center border-r border-slate-100 text-slate-600 font-medium">
                    {r.account.code}
                  </td>
                  <td className="py-2.5 px-6 font-sans text-slate-900 font-medium border-r border-slate-100">
                    {r.account.name}
                  </td>
                  <td className="py-2.5 px-6 text-right border-r border-slate-100 text-slate-900">
                    {r.debit > 0 ? formatRupiah(r.debit) : '-'}
                  </td>
                  <td className="py-2.5 px-6 text-right text-slate-900">
                    {r.credit > 0 ? formatRupiah(r.credit) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Grand Total */}
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-950 font-mono">
              <tr>
                <td colSpan={2} className="py-3 px-6 text-right uppercase tracking-wider text-xs font-sans border-r border-slate-200">
                  TOTAL SALDO:
                </td>
                <td className="py-3 px-6 text-right border-r border-slate-200 text-xs">
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">
                    {formatRupiah(totalDebit)}
                  </div>
                </td>
                <td className="py-3 px-6 text-right text-xs">
                  <div className="inline-block border-b-4 border-double border-slate-900 pb-0.5">
                    {formatRupiah(totalCredit)}
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredRows.map(r => {
            const isDebit = r.debit > 0;
            const amount = isDebit ? r.debit : r.credit;
            return (
              <div key={r.account.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-slate-500">
                      {r.account.code}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                      isDebit ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                    }`}>
                      {isDebit ? 'Debit' : 'Kredit'}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                    {r.account.name}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-mono font-bold ${
                    isDebit ? 'text-blue-900' : 'text-purple-900'
                  }`}>
                    {formatRupiah(amount)}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Mobile Grand Total Card */}
          <div className="p-4 bg-slate-900 text-white space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Total Debit:</span>
              <span className="font-mono font-bold">{formatRupiah(totalDebit)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-300">Total Kredit:</span>
              <span className="font-mono font-bold">{formatRupiah(totalCredit)}</span>
            </div>
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
              <span className="font-bold">Status:</span>
              <span className={`font-bold ${isBalanced ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBalanced ? 'Seimbang (Balance)' : 'Belum Seimbang'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
