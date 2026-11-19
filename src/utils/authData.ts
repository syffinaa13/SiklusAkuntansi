import { ActiveTab } from '../components/Header';
import { UserRole, UserSession } from '../types/accounting';

export interface RolePermissionDetail {
  role: UserRole;
  title: string;
  description: string;
  allowedTabs: ActiveTab[];
  canEditCompany: boolean;
  canResetData: boolean;
  canLoadSample: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissionDetail> = {
  ADMINISTRATOR: {
    role: 'ADMINISTRATOR',
    title: 'Administrator',
    description: 'Memiliki akses penuh ke seluruh modul siklus akuntansi, laporan keuangan, bagan akun, dan pengaturan sistem.',
    allowedTabs: [
      'penerimaan_kas',
      'pembayaran_kas',
      'jurnal_umum',
      'buku_besar',
      'neraca_saldo',
      'jurnal_penyesuaian',
      'neraca_lajur',
      'laporan_keuangan',
      'bagan_akun'
    ],
    canEditCompany: true,
    canResetData: true,
    canLoadSample: true
  },
  OPERATOR: {
    role: 'OPERATOR',
    title: 'Operator Transaksi Kas',
    description: 'Khusus menginputkan transaksi Penerimaan Kas (BKM) dan Pembayaran Kas (BKK). Menu siklus dan laporan lainnya terkunci.',
    allowedTabs: [
      'penerimaan_kas',
      'pembayaran_kas'
    ],
    canEditCompany: false,
    canResetData: false,
    canLoadSample: false
  }
};

export const DEMO_ACCOUNTS: { username: string; password: string; user: UserSession }[] = [
  {
    username: 'admin',
    password: 'admin123',
    user: {
      id: 'usr-admin-01',
      username: 'admin',
      fullName: 'Drs. Hendra Gunawan, M.M.',
      role: 'ADMINISTRATOR',
      email: 'hendra.gunawan@primaauto.co.id',
      avatarColor: 'bg-slate-900 text-white'
    }
  },
  {
    username: 'operator',
    password: 'operator123',
    user: {
      id: 'usr-oper-01',
      username: 'operator',
      fullName: 'Siti Rahmawati (Operator Kas)',
      role: 'OPERATOR',
      email: 'siti.kasir@primaauto.co.id',
      avatarColor: 'bg-emerald-700 text-white'
    }
  }
];

export function hasPermissionForTab(role: UserRole, tab: ActiveTab): boolean {
  if (role === 'ADMINISTRATOR') return true;
  return ROLE_PERMISSIONS.OPERATOR.allowedTabs.includes(tab);
}
