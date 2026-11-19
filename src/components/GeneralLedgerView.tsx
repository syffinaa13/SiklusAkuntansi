import React, { useState } from 'react';
import { Account, JournalEntry } from '../types/accounting';
import { calculateLedger, formatRupiah } from '../utils/accountingCalculations';
import { BookOpen, Search, Filter } from 'lucide-react';

interface GeneralLedgerViewProps {
  accounts: Account[];
  generalEntries: JournalEntry[];
  adjustingEntries: JournalEntry[];
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  accounts,
  generalEntries,
  adjustingEntries
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [includeAdjustments, setIncludeAdjustments] = useState(true);

  // Compute ledgers
  const ledgers = calculateLedger(
    accounts,
    generalEntries,
    includeAdjustments ? adjustingEntries : []
  );

  const filteredLedgers = ledgers.filter(ledger => {
    if (selectedAccountId !== 'all' && ledger.account.id !== selectedAccountId) {
      return false;
    }
    if (searchTerm) {
      const matchName = ledger.account.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCode = ledger.account.code.includes(searchTerm);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Buku Besar (General Ledger)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kumpulan akun yang mencatat mutasi debit, kredit, dan saldo berjalan (running balance)
          </p>
        </div>

        {/* View Options */}
        <div className="flex items-center gap-3 no-print">
          <label className="inline-flex items-center gap-2 text-xs text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-50">
            <input
              type="checkbox"
              checked={includeAdjustments}
              onChange={e => setIncludeAdjustments(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <span>Sertakan Jurnal Penyesuaian (AJP)</span>
          </label>
        </div>
      </div>

      {/* Account Selector & Search Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nama akun atau nomor kode..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-600 shrink-0">Filter Akun:</span>
          <select
            value={selectedAccountId}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900 w-full md:w-64"
          >
            <option value="all">Semua Akun ({accounts.length})</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.code} - {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Account Ledgers List */}
      <div className="space-y-6">
        {filteredLedgers.length === 0 ? (
          <div className="bg-white p-12 text-center border border-slate-200 rounded-lg text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium text-slate-600">Tidak ada akun yang sesuai dengan pencarian</p>
          </div>
        ) : (
          filteredLedgers.map(item => {
            const { account, postings } = item;
            const currentFinalDebit = includeAdjustments
              ? item.adjustedBalance.debit
              : item.unadjustedBalance.debit;
            const currentFinalCredit = includeAdjustments
              ? item.adjustedBalance.credit
              : item.unadjustedBalance.credit;

            return (
              <div 
                key={account.id} 
                className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs"
              >
                {/* Account Header */}
                <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-xs font-mono font-bold rounded">
                      {account.code}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {account.name}
                      </h3>
                      <div className="text-[11px] text-slate-500">
                        Saldo Normal: <strong className="text-slate-700">{account.normalBalance}</strong>
                        {account.description && ` · ${account.description}`}
                      </div>
                    </div>
                  </div>

                  {/* Summary Balance on Header */}
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Saldo Akhir:</span>
                    <span className="text-xs font-mono font-bold text-slate-900">
                      {account.normalBalance === 'DEBIT' 
                        ? formatRupiah(currentFinalDebit) 
                        : formatRupiah(currentFinalCredit)
                      }
                    </span>
                  </div>
                </div>

                {/* Desktop Posting Table (4 Kolom Standard) */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100/70 text-slate-700 border-b border-slate-200 font-semibold text-[11px] uppercase tracking-wider">
                      <tr>
                        <th rowSpan={2} className="py-2.5 px-3 w-24 border-r border-slate-200">Tanggal</th>
                        <th rowSpan={2} className="py-2.5 px-3 w-24 border-r border-slate-200">No. Ref</th>
                        <th rowSpan={2} className="py-2.5 px-4 border-r border-slate-200">Keterangan</th>
                        <th rowSpan={2} className="py-2.5 px-3 text-right w-32 border-r border-slate-200">Debit (Rp)</th>
                        <th rowSpan={2} className="py-2.5 px-3 text-right w-32 border-r border-slate-200">Kredit (Rp)</th>
                        <th colSpan={2} className="py-1 px-3 text-center border-b border-slate-200">Saldo Berjalan</th>
                      </tr>
                      <tr>
                        <th className="py-1.5 px-3 text-right w-32 border-r border-slate-200">Debit (Rp)</th>
                        <th className="py-1.5 px-3 text-right w-32">Kredit (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {/* Initial Balance Row */}
                      <tr className="bg-slate-50/40 text-slate-600 italic">
                        <td className="py-2 px-3 border-r border-slate-100">-</td>
                        <td className="py-2 px-3 border-r border-slate-100">-</td>
                        <td className="py-2 px-4 border-r border-slate-100 not-italic font-sans text-slate-700">
                          Saldo Awal Periode
                        </td>
                        <td className="py-2 px-3 text-right border-r border-slate-100">-</td>
                        <td className="py-2 px-3 text-right border-r border-slate-100">-</td>
                        <td className="py-2 px-3 text-right border-r border-slate-100">
                          {account.normalBalance === 'DEBIT' && account.initialBalance > 0
                            ? formatRupiah(account.initialBalance)
                            : '-'}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {account.normalBalance === 'KREDIT' && account.initialBalance > 0
                            ? formatRupiah(account.initialBalance)
                            : '-'}
                        </td>
                      </tr>

                      {postings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-4 text-center text-slate-400 font-sans italic text-xs">
                            Belum ada mutasi transaksi pada periode ini
                          </td>
                        </tr>
                      ) : (
                        postings.map((p, idx) => (
                          <tr 
                            key={idx} 
                            className={`hover:bg-slate-50/70 transition-colors ${
                              p.isAdjusting ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            <td className="py-2 px-3 text-slate-600 border-r border-slate-100">
                              {p.date}
                            </td>
                            <td className="py-2 px-3 text-slate-800 font-medium border-r border-slate-100">
                              <span className="flex items-center gap-1">
                                {p.refNumber}
                                {p.isAdjusting && (
                                  <span className="text-[9px] font-sans px-1 bg-amber-100 text-amber-800 rounded">
                                    AJP
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className="py-2 px-4 font-sans text-slate-900 border-r border-slate-100">
                              {p.description}
                            </td>
                            <td className="py-2 px-3 text-right border-r border-slate-100 text-slate-900">
                              {p.debit ? formatRupiah(p.debit) : '-'}
                            </td>
                            <td className="py-2 px-3 text-right border-r border-slate-100 text-slate-900">
                              {p.credit ? formatRupiah(p.credit) : '-'}
                            </td>
                            <td className={`py-2 px-3 text-right border-r border-slate-100 ${
                              account.normalBalance === 'DEBIT' ? 'font-bold text-slate-900' : 'text-slate-600'
                            }`}>
                              {p.balanceDebit > 0 ? formatRupiah(p.balanceDebit) : '-'}
                            </td>
                            <td className={`py-2 px-3 text-right ${
                              account.normalBalance === 'KREDIT' ? 'font-bold text-slate-900' : 'text-slate-600'
                            }`}>
                              {p.balanceCredit > 0 ? formatRupiah(p.balanceCredit) : '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {/* Final Balance Footer */}
                    <tfoot className="bg-slate-50 font-bold border-t border-slate-300 text-slate-900 font-mono">
                      <tr>
                        <td colSpan={3} className="py-2.5 px-4 text-right uppercase tracking-wider text-[11px] font-sans border-r border-slate-200">
                          Total Mutasi & Saldo Akhir:
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-200">
                          {formatRupiah(postings.reduce((s, p) => s + p.debit, 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-200">
                          {formatRupiah(postings.reduce((s, p) => s + p.credit, 0))}
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-slate-200 bg-slate-100/80 text-slate-950 font-bold">
                          {currentFinalDebit > 0 ? formatRupiah(currentFinalDebit) : '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right bg-slate-100/80 text-slate-950 font-bold">
                          {currentFinalCredit > 0 ? formatRupiah(currentFinalCredit) : '-'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Mobile Mutation Cards View */}
                <div className="md:hidden p-3 space-y-2.5">
                  {/* Saldo Awal Card */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                    <span className="text-slate-500 font-medium">Saldo Awal Periode:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {formatRupiah(account.initialBalance || 0)}
                    </span>
                  </div>

                  {postings.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs italic">
                      Belum ada mutasi transaksi
                    </div>
                  ) : (
                    postings.map((p, idx) => {
                      const runningBalance = account.normalBalance === 'DEBIT' ? p.balanceDebit : p.balanceCredit;
                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                            p.isAdjusting ? 'bg-amber-50/40 border-amber-200' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-slate-900">{p.refNumber}</span>
                              {p.isAdjusting && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1 rounded">
                                  AJP
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-slate-500">{p.date}</span>
                          </div>

                          <p className="text-slate-700 text-xs font-medium">
                            {p.description}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                            <div>
                              {p.debit > 0 && (
                                <span className="text-emerald-700 font-mono font-semibold">
                                  + Debit: {formatRupiah(p.debit)}
                                </span>
                              )}
                              {p.credit > 0 && (
                                <span className="text-rose-700 font-mono font-semibold">
                                  - Kredit: {formatRupiah(p.credit)}
                                </span>
                              )}
                            </div>
                            <div className="bg-slate-100 px-2 py-0.5 rounded font-mono font-bold text-slate-900 text-xs">
                              Saldo: {formatRupiah(runningBalance)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Saldo Akhir Summary */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold">
                    <span>Saldo Akhir ({account.normalBalance}):</span>
                    <span className="font-mono">
                      {account.normalBalance === 'DEBIT' ? formatRupiah(currentFinalDebit) : formatRupiah(currentFinalCredit)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
