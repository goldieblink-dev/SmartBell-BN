# Smartbell-BN

Smartbell-BN is a web-based automated bell system designed for schools, featuring bell scheduling, real-time next bell detection, and a monitoring dashboard. The system is built to be scalable, maintainable, and production-ready for deployment on VPS.

## Key Features

- Automatic Bell Scheduling
Manage daily/weekly bell schedules automatically, supporting various school timing schemes.

- Next Bell Detection
The dashboard displays the next bell in real-time, allowing admins/users to see upcoming bell times.

- Anti Double-Trigger Scheduler
Special algorithm prevents bells from ringing more than once at the same time, minimizing bugs.

- Monitoring Dashboard
-- View today’s bell schedule
-- Bell status (active/inactive)
-- Bell activity logs for auditing

- Multi-User Management
Admins can add/remove users and assign access permissions.

- API & Webhook Integration (Optional)
Ready to integrate with other systems like SMS gateways or IoT devices.

## Technology Stack

- Backend: Laravel 10 (PHP 8.2)
- Frontend: React.js
- Database: MySQL / PostgreSQL
- Queue & Jobs: Laravel Queue (Redis/RabbitMQ optional)
- Deployment: VPS (Ubuntu/Debian) + Nginx + Supervisor
- Security: HTTPS, CSRF protection, password hashing (bcrypt/argon2)

# Installation & Deployment

## Clone Repository
```bash
git clone https://github.com/goldieblink-dev/Smartbell-BN.git
cd Smartbell-BN
```
## Install Dependencies
```bash
composer install
npm install
```
## Environment Setup

- Copy .env.example → .env
- Configure database, queue, and URL according to VPS

## Migrate Database
```bash
php artisan migrate --seed
```
## Compile Frontend
```bash
npm run build
```
## Run Queue & Scheduler
```bash
php artisan queue:work
php artisan schedule:work
```
## Production Deployment

- Use Nginx + PHP-FPM
- Setup HTTPS (Let's Encrypt)
- Use Supervisor for queue & scheduler

Project Structure
``` bash
Smartbell-BN/
├─ app/          # Laravel backend
├─ database/     # Migrations & seeders
├─ public/       # Frontend build
├─ resources/    # Blade templates, React assets
├─ routes/       # API & Web routes
├─ scheduler/    # Cron jobs / Bell scheduler logic
└─ README.md
```
## Risks & Mitigation

- Double-trigger bell: Implemented anti double-trigger with locking mechanism
- VPS downtime: Setup monitoring & alert system
- Security vulnerabilities: Mandatory HTTPS, input validation, rate limiting, CSRF protection
- Scalability bottleneck: Queue & job system for heavy-load scheduling

## Contribution

- Contributions are welcome via pull requests. Please ensure:

-- Laravel & React coding standards are followed
-- Feature branches are created
-- Pull requests clearly explain changes
