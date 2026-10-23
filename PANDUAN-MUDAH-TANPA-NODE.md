# KRM Buddy — Panduan paling mudah tanpa memasang Node.js pada komputer

## Apa yang ada dalam projek ini
- Frontend React/Vite responsif (deep blue + yellow gold)
- Pendaftaran dengan nama, username, e-mel dan kata laluan
- Log masuk Supabase Auth
- Profil ahli, kumpulan usrah, pengumuman, bahan (pautan), sesi/kehadiran
- Peranan admin, ketua kumpulan dan ahli serta polisi RLS dalam `supabase/schema.sql`

**Penting:** Ini ialah fail sumber yang perlu disambungkan kepada akaun Supabase dan diterbitkan. Ia bukan URL website yang sudah live. Anda perlu buat akaun anda sendiri kerana database, e-mel dan domain perlu dimiliki organisasi.

## Kaedah online tanpa Node.js pada Windows

### Langkah 1 — Cipta database Supabase
1. Buka https://supabase.com dan daftar/log masuk.
2. Cipta projek baru dan simpan kata laluan database di tempat selamat.
3. Dalam dashboard projek, buka **SQL Editor** → **New query**.
4. Buka fail `supabase/schema.sql` dari ZIP ini menggunakan editor teks, salin semua kandungan, tampal ke SQL Editor dan tekan **Run**.
5. Pergi ke bahagian **Project Settings / API** atau **Connect**. Salin **Project URL** dan **publishable key** (atau anon key jika dashboard memaparkan nama lama). Jangan gunakan `service_role` key.

### Langkah 2 — Upload projek ke GitHub tanpa terminal
1. Buka https://github.com dan cipta akaun/log masuk.
2. Tekan **New repository**, namakan `krm-buddy`, pilih Private jika anda mahu repository tidak umum, kemudian Create repository.
3. Buka repository baru → **Add file** → **Upload files**.
4. Extract ZIP di komputer. Masuk folder `KRM-Buddy-Portal` dan upload fail/folder projek (termasuk `src`, `supabase`, `package.json`, `index.html`, `.gitignore`). **Jangan upload `.env` atau sebarang secret.**
5. Tekan **Commit changes**.

Jika laman GitHub tidak membenarkan muat naik folder secara terus, buka folder `src` dan `supabase` dan upload kandungan setiap folder secara berasingan; pastikan struktur folder di repository kekal sama.

### Langkah 3 — Deploy di Vercel
1. Buka https://vercel.com dan daftar/log masuk menggunakan GitHub.
2. Pilih **Add New → Project**, import repository `krm-buddy`.
3. Framework preset: **Vite**. Build command `npm run build`; output directory `dist`.
4. Sebelum deploy atau dalam Project Settings → Environment Variables, tambah:
   - `VITE_SUPABASE_URL` = Project URL Supabase
   - `VITE_SUPABASE_ANON_KEY` = publishable/anon key Supabase
5. Klik **Deploy**. Vercel akan memasang pakej dan membina website di cloud; Node.js tidak perlu dipasang di komputer anda untuk proses ini.

### Langkah 4 — Tetapkan URL auth
1. Selepas Vercel beri URL website, buka Supabase → **Authentication → URL Configuration**.
2. Set **Site URL** kepada URL Vercel anda, contoh `https://nama-projek.vercel.app`.
3. Tambah URL tersebut dalam **Redirect URLs** jika diperlukan.
4. Jika anda mengubah environment variables kemudian, redeploy projek di Vercel.

### Langkah 5 — Cipta admin pertama
1. Buka URL website yang diterbitkan dan daftar akaun anda sendiri menggunakan e-mel yang sah.
2. Jika pengesahan e-mel diaktifkan, sahkan e-mel dan log masuk.
3. Buka Supabase → SQL Editor dan jalankan query di bawah, gantikan e-mel contoh dengan e-mel yang anda daftarkan:

```sql
update public.profiles
set role = 'admin'
where lower(email) = lower('e-mel-anda@example.com');
```

4. Log keluar dan log masuk semula. Selepas itu admin boleh melantik admin lain atau ketua kumpulan melalui pengurusan ahli.

## Nota penting
- Username disimpan dalam profil; login versi ini menggunakan e-mel dan kata laluan.
- Bahan usrah versi awal menggunakan pautan URL (contohnya pautan PDF); muat naik fail terus belum diaktifkan.
- Jangan kongsi `service_role` key. Jangan letakkan rahsia dalam frontend atau repository.
- Sebelum menggunakan data sebenar, uji pendaftaran, admin, sekatan ketua kumpulan, akses silang kumpulan dan semua fungsi database.
- Polisi RLS dalam SQL ialah sebahagian keselamatan. Jangan matikan RLS.
- Untuk penggunaan kelab sebenar, dapatkan persetujuan yang sesuai sebelum menyimpan maklumat peribadi ahli.
