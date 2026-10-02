import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DataStore } from '../../lib/dataStore';
import { 
  Material, 
  Assignment, 
  Submission, 
  Attendance, 
  Schedule, 
  AttitudeAssessment 
} from '../../types/database';
import { 
  Calendar, 
  BookOpen, 
  FileCheck, 
  Award, 
  Clock, 
  Upload, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Send,
  HeartHandshake
} from 'lucide-react';

export const SiswaDashboard: React.FC = () => {
  const { currentUser, currentStudent } = useAuth();

  const [activeTab, setActiveTab] = useState<'beranda' | 'jadwal' | 'materi' | 'tugas' | 'sikap'>('beranda');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [attitudes, setAttitudes] = useState<AttitudeAssessment[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // MODAL SUBMIT TUGAS
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(null);
  const [submissionType, setSubmissionType] = useState<'teks' | 'file'>('teks');
  const [teksJawaban, setTeksJawaban] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    const studentId = currentStudent?.id || 's-1';
    const classId = currentStudent?.kelas_id || 'c-xii-mipa-1';

    const [sch, att, mat, asg, subm, attd] = await Promise.all([
      DataStore.getSchedules(),
      DataStore.getAttendances({ student_id: studentId }),
      DataStore.getMaterials(classId),
      DataStore.getAssignments(classId),
      DataStore.getSubmissions(),
      DataStore.getAttitudeAssessments({ student_id: studentId }),
    ]);

    setSchedules(sch.filter(s => s.class_id === classId));
    setAttendances(att);
    setMaterials(mat);
    setAssignments(asg);
    setSubmissions(subm.filter(s => s.student_id === studentId));
    setAttitudes(attd);
  };

  useEffect(() => {
    loadData();
  }, [currentStudent]);

  const notify = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleOpenSubmit = (asg: Assignment) => {
    const existing = submissions.find(s => s.assignment_id === asg.id);
    setSelectedAssignmentForSubmit(asg);
    if (existing) {
      setTeksJawaban(existing.teks_jawaban || '');
      setFileUrl(existing.file_url || '');
    } else {
      setTeksJawaban('');
      setFileUrl('');
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;
    setIsSubmitting(true);

    const generatedFileUrl = fileUrl || (submissionType === 'file' ? `https://storage.batudaapantai.sch.id/tugas/${currentStudent?.nis || '220101'}_${selectedAssignmentForSubmit.id}.pdf` : '');

    await DataStore.submitAssignment({
      assignment_id: selectedAssignmentForSubmit.id,
      student_id: currentStudent?.id || 's-1',
      teks_jawaban: teksJawaban,
      file_url: generatedFileUrl,
    });

    setIsSubmitting(false);
    setSelectedAssignmentForSubmit(null);
    notify('Tugas Anda berhasil dikirim ke guru pengampu!');
    loadData();
  };

  // Hitung persentase kehadiran
  const totalPresensi = attendances.length;
  const totalHadir = attendances.filter(a => a.status === 'Hadir').length;
  const totalTerlambat = attendances.filter(a => a.status === 'Terlambat').length;
  const persentaseHadir = totalPresensi > 0 ? Math.round(((totalHadir + totalTerlambat) / totalPresensi) * 100) : 100;

  // Tugas deadline terdekat
  const uncompletedAssignments = assignments.filter(
    a => !submissions.some(s => s.assignment_id === a.id)
  );

  return (
    <div className="space-y-6">
      
      {/* Top Profile Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-blue-700 tracking-wider uppercase">Portal Siswa</span>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Halo, {currentUser?.nama || 'Moh. Fikri Hasan'}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Kelas: <span className="font-semibold text-slate-800">{currentStudent?.kelas?.nama_kelas || 'XII MIPA 1'}</span> · NISN: <span className="font-mono">{currentStudent?.nisn || '0068472918'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tugas')}
            className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 transition shadow-xs shadow-blue-700/20"
          >
            <Upload className="h-3.5 w-3.5" />
            Kumpulkan Tugas ({uncompletedAssignments.length})
          </button>
        </div>
      </div>

      {notification && (
        <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3.5 text-xs font-semibold text-blue-900 border border-blue-200 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Quick Alert Banner for Pending Deadlines */}
      {uncompletedAssignments.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-blue-50/80 p-3.5 border border-blue-200 text-xs text-blue-950">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Pengingat Tugas:</span> Anda memiliki <span className="font-bold text-blue-800">{uncompletedAssignments.length} tugas aktif</span> yang belum dikumpulkan.
            </div>
          </div>
          <button
            onClick={() => setActiveTab('tugas')}
            className="rounded-lg bg-blue-700 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-800 transition shrink-0"
          >
            Buka Tugas
          </button>
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
          Beranda Siswa
        </button>

        <button
          onClick={() => setActiveTab('jadwal')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition ${
            activeTab === 'jadwal' 
              ? 'border-blue-700 text-blue-800' 
              : 'border-transparent text-slate-600 hover:text-blue-700 hover:border-slate-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          Jadwal & Kehadiran Saya
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
          Materi Pelajaran ({materials.length})
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
          Tugas & Pengumpulan ({assignments.length})
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
          Catatan Sikap & Karakter
        </button>
      </div>

      {/* Tab 1: Beranda Siswa */}
      {activeTab === 'beranda' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-blue-100 bg-white p-4 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Tingkat Presensi</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {persentaseHadir}%
              </div>
              <p className="text-[11px] text-blue-700 font-semibold mt-1">
                {totalHadir} Hadir · {attendances.filter(a => a.status === 'Sakit').length} Sakit · {attendances.filter(a => a.status === 'Izin').length} Izin
              </p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-white p-4 shadow-xs hover:border-sky-300 transition-colors">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Tugas Belum Selesai</span>
                <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
                  <FileCheck className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {uncompletedAssignments.length} Tugas
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Periksa batas waktu pengumpulan</p>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-white p-4 shadow-xs hover:border-indigo-300 transition-colors">
              <div className="flex items-center justify-between text-slate-600 mb-2">
                <span className="text-xs font-semibold">Materi Tersedia</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {materials.length} Dokumen
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Modul & video pembelajaran</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tugas Aktif List */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-amber-600" />
                  Daftar Tugas Aktif
                </h3>
                <span className="text-xs text-slate-500">Kelas XII MIPA 1</span>
              </div>

              <div className="space-y-2.5">
                {assignments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Tidak ada tugas aktif.</p>
                ) : (
                  assignments.map(asg => {
                    const sub = submissions.find(s => s.assignment_id === asg.id);
                    const isSubmitted = Boolean(sub);

                    return (
                      <div key={asg.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{asg.judul}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">{asg.subject?.nama_mapel}</span>
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Batas: {new Date(asg.deadline).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                        </div>
                        <div>
                          {isSubmitted ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              {sub?.nilai !== undefined && sub?.nilai !== null ? `Nilai: ${sub.nilai}` : 'Terkirim'}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleOpenSubmit(asg)}
                              className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 transition shadow-xs"
                            >
                              Kirim
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Jadwal Hari Ini */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-sky-600" />
                  Jadwal Belajar Mingguan
                </h3>
                <span className="text-xs text-slate-500">SMAN 1 Batudaa Pantai</span>
              </div>

              <div className="space-y-2">
                {schedules.map(sch => (
                  <div key={sch.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{sch.subject?.nama_mapel}</span>
                      <span className="text-[11px] text-slate-500">{sch.hari} · {sch.jam_mulai} - {sch.jam_selesai}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-700 block font-medium">{sch.teacher?.profile?.nama || 'Guru Mapel'}</span>
                      <span className="text-[10px] text-slate-400">{sch.ruangan || 'R. XII MIPA 1'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Jadwal & Kehadiran Saya */}
      {activeTab === 'jadwal' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <span className="text-[11px] font-medium text-emerald-800">Total Hadir</span>
              <div className="text-xl font-bold text-emerald-900 mt-1 tabular-nums">{totalHadir} Sesi</div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
              <span className="text-[11px] font-medium text-blue-800">Sakit (S)</span>
              <div className="text-xl font-bold text-blue-900 mt-1 tabular-nums">{attendances.filter(a => a.status === 'Sakit').length} Kali</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
              <span className="text-[11px] font-medium text-amber-800">Izin (I)</span>
              <div className="text-xl font-bold text-amber-900 mt-1 tabular-nums">{attendances.filter(a => a.status === 'Izin').length} Kali</div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3">
              <span className="text-[11px] font-medium text-purple-800">Terlambat (T)</span>
              <div className="text-xl font-bold text-purple-900 mt-1 tabular-nums">{totalTerlambat} Kali</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-bold text-slate-900">Riwayat Rekap Presensi Pribadi</h4>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/60 text-slate-600 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Tanggal</th>
                  <th className="py-2.5 px-4 font-semibold">Mata Pelajaran</th>
                  <th className="py-2.5 px-4 font-semibold">Status</th>
                  <th className="py-2.5 px-4 font-semibold">Catatan Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendances.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      Belum ada catatan presensi.
                    </td>
                  </tr>
                ) : (
                  attendances.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-mono text-slate-600 tabular-nums">{a.tanggal}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{a.schedule?.subject?.nama_mapel || 'Fisika XII'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${
                          a.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          a.status === 'Sakit' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          a.status === 'Izin' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          a.status === 'Terlambat' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{a.keterangan || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Materi Pelajaran */}
      {activeTab === 'materi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Materi Pembelajaran</h3>
              <p className="text-xs text-slate-500">Unduh modul bacaan dan tonton video referensi dari guru</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map(mat => (
              <div key={mat.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between hover:border-amber-400 transition">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {mat.subject?.nama_mapel || 'Fisika'}
                    </span>
                    <span className="text-[11px] text-slate-400 capitalize">{mat.tipe_konten || 'file'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{mat.judul}</h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">{mat.deskripsi || 'Materi pembelajaran kelas.'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Guru: {mat.teacher?.profile?.nama || 'Dra. Nurhayati Daud, M.Pd'}</span>
                  {mat.file_url && (
                    <a
                      href={mat.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800"
                    >
                      Buka Materi
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Tugas & Pengumpulan */}
      {activeTab === 'tugas' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Penugasan & Pengumpulan</h3>
              <p className="text-xs text-slate-500">Unggah jawaban tugas sebelum deadline berakhir</p>
            </div>
          </div>

          {/* Modal Pengumpulan Tugas */}
          {selectedAssignmentForSubmit && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
                <h3 className="font-bold text-slate-900 text-sm">Form Pengumpulan Tugas</h3>
                <p className="text-xs text-slate-700 font-semibold mt-1">
                  {selectedAssignmentForSubmit.judul}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Batas Waktu: {new Date(selectedAssignmentForSubmit.deadline).toLocaleString('id-ID')}
                </p>

                <form onSubmit={handleSubmitAssignment} className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Metode Pengumpulan</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSubmissionType('teks')}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                          submissionType === 'teks' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Teks Jawaban Langsung
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubmissionType('file')}
                        className={`py-1.5 text-xs font-medium rounded-lg border transition ${
                          submissionType === 'file' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-slate-700 border-slate-200'
                        }`}
                      >
                        Unggah File (PDF/Docs)
                      </button>
                    </div>
                  </div>

                  {submissionType === 'teks' ? (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Teks Jawaban Siswa *</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Ketik atau tempelkan uraian jawaban tugas Anda di sini..."
                        value={teksJawaban}
                        onChange={(e) => setTeksJawaban(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Lampiran File Tugas</label>
                      <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center bg-slate-50">
                        <Upload className="h-6 w-6 text-slate-400 mx-auto mb-1.5" />
                        <span className="text-xs text-slate-600 block">Pilih file PDF, DOCX, atau Gambar laporan</span>
                        <input
                          type="text"
                          placeholder="Atau masukkan URL Google Drive / Dokumen Anda"
                          value={fileUrl}
                          onChange={(e) => setFileUrl(e.target.value)}
                          className="mt-2 w-full rounded border border-slate-300 px-2.5 py-1 text-xs bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAssignmentForSubmit(null)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs flex items-center gap-1.5"
                    >
                      <Send className="h-3 w-3" />
                      {isSubmitting ? 'Mengirim...' : 'Kirim Jawaban Tugas'}
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
                  <th className="py-3 px-4 font-semibold">Judul Tugas</th>
                  <th className="py-3 px-4 font-semibold">Mata Pelajaran</th>
                  <th className="py-3 px-4 font-semibold">Batas Waktu</th>
                  <th className="py-3 px-4 font-semibold">Status Pengumpulan</th>
                  <th className="py-3 px-4 font-semibold">Nilai & Feedback Guru</th>
                  <th className="py-3 px-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignments.map(asg => {
                  const sub = submissions.find(s => s.assignment_id === asg.id);
                  const isSubmitted = Boolean(sub);

                  return (
                    <tr key={asg.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-semibold text-slate-900">{asg.judul}</td>
                      <td className="py-3 px-4 text-slate-600">{asg.subject?.nama_mapel}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 tabular-nums">
                        {new Date(asg.deadline).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="py-3 px-4">
                        {isSubmitted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Sudah Dikirim
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Belum Dikumpulkan
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {sub?.nilai !== undefined && sub?.nilai !== null ? (
                          <div>
                            <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {sub.nilai} / 100
                            </span>
                            {sub.feedback && <p className="text-[10px] text-slate-600 mt-1 italic">"{sub.feedback}"</p>}
                          </div>
                        ) : isSubmitted ? (
                          <span className="text-[11px] text-slate-400">Menunggu penilaian guru</span>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleOpenSubmit(asg)}
                          className="rounded-lg bg-amber-600 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-700 shadow-xs"
                        >
                          {isSubmitted ? 'Edit Kiriman' : 'Kumpulkan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Catatan Sikap & Karakter */}
      {activeTab === 'sikap' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Penilaian Sikap & Budi Pekerti</h3>
              <p className="text-xs text-slate-500">Evaluasi dimensi spiritual dan sosial oleh dewan guru</p>
            </div>
          </div>

          <div className="space-y-3">
            {attitudes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400 text-xs">
                Belum ada catatan observasi sikap untuk siswa ini.
              </div>
            ) : (
              attitudes.map(att => (
                <div key={att.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 capitalize">
                      Dimensi {att.jenis}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                      att.predikat === 'Sangat Baik' ? 'bg-emerald-100 text-emerald-800' :
                      att.predikat === 'Baik' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      Predikat: {att.predikat}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{att.catatan}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Pengamat: {att.teacher?.profile?.nama || 'Guru Mapel'}</span>
                    <span className="font-mono tabular-nums">{att.tanggal}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
};
