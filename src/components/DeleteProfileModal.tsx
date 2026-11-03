import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, Check } from 'lucide-react';
import { Profile } from '../types';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

interface DeleteProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
}

export const DeleteProfileModal: React.FC<DeleteProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
}) => {
  const { data, deleteProfile, setSelectedProfileId } = useApp();

  const [deleteMode, setDeleteMode] = useState<'delete_records' | 'reassign'>('delete_records');
  const [reassignTargetId, setReassignTargetId] = useState<string>('');

  if (!isOpen || !profile) return null;

  const otherProfiles = data.profiles.filter((p) => p.id !== profile.id);
  const targetReassignProfile = reassignTargetId || otherProfiles[0]?.id;

  const profileHoldings = data.holdings.filter((h) => h.profileId === profile.id);
  const profileTotalValue = profileHoldings.reduce(
    (sum, h) => sum + (Number(h.currentValue) || 0),
    0
  );

  const handleConfirmDelete = () => {
    if (deleteMode === 'reassign' && targetReassignProfile) {
      deleteProfile(profile.id, targetReassignProfile);
    } else {
      // Delete profile AND all its holdings (reducing net worth)
      deleteProfile(profile.id, undefined);
    }

    // If only 1 profile remains, switch scope to that profile
    if (otherProfiles.length === 1) {
      setSelectedProfileId(otherProfiles[0].id);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2 text-rose-400">
            <Trash2 className="h-5 w-5" />
            <h3 className="text-base font-bold text-slate-100">
              Delete Profile: "{profile.name}"
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Profile stats badge */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-slate-950"
                style={{ backgroundColor: profile.color }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-200">{profile.name}</div>
                <div className="text-xs text-slate-400">
                  {profileHoldings.length} investment {profileHoldings.length === 1 ? 'record' : 'records'}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[10px] uppercase text-slate-500 font-semibold">Total Value</div>
              <div className="text-sm font-bold text-slate-100">
                {formatCurrency(profileTotalValue, data.settings.currency, data.settings.numberFormat)}
              </div>
            </div>
          </div>

          {/* Action Choice */}
          {profileHoldings.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300">
                What should happen to the {profileHoldings.length} records in this profile?
              </p>

              {/* Option 1: Delete all records (Reduces net worth) */}
              <div
                onClick={() => setDeleteMode('delete_records')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  deleteMode === 'delete_records'
                    ? 'bg-rose-500/15 border-rose-500/60 ring-1 ring-rose-500/30'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="deleteChoice"
                    checked={deleteMode === 'delete_records'}
                    onChange={() => setDeleteMode('delete_records')}
                    className="text-rose-500 cursor-pointer"
                  />
                  <span className="font-bold text-xs text-rose-300">
                    Delete profile AND delete all {profileHoldings.length} records
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-5">
                  Permanently removes these assets from your database and <span className="text-slate-200 font-semibold">reduces your total net worth</span> by {formatCurrency(profileTotalValue, data.settings.currency, data.settings.numberFormat)}.
                </p>
              </div>

              {/* Option 2: Reassign records */}
              {otherProfiles.length > 0 && (
                <div
                  onClick={() => setDeleteMode('reassign')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    deleteMode === 'reassign'
                      ? 'bg-cyan-500/15 border-cyan-500/60 ring-1 ring-cyan-500/30'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="deleteChoice"
                      checked={deleteMode === 'reassign'}
                      onChange={() => setDeleteMode('reassign')}
                      className="text-cyan-500 cursor-pointer"
                    />
                    <span className="font-bold text-xs text-slate-200">
                      Keep records and reassign to another profile
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 pl-5">
                    Transfers all {profileHoldings.length} records to another profile so your consolidated net worth stays the same.
                  </p>

                  {deleteMode === 'reassign' && (
                    <div className="mt-2.5 pl-5">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Select target profile:
                      </label>
                      <select
                        value={targetReassignProfile}
                        onChange={(e) => setReassignTargetId(e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 w-full focus:outline-none focus:border-cyan-500"
                      >
                        {otherProfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              This profile has 0 records. Deleting it will remove the profile completely.
            </p>
          )}

          {/* Warning badge */}
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-2 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>This action cannot be undone.</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>
                {deleteMode === 'delete_records' && profileHoldings.length > 0
                  ? 'Delete Profile & Records'
                  : 'Delete Profile'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
