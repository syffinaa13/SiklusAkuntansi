import React from 'react';
import { ActiveTab } from './Header';
import { Layers, Lock } from 'lucide-react';
import { UserRole } from '../types/accounting';
import { hasPermissionForTab } from '../utils/authData';

interface MobileCycleBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  userRole?: UserRole;
}

const CYCLE_STEPS: { id: ActiveTab; step: string; shortTitle: string }[] = [
  { id: 'penerimaan_kas', step: '1', shortTitle: 'Kas Masuk' },
  { id: 'pembayaran_kas', step: '2', shortTitle: 'Kas Keluar' },
  { id: 'jurnal_umum', step: '3', shortTitle: 'Jurnal Umum' },
  { id: 'buku_besar', step: '4', shortTitle: 'Buku Besar' },
  { id: 'neraca_saldo', step: '5', shortTitle: 'Neraca Saldo' },
  { id: 'jurnal_penyesuaian', step: '6', shortTitle: 'AJP' },
  { id: 'neraca_lajur', step: '7', shortTitle: 'Neraca Lajur' },
  { id: 'laporan_keuangan', step: '8', shortTitle: 'Lap. Keuangan' },
  { id: 'bagan_akun', step: 'COA', shortTitle: 'Bagan Akun' }
];

export const MobileCycleBar: React.FC<MobileCycleBarProps> = ({
  activeTab,
  onSelectTab,
  userRole = 'ADMINISTRATOR'
}) => {
  const currentStepIndex = CYCLE_STEPS.findIndex(s => s.id === activeTab);
  const currentStep = currentStepIndex >= 0 ? CYCLE_STEPS[currentStepIndex] : null;

  return (
    <div className="lg:hidden bg-white border-b border-slate-200 py-2 px-3 no-print shadow-2xs">
      {/* Current Step Banner */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 px-0.5">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">
            Alur Siklus: {currentStep ? `${currentStep.step}. ${currentStep.shortTitle}` : 'Akuntansi'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {userRole === 'OPERATOR' ? 'Mode Operator' : currentStepIndex >= 0 && currentStepIndex < 8 ? `${currentStepIndex + 1}/8 Langkah` : ''}
        </span>
      </div>

      {/* Horizontal Swipeable Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1">
        {CYCLE_STEPS.map(item => {
          const isActive = activeTab === item.id;
          const isAllowed = hasPermissionForTab(userRole, item.id);

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 transition-all cursor-pointer whitespace-nowrap min-h-[32px] ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : isAllowed
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              <span
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${
                  isActive 
                    ? 'bg-white text-slate-900' 
                    : isAllowed 
                      ? 'bg-slate-200 text-slate-700' 
                      : 'bg-slate-200 text-slate-400'
                }`}
              >
                {item.step}
              </span>
              {!isAllowed && <Lock className="w-2.5 h-2.5 text-amber-500 shrink-0" />}
              <span>{item.shortTitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
