import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Profile } from '../types';
import { CATEGORIES, formatCurrency } from '../utils/formatters';
import { ProfileModal } from './ProfileModal';
import { DeleteProfileModal } from './DeleteProfileModal';

export const ProfilesTab: React.FC = () => {
  const {
    data,
    setSelectedProfileId,
    setActiveTab,
    privacyMode,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<Profile | null>(null);

  const currency = data.settings.currency;
  const numberFormat = data.settings.numberFormat;

  const handleEdit = (p: Profile) => {
    setEditingProfile(p);
    setIsModalOpen(true);
  };

  const handleDelete = (p: Profile) => {
    if (data.profiles.length <= 1) {
      alert('You cannot delete the only remaining profile. You must have at least one profile.');
      return;
    }
    setDeletingProfile(p);
  };

  const handleSelectProfileForView = (id: string) => {
    setSelectedProfileId(id);
    setActiveTab('dashboard');
  };

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Profile & Family Management
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize investments under individual profiles (e.g. Self, Spouse, Parents, HUF). View individual or consolidated net worth.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProfile(null);
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Profile</span>
        </button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.profiles.map((p) => {
          const profileHoldings = data.holdings.filter((h) => h.profileId === p.id);
          const assets = profileHoldings
            .filter((h) => !CATEGORIES[h.category].isLiability)
            .reduce((sum, h) => sum + (Number(h.currentValue) || 0), 0);
          const liabilities = profileHoldings
            .filter((h) => CATEGORIES[h.category].isLiability)
            .reduce((sum, h) => sum + (Number(h.currentValue) || 0), 0);
          const pNetWorth = assets - liabilities;

          return (
            <div
              key={p.id}
              className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Profile Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-slate-950 shadow-md"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-slate-100">{p.name}</span>
                        {p.isDefault && (
                          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                            Primary
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {profileHoldings.length} {profileHoldings.length === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {data.profiles.length > 1 && (
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-5 space-y-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Net Worth:</span>
                    <span
                      className={`font-extrabold text-sm text-slate-100 ${
                        privacyMode ? 'privacy-blur' : ''
                      }`}
                    >
                      {formatCurrency(pNetWorth, currency, numberFormat, privacyMode)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Assets:</span>
                    <span
                      className={`font-semibold text-emerald-400 ${
                        privacyMode ? 'privacy-blur' : ''
                      }`}
                    >
                      {formatCurrency(assets, currency, numberFormat, privacyMode)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Liabilities:</span>
                    <span
                      className={`font-semibold text-rose-400 ${
                        privacyMode ? 'privacy-blur' : ''
                      }`}
                    >
                      {formatCurrency(liabilities, currency, numberFormat, privacyMode)}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Dashboard Button */}
              <button
                onClick={() => handleSelectProfileForView(p.id)}
                className="mt-4 w-full flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 transition-colors"
              >
                <span>View {p.name}'s Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5 text-cyan-400" />
              </button>
            </div>
          );
        })}
      </div>

      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        editingProfile={editingProfile}
      />

      <DeleteProfileModal
        isOpen={deletingProfile !== null}
        onClose={() => setDeletingProfile(null)}
        profile={deletingProfile}
      />
    </div>
  );
};
