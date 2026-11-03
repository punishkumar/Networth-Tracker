import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  UploadCloud,
  Users,
  Settings,
  Eye,
  EyeOff,
  Plus,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

interface NavbarProps {
  onOpenNewProfileModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewProfileModal }) => {
  const {
    data,
    selectedProfileId,
    setSelectedProfileId,
    activeTab,
    setActiveTab,
    privacyMode,
    togglePrivacyMode,
    netWorth,
  } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const activeProfile =
    selectedProfileId === 'ALL'
      ? null
      : data.profiles.find((p) => p.id === selectedProfileId);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  Networth Tracker
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                  Offline
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                <span>Net Worth:</span>
                <span className={`font-semibold text-emerald-400 ${privacyMode ? 'privacy-blur' : ''}`}>
                  {formatCurrency(netWorth, data.settings.currency, data.settings.numberFormat, privacyMode)}
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/70 p-1.5 rounded-xl border border-slate-800/80 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('holdings')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'holdings'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span>Holdings</span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              <span>Broker Upload</span>
            </button>

            <button
              onClick={() => setActiveTab('profiles')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'profiles'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Profiles</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-teal-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Right Controls: Profile Selector & Privacy Mode */}
          <div className="flex items-center space-x-3">
            {/* Privacy Mode Toggle */}
            <button
              onClick={togglePrivacyMode}
              title={privacyMode ? 'Disable Privacy Blur' : 'Enable Privacy Blur'}
              className={`p-2 rounded-lg border transition-all ${
                privacyMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-2 ring-amber-500/20'
                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {privacyMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-sm"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: activeProfile ? activeProfile.color : '#06b6d4',
                  }}
                />
                <span className="font-medium text-slate-200 max-w-[120px] truncate">
                  {selectedProfileId === 'ALL' ? 'Consolidated View' : activeProfile?.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {isProfileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Select Scope
                    </div>

                    {/* Consolidated option */}
                    <button
                      onClick={() => {
                        setSelectedProfileId('ALL');
                        setIsProfileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                        selectedProfileId === 'ALL'
                          ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" />
                        <span>Consolidated (All Profiles)</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {data.profiles.length} profiles
                      </span>
                    </button>

                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-t border-b border-slate-800 mt-1">
                      Individual Profiles
                    </div>

                    {data.profiles.map((prof) => (
                      <button
                        key={prof.id}
                        onClick={() => {
                          setSelectedProfileId(prof.id);
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                          selectedProfileId === prof.id
                            ? 'bg-cyan-500/15 text-cyan-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: prof.color }}
                          />
                          <span className="truncate max-w-[140px]">{prof.name}</span>
                        </div>
                        {prof.isDefault && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            Primary
                          </span>
                        )}
                      </button>
                    ))}

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenNewProfileModal();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add New Profile...</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
