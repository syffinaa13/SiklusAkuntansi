import React, { useState } from 'react';
import { CompanyProfile, UserRole } from '../types/accounting';
import { Building2, Calendar, User, RotateCcw, Sparkles, Printer, Edit2, Check, X, ShieldAlert } from 'lucide-react';

interface CompanyBarProps {
  company: CompanyProfile;
  onUpdateCompany: (company: CompanyProfile) => void;
  onLoadSampleData: () => void;
  onResetData: () => void;
  isCycleBalanced: boolean;
  totalTransactions: number;
  totalAdjustments: number;
  userRole?: UserRole;
}

export const CompanyBar: React.FC<CompanyBarProps> = ({
  company,
  onUpdateCompany,
  onLoadSampleData,
  onResetData,
  isCycleBalanced,
  totalTransactions,
  totalAdjustments,
  userRole = 'ADMINISTRATOR'
}) => {
  const isOperator = userRole === 'OPERATOR';
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(company);

  const handleSave = () => {
    onUpdateCompany(formData);
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white border-b border-slate-200 py-3.5 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Desktop & Mobile Responsive Company Details */}
          {!isEditing ? (
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-x-6 text-xs text-slate-600">
              <div className="flex items-center justify-between md:justify-start gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-slate-700 shrink-0" />
                  <span className="font-bold text-slate-900 text-sm truncate">{company.name}</span>
                  {!isOperator && (
                    <button
                      onClick={() => {
                        setFormData(company);
                        setIsEditing(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                      title="Ubah info perusahaan (Administrator)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Mobile Balance Indicator Badge */}
                <span className={`md:hidden text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  isCycleBalanced ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isCycleBalanced ? 'Seimbang' : 'Perlu AJP'}
                </span>
              </div>

              {/* Company metadata chips */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] md:text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>Periode: <strong className="text-slate-800">{company.period}</strong></span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500">
                  <User className="w-3 h-3 text-slate-400" />
                  <span>Pemilik: <strong className="text-slate-800">{company.ownerName}</strong></span>
                </div>

                <div className="hidden md:flex items-center gap-2">
                  <span>{totalTransactions} Jurnal Umum</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>{totalAdjustments} Penyesuaian</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className={isCycleBalanced ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {isCycleBalanced ? 'Pembukuan Seimbang (Balance)' : 'Belum Seimbang'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nama Perusahaan"
                className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden w-full sm:w-auto"
              />
              <input
                type="text"
                value={formData.period}
                onChange={e => setFormData({ ...formData, period: e.target.value })}
                placeholder="Periode (e.g. Oktober 2026)"
                className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden w-full sm:w-auto"
              />
              <input
                type="text"
                value={formData.ownerName}
                onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                placeholder="Nama Pemilik"
                className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white focus:ring-1 focus:ring-slate-900 focus:outline-hidden w-full sm:w-auto"
              />
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <button
                  onClick={handleSave}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 cursor-pointer min-h-[34px]"
                >
                  <Check className="w-3 h-3" /> Simpan
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 cursor-pointer min-h-[34px]"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              </div>
            </div>
          )}

          {/* Quick Utility Actions */}
          <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0 border-t md:border-t-0 border-slate-100">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer min-h-[36px]"
              title="Cetak Halaman Saat Ini"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Cetak</span>
            </button>

            {!isOperator ? (
              <>
                <button
                  onClick={onLoadSampleData}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors cursor-pointer min-h-[36px]"
                  title="Muat data contoh siklus akuntansi lengkap (Administrator)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden xs:inline">Muat</span>
                  <span>Kasus</span>
                </button>

                <button
                  onClick={onResetData}
                  className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 transition-colors cursor-pointer min-h-[36px]"
                  title="Hapus semua entri transaksi dan mulai dari awal (Administrator)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reset</span>
                </button>
              </>
            ) : (
              <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-md flex items-center gap-1.5 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                <span className="hidden sm:inline">Akses:</span>
                <span className="font-semibold">Operator Kasir</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
