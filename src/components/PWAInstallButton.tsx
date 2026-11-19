import React from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  onOpenAndroidModal?: () => void;
  variant?: 'header' | 'mobile' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  onOpenAndroidModal,
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // If already running inside standalone PWA / WebAPK, suppress automatic install prompt
  if (isInstalled && variant !== 'header') {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success && onOpenAndroidModal) {
        onOpenAndroidModal();
      }
    } else if (onOpenAndroidModal) {
      onOpenAndroidModal();
    }
  };

  if (variant === 'mobile') {
    return (
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all active:scale-[0.99] min-h-[44px]"
      >
        <Smartphone className="w-4 h-4" />
        <span>{isInstalled ? 'Status APK & PWA Android' : 'Pasang / Unduh APK Android'}</span>
      </button>
    );
  }

  if (variant === 'banner') {
    if (isInstalled) return null;
    return (
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
            APK
          </div>
          <span>
            Ingin menggunakan seperti aplikasi Android asli tanpa browser?
          </span>
        </div>
        <button
          onClick={handleClick}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs cursor-pointer shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Pasang di Android</span>
        </button>
      </div>
    );
  }

  // Header default button
  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-md border border-emerald-300/80 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:border-emerald-400 transition-colors cursor-pointer min-h-[36px]"
      title="Pasang aplikasi di ponsel Android (WebAPK & PWA)"
    >
      <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
      <span className="hidden sm:inline font-bold">APK Android</span>
      <span className="sm:hidden font-bold">APK</span>
    </button>
  );
};
