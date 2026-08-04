# 🎋 ZenDompi (禅どんぴ) 
> *AI-Powered, Seamless Wealth Management*

ZenDompi adalah aplikasi pencatat keuangan dan manajemen aset (multi-wallet) yang mengintegrasikan kepraktisan **Chatbot (WhatsApp/Telegram)** dengan kecerdasan **LLM (Large Language Models)**. 

Filosofi nama **ZenDompi** (Ketenangan Dompet) membawa misi bahwa mengelola keuangan dari berbagai sumber (Bank, E-Wallet, Uang Tunai) tidak seharusnya memicu stres. Cukup kirim pesan, dan biarkan AI yang mencatatnya untuk Anda.

## ✨ Fitur Unggulan

- 🤖 **NLP Chat-to-Transaction:** Catat pengeluaran, pemasukan, dan transfer antar-rekening hanya dengan chat kasual via WhatsApp/Telegram.
- 🏦 **Multi-Wallet Architecture:** Lacak saldo secara akurat di berbagai jenis penyimpanan uang (Cash, Bank, E-Wallet) dengan sistem transaksi ACID.
- 📱 **Cross-Platform:** Dapat diakses melalui Web Dashboard, Aplikasi Mobile (iOS/Android), dan Desktop.
- ⚡ **Real-Time Sync:** Eksekusi webhook secepat kilat menggunakan *Serverless Functions*.

## 🛠️ Tech Stack (Teknologi yang Digunakan)

Proyek ini dibangun menggunakan arsitektur **Monorepo** untuk efisiensi berbagi kode antar platform.

*   **Monorepo Manager:** [Turborepo](https://turbo.build/) + pnpm
*   **Web Frontend:** [Next.js](https://nextjs.org/) (React) + Tailwind CSS
*   **Mobile App:** [React Native](https://reactnative.dev/) (Expo) *(Work in Progress)*
*   **Database:** PostgreSQL + [Prisma ORM](https://www.prisma.io/)
*   **Bot Webhooks:** Vercel Serverless Functions
*   **AI Engine:** Google Gemini API / OpenAI API (untuk ekstraksi entitas JSON)
*   **Deployment:** Vercel

## 📂 Struktur Monorepo

```text
zendompi-monorepo/
├── apps/
│   ├── web/               # Next.js web application (Dashboard)
│   ├── mobile/            # React Native app via Expo
│   └── webhook-bot/       # API Routes untuk menerima payload WA & Telegram
│
├── packages/
│   ├── database/          # Skema Prisma, migrasi, dan export PrismaClient
│   ├── ui/                # Komponen React (Design System) yang dipakai bersama
│   ├── typescript-config/ # Konfigurasi base tsconfig.json
│   └── eslint-config/     # Konfigurasi linter global
│
└── turbo.json             # Konfigurasi pipeline Turborepo