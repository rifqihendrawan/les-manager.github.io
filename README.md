# 📚 Les Manager — Aplikasi Manajemen Pertemuan Siswa Les

Aplikasi web fullstack untuk mengelola pertemuan siswa les selama 8 pertemuan. Setiap pertemuan dapat dicentang dengan otomatis mencatat tanggal penyelesaian.

---

## 🚀 Fitur Utama

- **User Login & Register** — Setiap guru/tutor punya akun sendiri dengan data siswa terpisah
- **Manajemen Siswa** — Tambah, edit, hapus siswa beserta mata pelajaran
- **Tracking Pertemuan** — Centang pertemuan 1–8, otomatis mencatat tanggal
- **Progress Bar** — Visualisasi progres setiap siswa
- **Dashboard Grafik** — Bar chart, pie chart, dan ringkasan statistik
- **Filter & Cari** — Filter siswa berdasarkan nama atau mata pelajaran
- **Responsive** — Bisa diakses dari HP maupun desktop

---

## 🛠️ Teknologi

| Layer | Teknologi |
|-------|-----------|
| Frontend | React.js 18 + React Router v6 + Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Token) + bcryptjs |
| Styling | CSS Custom (tanpa framework) |

---

## ⚙️ Setup & Instalasi

### 1. Clone atau ekstrak project

```bash
cd les-manager
```

### 2. Setup MongoDB Atlas

1. Buka [https://cloud.mongodb.com](https://cloud.mongodb.com)
2. Buat akun / login
3. Buat **New Project** → **Build a Database** → pilih **Free (M0)**
4. Pilih region terdekat → **Create**
5. Set username & password untuk database user
6. Di **Network Access**, tambahkan IP `0.0.0.0/0` (allow all) untuk development
7. Klik **Connect** → **Compass** atau **Drivers** → copy connection string

### 3. Konfigurasi Backend

```bash
cd backend
cp .env.example .env
```

Edit file `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/lesmanager?retryWrites=true&w=majority
JWT_SECRET=rahasia_jwt_anda_yang_panjang_dan_aman
JWT_EXPIRE=7d
```

Ganti `USERNAME`, `PASSWORD`, dan bagian `cluster0.xxxxx` dengan milik Anda.

### 4. Install Dependencies

```bash
# Di folder root les-manager
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 5. Jalankan Aplikasi

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Atau jalankan keduanya sekaligus dari root:
```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 📁 Struktur Folder

```
les-manager/
├── backend/
│   ├── models/
│   │   ├── User.js         # Model user (tutor/guru)
│   │   └── Student.js      # Model siswa + pertemuan
│   ├── routes/
│   │   ├── auth.js         # Login, register, me
│   │   ├── students.js     # CRUD siswa + toggle pertemuan
│   │   └── dashboard.js    # Statistik & grafik
│   ├── middleware/
│   │   └── auth.js         # JWT middleware
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js   # State management auth
│       ├── hooks/
│       │   └── useAPI.js        # Axios API helpers
│       ├── components/
│       │   ├── Layout.js        # Sidebar + topbar
│       │   └── Layout.css
│       ├── pages/
│       │   ├── Login.js         # Halaman login
│       │   ├── Register.js      # Halaman registrasi
│       │   ├── Dashboard.js     # Dashboard + grafik
│       │   ├── Students.js      # Manajemen siswa
│       │   └── *.css
│       ├── App.js
│       ├── App.css
│       └── index.js
│
└── package.json
```

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/auth/register` | Daftar akun baru |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Info user (butuh token) |

### Siswa (semua butuh Bearer token)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/students` | Daftar semua siswa |
| POST | `/api/students` | Tambah siswa baru |
| PUT | `/api/students/:id` | Edit data siswa |
| DELETE | `/api/students/:id` | Hapus siswa |
| PATCH | `/api/students/:id/pertemuan/:nomor` | Toggle pertemuan selesai |

### Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/dashboard` | Statistik & data grafik |

---

## 🔐 Keamanan

- Password di-hash dengan **bcryptjs** (salt rounds: 12)
- Autentikasi via **JWT** dengan expiry 7 hari
- Setiap user hanya bisa akses data siswa miliknya sendiri
- CORS dikonfigurasi hanya untuk localhost:3000

---

## 📦 Deploy (Opsional)

### Backend → Railway / Render
1. Push ke GitHub
2. Connect ke Railway/Render
3. Set environment variables (MONGODB_URI, JWT_SECRET)

### Frontend → Vercel / Netlify
1. Ubah `proxy` di `frontend/package.json` menjadi URL backend production
2. Deploy ke Vercel/Netlify

---

## 🐛 Troubleshooting

**MongoDB tidak connect?**
- Pastikan IP Anda di-whitelist di MongoDB Atlas Network Access
- Periksa kembali connection string di `.env`

**Port sudah dipakai?**
- Backend: ubah `PORT` di `.env`
- Frontend: jalankan `PORT=3001 npm start`

**CORS error?**
- Pastikan backend berjalan di port 5000
- Pastikan `proxy` di `frontend/package.json` adalah `http://localhost:5000`
