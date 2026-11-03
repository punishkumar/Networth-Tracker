import { AppData } from '../types';

declare global {
  interface Window {
    electronAPI?: {
      loadData: () => Promise<AppData | null>;
      saveData: (data: AppData) => Promise<{ success: boolean; error?: string }>;
      exportBackup: (data: AppData) => Promise<{ success: boolean; filePath?: string; canceled?: boolean; error?: string }>;
      importBackup: () => Promise<{ success: boolean; data?: AppData; canceled?: boolean; error?: string }>;
      isElectron?: boolean;
    };
  }
}

export const INITIAL_DATA: AppData = {
  version: '1.0.0',
  settings: {
    currency: 'INR',
    numberFormat: 'indian',
    privacyMode: false,
    theme: 'dark',
  },
  profiles: [
    {
      id: 'prof_self',
      name: 'Self',
      color: '#06b6d4', // cyan
      isDefault: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prof_spouse',
      name: 'Spouse',
      color: '#10b981', // emerald
      isDefault: false,
      createdAt: new Date().toISOString(),
    },
  ],
  holdings: [
    {
      id: 'h_1',
      profileId: 'prof_self',
      category: 'equity',
      name: 'Reliance Industries Ltd',
      units: 35,
      avgPrice: 2450,
      currentPrice: 2850,
      currentValue: 99750,
      institutionOrFolio: 'Zerodha',
      notes: 'Long term investment',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_2',
      profileId: 'prof_self',
      category: 'equity',
      name: 'Tata Consultancy Services',
      units: 25,
      avgPrice: 3500,
      currentPrice: 4100,
      currentValue: 102500,
      institutionOrFolio: 'Zerodha',
      notes: 'Core portfolio',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_3',
      profileId: 'prof_spouse',
      category: 'mutual_funds',
      name: 'Parag Parikh Flexi Cap Fund - Direct Growth',
      units: 2450.5,
      avgPrice: 58.2,
      currentPrice: 84.5,
      currentValue: 207067,
      institutionOrFolio: 'Folio: 10488291',
      notes: 'Monthly SIP',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_4',
      profileId: 'prof_self',
      category: 'mutual_funds',
      name: 'Mirae Asset Large & Midcap Fund - Direct',
      units: 1820.0,
      avgPrice: 95.0,
      currentPrice: 135.2,
      currentValue: 246064,
      institutionOrFolio: 'Folio: 88291032',
      notes: 'Monthly SIP',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_5',
      profileId: 'prof_self',
      category: 'bonds',
      name: 'RBI Floating Rate Savings Bonds (FRSB)',
      units: 50,
      avgPrice: 1000,
      currentPrice: 1000,
      currentValue: 250000,
      institutionOrFolio: 'SBI Custody',
      interestRate: 8.05,
      dueDate: '2030-05-15',
      notes: 'Semi-annual interest payout',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_6',
      profileId: 'prof_self',
      category: 'gold',
      name: 'Sovereign Gold Bond (SGB 2028-Series IV)',
      units: 25, // grams
      avgPrice: 4800,
      currentPrice: 7250,
      currentValue: 181250,
      subType: 'SGB',
      institutionOrFolio: 'Zerodha',
      notes: '2.5% semi-annual interest + tax-free redemption',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_7',
      profileId: 'prof_spouse',
      category: 'gold',
      name: 'Physical 24K Gold Coins / Jewellery',
      units: 30, // grams
      avgPrice: 5200,
      currentPrice: 7300,
      currentValue: 219000,
      subType: 'Physical',
      notes: 'Bank locker',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_8',
      profileId: 'prof_self',
      category: 'receivables',
      name: 'Apartment Security Deposit Refund',
      currentValue: 120000,
      institutionOrFolio: 'Landlord - Mr. Sharma',
      dueDate: '2026-12-31',
      notes: 'Due at lease expiry',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_9',
      profileId: 'prof_self',
      category: 'eps',
      name: 'Employees Provident Fund (EPFO)',
      currentValue: 685000,
      institutionOrFolio: 'UAN: 100982341991',
      notes: 'Employee + Employer + Pension contribution',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_10',
      profileId: 'prof_self',
      category: 'nps',
      name: 'NPS Tier-1 (HDFC Pension Fund)',
      currentValue: 430000,
      institutionOrFolio: 'PRAN: 110034928190',
      notes: 'Aggressive Lifecycle Fund (LC-75)',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_11',
      profileId: 'prof_self',
      category: 'liabilities',
      name: 'HDFC Bank Home Loan',
      currentValue: 850000, // outstanding
      institutionOrFolio: 'HDFC Bank - A/C 66291002',
      interestRate: 8.5,
      emi: 38500,
      dueDate: '2034-08-01',
      notes: 'Remaining tenure: ~8 years',
      lastUpdated: new Date().toISOString(),
    },
    {
      id: 'h_12',
      profileId: 'prof_self',
      category: 'liabilities',
      name: 'ICICI Amazon Pay Credit Card Outstanding',
      currentValue: 24500,
      institutionOrFolio: 'ICICI Bank',
      dueDate: '2026-11-20',
      notes: 'Monthly billing cycle',
      lastUpdated: new Date().toISOString(),
    },
  ],
  snapshots: [
    {
      id: 'snap_1',
      date: '2026-08-01',
      label: 'Aug 2026',
      profileId: 'ALL',
      netWorth: 1850000,
      totalAssets: 2750000,
      totalLiabilities: 900000,
      categoryBreakdown: {
        equity: 180000,
        mutual_funds: 380000,
        bonds: 250000,
        gold: 350000,
        receivables: 120000,
        eps: 610000,
        nps: 360000,
        liabilities: 900000,
      },
      createdAt: '2026-08-01T10:00:00Z',
    },
    {
      id: 'snap_2',
      date: '2026-09-01',
      label: 'Sep 2026',
      profileId: 'ALL',
      netWorth: 1985000,
      totalAssets: 2870000,
      totalLiabilities: 885000,
      categoryBreakdown: {
        equity: 195000,
        mutual_funds: 410000,
        bonds: 250000,
        gold: 370000,
        receivables: 120000,
        eps: 635000,
        nps: 390000,
        liabilities: 885000,
      },
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'snap_3',
      date: '2026-10-01',
      label: 'Oct 2026',
      profileId: 'ALL',
      netWorth: 2120000,
      totalAssets: 2990000,
      totalLiabilities: 870000,
      categoryBreakdown: {
        equity: 202250,
        mutual_funds: 435000,
        bonds: 250000,
        gold: 385000,
        receivables: 120000,
        eps: 660000,
        nps: 410000,
        liabilities: 870000,
      },
      createdAt: '2026-10-01T10:00:00Z',
    },
  ],
};

const LOCAL_STORAGE_KEY = 'networth_tracker_data_v1';

export async function loadAppData(): Promise<AppData> {
  // If running in Electron
  if (window.electronAPI?.loadData) {
    try {
      const data = await window.electronAPI.loadData();
      if (data && data.profiles && data.holdings) {
        data.snapshots = data.snapshots || [];
        return data;
      }
    } catch (e) {
      console.warn('Could not load from Electron IPC, checking localStorage', e);
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.profiles && parsed.holdings) {
        parsed.snapshots = parsed.snapshots || [];
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading localStorage', e);
  }

  // Default initial data
  return INITIAL_DATA;
}

export async function saveAppData(data: AppData): Promise<void> {
  // Save to Electron IPC if present
  if (window.electronAPI?.saveData) {
    try {
      await window.electronAPI.saveData(data);
    } catch (e) {
      console.error('Failed to save via Electron IPC', e);
    }
  }

  // Always mirror in localStorage for fast hydration
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}
