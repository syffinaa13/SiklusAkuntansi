import React, { useState, useEffect } from 'react';
import { Account, CompanyProfile, JournalEntry } from './types/accounting';
import {
  DEFAULT_ACCOUNTS,
  DEFAULT_ADJUSTING_ENTRIES,
  DEFAULT_COMPANY,
  DEFAULT_GENERAL_ENTRIES
} from './utils/sampleData';
import { calculateWorksheet } from './utils/accountingCalculations';
import { Header, ActiveTab } from './components/Header';
import { CompanyBar } from './components/CompanyBar';
import { CashReceiptView } from './components/CashReceiptView';
import { CashDisbursementView } from './components/CashDisbursementView';
import { GeneralJournalView } from './components/GeneralJournalView';
import { GeneralLedgerView } from './components/GeneralLedgerView';
import { TrialBalanceView } from './components/TrialBalanceView';
import { AdjustingJournalView } from './components/AdjustingJournalView';
import { WorksheetView } from './components/WorksheetView';
import { FinancialStatementsView } from './components/FinancialStatementsView';
import { ChartOfAccountsView } from './components/ChartOfAccountsView';
import { JournalModal } from './components/JournalModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMoreDrawer } from './components/MobileMoreDrawer';
import { MobileCycleBar } from './components/MobileCycleBar';
import { LoginView } from './components/LoginView';
import { AccessDeniedView } from './components/AccessDeniedView';
import { AndroidApkModal } from './components/AndroidApkModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { UserSession } from './types/accounting';
import { DEMO_ACCOUNTS, hasPermissionForTab } from './utils/authData';
import { usePWAInstall } from './utils/usePWAInstall';
import { ChevronRight, Layers, Smartphone, Sparkles, Lock } from 'lucide-react';

const STORAGE_KEYS = {
  ACCOUNTS: 'siklus_akun_accounts_v1',
  ENTRIES: 'siklus_akun_entries_v1',
  COMPANY: 'siklus_akun_company_v1',
  SESSION: 'siklus_akun_session_v1'
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
      return saved ? JSON.parse(saved) : DEMO_ACCOUNTS[0].user;
    } catch {
      return DEMO_ACCOUNTS[0].user;
    }
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const savedUser = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SESSION);
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    })();
    return savedUser?.role === 'OPERATOR' ? 'penerimaan_kas' : 'jurnal_umum';
  });

  const [isMobileMoreOpen, setIsMobileMoreOpen] = useState(false);
  const [isMobileSimulator, setIsMobileSimulator] = useState(false);
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  // Load from localStorage or use defaults
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    } catch {
      return DEFAULT_ACCOUNTS;
    }
  });

  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENTRIES);
      return saved ? JSON.parse(saved) : [...DEFAULT_GENERAL_ENTRIES, ...DEFAULT_ADJUSTING_ENTRIES];
    } catch {
      return [...DEFAULT_GENERAL_ENTRIES, ...DEFAULT_ADJUSTING_ENTRIES];
    }
  });

  const [company, setCompany] = useState<CompanyProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
      return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
    } catch {
      return DEFAULT_COMPANY;
    }
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }, [accounts]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
    } catch (e) {
      console.error(e);
    }
  }, [entries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
    } catch (e) {
      console.error(e);
    }
  }, [company]);

  // Sync user session
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isAdjustingDefault, setIsAdjustingDefault] = useState(false);

  // Cycle balancing check
  const generalEntries = entries.filter(e => !e.isAdjusting);
  const adjustingEntries = entries.filter(e => e.isAdjusting);
  const worksheet = calculateWorksheet(accounts, generalEntries, adjustingEntries);
  const isCycleBalanced = worksheet.isTrialBalanced && worksheet.isAdjBalanced && worksheet.isAdjTrialBalanced;

  // Actions
  const handleOpenAddModal = (forAdjustment = false) => {
    if (currentUser?.role === 'OPERATOR') {
      // Operator restricted from adjustments
      setEditingEntry(null);
      setIsAdjustingDefault(false);
      setIsModalOpen(true);
      return;
    }
    setEditingEntry(null);
    setIsAdjustingDefault(forAdjustment);
    setIsModalOpen(true);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsAdjustingDefault(entry.isAdjusting);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (entry: JournalEntry) => {
    setEntries(prev => {
      const existingIdx = prev.findIndex(e => e.id === entry.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = entry;
        return copy;
      }
      return [...prev, entry];
    });
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus entri transaksi ini? Data di Jurnal Umum dan Buku Besar akan terbarui secara otomatis.')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleLoadSampleData = () => {
    if (currentUser?.role !== 'ADMINISTRATOR') {
      alert('Hanya Administrator yang memiliki wewenang untuk memuat data sampel.');
      return;
    }
    if (confirm('Muat ulang contoh data kasus siklus akuntansi lengkap?')) {
      setAccounts(DEFAULT_ACCOUNTS);
      setEntries([...DEFAULT_GENERAL_ENTRIES, ...DEFAULT_ADJUSTING_ENTRIES]);
      setCompany(DEFAULT_COMPANY);
    }
  };

  const handleResetData = () => {
    if (currentUser?.role !== 'ADMINISTRATOR') {
      alert('Hanya Administrator yang memiliki wewenang untuk mereset pembukuan.');
      return;
    }
    if (confirm('Hapus semua transaksi dan mulai pembukuan baru yang bersih? Bagan akun dasar akan tetap dipertahankan.')) {
      setEntries([]);
      setCompany({
        name: 'Perusahaan Saya',
        period: 'Oktober 2026',
        ownerName: 'Pemilik Usaha'
      });
    }
  };

  // COA actions
  const handleAddAccount = (newAcc: Account) => {
    if (currentUser?.role !== 'ADMINISTRATOR') return;
    setAccounts(prev => [...prev, newAcc]);
  };

  const handleUpdateAccount = (updatedAcc: Account) => {
    if (currentUser?.role !== 'ADMINISTRATOR') return;
    setAccounts(prev => prev.map(a => a.id === updatedAcc.id ? updatedAcc : a));
  };

  const handleDeleteAccount = (id: string) => {
    if (currentUser?.role !== 'ADMINISTRATOR') return;
    const isUsed = entries.some(e => e.lines.some(l => l.accountId === id));
    if (isUsed) {
      alert('Akun ini sedang digunakan dalam transaksi jurnal dan tidak dapat dihapus.');
      return;
    }
    if (confirm('Hapus akun ini dari bagan akun?')) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  // Accounting steps for workflow banner (Updated with Penerimaan & Pembayaran)
  const cycleSteps: { id: ActiveTab; step: string; title: string }[] = [
    { id: 'penerimaan_kas', step: '1', title: 'Penerimaan Kas' },
    { id: 'pembayaran_kas', step: '2', title: 'Pembayaran Kas' },
    { id: 'jurnal_umum', step: '3', title: 'Jurnal Umum' },
    { id: 'buku_besar', step: '4', title: 'Buku Besar' },
    { id: 'neraca_saldo', step: '5', title: 'Neraca Saldo' },
    { id: 'jurnal_penyesuaian', step: '6', title: 'Penyesuaian' },
    { id: 'neraca_lajur', step: '7', title: 'Neraca Lajur' },
    { id: 'laporan_keuangan', step: '8', title: 'Laporan Keuangan' }
  ];

  // If user is logged out, show LoginView
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'OPERATOR') {
            setActiveTab('penerimaan_kas');
          } else {
            setActiveTab('jurnal_umum');
          }
        }}
      />
    );
  }

  const isTabAllowed = hasPermissionForTab(currentUser.role, activeTab);

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 ${isMobileSimulator ? 'py-2 md:py-6' : ''}`}>
      {/* Mobile Simulator Mode Banner if active on desktop */}
      {isMobileSimulator && (
        <div className="hidden md:flex max-w-md mx-auto mb-2 items-center justify-between text-xs bg-slate-900 text-white px-4 py-2 rounded-xl shadow-md no-print w-full">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">Simulasi Layar HP Aktif (Lebar 420px)</span>
          </div>
          <button
            onClick={() => setIsMobileSimulator(false)}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded cursor-pointer text-slate-300 hover:text-white"
          >
            Layar Penuh ✕
          </button>
        </div>
      )}

      {/* Frame Container */}
      <div className={`flex flex-col flex-1 bg-slate-50 ${isMobileSimulator ? 'max-w-md mx-auto w-full shadow-2xl rounded-2xl md:border md:border-slate-300 overflow-hidden relative min-h-[844px]' : 'w-full'}`}>
        {/* 1. Header with RBAC User Profile */}
        <Header
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenNewTransaction={() => handleOpenAddModal(activeTab === 'jurnal_penyesuaian')}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          isMobileSimulator={isMobileSimulator}
          onToggleMobileSimulator={() => setIsMobileSimulator(!isMobileSimulator)}
          onOpenCycleMenu={() => setIsMobileMoreOpen(true)}
          onOpenAndroidApkModal={() => setIsAndroidApkModalOpen(true)}
        />

        {/* 2. Company Bar & Utilities with Role Enforcement */}
        <CompanyBar
          company={company}
          onUpdateCompany={setCompany}
          onLoadSampleData={handleLoadSampleData}
          onResetData={handleResetData}
          isCycleBalanced={isCycleBalanced}
          totalTransactions={generalEntries.length}
          totalAdjustments={adjustingEntries.length}
          userRole={currentUser.role}
        />

        {/* 3. Mobile Accounting Cycle Bar (Touch Stepper) */}
        <div className={isMobileSimulator ? 'block' : 'lg:hidden'}>
          <MobileCycleBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            userRole={currentUser.role}
          />
        </div>

        {/* 4. Desktop Accounting Cycle Steps Navigator with Lock Badges */}
        {!isMobileSimulator && (
          <div className="hidden lg:block bg-slate-100/70 border-b border-slate-200 py-2.5 px-4 no-print overflow-x-auto">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 min-w-[850px]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Alur Siklus Akuntansi:</span>
              </div>
              
              <div className="flex items-center gap-1 flex-1 max-w-5xl justify-center">
                {cycleSteps.map((stepItem, index) => {
                  const isActive = activeTab === stepItem.id;
                  const isAllowed = hasPermissionForTab(currentUser.role, stepItem.id);

                  return (
                    <React.Fragment key={stepItem.id}>
                      <button
                        onClick={() => setActiveTab(stepItem.id)}
                        className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-white font-bold text-slate-900 shadow-2xs border border-slate-200'
                            : isAllowed
                              ? 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                              : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={!isAllowed ? 'Menu ini terkunci untuk peran Operator' : stepItem.title}
                      >
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                          isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {stepItem.step}
                        </span>
                        {!isAllowed && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
                        <span>{stepItem.title}</span>
                      </button>
                      {index < cycleSteps.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <button
                onClick={() => setActiveTab('bagan_akun')}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors cursor-pointer ${
                  activeTab === 'bagan_akun' 
                    ? 'bg-white font-bold text-slate-900 border border-slate-200' 
                    : currentUser.role === 'OPERATOR'
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
                title={currentUser.role === 'OPERATOR' ? 'Menu COA terkunci untuk peran Operator' : 'Bagan Akun'}
              >
                {currentUser.role === 'OPERATOR' && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                <span>Bagan Akun (COA)</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Main Body with Permission Protection */}
        <main className={`flex-1 ${isMobileSimulator ? 'w-full px-3 py-4 pb-24' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-8'}`}>
          {!isTabAllowed ? (
            <AccessDeniedView
              currentUser={currentUser}
              attemptedTab={activeTab}
              onNavigateToAllowed={(tab) => setActiveTab(tab)}
              onSwitchUser={() => setCurrentUser(null)}
            />
          ) : (
            <>
        {activeTab === 'penerimaan_kas' && (
          <CashReceiptView
            entries={entries}
            accounts={accounts}
            company={company}
            onSaveReceipt={handleSaveEntry}
            onDeleteReceipt={handleDeleteEntry}
            onEditReceipt={handleEditEntry}
          />
        )}

        {activeTab === 'pembayaran_kas' && (
          <CashDisbursementView
            entries={entries}
            accounts={accounts}
            company={company}
            onSaveDisbursement={handleSaveEntry}
            onDeleteDisbursement={handleDeleteEntry}
            onEditDisbursement={handleEditEntry}
          />
        )}

        {activeTab === 'jurnal_umum' && (
          <GeneralJournalView
            entries={entries}
            accounts={accounts}
            onOpenAddModal={() => handleOpenAddModal(false)}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {activeTab === 'buku_besar' && (
          <GeneralLedgerView
            accounts={accounts}
            generalEntries={generalEntries}
            adjustingEntries={adjustingEntries}
          />
        )}

        {activeTab === 'neraca_saldo' && (
          <TrialBalanceView
            company={company}
            accounts={accounts}
            generalEntries={generalEntries}
          />
        )}

        {activeTab === 'jurnal_penyesuaian' && (
          <AdjustingJournalView
            entries={entries}
            accounts={accounts}
            onOpenAddModal={() => handleOpenAddModal(true)}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onApplyQuickTemplate={() => handleOpenAddModal(true)}
          />
        )}

        {activeTab === 'neraca_lajur' && (
          <WorksheetView
            company={company}
            accounts={accounts}
            generalEntries={generalEntries}
            adjustingEntries={adjustingEntries}
          />
        )}

        {activeTab === 'laporan_keuangan' && (
          <FinancialStatementsView
            company={company}
            accounts={accounts}
            generalEntries={generalEntries}
            adjustingEntries={adjustingEntries}
          />
        )}

        {activeTab === 'bagan_akun' && (
          <ChartOfAccountsView
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
          </>
        )}
      </main>

        {/* 6. Clean Editorial Footer (Desktop only, mobile uses MobileBottomNav) */}
        {!isMobileSimulator && (
          <footer className="hidden lg:block bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">SiklusAkun</span>
                <span aria-hidden="true">·</span>
                <span>Aplikasi Siklus Akuntansi Terpadu (Penerimaan, Pembayaran, Jurnal, Buku Besar, Neraca Lajur, Laporan Keuangan)</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span>Penerimaan Kas</span>
                <span aria-hidden="true">·</span>
                <span>Pembayaran Kas</span>
                <span aria-hidden="true">·</span>
                <span>Jurnal Umum</span>
                <span aria-hidden="true">·</span>
                <span>Buku Besar</span>
                <span aria-hidden="true">·</span>
                <span>Neraca Saldo</span>
                <span aria-hidden="true">·</span>
                <span>AJP</span>
                <span aria-hidden="true">·</span>
                <span>Neraca Lajur 10 Kolom</span>
                <span aria-hidden="true">·</span>
                <span>Laporan Keuangan</span>
              </div>
            </div>
          </footer>
        )}

        {/* 7. Mobile Bottom Navigation Bar (Thumb-Zone Navigation) */}
        <MobileBottomNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenQuickMenu={() => setIsMobileMoreOpen(true)}
          onOpenNewTransaction={() => handleOpenAddModal(activeTab === 'jurnal_penyesuaian')}
          isSimulator={isMobileSimulator}
        />

        {/* 8. Mobile More Drawer (Bottom Sheet) */}
        <MobileMoreDrawer
          isOpen={isMobileMoreOpen}
          onClose={() => setIsMobileMoreOpen(false)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          company={company}
          isCycleBalanced={isCycleBalanced}
          onLoadSampleData={handleLoadSampleData}
          onResetData={handleResetData}
          isSimulator={isMobileSimulator}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          onOpenAndroidApkModal={() => setIsAndroidApkModalOpen(true)}
        />
      </div>

      {/* Modal for Journal Entry */}
      <JournalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        accounts={accounts}
        initialEntry={editingEntry}
        isAdjustingDefault={isAdjustingDefault}
      />

      {/* Modal for Android APK & WebAPK Installer */}
      <AndroidApkModal
        isOpen={isAndroidApkModalOpen}
        onClose={() => setIsAndroidApkModalOpen(false)}
        onTriggerInstall={install}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
      />

      {/* Offline Connectivity Status Notification */}
      <OfflineIndicator />
    </div>
  );
}

