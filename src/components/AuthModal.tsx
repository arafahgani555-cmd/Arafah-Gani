import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/database';
import { X, LogIn, UserPlus, Shield, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { login, signUp, switchTestRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [role, setRole] = useState<UserRole>('guru');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (isRegister) {
      if (!nama.trim() || !email.trim() || !password) {
        setError('Harap lengkapi semua kolom form.');
        setIsSubmitting(false);
        return;
      }
      const res = await signUp(nama, email, password, role);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Gagal mendaftar');
      }
    } else {
      if (!email.trim()) {
        setError('Masukkan email Anda.');
        setIsSubmitting(false);
        return;
      }
      const res = await login(email, password);
      setIsSubmitting(false);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Gagal masuk');
      }
    }
  };

  const handleQuickRole = async (targetRole: UserRole) => {
    setIsSubmitting(true);
    await switchTestRole(targetRole);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
              <GraduationCap className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {isRegister ? 'Pendaftaran Akun LMS' : 'Masuk ke Portal LMS'}
              </h3>
              <p className="text-[11px] text-slate-500">SMAN 1 Batudaa Pantai</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
          <p className="text-xs font-medium text-slate-600 mb-2">⚡ Akses Cepat Uji Coba Peran:</p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickRole('admin')}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 transition text-center"
            >
              <Shield className="h-4 w-4 text-sky-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">Admin TU</span>
              <span className="text-[9px] text-slate-400">Operator</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('guru')}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 transition text-center"
            >
              <BookOpen className="h-4 w-4 text-emerald-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">Guru</span>
              <span className="text-[9px] text-slate-400">Fisika & TIK</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickRole('siswa')}
              className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50 transition text-center"
            >
              <GraduationCap className="h-4 w-4 text-amber-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-800">Siswa</span>
              <span className="text-[9px] text-slate-400">XII MIPA 1</span>
            </button>
          </div>
        </div>

        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-white px-2 text-[11px] text-slate-400">
            atau login dengan email & kata sandi
          </span>
        </div>

        {error && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  placeholder="Contoh: Ahmad Yani, S.Pd"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Peran di Sekolah</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['guru', 'siswa', 'admin'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-1.5 text-xs font-medium rounded-lg border capitalize transition ${
                        role === r 
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email Sekolah / Pribadi</label>
            <input
              type="email"
              placeholder="nama@sman1batudaapantai.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Kata Sandi</label>
            <input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-sky-600 py-2.5 text-xs font-semibold text-white hover:bg-sky-700 transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              'Memproses...'
            ) : isRegister ? (
              <>
                <UserPlus className="h-4 w-4" />
                Daftar Akun Baru
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Masuk ke Aplikasi
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError(null);
            }}
            className="text-xs text-sky-600 hover:underline"
          >
            {isRegister ? 'Sudah memiliki akun? Masuk di sini' : 'Belum memiliki akun? Daftar baru'}
          </button>
        </div>
      </div>
    </div>
  );
};
