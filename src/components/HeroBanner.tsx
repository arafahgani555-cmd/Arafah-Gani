import React from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Shield, BookOpen, Compass, Calendar, Clock, MapPin } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { currentUser, role } = useAuth();

  const getRoleDetails = () => {
    switch (role) {
      case 'admin':
        return {
          title: 'Portal Tata Usaha & Administrator',
          subtitle: 'Pengelolaan data induk sekolah, rombongan belajar, kurikulum, dan rekapitulasi kehadiran siswa terpusat.',
          icon: Shield,
          badgeColor: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
          accentGradient: 'from-blue-600 via-sky-600 to-indigo-700',
        };
      case 'guru':
        return {
          title: 'Portal Akademik Guru Pengampu',
          subtitle: 'Pencatatan presensi siswa per jam pelajaran, publikasi modul materi, penilaian tugas, dan jurnal harian mengajar.',
          icon: BookOpen,
          badgeColor: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
          accentGradient: 'from-sky-600 via-blue-600 to-teal-700',
        };
      case 'siswa':
      default:
        return {
          title: 'Ruang Belajar Siswa',
          subtitle: 'Akses jadwal belajar mingguan, unduh modul materi guru, kumpulkan tugas tepat waktu, dan pantau catatan sikap.',
          icon: GraduationCap,
          badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-300/30',
          accentGradient: 'from-blue-600 via-sky-500 to-blue-800',
        };
    }
  };

  const details = getRoleDetails();
  const Icon = details.icon;

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-sky-950 text-white shadow-lg border border-blue-900/60 mb-6">
      {/* Background Decorative Coastal Wave & Grid Pattern */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 320">
          <path fill="#38bdf8" fillOpacity="0.4" d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,144C672,149,768,203,864,208C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          <path fill="#0284c7" fillOpacity="0.3" d="M0,96L48,128C96,160,192,224,288,234.7C384,245,480,203,576,170.7C672,139,768,117,864,133.3C960,149,1056,203,1152,213.3C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>

      {/* Radial soft glow */}
      <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

      <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Main Info */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${details.badgeColor}`}>
              <Icon className="h-3.5 w-3.5" />
              <span>{details.title}</span>
            </span>
            <span className="text-sky-300/80 text-xs font-medium">·</span>
            <span className="flex items-center gap-1 text-xs text-sky-200/90 font-medium">
              <MapPin className="h-3 w-3 text-sky-400" />
              Batudaa Pantai, Kab. Gorontalo
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Selamat Datang di LMS SMAN 1 Batudaa Pantai
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {details.subtitle}
          </p>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 pt-1 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-sky-200 font-medium">
              <Calendar className="h-3.5 w-3.5 text-sky-400" />
              {todayStr}
            </span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5 text-sky-200 font-medium">
              <Clock className="h-3.5 w-3.5 text-sky-400" />
              Waktu Indonesia Tengah (WITA)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-medium">
              TA 2024/2025 (Genap)
            </span>
          </div>
        </div>

        {/* User Card Accent on the right */}
        {currentUser && (
          <div className="flex sm:flex-col justify-between sm:justify-center items-start sm:items-end gap-3 rounded-xl bg-white/5 border border-white/10 p-4 backdrop-blur-md shrink-0 md:min-w-[220px]">
            <div>
              <span className="text-[11px] font-medium text-sky-300 uppercase tracking-wider block">
                Pengguna Aktif
              </span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {currentUser.nama}
              </span>
              <span className="text-xs text-sky-200/80 capitalize block font-medium">
                Peran: {currentUser.role}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] bg-sky-500/20 text-sky-200 border border-sky-400/30 px-2.5 py-1 rounded-lg">
              <Compass className="h-3 w-3 text-sky-300" />
              <span>Sistem Aktif</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
