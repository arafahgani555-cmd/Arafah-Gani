import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Shield, 
  BookOpen, 
  Database, 
  LogOut, 
  LogIn, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';
import { SupabaseConfigModal } from './SupabaseConfigModal';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
  const { currentUser, role, isCloudConnected, logout, switchTestRole } = useAuth();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white/95 shadow-xs backdrop-blur-md">
        {/* Top subtle blue accent hairline */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-700 via-sky-500 to-indigo-700" />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Zone 1: School Identity Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 via-sky-600 to-indigo-800 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-100">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-slate-900 block leading-tight">
                SMAN 1 Batudaa Pantai
              </span>
              <span className="text-[11px] font-semibold text-sky-700 tracking-wide">
                LMS Terpadu · Gorontalo
              </span>
            </div>
          </div>

          {/* Zone 2: Segmented Role Switcher (Blue Theme) */}
          <div className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100/90 p-1 border border-slate-200">
            <button
              onClick={() => switchTestRole('admin')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'admin' 
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-600/30' 
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/60'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin TU</span>
            </button>
            <button
              onClick={() => switchTestRole('guru')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'guru' 
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-600/30' 
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Guru</span>
            </button>
            <button
              onClick={() => switchTestRole('siswa')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                role === 'siswa' 
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-600/30' 
                  : 'text-slate-600 hover:text-blue-700 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Siswa</span>
            </button>
          </div>

          {/* Zone 3: Database status & Account actions */}
          <div className="flex items-center gap-2.5">
            {/* Supabase status indicator button */}
            <button
              onClick={() => setIsConfigOpen(true)}
              title="Atur koneksi PostgreSQL Supabase"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors shadow-2xs ${
                isCloudConnected
                  ? 'bg-sky-50 text-blue-800 border-blue-200 hover:bg-blue-100/70'
                  : 'bg-blue-50/70 text-blue-900 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <Database className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden sm:inline font-semibold">
                {isCloudConnected ? 'Supabase Aktif' : 'Mode Demo Lokal'}
              </span>
              {isCloudConnected ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {currentUser.nama}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-700 capitalize">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Keluar dari akun"
                  className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-sm shadow-blue-700/20"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Masuk</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-bar for Role Switcher */}
        <div className="flex md:hidden border-t border-blue-50 px-4 py-1.5 bg-blue-50/50 justify-around text-xs">
          <button
            onClick={() => switchTestRole('admin')}
            className={`font-semibold py-1 px-3 rounded-lg transition ${role === 'admin' ? 'bg-blue-700 text-white' : 'text-slate-600'}`}
          >
            Admin TU
          </button>
          <button
            onClick={() => switchTestRole('guru')}
            className={`font-semibold py-1 px-3 rounded-lg transition ${role === 'guru' ? 'bg-blue-700 text-white' : 'text-slate-600'}`}
          >
            Guru
          </button>
          <button
            onClick={() => switchTestRole('siswa')}
            className={`font-semibold py-1 px-3 rounded-lg transition ${role === 'siswa' ? 'bg-blue-700 text-white' : 'text-slate-600'}`}
          >
            Siswa
          </button>
        </div>
      </header>

      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onCredentialsUpdated={() => {}}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
};
