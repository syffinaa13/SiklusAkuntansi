import React, { useState } from 'react';
import { Account, JournalEntry } from '../types/accounting';
import { formatRupiah } from '../utils/accountingCalculations';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Sparkles, ArrowDownRight, BookOpen } from 'lucide-react';

interface AdjustingJournalViewProps {
  entries: JournalEntry[];
  accounts: Account[];
  onOpenAddModal: () => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onApplyQuickTemplate: (type: string) => void;
}

export const AdjustingJournalView: React.FC<AdjustingJournalViewProps> = ({
  entries,
  accounts,
  onOpenAddModal,
  onEditEntry,
  onDeleteEntry,
  onApplyQuickTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const accountMap = new Map<string, Account>();
  accounts.forEach(a => accountMap.set(a.id, a));

  const adjustingEntries = entries
    .filter(e => e.isAdjusting)
    .sort((a, b) => a.date.localeCompare(b.date));

  const totalDebit = adjustingEntries.reduce(
    (sum, e) => sum + e.lines.reduce((s, l) => s + (l.debit || 0), 0),
    0
  );
  const totalCredit = adjustingEntries.reduce(
    (sum, e) => sum + e.lines.reduce((s, l) => s + (l.credit || 0), 0),
    0
  );
  const isBalanced = Math.abs(totalDebit - totalCredit) < 1;

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Jurnal Penyesuaian (Adjusting Entries / AJP)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Penyesuaian saldo akun pada akhir periode agar mencerminkan kondisi riil (akrual, deferral, penyusutan)
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jurnal Penyesuaian</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Entri Penyesuaian</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {adjustingEntries.length} <span className="text-xs font-normal text-slate-500">transaksi AJP</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Nilai Penyesuaian</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {formatRupiah(totalDebit)}
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          isBalanced ? 'bg-white border-slate-200' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Keseimbangan AJP</span>
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

      {/* Helper Box: Kasus Penyesuaian Standar */}
      <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg no-print">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <h3 className="text-xs font-bold text-amber-900">
            Panduan Kasus Jurnal Penyesuaian Akhir Periode:
          </h3>
        </div>
        <p className="text-xs text-amber-800/90 leading-relaxed mb-3">
          Jurnal penyesuaian wajib dibuat untuk mematuhi prinsip akuntansi berbasis akrual (accrual basis). Klik template untuk membuat entri cepat:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onApplyQuickTemplate('perlengkapan')}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
          >
            1. Pemakaian Perlengkapan (Beban Perlengkapan / Perlengkapan)
          </button>
          <button
            onClick={() => onApplyQuickTemplate('penyusutan')}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
          >
            2. Penyusutan Peralatan (Beban Penyusutan / Akum. Penyusutan)
          </button>
          <button
            onClick={() => onApplyQuickTemplate('sewa')}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
          >
            3. Amortisasi Beban Sewa Dibayar Dimuka
          </button>
          <button
            onClick={() => onApplyQuickTemplate('gaji')}
            className="px-2.5 py-1 text-xs font-medium bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
          >
            4. Pengakuan Beban Gaji Terutang (Beban Gaji / Utang Gaji)
          </button>
        </div>
      </div>

      {/* Adjusting Entries Table */}
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-24">Tanggal</th>
                <th className="py-3 px-3 w-24">No. Ref</th>
                <th className="py-3 px-4">Nama Akun & Keterangan Penyesuaian</th>
                <th className="py-3 px-3 text-center w-20">Ref</th>
                <th className="py-3 px-4 text-right w-36">Debit</th>
                <th className="py-3 px-4 text-right w-36">Kredit</th>
                <th className="py-3 px-3 text-center w-20 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {adjustingEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">Belum ada jurnal penyesuaian</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan template di atas atau klik tombol "+ Tambah Jurnal Penyesuaian"</p>
                  </td>
                </tr>
              ) : (
                adjustingEntries.map(entry => (
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
                          <td className="py-2.5 px-3 text-slate-600 align-top font-mono">
                            {isFirstLine ? entry.date : ''}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 font-medium align-top font-mono">
                            {isFirstLine ? entry.refNumber : ''}
                          </td>
                          <td className="py-2.5 px-4 align-top">
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
                              <div className="text-[11px] italic text-slate-500 mt-1 pl-2 border-l border-amber-300">
                                ({entry.description})
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center align-top text-slate-500 font-mono">
                            {account?.code || '-'}
                          </td>
                          <td className="py-2.5 px-4 text-right align-top font-mono font-medium text-slate-900">
                            {line.debit ? formatRupiah(line.debit) : '-'}
                          </td>
                          <td className="py-2.5 px-4 text-right align-top font-mono font-medium text-slate-900">
                            {line.credit ? formatRupiah(line.credit) : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center align-top no-print">
                            {isFirstLine && (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => onEditEntry(entry)}
                                  className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Edit AJP"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteEntry(entry.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hapus AJP"
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
            {adjustingEntries.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider text-[11px]">
                    Total Jurnal Penyesuaian:
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

      {/* Mobile Touch Cards View */}
      <div className="md:hidden space-y-3">
        {adjustingEntries.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-700 text-xs">Belum ada jurnal penyesuaian</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pilih salah satu template di atas</p>
          </div>
        ) : (
          adjustingEntries.map(entry => {
            const entryDebit = entry.lines.reduce((s, l) => s + (l.debit || 0), 0);

            return (
              <div 
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900">{entry.refNumber}</span>
                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                      AJP
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">{entry.date}</span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">
                    {entry.description}
                  </h4>
                </div>

                {/* Lines */}
                <div className="bg-slate-50 rounded-lg p-2.5 space-y-1.5 font-mono text-xs">
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

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Total: <strong className="text-slate-900">{formatRupiah(entryDebit)}</strong>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditEntry(entry)}
                      className="min-h-[38px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Ubah</span>
                    </button>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="min-h-[38px] px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
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
