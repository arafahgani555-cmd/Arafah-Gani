export type UserRole = 'admin' | 'guru' | 'siswa';

export type AttendanceStatus = 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | 'Terlambat';
export type AttitudeType = 'spiritual' | 'sosial';
export type AttitudePredicate = 'Sangat Baik' | 'Baik' | 'Cukup' | 'Perlu Bimbingan';

export interface Profile {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  nomor_telepon?: string;
  created_at?: string;
}

export interface Teacher {
  id: string;
  profile_id: string;
  nip?: string;
  mapel_utama: string;
  profile?: Profile;
}

export interface ClassRoom {
  id: string;
  nama_kelas: string;
  tingkat: 'X' | 'XI' | 'XII';
  wali_kelas_id?: string;
  tahun_ajaran: string;
  wali_kelas?: Teacher & { profile?: Profile };
}

export interface Student {
  id: string;
  profile_id: string;
  nis: string;
  nisn: string;
  kelas_id: string;
  jenis_kelamin: 'L' | 'P';
  alamat?: string;
  profile?: Profile;
  kelas?: ClassRoom;
}

export interface Subject {
  id: string;
  nama_mapel: string;
  kode_mapel: string;
  kelompok?: string;
}

export interface Schedule {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';
  jam_mulai: string;
  jam_selesai: string;
  ruangan?: string;
  kelas?: ClassRoom;
  subject?: Subject;
  teacher?: Teacher & { profile?: Profile };
}

export interface Attendance {
  id: string;
  student_id: string;
  schedule_id?: string;
  class_id: string;
  tanggal: string; // YYYY-MM-DD
  status: AttendanceStatus;
  keterangan?: string;
  input_by?: string;
  student?: Student & { profile?: Profile };
  schedule?: Schedule;
  created_at?: string;
}

export interface Material {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  judul: string;
  deskripsi?: string;
  tipe_konten?: 'file' | 'link' | 'teks';
  file_url?: string;
  created_at: string;
  kelas?: ClassRoom;
  subject?: Subject;
  teacher?: Teacher & { profile?: Profile };
}

export interface Assignment {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  judul: string;
  deskripsi?: string;
  file_lampiran?: string;
  deadline: string;
  bobot_nilai: number;
  created_at: string;
  kelas?: ClassRoom;
  subject?: Subject;
  teacher?: Teacher & { profile?: Profile };
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  file_url?: string;
  teks_jawaban?: string;
  submitted_at: string;
  nilai?: number;
  feedback?: string;
  graded_at?: string;
  graded_by?: string;
  student?: Student & { profile?: Profile };
  assignment?: Assignment;
}

export interface TeacherJournal {
  id: string;
  teacher_id: string;
  class_id: string;
  subject_id: string;
  tanggal: string; // YYYY-MM-DD
  jam_ke: string;
  materi_diajarkan: string;
  metode: string;
  catatan?: string;
  jumlah_hadir?: number;
  jumlah_absen?: number;
  created_at: string;
  kelas?: ClassRoom;
  subject?: Subject;
  teacher?: Teacher & { profile?: Profile };
}

export interface AttitudeAssessment {
  id: string;
  student_id: string;
  teacher_id: string;
  tanggal: string;
  jenis: AttitudeType;
  predikat: AttitudePredicate;
  catatan?: string;
  created_at?: string;
  student?: Student & { profile?: Profile };
  teacher?: Teacher & { profile?: Profile };
}
