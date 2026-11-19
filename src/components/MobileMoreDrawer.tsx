import React from 'react';
import { ActiveTab } from './Header';
import { 
  X, 
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen, 
  Scale, 
  FileCheck2, 
  Table2, 
  BarChart3, 
  FolderTree, 
  Sparkles, 
  RotateCcw, 
  Printer, 
  Building2,
  Lock,
  LogOut,
  ShieldCheck,
  User,
  Smartphone,
  Download
} from 'lucide-react';
import { CompanyProfile, UserSession } from '../types/accounting';
import { hasPermissionForTab } from '../utils/authData';

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  company: CompanyProfile;
  isCycleBalanced: boolean;
  onLoadSampleData: () => void;
  onResetData: () => void;
  isSimulator?: boolean;
  currentUser?: UserSession;
  onLogout?: () => void;
  onOpenAndroidApkModal?: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  company,
  isCycleBalanced,
  onLoadSampleData,
  onResetData,
  isSimulator = false,
  currentUser,
  onLogout,
  onOpenAndroidApkModal
}) => {
  if (!isOpen) return null;

  const userRole = currentUser?.role || 'ADMINISTRATOR';
  const isOperator = userRole === 'OPERATOR';

  const cycleMenuItems: { id: ActiveTab; step: string; label: string; desc: string; icon: React.ReactNode }[] = [
    { 
      id: 'penerimaan_kas', 
      step: '1', 
      label: 'Penerimaan Kas (BKM)', 
      desc: 'Transaksi kas masuk & pendapatan usaha', 
      icon: <ArrowDownLeft className="w-5 h-5 text-emerald-700" /> 
    },
    { 
      id: 'pembayaran_kas', 
      step: '2', 
      label: 'Pembayaran Kas (BKK)', 
      desc: 'Transaksi kas keluar, beban, dan pembelian tunai', 
      icon: <ArrowUpRight className="w-5 h-5 text-rose-700" /> 
    },
    { 
      id: 'jurnal_umum', 
      step: '3', 
      label: 'Jurnal Umum (General Journal)', 
      desc: 'Pusat pencatatan kronologis Debit & Kredit', 
      icon: <BookOpen className="w-5 h-5 text-slate-800" /> 
    },
    { 
      id: 'buku_besar', 
      step: '4', 
      label: 'Buku Besar (General Ledger)', 
      desc: 'Kartu saldo 4-kolom saldo berjalan per akun', 
      icon: <BookOpen className="w-5 h-5 text-blue-700" /> 
    },
    { 
      id: 'neraca_saldo', 
      step: '5', 
      label: 'Neraca Saldo (Trial Balance)', 
      desc: 'Verifikasi keseimbangan saldo sebelum penyesuaian', 
      icon: <Scale className="w-5 h-5 text-blue-800" /> 
    },
    { 
      id: 'jurnal_penyesuaian', 
      step: '6', 
      label: 'Jurnal Penyesuaian (AJP)', 
      desc: 'Penyesuaian akhir periode akrual, beban, & penyusutan', 
      icon: <FileCheck2 className="w-5 h-5 text-amber-700" /> 
    },
    { 
      id: 'neraca_lajur', 
      step: '7', 
      label: 'Neraca Lajur 10 Kolom', 
      desc: 'Kertas kerja akuntansi lengkap dan terintegrasi', 
      icon: <Table2 className="w-5 h-5 text-indigo-700" /> 
    },
    { 
      id: 'laporan_keuangan', 
      step: '8', 
      label: 'Laporan Keuangan', 
      desc: 'Laba Rugi, Perubahan Modal, Neraca, & Arus Kas', 
      icon: <BarChart3 className="w-5 h-5 text-emerald-700" /> 
    },
    { 
      id: 'bagan_akun', 
      step: 'COA', 
      label: 'Bagan Akun (Chart of Accounts)', 
      desc: 'Kelola kode rekening dan saldo normal akun', 
      icon: <FolderTree className="w-5 h-5 text-slate-700" /> 
    }
  ];

  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs ${isSimulator ? '' : 'lg:hidden'} animate-in fade-in duration-200`}>
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className={`relative bg-white rounded-t-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl z-10 animate-in slide-in-from-bottom duration-250 ${isSimulator ? 'max-w-md mx-auto w-full' : ''}`}>
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center cursor-pointer" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
        </div>

        {/* Drawer Header */}
        <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h3 className="font-bold text-sm text-slate-900">{company.name}</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>Periode: {company.period}</span>
              <span>·</span>
              <span className={isCycleBalanced ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                {isCycleBalanced ? 'Seimbang' : 'Perlu Penyesuaian'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-800 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card inside Drawer */}
        {currentUser && (
          <div className="mx-4 mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                isOperator ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
              }`}>
                {isOperator ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div>
                <p className="font-bold text-xs text-slate-900 leading-tight">
                  {currentUser.fullName}
                </p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${
                  isOperator ? 'text-emerald-700' : 'text-slate-500'
                }`}>
                  Peran: {isOperator ? 'Operator Kas (BKM/BKK)' : 'Administrator (Penuh)'}
                </span>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[11px]">Keluar</span>
              </button>
            )}
          </div>
        )}

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2 mb-1">
            Daftar Modul Siklus Akuntansi:
          </span>

          {cycleMenuItems.map(item => {
            const isActive = activeTab === item.id;
            const isAllowed = hasPermissionForTab(userRole, item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors cursor-pointer min-h-[52px] ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold shadow-xs'
                    : isAllowed
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                      : 'bg-slate-50/50 hover:bg-slate-100 text-slate-400'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${isActive ? 'bg-white/10 text-white' : 'bg-white shadow-2xs'}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold truncate ${!isAllowed && !isActive ? 'text-slate-500' : ''}`}>
                      {item.label}
                    </span>
                    {!isAllowed && (
                      <span className="flex items-center gap-0.5 text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">
                        <Lock className="w-2.5 h-2.5" /> Terkunci
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.step}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    {item.desc}
                  </p>
                </div>
              </button>
            );
          })}

          {/* Quick Tools & Case Studies */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-2">
              Aksi & Dokumen:
            </span>

            {/* Android APK & PWA Button */}
            {onOpenAndroidApkModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAndroidApkModal();
                }}
                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm min-h-[46px]"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5">
                      <span>Pasang / Unduh APK Android</span>
                      <span className="px-1.5 py-0.2 bg-white/20 rounded text-[9px] font-bold">APK</span>
                    </div>
                    <p className="text-[10px] text-emerald-100 font-normal">
                      Install WebAPK langsung di layar HP Android
                    </p>
                  </div>
                </div>
                <Download className="w-4 h-4 text-white/80" />
              </button>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  window.print();
                  onClose();
                }}
                className="flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>Cetak / PDF</span>
              </button>

              {!isOperator ? (
                <button
                  onClick={() => {
                    onLoadSampleData();
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 p-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold cursor-pointer min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Muat Kasus</span>
                </button>
              ) : (
                <div className="flex items-center justify-center gap-1.5 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Kasir BKM/BKK</span>
                </div>
              )}
            </div>

            {!isOperator && (
              <button
                onClick={() => {
                  onResetData();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 p-2.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl text-xs font-medium cursor-pointer min-h-[44px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Data Pembukuan (Admin)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
