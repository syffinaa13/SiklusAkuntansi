import React, { useState } from 'react';
import { Account, JournalEntry, TransactionType } from '../types/accounting';
import { formatRupiah } from '../utils/accountingCalculations';
import { Search, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, FileText, ArrowDownRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface GeneralJournalViewProps {
  entries: JournalEntry[];
  accounts: Account[];
  onOpenAddModal: () => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const GeneralJournalView: React.FC<GeneralJournalViewProps> = ({
  entries,
  accounts,
  onOpenAddModal,
  onEditEntry,
  onDeleteEntry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const accountMap = new Map<string, Account>();
  accounts.forEach(a => accountMap.set(a.id, a));

  const generalEntries = entries
    .filter(e => !e.isAdjusting)
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredEntries = generalEntries.filter(entry => {
    const matchesSearch = 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.counterparty && entry.counterparty.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.lines.some(l => {
        const acc = accountMap.get(l.accountId);
        return acc && (acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.code.includes(searchTerm));
      });

    const matchesStart = !startDate || entry.date >= startDate;
    const matchesEnd = !endDate || entry.date <= endDate;

    let matchesType = true;
    if (typeFilter === 'RECEIPT') {
      matchesType = entry.transactionType === 'RECEIPT';
    } else if (typeFilter === 'PAYMENT') {
      matchesType = entry.transactionType === 'PAYMENT';
    } else if (typeFilter === 'GENERAL') {
      matchesType = !entry.transactionType || entry.transactionType === 'GENERAL';
    }

    return matchesSearch && matchesStart && matchesEnd && matchesType;
  });

  const totalDebit = filteredEntries.reduce(
    (sum, e) => sum + e.lines.reduce((s, l) => s + (l.debit || 0), 0),
    0
  );
  const totalCredit = filteredEntries.reduce(
    (sum, e) => sum + e.lines.reduce((s, l) => s + (l.credit || 0), 0),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;

  const getTransactionBadge = (entry: JournalEntry) => {
    if (entry.transactionType === 'RECEIPT') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-medium font-sans">
          <ArrowDownLeft className="w-2.5 h-2.5" /> BKM
        </span>
      );
    }
    if (entry.transactionType === 'PAYMENT') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10px] font-medium font-sans">
          <ArrowUpRight className="w-2.5 h-2.5" /> BKK
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded text-[10px] font-medium font-sans">
        JU
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Jurnal Umum (General Journal)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pusat pencatatan kronologis seluruh transaksi (Penerimaan Kas, Pembayaran Kas, dan Memorial) dalam posisi Debit dan Kredit
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Entri Jurnal</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Transaksi Jurnal</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {filteredEntries.length} <span className="text-xs font-normal text-slate-500">transaksi</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Debit</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatRupiah(totalDebit)}
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isBalanced ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Status Keseimbangan</span>
            {isBalanced ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className="text-xl font-bold font-mono">
            {isBalanced ? (
              <span className="text-emerald-700">Seimbang (Balance)</span>
            ) : (
              <span className="text-rose-700">Selisih: {formatRupiah(Math.abs(totalDebit - totalCredit))}</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari transaksi, ref, akun, kontak..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Semua Tipe Transaksi</option>
            <option value="RECEIPT">Penerimaan Kas (BKM)</option>
            <option value="PAYMENT">Pembayaran Kas (BKK)</option>
            <option value="GENERAL">Jurnal Non-Kas (JU)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 shrink-0">Tanggal:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden"
          />
          <span className="text-xs text-slate-400">-</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-hidden"
          />
          {(searchTerm || startDate || endDate || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
                setTypeFilter('all');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-24">Tanggal</th>
                <th className="py-3 px-3 w-32">No. Bukti / Tipe</th>
                <th className="py-3 px-4">Nama Akun & Keterangan</th>
                <th className="py-3 px-3 text-center w-20">Ref</th>
                <th className="py-3 px-4 text-right w-36">Debit</th>
                <th className="py-3 px-4 text-right w-36">Kredit</th>
                <th className="py-3 px-3 text-center w-20 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">Belum ada transaksi jurnal umum</p>
                    <p className="text-xs text-slate-400 mt-1">Transaksi penerimaan & pembayaran otomatis muncul di sini</p>
                  </td>
                </tr>
              ) : (
                filteredEntries.map(entry => (
                  <React.Fragment key={entry.id}>
                    {entry.lines.map((line, lineIndex) => {
                      const account = accountMap.get(line.accountId);
                      const isCreditLine = (line.credit || 0) > 0;
                      const isFirstLine = lineIndex === 0;

                      return (
                        <tr 
                          key={line.id} 
                          className={`hover:bg-slate-50/70 transition-colors ${
                            lineIndex === entry.lines.length - 1 ? 'border-b border-slate-200' : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-slate-600 align-top font-mono">
                            {isFirstLine ? entry.date : ''}
                          </td>
                          <td className="py-2 px-3 text-slate-700 font-medium align-top">
                            {isFirstLine && (
                              <div className="flex flex-col gap-1">
                                <span className="font-mono font-bold text-slate-900">{entry.refNumber}</span>
                                <div>{getTransactionBadge(entry)}</div>
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-4 align-top">
                            <div className={`flex items-center gap-1.5 ${isCreditLine ? 'pl-6 text-slate-700' : 'font-medium text-slate-900'}`}>
                              {isCreditLine && <ArrowDownRight className="w-3 h-3 text-slate-400 shrink-0" />}
                              <span>{account ? account.name : 'Akun Tidak Ditemukan'}</span>
                            </div>
                            {line.memo && (
                              <div className={`text-[11px] text-slate-400 mt-0.5 ${isCreditLine ? 'pl-6' : ''}`}>
                                {line.memo}
                              </div>
                            )}
                            {lineIndex === entry.lines.length - 1 && (
                              <div className="text-[11px] text-slate-600 mt-1 pl-2 border-l-2 border-slate-300">
                                <span className="italic">({entry.description})</span>
                                {entry.counterparty && (
                                  <span className="ml-2 font-medium text-slate-700 not-italic">
                                    · Kontak: {entry.counterparty}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center align-top text-slate-500 font-mono">
                            {account?.code || '-'}
                          </td>
                          <td className="py-2 px-4 text-right align-top font-mono font-medium text-slate-900">
                            {line.debit ? formatRupiah(line.debit) : '-'}
                          </td>
                          <td className="py-2 px-4 text-right align-top font-mono font-medium text-slate-900">
                            {line.credit ? formatRupiah(line.credit) : '-'}
                          </td>
                          <td className="py-2 px-3 text-center align-top no-print">
                            {isFirstLine && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => onEditEntry(entry)}
                                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Edit Jurnal"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteEntry(entry.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus Jurnal"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
            {/* Grand Total */}
            {filteredEntries.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-[11px]">
                    Total Jurnal Umum:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs">
                    {formatRupiah(totalDebit)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs">
                    {formatRupiah(totalCredit)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile Touch Card View */}
      <div className="md:hidden space-y-3">
        {filteredEntries.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-700 text-xs">Belum ada transaksi</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Catat transaksi lewat tombol di bawah</p>
          </div>
        ) : (
          filteredEntries.map(entry => {
            const entryDebit = entry.lines.reduce((s, l) => s + (l.debit || 0), 0);

            return (
              <div 
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{entry.refNumber}</span>
                    {getTransactionBadge(entry)}
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">{entry.date}</span>
                </div>

                {/* Description & Counterparty */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                    {entry.description}
                  </h4>
                  {entry.counterparty && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Kontak: <strong className="text-slate-700">{entry.counterparty}</strong>
                    </p>
                  )}
                </div>

                {/* Accounts Lines */}
                <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 text-xs font-mono">
                  {entry.lines.map(line => {
                    const acc = accountMap.get(line.accountId);
                    const isCredit = (line.credit || 0) > 0;
                    return (
                      <div key={line.id} className={`flex items-center justify-between ${isCredit ? 'pl-3 text-slate-600' : 'text-slate-900 font-semibold'}`}>
                        <div className="truncate mr-2 font-sans text-[11px]">
                          <span>{isCredit ? '↳ ' : '• '}</span>
                          <span>{acc ? `${acc.code} ${acc.name}` : '-'}</span>
                        </div>
                        <span className="text-[11px] font-mono shrink-0">
                          {isCredit ? formatRupiah(line.credit) : formatRupiah(line.debit)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Total: <strong className="text-slate-900">{formatRupiah(entryDebit)}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
