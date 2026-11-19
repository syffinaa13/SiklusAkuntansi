import React, { useState } from 'react';
import { UserSession } from '../types/accounting';
import { DEMO_ACCOUNTS } from '../utils/authData';
import { ShieldCheck, User, Lock, ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: UserSession) => void;
  defaultRole?: 'ADMINISTRATOR' | 'OPERATOR';
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  defaultRole
}) => {
  const initialDemo = defaultRole 
    ? DEMO_ACCOUNTS.find(a => a.user.role === defaultRole) || DEMO_ACCOUNTS[0]
    : DEMO_ACCOUNTS[0];

  const [username, setUsername] = useState(initialDemo.username);
  const [password, setPassword] = useState(initialDemo.password);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectRolePreset = (role: 'ADMINISTRATOR' | 'OPERATOR') => {
    const acc = DEMO_ACCOUNTS.find(a => a.user.role === role);
    if (acc) {
      setUsername(acc.username);
      setPassword(acc.password);
      setErrorMessage('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      const match = DEMO_ACCOUNTS.find(
        acc => acc.username.toLowerCase() === username.trim().toLowerCase() && acc.password === password
      );

      if (match) {
        onLoginSuccess(match.user);
      } else {
        setErrorMessage('Username atau kata sandi tidak valid. Silakan gunakan akun percontohan di bawah.');
      }
      setIsLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans text-slate-900">
      {/* Container Card */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden animate-in fade-in duration-300">
        
        {/* Top Wordmark & Brand Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 text-white font-bold text-xl mb-3 shadow-inner">
            SA
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            SiklusAkun
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Sistem Informasi Akuntansi & Kontrol Akses Berbasis Peran (RBAC)
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Quick Role Presets Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pilih Akun Demo Cepat:
              </span>
              <span className="text-[11px] text-slate-400">1-Klik Isi</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Preset 1: Admin */}
              <button
                type="button"
                onClick={() => handleSelectRolePreset('ADMINISTRATOR')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  username === 'admin'
                    ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span className="text-xs font-bold text-slate-900">Administrator</span>
                </div>
                <p className="text-[10px] text-slate-600 line-clamp-2">
                  Akses penuh ke semua modul, AJP, & laporan
                </p>
              </button>

              {/* Preset 2: Operator */}
              <button
                type="button"
                onClick={() => handleSelectRolePreset('OPERATOR')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  username === 'operator'
                    ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <User className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-emerald-900">Operator Kas</span>
                </div>
                <p className="text-[10px] text-emerald-800 line-clamp-2">
                  Khusus input Penerimaan & Pembayaran
                </p>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username Akun
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin atau operator"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer shadow-md disabled:opacity-70 min-h-[44px]"
            >
              <span>{isLoading ? 'Memverifikasi...' : 'Masuk ke Aplikasi'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Role Comparison Summary */}
          <div className="pt-4 border-t border-slate-200 text-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Hak Akses Menu Berdasarkan Peran:
            </span>

            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">1. Administrator:</strong>
                  <span>Akses penuh (Kas Masuk, Kas Keluar, Jurnal Umum, Buku Besar, Neraca Saldo, AJP, Neraca Lajur 10 Kolom, Laporan Keuangan, & Bagan Akun).</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-emerald-900 bg-emerald-50/70 p-2 rounded-lg">
                <User className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-950 block">2. Operator:</strong>
                  <span>Hanya bisa menginputkan dan memproses menu <strong>Penerimaan Kas (BKM)</strong> dan <strong>Pembayaran Kas (BKK)</strong>.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500">
          <span>PT Prima Auto Solusi · Periode Buku Aktif 2026</span>
        </div>
      </div>
    </div>
  );
};
