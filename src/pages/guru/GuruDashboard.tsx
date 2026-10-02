import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataStore } from '../../lib/dataStore';
import { 
  ClassRoom, 
  Subject, 
  Schedule, 
  Attendance, 
  Material, 
  Assignment, 
  Submission, 
  TeacherJournal, 
  AttitudeAssessment,
  Student,
  AttendanceStatus,
  AttitudeType,
  AttitudePredicate
} from '../../types/database';
import { 
  CheckCircle, 
  Calendar, 
  BookOpen, 
  FileText, 
  Award, 
  Clock, 
  Plus, 
  Upload, 
  ExternalLink, 
  Printer, 
  AlertCircle,
  FileCheck,
  HeartHandshake,
  Check,
  Send
} from 'lucide-react';

export const GuruDashboard: React.FC = () => {
  const { currentUser, currentTeacher } = useAuth();

  const [activeTab, setActiveTab] = useState<'beranda' | 'presensi' | 'materi' | 'tugas' | 'jurnal' | 'sikap'>('beranda');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [journals, setJournals] = useState<TeacherJournal[]>([]);
  const [attitudes, setAttitudes] = useState<AttitudeAssessment[]>([]);

  const [notification, setNotification] = useState<string | null>(null);

  // PRESENSI STATE
  const [presensiClassId, setPresensiClassId] = useState<string>('c-xii-mipa-1');
  const [presensiDate, setPresensiDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [presensiSubjectId, setPresensiSubjectId] = useState<string>('sub-fisika');
  const [presensiScheduleId, setPresensiScheduleId] = useState<string>('sch-1');
  const [attendanceSheet, setAttendanceSheet] = useState<Record<string, { status: AttendanceStatus; keterangan: string }>>({});

  // MATERI STATE
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    judul: '',
    deskripsi: '',
    class_id: 'c-xii-mipa-1',
    subject_id: 'sub-fisika',
    tipe_konten: 'file' as 'file' | 'link' | 'teks',
    file_url: '',
  });

  // TUGAS STATE
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    judul: '',
    deskripsi: '',
    class_id: 'c-xii-mipa-1',
    subject_id: 'sub-fisika',
    file_lampiran: '',
    deadline: '',
    bobot_nilai: 100,
  });

  // PENILAIAN TUGAS MODAL
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<Submission | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(85);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // JURNAL STATE
  const [showAddJournal, setShowAddJournal] = useState(false);
  const [newJournal, setNewJournal] = useState({
    class_id: 'c-xii-mipa-1',
    subject_id: 'sub-fisika',
    tanggal: new Date().toISOString().split('T')[0],
    jam_ke: '1 - 2 (07:15 - 08:45)',
    materi_diajarkan: '',
    metode: 'Diskusi & Eksperimen Laboratorium',
    catatan: '',
  });

  // SIKAP STATE
  const [showAddAttitude, setShowAddAttitude] = useState(false);
  const [newAttitude, setNewAttitude] = useState({
    student_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'spiritual' as AttitudeType,
    predikat: 'Sangat Baik' as AttitudePredicate,
    catatan: '',
  });

  const loadData = async () => {
    const [c, sub, st, sch, att, mat, asg, subm, jrn, attd] = await Promise.all([
      DataStore.getClasses(),
      DataStore.getSubjects(),
      DataStore.getStudents(),
      DataStore.getSchedules(),
      DataStore.getAttendances(),
      DataStore.getMaterials(),
      DataStore.getAssignments(),
      DataStore.getSubmissions(),
      DataStore.getJournals(),
      DataStore.getAttitudeAssessments(),
    ]);

    setClasses(c);
    setSubjects(sub);
    setStudents(st);
    setSchedules(sch);
    setAttendances(att);
    setMaterials(mat);
    setAssignments(asg);
    setSubmissions(subm);
    setJournals(jrn);
    setAttitudes(attd);

    if (st.length > 0 && !newAttitude.student_id) {
      setNewAttitude(prev => ({ ...prev, student_id: st[0].id }));
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Sync attendance sheet when class or date changes
  useEffect(() => {
    const classStudents = students.filter(s => s.kelas_id === presensiClassId);
    const existingAttendances = attendances.filter(
      a => a.class_id === presensiClassId && a.tanggal === presensiDate
    );

    const sheet: Record<string, { status: AttendanceStatus; keterangan: string }> = {};
    classStudents.forEach(st => {
      const match = existingAttendances.find(a => a.student_id === st.id);
      sheet[st.id] = {
        status: match ? match.status : 'Hadir',
        keterangan: match?.keterangan || '',
      };
    });
    setAttendanceSheet(sheet);
  }, [presensiClassId, presensiDate, students, attendances]);

  // Handle Save Attendance
  const handleSaveAttendance = async () => {
    const recordsToSave: Omit<Attendance, 'id'>[] = Object.entries(attendanceSheet).map(
      ([studentId, info]) => ({
        student_id: studentId,
        class_id: presensiClassId,
        schedule_id: presensiScheduleId || undefined,
        tanggal: presensiDate,
        status: info.status,
        keterangan: info.keterangan,
        input_by: currentUser?.id,
      })
    );

    await DataStore.recordAttendances(recordsToSave);
    notify(`Presensi ${recordsToSave.length} siswa berhasil disimpan!`);
    loadData();
  };

  // Handle Add Material
  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.judul) return;

    await DataStore.addMaterial({
      class_id: newMaterial.class_id,
      subject_id: newMaterial.subject_id,
      teacher_id: currentTeacher?.id || 't-1',
      judul: newMaterial.judul,
      deskripsi: newMaterial.deskripsi,
      tipe_konten: newMaterial.tipe_konten,
      file_url: newMaterial.file_url || (newMaterial.tipe_konten === 'file' ? 'https://storage.batudaapantai.sch.id/materi/modul_' + Date.now() + '.pdf' : ''),
    });

    setShowAddMaterial(false);
    setNewMaterial({
      judul: '',
      deskripsi: '',
      class_id: 'c-xii-mipa-1',
      subject_id: 'sub-fisika',
      tipe_konten: 'file',
      file_url: '',
    });
    notify('Materi pembelajaran berhasil dipublikasikan!');
    loadData();
  };

  // Handle Add Assignment
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.judul || !newAssignment.deadline) return;

    await DataStore.addAssignment({
      class_id: newAssignment.class_id,
      subject_id: newAssignment.subject_id,
      teacher_id: currentTeacher?.id || 't-1',
      judul: newAssignment.judul,
      deskripsi: newAssignment.deskripsi,
      file_lampiran: newAssignment.file_lampiran,
      deadline: newAssignment.deadline,
      bobot_nilai: Number(newAssignment.bobot_nilai),
    });

    setShowAddAssignment(false);
    setNewAssignment({
      judul: '',
      deskripsi: '',
      class_id: 'c-xii-mipa-1',
      subject_id: 'sub-fisika',
      file_lampiran: '',
      deadline: '',
      bobot_nilai: 100,
    });
    notify('Tugas baru berhasil diterbitkan kepada siswa!');
    loadData();
  };

  // Handle Submit Grade
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;

    await DataStore.gradeSubmission(
      selectedSubmissionForGrading.id,
      gradeInput,
      feedbackInput,
      currentTeacher?.id || 't-1'
    );

    setSelectedSubmissionForGrading(null);
    notify('Nilai dan feedback tugas berhasil disimpan!');
    loadData();
  };

  // Handle Add Journal
  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournal.materi_diajarkan) return;

    // Count attendance for this class & date
    const classAtt = attendances.filter(a => a.class_id === newJournal.class_id && a.tanggal === newJournal.tanggal);
    const hadirCount = classAtt.filter(a => a.status === 'Hadir' || a.status === 'Terlambat').length || 4;
    const absenCount = classAtt.filter(a => a.status !== 'Hadir' && a.status !== 'Terlambat').length || 1;

    await DataStore.addJournal({
      teacher_id: currentTeacher?.id || 't-1',
      class_id: newJournal.class_id,
      subject_id: newJournal.subject_id,
      tanggal: newJournal.tanggal,
      jam_ke: newJournal.jam_ke,
      materi_diajarkan: newJournal.materi_diajarkan,
      metode: newJournal.metode,
      catatan: newJournal.catatan,
      jumlah_hadir: hadirCount,
      jumlah_absen: absenCount,
    });

    setShowAddJournal(false);
    setNewJournal({
      class_id: 'c-xii-mipa-1',
      subject_id: 'sub-fisika',
      tanggal: new Date().toISOString().split('T')[0],
      jam_ke: '1 - 2 (07:15 - 08:45)',
      materi_diajarkan: '',
      metode: 'Diskusi & Eksperimen Laboratorium',
      catatan: '',
    });
    notify('Jurnal harian mengajar berhasil disimpan!');
    loadData();
  };

  // Handle Add Attitude Assessment
  const handleAddAttitude = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttitude.student_id) return;

    await DataStore.addAttitudeAssessment({
      student_id: newAttitude.student_id,
      teacher_id: currentTeacher?.id || 't-1',
      tanggal: newAttitude.tanggal,
      jenis: newAttitude.jenis,
      predikat: newAttitude.predikat,
      catatan: newAttitude.catatan,
    });

    setShowAddAttitude(false);
    setNewAttitude({
      student_id: students[0]?.id || '',
      tanggal: new Date().toISOString().split('T')[0],
      jenis: 'spiritual',
      predikat: 'Sangat Baik',
      catatan: '',
    });
    notify('Penilaian sikap siswa berhasil dicatat!');
    loadData();
  };

  const pendingSubmissions = submissions.filter(s => s.nilai === undefined || s.nilai === null);
  const mySchedules = schedules.filter(s => s.teacher_id === currentTeacher?.id || s.teacher?.profile_id === currentUser?.id);

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-700 tracking-wider uppercase">Portal Tenaga Pendidik</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Selamat Datang, {currentUser?.nama || 'Bapak/Ibu Guru'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Pengampu: <span className="font-semibold text-slate-800">{currentTeacher?.mapel_utama || 'Fisika & TIK'}</span> · NIP: <span className="font-mono">{currentTeacher?.nip || '196904121994122001'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('presensi')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-xs shadow-blue-700/20"
          >
            <Check className="h-3.5 w-3.5" />
            Mulai Presensi Kelas
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3.5 text-xs font-semibold text-blue-900 border border-blue-200 shadow-xs animate-in fade-in duration-200">
          <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('beranda')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'beranda' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Beranda Guru
        </button>

        <button
          onClick={() => setActiveTab('presensi')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'presensi' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Presensi Siswa
        </button>

        <button
          onClick={() => setActiveTab('materi')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'materi' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          Materi Pembelajaran ({materials.length})
        </button>

        <button
          onClick={() => setActiveTab('tugas')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'tugas' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <FileCheck className="h-4 w-4" />
          Tugas & Nilai {pendingSubmissions.length > 0 && <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">{pendingSubmissions.length}</span>}
        </button>

        <button
          onClick={() => setActiveTab('jurnal')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'jurnal' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <FileText className="h-4 w-4" />
          Jurnal Harian ({journals.length})
        </button>

        <button
          onClick={() => setActiveTab('sikap')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'sikap' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <HeartHandshake className="h-4 w-4" />
          Penilaian Sikap
        </button>
      </div>

      {/* Tab 1: Beranda Guru */}
      {activeTab === 'beranda' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Jadwal Mengajar</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {mySchedules.length > 0 ? mySchedules.length : 3} Sesi
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Minggu aktif pembelajaran</p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-xs hover:border-sky-300 transition-colors">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Tugas Perlu Dinilai</span>
                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                  <FileCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {pendingSubmissions.length} Berkas
              </div>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">
                {pendingSubmissions.length > 0 ? 'Menunggu koreksi guru' : 'Semua tugas telah dinilai'}
              </p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Jurnal Terisi</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {journals.length} Pertemuan
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Terekam dalam arsip digital</p>
            </div>
          </div>

          {/* Sesi Mengajar & Quick Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Jadwal Mengajar Anda
                </h3>
                <span className="text-xs font-medium text-slate-500">Semester Genap</span>
              </div>
              
              <div className="space-y-2.5">
                {mySchedules.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Tidak ada jadwal tercatat.</p>
                ) : (
                  mySchedules.map(sch => (
                    <div key={sch.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{sch.subject?.nama_mapel}</span>
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">{sch.kelas?.nama_kelas}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">{sch.hari} · {sch.jam_mulai} - {sch.jam_selesai} · {sch.ruangan || 'Lab/Kelas'}</span>
                      </div>
                      <button
                        onClick={() => {
                          setPresensiClassId(sch.class_id);
                          setPresensiSubjectId(sch.subject_id);
                          setPresensiScheduleId(sch.id);
                          setActiveTab('presensi');
                        }}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                      >
                        Buka Absen
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-amber-600" />
                  Pengumpulan Tugas Siswa Terbaru
                </h3>
                <button
                  onClick={() => setActiveTab('tugas')}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-2.5">
                {submissions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Belum ada pengumpulan tugas.</p>
                ) : (
                  submissions.slice(0, 4).map(sub => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
                      <div>
                        <span className="text-xs font-bold text-slate-900">{sub.student?.profile?.nama || 'Siswa'}</span>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{sub.assignment?.judul}</p>
                      </div>
                      <div>
                        {sub.nilai !== undefined && sub.nilai !== null ? (
                          <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Nilai: {sub.nilai}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedSubmissionForGrading(sub);
                              setGradeInput(85);
                              setFeedbackInput(sub.feedback || '');
                              setActiveTab('tugas');
                            }}
                            className="rounded-lg bg-amber-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-700"
                          >
                            Beri Nilai
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Presensi Siswa */}
      {activeTab === 'presensi' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Pilih Sesi Presensi Mengajar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilih Kelas</label>
                <select
                  value={presensiClassId}
                  onChange={(e) => setPresensiClassId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran</label>
                <select
                  value={presensiSubjectId}
                  onChange={(e) => setPresensiSubjectId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.nama_mapel} ({s.kode_mapel})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Tanggal Presensi</label>
                <input
                  type="date"
                  value={presensiDate}
                  onChange={(e) => setPresensiDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sheet Tabel Siswa */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Daftar Absensi Siswa ({students.filter(s => s.kelas_id === presensiClassId).length} Siswa)
                </h4>
                <p className="text-[11px] text-slate-500">Klik status untuk mengubah kehadiran secara langsung</p>
              </div>
              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Simpan Presensi Kelas
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">No</th>
                    <th className="py-2.5 px-4 font-semibold">Nama Siswa</th>
                    <th className="py-2.5 px-4 font-semibold">NIS</th>
                    <th className="py-2.5 px-4 font-semibold">Status Kehadiran</th>
                    <th className="py-2.5 px-4 font-semibold">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.filter(s => s.kelas_id === presensiClassId).map((st, idx) => {
                    const currentStatus = attendanceSheet[st.id]?.status || 'Hadir';
                    const currentKet = attendanceSheet[st.id]?.keterangan || '';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{st.profile?.nama || 'Siswa'}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">{st.nis}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            {(['Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat'] as AttendanceStatus[]).map(statusOption => {
                              const isActive = currentStatus === statusOption;
                              const btnColor = 
                                statusOption === 'Hadir' ? (isActive ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-50 text-slate-700') :
                                statusOption === 'Sakit' ? (isActive ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 text-slate-700') :
                                statusOption === 'Izin' ? (isActive ? 'bg-amber-600 text-white' : 'hover:bg-amber-50 text-slate-700') :
                                statusOption === 'Terlambat' ? (isActive ? 'bg-purple-600 text-white' : 'hover:bg-purple-50 text-slate-700') :
                                (isActive ? 'bg-rose-600 text-white' : 'hover:bg-rose-50 text-slate-700');

                              return (
                                <button
                                  key={statusOption}
                                  type="button"
                                  onClick={() => {
                                    setAttendanceSheet(prev => ({
                                      ...prev,
                                      [st.id]: {
                                        status: statusOption,
                                        keterangan: prev[st.id]?.keterangan || ''
                                      }
                                    }));
                                  }}
                                  className={`px-2 py-1 text-[11px] font-medium rounded border border-slate-200 transition ${btnColor}`}
                                >
                                  {statusOption}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Keterangan tambahan..."
                            value={currentKet}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAttendanceSheet(prev => ({
                                ...prev,
                                [st.id]: {
                                  status: prev[st.id]?.status || 'Hadir',
                                  keterangan: val,
                                }
                              }));
                            }}
                            className="w-full rounded border border-slate-200 px-2 py-1 text-xs focus:border-emerald-500 focus:outline-none"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSaveAttendance}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                Simpan Presensi Kelas Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Materi Pembelajaran */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Materi & Modul Pembelajaran</h3>
              <p className="text-xs text-slate-500">Materi tersimpan di cloud storage sekolah</p>
            </div>
            <button
              onClick={() => setShowAddMaterial(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Materi Baru
            </button>
          </div>

          {showAddMaterial && (
            <form onSubmit={handleAddMaterial} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900">Form Publikasi Materi Pembelajaran</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Judul Materi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Modul Induksi Elektromagnetik & Hukum Lenz"
                    value={newMaterial.judul}
                    onChange={(e) => setNewMaterial({ ...newMaterial, judul: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Tipe Konten</label>
                  <select
                    value={newMaterial.tipe_konten}
                    onChange={(e) => setNewMaterial({ ...newMaterial, tipe_konten: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="file">Dokumen / PDF (Storage)</option>
                    <option value="link">Tautan Web / YouTube / Simulasi</option>
                    <option value="teks">Rangkuman Teks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Untuk Kelas</label>
                  <select
                    value={newMaterial.class_id}
                    onChange={(e) => setNewMaterial({ ...newMaterial, class_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran</label>
                  <select
                    value={newMaterial.subject_id}
                    onChange={(e) => setNewMaterial({ ...newMaterial, subject_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.nama_mapel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">URL File / Link Tautan</label>
                  <input
                    type="text"
                    placeholder="https://... atau biarkan otomatis"
                    value={newMaterial.file_url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Deskripsi / Petunjuk Belajar</label>
                  <textarea
                    rows={2}
                    placeholder="Petunjuk pengerjaan dan capaian pembelajaran..."
                    value={newMaterial.deskripsi}
                    onChange={(e) => setNewMaterial({ ...newMaterial, deskripsi: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMaterial(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Publikasikan Materi
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map(mat => (
              <div key={mat.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {mat.subject?.nama_mapel || 'Fisika'} · {mat.kelas?.nama_kelas || 'XII MIPA 1'}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">{mat.tipe_konten || 'file'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{mat.judul}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">{mat.deskripsi || 'Tidak ada deskripsi tambahan.'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {new Date(mat.created_at).toLocaleDateString('id-ID')}
                  </span>
                  {mat.file_url && (
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Buka Dokumen
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tugas & Penilaian */}
      {activeTab === 'tugas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Manajemen Tugas & Penilaian Siswa</h3>
              <p className="text-xs text-slate-500">Buat penugasan, pantau pengumpulan, dan berikan feedback nilai</p>
            </div>
            <button
              onClick={() => setShowAddAssignment(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Buat Tugas Baru
            </button>
          </div>

          {showAddAssignment && (
            <form onSubmit={handleAddAssignment} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900">Form Buat Penugasan Baru</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Judul Tugas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Laporan Eksperimen Rangkaian Hambatan Listrik"
                    value={newAssignment.judul}
                    onChange={(e) => setNewAssignment({ ...newAssignment, judul: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Bobot Poin Maksimal</label>
                  <input
                    type="number"
                    value={newAssignment.bobot_nilai}
                    onChange={(e) => setNewAssignment({ ...newAssignment, bobot_nilai: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Target Kelas</label>
                  <select
                    value={newAssignment.class_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, class_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran</label>
                  <select
                    value={newAssignment.subject_id}
                    onChange={(e) => setNewAssignment({ ...newAssignment, subject_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.nama_mapel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Batas Waktu (Deadline) *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newAssignment.deadline}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Instruksi & Rubrik Tugas</label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan format penulisan, kriteria penilaian, dan instruksi pengumpulan..."
                    value={newAssignment.deskripsi}
                    onChange={(e) => setNewAssignment({ ...newAssignment, deskripsi: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAssignment(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Terbitkan Tugas
                </button>
              </div>
            </form>
          )}

          {/* Modal Beri Nilai */}
          {selectedSubmissionForGrading && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                <h3 className="font-bold text-slate-900 text-sm">Penilaian Tugas Siswa</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Siswa: <span className="font-semibold text-slate-800">{selectedSubmissionForGrading.student?.profile?.nama}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Tugas: <span className="font-semibold text-slate-800">{selectedSubmissionForGrading.assignment?.judul}</span>
                </p>

                {selectedSubmissionForGrading.teks_jawaban && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200">
                    <span className="font-semibold block text-[11px] text-slate-500 mb-0.5">Teks Jawaban Siswa:</span>
                    {selectedSubmissionForGrading.teks_jawaban}
                  </div>
                )}

                {selectedSubmissionForGrading.file_url && (
                  <a
                    href={selectedSubmissionForGrading.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:underline"
                  >
                    Unduh / Lihat File Jawaban
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                <form onSubmit={handleGradeSubmission} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nilai (0 - 100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={gradeInput}
                      onChange={(e) => setGradeInput(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold font-mono focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Catatan & Masukan Guru (Feedback)</label>
                    <textarea
                      rows={3}
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Beri apresiasi dan saran perbaikan..."
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedSubmissionForGrading(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      Simpan Nilai
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Tabel Pengumpulan Tugas */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900">Daftar Pengumpulan Tugas oleh Siswa</h4>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Nama Siswa</th>
                  <th className="py-2.5 px-4 font-semibold">Tugas</th>
                  <th className="py-2.5 px-4 font-semibold">Waktu Kirim</th>
                  <th className="py-2.5 px-4 font-semibold">Jawaban / Berkas</th>
                  <th className="py-2.5 px-4 font-semibold">Status / Nilai</th>
                  <th className="py-2.5 px-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-400">
                      Belum ada siswa yang mengumpulkan tugas.
                    </td>
                  </tr>
                ) : (
                  submissions.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {sub.student?.profile?.nama || 'Siswa'}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {sub.assignment?.judul}
                      </td>
                      <td className="py-3 px-4 text-slate-500 tabular-nums">
                        {new Date(sub.submitted_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        {sub.file_url ? (
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-sky-600 hover:underline"
                          >
                            Lampiran File <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500 line-clamp-1">{sub.teks_jawaban || 'Teks jawaban'}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {sub.nilai !== undefined && sub.nilai !== null ? (
                          <div>
                            <span className="font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {sub.nilai} / 100
                            </span>
                            {sub.feedback && <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">"{sub.feedback}"</p>}
                          </div>
                        ) : (
                          <span className="rounded bg-amber-50 text-amber-800 text-[10px] font-semibold px-2 py-0.5 border border-amber-200">
                            Perlu Dinilai
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSelectedSubmissionForGrading(sub);
                            setGradeInput(sub.nilai ?? 85);
                            setFeedbackInput(sub.feedback || '');
                          }}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 shadow-xs"
                        >
                          {sub.nilai !== undefined && sub.nilai !== null ? 'Koreksi Ulang' : 'Beri Nilai'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Jurnal Harian Guru */}
      {activeTab === 'jurnal' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Jurnal Harian Mengajar Guru</h3>
              <p className="text-xs text-slate-500">Mencatat materi diajarkan, metode, kendala, dan kehadiran kelas</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <Printer className="h-3.5 w-3.5" />
                Cetak Jurnal
              </button>
              <button
                onClick={() => setShowAddJournal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                Isi Jurnal Hari Ini
              </button>
            </div>
          </div>

          {showAddJournal && (
            <form onSubmit={handleAddJournal} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900">Form Pengisian Jurnal Mengajar</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={newJournal.tanggal}
                    onChange={(e) => setNewJournal({ ...newJournal, tanggal: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Kelas</label>
                  <select
                    value={newJournal.class_id}
                    onChange={(e) => setNewJournal({ ...newJournal, class_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.nama_kelas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Mata Pelajaran</label>
                  <select
                    value={newJournal.subject_id}
                    onChange={(e) => setNewJournal({ ...newJournal, subject_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.nama_mapel}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Jam Pelajaran Ke-</label>
                  <input
                    type="text"
                    value={newJournal.jam_ke}
                    onChange={(e) => setNewJournal({ ...newJournal, jam_ke: e.target.value })}
                    placeholder="1 - 2 (07:15 - 08:45)"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Metode Pembelajaran</label>
                  <input
                    type="text"
                    value={newJournal.metode}
                    onChange={(e) => setNewJournal({ ...newJournal, metode: e.target.value })}
                    placeholder="Discovery Learning, Praktik Lab, Diskusi Kelompok"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Materi Pokok yang Diajarkan *</label>
                  <textarea
                    rows={2}
                    required
                    value={newJournal.materi_diajarkan}
                    onChange={(e) => setNewJournal({ ...newJournal, materi_diajarkan: e.target.value })}
                    placeholder="Uraikan topik, kompetensi dasar, dan kegiatan inti yang dilaksanakan..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Kendala / Catatan Perkembangan Belajar</label>
                  <input
                    type="text"
                    value={newJournal.catatan}
                    onChange={(e) => setNewJournal({ ...newJournal, catatan: e.target.value })}
                    placeholder="Kendala cuaca pesisir, kesiapan peralatan, dsb..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddJournal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Simpan Jurnal
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {journals.map(j => (
              <div key={j.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">{j.kelas?.nama_kelas} · {j.subject?.nama_mapel}</span>
                    <span className="text-[11px] text-slate-500">Jam: {j.jam_ke}</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">{j.tanggal}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Topik: <span className="font-normal text-slate-700">{j.materi_diajarkan}</span>
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Metode:</span> {j.metode}
                </p>
                {j.catatan && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                    Catatan: {j.catatan}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Kehadiran: {j.jumlah_hadir ?? 4} Hadir · {j.jumlah_absen ?? 1} Absen</span>
                  <span>Guru: {j.teacher?.profile?.nama || currentUser?.nama}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Penilaian Sikap Siswa */}
      {activeTab === 'sikap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Penilaian Sikap Spiritual & Sosial</h3>
              <p className="text-xs text-slate-500">Catatan perkembangan karakter dan budi pekerti per pertemuan</p>
            </div>
            <button
              onClick={() => setShowAddAttitude(true)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              Input Nilai Sikap
            </button>
          </div>

          {showAddAttitude && (
            <form onSubmit={handleAddAttitude} className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
              <h4 className="text-xs font-bold text-emerald-900">Form Observasi Sikap Siswa</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Pilih Siswa *</label>
                  <select
                    value={newAttitude.student_id}
                    onChange={(e) => setNewAttitude({ ...newAttitude, student_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.profile?.nama} ({s.kelas?.nama_kelas || 'XII MIPA 1'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Aspek Sikap</label>
                  <select
                    value={newAttitude.jenis}
                    onChange={(e) => setNewAttitude({ ...newAttitude, jenis: e.target.value as AttitudeType })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none capitalize"
                  >
                    <option value="spiritual">Spiritual (Ibadah, Berdoa, Rasa Syukur)</option>
                    <option value="sosial">Sosial (Disiplin, Gotong Royong, Santun)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Predikat</label>
                  <select
                    value={newAttitude.predikat}
                    onChange={(e) => setNewAttitude({ ...newAttitude, predikat: e.target.value as AttitudePredicate })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Sangat Baik">Sangat Baik (A)</option>
                    <option value="Baik">Baik (B)</option>
                    <option value="Cukup">Cukup (C)</option>
                    <option value="Perlu Bimbingan">Perlu Bimbingan (D)</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Deskripsi Perilaku Teramati</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Menunjukkan kepedulian dengan membersihkan meja lab bersama rekannya..."
                    value={newAttitude.catatan}
                    onChange={(e) => setNewAttitude({ ...newAttitude, catatan: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAttitude(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                >
                  Simpan Penilaian
                </button>
              </div>
            </form>
          )}

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Nama Siswa</th>
                  <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-4 font-semibold">Dimensi Sikap</th>
                  <th className="py-2.5 px-4 font-semibold">Predikat</th>
                  <th className="py-2.5 px-4 font-semibold">Deskripsi Catatan Perilaku</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attitudes.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{att.student?.profile?.nama}</td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">{att.tanggal}</td>
                    <td className="py-3 px-4 capitalize font-medium text-sky-800">{att.jenis}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                        att.predikat === 'Sangat Baik' ? 'bg-emerald-100 text-emerald-800' :
                        att.predikat === 'Baik' ? 'bg-blue-100 text-blue-800' :
                        att.predikat === 'Cukup' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {att.predikat}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{att.catatan || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
