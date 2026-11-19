import React, { useState, useEffect } from 'react';
import { Account, JournalEntry, JournalLine } from '../types/accounting';
import { formatRupiah } from '../utils/accountingCalculations';
import { X, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: JournalEntry) => void;
  accounts: Account[];
  initialEntry?: JournalEntry | null;
  isAdjustingDefault?: boolean;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  accounts,
  initialEntry,
  isAdjustingDefault = false
}) => {
  const [date, setDate] = useState('2026-10-31');
  const [refNumber, setRefNumber] = useState('');
  const [description, setDescription] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [transactionType, setTransactionType] = useState<'GENERAL' | 'RECEIPT' | 'PAYMENT'>('GENERAL');
  const [isAdjusting, setIsAdjusting] = useState(isAdjustingDefault);
  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', accountId: accounts[0]?.id || '', debit: 0, credit: 0, memo: '' },
    { id: '2', accountId: accounts[1]?.id || '', debit: 0, credit: 0, memo: '' }
  ]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialEntry) {
      setDate(initialEntry.date);
      setRefNumber(initialEntry.refNumber);
      setDescription(initialEntry.description);
      setCounterparty(initialEntry.counterparty || '');
      setTransactionType(initialEntry.transactionType || 'GENERAL');
      setIsAdjusting(initialEntry.isAdjusting);
      setLines(initialEntry.lines.map(l => ({ ...l })));
    } else {
      const now = new Date();
      const defaultDate = isAdjustingDefault ? '2026-10-31' : '2026-10-15';
      setDate(defaultDate);
      setIsAdjusting(isAdjustingDefault);
      setTransactionType('GENERAL');
      setCounterparty('');
      setRefNumber(isAdjustingDefault ? `AJP-${Math.floor(100 + Math.random() * 900)}` : `JU-${Math.floor(100 + Math.random() * 900)}`);
      setDescription('');
      
      const firstAcc = accounts[0]?.id || '';
      const secondAcc = accounts[1]?.id || '';
      setLines([
        { id: '1', accountId: firstAcc, debit: 0, credit: 0, memo: '' },
        { id: '2', accountId: secondAcc, debit: 0, credit: 0, memo: '' }
      ]);
    }
    setErrorMsg('');
  }, [isOpen, initialEntry, isAdjustingDefault, accounts]);

  if (!isOpen) return null;

  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && difference === 0;

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: Date.now().toString(),
        accountId: accounts[0]?.id || '',
        debit: 0,
        credit: 0,
        memo: ''
      }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      setErrorMsg('Jurnal harus memiliki minimal 2 baris (Debit & Kredit)');
      return;
    }
    const updated = lines.filter((_, i) => i !== index);
    setLines(updated);
  };

  const handleLineChange = (index: number, field: keyof JournalLine, value: any) => {
    const updated = [...lines];
    if (field === 'debit') {
      const num = parseFloat(value) || 0;
      updated[index].debit = num;
      if (num > 0) updated[index].credit = 0; // standard single column entry
    } else if (field === 'credit') {
      const num = parseFloat(value) || 0;
      updated[index].credit = num;
      if (num > 0) updated[index].debit = 0;
    } else {
      (updated[index] as any)[field] = value;
    }
    setLines(updated);
    setErrorMsg('');
  };

  // Quick Adjustment Templates
  const applyTemplate = (type: string) => {
    if (type === 'perlengkapan') {
      const bebanPerl = accounts.find(a => a.code === '504' || a.name.toLowerCase().includes('beban perlengkapan'));
      const perl = accounts.find(a => a.code === '103' || a.name.toLowerCase().includes('perlengkapan'));
      if (bebanPerl && perl) {
        setDescription('Penyesuaian pemakaian perlengkapan akhir periode');
        setLines([
          { id: '1', accountId: bebanPerl.id, debit: 1000000, credit: 0, memo: 'Beban pemakaian' },
          { id: '2', accountId: perl.id, debit: 0, credit: 1000000, memo: 'Pengurangan perlengkapan' }
        ]);
      }
    } else if (type === 'penyusutan') {
      const bebanPeny = accounts.find(a => a.code === '505' || a.name.toLowerCase().includes('beban penyusutan'));
      const akumPeny = accounts.find(a => a.code === '122' || a.name.toLowerCase().includes('akumulasi penyusutan'));
      if (bebanPeny && akumPeny) {
        setDescription('Penyesuaian beban penyusutan peralatan bulan berjalan');
        setLines([
          { id: '1', accountId: bebanPeny.id, debit: 500000, credit: 0, memo: 'Beban penyusutan' },
          { id: '2', accountId: akumPeny.id, debit: 0, credit: 500000, memo: 'Akumulasi penyusutan' }
        ]);
      }
    } else if (type === 'sewa') {
      const bebanSewa = accounts.find(a => a.code === '502' || a.name.toLowerCase().includes('beban sewa'));
      const sewaDimuka = accounts.find(a => a.code === '104' || a.name.toLowerCase().includes('sewa dibayar dimuka'));
      if (bebanSewa && sewaDimuka) {
        setDescription('Penyesuaian sewa dibayar dimuka yang telah jatuh tempo');
        setLines([
          { id: '1', accountId: bebanSewa.id, debit: 1000000, credit: 0, memo: 'Beban sewa berjalan' },
          { id: '2', accountId: sewaDimuka.id, debit: 0, credit: 1000000, memo: 'Amortisasi sewa' }
        ]);
      }
    } else if (type === 'gaji') {
      const bebanGaji = accounts.find(a => a.code === '501' || a.name.toLowerCase().includes('beban gaji'));
      const utangGaji = accounts.find(a => a.code === '202' || a.name.toLowerCase().includes('utang gaji'));
      if (bebanGaji && utangGaji) {
        setDescription('Penyesuaian beban gaji yang masih harus dibayar (akrual)');
        setLines([
          { id: '1', accountId: bebanGaji.id, debit: 1500000, credit: 0, memo: 'Beban gaji terutang' },
          { id: '2', accountId: utangGaji.id, debit: 0, credit: 1500000, memo: 'Kewajiban gaji' }
        ]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMsg('Keterangan transaksi wajib diisi');
      return;
    }
    if (!refNumber.trim()) {
      setErrorMsg('Nomor referensi / bukti transaksi wajib diisi');
      return;
    }
    if (totalDebit <= 0) {
      setErrorMsg('Total debit dan kredit harus lebih dari Rp 0');
      return;
    }
    if (!isBalanced) {
      setErrorMsg(`Total Debit (${formatRupiah(totalDebit)}) dan Total Kredit (${formatRupiah(totalCredit)}) harus sama seimbang (Selisih: ${formatRupiah(difference)})`);
      return;
    }

    const newEntry: JournalEntry = {
      id: initialEntry?.id || (isAdjusting ? `ajp-${Date.now()}` : `ju-${Date.now()}`),
      date,
      refNumber,
      description,
      isAdjusting,
      transactionType: isAdjusting ? 'GENERAL' : transactionType,
      counterparty: counterparty.trim() || undefined,
      createdAt: initialEntry?.createdAt || new Date().toISOString(),
      lines: lines.map(l => ({
        id: l.id,
        accountId: l.accountId,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        memo: l.memo || ''
      }))
    };

    onSave(newEntry);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {initialEntry ? 'Edit Entri Jurnal' : (isAdjusting ? 'Tambah Jurnal Penyesuaian (AJP)' : 'Tambah Jurnal Umum (JU)')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pastikan total Debit dan total Kredit seimbang sebelum menyimpan
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Adjustment Templates if isAdjusting */}
          {isAdjusting && (
            <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg">
              <span className="text-xs font-semibold text-amber-900 block mb-2">
                Template Cepat Kasus Penyesuaian:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('perlengkapan')}
                  className="px-2.5 py-1 text-xs bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Pemakaian Perlengkapan
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('penyusutan')}
                  className="px-2.5 py-1 text-xs bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Penyusutan Peralatan
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('sewa')}
                  className="px-2.5 py-1 text-xs bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Sewa Dibayar Dimuka
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('gaji')}
                  className="px-2.5 py-1 text-xs bg-white border border-amber-300 text-amber-900 rounded-md hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Beban Gaji Terutang
                </button>
              </div>
            </div>
          )}

          {/* Top Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                No. Bukti / Ref <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={e => setRefNumber(e.target.value)}
                placeholder="misal: JU-013 atau BKK-05"
                required
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Klasifikasi Transaksi
              </label>
              <select
                value={isAdjusting ? 'penyesuaian' : transactionType}
                onChange={e => {
                  if (e.target.value === 'penyesuaian') {
                    setIsAdjusting(true);
                  } else {
                    setIsAdjusting(false);
                    setTransactionType(e.target.value as any);
                  }
                }}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden bg-white"
              >
                <option value="GENERAL">Jurnal Umum Memorial (JU)</option>
                <option value="RECEIPT">Penerimaan Kas (BKM)</option>
                <option value="PAYMENT">Pembayaran Kas (BKK)</option>
                <option value="penyesuaian">Jurnal Penyesuaian (AJP)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Kontak / Pihak Terkait
              </label>
              <input
                type="text"
                value={counterparty}
                onChange={e => setCounterparty(e.target.value)}
                placeholder="Pelanggan / Vendor"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Keterangan Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Jelaskan transaksi secara ringkas dan informatif"
              required
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          {/* Lines Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">
                Baris Akun & Posisi Saldo
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-800 hover:text-black cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Baris Akun
              </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-left font-semibold w-1/3">Akun</th>
                    <th className="py-2 px-3 text-left font-semibold">Memo / Catatan</th>
                    <th className="py-2 px-3 text-right font-semibold w-28">Debit (Rp)</th>
                    <th className="py-2 px-3 text-right font-semibold w-28">Kredit (Rp)</th>
                    <th className="py-2 px-2 text-center font-semibold w-10">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, index) => (
                    <tr key={line.id} className="hover:bg-slate-50/70">
                      <td className="p-2">
                        <select
                          value={line.accountId}
                          onChange={e => handleLineChange(index, 'accountId', e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                        >
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                              {acc.code} - {acc.name} ({acc.normalBalance})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={line.memo || ''}
                          onChange={e => handleLineChange(index, 'memo', e.target.value)}
                          placeholder="Catatan baris (opsional)"
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-hidden"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={line.debit || ''}
                          onChange={e => handleLineChange(index, 'debit', e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1 text-xs font-mono text-right border border-slate-300 rounded focus:outline-hidden"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={line.credit || ''}
                          onChange={e => handleLineChange(index, 'credit', e.target.value)}
                          placeholder="0"
                          className="w-full px-2 py-1 text-xs font-mono text-right border border-slate-300 rounded focus:outline-hidden"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Hapus baris"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Total Footer */}
                <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right">
                      Total:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                      {formatRupiah(totalDebit)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900">
                      {formatRupiah(totalCredit)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Live Balance Status Card */}
          <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            isBalanced
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>
                {isBalanced
                  ? 'Entri Seimbang (Balance). Siap untuk disimpan.'
                  : `Entri Belum Seimbang! Selisih Debit - Kredit: ${formatRupiah(difference)}`}
              </span>
            </div>
            <div className="font-mono font-medium">
              Debit: {formatRupiah(totalDebit)} | Kredit: {formatRupiah(totalCredit)}
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-rose-600 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isBalanced}
              className={`min-h-[44px] px-5 py-2 text-xs font-semibold text-white rounded-lg transition-colors shadow-xs ${
                isBalanced
                  ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {initialEntry ? 'Simpan Perubahan' : 'Simpan Entri Jurnal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
