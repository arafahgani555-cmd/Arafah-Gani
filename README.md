# LMS SMA Negeri 1 Batudaa Pantai

Sistem Manajemen Pembelajaran (LMS) modern untuk **SMA Negeri 1 Batudaa Pantai** (Kabupaten Gorontalo). Aplikasi ini mengelola presensi siswa per kelas & sesi mapel, materi pembelajaran, penugasan & pengumpulan tugas, jurnal harian guru, dan penilaian sikap (spiritual & sosial).

---

## 🛠️ Arsitektur & Teknologi
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Motion
- **Backend & Database**: Supabase (PostgreSQL) menggunakan `@supabase/supabase-js`
- **Autentikasi**: Supabase Auth (Email & Password) dengan Role-Based Access Control (Admin / Guru / Siswa) dan sinkronisasi otomatis ke tabel `profiles` via Trigger
- **Penyimpanan File**: Supabase Storage (`materi` & `tugas`)
- **Hosting**: Vercel dengan integrasi GitHub CI/CD

---

## 📋 Langkah 1: Buat Project Baru di Supabase (Gratis)
1. Buka [https://supabase.com](https://supabase.com) dan klik **Start your project** (atau Sign In dengan akun GitHub).
2. Di dashboard Supabase, klik tombol **New Project**.
3. Pilih **Organization** Anda (atau buat baru, gratis).
4. Masukkan nama project, misalnya: `lms-batudaa-pantai`.
5. Masukkan **Database Password** yang kuat dan simpan dengan aman.
6. Pilih **Region** terdekat (disarankan: `Singapore (ap-southeast-1)` untuk latency terendah dari Indonesia).
7. Klik **Create new project** dan tunggu 1-2 menit hingga status database aktif (Active).

---

## 🗄️ Langkah 2: Menjalankan schema.sql di SQL Editor Supabase
1. Masuk ke dashboard project Supabase Anda.
2. Di sidebar sebelah kiri, klik menu **SQL Editor** (ikon terminal/SQL).
3. Klik tombol **+ New query**.
4. Buka file `supabase/schema.sql` dari repositori ini, salin (copy) seluruh kodenya, lalu tempel (paste) ke SQL Editor Supabase.
5. Klik tombol hijau **Run** di pojok kanan bawah editor.
6. Pastikan muncul status `Success. No rows returned` yang menandakan semua tabel, enum, trigger `handle_new_user`, dan RLS policies berhasil dibuat.

---

## 📁 Langkah 3: Setup Storage Buckets di Supabase
File `supabase/schema.sql` sudah otomatis menyiapkan konfigurasi bucket, namun Anda juga dapat memverifikasi atau membuatnya secara visual:
1. Di sidebar Supabase, buka menu **Storage**.
2. Pastikan terdapat 2 bucket:
   - **`materi`**: Pengaturan **Public bucket: ON** (agar siswa dapat mengunduh materi dengan cepat).
   - **`tugas`**: Pengaturan **Public bucket: OFF / Authenticated only** (privat untuk siswa dan guru).
3. Jika belum muncul, klik **New bucket**, beri nama sesuai di atas, lalu simpan.

---

## 🔑 Langkah 4: Ambil Kredensial Supabase ke File .env
1. Di dashboard Supabase, klik menu **Project Settings** (ikon gerigi di kiri bawah).
2. Pilih submenu **API**.
3. Salin nilai:
   - **Project URL** -> masukkan ke `VITE_SUPABASE_URL`
   - **anon / public key** -> masukkan ke `VITE_SUPABASE_ANON_KEY` *(JANGAN gunakan `service_role` key!)*
4. Buat file `.env` di root direktori project:
   ```env
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 💻 Langkah 5: Menjalankan Aplikasi Secara Lokal
1. Pastikan Node.js (v18+) terinstall di komputer Anda.
2. Buka terminal di folder project dan install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Buka browser pada URL yang ditampilkan (biasanya `http://localhost:3000` atau `http://localhost:5173`).

> **Tips Uji Coba Langsung**: Aplikasi dilengkapi dengan **Demo Mode & Role Switcher** instan, sehingga Anda bisa langsung menguji tampilan dan fitur Admin, Guru, dan Siswa baik dengan Supabase aktif maupun dalam mode preview lokal!

---

## 🚀 Langkah 6: Push Repositori ke GitHub
1. Buat repository baru di [GitHub](https://github.com/new), misalnya `lms-batudaa-pantai` (pilih Private atau Public).
2. Di terminal project lokal, inisialisasi git dan push kode:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi LMS SMAN 1 Batudaa Pantai"
   git branch -M main
   git remote add origin https://github.com/username-anda/lms-batudaa-pantai.git
   git push -u origin main
   ```

---

## 🌐 Langkah 7: Deploy ke Vercel (Step-by-Step)
1. Buka [https://vercel.com](https://vercel.com) dan Login menggunakan akun GitHub.
2. Klik tombol **Add New...** -> **Project**.
3. Pilih repository `lms-batudaa-pantai` yang baru saja Anda push, lalu klik **Import**.
4. Di bagian **Configure Project**:
   - **Framework Preset**: Pilih `Vite`.
   - **Root Directory**: Biarkan `./`.
5. Buka accordion **Environment Variables** dan tambahkan 2 variabel:
   - Name: `VITE_SUPABASE_URL` | Value: `https://xxxxxxxxxxxx.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY` | Value: `eyJhbGciOi...`
6. Klik tombol biru **Deploy**.
7. Tunggu sekitar 1 menit hingga build selesai. Website LMS Anda kini aktif di URL `https://lms-batudaa-pantai.vercel.app`! Setiap push ke branch `main` di GitHub akan otomatis di-deploy ulang oleh Vercel.

---

## 👥 Pengguna & Hak Akses (Role)
- **Admin**: Tata Usaha / Operator Sekolah mengelola Master Data Guru, Siswa, Kelas, Mapel, Jadwal, dan Rekap Presensi Sekolah.
- **Guru**: Menginput absensi siswa per jam pelajaran, mengunggah materi, membuat tugas & menilai submission, mengisi Jurnal Harian Mengajar, dan menilai Sikap Siswa.
- **Siswa**: Melihat jadwal & rekap kehadiran pribadi, mengunduh materi, mengumpulkan tugas (teks / link / file), serta melihat rapor nilai tugas dan catatan sikap guru.

© 2025 SMA Negeri 1 Batudaa Pantai — Gorontalo.
