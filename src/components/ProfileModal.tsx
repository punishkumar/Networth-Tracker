import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Profile } from '../types';
import { useApp } from '../context/AppContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProfile?: Profile | null;
}

const PRESET_COLORS = [
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#3b82f6', // blue
  '#a855f7', // purple
  '#f59e0b', // amber
  '#f43f5e', // rose
  '#ec4899', // pink
  '#14b8a6', // teal
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  editingProfile,
}) => {
  const { addProfile, updateProfile } = useApp();
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingProfile) {
      setName(editingProfile.name);
      setColor(editingProfile.color);
    } else {
      setName('');
      setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    }
    setError('');
  }, [editingProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a profile name (e.g. Self, Spouse, Child, HUF).');
      return;
    }

    if (editingProfile) {
      updateProfile(editingProfile.id, name.trim(), color);
    } else {
      addProfile(name.trim(), color);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100">
              {editingProfile ? 'Edit Profile' : 'Create New Profile'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tag and organize investment records by family member or entity
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Profile Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Self, Spouse, Family Trust, Parents"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Color Identifier
            </label>
            <div className="flex items-center space-x-2.5 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
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
              className="flex items-center space-x-2 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>{editingProfile ? 'Save Changes' : 'Create Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
