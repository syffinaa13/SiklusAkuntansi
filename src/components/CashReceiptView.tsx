import React, { useState } from 'react';
import { Account, CompanyProfile, JournalEntry } from '../types/accounting';
import { formatRupiah } from '../utils/accountingCalculations';
import { Plus, Search, ArrowDownLeft, Printer, Trash2, Edit2, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

interface CashReceiptViewProps {
  entries: JournalEntry[];
  accounts: Account[];
  company: CompanyProfile;
  onSaveReceipt: (entry: JournalEntry) => void;
  onDeleteReceipt: (id: string) => void;
  onEditReceipt: (entry: JournalEntry) => void;
}

export const CashReceiptView: React.FC<CashReceiptViewProps> = ({
  entries,
  accounts,
  company,
  onSaveReceipt,
  onDeleteReceipt,
  onEditReceipt
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
  const [cashAccountId, setCashAccountId] = useState('');
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');

  const accountMap = new Map<string, Account>();
  accounts.forEach(a => accountMap.set(a.id, a));

  // Cash / Bank accounts (Assets category)
  const cashAccounts = accounts.filter(a =>
    a.category === 'ASET_LANCAR' &&
    (a.name.toLowerCase().includes('kas') || a.name.toLowerCase().includes('bank'))
  );
  const defaultCashAcc = cashAccounts[0]?.id || accounts[0]?.id || '';

  // Accounts that typically receive credit in receipt: Revenue, Accounts Receivable, Equity, Other Income
  const sourceAccounts = accounts.filter(a =>
    ['PENDAPATAN', 'PENDAPATAN_NON_OPERASIONAL', 'EKUITAS'].includes(a.category) ||
    a.code === '102' || a.name.toLowerCase().includes('piutang') ||
    a.category === 'KEWAJIBAN_LANCAR' || a.category === 'KEWAJIBAN_JANGKA_PANJANG'
  );

  // Filter receipt entries
  const receiptEntries = entries.filter(e => {
    if (e.isAdjusting) return false;
    // Marked as RECEIPT or has debit to cash and is not payment
    if (e.transactionType === 'RECEIPT') return true;
    const hasCashDebit = e.lines.some(l => {
      const acc = accountMap.get(l.accountId);
      return acc && (acc.code === '101' || acc.name.toLowerCase().includes('kas')) && l.debit > 0;
    });
    return hasCashDebit && e.transactionType !== 'PAYMENT';
  }).sort((a, b) => a.date.localeCompare(b.date));

  const filteredReceipts = receiptEntries.filter(entry => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.counterparty && entry.counterparty.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStart = !startDate || entry.date >= startDate;
    const matchesEnd = !endDate || entry.date <= endDate;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const totalReceipts = filteredReceipts.reduce((sum, e) => {
    // Total cash debit line
    const cashLine = e.lines.find(l => {
      const acc = accountMap.get(l.accountId);
      return acc && (acc.code === '101' || acc.name.toLowerCase().includes('kas'));
    });
    return sum + (cashLine ? cashLine.debit : e.lines[0]?.debit || 0);
  }, 0);

  const openAddModal = () => {
    setEditingEntry(null);
    setDate('2026-10-15');
    setRefNumber(`BKM-${Math.floor(100 + Math.random() * 900)}`);
    setCounterparty('');
    setCashAccountId(defaultCashAcc);
    setSourceAccountId(sourceAccounts[0]?.id || accounts[1]?.id || '');
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

    setCashAccountId(debitLine?.accountId || defaultCashAcc);
    setSourceAccountId(creditLine?.accountId || sourceAccounts[0]?.id || '');
    setAmount(debitLine ? debitLine.debit : '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) return;
    if (!cashAccountId || !sourceAccountId) return;
    if (!description.trim()) return;

    const receiptEntry: JournalEntry = {
      id: editingEntry?.id || `bkm-${Date.now()}`,
      date,
      refNumber,
      description,
      isAdjusting: false,
      transactionType: 'RECEIPT',
      counterparty: counterparty.trim() || undefined,
      createdAt: editingEntry?.createdAt || new Date().toISOString(),
      lines: [
        {
          id: `line-d-${Date.now()}`,
          accountId: cashAccountId,
          debit: numAmount,
          credit: 0,
          memo: `Penerimaan Kas - ${counterparty || description}`
        },
        {
          id: `line-c-${Date.now()}`,
          accountId: sourceAccountId,
          debit: 0,
          credit: numAmount,
          memo: `Sumber Penerimaan - ${description}`
        }
      ]
    };

    onSaveReceipt(receiptEntry);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transaksi Penerimaan Kas (Cash Receipts / BKM)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan kas dan transfer bank masuk dari pendapatan, pelunasan piutang, dan setoran modal (tersinkronisasi ke Jurnal Umum)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Penerimaan Kas (BKM)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Bukti Kas Masuk (BKM)</span>
          <div className="text-xl font-bold text-slate-900 font-mono">
            {filteredReceipts.length} <span className="text-xs font-normal text-slate-500">transaksi</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200">
          <span className="text-xs text-slate-500 block mb-1">Total Kas Diterima</span>
          <div className="text-xl font-bold text-emerald-700 font-mono">
            {formatRupiah(totalReceipts)}
          </div>
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-950">Sinkronisasi Jurnal Umum</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-snug">
            Setiap penerimaan kas otomatis membuat entri Jurnal Umum: <strong>Debit Kas/Bank</strong> & <strong>Kredit Akun Sumber</strong>.
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
            placeholder="Cari BKM, diterima dari, atau uraian..."
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
                <th className="py-3 px-3 w-28">No. BKM</th>
                <th className="py-3 px-3 w-24">Tanggal</th>
                <th className="py-3 px-4">Diterima Dari</th>
                <th className="py-3 px-4">Keterangan Penerimaan</th>
                <th className="py-3 px-4">Akun Kas (Debit)</th>
                <th className="py-3 px-4">Akun Sumber (Kredit)</th>
                <th className="py-3 px-4 text-right w-36">Jumlah (Rp)</th>
                <th className="py-3 px-3 text-center w-20 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-medium text-slate-600">Belum ada transaksi penerimaan kas</p>
                    <p className="text-xs text-slate-400 mt-1">Klik "+ Catat Penerimaan Kas (BKM)" untuk menambah</p>
                  </td>
                </tr>
              ) : (
                filteredReceipts.map(entry => {
                  const debitLine = entry.lines.find(l => l.debit > 0);
                  const creditLine = entry.lines.find(l => l.credit > 0);
                  const cashAccount = debitLine ? accountMap.get(debitLine.accountId) : null;
                  const sourceAccount = creditLine ? accountMap.get(creditLine.accountId) : null;
                  const nominal = debitLine?.debit || 0;

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        <span className="inline-flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
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
                        <span className="font-mono text-slate-500 mr-1.5">{cashAccount?.code}</span>
                        <span>{cashAccount?.name || 'Kas'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-800">
                        <span className="font-mono text-slate-500 mr-1.5">{sourceAccount?.code}</span>
                        <span>{sourceAccount?.name || 'Pendapatan'}</span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700">
                        {formatRupiah(nominal)}
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(entry)}
                            className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Penerimaan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteReceipt(entry.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Penerimaan"
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
            {filteredReceipts.length > 0 && (
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-300 text-slate-900">
                <tr>
                  <td colSpan={6} className="py-3 px-4 text-right uppercase tracking-wider text-[11px]">
                    Total Penerimaan Kas:
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-xs text-emerald-800">
                    {formatRupiah(totalReceipts)}
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
        {filteredReceipts.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-slate-700 text-xs">Belum ada penerimaan kas</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Catat kas masuk lewat tombol di bawah</p>
          </div>
        ) : (
          filteredReceipts.map(entry => {
            const debitLine = entry.lines.find(l => l.debit > 0);
            const creditLine = entry.lines.find(l => l.credit > 0);
            const cashAccount = debitLine ? accountMap.get(debitLine.accountId) : null;
            const sourceAccount = creditLine ? accountMap.get(creditLine.accountId) : null;
            const nominal = debitLine?.debit || 0;

            return (
              <div 
                key={entry.id}
                className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-emerald-800">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    {entry.refNumber}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">{entry.date}</span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {entry.counterparty || 'Pelanggan'}
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                      {entry.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">Diterima</span>
                    <span className="font-mono font-bold text-sm text-emerald-700">
                      {formatRupiah(nominal)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 text-[11px] text-slate-700 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rekening Kas:</span>
                    <span className="font-medium font-mono">{cashAccount?.name || 'Kas'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sumber:</span>
                    <span className="font-medium font-mono">{sourceAccount?.name || 'Pendapatan'}</span>
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
                    onClick={() => onDeleteReceipt(entry.id)}
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


      {/* Modal Add / Edit BKM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-50/60">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-700" />
                <h2 className="text-base font-bold text-slate-900">
                  {editingEntry ? 'Edit Bukti Kas Masuk (BKM)' : 'Catat Penerimaan Kas Baru (BKM)'}
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
                    No. Bukti Kas Masuk (BKM) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={refNumber}
                    onChange={e => setRefNumber(e.target.value)}
                    required
                    placeholder="misal: BKM-005"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tanggal Transaksi <span className="text-rose-500">*</span>
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
                  Diterima Dari (Pelanggan / Pihak Pembayar) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={counterparty}
                  onChange={e => setCounterparty(e.target.value)}
                  required
                  placeholder="misal: PT Logistik Prima / Pelanggan Tunai"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Akun Kas / Rekening Penerima (Debit) <span className="text-rose-500">*</span>
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

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Akun Sumber Penerimaan (Kredit) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={sourceAccountId}
                    onChange={e => setSourceAccountId(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  >
                    {accounts.filter(a => a.id !== cashAccountId).map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.code} - {acc.name} ({acc.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Jumlah Nominal Diterima (Rp) <span className="text-rose-500">*</span>
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
                  Uraian / Keterangan Transaksi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                  placeholder="misal: Penerimaan pelunasan tagihan servis invoice #012"
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
                    <span>(D) {accountMap.get(cashAccountId)?.code} - {accountMap.get(cashAccountId)?.name}</span>
                    <span className="font-bold">{formatRupiah(Number(amount) || 0)}</span>
                  </div>
                  <div className="flex justify-between pl-4 text-slate-700">
                    <span>(K) {accountMap.get(sourceAccountId)?.code} - {accountMap.get(sourceAccountId)?.name}</span>
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
                  {editingEntry ? 'Simpan Perubahan BKM' : 'Simpan & Sinkronkan ke Jurnal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
