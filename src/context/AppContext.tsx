import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { AppData, AppSettings, CategoryType, HoldingRecord, ImportMode, PortfolioSnapshot, Profile } from '../types';
import { CATEGORIES, CATEGORY_KEYS } from '../utils/formatters';
import { INITIAL_DATA, loadAppData, saveAppData } from '../utils/storage';

interface AppContextType {
  data: AppData;
  isLoading: boolean;
  selectedProfileId: string; // 'ALL' or specific profileId
  setSelectedProfileId: (id: string) => void;
  activeTab: 'dashboard' | 'holdings' | 'upload' | 'profiles' | 'settings';
  setActiveTab: (tab: 'dashboard' | 'holdings' | 'upload' | 'profiles' | 'settings') => void;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  // Profile CRUD
  addProfile: (name: string, color: string) => void;
  updateProfile: (id: string, name: string, color: string) => void;
  deleteProfile: (id: string, reassignToProfileId?: string) => void;
  // Holdings CRUD
  addHolding: (holding: Omit<HoldingRecord, 'id' | 'lastUpdated'>) => void;
  updateHolding: (id: string, updates: Partial<HoldingRecord>) => void;
  deleteHolding: (id: string) => void;
  importHoldings: (
    records: Omit<HoldingRecord, 'id' | 'lastUpdated'>[],
    options?: {
      mode: ImportMode;
      profileId: string;
      createSnapshotBefore?: boolean;
      snapshotLabel?: string;
    }
  ) => void;
  // Snapshots & History
  takeSnapshot: (label?: string, customDate?: string) => void;
  deleteSnapshot: (id: string) => void;
  activeSnapshots: PortfolioSnapshot[];
  // Settings & Storage
  updateSettings: (updates: Partial<AppSettings>) => void;
  exportBackup: () => Promise<void>;
  importBackup: () => Promise<void>;
  resetToSampleData: () => void;
  clearAllData: () => void;
  // Computed Metrics
  activeHoldings: HoldingRecord[];
  activeProfile: Profile | null;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  debtToAssetRatio: number;
  categoryTotals: Record<CategoryType, number>;
  categoryCounts: Record<CategoryType, number>;
  liquidAssetsTotal: number;
  illiquidAssetsTotal: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'holdings' | 'upload' | 'profiles' | 'settings'>('dashboard');

  // Load data on mount
  useEffect(() => {
    let mounted = true;
    loadAppData().then((saved) => {
      if (mounted) {
        setData(saved);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Save data on change (debounced slightly to prevent thrashing)
  useEffect(() => {
    if (!isLoading) {
      saveAppData(data);
    }
  }, [data, isLoading]);

  const privacyMode = data.settings.privacyMode;

  const togglePrivacyMode = () => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, privacyMode: !prev.settings.privacyMode },
    }));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setData((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  };

  // Profile operations
  const addProfile = (name: string, color: string) => {
    const newProfile: Profile = {
      id: `prof_${Date.now()}`,
      name: name.trim(),
      color,
      createdAt: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
    }));
  };

  const updateProfile = (id: string, name: string, color: string) => {
    setData((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) => (p.id === id ? { ...p, name: name.trim(), color } : p)),
    }));
  };

  const deleteProfile = (id: string, reassignToProfileId?: string) => {
    if (data.profiles.length <= 1) {
      alert('Cannot delete the only remaining profile. You must have at least one profile.');
      return;
    }

    const remainingProfiles = data.profiles.filter((p) => p.id !== id);

    setData((prev) => {
      let updatedHoldings = prev.holdings;

      if (reassignToProfileId && remainingProfiles.some((p) => p.id === reassignToProfileId)) {
        updatedHoldings = updatedHoldings.map((h) =>
          h.profileId === id ? { ...h, profileId: reassignToProfileId } : h
        );
      } else {
        // Delete records associated with this profile permanently!
        updatedHoldings = updatedHoldings.filter((h) => h.profileId !== id);
      }

      const updatedSnapshots = (prev.snapshots || []).filter((s) => s.profileId !== id);

      return {
        ...prev,
        profiles: remainingProfiles,
        holdings: updatedHoldings,
        snapshots: updatedSnapshots,
      };
    });

    // If only 1 profile remains, or if active profile was the deleted one, focus on remaining profile
    if (remainingProfiles.length === 1 || selectedProfileId === id) {
      setSelectedProfileId(remainingProfiles[0].id);
    }
  };

  // Holdings operations
  const addHolding = (item: Omit<HoldingRecord, 'id' | 'lastUpdated'>) => {
    const newRecord: HoldingRecord = {
      ...item,
      id: `h_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      lastUpdated: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      holdings: [newRecord, ...prev.holdings],
    }));
  };

  const updateHolding = (id: string, updates: Partial<HoldingRecord>) => {
    setData((prev) => ({
      ...prev,
      holdings: prev.holdings.map((h) =>
        h.id === id ? { ...h, ...updates, lastUpdated: new Date().toISOString() } : h
      ),
    }));
  };

  const deleteHolding = (id: string) => {
    setData((prev) => ({
      ...prev,
      holdings: prev.holdings.filter((h) => h.id !== id),
    }));
  };

  // Snapshots & History
  const takeSnapshot = (label?: string, customDate?: string) => {
    const now = new Date();
    const dateStr = customDate || now.toISOString().slice(0, 10);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const autoLabel = label || `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const targetHoldings =
      selectedProfileId === 'ALL'
        ? data.holdings
        : data.holdings.filter((h) => h.profileId === selectedProfileId);

    const breakdown: Record<CategoryType, number> = {
      equity: 0,
      mutual_funds: 0,
      bonds: 0,
      gold: 0,
      receivables: 0,
      eps: 0,
      nps: 0,
      liabilities: 0,
    };
    for (const h of targetHoldings) {
      if (breakdown[h.category] !== undefined) {
        breakdown[h.category] += Number(h.currentValue) || 0;
      }
    }
    const assets = CATEGORY_KEYS.filter((c) => !CATEGORIES[c].isLiability).reduce(
      (sum, c) => sum + (breakdown[c] || 0),
      0
    );
    const liab = breakdown.liabilities || 0;
    const nw = assets - liab;

    const newSnapshot: PortfolioSnapshot = {
      id: `snap_${Date.now()}`,
      date: dateStr,
      label: autoLabel,
      profileId: selectedProfileId,
      netWorth: nw,
      totalAssets: assets,
      totalLiabilities: liab,
      categoryBreakdown: breakdown,
      createdAt: now.toISOString(),
    };

    setData((prev) => {
      const existing = prev.snapshots || [];
      const filtered = existing.filter((s) => !(s.date === dateStr && s.profileId === selectedProfileId));
      const sorted = [...filtered, newSnapshot].sort((a, b) => a.date.localeCompare(b.date));
      return {
        ...prev,
        snapshots: sorted,
      };
    });
  };

  const deleteSnapshot = (id: string) => {
    setData((prev) => ({
      ...prev,
      snapshots: (prev.snapshots || []).filter((s) => s.id !== id),
    }));
  };

  const importHoldings = (
    records: Omit<HoldingRecord, 'id' | 'lastUpdated'>[],
    options?: {
      mode: ImportMode;
      profileId: string;
      createSnapshotBefore?: boolean;
      snapshotLabel?: string;
    }
  ) => {
    const timestamp = new Date().toISOString();
    const mode = options?.mode || 'update_sync';
    const profId = options?.profileId || records[0]?.profileId || data.profiles[0]?.id;

    setData((prev) => {
      let updatedSnapshots = prev.snapshots || [];

      // 1. Capture snapshot before import if requested
      if (options?.createSnapshotBefore) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const autoLabel = options.snapshotLabel || `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

        const targetHoldings = prev.holdings;
        const breakdown: Record<CategoryType, number> = {
          equity: 0,
          mutual_funds: 0,
          bonds: 0,
          gold: 0,
          receivables: 0,
          eps: 0,
          nps: 0,
          liabilities: 0,
        };
        for (const h of targetHoldings) {
          if (breakdown[h.category] !== undefined) {
            breakdown[h.category] += Number(h.currentValue) || 0;
          }
        }
        const assets = CATEGORY_KEYS.filter((c) => !CATEGORIES[c].isLiability).reduce(
          (sum, c) => sum + (breakdown[c] || 0),
          0
        );
        const liab = breakdown.liabilities || 0;
        const nw = assets - liab;

        const snap: PortfolioSnapshot = {
          id: `snap_${Date.now()}`,
          date: dateStr,
          label: autoLabel,
          profileId: 'ALL',
          netWorth: nw,
          totalAssets: assets,
          totalLiabilities: liab,
          categoryBreakdown: breakdown,
          createdAt: now.toISOString(),
        };

        const filtered = updatedSnapshots.filter((s) => !(s.date === dateStr && s.profileId === 'ALL'));
        updatedSnapshots = [...filtered, snap].sort((a, b) => a.date.localeCompare(b.date));
      }

      // 2. Process holdings based on mode
      let newHoldings = [...prev.holdings];

      if (mode === 'replace_profile') {
        const categoriesInImport = new Set(records.map((r) => r.category));
        newHoldings = newHoldings.filter(
          (h) => !(h.profileId === profId && categoriesInImport.has(h.category))
        );
        const newItems: HoldingRecord[] = records.map((r, idx) => ({
          ...r,
          id: `h_imp_${Date.now()}_${idx}`,
          lastUpdated: timestamp,
        }));
        newHoldings = [...newItems, ...newHoldings];
      } else if (mode === 'update_sync') {
        const remainingNewRecords: typeof records = [];

        records.forEach((incoming) => {
          const matchIndex = newHoldings.findIndex(
            (h) =>
              h.profileId === profId &&
              h.category === incoming.category &&
              h.name.toLowerCase().trim() === incoming.name.toLowerCase().trim()
          );

          if (matchIndex !== -1) {
            newHoldings[matchIndex] = {
              ...newHoldings[matchIndex],
              units: incoming.units !== undefined ? incoming.units : newHoldings[matchIndex].units,
              currentPrice: incoming.currentPrice !== undefined ? incoming.currentPrice : newHoldings[matchIndex].currentPrice,
              avgPrice: incoming.avgPrice !== undefined ? incoming.avgPrice : newHoldings[matchIndex].avgPrice,
              currentValue: incoming.currentValue,
              institutionOrFolio: incoming.institutionOrFolio || newHoldings[matchIndex].institutionOrFolio,
              lastUpdated: timestamp,
            };
          } else {
            remainingNewRecords.push(incoming);
          }
        });

        if (remainingNewRecords.length > 0) {
          const brandNewItems: HoldingRecord[] = remainingNewRecords.map((r, idx) => ({
            ...r,
            id: `h_imp_${Date.now()}_${idx}`,
            lastUpdated: timestamp,
          }));
          newHoldings = [...brandNewItems, ...newHoldings];
        }
      } else {
        const newItems: HoldingRecord[] = records.map((r, idx) => ({
          ...r,
          id: `h_imp_${Date.now()}_${idx}`,
          lastUpdated: timestamp,
        }));
        newHoldings = [...newItems, ...newHoldings];
      }

      return {
        ...prev,
        snapshots: updatedSnapshots,
        holdings: newHoldings,
      };
    });
  };

  // Backups
  const exportBackup = async () => {
    if (window.electronAPI?.exportBackup) {
      const res = await window.electronAPI.exportBackup(data);
      if (res.success) {
        alert('Backup successfully exported to: ' + res.filePath);
      } else if (!res.canceled) {
        alert('Export failed: ' + (res.error || 'Unknown error'));
      }
    } else {
      // Browser download fallback
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `networth-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const importBackup = async () => {
    if (window.electronAPI?.importBackup) {
      const res = await window.electronAPI.importBackup();
      if (res.success && res.data) {
        setData(res.data);
        alert('Backup successfully imported!');
      } else if (!res.canceled) {
        alert('Failed to import backup');
      }
    } else {
      // Browser input fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const parsed = JSON.parse(event.target?.result as string);
            if (parsed.profiles && parsed.holdings) {
              setData(parsed);
              alert('Backup successfully restored!');
            } else {
              alert('Invalid backup file structure.');
            }
          } catch (err) {
            alert('Could not parse JSON file.');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }
  };

  const resetToSampleData = () => {
    if (window.confirm('Reset all data to default demo state? Current custom entries will be replaced.')) {
      setData(INITIAL_DATA);
      setSelectedProfileId('ALL');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to delete ALL profiles and holdings? This cannot be undone.')) {
      setData({
        version: '1.0.0',
        settings: {
          currency: 'INR',
          numberFormat: 'indian',
          privacyMode: false,
          theme: 'dark',
        },
        profiles: [
          {
            id: 'prof_default',
            name: 'Primary Profile',
            color: '#06b6d4',
            isDefault: true,
            createdAt: new Date().toISOString(),
          },
        ],
        holdings: [],
      });
      setSelectedProfileId('ALL');
    }
  };

  // Computed Values
  const activeHoldings = useMemo(() => {
    if (selectedProfileId === 'ALL') {
      return data.holdings;
    }
    return data.holdings.filter((h) => h.profileId === selectedProfileId);
  }, [data.holdings, selectedProfileId]);

  const activeProfile = useMemo(() => {
    if (selectedProfileId === 'ALL') return null;
    return data.profiles.find((p) => p.id === selectedProfileId) || null;
  }, [data.profiles, selectedProfileId]);

  const categoryTotals = useMemo(() => {
    const totals: Record<CategoryType, number> = {
      equity: 0,
      mutual_funds: 0,
      bonds: 0,
      gold: 0,
      receivables: 0,
      eps: 0,
      nps: 0,
      liabilities: 0,
    };
    for (const h of activeHoldings) {
      if (totals[h.category] !== undefined) {
        totals[h.category] += Number(h.currentValue) || 0;
      }
    }
    return totals;
  }, [activeHoldings]);

  const categoryCounts = useMemo(() => {
    const counts: Record<CategoryType, number> = {
      equity: 0,
      mutual_funds: 0,
      bonds: 0,
      gold: 0,
      receivables: 0,
      eps: 0,
      nps: 0,
      liabilities: 0,
    };
    for (const h of activeHoldings) {
      if (counts[h.category] !== undefined) {
        counts[h.category] += 1;
      }
    }
    return counts;
  }, [activeHoldings]);

  const totalAssets = useMemo(() => {
    return CATEGORY_KEYS.filter((cat) => !CATEGORIES[cat].isLiability).reduce(
      (sum, cat) => sum + (categoryTotals[cat] || 0),
      0
    );
  }, [categoryTotals]);

  const totalLiabilities = useMemo(() => {
    return categoryTotals.liabilities || 0;
  }, [categoryTotals]);

  const netWorth = useMemo(() => {
    return totalAssets - totalLiabilities;
  }, [totalAssets, totalLiabilities]);

  const debtToAssetRatio = useMemo(() => {
    if (totalAssets <= 0) return 0;
    return Math.min(100, Math.round((totalLiabilities / totalAssets) * 100));
  }, [totalAssets, totalLiabilities]);

  const liquidAssetsTotal = useMemo(() => {
    return CATEGORY_KEYS.filter((cat) => CATEGORIES[cat].isLiquid).reduce(
      (sum, cat) => sum + (categoryTotals[cat] || 0),
      0
    );
  }, [categoryTotals]);

  const illiquidAssetsTotal = useMemo(() => {
    return CATEGORY_KEYS.filter((cat) => !CATEGORIES[cat].isLiquid && !CATEGORIES[cat].isLiability).reduce(
      (sum, cat) => sum + (categoryTotals[cat] || 0),
      0
    );
  }, [categoryTotals]);

  const activeSnapshots = useMemo(() => {
    const list = data.snapshots || [];
    if (selectedProfileId === 'ALL') {
      return list.filter((s) => s.profileId === 'ALL' || !s.profileId);
    }
    return list.filter((s) => s.profileId === selectedProfileId);
  }, [data.snapshots, selectedProfileId]);

  return (
    <AppContext.Provider
      value={{
        data,
        isLoading,
        selectedProfileId,
        setSelectedProfileId,
        activeTab,
        setActiveTab,
        privacyMode,
        togglePrivacyMode,
        addProfile,
        updateProfile,
        deleteProfile,
        addHolding,
        updateHolding,
        deleteHolding,
        importHoldings,
        takeSnapshot,
        deleteSnapshot,
        activeSnapshots,
        updateSettings,
        exportBackup,
        importBackup,
        resetToSampleData,
        clearAllData,
        activeHoldings,
        activeProfile,
        totalAssets,
        totalLiabilities,
        netWorth,
        debtToAssetRatio,
        categoryTotals,
        categoryCounts,
        liquidAssetsTotal,
        illiquidAssetsTotal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
