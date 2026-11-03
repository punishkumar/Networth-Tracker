import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { HoldingsTab } from './components/HoldingsTab';
import { BrokerUploadTab } from './components/BrokerUploadTab';
import { ProfilesTab } from './components/ProfilesTab';
import { SettingsTab } from './components/SettingsTab';
import { ProfileModal } from './components/ProfileModal';
import { ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, isLoading } = useApp();
  const [isNewProfileModalOpen, setIsNewProfileModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center animate-pulse">
          <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">
          Loading Portfolio Database...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Fixed Header */}
      <Navbar onOpenNewProfileModal={() => setIsNewProfileModalOpen(true)} />

      {/* Main Tab Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'holdings' && <HoldingsTab />}
        {activeTab === 'upload' && <BrokerUploadTab />}
        {activeTab === 'profiles' && <ProfilesTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* New Profile Quick Modal */}
      <ProfileModal
        isOpen={isNewProfileModalOpen}
        onClose={() => setIsNewProfileModalOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
};

export default App;
