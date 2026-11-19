import React from 'react';
import { useOnlineStatus } from '../utils/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-4 left-4 right-4 sm:right-auto z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl animate-in slide-in-from-bottom-2 duration-300">
      <WifiOff className="w-4 h-4 shrink-0 animate-pulse" />
      <div className="flex-1">
        <span>Mode Offline Aktif</span>
        <span className="hidden sm:inline text-amber-100 ml-1.5 font-normal">
          — Data tersimpan di memori perangkat & tetap dapat diakses.
        </span>
      </div>
    </div>
  );
};
