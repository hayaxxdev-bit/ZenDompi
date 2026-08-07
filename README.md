# 🎋 ZenDompi (禅どんぴ)
> **AI-Powered, Seamless Wealth Management**

ZenDompi adalah aplikasi pencatat keuangan dan manajemen aset (*multi-wallet*) modern yang mengintegrasikan kepraktisan **Chatbot (WhatsApp/Telegram)** dengan kecerdasan **LLM (Large Language Models)**. 

Filosofi nama **ZenDompi** (Ketenangan Dompet) membawa misi bahwa mengelola keuangan dari berbagai sumber tidak seharusnya memicu stres. Cukup kirim pesan teks atau suara secara kasual, dan biarkan AI yang mengurus ekstraksi, kategori, serta pencatatan aset Anda secara otomatis.

---

## 📌 Daftar Isi
1. [Fitur Utama](#-fitur-utama)
2. [Arsitektur Sistem](#-arsitektur-sistem)
3. [Teknologi & Tools](#-teknologi--tools)
4. [Struktur Monorepo](#-struktur-monorepo)
5. [Skema Database (Prisma)](#-skema-database-prisma)
6. [Alur Integrasi AI (LLM)](#-alur-integrasi-ai-llm)
7. [Panduan Instalasi Lokal](#-panduan-instalasi-lokal)
8. [Variabel Lingkungan (Environment Variables)](#-variabel-lingkungan-environment-variables)
9. [Panduan Deployment](#-panduan-deployment)
10. [Kontribusi & Lisensi](#-kontribusi--lisensi)

---

## ✨ Fitur Utama

*   🤖 **NLP Chat-to-Transaction:** Catat pengeluaran, pemasukan, dan transfer antar-rekening hanya dengan chat kasual (Contoh: *"Beli kopi di starbucks 45rb pakai bca"*).
*   🏦 **Multi-Wallet Architecture:** Lacak saldo secara akurat di berbagai jenis penyimpanan uang (Cash, Bank, E-Wallet) dengan sistem mutasi yang mendukung transaksi ACID.
*   📱 **Cross-Platform Experience:** Akses penuh melalui Web Dashboard interaktif, Aplikasi Mobile (iOS/Android), serta integrasi Bot Messenger.
*   ⚡ **Real-Time Webhook:** Pemrosesan pesan super cepat menggunakan *Edge/Serverless Functions* untuk meminimalkan *latency* respons bot.
*   📊 **Smart Analytics:** Visualisasi arus kas, alokasi anggaran, dan deteksi anomali pengeluaran bertenaga AI.

---

## 🏗️ Arsitektur Sistem

```text
[ User Chat ] ──> [ WhatsApp / Telegram Bot ]
                         │
                         ▼ (Webhook Payload)
            [ Vercel Serverless Functions ]
                         │
        ┌────────────────┴────────────────┐
        ▼ (Extract NLP Entity)            ▼ (Save Mutation)
  [ OpenAI / Gemini API ]          [ PostgreSQL Database ]
        │                                 ▲
        └─> [ JSON Structured Data ] ─────┘
                         │
                         ▼ (Sync Sync)
            [ Web & Mobile Dashboard ]
```

---

## 🛠️ Teknologi & Tools

Proyek ini dibangun menggunakan arsitektur **Monorepo** untuk efisiensi berbagi kode (*code-sharing*) yang maksimal antar platform.

*   **Monorepo Manager:** [Turborepo](https://turbo.build/) + `pnpm` (Workspace manajemen paket yang cepat dan hemat *disk space*).
*   **Web Frontend:** [Next.js](https://nextjs.org/) (React 19) + Tailwind CSS + Shadcn UI untuk dasbor admin.
*   **Mobile App:** [React Native](https://reactnative.dev/) dengan [Expo](https://expo.dev/) (Satu basis kode untuk Android & iOS).
*   **Database & ORM:** PostgreSQL sebagai *Single Source of Truth* + [Prisma ORM](https://www.prisma.io/).
*   **Bot Webhooks:** API Routes di Next.js / Serverless Functions yang dioptimalkan untuk performa tinggi.
*   **AI Engine:** Google Gemini API / OpenAI API Function Calling untuk ekstraksi teks mentah menjadi skema JSON terstruktur.
*   **Deployment:** Vercel (Web & Webhook) dan Expo Application Services (EAS) untuk distribusi aplikasi mobile.

---

## 📂 Struktur Monorepo

```text
zendompi-monorepo/
├── apps/
│   ├── web/               # Next.js web application (Dashboard Keuangan & Grafik)
│   ├── mobile/            # React Native app via Expo (Aplikasi Android/iOS)
│   └── webhook-bot/       # Endpoint API / Serverless untuk menangani payload WA & Telegram
│
├── packages/
│   ├── database/          # Skema Prisma, file migrasi, dan generator PrismaClient
│   ├── ui/                # Shared Design System & Komponen UI (Tailwind + Shadcn)
│   ├── typescript-config/ # Konfigurasi base TypeScript global (tsconfig.json)
│   └── eslint-config/     # Standarisasi linter untuk menjaga kualitas kode
│
├── package.json           # Root package manager (pnpm workspace)
├── turbo.json             # Konfigurasi pipeline build & caching Turborepo
└── pnpm-workspace.yaml    # Definisi cakupan monorepo
```

---

## 🗄️ Skema Database (Prisma)

Aplikasi ini menggunakan relasi database berikut untuk memastikan konsistensi data keuangan (*Double-Entry Bookkeeping* sederhana):

```prisma
enum WalletType {
  CASH
  BANK
  E_WALLET
}

enum TransactionType {
  INCOME
  EXPENSE
  TRANSFER
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  wallets   Wallet[]
  createdAt DateTime @default(now())
}

model Wallet {
  id           String        @id @default(uuid())
  name         String        // Contoh: "BCA", "Gopay", "Dompet Tunai"
  type         WalletType
  balance      Decimal       @default(0.00)
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  sourceTx     Transaction[] @relation("SourceWallet")
  destinationTx Transaction[] @relation("DestinationWallet")
}

model Transaction {
  id            String          @id @default(uuid())
  amount        Decimal
  description   String
  type          TransactionType
  category      String          @default("Uncategorized")
  sourceWalletId String?
  sourceWallet  Wallet?         @relation("SourceWallet", fields: [sourceWalletId], references: [id])
  destWalletId  String?
  destWallet    Wallet?         @relation("DestinationWallet", fields: [destWalletId], references: [id])
  createdAt     DateTime        @default(now())
}
```

---

## 🤖 Alur Integrasi AI (LLM)

Ketika pengguna mengirim pesan: *"Gue barusan transfer 50rb dari BCA ke Gopay buat topup"*, AI Engine akan mengekstraknya menggunakan teknik **Structured Outputs / Function Calling** menjadi format berikut:

```json
{
  "status": "success",
  "data": {
    "type": "TRANSFER",
    "amount": 50000,
    "description": "Topup",
    "source_wallet_keyword": "BCA",
    "destination_wallet_keyword": "Gopay",
    "category": "Transfer"
  }
}
```
Sistem kemudian mencocokkan `keyword` dompet dengan database pengguna secara dinamis.

---

## ⚡ Panduan Instalasi Lokal

### Prerequisites
Pastikan Anda sudah menginstal alat-alat berikut di mesin lokal:
*   [Node.js (v18+)](https://nodejs.org/)
*   [pnpm (v8+)](https://pnpm.io/)
*   [PostgreSQL](https://www.postgresql.org/)

### Langkah Demi Langkah

1. **Clone Repositori**
   ```bash
   git clone https://github.com/username/zendompi-monorepo.git
   cd zendompi-monorepo
   ```

2. **Instalasi Dependensi Monorepo**
   ```bash
   pnpm install
   ```

3. **Setup Environment Variables**
   Salin file sampel `.env.example` di masing-masing folder aplikasi (`apps/web`, `apps/webhook-bot`, dan `packages/database`) dan sesuaikan nilainya.

4. **Inisialisasi Database**
   Masuk ke paket database, lalu jalankan migrasi Prisma:
   ```bash
   cd packages/database
   pnpm prisma migrate dev --name init
   pnpm prisma db seed
   cd ../..
   ```

5. **Jalankan Mode Pengembangan (Development)**
   Kembali ke root directory dan jalankan Turborepo pipeline:
   ```bash
   pnpm dev
   ```
   Aplikasi web akan berjalan di `http://localhost:3000`.

---

## 🔑 Variabel Lingkungan (Environment Variables)

Isi file `.env` Anda dengan struktur minimal seperti berikut:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:password@localhost:5432/zendompi?schema=public"

# AI Core Configuration
OPENAI_API_KEY="sk-proj-..."
GEMINI_API_KEY="AIzaSy..."

# Bot Integration Secrets
telegram_BOT_TOKEN="123456789:ABCdefGhI..."
whatsapp_API_TOKEN="EAAG..."
WEBHOOK_VERIFY_TOKEN="secure_random_string_here"

# Authentication
NEXTAUTH_SECRET="super_secret_next_auth_key"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 🚀 Panduan Deployment

### 1. Web & Webhook Bot (Vercel)
Karena proyek ini menggunakan Turborepo, Vercel dapat mendeteksi pengaturan monorepo secara otomatis.
*   Hubungkan repositori Anda ke **Vercel Dashboard**.
*   Untuk aplikasi web, atur *Root Directory* ke `apps/web`.
*   Untuk webhook bot, atur *Root Directory* ke `apps/webhook-bot`.
*   Tambahkan semua *Environment Variables* yang diperlukan pada pengaturan project Vercel.

### 2. Mobile App (Expo EAS Build)
Untuk membuild aplikasi mobile ke format `.apk` / `.aab` (Android) atau `.ipa` (iOS):
```bash
cd apps/mobile
pnpm eas build --platform android
pnpm eas build --platform ios
```

---

## 🤝 Kontribusi & Lisensi

Kontribusi selalu terbuka! Jika Anda ingin meningkatkan performa parsing LLM atau menambahkan integrasi dompet baru, silakan buka *Pull Request* atau ajukan *Issue*.

Proyek ini dilisensikan di bawah **MIT License**.

---
*Dibuat dengan ❤️ untuk menghadirkan ketenangan dalam finansial Anda.*
