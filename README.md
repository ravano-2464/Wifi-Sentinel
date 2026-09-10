# ⚡ WIFI-SENTINEL v2.0

> **Futuristic Cyberpunk Wi-Fi Password Extractor, Tactical Radar & Telemetry Analyzer**  
> Built with **React 18 + Vite** powered by Windows Native `netsh` Subsystem engine.

---

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Windows](https://img.shields.io/badge/Platform-Windows%2010%2F11-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://microsoft.com/windows)
[![License](https://img.shields.io/badge/License-MIT-00FFA3?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Overview

**Wifi Sentinel** adalah aplikasi audit dan manajemen jaringan Wi-Fi lokal dengan antarmuka futuristik bertema **Cyberpunk HUD**. Aplikasi ini memungkinkan Anda melihat seluruh riwayat password Wi-Fi yang tersimpan di sistem Windows secara *cleartext*, memantau telemetri koneksi aktif (*real-time uplink*), memindai jaringan di sekitar (*tactical radar*), membuat kode QR untuk koneksi instan ke smartphone, serta mengekspor laporan audit jaringan.

---

## 🚀 Fitur Utama

- 🔑 **Credential Vault (Cleartext Password Revealer)**
  - Menampilkan seluruh profil Wi-Fi yang pernah terhubung pada perangkat Windows Anda.
  - Membuka password Wi-Fi asli (*cleartext key*) dengan satu klik tanpa batasan GUI Windows.
  - Fitur pencarian instan dan filter keamanan (WPA3, WPA2, Open / No Password).

- 📡 **Active Uplink Telemetry HUD**
  - Pemantauan status interface Wi-Fi secara *real-time* (SSID aktif, BSSID, Channel, Band 2.4 GHz / 5 GHz).
  - Indikator kuat sinyal (dBm / Signal %), kecepatan transmisi & penerimaan (Rx/Tx Mbps).
  - Tipe cipher & enkripsi keamanan aktif.

- 🎯 **Tactical Radar (Nearby Wi-Fi Scanner)**
  - Memindai seluruh *Access Point* (AP) di sekitar dalam jangkauan radar.
  - Deteksi otomatis jaringan yang sudah tersimpan vs jaringan baru / terbuka.
  - Visualisasi spektrum sinyal & keamanan.

- 📱 **Instant Wi-Fi QR Code Generator**
  - Membuat QR Code Wi-Fi standard IEEE (`WIFI:S:...;T:...;P:...;;`) secara otomatis.
  - Scan langsung menggunakan kamera smartphone (iOS / Android) tanpa perlu mengetik password manual.

- 💾 **Multi-Format Export & Audit Reporting**
  - Ekspor seluruh database password yang tersimpan ke format **JSON**, **CSV**, atau **Plain Text / TXT**.
  - Siap dicetak (*Print Report*) untuk dokumentasi administrasi jaringan.

- 🔊 **Synthesized Cyberpunk Audio FX**
  - Efek suara taktis interaktif bertenaga *Web Audio API* sintetis bawaan (tanpa file audio eksternal).

---

## 🛠️ Tech Stack

| Komponen | Teknologi / Library |
|---|---|
| **Frontend Framework** | React 18 (Hooks, Modern Functional Components) |
| **Build Tool & Dev Server** | Vite 5 (Ultra-fast HMR) |
| **Styling & Theme** | Modern Glassmorphism & Cyberpunk Neon CSS |
| **Icons** | Lucide React |
| **Backend Integration** | Native Node.js `child_process` + Windows `netsh wlan` (UTF-8) |
| **Audio Engine** | Native Web Audio API Synthesizer |

---

## 📋 Prasyarat Sistem

1. **Sistem Operasi**: Windows 10 atau Windows 11 (memerlukan subsystem WLAN).
2. **Node.js**: Versi 16.0.0 atau yang lebih baru. ([Unduh Node.js](https://nodejs.org/))
3. **Wi-Fi Card / Adapter**: Interface Wi-Fi aktif.

---

## ⚡ Panduan Instalasi & Menjalankan

### Cara 1: Menggunakan Script Cepat (Windows)
Cukup klik ganda (double-click) file:
```bat
start.bat
```

---

### Cara 2: Melalui Terminal / Command Prompt

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/ravano-2464/Wifi-Sentinel.git
   cd Wifi-Sentinel
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan aplikasi (Development Server):**
   ```bash
   npm run dev
   ```

4. Buka browser pada alamat:
   ```
   http://localhost:3000
   ```

---

## 🔌 API Endpoints (Vite Middleware & Standalone Server)

Server menyediakan REST API lokal untuk mengakses telemetri WLAN Windows:

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/wifi/current` | `GET` | Mengambil status interface & telemetri Wi-Fi yang sedang aktif |
| `/api/wifi/profiles` | `GET` | Mengambil seluruh daftar profil & password tersimpan |
| `/api/wifi/scan` | `GET` | Memindai jaringan Wi-Fi di sekitar (BSSID scan) |
| `/api/wifi/full-audit` | `GET` | Mengambil data gabungan lengkap untuk audit |

---

## 🔒 Keamanan & Penafian (Disclaimer)

> **Pemberitahuan Penting:**  
> Aplikasi ini dirancang untuk tujuan diagnosis jaringan, pemulihan kredensial milik sendiri (*credential recovery*), dan edukasi administrasi sistem. Aplikasi ini hanya membaca profil Wi-Fi yang sudah pernah terhubung dan tersimpan pada sistem operasi komputer Anda secara legal melalui utilitas resmi sistem operasi Windows (`netsh`).

---

## 📄 Lisensi

Didistribusikan di bawah lisensi **MIT License**. Lihat file `LICENSE` untuk informasi lebih lanjut.
