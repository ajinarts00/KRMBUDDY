# KRM Buddy Portal — Kelab Rakan Masjid UMS

Portal pengurusan komuniti responsif dengan React + Vite dan Supabase. Tema warna menggunakan deep blue dan yellow gold sebagai identiti visual awal KRM Buddy. Tukar logo teks kepada fail logo rasmi kelab apabila tersedia.

## Apa yang disediakan

- Daftar akaun dengan e-mel, username, nama penuh dan kata laluan.
- Log masuk / log keluar menggunakan Supabase Auth.
- Profil ahli dan peranan `admin`, `leader` (ketua kumpulan), `member`.
- Database ahli, kumpulan usrah, pengumuman, material dan sesi/rekod kehadiran.
- Admin boleh mengurus peranan, status dan kumpulan ahli; beberapa admin boleh dilantik.
- Ketua kumpulan hanya boleh melihat/mengurus ahli kumpulannya mengikut polisi database.
- Pengumuman untuk semua ahli atau kumpulan tertentu.
- Material disimpan sebagai pautan URL (contohnya PDF Google Drive). Upload fail terus ke Supabase Storage belum disambungkan dalam versi ini.
- Reka bentuk responsif untuk telefon, tablet dan komputer.
- Row Level Security (RLS) dan trigger untuk menghalang pengguna biasa menaik taraf diri sendiri menjadi admin.

## Keperluan

- Node.js versi LTS (https://nodejs.org/)
- VS Code (https://code.visualstudio.com/)
- Akaun Supabase (https://supabase.com/)
- Akaun GitHub dan Vercel untuk penerbitan online (pilihan tetapi disyorkan)

## A. Jalankan projek di VS Code

1. Extract ZIP ini ke folder yang mudah dicari.
2. Buka folder `KRM-Buddy-Portal` dalam VS Code.
3. Buka **Terminal → New Terminal**.
4. Jalankan:

   ```bash
   npm install
   ```

5. Salin `.env.example` menjadi `.env` di root folder.
6. Biarkan tab terminal terbuka; selepas sambungan Supabase disiapkan, jalankan:

   ```bash
   npm run dev
   ```

7. Buka URL yang dipaparkan (kebiasaannya `http://localhost:5173`).

## B. Sediakan database online di Supabase

1. Log masuk ke https://supabase.com/dashboard dan cipta projek baharu. Simpan kata laluan database di tempat selamat.
2. Dalam projek Supabase, buka **SQL Editor → New query**.
3. Buka fail `supabase/schema.sql` dalam VS Code, salin seluruh kandungannya dan tampal ke SQL Editor. Tekan **Run**. Skrip mencipta jadual, trigger, RLS policies dan tiga kumpulan contoh.
4. Pergi ke **Project Settings → API** (atau bahagian Connect yang sepadan dalam dashboard semasa). Salin **Project URL** dan **publishable/anon key**.
5. Buka fail `.env` dan masukkan nilai sebenar:

   ```dotenv
   VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

6. Simpan `.env`, hentikan dan jalankan semula `npm run dev` jika server sedang berjalan.
7. Di Supabase, buka **Authentication → URL Configuration** dan tetapkan Site URL untuk development kepada `http://localhost:5173`. Tambah URL production selepas deploy. Jika e-mel pengesahan diaktifkan, ahli perlu mengesahkan e-mel mereka sebelum boleh log masuk. Konfigurasikan SMTP untuk penggunaan sebenar; perkhidmatan e-mel lalai mungkin terhad.

> Penting: jangan letakkan `service_role` key dalam `.env` frontend, GitHub atau mana-mana fail yang menggunakan awalan `VITE_`. Frontend hanya menggunakan publishable/anon key dengan RLS diaktifkan.

## C. Cipta admin pertama (bootstrap)

Pendaftaran awam **tidak** memberikan akses admin. Untuk melantik admin pertama:

1. Buka portal dan daftar akaun menggunakan e-mel kamu sendiri.
2. Sahkan e-mel jika diminta, kemudian cuba log masuk sekali supaya profil diwujudkan.
3. Buka **Supabase → SQL Editor → New query** dan jalankan query ini, menggantikan e-mel contoh dengan e-mel akaun kamu:

   ```sql
   update public.profiles
   set role = 'admin'
   where lower(email) = lower('e-mel-admin-kamu@contoh.com');
   ```

4. Log keluar dan log masuk semula untuk memuat semula peranan admin.
5. Admin boleh membuka **Pengurusan Ahli → Urus akses** untuk melantik admin tambahan atau ketua kumpulan.

Untuk ketua kumpulan, pilih `Ketua Kumpulan` dan tetapkan kumpulan. Admin boleh mengurus semua kumpulan. Jangan lantik admin kepada orang yang tidak dipercayai kerana admin mempunyai akses penuh.

Jika username bertembung semasa pendaftaran, trigger akan menggunakan username sandaran `ahli_<id>`; minta ahli tersebut menggunakan username yang unik jika perlu. Supabase Auth log masuk menggunakan e-mel dan kata laluan; username disimpan sebagai identiti profil.

## D. Terbitkan website online

1. Cipta repository GitHub dan push projek ini ke repository tersebut. Jangan push fail `.env`.
2. Buka https://vercel.com dan import repository itu.
3. Framework preset biasanya dikesan sebagai **Vite**. Build command: `npm run build`; output directory: `dist`.
4. Dalam Vercel → Project Settings → Environment Variables, tambah:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. Salin URL production yang Vercel berikan.
6. Kembali ke Supabase → Authentication → URL Configuration:
   - Set **Site URL** kepada URL production Vercel.
   - Tambah URL production dan URL preview yang digunakan ke senarai **Redirect URLs** jika diperlukan.
7. Redeploy selepas mengubah environment variables.

Kini semua ahli boleh membuka URL website yang sama dari telefon, tablet atau komputer. Database dikongsi melalui Supabase.

## E. Nota keselamatan dan batasan versi awal

- Data ahli ialah data peribadi. Kutip hanya maklumat yang diperlukan, hadkan akses, dan dapatkan persetujuan organisasi sebelum menggunakannya.
- RLS mesti kekal diaktifkan. Jangan buang polisi atau kongsi service-role key.
- Semak peranan dan tugasan kumpulan admin secara berkala.
- Material dalam versi ini menggunakan pautan, bukan upload fail terus. Untuk upload PDF secara terus, cipta Supabase Storage bucket private dan polisi storage yang sepadan sebelum menambah UI upload.
- Versi ini ialah asas aplikasi untuk dikonfigurasi dan diuji. Sebelum digunakan dengan data sebenar, uji sekurang-kurangnya: daftar ahli, pengesahan e-mel, akses admin, akses ketua kumpulan, sekatan silang kumpulan, pengumuman, material, dan rekod kehadiran.
- Supabase free tier dan Vercel free tier mempunyai had penggunaan dan terma masing-masing; semak had semasa untuk keperluan kelab.

## Struktur folder

```text
KRM-Buddy-Portal/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   └── supabase.js
├── supabase/
│   └── schema.sql
├── .env.example
├── .gitignore
├── index.html
├── package.json
└── README.md
```
