Smartbell-BN

Smartbell-BN adalah sistem bell otomatis berbasis web yang dirancang untuk sekolah, dengan fitur penjadwalan bell, deteksi bell berikutnya secara real-time, dan dashboard monitoring. Sistem ini dibuat agar scalable, maintainable, dan production-ready untuk deployment di VPS.

Fitur Utama

- Penjadwalan Bell Otomatis
Mengatur jadwal bell harian/mingguan secara otomatis, mendukung berbagai skema sekolah.

- Next Bell Detection
Dashboard menampilkan bell berikutnya secara real-time, sehingga admin/pengguna bisa melihat waktu bell berikutnya.

- Scheduler Anti Double-Trigger
Algoritma khusus mencegah bell berbunyi lebih dari sekali pada satu waktu, meminimalkan bug.

- Dashboard Monitoring

Tampilkan jadwal hari ini
Status bell (aktif/tidak aktif)
Log aktivitas bell untuk audit

- Multi-user Management
Admin bisa menambah/menghapus user, dan mengatur hak akses.

- Integrasi API dan Webhook (opsional)
Siap diintegrasikan dengan sistem lain seperti SMS gateway atau IoT device.

Teknologi

- Backend: Laravel 10 (PHP 8.2)
- Frontend: React.js
- Database: MySQL / PostgreSQL
- Queue & Jobs: Laravel Queue (Redis/RabbitMQ optional)
- Deployment: VPS (Ubuntu/Debian) + Nginx + Supervisor
- Security: HTTPS, CSRF protection, password hashing (bcrypt/argon2)

Instalasi & Deployment

Clone Repository
```bash
git clone https://github.com/goldieblink-dev/Smartbell-BN.git
cd Smartbell-BN
```
Install Dependencies
```bash
composer install
npm install
```
Environment Setup
Copy .env.example → .env
Atur database, queue, dan URL sesuai VPS

Migrate Database
```bash
php artisan migrate --seed
```
Compile Frontend
```bash
npm run build
```
Jalankan Queue & Scheduler
```bash
php artisan queue:work
php artisan schedule:work
```
Deployment Production

- Gunakan Nginx + PHP-FPM
- Setup HTTPS (Let's Encrypt)
- Gunakan Supervisor untuk queue & scheduler

Struktur Project
```bash
Smartbell-BN/
├─ app/          # Backend Laravel
├─ database/     # Migration & seeders
├─ public/       # Frontend build
├─ resources/    # Blade templates, React assets
├─ routes/       # API & Web routes
├─ scheduler/    # Cron jobs / Bell scheduler logic
└─ README.md
```
Risiko & Mitigasi

- Double-trigger bell → Implementasi anti double-trigger dengan locking mechanism
- Downtime VPS → Setup monitoring + alert system
- Security vulnerabilities → HTTPS mandatory, input validation, rate limiting, CSRF protection
- Scalability bottleneck → Queue + job system untuk penjadwalan heavy load

Kontribusi

- Contributions welcome via pull request. Pastikan:
- Coding standard Laravel & React dipatuhi
- Feature branch dibuat
- Pull request dijelaskan detail perubahan
