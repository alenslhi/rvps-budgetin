# BudgetIn

BudgetIn adalah aplikasi manajemen keuangan pribadi berbasis web yang membantu pengguna melacak pengeluaran melalui sistem "Kapsul" (Kategori Utama) dan "Sekat" (Sub-kategori). Aplikasi ini dirancang agar ringan, intuitif, dan responsif, serta mendukung penganggaran berbasis periode bulanan.

## Fitur Utama

- Sistem Penganggaran Berlapis: Atur keuangan Anda dengan membaginya ke dalam Kapsul Utama (contoh: Kebutuhan Pokok, Hiburan) dan Sekat Kebutuhan (contoh: Makan, Transportasi).
- Penganggaran Berbasis Periode: Kelola anggaran keuangan berdasarkan bulan dan tahun secara otomatis.
- Salin Anggaran (Carry Over): Salin seluruh struktur Kapsul dan Sekat beserta limit anggarannya dari bulan sebelumnya ke bulan berjalan hanya dengan satu klik.
- Pencatatan Transaksi: Catat setiap pengeluaran ke dalam Sekat yang sesuai dan pantau sisa limit secara real-time.
- Riwayat Keuangan: Lihat seluruh riwayat transaksi Anda menggunakan sistem filter bulan dan tahun.
- Autentikasi Aman: Pendaftaran dan login yang aman menggunakan enkripsi bcrypt dan NextAuth.js (dilengkapi fitur tombol lihat/sembunyikan password).
- Tampilan Responsif: Mendukung Mode Gelap (Dark Mode) dan tampilan yang optimal baik di desktop maupun perangkat mobile.

## Teknologi yang Digunakan

- Framework: Next.js 16 (App Router)
- Bahasa Pemrograman: TypeScript
- Database: MySQL
- ORM: Prisma Client
- Styling: Tailwind CSS v4
- Autentikasi: NextAuth.js v4
- Ikon: Lucide React

## Prasyarat Lingkungan Lokal

Pastikan sistem Anda telah terinstal:
- Node.js versi 18 atau lebih baru (direkomendasikan v20+)
- MySQL Server (berjalan lokal atau remote)
- Git

## Panduan Instalasi Lokal

1. Clone repositori proyek ini:
   git clone https://github.com/alenslhi/spendora.git
   cd spendora

2. Instal seluruh dependensi paket:
   npm install

3. Konfigurasi Environment Variables:
   Salin file .env.example menjadi .env:
   cp .env.example .env
   
   Isi file .env sesuai dengan kredensial database lokal Anda:
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   NEXTAUTH_SECRET="buat_string_rahasia_acak_disini"
   NEXTAUTH_URL="http://localhost:3000"

4. Jalankan sinkronisasi struktur database:
   npx prisma db push
   npx prisma generate

5. Jalankan server pengembangan lokal:
   npm run dev

6. Buka web browser Anda dan akses http://localhost:3000

## Panduan Deployment ke cPanel (Shared Hosting)

Aplikasi ini telah dimodifikasi dan dikonfigurasi khusus agar dapat di-deploy dan berjalan lancar di lingkungan cPanel yang menggunakan Phusion Passenger.

1. Persiapan Database:
   - Buat database MySQL baru melalui MySQL Databases di cPanel.
   - Konfigurasikan variabel DATABASE_URL di file .env cPanel.
   - Pastikan juga menyertakan variabel limitasi thread untuk mencegah crash Prisma:
     TOKIO_WORKER_THREADS=1
     UV_THREADPOOL_SIZE=1

2. Instalasi dan Build di Server:
   - Upload seluruh source code ke direktori cPanel Anda.
   - Buka Terminal cPanel, lalu aktifkan virtual environment Node.js.
   - Jalankan instalasi paket. Semua paket esensial (seperti tailwind, typescript) telah dipindahkan ke dependencies utama agar dapat terinstal di mode produksi:
     npm install
   - Jalankan perintah build:
     npx prisma generate
     npm run build
     (Catatan: File next.config.ts telah dikonfigurasi dengan limit "cpus: 1" untuk mencegah terminal crash karena limitasi proses shared hosting saat kompilasi).

3. Konfigurasi "Setup Node.js App":
   - Application Mode: Production
   - Application root: Direktori aplikasi Anda
   - Application startup file: server.js
   - Simpan pengaturan dan klik Restart.

## Struktur Direktori Utama

- /src/app: Berisi sistem routing halaman utama Next.js (Dashboard, Manage, History).
- /src/components: Berisi komponen UI React yang dapat digunakan ulang (Form, Sidebar, Filter).
- /src/lib: Berisi logika backend pendukung (Autentikasi, Database, Server Actions).
- /prisma: Berisi definisi skema database.

## Lisensi

Hak cipta dilindungi. Penggunaan dan distribusi kode ini diatur secara internal oleh pemilik repositori.
