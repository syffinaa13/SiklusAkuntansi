import React from 'react';
import { ActiveTab } from './Header';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  BookOpen, 
  BarChart3, 
  MoreHorizontal,
  Plus
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenQuickMenu: () => void;
  onOpenNewTransaction: () => void;
  isSimulator?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickMenu,
  onOpenNewTransaction,
  isSimulator = false
}) => {
  const isMoreActive = [
    'buku_besar',
    'neraca_saldo',
    'jurnal_penyesuaian',
    'neraca_lajur',
    'bagan_akun'
  ].includes(activeTab);

  return (
    <div className={`${isSimulator ? 'block fixed bottom-0 max-w-md mx-auto left-0 right-0' : 'lg:hidden fixed bottom-0 left-0 right-0'} z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 no-print pb-safe shadow-lg`}>
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-1">
        {/* Tab 1: Penerimaan */}
        <button
          onClick={() => onSelectTab('penerimaan_kas')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 cursor-pointer transition-colors ${
            activeTab === 'penerimaan_kas' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'penerimaan_kas' ? 'bg-emerald-100 text-emerald-800' : ''}`}>
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Kas Masuk</span>
        </button>

        {/* Tab 2: Pembayaran */}
        <button
          onClick={() => onSelectTab('pembayaran_kas')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 cursor-pointer transition-colors ${
            activeTab === 'pembayaran_kas' ? 'text-rose-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'pembayaran_kas' ? 'bg-rose-100 text-rose-800' : ''}`}>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Kas Keluar</span>
        </button>

        {/* Center: Quick Action Button (FAB) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={onOpenNewTransaction}
            className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/25 active:scale-95 transition-transform cursor-pointer border-2 border-white"
            aria-label="Catat Transaksi Baru"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Tab 3: Jurnal Umum */}
        <button
          onClick={() => onSelectTab('jurnal_umum')}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 cursor-pointer transition-colors ${
            activeTab === 'jurnal_umum' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1 rounded-full ${activeTab === 'jurnal_umum' ? 'bg-slate-200 text-slate-900' : ''}`}>
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Jurnal</span>
        </button>

        {/* Tab 4: Laporan & Siklus Lebih Banyak */}
        <button
          onClick={onOpenQuickMenu}
          className={`flex flex-col items-center justify-center min-h-[44px] py-1 cursor-pointer transition-colors ${
            isMoreActive || activeTab === 'laporan_keuangan' ? 'text-slate-900 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className={`p-1 rounded-full ${isMoreActive || activeTab === 'laporan_keuangan' ? 'bg-slate-200 text-slate-900' : ''}`}>
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Menu Siklus</span>
        </button>
      </div>
    </div>
  );
};
