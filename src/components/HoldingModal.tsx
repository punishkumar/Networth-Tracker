import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CategoryType, HoldingRecord } from '../types';
import { CATEGORIES, CATEGORY_KEYS } from '../utils/formatters';
import { useApp } from '../context/AppContext';

interface HoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CategoryType;
  initialRecord?: HoldingRecord | null;
}

export const HoldingModal: React.FC<HoldingModalProps> = ({
  isOpen,
  onClose,
  initialCategory = 'equity',
  initialRecord,
}) => {
  const { data, addHolding, updateHolding } = useApp();

  const [category, setCategory] = useState<CategoryType>(initialCategory);
  const [profileId, setProfileId] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [units, setUnits] = useState<string>('');
  const [avgPrice, setAvgPrice] = useState<string>('');
  const [currentPrice, setCurrentPrice] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [institutionOrFolio, setInstitutionOrFolio] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [interestRate, setInterestRate] = useState<string>('');
  const [emi, setEmi] = useState<string>('');
  const [subType, setSubType] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialRecord) {
      setCategory(initialRecord.category);
      setProfileId(initialRecord.profileId);
      setName(initialRecord.name);
      setUnits(initialRecord.units ? String(initialRecord.units) : '');
      setAvgPrice(initialRecord.avgPrice ? String(initialRecord.avgPrice) : '');
      setCurrentPrice(initialRecord.currentPrice ? String(initialRecord.currentPrice) : '');
      setCurrentValue(String(initialRecord.currentValue || ''));
      setInstitutionOrFolio(initialRecord.institutionOrFolio || '');
      setNotes(initialRecord.notes || '');
      setDueDate(initialRecord.dueDate || '');
      setInterestRate(initialRecord.interestRate ? String(initialRecord.interestRate) : '');
      setEmi(initialRecord.emi ? String(initialRecord.emi) : '');
      setSubType(initialRecord.subType || '');
    } else {
      setCategory(initialCategory);
      setProfileId(data.profiles[0]?.id || '');
      setName('');
      setUnits('');
      setAvgPrice('');
      setCurrentPrice('');
      setCurrentValue('');
      setInstitutionOrFolio('');
      setNotes('');
      setDueDate('');
      setInterestRate('');
      setEmi('');
      setSubType('');
    }
    setError('');
  }, [initialRecord, initialCategory, isOpen, data.profiles]);

  // Auto calculate current value if units and currentPrice are provided
  const handleUnitsOrPriceChange = (newUnits: string, newPrice: string) => {
    const u = parseFloat(newUnits);
    const p = parseFloat(newPrice);
    if (!isNaN(u) && !isNaN(p) && u > 0 && p > 0) {
      setCurrentValue(String(Math.round(u * p)));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a name or description for this record.');
      return;
    }
    const val = parseFloat(currentValue);
    if (isNaN(val) || val < 0) {
      setError('Please provide a valid current value (0 or greater).');
      return;
    }
    if (!profileId) {
      setError('Please select a profile.');
      return;
    }

    const payload = {
      profileId,
      category,
      name: name.trim(),
      units: units ? parseFloat(units) : undefined,
      avgPrice: avgPrice ? parseFloat(avgPrice) : undefined,
      currentPrice: currentPrice ? parseFloat(currentPrice) : undefined,
      currentValue: val,
      institutionOrFolio: institutionOrFolio.trim() || undefined,
      notes: notes.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
      interestRate: interestRate ? parseFloat(interestRate) : undefined,
      emi: emi ? parseFloat(emi) : undefined,
      subType: subType.trim() || undefined,
    };

    if (initialRecord) {
      updateHolding(initialRecord.id, payload);
    } else {
      addHolding(payload);
    }

    onClose();
  };

  const meta = CATEGORIES[category];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {initialRecord ? 'Edit Investment / Record' : 'Add New Record'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tagged to {meta.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category & Profile Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryType)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {CATEGORY_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {CATEGORIES[k].name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Assign Profile
              </label>
              <select
                value={profileId}
                onChange={(e) => setProfileId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {data.profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isDefault ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Name / Asset Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {category === 'liabilities'
                ? 'Loan or Liability Name'
                : category === 'receivables'
                ? 'Debtor / Receivable Name'
                : category === 'eps' || category === 'nps'
                ? 'Account / Provider Name'
                : 'Asset / Ticker / Fund Name'} *
            </label>
            <input
              type="text"
              required
              placeholder={
                category === 'equity'
                  ? 'e.g. Reliance Industries, TCS'
                  : category === 'mutual_funds'
                  ? 'e.g. Parag Parikh Flexi Cap Fund'
                  : category === 'gold'
                  ? 'e.g. 24K Physical Bar, SGB 2028'
                  : category === 'liabilities'
                  ? 'e.g. HDFC Home Loan, Credit Card'
                  : 'e.g. Account or holding title'
              }
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Current Value (Hero input) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Current Total Value ({data.settings.currency}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-500 font-semibold text-sm">
                {data.settings.currency === 'INR' ? '₹' : '$'}
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl pl-8 pr-3 py-2.5 text-base font-bold text-slate-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>
          </div>

          {/* Units, Avg Price, Current Price (Optional for traded assets) */}
          {(category === 'equity' || category === 'mutual_funds' || category === 'gold' || category === 'bonds') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {category === 'gold' ? 'Quantity (Grams)' : 'Units / Quantity'}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 50"
                  value={units}
                  onChange={(e) => {
                    setUnits(e.target.value);
                    handleUnitsOrPriceChange(e.target.value, currentPrice);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Avg Buy Price
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 2400"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Current Market Price
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 2800"
                  value={currentPrice}
                  onChange={(e) => {
                    setCurrentPrice(e.target.value);
                    handleUnitsOrPriceChange(units, e.target.value);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Specific Attributes for Bonds / Liabilities */}
          {(category === 'bonds' || category === 'liabilities') && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 8.5"
                  value={interestRate}
                  onChange={(e) => setInterestRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {category === 'liabilities' && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Monthly EMI
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 25000"
                    value={emi}
                    onChange={(e) => setEmi(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  {category === 'liabilities' ? 'Maturity / End Date' : 'Maturity Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Institution / Folio / Broker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {category === 'eps'
                  ? 'UAN / Member ID'
                  : category === 'nps'
                  ? 'PRAN Number'
                  : category === 'mutual_funds'
                  ? 'Folio Number'
                  : category === 'liabilities'
                  ? 'Lender / Bank'
                  : 'Broker / Institution'}
              </label>
              <input
                type="text"
                placeholder="e.g. Zerodha, HDFC Bank, EPFO"
                value={institutionOrFolio}
                onChange={(e) => setInstitutionOrFolio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Notes / Tags
              </label>
              <input
                type="text"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{initialRecord ? 'Save Changes' : 'Add Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
