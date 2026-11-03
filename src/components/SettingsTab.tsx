import React from 'react';
import {
  Settings,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Check,
  HardDrive,
  FileJson,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsTab: React.FC = () => {
  const {
    data,
    updateSettings,
    exportBackup,
    importBackup,
    resetToSampleData,
    clearAllData,
    privacyMode,
    togglePrivacyMode,
  } = useApp();

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          Preferences & Data Management
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure display formats, backup your database, and manage your local offline portfolio.
        </p>
      </div>

      {/* Display & Numbering Preferences */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <Settings className="h-4 w-4 text-cyan-400" />
          <span>Display & Currency Preferences</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Currency
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ currency: 'INR' })}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  data.settings.currency === 'INR'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>₹ Indian Rupee (INR)</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ currency: 'USD' })}
                className={`flex items-center justify-center space-x-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  data.settings.currency === 'USD'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>$ US Dollar (USD)</span>
              </button>
            </div>
          </div>

          {/* Number Notation */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Number Notation Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ numberFormat: 'indian' })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  data.settings.numberFormat === 'indian'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Indian System</span>
                <span className="text-[10px] text-slate-500 font-normal mt-0.5">₹ 15,25,000 (Lakhs/Cr)</span>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ numberFormat: 'international' })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  data.settings.numberFormat === 'international'
                    ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>International System</span>
                <span className="text-[10px] text-slate-500 font-normal mt-0.5">$ 1,525,000 (Millions)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Privacy Mode Toggle row */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <span>Stealth / Privacy Mode</span>
              {privacyMode && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Blurs financial values across the app so you can open it around peers safely.
            </p>
          </div>

          <button
            onClick={togglePrivacyMode}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              privacyMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {privacyMode ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Blur Enabled</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Enable Blur</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backup & Restore */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <HardDrive className="h-4 w-4 text-emerald-400" />
          <span>Local Backup & Restore (JSON)</span>
        </h2>
        <p className="text-xs text-slate-400">
          Your data is stored 100% locally on your computer. You can export a full backup anytime to keep a safe copy or restore on a new PC.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={exportBackup}
            className="flex items-center justify-center space-x-2.5 p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs transition-all shadow-md group"
          >
            <Download className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span>Export Backup (.JSON)</span>
          </button>

          <button
            onClick={importBackup}
            className="flex items-center justify-center space-x-2.5 p-4 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs transition-all shadow-md group"
          >
            <Upload className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Restore Backup From File</span>
          </button>
        </div>
      </div>

      {/* Data Reset & Clearing */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 shadow-xl space-y-6">
        <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
          <RotateCcw className="h-4 w-4 text-amber-400" />
          <span>Data Reset Options</span>
        </h2>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div>
            <div className="text-xs font-bold text-slate-200">Load Sample Portfolio</div>
            <div className="text-xs text-slate-400">
              Populates demo records across all 8 asset categories (Stocks, MFs, Gold, SGBs, EPF, NPS, Home Loan).
            </div>
          </div>
          <button
            onClick={resetToSampleData}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors whitespace-nowrap"
          >
            Load Sample Data
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div>
            <div className="text-xs font-bold text-rose-400">Clear All Records</div>
            <div className="text-xs text-slate-400">
              Permanently wipes all portfolio holdings and resets profiles to start fresh.
            </div>
          </div>
          <button
            onClick={clearAllData}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            Clear All Data
          </button>
        </div>
      </div>

      {/* Security & Offline Guarantee */}
      <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-start space-x-3 text-xs text-slate-300">
        <ShieldCheck className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-cyan-300">100% Privacy & Offline Guarantee</div>
          <div className="text-slate-400 leading-relaxed">
            Networth Tracker operates entirely on your device. No financial records, tickers, or balances are ever uploaded to any server or cloud API. Your data is stored in your personal user data folder (`%APPDATA%/NetworthTracker/networth_data.json`).
          </div>
        </div>
      </div>
    </div>
  );
};
