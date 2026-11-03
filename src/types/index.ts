export type CategoryType =
  | 'equity'
  | 'mutual_funds'
  | 'bonds'
  | 'gold'
  | 'receivables'
  | 'eps'
  | 'nps'
  | 'liabilities';

export interface Profile {
  id: string;
  name: string;
  color: string;
  isDefault?: boolean;
  createdAt: string;
}

export interface HoldingRecord {
  id: string;
  profileId: string;
  category: CategoryType;
  name: string;
  // Financial numbers
  units?: number;
  avgPrice?: number;
  currentPrice?: number;
  currentValue: number;
  // Specific metadata
  institutionOrFolio?: string; // Folio, Broker, Bank, PRAN, Member ID
  notes?: string;
  dueDate?: string; // For receivables / liabilities maturity
  interestRate?: number; // For bonds, liabilities
  emi?: number; // For loans
  subType?: string; // e.g. Physical, SGB, ETF for Gold; Equity/Debt for MF
  lastUpdated: string;
}

export interface CategoryMeta {
  id: CategoryType;
  name: string;
  icon: string;
  isLiability: boolean;
  isLiquid: boolean;
  color: string;
  description: string;
}

export interface AppSettings {
  currency: 'INR' | 'USD';
  numberFormat: 'indian' | 'international';
  privacyMode: boolean;
  theme: 'dark' | 'light';
}

export interface PortfolioSnapshot {
  id: string;
  date: string; // YYYY-MM-DD
  label: string; // e.g. "Nov 2026"
  profileId: string; // 'ALL' or specific profileId
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  categoryBreakdown: Record<CategoryType, number>;
  createdAt: string;
}

export type ImportMode = 'update_sync' | 'replace_profile' | 'append';

export interface AppData {
  version: string;
  settings: AppSettings;
  profiles: Profile[];
  holdings: HoldingRecord[];
  snapshots?: PortfolioSnapshot[];
}

export interface ParsedBrokerRow {
  id: string;
  rawName: string;
  isin?: string;
  sector?: string;
  quantity?: number;
  avgPrice?: number;
  currentPrice?: number;
  totalValue: number;
  category: CategoryType;
  selected: boolean;
  notes?: string;
}
