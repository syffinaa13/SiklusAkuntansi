import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Cpu, 
  Sparkles, 
  Layers, 
  Terminal,
  HelpCircle,
  Share2
} from 'lucide-react';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall: () => Promise<boolean>;
  isInstallable: boolean;
  isInstalled: boolean;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  isInstallable,
  isInstalled
}) => {
  const [activeTab, setActiveTab] = useState<'instant' | 'generate_apk' | 'faq'>('instant');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://siklus-akun.web.app';

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await onTriggerInstall();
      if (res) {
        onClose();
      }
    } else {
      alert('Untuk memasang di HP Android: Buka web ini di Google Chrome di ponsel Anda, lalu ketuk menu titik tiga (⋮) di kanan atas dan pilih "Tambahkan ke Layar Utama" / "Instal Aplikasi".');
    }
  };

  const bubblewrapCommand = `# 1. Pasang CLI resmi Google
npm i -g @bubblewrap/cli

# 2. Inisialisasi Android TWA dari web
bubblewrap init --manifest="${currentUrl}manifest.webmanifest"

# 3. Bangun file APK/AAB mandiri
bubblewrap build`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <Smartphone className="w-44 h-44 text-white" />
          </div>

          <div className="relative z-10 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Paket Aplikasi Android (APK & WebAPK)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Didukung Penuh
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                SiklusAkun dirancang dengan arsitektur PWA & WebAPK native standar Android OS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative z-10"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-2 shrink-0 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('instant')}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'instant'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ Pasang Instan di HP (WebAPK)
          </button>
          <button
            onClick={() => setActiveTab('generate_apk')}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'generate_apk'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📦 Buat File Mentah (.APK / .AAB)
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`pb-2.5 px-3 font-semibold transition-all cursor-pointer border-b-2 whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            💡 Tanya Jawab & Keunggulan
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-xs">
          
          {/* TAB 1: INSTANT INSTALL VIA WEBAPK */}
          {activeTab === 'instant' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-sm text-emerald-900">
                      Bisa langsung terpasang di HP Android tanpa download file manual!
                    </h3>
                    <p className="mt-1 text-emerald-800 leading-relaxed text-[11px]">
                      Sistem operasi Android memiliki fitur resmi bernama <strong>WebAPK (Google WebAPK Server)</strong>. Ketika Anda memasang aplikasi ini di Android, Android secara otomatis membuat dan menginstal paket <strong>.APK nyata</strong> ke dalam sistem HP Anda.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Format App</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">WebAPK / PWA Standalone</span>
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Fullscreen tanpa URL bar</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mode Offline</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">Workbox Service Worker</span>
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Cache lokal tersimpan</span>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/70">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Ukuran Memori</span>
                  <span className="text-xs font-bold text-slate-900 mt-0.5 block">&lt; 3 MB Ringan</span>
                  <span className="text-[10px] text-emerald-600 font-medium">✓ Tidak membebani RAM</span>
                </div>
              </div>

              {/* Install Trigger Button */}
              <div className="pt-2 text-center">
                {isInstalled ? (
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aplikasi sudah terpasang di perangkat ini dalam mode Standalone.</span>
                  </div>
                ) : (
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer min-h-[44px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Aplikasi ke Ponsel Android Sekarang</span>
                  </button>
                )}
              </div>

              {/* Step-by-Step Instructions */}
              <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
                <span className="font-bold text-slate-900 text-xs block">
                  Langkah Memasang Langsung dari HP Android:
                </span>
                <ol className="space-y-2.5 text-[11px] text-slate-600 list-decimal list-inside">
                  <li className="leading-relaxed">
                    Buka tautan aplikasi ini di peramban <strong>Google Chrome</strong> atau <strong>Samsung Internet</strong> pada HP Android Anda.
                  </li>
                  <li className="leading-relaxed">
                    Ketuk menu <strong>titik tiga (⋮)</strong> di pojok kanan atas peramban Anda.
                  </li>
                  <li className="leading-relaxed">
                    Pilih menu <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Instal Aplikasi"</strong> (<em>Add to Home screen / Install App</em>).
                  </li>
                  <li className="leading-relaxed">
                    Konfirmasi dengan mengetuk <strong>"Instal"</strong>. Ikon <strong>SiklusAkun</strong> akan langsung muncul di laci aplikasi HP Anda layaknya aplikasi Play Store.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE APK / AAB GENERATION */}
          {activeTab === 'generate_apk' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-xs leading-relaxed">
                Jika Anda membutuhkan file mentah <strong>.apk</strong> (untuk dibagikan lewat WhatsApp / Google Drive) atau <strong>.aab</strong> (untuk diunggah ke Google Play Store), Anda dapat mengonversinya dalam hitungan menit menggunakan alat resmi berikut:
              </p>

              {/* Method A: PWABuilder (Recommended GUI) */}
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">1</span>
                    <strong className="text-blue-950 font-bold text-xs">Metode 1: PWABuilder (Resmi Microsoft & Google)</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Paling Mudah (1-Klik)</span>
                </div>
                <p className="text-blue-900 text-[11px] leading-relaxed">
                  PWABuilder secara otomatis membaca <code>manifest.webmanifest</code> dan ikon aplikasi yang sudah kami sediakan, lalu menghasilkan file APK & Android App Bundle (AAB) yang ditandatangani.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <a
                    href="https://www.pwabuilder.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] shadow-xs cursor-pointer"
                  >
                    <span>Buka PWABuilder.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleCopy(currentUrl, 'url')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-800 hover:bg-blue-50 font-medium text-[11px] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedText === 'url' ? 'Tersalin!' : 'Salin URL Aplikasi'}</span>
                  </button>
                </div>
              </div>

              {/* Method B: Bubblewrap CLI */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">2</span>
                    <strong className="text-slate-900 font-bold text-xs">Metode 2: Google Bubblewrap CLI (TWA)</strong>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">Untuk Developer</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Gunakan perkakas resmi Google Chrome OS/Android untuk mengompilasi APK via terminal:
                </p>
                <div className="relative">
                  <pre className="p-3 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed">
                    {bubblewrapCommand}
                  </pre>
                  <button
                    onClick={() => handleCopy(bubblewrapCommand, 'cmd')}
                    className="absolute top-2 right-2 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[10px] flex items-center gap-1 cursor-pointer border border-slate-700"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText === 'cmd' ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Method C: Capacitor */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-5 h-5 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">3</span>
                  <strong className="text-slate-800 text-xs">Metode 3: Capacitor / Android Studio</strong>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Bisa dibungkus dengan Capacitor (<code>npm i @capacitor/android && npx cap add android</code>) untuk dibuka langsung di Android Studio jika Anda ingin memodifikasi kode Java/Kotlin.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: FAQ & COMPARISON */}
          {activeTab === 'faq' && (
            <div className="space-y-3.5">
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Mengapa WebAPK lebih direkomendasikan dibanding file APK biasa?
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  File APK tradisional harus diinstal ulang secara manual setiap ada pembaruan versi. Sedangkan dengan <strong>WebAPK</strong>, pembaruan fitur (seperti penyesuaian jurnal, laporan, atau rumus) akan langsung ter-update secara otomatis di HP tanpa perlu repot mengunduh ulang file APK!
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Apakah data transaksi aman dan tersimpan jika aplikasi ditutup?
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Ya, seluruh data transaksi jurnal, buku besar, neraca lajur, dan profil perusahaan tersimpan secara persisten di penyimpanan aman perangkat (<em>Storage Sandbox</em>) dan dilindungi oleh sistem otorisasi peran (Administrator & Operator).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-1.5">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-600" />
                  Apakah bisa dijalankan tanpa koneksi internet (Offline)?
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Ya, berkat Service Worker dengan Workbox, seluruh aset antarmuka, font, dan logika perhitungan di-cache di dalam HP. Aplikasi tetap dapat dibuka dan digunakan meski koneksi internet terputus.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Manifest PWA & Ikon Android 192px/512px Terverifikasi Aktif</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handleInstallClick}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalled ? 'Buka Aplikasi' : 'Pasang di Android'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
