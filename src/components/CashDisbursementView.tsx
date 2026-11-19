import React, { useState } from 'react';
import { Account, CompanyProfile, JournalEntry } from '../types/accounting';
import { formatRupiah } from '../utils/accountingCalculations';
import { Plus, Search, ArrowUpRight, Printer, Trash2, Edit2, CheckCircle2, FileText } from 'lucide-react';

interface CashDisbursementViewProps {
  entries: JournalEntry[];
  accounts: Account[];
  company: CompanyProfile;
  onSaveDisbursement: (entry: JournalEntry) => void;
  onDeleteDisbursement: (id: string) => void;
  onEditDisbursement: (entry: JournalEntry) => void;
}

export const CashDisbursementView: React.FC<CashDisbursementViewProps> = ({
  entries,
  accounts,
  company,
  onSaveDisbursement,
  onDeleteDisbursement,
  onEditDisbursement
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form states
  const [date, setDate] = useState('2026-10-31');
  const [refNumber, setRefNumber] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [cashAccountId, setCashAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const accountMap = new Map<string, Account>();
  accounts.forEach(a => accountMap.set(a.id, a));

  // Cash / Bank accounts
  const cashAccounts = accounts.filter(a =>
    a.category === 'ASET_LANCAR' &&
    (a.name.toLowerCase().includes('kas') || a.name.toLowerCase().includes('bank'))
  );
  const defaultCashAcc = cashAccounts[0]?.id || accounts[0]?.id || '';

  // Accounts that typically receive debit in payment: Expenses, Accounts Payable, Assets, Prive
  const targetAccounts = accounts.filter(a =>
    ['BEBAN_OPERASIONAL', 'BEBAN_NON_OPERASIONAL', 'PRIVE', 'ASET_TETAP'].includes(a.category) ||
    a.code === '103' || a.code === '104' || a.name.toLowerCase().includes('perlengkapan') ||
    a.category === 'KEWAJIBAN_LANCAR' || a.category === 'KEWAJIBAN_JANGKA_PANJANG'
  );

  // Filter disbursement entries
  const paymentEntries = entries.filter(e => {
    if (e.isAdjusting) return false;
    // Marked as PAYMENT or has credit to cash and is not receipt
    if (e.transactionType === 'PAYMENT') return true;
    const hasCashCredit = e.lines.some(l => {
      const acc = accountMap.get(l.accountId);
      return acc && (acc.code === '101' || acc.name.toLowerCase().includes('kas')) && l.credit > 0;
    });
    return hasCashCredit && e.transactionType !== 'RECEIPT';
  }).sort((a, b) => a.date.localeCompare(b.date));

  const filteredPayments = paymentEntries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.counterparty && entry.counterparty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStart = !startDate || entry.date >= startDate;
    const matchesEnd = !endDate || entry.date <= endDate;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalPayments = filteredPayments.reduce((sum, e) => {
    const cashLine = e.lines.find(l => {
      const acc = accountMap.get(l.accountId);
      return acc && (acc.code === '101' || acc.name.toLowerCase().includes('kas'));
    });
    return sum + (cashLine ? cashLine.credit : e.lines[0]?.credit || 0);
  }, 0);

  const openAddModal = () => {
    setEditingEntry(null);
    setDate('2026-10-15');
    setRefNumber(`BKK-${Math.floor(100 + Math.random() * 900)}`);
    setCounterparty('');
    setCashAccountId(defaultCashAcc);
    setTargetAccountId(targetAccounts[0]?.id || accounts[1]?.id || '');
    setAmount('');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setDate(entry.date);
    setRefNumber(entry.refNumber);
    setCounterparty(entry.counterparty || '');
    setDescription(entry.description);

    const debitLine = entry.lines.find(l => l.debit > 0);
    const creditLine = entry.lines.find(l => l.credit > 0);

    setTargetAccountId(debitLine?.accountId || targetAccounts[0]?.id || '');
    setCashAccountId(creditLine?.accountId || defaultCashAcc);
    setAmount(creditLine ? creditLine.credit : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    if (!cashAccountId || !targetAccountId) return;
    if (!description.trim()) return;

    const paymentEntry: JournalEntry = {
      id: editingEntry?.id || `bkk-${Date.now()}`,
      date,
      refNumber,
      description,
      isAdjusting: false,
      transactionType: 'PAYMENT',
      counterparty: counterparty.trim() || undefined,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      lines: [
        {
          id: `line-d-${Date.now()}`,
          accountId: targetAccountId,
          debit: numAmount,
          credit: 0,
          memo: `Tujuan Pembayaran - ${description}`
        },
        {
          id: `line-c-${Date.now()}`,
          accountId: cashAccountId,
          debit: 0,
          credit: numAmount,
          memo: `Pengeluaran Kas Kepada - ${counterparty || description}`
        }
      ]
    };

    onSaveDisbursement(paymentEntry);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transaksi Pembayaran Kas (Cash Payments / BKK)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan pengeluaran kas dan transfer bank untuk beban, pelunasan utang, belanja perlengkapan, dan prive (tersinkronisasi ke Jurnal Umum)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Pembayaran Kas (BKK)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Bukti Kas Keluar (BKK)</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {filteredPayments.length} <span className="text-xs font-normal text-slate-500">transaksi</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Kas Dikeluarkan</span>
          <div className="text-xl font-bold text-rose-700 font-mono">
            {formatRupiah(totalPayments)}
          </div>
        </div>

        <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-rose-950">Sinkronisasi Jurnal Umum</span>
          </div>
          <p className="text-[11px] text-rose-900 leading-snug">
            Setiap pembayaran kas otomatis membuat entri Jurnal Umum: <strong>Debit Akun Beban/Kewajiban</strong> & <strong>Kredit Kas/Bank</strong>.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari BKK, dibayar kepada, atau uraian..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
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
          {(searchTerm || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 underline ml-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-3 w-28">No. BKK</th>
                <th className="py-3 px-3 w-24">Tanggal</th>
                <th className="py-3 px-4">Dibayar Kepada</th>
                <th className="py-3 px-4">Uraian Pembayaran</th>
                <th className="py-3 px-4">Akun Tujuan (Debit)</th>
                <th className="py-3 px-4">Akun Kas Asal (Kredit)</th>
                <th className="py-3 px-4 text-right w-36">Jumlah (Rp)</th>
                <th className="py-3 px-3 text-center w-20 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">Belum ada transaksi pembayaran kas</p>
                    <p className="text-xs text-slate-400 mt-1">Klik "+ Catat Pembayaran Kas (BKK)" untuk menambah</p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(entry => {
                  const debitLine = entry.lines.find(l => l.debit > 0);
                  const creditLine = entry.lines.find(l => l.credit > 0);
                  const targetAccount = debitLine ? accountMap.get(debitLine.accountId) : null;
                  const cashAccount = creditLine ? accountMap.get(creditLine.accountId) : null;
                  const nominal = creditLine?.credit || 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                          {entry.refNumber}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-mono">
                        {entry.date}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {entry.counterparty || '-'}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">
                        {entry.description}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">
                        <span className="font-mono text-slate-500 mr-1.5">{targetAccount?.code}</span>
                        <span>{targetAccount?.name || 'Beban/Utang'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">
                        <span className="font-mono text-slate-500 mr-1.5">{cashAccount?.code}</span>
                        <span>{cashAccount?.name || 'Kas'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-rose-700">
                        {formatRupiah(nominal)}
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Pembayaran"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDisbursement(entry.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Pembayaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredPayments.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider text-[11px]">
                    Total Pengeluaran Kas:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-rose-800">
                    {formatRupiah(totalPayments)}
                  </td>
                  <td className="no-print"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-700 text-xs">Belum ada pengeluaran kas</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Catat kas keluar lewat tombol di bawah</p>
          </div>
        ) : (
          filteredPayments.map(entry => {
            const debitLine = entry.lines.find(l => l.debit > 0);
            const creditLine = entry.lines.find(l => l.credit > 0);
            const targetAccount = debitLine ? accountMap.get(debitLine.accountId) : null;
            const cashAccount = creditLine ? accountMap.get(creditLine.accountId) : null;
            const nominal = creditLine?.credit || 0;

            return (
              <div 
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-rose-800">
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                    {entry.refNumber}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{entry.date}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {entry.counterparty || 'Pihak Penerima'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {entry.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Dibayar</span>
                    <span className="font-mono font-bold text-sm text-rose-700">
                      {formatRupiah(nominal)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tujuan / Beban:</span>
                    <span className="font-medium font-mono">{targetAccount?.name || 'Beban/Utang'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rekening Kas:</span>
                    <span className="font-medium font-mono">{cashAccount?.name || 'Kas'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1 pt-1">
                  <button
                    onClick={() => openEditModal(entry)}
                    className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Ubah</span>
                  </button>
                  <button
                    onClick={() => onDeleteDisbursement(entry.id)}
                    className="min-h-[40px] px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* Modal Add / Edit BKK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-rose-50/60">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="w-5 h-5 text-rose-700" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingEntry ? 'Edit Bukti Kas Keluar (BKK)' : 'Catat Pembayaran Kas Baru (BKK)'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    No. Bukti Kas Keluar (BKK) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={e => setRefNumber(e.target.value)}
                    required
                    placeholder="misal: BKK-007"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Pembayaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Dibayar Kepada (Vendor / Karyawan / Pihak Penerima) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={counterparty}
                  onChange={e => setCounterparty(e.target.value)}
                  required
                  placeholder="misal: PT Mesinindo / Teknisi Bengkel / PLN"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Akun Beban / Kewajiban / Tujuan (Debit) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={targetAccountId}
                    onChange={e => setTargetAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  >
                    {accounts.filter(a => a.id !== cashAccountId).map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Akun Kas / Rekening Pengeluar (Kredit) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={cashAccountId}
                    onChange={e => setCashAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  >
                    {cashAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Jumlah Nominal Dibayarkan (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1000"
                  value={amount}
                  onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  placeholder="0"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono text-base font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Uraian / Keterangan Pembayaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  placeholder="misal: Pembayaran cicilan utang peralatan ke PT Mesinindo"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Live Journal Entry Preview */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                  Pratinjau Sinkronisasi Jurnal Umum Otomatis:
                </span>
                <div className="font-mono text-[11px] space-y-1 text-slate-800">
                  <div className="flex justify-between">
                    <span>(D) {accountMap.get(targetAccountId)?.code} - {accountMap.get(targetAccountId)?.name}</span>
                    <span className="font-bold">{formatRupiah(Number(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-slate-700">
                    <span>(K) {accountMap.get(cashAccountId)?.code} - {accountMap.get(cashAccountId)?.name}</span>
                    <span className="font-bold">{formatRupiah(Number(amount) || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  {editingEntry ? 'Simpan Perubahan BKK' : 'Simpan & Sinkronkan ke Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
