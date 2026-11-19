import React from 'react';
import { ActiveTab } from './Header';
import { Lock, ArrowDownLeft, ArrowUpRight, LogOut, ShieldCheck } from 'lucide-react';
import { UserSession } from '../types/accounting';

interface AccessDeniedViewProps {
  currentUser: UserSession;
  attemptedTab: ActiveTab;
  onNavigateToAllowed: (tab: ActiveTab) => void;
  onSwitchUser: () => void;
}

const TAB_TITLES: Record<ActiveTab, string> = {
  penerimaan_kas: 'Penerimaan Kas (BKM)',
  pembayaran_kas: 'Pembayaran Kas (BKK)',
  jurnal_umum: 'Jurnal Umum (General Journal)',
  buku_besar: 'Buku Besar (General Ledger)',
  neraca_saldo: 'Neraca Saldo',
  jurnal_penyesuaian: 'Jurnal Penyesuaian (AJP)',
  neraca_lajur: 'Neraca Lajur 10 Kolom',
  laporan_keuangan: 'Laporan Keuangan',
  bagan_akun: 'Bagan Akun (Chart of Accounts)'
};

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  currentUser,
  attemptedTab,
  onNavigateToAllowed,
  onSwitchUser
}) => {
  return (
    <div className="max-w-lg mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-center shadow-lg animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-4 shadow-inner">
        <Lock className="w-8 h-8" />
      </div>

      <span className="inline-block px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold uppercase tracking-wider mb-2">
        Akses Dibatasi (RBAC)
      </span>

      <h2 className="text-lg font-bold text-slate-900">
        Menu "{TAB_TITLES[attemptedTab] || attemptedTab}" Terkunci
      </h2>

      <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-sm mx-auto">
        Anda saat ini masuk sebagai <strong>{currentUser.fullName} ({currentUser.role})</strong>.
        Berdasarkan kebijakan hak akses, peran <strong>Operator</strong> hanya diberikan wewenang untuk memproses dan menginputkan menu <strong>Penerimaan Kas (BKM)</strong> dan <strong>Pembayaran Kas (BKK)</strong>.
      </p>

      {/* Allowed Actions for Operator */}
      <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-2.5 justify-center">
        <button
          onClick={() => onNavigateToAllowed('penerimaan_kas')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs min-h-[42px]"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Ke Penerimaan Kas</span>
        </button>

        <button
          onClick={() => onNavigateToAllowed('pembayaran_kas')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs min-h-[42px]"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Ke Pembayaran Kas</span>
        </button>
      </div>

      {/* Switch to Admin */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={onSwitchUser}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-slate-700" />
          <span>Beralih Akun ke Administrator untuk Akses Penuh</span>
        </button>
      </div>
    </div>
  );
};
