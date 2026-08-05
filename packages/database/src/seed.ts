import { prisma } from "./client.js";
import { transferBetweenWallets } from "./transfer.js";
import { createTransaction } from "./transaction.js";
import { getWalletBalance, getNetWorth } from "./balance.js";

async function main() {
  console.log("🌱 Seeding database...\n");

  // ──────────────────────────────────────────────
  // 1. BUAT USER DUMMY
  // ──────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "demo@zendompi.dev" },
    update: {},
    create: {
      email: "demo@zendompi.dev",
      name: "Demo User",
      phoneNumber: "+6281234567890",
    },
  });

  console.log(`✅ User: ${user.name} (${user.id})`);

  // ──────────────────────────────────────────────
  // 2. BUAT WALLETS (MULTI-DOMPET)
  // ──────────────────────────────────────────────
  const walletData = [
    { name: "BCA Tahapan", type: "bank", initialBalance: 5000000 },
    { name: "GoPay", type: "e-wallet", initialBalance: 500000 },
    { name: "OVO", type: "e-wallet", initialBalance: 250000 },
    { name: "Cash", type: "cash", initialBalance: 300000 },
    { name: "Mandiri", type: "bank", initialBalance: 2000000 },
  ];

  const wallets: Record<string, string> = {};

  for (const w of walletData) {
    const wallet = await prisma.wallet.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: w.name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: w.name,
        type: w.type,
        initialBalance: w.initialBalance,
      },
    });

    wallets[w.name] = wallet.id;
    console.log(`  💰 ${w.name}: Rp ${w.initialBalance.toLocaleString("id-ID")}`);
  }

  // ──────────────────────────────────────────────
  // 3. BUAT KATEGORI
  // ──────────────────────────────────────────────
  const categoriesData = [
    { name: "Makanan", type: "expense", icon: "🍔" },
    { name: "Transport", type: "expense", icon: "🚗" },
    { name: "Belanja", type: "expense", icon: "🛍️" },
    { name: "Hiburan", type: "expense", icon: "🎮" },
    { name: "Gaji", type: "income", icon: "💼" },
    { name: "Freelance", type: "income", icon: "💻" },
    { name: "Top Up", type: "transfer", icon: "🔄" },
  ];

  const categories: Record<string, string> = {};

  for (const c of categoriesData) {
    const category = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: c.name,
        },
      },
      update: {},
      create: {
        userId: user.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
      },
    });

    categories[c.name] = category.id;
  }

  console.log("\n✅ Kategori berhasil dibuat");

  // ──────────────────────────────────────────────
  // 4. SIMULASI TRANSAKSI TRANSFER
  // ──────────────────────────────────────────────
  console.log("\n─── Simulasi Transfer ───\n");

  // Transfer 1: BCA → GoPay (Top Up)
  try {
    const result = await transferBetweenWallets({
      userId: user.id,
      fromWalletId: wallets["BCA Tahapan"]!,
      toWalletId: wallets["GoPay"]!,
      amount: 100000,
      description: "Top up GoPay dari BCA",
      categoryId: categories["Top Up"]!,
    });

    console.log(
      `✅ Transfer #1: BCA → GoPay Rp 100.000 (TX: ${result.transaction.id.slice(0, 8)}...)`
    );
  } catch (error) {
    console.error("❌ Transfer #1 gagal:", error);
  }

  // Transfer 2: GoPay → OVO
  try {
    const result = await transferBetweenWallets({
      userId: user.id,
      fromWalletId: wallets["GoPay"]!,
      toWalletId: wallets["OVO"]!,
      amount: 50000,
      description: "Kirim ke OVO buat bayar parkir",
    });

    console.log(
      `✅ Transfer #2: GoPay → OVO Rp 50.000 (TX: ${result.transaction.id.slice(0, 8)}...)`
    );
  } catch (error) {
    console.error("❌ Transfer #2 gagal:", error);
  }

  // Transfer 3: Coba transfer melebihi saldo (HARUS GAGAL)
  console.log("\n🧪 Test: Transfer Rp 100 Juta (saldo tidak cukup)...");
  try {
    await transferBetweenWallets({
      userId: user.id,
      fromWalletId: wallets["Cash"]!,
      toWalletId: wallets["BCA Tahapan"]!   ,
      amount: 100_000_000,
      description: "Transfer besar (seharusnya gagal)",
    });
    console.error("❌ Seharusnya gagal tapi berhasil! Ada bug!");
  } catch (error: any) {
    console.log(`✅ Berhasil dicegah: ${error.message}`);
  }

  // ──────────────────────────────────────────────
  // 5. SIMULASI INCOME & EXPENSE
  // ──────────────────────────────────────────────
  console.log("\n─── Simulasi Income & Expense ───\n");

  // Income: Gaji masuk ke BCA
  await createTransaction({
    userId: user.id,
    walletId: wallets["BCA Tahapan"]!,
    type: "income",
    amount: 10_000_000,
    description: "Gaji bulanan",
    categoryId: categories["Gaji"]!,
  });
  console.log("✅ Income: Gaji Rp 10.000.000 → BCA");

  // Expense: Makan di GoPay
  await createTransaction({
    userId: user.id,
    walletId: wallets["GoPay"]!,
    type: "expense",
    amount: 45_000,
    description: "Makan siang di warteg",
    categoryId: categories["Makanan"]!,
  });
  console.log("✅ Expense: Makan Rp 45.000 → GoPay");

  // Expense: Bensin Cash
  await createTransaction({
    userId: user.id,
    walletId: wallets["Cash"]!,
    type: "expense",
    amount: 100_000,
    description: "Bensin Pertamax",
    categoryId: categories["Transport"]!,
  });
  console.log("✅ Expense: Bensin Rp 100.000 → Cash");

  // ──────────────────────────────────────────────
  // 6. CEK SALDO AKHIR
  // ──────────────────────────────────────────────
  console.log("\n─── Saldo Akhir ───\n");

  for (const name of Object.keys(wallets)) {
    const balance = await getWalletBalance(wallets[name]!);
    console.log(`  💰 ${name}: Rp ${balance.toLocaleString("id-ID")}`);
  }

  const netWorth = await getNetWorth(user.id);
  console.log(`\n🏦 Net Worth: Rp ${netWorth.toLocaleString("id-ID")}`);

  console.log("\n✅ Seeding selesai!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });