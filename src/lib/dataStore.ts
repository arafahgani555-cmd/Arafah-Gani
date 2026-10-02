import { 
  Profile, 
  Teacher, 
  Student, 
  ClassRoom, 
  Subject, 
  Schedule, 
  Attendance, 
  Material, 
  Assignment, 
  Submission, 
  TeacherJournal, 
  AttitudeAssessment,
  AttendanceStatus,
  AttitudeType,
  AttitudePredicate
} from '../types/database';
import { 
  INITIAL_PROFILES, 
  INITIAL_TEACHERS, 
  INITIAL_CLASSES, 
  INITIAL_SUBJECTS, 
  INITIAL_STUDENTS, 
  INITIAL_SCHEDULES, 
  INITIAL_ATTENDANCES, 
  INITIAL_MATERIALS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_JOURNALS, 
  INITIAL_ATTITUDES 
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEY_PREFIX = 'lms_batudaa_data_';

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
}

export const DataStore = {
  // Reset all local demo data to defaults
  resetAllToDefault() {
    setLocal('profiles', INITIAL_PROFILES);
    setLocal('teachers', INITIAL_TEACHERS);
    setLocal('classes', INITIAL_CLASSES);
    setLocal('subjects', INITIAL_SUBJECTS);
    setLocal('students', INITIAL_STUDENTS);
    setLocal('schedules', INITIAL_SCHEDULES);
    setLocal('attendances', INITIAL_ATTENDANCES);
    setLocal('materials', INITIAL_MATERIALS);
    setLocal('assignments', INITIAL_ASSIGNMENTS);
    setLocal('submissions', INITIAL_SUBMISSIONS);
    setLocal('journals', INITIAL_JOURNALS);
    setLocal('attitudes', INITIAL_ATTITUDES);
  },

  // 1. PROFILES
  async getProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) return data as Profile[];
    }
    return getLocal<Profile[]>('profiles', INITIAL_PROFILES);
  },

  // 2. TEACHERS
  async getTeachers(): Promise<Teacher[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('teachers').select('*, profile:profiles(*)');
      if (!error && data && data.length > 0) return data as Teacher[];
    }
    const teachers = getLocal<Teacher[]>('teachers', INITIAL_TEACHERS);
    const profiles = await this.getProfiles();
    return teachers.map(t => ({
      ...t,
      profile: profiles.find(p => p.id === t.profile_id)
    }));
  },

  async addTeacher(teacher: Omit<Teacher, 'id'>, profile: Omit<Profile, 'id'>): Promise<Teacher> {
    const newUserId = 'user-t-' + Date.now();
    const newTeacherId = 't-' + Date.now();

    const newProfile: Profile = {
      ...profile,
      id: newUserId,
      role: 'guru',
      created_at: new Date().toISOString(),
    };

    const newTeacher: Teacher = {
      ...teacher,
      id: newTeacherId,
      profile_id: newUserId,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').insert(newProfile);
        await supabase.from('teachers').insert(newTeacher);
      } catch (e) {
        console.warn('Supabase insert failed, fallback to local', e);
      }
    }

    const profiles = await this.getProfiles();
    setLocal('profiles', [...profiles, newProfile]);

    const teachers = getLocal<Teacher[]>('teachers', INITIAL_TEACHERS);
    const updated = [...teachers, newTeacher];
    setLocal('teachers', updated);
    return { ...newTeacher, profile: newProfile };
  },

  // 3. STUDENTS
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('students').select('*, profile:profiles(*), kelas:classes(*)');
      if (!error && data && data.length > 0) return data as Student[];
    }
    const students = getLocal<Student[]>('students', INITIAL_STUDENTS);
    const profiles = await this.getProfiles();
    const classes = await this.getClasses();
    return students.map(s => ({
      ...s,
      profile: profiles.find(p => p.id === s.profile_id),
      kelas: classes.find(c => c.id === s.kelas_id)
    }));
  },

  async addStudent(student: Omit<Student, 'id'>, profile: Omit<Profile, 'id'>): Promise<Student> {
    const newUserId = 'user-s-' + Date.now();
    const newStudentId = 's-' + Date.now();

    const newProfile: Profile = {
      ...profile,
      id: newUserId,
      role: 'siswa',
      created_at: new Date().toISOString(),
    };

    const newStudent: Student = {
      ...student,
      id: newStudentId,
      profile_id: newUserId,
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('profiles').insert(newProfile);
        await supabase.from('students').insert(newStudent);
      } catch (e) {
        console.warn('Supabase insert failed, fallback to local', e);
      }
    }

    const profiles = await this.getProfiles();
    setLocal('profiles', [...profiles, newProfile]);

    const students = getLocal<Student[]>('students', INITIAL_STUDENTS);
    const updated = [...students, newStudent];
    setLocal('students', updated);
    return { ...newStudent, profile: newProfile };
  },

  // 4. CLASSES
  async getClasses(): Promise<ClassRoom[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('classes').select('*, wali_kelas:teachers(*, profile:profiles(*))');
      if (!error && data && data.length > 0) return data as ClassRoom[];
    }
    const classes = getLocal<ClassRoom[]>('classes', INITIAL_CLASSES);
    const teachers = await this.getTeachers();
    return classes.map(c => ({
      ...c,
      wali_kelas: teachers.find(t => t.id === c.wali_kelas_id)
    }));
  },

  async addClass(newClass: Omit<ClassRoom, 'id'>): Promise<ClassRoom> {
    const id = 'c-' + Date.now();
    const created: ClassRoom = { ...newClass, id };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('classes').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }

    const classes = getLocal<ClassRoom[]>('classes', INITIAL_CLASSES);
    setLocal('classes', [...classes, created]);
    return created;
  },

  // 5. SUBJECTS
  async getSubjects(): Promise<Subject[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('subjects').select('*');
      if (!error && data && data.length > 0) return data as Subject[];
    }
    return getLocal<Subject[]>('subjects', INITIAL_SUBJECTS);
  },

  async addSubject(newSubject: Omit<Subject, 'id'>): Promise<Subject> {
    const id = 'sub-' + Date.now();
    const created: Subject = { ...newSubject, id };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('subjects').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }

    const subjects = getLocal<Subject[]>('subjects', INITIAL_SUBJECTS);
    setLocal('subjects', [...subjects, created]);
    return created;
  },

  // 6. SCHEDULES
  async getSchedules(): Promise<Schedule[]> {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('schedules').select('*, kelas:classes(*), subject:subjects(*), teacher:teachers(*, profile:profiles(*))');
      if (!error && data && data.length > 0) return data as Schedule[];
    }
    const schedules = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
    const classes = await this.getClasses();
    const subjects = await this.getSubjects();
    const teachers = await this.getTeachers();

    return schedules.map(sch => ({
      ...sch,
      kelas: classes.find(c => c.id === sch.class_id),
      subject: subjects.find(s => s.id === sch.subject_id),
      teacher: teachers.find(t => t.id === sch.teacher_id),
    }));
  },

  async addSchedule(sch: Omit<Schedule, 'id'>): Promise<Schedule> {
    const id = 'sch-' + Date.now();
    const created: Schedule = { ...sch, id };
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('schedules').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }
    const schedules = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
    setLocal('schedules', [...schedules, created]);
    return created;
  },

  async updateSchedule(id: string, updated: Partial<Schedule>): Promise<Schedule> {
    const schedules = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
    const index = schedules.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Jadwal tidak ditemukan');

    const newObj: Schedule = {
      ...schedules[index],
      ...updated,
    };
    schedules[index] = newObj;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('schedules').update({
          class_id: newObj.class_id,
          subject_id: newObj.subject_id,
          teacher_id: newObj.teacher_id,
          hari: newObj.hari,
          jam_mulai: newObj.jam_mulai,
          jam_selesai: newObj.jam_selesai,
          ruangan: newObj.ruangan,
        }).eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    setLocal('schedules', schedules);
    return newObj;
  },

  async deleteSchedule(id: string): Promise<boolean> {
    const schedules = getLocal<Schedule[]>('schedules', INITIAL_SCHEDULES);
    const filtered = schedules.filter(s => s.id !== id);

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('schedules').delete().eq('id', id);
      } catch (e) {
        console.warn(e);
      }
    }

    setLocal('schedules', filtered);
    return true;
  },

  // 7. ATTENDANCES
  async getAttendances(filter?: { class_id?: string; tanggal?: string; student_id?: string }): Promise<Attendance[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase.from('attendances').select('*, student:students(*, profile:profiles(*)), schedule:schedules(*, subject:subjects(*))');
      if (filter?.class_id) q = q.eq('class_id', filter.class_id);
      if (filter?.tanggal) q = q.eq('tanggal', filter.tanggal);
      if (filter?.student_id) q = q.eq('student_id', filter.student_id);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as Attendance[];
    }
    let list = getLocal<Attendance[]>('attendances', INITIAL_ATTENDANCES);
    if (filter?.class_id) list = list.filter(a => a.class_id === filter.class_id);
    if (filter?.tanggal) list = list.filter(a => a.tanggal === filter.tanggal);
    if (filter?.student_id) list = list.filter(a => a.student_id === filter.student_id);

    const students = await this.getStudents();
    const schedules = await this.getSchedules();

    return list.map(a => ({
      ...a,
      student: students.find(s => s.id === a.student_id),
      schedule: schedules.find(sch => sch.id === a.schedule_id)
    }));
  },

  async recordAttendances(records: Omit<Attendance, 'id'>[]): Promise<Attendance[]> {
    const attendances = getLocal<Attendance[]>('attendances', INITIAL_ATTENDANCES);
    const updated = [...attendances];
    const newRecords: Attendance[] = [];

    for (const r of records) {
      const existingIdx = updated.findIndex(
        a => a.student_id === r.student_id && a.tanggal === r.tanggal && (r.schedule_id ? a.schedule_id === r.schedule_id : true)
      );
      if (existingIdx >= 0) {
        updated[existingIdx] = { ...updated[existingIdx], ...r };
        newRecords.push(updated[existingIdx]);
      } else {
        const item: Attendance = { ...r, id: 'att-' + Math.random().toString(36).substring(2, 9) };
        updated.push(item);
        newRecords.push(item);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('attendances').upsert(newRecords);
      } catch (e) {
        console.warn(e);
      }
    }

    setLocal('attendances', updated);
    return newRecords;
  },

  // 8. MATERIALS
  async getMaterials(class_id?: string): Promise<Material[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase.from('materials').select('*, kelas:classes(*), subject:subjects(*), teacher:teachers(*, profile:profiles(*))').order('created_at', { ascending: false });
      if (class_id) q = q.eq('class_id', class_id);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as Material[];
    }
    let list = getLocal<Material[]>('materials', INITIAL_MATERIALS);
    if (class_id) list = list.filter(m => m.class_id === class_id);
    const classes = await this.getClasses();
    const subjects = await this.getSubjects();
    const teachers = await this.getTeachers();

    return list.map(m => ({
      ...m,
      kelas: classes.find(c => c.id === m.class_id),
      subject: subjects.find(s => s.id === m.subject_id),
      teacher: teachers.find(t => t.id === m.teacher_id),
    }));
  },

  async addMaterial(mat: Omit<Material, 'id' | 'created_at'>): Promise<Material> {
    const created: Material = {
      ...mat,
      id: 'mat-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('materials').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }

    const list = getLocal<Material[]>('materials', INITIAL_MATERIALS);
    setLocal('materials', [created, ...list]);
    return created;
  },

  // 9. ASSIGNMENTS
  async getAssignments(class_id?: string): Promise<Assignment[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase.from('assignments').select('*, kelas:classes(*), subject:subjects(*), teacher:teachers(*, profile:profiles(*))').order('deadline', { ascending: true });
      if (class_id) q = q.eq('class_id', class_id);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as Assignment[];
    }
    let list = getLocal<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
    if (class_id) list = list.filter(a => a.class_id === class_id);
    const classes = await this.getClasses();
    const subjects = await this.getSubjects();
    const teachers = await this.getTeachers();

    return list.map(a => ({
      ...a,
      kelas: classes.find(c => c.id === a.class_id),
      subject: subjects.find(s => s.id === a.subject_id),
      teacher: teachers.find(t => t.id === a.teacher_id),
    }));
  },

  async addAssignment(asg: Omit<Assignment, 'id' | 'created_at'>): Promise<Assignment> {
    const created: Assignment = {
      ...asg,
      id: 'asg-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('assignments').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }

    const list = getLocal<Assignment[]>('assignments', INITIAL_ASSIGNMENTS);
    setLocal('assignments', [created, ...list]);
    return created;
  },

  // 10. SUBMISSIONS
  async getSubmissions(assignment_id?: string): Promise<Submission[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase.from('submissions').select('*, student:students(*, profile:profiles(*)), assignment:assignments(*)');
      if (assignment_id) q = q.eq('assignment_id', assignment_id);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as Submission[];
    }
    let list = getLocal<Submission[]>('submissions', INITIAL_SUBMISSIONS);
    if (assignment_id) list = list.filter(s => s.assignment_id === assignment_id);
    const students = await this.getStudents();
    const assignments = await this.getAssignments();

    return list.map(sub => ({
      ...sub,
      student: students.find(s => s.id === sub.student_id),
      assignment: assignments.find(a => a.id === sub.assignment_id)
    }));
  },

  async submitAssignment(submission: Omit<Submission, 'id' | 'submitted_at'>): Promise<Submission> {
    const list = getLocal<Submission[]>('submissions', INITIAL_SUBMISSIONS);
    const existingIndex = list.findIndex(
      s => s.assignment_id === submission.assignment_id && s.student_id === submission.student_id
    );

    const now = new Date().toISOString();
    let updatedItem: Submission;

    if (existingIndex >= 0) {
      updatedItem = {
        ...list[existingIndex],
        ...submission,
        submitted_at: now,
      };
      list[existingIndex] = updatedItem;
    } else {
      updatedItem = {
        ...submission,
        id: 'subm-' + Date.now(),
        submitted_at: now,
      };
      list.push(updatedItem);
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('submissions').upsert(updatedItem);
      } catch (e) {
        console.warn(e);
      }
    }

    setLocal('submissions', list);
    return updatedItem;
  },

  async gradeSubmission(submissionId: string, grade: number, feedback: string, teacherId: string): Promise<Submission> {
    const list = getLocal<Submission[]>('submissions', INITIAL_SUBMISSIONS);
    const index = list.findIndex(s => s.id === submissionId);
    if (index === -1) throw new Error('Submission not found');

    const updated: Submission = {
      ...list[index],
      nilai: grade,
      feedback,
      graded_at: new Date().toISOString(),
      graded_by: teacherId,
    };
    list[index] = updated;

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('submissions').update({
          nilai: grade,
          feedback,
          graded_at: updated.graded_at,
          graded_by: teacherId
        }).eq('id', submissionId);
      } catch (e) {
        console.warn(e);
      }
    }

    setLocal('submissions', list);
    return updated;
  },

  // 11. TEACHER JOURNALS
  async getJournals(teacher_id?: string): Promise<TeacherJournal[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase.from('teacher_journals').select('*, kelas:classes(*), subject:subjects(*), teacher:teachers(*, profile:profiles(*))').order('tanggal', { ascending: false });
      if (teacher_id) q = q.eq('teacher_id', teacher_id);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as TeacherJournal[];
    }
    let list = getLocal<TeacherJournal[]>('journals', INITIAL_JOURNALS);
    if (teacher_id) list = list.filter(j => j.teacher_id === teacher_id);
    const classes = await this.getClasses();
    const subjects = await this.getSubjects();
    const teachers = await this.getTeachers();

    return list.map(j => ({
      ...j,
      kelas: classes.find(c => c.id === j.class_id),
      subject: subjects.find(s => s.id === j.subject_id),
      teacher: teachers.find(t => t.id === j.teacher_id)
    }));
  },

  async addJournal(jrn: Omit<TeacherJournal, 'id' | 'created_at'>): Promise<TeacherJournal> {
    const created: TeacherJournal = {
      ...jrn,
      id: 'jrn-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('teacher_journals').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }

    const list = getLocal<TeacherJournal[]>('journals', INITIAL_JOURNALS);
    setLocal('journals', [created, ...list]);
    return created;
  },

  // 12. ATTITUDE ASSESSMENTS
  async getAttitudeAssessments(filter?: { student_id?: string; teacher_id?: string }): Promise<AttitudeAssessment[]> {
    if (isSupabaseConfigured() && supabase) {
      let q = supabase.from('attitude_assessments').select('*, student:students(*, profile:profiles(*)), teacher:teachers(*, profile:profiles(*))').order('tanggal', { ascending: false });
      if (filter?.student_id) q = q.eq('student_id', filter.student_id);
      if (filter?.teacher_id) q = q.eq('teacher_id', filter.teacher_id);
      const { data, error } = await q;
      if (!error && data && data.length > 0) return data as AttitudeAssessment[];
    }
    let list = getLocal<AttitudeAssessment[]>('attitudes', INITIAL_ATTITUDES);
    if (filter?.student_id) list = list.filter(a => a.student_id === filter.student_id);
    if (filter?.teacher_id) list = list.filter(a => a.teacher_id === filter.teacher_id);

    const students = await this.getStudents();
    const teachers = await this.getTeachers();

    return list.map(att => ({
      ...att,
      student: students.find(s => s.id === att.student_id),
      teacher: teachers.find(t => t.id === att.teacher_id),
    }));
  },

  async addAttitudeAssessment(att: Omit<AttitudeAssessment, 'id' | 'created_at'>): Promise<AttitudeAssessment> {
    const created: AttitudeAssessment = {
      ...att,
      id: 'attd-' + Date.now(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('attitude_assessments').insert(created);
      } catch (e) {
        console.warn(e);
      }
    }

    const list = getLocal<AttitudeAssessment[]>('attitudes', INITIAL_ATTITUDES);
    setLocal('attitudes', [created, ...list]);
    return created;
  }
};
