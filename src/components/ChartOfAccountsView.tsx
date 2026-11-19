import React, { useState } from 'react';
import { Account, AccountCategory, NormalBalance } from '../types/accounting';
import { Search, Plus, Trash2, Edit2, X, FolderTree, Check } from 'lucide-react';

interface ChartOfAccountsViewProps {
  accounts: Account[];
  onAddAccount: (acc: Account) => void;
  onUpdateAccount: (acc: Account) => void;
  onDeleteAccount: (id: string) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  accounts,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<AccountCategory>('ASET_LANCAR');
  const [normalBalance, setNormalBalance] = useState<NormalBalance>('DEBIT');
  const [description, setDescription] = useState('');

  const openAddModal = () => {
    setEditingAccount(null);
    setCode('');
    setName('');
    setCategory('ASET_LANCAR');
    setNormalBalance('DEBIT');
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Account) => {
    setEditingAccount(acc);
    setCode(acc.code);
    setName(acc.name);
    setCategory(acc.category);
    setNormalBalance(acc.normalBalance);
    setDescription(acc.description || '');
    setIsModalOpen(true);
  };

  const handleCategoryChange = (cat: AccountCategory) => {
    setCategory(cat);
    // Auto set typical normal balance
    if (['ASET_LANCAR', 'ASET_TETAP', 'PRIVE', 'BEBAN_OPERASIONAL', 'BEBAN_NON_OPERASIONAL'].includes(cat)) {
      setNormalBalance('DEBIT');
    } else {
      setNormalBalance('KREDIT');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    if (editingAccount) {
      onUpdateAccount({
        ...editingAccount,
        code,
        name,
        category,
        normalBalance,
        description
      });
    } else {
      const newAcc: Account = {
        id: `acc-${Date.now()}`,
        code,
        name,
        category,
        normalBalance,
        initialBalance: 0,
        description
      };
      onAddAccount(newAcc);
    }
    setIsModalOpen(false);
  };

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.code.includes(searchTerm);
    const matchesCategory = categoryFilter === 'all' || acc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => a.code.localeCompare(b.code));

  const getCategoryLabel = (cat: AccountCategory) => {
    switch (cat) {
      case 'ASET_LANCAR': return 'Aset Lancar';
      case 'ASET_TETAP': return 'Aset Tetap';
      case 'AKUMULASI_PENYUSUTAN': return 'Akumulasi Penyusutan (Kontra)';
      case 'KEWAJIBAN_LANCAR': return 'Kewajiban Lancar';
      case 'KEWAJIBAN_JANGKA_PANJANG': return 'Kewajiban Jangka Panjang';
      case 'EKUITAS': return 'Ekuitas / Modal';
      case 'PRIVE': return 'Prive (Kontra Ekuitas)';
      case 'PENDAPATAN': return 'Pendapatan Usaha';
      case 'BEBAN_OPERASIONAL': return 'Beban Operasional';
      case 'BEBAN_NON_OPERASIONAL': return 'Beban Non-Operasional';
      case 'PENDAPATAN_NON_OPERASIONAL': return 'Pendapatan Lain-lain';
      default: return cat;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Bagan Akun (Chart of Accounts / COA)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar kode dan klasifikasi seluruh akun rekening pembukuan
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Baru</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 no-print">
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari nama atau nomor akun..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-600 shrink-0">Kategori:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
          >
            <option value="all">Semua Kategori ({accounts.length})</option>
            <option value="ASET_LANCAR">Aset Lancar</option>
            <option value="ASET_TETAP">Aset Tetap</option>
            <option value="AKUMULASI_PENYUSUTAN">Akumulasi Penyusutan</option>
            <option value="KEWAJIBAN_LANCAR">Kewajiban Lancar</option>
            <option value="EKUITAS">Ekuitas / Modal</option>
            <option value="PRIVE">Prive</option>
            <option value="PENDAPATAN">Pendapatan</option>
            <option value="BEBAN_OPERASIONAL">Beban Operasional</option>
          </select>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4 w-28 text-center">Kode Akun</th>
                <th className="py-2.5 px-4">Nama Akun</th>
                <th className="py-2.5 px-4">Klasifikasi / Kategori</th>
                <th className="py-2.5 px-4 text-center w-28">Saldo Normal</th>
                <th className="py-2.5 px-4">Keterangan</th>
                <th className="py-2.5 px-3 text-center w-20 no-print">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map(acc => (
                <tr key={acc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-900">
                    {acc.code}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                    {acc.name}
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">
                    {getCategoryLabel(acc.category)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium ${
                      acc.normalBalance === 'DEBIT'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {acc.normalBalance}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                    {acc.description || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center no-print">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(acc)}
                        className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Edit Akun"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteAccount(acc.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Akun"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900">
                {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kode Akun (e.g. 106, 506) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  required
                  placeholder="misal: 106"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Nama Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="misal: Asuransi Dibayar Dimuka"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Klasifikasi Kategori Akun
                </label>
                <select
                  value={category}
                  onChange={e => handleCategoryChange(e.target.value as AccountCategory)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                >
                  <option value="ASET_LANCAR">Aset Lancar (1-1xx)</option>
                  <option value="ASET_TETAP">Aset Tetap (1-2xx)</option>
                  <option value="AKUMULASI_PENYUSUTAN">Akumulasi Penyusutan (1-2xx)</option>
                  <option value="KEWAJIBAN_LANCAR">Kewajiban Lancar (2-1xx)</option>
                  <option value="KEWAJIBAN_JANGKA_PANJANG">Kewajiban Jangka Panjang (2-2xx)</option>
                  <option value="EKUITAS">Ekuitas / Modal (3-1xx)</option>
                  <option value="PRIVE">Prive Pemilik (3-2xx)</option>
                  <option value="PENDAPATAN">Pendapatan Usaha (4-1xx)</option>
                  <option value="PENDAPATAN_NON_OPERASIONAL">Pendapatan Non-Operasional (4-2xx)</option>
                  <option value="BEBAN_OPERASIONAL">Beban Operasional (5-1xx)</option>
                  <option value="BEBAN_NON_OPERASIONAL">Beban Non-Operasional (5-2xx)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Posisi Saldo Normal
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                    normalBalance === 'DEBIT' ? 'border-slate-900 bg-slate-50 font-semibold' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="normalBalance"
                      value="DEBIT"
                      checked={normalBalance === 'DEBIT'}
                      onChange={() => setNormalBalance('DEBIT')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span>DEBIT</span>
                  </label>
                  <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
                    normalBalance === 'KREDIT' ? 'border-slate-900 bg-slate-50 font-semibold' : 'border-slate-200'
                  }`}>
                    <input
                      type="radio"
                      name="normalBalance"
                      value="KREDIT"
                      checked={normalBalance === 'KREDIT'}
                      onChange={() => setNormalBalance('KREDIT')}
                      className="text-slate-900 focus:ring-slate-900"
                    />
                    <span>KREDIT</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Keterangan / Fungsi Akun
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Catatan peruntukan akun"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
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
                  {editingAccount ? 'Simpan Perubahan' : 'Tambah Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
