import React, { useState, useEffect } from 'react';
import { DataStore } from '../../lib/dataStore';
import { 
  Profile, 
  Teacher, 
  Student, 
  ClassRoom, 
  Subject, 
  Schedule, 
  Attendance 
} from '../../types/database';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Plus, 
  FileText, 
  Printer, 
  Check, 
  Clock, 
  CheckCircle,
  Building,
  Sparkles,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rekap' | 'guru' | 'siswa' | 'kelas' | 'mapel'>('rekap');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('2025-02-24');
  const [notification, setNotification] = useState<string | null>(null);

  // Forms state
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const [scheduleFormData, setScheduleFormData] = useState({
    class_id: '',
    subject_id: '',
    teacher_id: '',
    hari: 'Senin' as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu',
    jam_mulai: '07:15',
    jam_selesai: '08:45',
    ruangan: 'R. XII MIPA 1',
  });

  const [newTeacherData, setNewTeacherData] = useState({
    nama: '',
    email: '',
    nip: '',
    mapel_utama: '',
    nomor_telepon: ''
  });

  const [newStudentData, setNewStudentData] = useState({
    nama: '',
    email: '',
    nis: '',
    nisn: '',
    kelas_id: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    alamat: ''
  });

  const [newClassData, setNewClassData] = useState({
    nama_kelas: '',
    tingkat: 'XII' as 'X' | 'XI' | 'XII',
    wali_kelas_id: '',
    tahun_ajaran: '2024/2025'
  });

  const [newSubjectData, setNewSubjectData] = useState({
    nama_mapel: '',
    kode_mapel: '',
    kelompok: 'Wajib Umum'
  });

  const loadAllData = async () => {
    const [t, s, c, sub, sch, att] = await Promise.all([
      DataStore.getTeachers(),
      DataStore.getStudents(),
      DataStore.getClasses(),
      DataStore.getSubjects(),
      DataStore.getSchedules(),
      DataStore.getAttendances(),
    ]);
    setTeachers(t);
    setStudents(s);
    setClasses(c);
    setSubjects(sub);
    setSchedules(sch);
    setAttendances(att);
    if (c.length > 0 && !newStudentData.kelas_id) {
      setNewStudentData(prev => ({ ...prev, kelas_id: c[0].id }));
    }
    if (c.length > 0 && !scheduleFormData.class_id) {
      setScheduleFormData(prev => ({
        ...prev,
        class_id: c[0].id,
        subject_id: sub[0]?.id || '',
        teacher_id: t[0]?.id || '',
      }));
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Submit handlers
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherData.nama || !newTeacherData.mapel_utama) return;
    await DataStore.addTeacher(
      {
        profile_id: '',
        nip: newTeacherData.nip,
        mapel_utama: newTeacherData.mapel_utama
      },
      {
        nama: newTeacherData.nama,
        email: newTeacherData.email || `guru.${Date.now()}@sman1batudaapantai.sch.id`,
        role: 'guru',
        nomor_telepon: newTeacherData.nomor_telepon
      }
    );
    setShowAddTeacher(false);
    setNewTeacherData({ nama: '', email: '', nip: '', mapel_utama: '', nomor_telepon: '' });
    notify('Data Guru berhasil ditambahkan!');
    loadAllData();
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.nama || !newStudentData.nis || !newStudentData.nisn) return;
    await DataStore.addStudent(
      {
        profile_id: '',
        nis: newStudentData.nis,
        nisn: newStudentData.nisn,
        kelas_id: newStudentData.kelas_id || classes[0]?.id || '',
        jenis_kelamin: newStudentData.jenis_kelamin,
        alamat: newStudentData.alamat
      },
      {
        nama: newStudentData.nama,
        email: newStudentData.email || `siswa.${newStudentData.nis}@sman1batudaapantai.sch.id`,
        role: 'siswa'
      }
    );
    setShowAddStudent(false);
    setNewStudentData({
      nama: '',
      email: '',
      nis: '',
      nisn: '',
      kelas_id: classes[0]?.id || '',
      jenis_kelamin: 'L',
      alamat: ''
    });
    notify('Data Siswa berhasil didaftarkan!');
    loadAllData();
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassData.nama_kelas) return;
    await DataStore.addClass({
      nama_kelas: newClassData.nama_kelas,
      tingkat: newClassData.tingkat,
      wali_kelas_id: newClassData.wali_kelas_id || undefined,
      tahun_ajaran: newClassData.tahun_ajaran
    });
    setShowAddClass(false);
    setNewClassData({ nama_kelas: '', tingkat: 'XII', wali_kelas_id: '', tahun_ajaran: '2024/2025' });
    notify('Kelas baru berhasil dibuat!');
    loadAllData();
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectData.nama_mapel || !newSubjectData.kode_mapel) return;
    await DataStore.addSubject(newSubjectData);
    setShowAddSubject(false);
    setNewSubjectData({ nama_mapel: '', kode_mapel: '', kelompok: 'Wajib Umum' });
    notify('Mata pelajaran berhasil ditambahkan!');
    loadAllData();
  };

  // Schedule Handlers
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleFormData.class_id || !scheduleFormData.subject_id || !scheduleFormData.teacher_id) {
      notify('Harap lengkapi kelas, mata pelajaran, dan guru pengampu.');
      return;
    }
    await DataStore.addSchedule({
      class_id: scheduleFormData.class_id,
      subject_id: scheduleFormData.subject_id,
      teacher_id: scheduleFormData.teacher_id,
      hari: scheduleFormData.hari,
      jam_mulai: scheduleFormData.jam_mulai,
      jam_selesai: scheduleFormData.jam_selesai,
      ruangan: scheduleFormData.ruangan,
    });
    setShowAddSchedule(false);
    notify('Jadwal pelajaran baru berhasil ditambahkan!');
    loadAllData();
  };

  const handleStartEditSchedule = (sch: Schedule) => {
    setEditingSchedule(sch);
    setScheduleFormData({
      class_id: sch.class_id,
      subject_id: sch.subject_id,
      teacher_id: sch.teacher_id,
      hari: sch.hari,
      jam_mulai: sch.jam_mulai,
      jam_selesai: sch.jam_selesai,
      ruangan: sch.ruangan || '',
    });
  };

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    await DataStore.updateSchedule(editingSchedule.id, scheduleFormData);
    setEditingSchedule(null);
    notify('Jadwal pelajaran berhasil diperbarui!');
    loadAllData();
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jadwal pelajaran ini?')) {
      await DataStore.deleteSchedule(id);
      notify('Jadwal pelajaran telah dihapus.');
      loadAllData();
    }
  };

  // Filter attendance
  const filteredAttendances = attendances.filter(a => {
    const matchClass = selectedClassId === 'all' || a.class_id === selectedClassId;
    const matchDate = !selectedDate || a.tanggal === selectedDate;
    return matchClass && matchDate;
  });

  const totalHadir = filteredAttendances.filter(a => a.status === 'Hadir').length;
  const totalSakit = filteredAttendances.filter(a => a.status === 'Sakit').length;
  const totalIzin = filteredAttendances.filter(a => a.status === 'Izin').length;
  const totalAlpa = filteredAttendances.filter(a => a.status === 'Alpa').length;
  const totalTerlambat = filteredAttendances.filter(a => a.status === 'Terlambat').length;
  const totalRec = filteredAttendances.length;
  const hadirPercent = totalRec > 0 ? Math.round(((totalHadir + totalTerlambat) / totalRec) * 100) : 100;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-700 tracking-wider uppercase">Portal Operator & Tata Usaha</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Administrasi SMAN 1 Batudaa Pantai
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Tahun Ajaran 2024/2025 · Semester Genap · Kab. Gorontalo
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3.5 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-50 transition shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-blue-600" />
            Cetak Rekap
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3.5 text-xs font-semibold text-blue-900 border border-blue-200 shadow-xs animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metric summary counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold">Siswa Terdaftar</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {students.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Aktif semester ini</span>
        </div>

        <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-xs hover:border-sky-300 transition-colors">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold">Dewan Guru</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {teachers.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Tenaga pendidik</span>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-xs hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold">Rombongan Belajar</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {classes.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Kelas X, XI, XII</span>
        </div>

        <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-semibold">Tingkat Kehadiran</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 tabular-nums">
            {hadirPercent}%
          </div>
          <span className="text-[11px] text-blue-700 font-semibold">Rekap harian terpilih</span>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('rekap')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'rekap' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Rekap Presensi Sekolah
        </button>

        <button
          onClick={() => setActiveTab('guru')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'guru' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <Users className="h-4 w-4" />
          Data Guru ({teachers.length})
        </button>

        <button
          onClick={() => setActiveTab('siswa')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'siswa' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <GraduationCap className="h-4 w-4" />
          Data Siswa ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('kelas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'kelas' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <Building className="h-4 w-4" />
          Data Kelas ({classes.length})
        </button>

        <button
          onClick={() => setActiveTab('mapel')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'mapel' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Mata Pelajaran & Jadwal
        </button>
      </div>

      {/* Tab 1: Rekap Presensi Sekolah */}
      {activeTab === 'rekap' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Filter Kelas</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                >
                  <option value="all">Semua Kelas</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick breakdown pills */}
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-1">Hadir: {totalHadir}</span>
              <span className="rounded-md bg-blue-100 text-blue-800 px-2.5 py-1">Sakit: {totalSakit}</span>
              <span className="rounded-md bg-amber-100 text-amber-800 px-2.5 py-1">Izin: {totalIzin}</span>
              <span className="rounded-md bg-rose-100 text-rose-800 px-2.5 py-1">Alpa: {totalAlpa}</span>
              <span className="rounded-md bg-purple-100 text-purple-800 px-2.5 py-1">Telat: {totalTerlambat}</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                    <th className="py-3 px-4 font-semibold">NIS / NISN</th>
                    <th className="py-3 px-4 font-semibold">Kelas</th>
                    <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                    <th className="py-3 px-4 font-semibold">Tanggal</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAttendances.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada catatan presensi pada tanggal dan kelas yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendances.map((att) => {
                      const st = att.student;
                      const statusColor = 
                        att.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        att.status === 'Sakit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        att.status === 'Izin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        att.status === 'Terlambat' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        'bg-rose-50 text-rose-700 border-rose-200';

                      return (
                        <tr key={att.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-medium text-slate-900">
                            {st?.profile?.nama || 'Siswa'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono tabular-nums">
                            {st?.nis || '-'} / {st?.nisn || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {classes.find(c => c.id === att.class_id)?.nama_kelas || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {att.schedule?.subject?.nama_mapel || 'Sesi Terjadwal'}
                          </td>
                          <td className="py-3 px-4 text-slate-600 tabular-nums">
                            {att.tanggal}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold ${statusColor}`}>
                              {att.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {att.keterangan || '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Data Guru */}
      {activeTab === 'guru' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Guru & Tenaga Pendidik</h3>
              <p className="text-xs text-slate-500">Total {teachers.length} guru pengampu terdata</p>
            </div>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Guru
            </button>
          </div>

          {showAddTeacher && (
            <form onSubmit={handleAddTeacher} className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-sky-900">Form Tambah Guru Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dra. Aminah Polapa, M.Pd"
                    value={newTeacherData.nama}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, nama: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">NIP (Nomor Induk Pegawai)</label>
                  <input
                    type="text"
                    placeholder="198001012005011002"
                    value={newTeacherData.nip}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, nip: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran Utama *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Biologi, Kimia, Fisika"
                    value={newTeacherData.mapel_utama}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, mapel_utama: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    placeholder="nama.guru@sman1batudaapantai.sch.id"
                    value={newTeacherData.email}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={newTeacherData.nomor_telepon}
                    onChange={(e) => setNewTeacherData({ ...newTeacherData, nomor_telepon: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Guru</th>
                  <th className="py-3 px-4 font-semibold">NIP</th>
                  <th className="py-3 px-4 font-semibold">Mata Pelajaran Utama</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Kontak</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {t.profile?.nama || 'Guru'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono tabular-nums">
                      {t.nip || 'Belum diisi'}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {t.mapel_utama}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {t.profile?.email || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {t.profile?.nomor_telepon || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Data Siswa */}
      {activeTab === 'siswa' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daftar Siswa Aktif</h3>
              <p className="text-xs text-slate-500">Total {students.length} siswa terdaftar di sistem</p>
            </div>
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Siswa
            </button>
          </div>

          {showAddStudent && (
            <form onSubmit={handleAddStudent} className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-sky-900">Form Pendaftaran Siswa Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama lengkap sesuai akta"
                    value={newStudentData.nama}
                    onChange={(e) => setNewStudentData({ ...newStudentData, nama: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">NIS (Nomor Induk Siswa) *</label>
                  <input
                    type="text"
                    required
                    placeholder="240101"
                    value={newStudentData.nis}
                    onChange={(e) => setNewStudentData({ ...newStudentData, nis: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">NISN (10 Digit) *</label>
                  <input
                    type="text"
                    required
                    placeholder="0078129384"
                    value={newStudentData.nisn}
                    onChange={(e) => setNewStudentData({ ...newStudentData, nisn: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Kelas Rombel *</label>
                  <select
                    value={newStudentData.kelas_id}
                    onChange={(e) => setNewStudentData({ ...newStudentData, kelas_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudentData.jenis_kelamin}
                    onChange={(e) => setNewStudentData({ ...newStudentData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Alamat Tempat Tinggal</label>
                  <input
                    type="text"
                    placeholder="Desa Kayubulan, Batudaa Pantai"
                    value={newStudentData.alamat}
                    onChange={(e) => setNewStudentData({ ...newStudentData, alamat: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudent(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs"
                >
                  Simpan Siswa
                </button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama Siswa</th>
                  <th className="py-3 px-4 font-semibold">NIS</th>
                  <th className="py-3 px-4 font-semibold">NISN</th>
                  <th className="py-3 px-4 font-semibold">Kelas</th>
                  <th className="py-3 px-4 font-semibold">JK</th>
                  <th className="py-3 px-4 font-semibold">Alamat Asal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {s.profile?.nama || 'Siswa'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono tabular-nums">
                      {s.nis}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono tabular-nums">
                      {s.nisn}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {s.kelas?.nama_kelas || classes.find(c => c.id === s.kelas_id)?.nama_kelas || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {s.alamat || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Data Kelas */}
      {activeTab === 'kelas' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Rombongan Belajar (Kelas)</h3>
              <p className="text-xs text-slate-500">Kelola kelas, tingkat jenjang, dan wali kelas</p>
            </div>
            <button
              onClick={() => setShowAddClass(true)}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Kelas
            </button>
          </div>

          {showAddClass && (
            <form onSubmit={handleAddClass} className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-sky-900">Form Tambah Kelas Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama Kelas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: XI IPS 2"
                    value={newClassData.nama_kelas}
                    onChange={(e) => setNewClassData({ ...newClassData, nama_kelas: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Tingkat Jenjang</label>
                  <select
                    value={newClassData.tingkat}
                    onChange={(e) => setNewClassData({ ...newClassData, tingkat: e.target.value as 'X' | 'XI' | 'XII' })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="X">Kelas X (Fase E)</option>
                    <option value="XI">Kelas XI (Fase F)</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Wali Kelas</label>
                  <select
                    value={newClassData.wali_kelas_id}
                    onChange={(e) => setNewClassData({ ...newClassData, wali_kelas_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">Pilih Wali Kelas (Opsional)</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.profile?.nama || 'Guru'} ({t.mapel_utama})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    value={newClassData.tahun_ajaran}
                    onChange={(e) => setNewClassData({ ...newClassData, tahun_ajaran: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClass(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {classes.map(c => {
              const studentCount = students.filter(s => s.kelas_id === c.id).length;
              return (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-sky-400 transition">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-sky-50 text-sky-800 text-xs font-bold px-2 py-0.5">
                      Tingkat {c.tingkat}
                    </span>
                    <span className="text-[11px] text-slate-400">{c.tahun_ajaran}</span>
                  </div>
                  <h4 className="mt-2 text-base font-bold text-slate-900">{c.nama_kelas}</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Wali Kelas: <span className="font-medium text-slate-800">{c.wali_kelas?.profile?.nama || 'Belum ditentukan'}</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
                    <span>Jumlah Siswa</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{studentCount} Siswa</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: Mata Pelajaran & Jadwal */}
      {activeTab === 'mapel' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Kurikulum Mata Pelajaran</h3>
              <p className="text-xs text-slate-500">Mata pelajaran aktif di SMAN 1 Batudaa Pantai</p>
            </div>
            <button
              onClick={() => setShowAddSubject(true)}
              className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Tambah Mapel
            </button>
          </div>

          {showAddSubject && (
            <form onSubmit={handleAddSubject} className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-sky-900">Tambah Mata Pelajaran Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Nama Mata Pelajaran *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Geografi"
                    value={newSubjectData.nama_mapel}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, nama_mapel: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Kode Mapel *</label>
                  <input
                    type="text"
                    required
                    placeholder="GEO-XII"
                    value={newSubjectData.kode_mapel}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, kode_mapel: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Kelompok</label>
                  <input
                    type="text"
                    placeholder="Peminatan IPS / Wajib"
                    value={newSubjectData.kelompok}
                    onChange={(e) => setNewSubjectData({ ...newSubjectData, kelompok: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {subjects.map(sub => (
              <div key={sub.id} className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <span className="text-[10px] font-mono text-slate-400 block">{sub.kode_mapel}</span>
                <h5 className="text-xs font-bold text-slate-900 mt-1">{sub.nama_mapel}</h5>
                <span className="text-[10px] text-sky-700 font-medium">{sub.kelompok || 'Wajib'}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">Jadwal Pelajaran Terstruktur</h4>
                <p className="text-xs text-slate-500">Kelola dan atur jadwal kegiatan belajar mengajar per rombel</p>
              </div>
              <button
                onClick={() => {
                  setScheduleFormData({
                    class_id: classes[0]?.id || '',
                    subject_id: subjects[0]?.id || '',
                    teacher_id: teachers[0]?.id || '',
                    hari: 'Senin',
                    jam_mulai: '07:15',
                    jam_selesai: '08:45',
                    ruangan: 'R. XII MIPA 1',
                  });
                  setShowAddSchedule(true);
                }}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Jadwal Pelajaran
              </button>
            </div>

            {/* Form Tambah Jadwal */}
            {showAddSchedule && (
              <form onSubmit={handleAddSchedule} className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3">
                <h5 className="text-xs font-bold text-sky-900">Form Tambah Jadwal Pelajaran Baru</h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Hari Pelajaran *</label>
                    <select
                      value={scheduleFormData.hari}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, hari: e.target.value as any })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    >
                      {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Kelas Rombel *</label>
                    <select
                      value={scheduleFormData.class_id}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, class_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    >
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.nama_kelas} (Tingkat {c.tingkat})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran *</label>
                    <select
                      value={scheduleFormData.subject_id}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    >
                      {subjects.map(s => (
                        <option key={s.id} value={s.id}>{s.nama_mapel} ({s.kode_mapel})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Guru Pengampu *</label>
                    <select
                      value={scheduleFormData.teacher_id}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, teacher_id: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    >
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>{t.profile?.nama || 'Guru'} ({t.mapel_utama})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Jam Mulai *</label>
                    <input
                      type="time"
                      required
                      value={scheduleFormData.jam_mulai}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, jam_mulai: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Jam Selesai *</label>
                    <input
                      type="time"
                      required
                      value={scheduleFormData.jam_selesai}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, jam_selesai: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">Ruangan / Tempat Belajar</label>
                    <input
                      type="text"
                      placeholder="Contoh: Lab Komputer, Lab Fisika, R. XII MIPA 1"
                      value={scheduleFormData.ruangan}
                      onChange={(e) => setScheduleFormData({ ...scheduleFormData, ruangan: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-sky-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSchedule(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-700 shadow-xs"
                  >
                    Simpan Jadwal
                  </button>
                </div>
              </form>
            )}

            {/* Modal Edit Jadwal */}
            {editingSchedule && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
                <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <Edit2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Edit Jadwal Pelajaran</h4>
                        <p className="text-[11px] text-slate-500">Perbarui alokasi jam, kelas, mapel, atau guru pengampu</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingSchedule(null)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateSchedule} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Hari Pelajaran *</label>
                        <select
                          value={scheduleFormData.hari}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, hari: e.target.value as any })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                        >
                          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Kelas Rombel *</label>
                        <select
                          value={scheduleFormData.class_id}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, class_id: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                        >
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran *</label>
                        <select
                          value={scheduleFormData.subject_id}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, subject_id: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                        >
                          {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.nama_mapel} ({s.kode_mapel})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Guru Pengampu *</label>
                        <select
                          value={scheduleFormData.teacher_id}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, teacher_id: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                        >
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.profile?.nama || 'Guru'} ({t.mapel_utama})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Jam Mulai *</label>
                        <input
                          type="time"
                          required
                          value={scheduleFormData.jam_mulai}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, jam_mulai: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Jam Selesai *</label>
                        <input
                          type="time"
                          required
                          value={scheduleFormData.jam_selesai}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, jam_selesai: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-medium text-slate-600 mb-1">Ruangan / Tempat Belajar</label>
                        <input
                          type="text"
                          value={scheduleFormData.ruangan}
                          onChange={(e) => setScheduleFormData({ ...scheduleFormData, ruangan: e.target.value })}
                          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingSchedule(null)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-700 transition shadow-xs"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Hari</th>
                    <th className="py-3 px-4 font-semibold">Jam Pelajaran</th>
                    <th className="py-3 px-4 font-semibold">Kelas</th>
                    <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                    <th className="py-3 px-4 font-semibold">Guru Pengampu</th>
                    <th className="py-3 px-4 font-semibold">Ruangan</th>
                    <th className="py-3 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {schedules.map(sch => (
                    <tr key={sch.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{sch.hari}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono tabular-nums">{sch.jam_mulai} - {sch.jam_selesai}</td>
                      <td className="py-3 px-4 font-medium text-sky-800">{sch.kelas?.nama_kelas || '-'}</td>
                      <td className="py-3 px-4 text-slate-800">{sch.subject?.nama_mapel || '-'}</td>
                      <td className="py-3 px-4 text-slate-600">{sch.teacher?.profile?.nama || '-'}</td>
                      <td className="py-3 px-4 text-slate-500">{sch.ruangan || 'Ruang Kelas'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleStartEditSchedule(sch)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-sky-50 hover:text-sky-700 transition"
                            title="Edit Jadwal Pelajaran"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(sch.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                            title="Hapus Jadwal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
