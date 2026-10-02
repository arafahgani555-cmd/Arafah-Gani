-- ====================================================================
-- LMS SMA NEGERI 1 BATUDAA PANTAI
-- DATABASE SCHEMA MIGRATION (PostgreSQL for Supabase)
-- Termasuk Tabel, Relasi, Trigger Auth Profiles, RLS Policies, dan Storage
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'guru', 'siswa');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attendance_status AS ENUM ('Hadir', 'Sakit', 'Izin', 'Alpa', 'Terlambat');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attitude_type AS ENUM ('spiritual', 'sosial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE attitude_predicate AS ENUM ('Sangat Baik', 'Baik', 'Cukup', 'Perlu Bimbingan');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'siswa',
    avatar_url TEXT,
    nomor_telepon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nip VARCHAR(30) UNIQUE,
    mapel_utama TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_kelas VARCHAR(50) NOT NULL,
    tingkat VARCHAR(10) NOT NULL, -- 'X', 'XI', 'XII'
    wali_kelas_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    tahun_ajaran VARCHAR(20) NOT NULL DEFAULT '2024/2025',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    nis VARCHAR(20) UNIQUE NOT NULL,
    nisn VARCHAR(20) UNIQUE NOT NULL,
    kelas_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    jenis_kelamin VARCHAR(1) CHECK (jenis_kelamin IN ('L', 'P')),
    alamat TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nama_mapel TEXT NOT NULL,
    kode_mapel VARCHAR(20) UNIQUE NOT NULL,
    kelompok VARCHAR(30) DEFAULT 'Wajib',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. SCHEDULES TABLE (Jadwal Pelajaran)
CREATE TABLE IF NOT EXISTS public.schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    hari VARCHAR(20) NOT NULL, -- 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,
    ruangan VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. ATTENDANCES TABLE (Presensi Siswa)
CREATE TABLE IF NOT EXISTS public.attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    status attendance_status NOT NULL DEFAULT 'Hadir',
    keterangan TEXT,
    input_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_student_schedule_date UNIQUE (student_id, schedule_id, tanggal)
);

-- 10. MATERIALS TABLE (Materi Pembelajaran)
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    tipe_konten VARCHAR(30) DEFAULT 'file', -- 'file', 'link', 'teks'
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. ASSIGNMENTS TABLE (Tugas)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    deskripsi TEXT,
    file_lampiran TEXT,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    bobot_nilai NUMERIC(5, 2) DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. SUBMISSIONS TABLE (Pengumpulan Tugas Siswa)
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    file_url TEXT,
    teks_jawaban TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nilai NUMERIC(5, 2) CHECK (nilai >= 0 AND nilai <= 100),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    CONSTRAINT unique_assignment_student UNIQUE (assignment_id, student_id)
);

-- 13. TEACHER JOURNALS TABLE (Jurnal Harian Guru)
CREATE TABLE IF NOT EXISTS public.teacher_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jam_ke VARCHAR(20) NOT NULL, -- Contoh: '1 - 2 (07:15 - 08:45)'
    materi_diajarkan TEXT NOT NULL,
    metode TEXT NOT NULL,
    catatan TEXT,
    jumlah_hadir INT DEFAULT 0,
    jumlah_absen INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. ATTITUDE ASSESSMENTS TABLE (Penilaian Sikap Siswa)
CREATE TABLE IF NOT EXISTS public.attitude_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL DEFAULT CURRENT_DATE,
    jenis attitude_type NOT NULL, -- 'spiritual' atau 'sosial'
    predikat attitude_predicate NOT NULL, -- 'Sangat Baik', 'Baik', 'Cukup', 'Perlu Bimbingan'
    catatan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- AUTOMATIC PROFILE TRIGGER (ON AUTH.USERS INSERT)
-- ====================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    default_role public.user_role;
    raw_role text;
BEGIN
    raw_role := (new.raw_user_meta_data->>'role');
    
    IF raw_role = 'admin' THEN
        default_role := 'admin'::public.user_role;
    ELSIF raw_role = 'guru' THEN
        default_role := 'guru'::public.user_role;
    ELSE
        default_role := 'siswa'::public.user_role;
    END IF;

    INSERT INTO public.profiles (id, nama, email, role)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'nama', split_part(new.email, '@', 1)),
        new.email,
        default_role
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger jika sudah ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Buat trigger baru
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Helper functions untuk cek role dari auth.uid()
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public.user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_teacher_id()
RETURNS UUID AS $$
    SELECT id FROM public.teachers WHERE profile_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.current_student_id()
RETURNS UUID AS $$
    SELECT id FROM public.students WHERE profile_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. PROFILES RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles can be viewed by authenticated users"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile or admin can update all"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin can insert profiles"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin() OR auth.uid() = id);

-- 2. TEACHERS RLS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can be viewed by all authenticated users"
    ON public.teachers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage teachers"
    ON public.teachers FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. CLASSES RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classes can be viewed by all authenticated users"
    ON public.classes FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage classes"
    ON public.classes FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. STUDENTS RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can be viewed by authenticated users"
    ON public.students FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage students"
    ON public.students FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. SUBJECTS RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subjects can be viewed by all authenticated users"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can manage subjects"
    ON public.subjects FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. SCHEDULES RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Schedules can be viewed by all authenticated users"
    ON public.schedules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin or assigned teachers can manage schedules"
    ON public.schedules FOR ALL
    TO authenticated
    USING (public.is_admin() OR teacher_id = public.current_teacher_id())
    WITH CHECK (public.is_admin() OR teacher_id = public.current_teacher_id());

-- 7. ATTENDANCES RLS
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attendances read access"
    ON public.attendances FOR SELECT
    TO authenticated
    USING (
        public.is_admin() 
        OR student_id = public.current_student_id() 
        OR public.current_user_role() = 'guru'
    );

CREATE POLICY "Teachers and Admin can insert/update attendances"
    ON public.attendances FOR ALL
    TO authenticated
    USING (public.is_admin() OR public.current_user_role() = 'guru')
    WITH CHECK (public.is_admin() OR public.current_user_role() = 'guru');

-- 8. MATERIALS RLS
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Materials read access"
    ON public.materials FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can manage their own materials, admin can manage all"
    ON public.materials FOR ALL
    TO authenticated
    USING (public.is_admin() OR teacher_id = public.current_teacher_id())
    WITH CHECK (public.is_admin() OR teacher_id = public.current_teacher_id());

-- 9. ASSIGNMENTS RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assignments read access"
    ON public.assignments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Teachers can manage assignments, admin can manage all"
    ON public.assignments FOR ALL
    TO authenticated
    USING (public.is_admin() OR teacher_id = public.current_teacher_id())
    WITH CHECK (public.is_admin() OR teacher_id = public.current_teacher_id());

-- 10. SUBMISSIONS RLS
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Submissions select access"
    ON public.submissions FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR student_id = public.current_student_id()
        OR EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = submissions.assignment_id
            AND a.teacher_id = public.current_teacher_id()
        )
    );

CREATE POLICY "Students can insert their own submission"
    ON public.submissions FOR INSERT
    TO authenticated
    WITH CHECK (student_id = public.current_student_id());

CREATE POLICY "Students can update their submission before grading"
    ON public.submissions FOR UPDATE
    TO authenticated
    USING (
        student_id = public.current_student_id()
        OR public.is_admin()
        OR EXISTS (
            SELECT 1 FROM public.assignments a
            WHERE a.id = submissions.assignment_id
            AND a.teacher_id = public.current_teacher_id()
        )
    );

-- 11. TEACHER JOURNALS RLS
ALTER TABLE public.teacher_journals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Journals read access"
    ON public.teacher_journals FOR SELECT
    TO authenticated
    USING (public.is_admin() OR teacher_id = public.current_teacher_id());

CREATE POLICY "Teachers can manage their own journals, admin full access"
    ON public.teacher_journals FOR ALL
    TO authenticated
    USING (public.is_admin() OR teacher_id = public.current_teacher_id())
    WITH CHECK (public.is_admin() OR teacher_id = public.current_teacher_id());

-- 12. ATTITUDE ASSESSMENTS RLS
ALTER TABLE public.attitude_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attitude assessments read access"
    ON public.attitude_assessments FOR SELECT
    TO authenticated
    USING (
        public.is_admin()
        OR student_id = public.current_student_id()
        OR teacher_id = public.current_teacher_id()
    );

CREATE POLICY "Teachers and admin can insert/update attitude assessments"
    ON public.attitude_assessments FOR ALL
    TO authenticated
    USING (public.is_admin() OR public.current_user_role() = 'guru')
    WITH CHECK (public.is_admin() OR public.current_user_role() = 'guru');

-- ====================================================================
-- STORAGE BUCKETS CONFIGURATION (Materi & Tugas)
-- ====================================================================

-- 1. Buat bucket 'materi' (public untuk dibaca siswa & guru)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materi', 'materi', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Buat bucket 'tugas' (private / authenticated)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tugas', 'tugas', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies untuk bucket 'materi':
CREATE POLICY "Materi bucket is publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'materi');

CREATE POLICY "Guru and admin can upload materi"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'materi' AND (public.is_admin() OR public.current_user_role() = 'guru')
    );

-- Storage Policies untuk bucket 'tugas':
CREATE POLICY "Authenticated users can read tugas"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (bucket_id = 'tugas');

CREATE POLICY "Authenticated users can upload tugas"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'tugas');
