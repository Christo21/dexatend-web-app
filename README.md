# DEXA-TEND Web App 🚀

Dashboard absensi karyawan berbasis web yang responsif, dirancang untuk monitoring real-time dan manajemen data karyawan yang efisien.

### 🛠️ Tech Stack
- **Library Utama:** React.js (Vite)
- **Styling:** Tailwind CSS
- **Real-time Engine:** Firebase Realtime Database
- **State Management:** React Hooks & Context API
- **Komunikasi Data:** Axios (REST API)

### ✨ Fitur Utama
- **Dashboard Multi-Role:** Tampilan berbeda untuk akses Admin (HRD) dan Karyawan.
- **Profile Management:** Menampilkan Nama, Email, Posisi, dan Foto Karyawan dan bisa melakukan update.
- **Attendance System:** Pencatatan Absen Masuk & Pulang dalam satu klik.
- **Real-time Notification:** Alert instan menggunakan Firebase saat ada pembaruan profil.
- **Adaptive Navigation:** Navigasi Sidebar untuk Desktop dan Bottom Bar untuk Mobile.
- **History Tracking:** Laporan riwayat absensi yang rapi dan mudah difilter.

### ⚙️ Setup Environment
Buat file `.env` di root folder:
```text
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_DATABASE_URL=your_database_url
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

🚀 Cara Menjalankan
- npm install
- npm run dev
