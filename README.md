# ⚡ WIFI-SENTINEL v2.0

> **Futuristic Cyberpunk Wi-Fi Password Extractor, Tactical Radar & Telemetry Analyzer**  
> Engineered with **React 18 + Vite**, animated with **GSAP & Framer Motion**, and powered by the Windows Native `netsh` Subsystem engine.

---

<div align="center">

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.11-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15.0-88CE02?style=for-the-badge&logo=greensock&logoColor=white)](https://greensock.com/gsap/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.2.0-EA4C89?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?style=for-the-badge&logo=windows&logoColor=white)](https://microsoft.com/windows)
[![License](https://img.shields.io/badge/License-MIT-00FFA3?style=for-the-badge)](LICENSE)

</div>

---

## 🌟 Overview

**Wifi Sentinel** is a local wireless network audit and telemetry analysis tool designed with a futuristic **Cyberpunk Tactical HUD** aesthetic. It allows users and network administrators to effortlessly recover stored Wi-Fi credentials in cleartext, monitor active wireless interface metrics in real time, scan nearby access points via a tactical radar, generate instant QR codes for mobile device onboarding, and export comprehensive audit reports.

The entire interface is enriched with **GSAP** timeline boot sequences and **Framer Motion** physics-based layout transitions and micro-interactions.

---

## 🚀 Key Features

- 🔑 **Credential Vault (Cleartext Key Revealer)**
  - Automatically indexes all saved wireless profiles stored on your Windows system.
  - One-click cleartext password extraction without navigating cumbersome Windows GUI menus.
  - Real-time search filter and security categorization (`WPA3`, `WPA2`, `WEP`, `OPEN`).
  - Animated table row re-ordering and layout transitions powered by **Framer Motion**.
  - Batch reveal/hide options and instant clipboard copy.

- 📡 **Active Uplink Telemetry HUD**
  - Real-time active Wi-Fi interface monitoring (SSID, BSSID, Channel, 2.4 GHz / 5 GHz Band).
  - Accurate signal strength diagnostics (RSSI dBm & percentage indicator).
  - Spring-animated Rx / Tx link speed gauges (Mbps), radio type (`802.11ax/ac/n`), cipher suite, and authentication mode.

- 🎯 **Tactical Radar (Nearby Access Point Scanner & Omni-Discovery)**
  - **Live Airwaves Mode**: Scans direct physical radio broadcasts in the immediate room.
  - **Live Omni-Discovery Mode**: Maps surrounding RF beacons and spectrum channels (2.4 GHz & 5 GHz) with glowing magenta radar blips.
  - **Hybrid Mode**: Displays real-time airwaves alongside all saved vault profiles on the outer perimeter.
  - Dynamic radar tooltips with smart boundary detection.

- 📱 **Instant Mobile QR Code Onboarding**
  - Generates standard IEEE Wi-Fi QR codes (`WIFI:S:...;T:...;P:...;;`) on the fly.
  - Scan directly using iOS or Android camera apps to connect instantly without typing complex passwords.
  - Smooth spring modal dialog popup with `AnimatePresence`.

- 💾 **Multi-Format Export & Audit Reporting**
  - Export your entire saved credential vault into **JSON**, **CSV**, or **Plain Text (TXT)**.
  - Formatted print-ready layout for physical documentation and network archival.

- 🎬 **Dynamic GSAP & Framer Motion Animation Engine**
  - **GSAP Boot Sequence**: Staggered HUD entrance timelines, card reveal choreography, and glowing grid initializers.
  - **Framer Motion**: Spring physics on buttons, live toast notifications, modal popups, and animated speed gauges.

- 🔊 **Synthesized Cyberpunk Audio FX**
  - Interactive tactical audio feedback powered by native *Web Audio API* synthesis (zero external audio asset overhead).

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology / Implementation |
|---|---|
| **Frontend Framework** | React 18 (Functional components, custom Hooks) |
| **Animation Engines** | GSAP 3 (HUD Timelines) + Framer Motion (Spring UI & Layouts) |
| **Bundler & Dev Server** | Vite 5 (Lightning-fast HMR) |
| **Design System** | Custom Cyberpunk Glassmorphism & Neon HUD (Pure CSS) |
| **Icons** | Lucide React |
| **System Interface** | Native Node.js `child_process` + Windows `netsh wlan` (UTF-8) |
| **Audio Engine** | Web Audio API Oscillator Synthesizer |
| **QR Engine** | Canvas-based IEEE Wi-Fi string encoder |

---

## 📋 System Requirements

- **Operating System**: Windows 10 or Windows 11 (requires native WLAN service).
- **Node.js**: Version `16.0.0` or newer. ([Download Node.js](https://nodejs.org/))
- **Hardware**: Active Wi-Fi network interface card / adapter.

---

## ⚡ Quick Start Guide

### Option 1: Quick Launcher (Windows)
Double-click the included batch script in the root directory:
```bat
start.bat
```

---

### Option 2: Command Line Interface (CLI)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ravano-2464/Wifi-Sentinel.git
   cd Wifi-Sentinel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the HUD:**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🔌 API Reference (Vite Middleware & Local Server)

The internal engine exposes local REST endpoints to interface with the Windows WLAN subsystem:

| Endpoint | Method | Description |
|---|---|---|
| `/api/wifi/current` | `GET` | Fetches active interface status, signal metrics, and uplink telemetry |
| `/api/wifi/profiles` | `GET` | Retrieves all saved user profiles along with cleartext credentials |
| `/api/wifi/scan` | `GET` | Scans for all nearby wireless access points (BSSID scan) |
| `/api/wifi/full-audit` | `GET` | Returns consolidated telemetry, profiles, and nearby scan payload |

---

## 🔒 Security & Legal Disclaimer

> **Important Notice:**  
> This application is created solely for personal credential recovery, network administration, and educational security auditing. It strictly accesses Wi-Fi profiles that have already been authorized, authenticated, and saved on the local Windows machine through official operating system APIs (`netsh`).

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.
