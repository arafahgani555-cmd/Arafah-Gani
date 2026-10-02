/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { GuruDashboard } from './pages/guru/GuruDashboard';
import { SiswaDashboard } from './pages/siswa/SiswaDashboard';
import { DataStore } from './lib/dataStore';
import { GraduationCap, RotateCcw, ShieldCheck, MapPin } from 'lucide-react';

const MainContent: React.FC = () => {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
          <span className="text-xs text-blue-900 font-semibold tracking-wide">
            Memuat data LMS SMA Negeri 1 Batudaa Pantai...
          </span>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-50/80 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <HeroBanner />
        {role === 'admin' && <AdminDashboard />}
        {role === 'guru' && <GuruDashboard />}
        {role === 'siswa' && <SiswaDashboard />}
        {!role && <GuruDashboard />}
      </div>
    </main>
  );
};

export default function App() {
  const handleResetData = () => {
    if (confirm('Kembalikan semua data demo ke kondisi awal SMAN 1 Batudaa Pantai?')) {
      DataStore.resetAllToDefault();
      window.location.reload();
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <Navbar />
        <MainContent />

        {/* School Blue Footer */}
        <footer className="mt-auto border-t border-blue-100 bg-white py-6">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 text-white shadow-xs">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block leading-tight">
                  LMS SMA Negeri 1 Batudaa Pantai
                </span>
                <span className="text-[11px] text-slate-400">
                  Desa Kayubulan, Batudaa Pantai, Kab. Gorontalo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleResetData}
                className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-700 transition font-medium"
                title="Reset data demo kembali ke awal"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Data Demo
              </button>
              <span className="text-slate-300">|</span>
              <span className="flex items-center gap-1 text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                <ShieldCheck className="h-3 w-3" />
                PostgreSQL & Supabase Ready
              </span>
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
