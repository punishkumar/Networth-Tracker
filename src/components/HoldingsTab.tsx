import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieIcon,
  Landmark,
  Coins,
  HandCoins,
  Briefcase,
  ShieldCheck,
  CreditCard,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  Edit2,
  Trash2,
  Maximize2,
  Minimize2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, CATEGORY_KEYS, formatCurrency } from '../utils/formatters';
import { CategoryType, HoldingRecord } from '../types';
import { HoldingModal } from './HoldingModal';

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

export const HoldingsTab: React.FC = () => {
  const {
    data,
    activeHoldings,
    selectedProfileId,
    activeProfile,
    deleteHolding,
    privacyMode,
  } = useApp();

  const currency = data.settings.currency;
  const numberFormat = data.settings.numberFormat;

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Accordion open/close state for the 8 sections
  const [openSections, setOpenSections] = useState<Record<CategoryType, boolean>>({
    equity: true,
    mutual_funds: true,
    bonds: true,
    gold: true,
    receivables: false,
    eps: false,
    nps: false,
    liabilities: true,
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetCategory, setTargetCategory] = useState<CategoryType>('equity');
  const [editingRecord, setEditingRecord] = useState<HoldingRecord | null>(null);

  const toggleSection = (cat: CategoryType) => {
    setOpenSections((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const expandAll = () => {
    const allOpen: Record<CategoryType, boolean> = {
      equity: true,
      mutual_funds: true,
      bonds: true,
      gold: true,
      receivables: true,
      eps: true,
      nps: true,
      liabilities: true,
    };
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<CategoryType, boolean> = {
      equity: false,
      mutual_funds: false,
      bonds: false,
      gold: false,
      receivables: false,
      eps: false,
      nps: false,
      liabilities: false,
    };
    setOpenSections(allClosed);
  };

  const handleOpenAddModal = (cat: CategoryType, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTargetCategory(cat);
    setEditingRecord(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rec: HoldingRecord) => {
    setEditingRecord(rec);
    setTargetCategory(rec.category);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteHolding(id);
    }
  };

  // Filtered records by search
  const filteredHoldings = activeHoldings.filter((h) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      h.name.toLowerCase().includes(q) ||
      (h.institutionOrFolio && h.institutionOrFolio.toLowerCase().includes(q)) ||
      (h.notes && h.notes.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Holdings & Category Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your assets and liabilities under collapsible sections. Edits reflect instantly in the dashboard.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={expandAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Expand All</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-xs text-slate-300 font-medium transition-colors"
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span>Collapse All</span>
          </button>
          <button
            onClick={() => handleOpenAddModal('equity')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Search & Profile Scope Pill */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search records by name, broker, folio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Active Scope:</span>
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border"
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
            <span>{selectedProfileId === 'ALL' ? 'Consolidated (All Profiles)' : activeProfile?.name}</span>
          </span>
          <span className="text-slate-500">({filteredHoldings.length} total entries)</span>
        </div>
      </div>

      {/* 8 Collapsible Sections */}
      <div className="space-y-4">
        {CATEGORY_KEYS.map((catKey) => {
          const meta = CATEGORIES[catKey];
          const Icon = ICON_MAP[meta.icon] || TrendingUp;
          const isOpen = openSections[catKey];

          // Items in this section
          const sectionItems = filteredHoldings.filter((h) => h.category === catKey);
          const sectionTotal = sectionItems.reduce((acc, h) => acc + (Number(h.currentValue) || 0), 0);

          return (
            <div
              key={catKey}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-lg transition-all"
            >
              {/* Accordion Header */}
              <div
                onClick={() => toggleSection(catKey)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/40 select-none transition-colors"
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className="p-2.5 rounded-xl shadow-md"
                    style={{
                      backgroundColor: `${meta.color}20`,
                      color: meta.color,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-100">{meta.name}</h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                        {sectionItems.length} {sectionItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 hidden sm:block mt-0.5">
                      {meta.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {/* Total Value Badge */}
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-semibold text-slate-500">
                      {meta.isLiability ? 'Total Due' : 'Total Value'}
                    </div>
                    <div
                      className={`text-base font-extrabold ${
                        meta.isLiability ? 'text-rose-400' : 'text-slate-100'
                      } ${privacyMode ? 'privacy-blur' : ''}`}
                    >
                      {formatCurrency(sectionTotal, currency, numberFormat, privacyMode)}
                    </div>
                  </div>

                  {/* Add button inside header */}
                  <button
                    onClick={(e) => handleOpenAddModal(catKey, e)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700 text-slate-300 transition-all text-xs font-semibold flex items-center space-x-1"
                    title={`Add record to ${meta.name}`}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Add</span>
                  </button>

                  {/* Expand / Collapse Chevron */}
                  <div className="text-slate-400 hover:text-slate-200">
                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </div>

              {/* Accordion Content Body */}
              {isOpen && (
                <div className="border-t border-slate-800/80 bg-slate-950/40 p-4">
                  {sectionItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                            <th className="py-2.5 px-3">Asset / Item Name</th>
                            {selectedProfileId === 'ALL' && (
                              <th className="py-2.5 px-3">Profile</th>
                            )}
                            <th className="py-2.5 px-3">Quantity / Units</th>
                            <th className="py-2.5 px-3">Current Price</th>
                            <th className="py-2.5 px-3">Institution / Folio</th>
                            <th className="py-2.5 px-3 text-right">Current Value</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sectionItems.map((rec) => {
                            const prof = data.profiles.find((p) => p.id === rec.profileId);
                            return (
                              <tr
                                key={rec.id}
                                className="hover:bg-slate-800/30 transition-colors group"
                              >
                                <td className="py-3 px-3 font-semibold text-slate-200">
                                  <div>{rec.name}</div>
                                  {rec.notes && (
                                    <div className="text-[10px] text-slate-500 font-normal">
                                      {rec.notes}
                                    </div>
                                  )}
                                  {rec.interestRate && (
                                    <span className="text-[10px] text-purple-400 font-normal mr-2">
                                      {rec.interestRate}% Int.
                                    </span>
                                  )}
                                  {rec.emi && (
                                    <span className="text-[10px] text-rose-400 font-normal">
                                      EMI: ₹{rec.emi.toLocaleString()}
                                    </span>
                                  )}
                                </td>

                                {selectedProfileId === 'ALL' && (
                                  <td className="py-3 px-3">
                                    <span
                                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                                      style={{
                                        backgroundColor: prof ? `${prof.color}15` : '#64748b15',
                                        borderColor: prof ? `${prof.color}40` : '#64748b40',
                                        color: prof ? prof.color : '#94a3b8',
                                      }}
                                    >
                                      <span
                                        className="w-1.5 h-1.5 rounded-full"
                                        style={{ backgroundColor: prof ? prof.color : '#94a3b8' }}
                                      />
                                      <span>{prof ? prof.name : 'Unknown'}</span>
                                    </span>
                                  </td>
                                )}

                                <td className="py-3 px-3 text-slate-300">
                                  {rec.units !== undefined
                                    ? rec.category === 'gold'
                                      ? `${rec.units}g`
                                      : rec.units
                                    : '-'}
                                </td>

                                <td className="py-3 px-3 text-slate-300">
                                  {rec.currentPrice
                                    ? formatCurrency(rec.currentPrice, currency, numberFormat, privacyMode)
                                    : '-'}
                                </td>

                                <td className="py-3 px-3 text-slate-400">
                                  {rec.institutionOrFolio || '-'}
                                </td>

                                <td className="py-3 px-3 text-right font-bold text-slate-100">
                                  <span
                                    className={`${
                                      meta.isLiability ? 'text-rose-400' : 'text-emerald-400'
                                    } ${privacyMode ? 'privacy-blur' : ''}`}
                                  >
                                    {formatCurrency(rec.currentValue, currency, numberFormat, privacyMode)}
                                  </span>
                                </td>

                                <td className="py-3 px-3 text-right">
                                  <div className="flex items-center justify-end space-x-1.5">
                                    <button
                                      onClick={() => handleOpenEditModal(rec)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                      title="Edit record"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(rec.id, rec.name)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                      title="Delete record"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-slate-500 text-xs">
                      <AlertCircle className="h-6 w-6 mb-2 opacity-40 text-slate-400" />
                      <span>No {meta.name} records found.</span>
                      <button
                        onClick={() => handleOpenAddModal(catKey)}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add First Record</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Holding Add / Edit Modal */}
      <HoldingModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRecord(null);
        }}
        initialCategory={targetCategory}
        initialRecord={editingRecord}
      />
    </div>
  );
};
