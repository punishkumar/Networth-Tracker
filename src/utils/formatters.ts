import { CategoryMeta, CategoryType } from '../types';

export const CATEGORIES: Record<CategoryType, CategoryMeta> = {
  equity: {
    id: 'equity',
    name: 'Equity / Stocks',
    icon: 'TrendingUp',
    isLiability: false,
    isLiquid: true,
    color: '#06b6d4', // cyan-500
    description: 'Direct shares & equities held in Demat account',
  },
  mutual_funds: {
    id: 'mutual_funds',
    name: 'Mutual Funds',
    icon: 'PieChart',
    isLiability: false,
    isLiquid: true,
    color: '#3b82f6', // blue-500
    description: 'Active & passive equity, hybrid, and debt mutual funds',
  },
  bonds: {
    id: 'bonds',
    name: 'Bonds & Fixed Income',
    icon: 'Landmark',
    isLiability: false,
    isLiquid: false,
    color: '#8b5cf6', // purple-500
    description: 'Govt bonds, corporate bonds, FDs, and debt securities',
  },
  gold: {
    id: 'gold',
    name: 'Gold & Precious Metals',
    icon: 'Coins',
    isLiability: false,
    isLiquid: true,
    color: '#f59e0b', // amber-500
    description: 'Physical gold, Sovereign Gold Bonds (SGB), and Gold ETFs',
  },
  receivables: {
    id: 'receivables',
    name: 'Receivables & Dues',
    icon: 'HandCoins',
    isLiability: false,
    isLiquid: true,
    color: '#10b981', // emerald-500
    description: 'Pending refunds, money lent, security deposits, expected payouts',
  },
  eps: {
    id: 'eps',
    name: 'EPS / EPF Balance',
    icon: 'Briefcase',
    isLiability: false,
    isLiquid: false,
    color: '#ec4899', // pink-500
    description: 'Employee Provident Fund & EPS pension balance',
  },
  nps: {
    id: 'nps',
    name: 'NPS Balance',
    icon: 'ShieldCheck',
    isLiability: false,
    isLiquid: false,
    color: '#6366f1', // indigo-500
    description: 'National Pension System (Tier 1 & Tier 2) retirement corpus',
  },
  liabilities: {
    id: 'liabilities',
    name: 'Liabilities & Loans',
    icon: 'CreditCard',
    isLiability: true,
    isLiquid: false,
    color: '#f43f5e', // rose-500
    description: 'Home loans, personal loans, car loans, credit card dues, and debts',
  },
};

export const CATEGORY_KEYS: CategoryType[] = [
  'equity',
  'mutual_funds',
  'bonds',
  'gold',
  'receivables',
  'eps',
  'nps',
  'liabilities',
];

/**
 * Format currency with Indian Lakh/Crore or International Million notation
 */
export function formatCurrency(
  amount: number,
  currency: 'INR' | 'USD' = 'INR',
  numberFormat: 'indian' | 'international' = 'indian',
  privacyMode: boolean = false
): string {
  if (privacyMode) {
    return currency === 'INR' ? '₹ •••••••' : '$ •••••••';
  }

  const isNeg = amount < 0;
  const absVal = Math.abs(amount);
  const symbol = currency === 'INR' ? '₹ ' : '$ ';

  let formatted = '';
  if (numberFormat === 'indian') {
    formatted = absVal.toLocaleString('en-IN', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  } else {
    formatted = absVal.toLocaleString('en-US', {
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }

  return `${isNeg ? '-' : ''}${symbol}${formatted}`;
}

/**
 * Compact Indian format e.g. ₹ 2.50 L or ₹ 1.25 Cr
 */
export function formatCompactCurrency(
  amount: number,
  currency: 'INR' | 'USD' = 'INR',
  privacyMode: boolean = false
): string {
  if (privacyMode) return '•••••';
  const isNeg = amount < 0;
  const abs = Math.abs(amount);
  const sym = currency === 'INR' ? '₹ ' : '$ ';

  if (currency === 'INR') {
    if (abs >= 10000000) {
      return `${isNeg ? '-' : ''}${sym}${(abs / 10000000).toFixed(2)} Cr`;
    }
    if (abs >= 100000) {
      return `${isNeg ? '-' : ''}${sym}${(abs / 100000).toFixed(2)} L`;
    }
    return `${isNeg ? '-' : ''}${sym}${abs.toLocaleString('en-IN')}`;
  } else {
    if (abs >= 1000000000) {
      return `${isNeg ? '-' : ''}${sym}${(abs / 1000000000).toFixed(2)}B`;
    }
    if (abs >= 1000000) {
      return `${isNeg ? '-' : ''}${sym}${(abs / 1000000).toFixed(2)}M`;
    }
    return `${isNeg ? '-' : ''}${sym}${abs.toLocaleString('en-US')}`;
  }
}
