# OpenMusic API V3

Backend API untuk aplikasi OpenMusic dengan fitur lengkap seperti manajemen album, lagu, playlist, kolaborasi, ekspor playlist, upload cover album, like album, dan caching.

## Features

- ✅ Manajemen Album & Songs
- ✅ User Authentication & Authorization (JWT)
- ✅ Playlist Management
- ✅ Collaboration System
- ✅ Export Playlist via Email (RabbitMQ)
- ✅ Upload Album Cover (Local Storage)
- ✅ Like/Unlike Album
- ✅ Server-Side Caching (Redis)

## Tech Stack

- **Framework**: Hapi.js
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Message Queue**: RabbitMQ
- **Cache**: Redis
- **File Storage**: Local File System

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Redis
- RabbitMQ

## Required Libraries

Project ini menggunakan beberapa library utama untuk mendukung autentikasi, database, message broker, caching, dan kebutuhan development.

### Dependencies (Production)

Install otomatis:
```bash
npm install
```

Atau install manual:
```bash
npm install @hapi/hapi @hapi/inert @hapi/jwt \
amqplib auto-bind bcrypt dotenv joi nanoid pg redis
```

Detail penggunaan:
- @hapi/hapi — Framework backend utama
- @hapi/inert — Static file handling (upload cover album)
- @hapi/jwt — Authentication & authorization (JWT)
- amqplib — Message broker RabbitMQ (export playlist)
- bcrypt — Hashing password
- dotenv — Environment variable loader
= joi — Validasi request payload
- nanoid — Generate unique ID
- pg — PostgreSQL client
- redis — Server-side caching

## Dev Dependencies (Development)
```bash
npm install -D eslint @eslint/js nodemon node-pg-migrate @types/bcrypt
```

Fungsi:
- eslint, @eslint/js — Linting & code quality
- nodemon — Auto-restart server saat development
- node-pg-migrate — Database migration tool
- @types/bcrypt — Type definition untuk IDE support

## Installation

1. Clone repository
```bash
git clone <repository-url>
cd openmusic-api-v3
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. Run migrations
```bash
npm run migrate up
```

5. Start server
```bash
npm run start-dev
```

## Environment Variables
```env
# Server
HOST=localhost
PORT=5000

# Database
PGUSER=postgres
PGPASSWORD=your-password
PGDATABASE=openmusic
PGHOST=localhost
PGPORT=5432

# JWT
ACCESS_TOKEN_KEY=your-secret-key
REFRESH_TOKEN_KEY=your-refresh-key
ACCESS_TOKEN_AGE=1800

# RabbitMQ
RABBITMQ_SERVER=amqp://localhost

# Redis
REDIS_SERVER=localhost
```

## API Endpoints

### Albums
- `POST /albums` - Create album
- `GET /albums/{id}` - Get album by ID
- `PUT /albums/{id}` - Update album
- `DELETE /albums/{id}` - Delete album
- `POST /albums/{id}/covers` - Upload album cover
- `POST /albums/{id}/likes` - Like album
- `DELETE /albums/{id}/likes` - Unlike album
- `GET /albums/{id}/likes` - Get album likes count

### Songs
- `POST /songs` - Create song
- `GET /songs` - Get all songs
- `GET /songs/{id}` - Get song by ID
- `PUT /songs/{id}` - Update song
- `DELETE /songs/{id}` - Delete song

### Users
- `POST /users` - Register user

### Authentications
- `POST /authentications` - Login
- `PUT /authentications` - Refresh token
- `DELETE /authentications` - Logout

### Playlists
- `POST /playlists` - Create playlist
- `GET /playlists` - Get user playlists
- `DELETE /playlists/{id}` - Delete playlist
- `POST /playlists/{id}/songs` - Add song to playlist
- `GET /playlists/{id}/songs` - Get playlist songs
- `DELETE /playlists/{id}/songs` - Remove song from playlist
- `GET /playlists/{id}/activities` - Get playlist activities

### Collaborations
- `POST /collaborations` - Add collaborator
- `DELETE /collaborations` - Remove collaborator

### Exports
- `POST /export/playlists/{playlistId}` - Export playlist to email

## Testing

Import Postman collection dan environment yang disediakan, kemudian jalankan collection runner.