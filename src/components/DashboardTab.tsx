import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  Landmark,
  Coins,
  HandCoins,
  Briefcase,
  ShieldCheck,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  Camera,
  Calendar,
  History,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_KEYS, formatCurrency, formatCompactCurrency } from '../utils/formatters';
import { CategoryType } from '../types';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  TrendingUp,
  PieChart: PieIcon,
  Landmark,
  Coins,
  HandCoins,
  Briefcase,
  ShieldCheck,
  CreditCard,
};

export const DashboardTab: React.FC = () => {
  const {
    data,
    selectedProfileId,
    activeProfile,
    netWorth,
    totalAssets,
    totalLiabilities,
    debtToAssetRatio,
    categoryTotals,
    categoryCounts,
    liquidAssetsTotal,
    illiquidAssetsTotal,
    privacyMode,
    setActiveTab,
    activeSnapshots,
    takeSnapshot,
    deleteSnapshot,
  } = useApp();

  const currency = data.settings.currency;
  const numberFormat = data.settings.numberFormat;

  // Snapshot modal state
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [snapshotDate, setSnapshotDate] = useState(new Date().toISOString().slice(0, 10));
  const [showHistoryTable, setShowHistoryTable] = useState(false);

  // Pie chart data for asset categories (excluding liabilities)
  const assetPieData = CATEGORY_KEYS
    .filter((cat) => !CATEGORIES[cat].isLiability && (categoryTotals[cat] || 0) > 0)
    .map((cat) => ({
      name: CATEGORIES[cat].name,
      value: categoryTotals[cat],
      color: CATEGORIES[cat].color,
      key: cat,
      percentage: totalAssets > 0 ? ((categoryTotals[cat] / totalAssets) * 100).toFixed(1) : '0',
    }));

  // Profile-wise breakdown for consolidated view
  const profileBreakdown = data.profiles.map((p) => {
    const profileAssets = data.holdings
      .filter((h) => h.profileId === p.id && !CATEGORIES[h.category].isLiability)
      .reduce((sum, h) => sum + Number(h.currentValue || 0), 0);
    const profileLiabilities = data.holdings
      .filter((h) => h.profileId === p.id && CATEGORIES[h.category].isLiability)
      .reduce((sum, h) => sum + Number(h.currentValue || 0), 0);
    const pNetWorth = profileAssets - profileLiabilities;
    return {
      profile: p,
      assets: profileAssets,
      liabilities: profileLiabilities,
      netWorth: pNetWorth,
      share: totalAssets > 0 ? ((profileAssets / totalAssets) * 100).toFixed(1) : '0',
    };
  });

  // Net worth historical trajectory
  const trendData = useMemo(() => {
    const list = [...activeSnapshots].sort((a, b) => a.date.localeCompare(b.date));
    const nowMonth = `${new Date().toLocaleDateString('en-US', { month: 'short' })} ${new Date().getFullYear()}`;
    const mapped = list.map((s) => ({
      label: s.label,
      date: s.date,
      netWorth: s.netWorth,
      assets: s.totalAssets,
      liabilities: s.totalLiabilities,
      isLive: false,
    }));

    // If current portfolio isn't already saved as a snapshot today, append live point
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastSnap = list[list.length - 1];
    if (!lastSnap || lastSnap.date !== todayStr) {
      mapped.push({
        label: `Current (${nowMonth})`,
        date: todayStr,
        netWorth: netWorth,
        assets: totalAssets,
        liabilities: totalLiabilities,
        isLive: true,
      });
    }

    return mapped;
  }, [activeSnapshots, netWorth, totalAssets, totalLiabilities]);

  // Delta calculation compared to last recorded snapshot
  const previousSnapshot = activeSnapshots.length > 0
    ? activeSnapshots[activeSnapshots.length - 1]
    : null;

  const deltaValue = previousSnapshot ? netWorth - previousSnapshot.netWorth : null;
  const deltaPct = previousSnapshot && previousSnapshot.netWorth > 0
    ? ((deltaValue! / previousSnapshot.netWorth) * 100).toFixed(1)
    : null;

  const handleOpenSnapshotModal = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    setSnapshotLabel(`${monthNames[now.getMonth()]} ${now.getFullYear()}`);
    setSnapshotDate(now.toISOString().slice(0, 10));
    setIsSnapshotModalOpen(true);
  };

  const handleSaveSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    takeSnapshot(snapshotLabel.trim(), snapshotDate);
    setIsSnapshotModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner Context info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            {selectedProfileId === 'ALL'
              ? 'Consolidated Portfolio Overview'
              : `${activeProfile?.name || 'Profile'}'s Portfolio`}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-asset wealth allocation and historical net worth trajectory
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Take Snapshot button */}
          <button
            onClick={handleOpenSnapshotModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all shadow-sm"
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Save Snapshot</span>
          </button>

          <span
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border"
            style={{
              backgroundColor: activeProfile ? `${activeProfile.color}15` : '#06b6d415',
              borderColor: activeProfile ? `${activeProfile.color}40` : '#06b6d440',
              color: activeProfile ? activeProfile.color : '#06b6d4',
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: activeProfile ? activeProfile.color : '#06b6d4' }}
            />
            <span>{selectedProfileId === 'ALL' ? 'All Profiles' : activeProfile?.name}</span>
          </span>
        </div>
      </div>

      {/* KPI Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-800/50 p-5 shadow-xl">
          <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-xs text-cyan-300 font-semibold uppercase tracking-wider">
            <span>Total Net Worth</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-3xl font-extrabold tracking-tight text-slate-50 ${
                privacyMode ? 'privacy-blur' : ''
              }`}
            >
              {formatCurrency(netWorth, currency, numberFormat, privacyMode)}
            </div>

            {/* Monthly Delta Indicator */}
            {deltaValue !== null ? (
              <div className="text-[11px] font-semibold mt-1 flex items-center space-x-1.5">
                {deltaValue >= 0 ? (
                  <span className="text-emerald-400 flex items-center space-x-0.5">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>+{formatCurrency(deltaValue, currency, numberFormat, privacyMode)}</span>
                    <span>(+{deltaPct}%)</span>
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center space-x-0.5">
                    <ArrowDownRight className="h-3 w-3" />
                    <span>{formatCurrency(deltaValue, currency, numberFormat, privacyMode)}</span>
                    <span>({deltaPct}%)</span>
                  </span>
                )}
                <span className="text-slate-500 font-normal">vs {previousSnapshot?.label}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 mt-1">Assets minus Liabilities</div>
            )}
          </div>
        </div>

        {/* Total Assets Card */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-emerald-700/50 transition-all">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase tracking-wider">
            <span>Total Assets</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-extrabold tracking-tight text-emerald-400 ${
                privacyMode ? 'privacy-blur' : ''
              }`}
            >
              {formatCurrency(totalAssets, currency, numberFormat, privacyMode)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Across {assetPieData.length} active asset classes
            </div>
          </div>
        </div>

        {/* Total Liabilities Card */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-rose-700/50 transition-all">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold uppercase tracking-wider">
            <span>Total Liabilities</span>
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`text-2xl font-extrabold tracking-tight text-rose-400 ${
                privacyMode ? 'privacy-blur' : ''
              }`}
            >
              {formatCurrency(totalLiabilities, currency, numberFormat, privacyMode)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {categoryCounts.liabilities} loans & credit dues
            </div>
          </div>
        </div>

        {/* Debt-to-Asset Ratio */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold uppercase tracking-wider">
            <span>Debt-to-Asset Ratio</span>
            <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold tracking-tight text-slate-100">
                {debtToAssetRatio}%
              </span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                  debtToAssetRatio <= 30
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : debtToAssetRatio <= 50
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {debtToAssetRatio <= 30 ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Healthy</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    <span>{debtToAssetRatio <= 50 ? 'Moderate' : 'High Debt'}</span>
                  </>
                )}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  debtToAssetRatio <= 30
                    ? 'bg-emerald-500'
                    : debtToAssetRatio <= 50
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(2, debtToAssetRatio))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Net Worth Growth Trajectory (Monthly Snapshots Trend) */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-100">Net Worth Growth Trajectory</h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                {trendData.length} milestones
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly wealth milestones and progression over time
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <button
              onClick={() => setShowHistoryTable(!showHistoryTable)}
              className="text-slate-400 hover:text-slate-200 flex items-center space-x-1"
            >
              <History className="h-3.5 w-3.5" />
              <span>{showHistoryTable ? 'Hide Milestones' : 'Manage Milestones'}</span>
            </button>
            <button
              onClick={handleOpenSnapshotModal}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>+ Record Snapshot</span>
            </button>
          </div>
        </div>

        {/* Area Chart */}
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                tickFormatter={(val) => formatCompactCurrency(val, currency, privacyMode)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold text-slate-200">{d.label}</div>
                        <div className="text-[10px] text-slate-500">{d.date}</div>
                        <div className="pt-1.5 border-t border-slate-800 space-y-0.5">
                          <div className="flex justify-between space-x-3">
                            <span className="text-cyan-400 font-semibold">Net Worth:</span>
                            <span className="font-extrabold text-slate-100">
                              {formatCurrency(d.netWorth, currency, numberFormat, privacyMode)}
                            </span>
                          </div>
                          <div className="flex justify-between space-x-3 text-slate-400">
                            <span>Assets:</span>
                            <span>{formatCurrency(d.assets, currency, numberFormat, privacyMode)}</span>
                          </div>
                          <div className="flex justify-between space-x-3 text-slate-400">
                            <span>Liabilities:</span>
                            <span>{formatCurrency(d.liabilities, currency, numberFormat, privacyMode)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#netWorthGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Collapsible Milestones History Table */}
        {showHistoryTable && (
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>Recorded Monthly Snapshots</span>
            </div>

            {activeSnapshots.length > 0 ? (
              <div className="overflow-x-auto max-h-48">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                      <th className="py-2 px-3">Milestone Label</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3 text-right">Net Worth</th>
                      <th className="py-2 px-3 text-right">Assets</th>
                      <th className="py-2 px-3 text-right">Liabilities</th>
                      <th className="py-2 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {activeSnapshots.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2 px-3 font-semibold text-slate-200">{s.label}</td>
                        <td className="py-2 px-3 text-slate-400">{s.date}</td>
                        <td className="py-2 px-3 text-right font-bold text-cyan-400">
                          {formatCurrency(s.netWorth, currency, numberFormat, privacyMode)}
                        </td>
                        <td className="py-2 px-3 text-right text-emerald-400 font-medium">
                          {formatCurrency(s.totalAssets, currency, numberFormat, privacyMode)}
                        </td>
                        <td className="py-2 px-3 text-right text-rose-400 font-medium">
                          {formatCurrency(s.totalLiabilities, currency, numberFormat, privacyMode)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete snapshot "${s.label}"?`)) {
                                deleteSnapshot(s.id);
                              }
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete snapshot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                No monthly snapshots recorded yet. Click "+ Record Snapshot" or enable auto-snapshot on broker upload.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Visuals: Donut Chart & Liquidity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Asset Allocation Donut */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-100">Asset Allocation</h2>
              <p className="text-xs text-slate-400">Portfolio distribution across categories</p>
            </div>
            <div className="text-xs text-slate-400 font-medium">
              Total Assets:{' '}
              <span className="text-slate-200 font-semibold">
                {formatCompactCurrency(totalAssets, currency, privacyMode)}
              </span>
            </div>
          </div>

          {assetPieData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="w-full sm:w-1/2 h-64 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {assetPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-950/95 border border-slate-700 p-2.5 rounded-xl shadow-xl text-xs">
                              <div className="font-semibold text-slate-200">{item.name}</div>
                              <div className="text-emerald-400 font-bold mt-1">
                                {formatCurrency(item.value, currency, numberFormat, privacyMode)}
                              </div>
                              <div className="text-slate-400 mt-0.5">{item.percentage}% of total</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                    Total
                  </span>
                  <span className={`text-sm font-extrabold text-slate-100 ${privacyMode ? 'privacy-blur' : ''}`}>
                    {formatCompactCurrency(totalAssets, currency, privacyMode)}
                  </span>
                </div>
              </div>

              {/* Legend list */}
              <div className="w-full sm:w-1/2 space-y-2 max-h-64 overflow-y-auto pr-1">
                {assetPieData.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => setActiveTab('holdings')}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/50 hover:bg-slate-800/50 border border-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-3 h-3 rounded-md flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-slate-300 font-medium truncate">{item.name}</span>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className={`text-xs font-semibold text-slate-200 ${privacyMode ? 'privacy-blur' : ''}`}>
                        {formatCompactCurrency(item.value, currency, privacyMode)}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-sm">
              <Layers className="h-8 w-8 mb-2 opacity-50" />
              <span>No asset data recorded yet.</span>
            </div>
          )}
        </div>

        {/* Liquidity Breakdown & Profile Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Liquid vs Illiquid */}
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
            <h2 className="text-base font-bold text-slate-100 mb-1">Liquidity Profile</h2>
            <p className="text-xs text-slate-400 mb-4">Readily liquid vs locked-in wealth</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Liquid Assets (Equity, MFs, Gold, Receivables)</span>
                  <span className={`font-semibold text-cyan-400 ${privacyMode ? 'privacy-blur' : ''}`}>
                    {formatCurrency(liquidAssetsTotal, currency, numberFormat, privacyMode)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full transition-all duration-500"
                    style={{
                      width: `${totalAssets > 0 ? (liquidAssetsTotal / totalAssets) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {totalAssets > 0 ? ((liquidAssetsTotal / totalAssets) * 100).toFixed(1) : 0}% of portfolio
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Illiquid / Retirement (EPS, NPS, Bonds)</span>
                  <span className={`font-semibold text-purple-400 ${privacyMode ? 'privacy-blur' : ''}`}>
                    {formatCurrency(illiquidAssetsTotal, currency, numberFormat, privacyMode)}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full transition-all duration-500"
                    style={{
                      width: `${totalAssets > 0 ? (illiquidAssetsTotal / totalAssets) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  {totalAssets > 0 ? ((illiquidAssetsTotal / totalAssets) * 100).toFixed(1) : 0}% of portfolio
                </div>
              </div>
            </div>
          </div>

          {/* Profile-wise breakdown (if in Consolidated view) */}
          {selectedProfileId === 'ALL' && profileBreakdown.length > 1 && (
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-slate-100">Family Member Shares</h2>
                <span className="text-xs text-slate-400">{profileBreakdown.length} Profiles</span>
              </div>
              <div className="space-y-2.5">
                {profileBreakdown.map((item) => (
                  <div
                    key={item.profile.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.profile.color }} />
                      <span className="text-xs font-semibold text-slate-200">{item.profile.name}</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-bold text-slate-100 ${privacyMode ? 'privacy-blur' : ''}`}>
                        {formatCurrency(item.netWorth, currency, numberFormat, privacyMode)}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.share}% share</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 8 Category Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100">Asset & Liability Categories</h2>
            <p className="text-xs text-slate-400">Click any category to open and manage its records</p>
          </div>
          <button
            onClick={() => setActiveTab('holdings')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>View All in Holdings</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORY_KEYS.map((key) => {
            const meta = CATEGORIES[key];
            const Icon = ICON_MAP[meta.icon] || Layers;
            const total = categoryTotals[key] || 0;
            const count = categoryCounts[key] || 0;
            const isLiab = meta.isLiability;

            return (
              <div
                key={key}
                onClick={() => setActiveTab('holdings')}
                className="group p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all shadow-md hover:shadow-cyan-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className="p-2 rounded-xl"
                      style={{
                        backgroundColor: `${meta.color}20`,
                        color: meta.color,
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800">
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                  <div className="mt-3 font-semibold text-sm text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {meta.name}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-baseline justify-between">
                  <span
                    className={`text-base font-bold ${
                      isLiab ? 'text-rose-400' : 'text-slate-100'
                    } ${privacyMode ? 'privacy-blur' : ''}`}
                  >
                    {formatCurrency(total, currency, numberFormat, privacyMode)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {isLiab
                      ? 'Liability'
                      : totalAssets > 0
                      ? `${((total / totalAssets) * 100).toFixed(1)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Snapshot Modal */}
      {isSnapshotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Camera className="h-5 w-5 text-cyan-400" />
                <h3 className="text-base font-bold text-slate-100">Record Monthly Snapshot</h3>
              </div>
              <button
                onClick={() => setIsSnapshotModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSnapshot} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Snapshot Label *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nov 2026, Year-End 2026"
                  value={snapshotLabel}
                  onChange={(e) => setSnapshotLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Milestone Date
                </label>
                <input
                  type="date"
                  value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <div className="text-slate-400">Values to be recorded:</div>
                <div className="flex justify-between">
                  <span className="text-slate-300">Net Worth:</span>
                  <span className="font-bold text-cyan-400">
                    {formatCurrency(netWorth, currency, numberFormat, privacyMode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Assets:</span>
                  <span className="text-emerald-400">
                    {formatCurrency(totalAssets, currency, numberFormat, privacyMode)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Liabilities:</span>
                  <span className="text-rose-400">
                    {formatCurrency(totalLiabilities, currency, numberFormat, privacyMode)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
                >
                  Save Snapshot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
