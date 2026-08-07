import 'dotenv/config';
import { PrismaClient, TransactionType, Role } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Ambil URL dari environment variable
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL tidak ditemukan di environment variables!");
}

// 2. Buat instance Pool dari pg
const pool = new Pool({ connectionString });

// 3. Buat adapter
const adapter = new PrismaPg(pool);

// 4. Inisialisasi PrismaClient dengan adapter tersebut
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Memulai seeding database...\n");

  // ─── Clean existing data ──────────────────────
  // Urutan delete sangat penting untuk menghindari error foreign key
  await prisma.chatLog.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.category.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();

  // ─── Create Demo User ─────────────────────────
  const user = await prisma.user.create({
    data: {
      email: "demo@zendompi.dev",
      name: "Demo User",
      role: Role.USER,
      whatsappNo: "6287774943469",
      telegramId: "987654321", // Telegram ID ditambahkan di sini
    },
  });

  console.log(`✅ User berhasil dibuat: ${user.name} (${user.id})`);

  // ─── Create Wallets ───────────────────────────
  console.log("\n─── Membuat Dompet ───");
  const walletData = [
    { name: "BCA Tahapan", balance: 5_000_000 },
    { name: "GoPay", balance: 500_000 },
    { name: "OVO", balance: 250_000 },
    { name: "Cash", balance: 300_000 },
    { name: "Mandiri", balance: 2_000_000 },
  ];

  const wallets: Record<string, string> = {};

  for (const w of walletData) {
    const wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        name: w.name,
        balance: w.balance,
      },
    });
    wallets[w.name] = wallet.id;
    console.log(`  💰 ${w.name}: Rp ${w.balance.toLocaleString("id-ID")}`);
  }

  // ─── Create Categories ────────────────────────
  const categoriesData = [
    { name: "Makanan", type: TransactionType.EXPENSE, icon: "🍔" },
    { name: "Transport", type: TransactionType.EXPENSE, icon: "🚗" },
    { name: "Belanja", type: TransactionType.EXPENSE, icon: "🛍️" },
    { name: "Hiburan", type: TransactionType.EXPENSE, icon: "🎮" },
    { name: "Gaji", type: TransactionType.INCOME, icon: "💼" },
    { name: "Freelance", type: TransactionType.INCOME, icon: "💻" },
    { name: "Top Up", type: TransactionType.TRANSFER, icon: "🔄" },
  ];

  const categories: Record<string, string> = {};

  for (const c of categoriesData) {
    const category = await prisma.category.create({
      data: {
        userId: user.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
      },
    });
    categories[c.name] = category.id;
  }

  console.log("\n✅ Kategori berhasil dibuat");

  // ─── Create Transactions ──────────────────────
  console.log("\n─── Simulasi Transaksi ───");

  // Expense: Makan siang
  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: wallets["GoPay"]!,
      categoryId: categories["Makanan"]!,
      type: TransactionType.EXPENSE,
      amount: 45_000,
      description: "Makan siang di warteg",
      date: new Date("2026-08-07T12:00:00"),
    },
  });
  console.log("  ✅ Expense: Makan siang Rp 45.000 → GoPay");

  // Expense: Bensin
  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: wallets["Cash"]!,
      categoryId: categories["Transport"]!,
      type: TransactionType.EXPENSE,
      amount: 100_000,
      description: "Bensin Pertamax",
      date: new Date("2026-08-07T08:00:00"),
    },
  });
  console.log("  ✅ Expense: Bensin Rp 100.000 → Cash");

  // Income: Gaji
  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: wallets["BCA Tahapan"]!,
      categoryId: categories["Gaji"]!,
      type: TransactionType.INCOME,
      amount: 10_000_000,
      description: "Gaji bulan Agustus",
      date: new Date("2026-08-01T09:00:00"),
    },
  });
  console.log("  ✅ Income: Gaji Rp 10.000.000 → BCA");

  // Transfer: Top Up BCA ke GoPay
  const transfer = await prisma.transfer.create({
    data: {
      userId: user.id,
      fromWalletId: wallets["BCA Tahapan"]!,
      toWalletId: wallets["GoPay"]!,
      amount: 100_000,
      description: "Top up GoPay dari BCA",
      date: new Date("2026-08-05T14:00:00"),
    },
  });

  // Transaksi terkait transfer
  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: wallets["BCA Tahapan"]!,
      type: TransactionType.TRANSFER,
      amount: 100_000,
      description: "Top up GoPay dari BCA",
      transferId: transfer.id,
      date: new Date("2026-08-05T14:00:00"),
    },
  });
  console.log("  ✅ Transfer: BCA → GoPay Rp 100.000");

  // ─── Update wallet balances ───────────────────
  await prisma.wallet.update({
    where: { id: wallets["GoPay"]! },
    data: { balance: 500_000 - 45_000 + 100_000 },
  });

  await prisma.wallet.update({
    where: { id: wallets["Cash"]! },
    data: { balance: 300_000 - 100_000 },
  });

  await prisma.wallet.update({
    where: { id: wallets["BCA Tahapan"]! },
    data: { balance: 5_000_000 + 10_000_000 - 100_000 },
  });

  // ─── Create Chat Logs ─────────────────────────
  console.log("\n─── Simulasi Chat Log ───");

  await prisma.chatLog.createMany({
    data: [
      // Skenario 1: Input transaksi via WhatsApp
      {
        userId: user.id,
        platform: "whatsapp",
        chatId: "6287774943469",
        direction: "incoming",
        messageType: "transaction",
        content: "Makan siang gopay 45rb",
        metadata: {
          parsed: { amount: 45000, wallet: "GoPay", category: "Makanan" }
        }
      },
      // Balasan dari sistem di WhatsApp
      {
        userId: user.id,
        platform: "whatsapp",
        chatId: "6287774943469",
        direction: "outgoing",
        messageType: "text",
        content: "✅ Berhasil dicatat: Pengeluaran Rp 45.000 dari GoPay untuk Makan siang.",
        metadata: {}
      },
      // Skenario 2: Cek saldo via Telegram
      {
        userId: user.id,
        platform: "telegram",
        chatId: "987654321",
        direction: "incoming",
        messageType: "command",
        content: "/saldo",
        metadata: { command: "saldo" }
      },
      // Balasan dari sistem di Telegram
      {
        userId: user.id,
        platform: "telegram",
        chatId: "987654321",
        direction: "outgoing",
        messageType: "text",
        content: "💰 Saldo saat ini:\nBCA: Rp 14.900.000\nGoPay: Rp 555.000\nCash: Rp 200.000",
        metadata: {}
      }
    ],
  });

  console.log("  ✅ Chat Logs (WhatsApp & Telegram) berhasil direkam");

  console.log("\n🚀 Seeding selesai sepenuhnya!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Terjadi kesalahan saat seeding:", e);
    await prisma.$disconnect();
    process.exit(1);
  });