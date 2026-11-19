import React, { useState } from 'react';
import { Plus, Smartphone, Monitor, Menu, ShieldCheck, User, LogOut, Lock, ChevronDown, Download } from 'lucide-react';
import { UserSession } from '../types/accounting';
import { hasPermissionForTab } from '../utils/authData';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 
  | 'penerimaan_kas'
  | 'pembayaran_kas'
  | 'jurnal_umum' 
  | 'buku_besar' 
  | 'neraca_saldo' 
  | 'jurnal_penyesuaian' 
  | 'neraca_lajur' 
  | 'laporan_keuangan' 
  | 'bagan_akun';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: () => void;
  currentUser: UserSession;
  onLogout: () => void;
  isMobileSimulator?: boolean;
  onToggleMobileSimulator?: () => void;
  onOpenCycleMenu?: () => void;
  onOpenAndroidApkModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewTransaction,
  currentUser,
  onLogout,
  isMobileSimulator = false,
  onToggleMobileSimulator,
  onOpenCycleMenu,
  onOpenAndroidApkModal
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; label: string }[] = [
    { id: 'penerimaan_kas', label: 'Penerimaan' },
    { id: 'pembayaran_kas', label: 'Pembayaran' },
    { id: 'jurnal_umum', label: 'Jurnal Umum' },
    { id: 'buku_besar', label: 'Buku Besar' },
    { id: 'neraca_saldo', label: 'Neraca Saldo' },
    { id: 'jurnal_penyesuaian', label: 'Penyesuaian' },
    { id: 'neraca_lajur', label: 'Neraca Lajur' },
    { id: 'laporan_keuangan', label: 'Laporan Keuangan' },
    { id: 'bagan_akun', label: 'Bagan Akun' }
  ];

  const isOperator = currentUser.role === 'OPERATOR';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: Single text element wordmark + mobile menu toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onOpenCycleMenu && (
              <button
                onClick={onOpenCycleMenu}
                className="lg:hidden p-2 -ml-1 text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                aria-label="Buka Menu Siklus Akuntansi"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div 
              onClick={() => onSelectTab(isOperator ? 'penerimaan_kas' : 'jurnal_umum')}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                  SiklusAkun
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-0.5">
                  Siklus Akuntansi Komprehensif
                </span>
              </div>
            </div>
          </div>

          {/* Zone 2: Desktop Navigation Links */}
          {!isMobileSimulator && (
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
              {navItems.map(item => {
                const isActive = activeTab === item.id;
                const isAllowed = hasPermissionForTab(currentUser.role, item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : isAllowed
                          ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    }`}
                    title={!isAllowed ? 'Menu ini terkunci untuk peran Operator' : item.label}
                  >
                    {!isAllowed && <Lock className="w-3 h-3 text-amber-500" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Zone 3: Actions (User Profile Menu + Mobile Simulator + New Transaction) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User Account / Role Badge with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                title="Kelola sesi peran akun"
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 ${
                  isOperator ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                }`}>
                  {isOperator ? <User className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                </div>

                <div className="hidden sm:flex flex-col text-left">
                  <span className="font-semibold text-slate-800 text-[11px] leading-tight truncate max-w-[110px]">
                    {currentUser.username}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${
                    isOperator ? 'text-emerald-700' : 'text-slate-500'
                  }`}>
                    {isOperator ? 'Operator' : 'Admin'}
                  </span>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setIsUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-40 space-y-2.5 animate-in fade-in duration-150">
                    <div className="pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          isOperator ? 'bg-emerald-700 text-white' : 'bg-slate-900 text-white'
                        }`}>
                          {isOperator ? <User className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {currentUser.fullName}
                          </p>
                          <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded mt-0.5 ${
                            isOperator ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {isOperator ? 'Peran: Operator Kas' : 'Peran: Administrator'}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-2 leading-tight">
                        {isOperator
                          ? 'Wewenang: Hanya menginputkan transaksi Penerimaan & Pembayaran Kas.'
                          : 'Wewenang: Akses penuh ke seluruh modul, AJP, neraca lajur, dan laporan.'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar / Ganti Akun</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* PWA & Android APK Installation Button */}
            <PWAInstallButton
              onOpenAndroidModal={onOpenAndroidApkModal}
              variant="header"
            />

            {/* Device Mode Switcher for Desktop Browsers */}
            {onToggleMobileSimulator && (
              <button
                onClick={onToggleMobileSimulator}
                className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border transition-colors cursor-pointer min-h-[36px] ${
                  isMobileSimulator
                    ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
                title={isMobileSimulator ? 'Kembali ke tampilan layar penuh desktop' : 'Uji tampilan versi HP / Smartphone'}
              >
                {isMobileSimulator ? (
                  <>
                    <Monitor className="w-3.5 h-3.5 text-blue-700" />
                    <span>Layar Penuh</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5 text-slate-600" />
                    <span>Versi HP</span>
                  </>
                )}
              </button>
            )}

            {/* Quick Record Button */}
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer min-h-[36px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Entri Transaksi</span>
              <span className="sm:hidden">Entri</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
