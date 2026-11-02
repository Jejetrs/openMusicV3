# OpenMusic Queue Consumer

Consumer service untuk memproses export playlist dan mengirimkan hasil via email.

## Features

- ✅ Consume messages dari RabbitMQ
- ✅ Generate JSON dari playlist data
- ✅ Send email dengan attachment

## Required Libraries

Service ini menggunakan RabbitMQ untuk message queue, PostgreSQL untuk data playlist, dan SMTP untuk pengiriman email.

### Dependencies (Production)

Install otomatis:
```bash
npm install
```

Atau install manual:
```bash
npm install amqplib dotenv nodemailer pg
```

Detail penggunaan:
- amqplib — RabbitMQ client untuk consume message export playlist
- dotenv — Load environment variables
- nodemailer — Kirim email + attachment (hasil export playlist)

pg — PostgreSQL client untuk mengambil data playlist

## Dev Dependencies (Development)
```bash
npm install -D eslint nodemon
```

Fungsi:
- eslint — Menjaga kualitas dan konsistensi kode
- nodemon — Auto-restart consumer saat development

## Installation

1. Install dependencies
```bash
cd openmusic-queue-consumer
npm install
```

2. Setup environment
```bash
cp .env.example .env
# Edit dengan kredensial SMTP Anda
```

3. Start consumer
```bash
npm run start-dev
```

## Environment Variables
```env
# RabbitMQ
RABBITMQ_SERVER=amqp://localhost

# SMTP (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your-password
PGDATABASE=openmusic
```

## Gmail App Password

Untuk menggunakan Gmail sebagai SMTP, Anda perlu membuat App Password:

1. Buka Google Account Settings
2. Security → 2-Step Verification
3. App passwords → Generate
4. Copy password ke `SMTP_PASSWORD`