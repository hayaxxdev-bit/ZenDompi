import { NextRequest, NextResponse } from "next/server";
import { extractTransactionFromChat } from "@/lib/gemini";
import { sendTelegramMessage } from "@/lib/telegram";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { prisma, transferBetweenWallets, createTransaction } from "@zendompi/database";
import type { ExtractedTransaction } from "@/lib/gemini";

// ─── Wallet Name → ID Mapping ──────────────────
async function findWalletId(
  userId: string,
  walletName: string
): Promise<string | null> {
  const wallet = await prisma.wallet.findFirst({
    where: {
      userId,
      name: { contains: walletName, mode: "insensitive" },
      isArchived: false,
    },
  });

  return wallet?.id ?? null;
}

// ─── Kategori Name → ID Mapping ────────────────
async function findCategoryId(
  userId: string,
  categoryName: string
): Promise<string | null> {
  const category = await prisma.category.findFirst({
    where: {
      userId,
      name: { contains: categoryName, mode: "insensitive" },
    },
  });

  return category?.id ?? null;
}

// ─── Format Rupiah ─────────────────────────────
function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// ─── Proses Transaksi ──────────────────────────
async function processTransaction(
  userId: string,
  extracted: ExtractedTransaction
): Promise<string> {
  try {
    switch (extracted.type) {
      case "transfer": {
        if (!extracted.fromWallet || !extracted.toWallet) {
          return "❌ Transfer butuh wallet sumber dan tujuan. Contoh: Top up OVO 50rb dari BCA";
        }

        const fromId = await findWalletId(userId, extracted.fromWallet);
        const toId = await findWalletId(userId, extracted.toWallet);

        if (!fromId) return `❌ Wallet "${extracted.fromWallet}" tidak ditemukan`;
        if (!toId) return `❌ Wallet "${extracted.toWallet}" tidak ditemukan`;

        const categoryId = extracted.category
          ? await findCategoryId(userId, extracted.category)
          : null;

        const result = await transferBetweenWallets({
          userId,
          fromWalletId: fromId,
          toWalletId: toId,
          amount: extracted.amount,
          description: extracted.description,
          categoryId,
        });

        return `✅ Transfer berhasil!\n📤 ${extracted.fromWallet} → 📥 ${extracted.toWallet}\n💵 ${formatRupiah(extracted.amount)}\n📝 ${extracted.description}`;
      }

      case "expense": {
        if (!extracted.fromWallet) {
          return "❌ Pengeluaran butuh wallet sumber. Contoh: Makan 25rb pake GoPay";
        }

        const walletId = await findWalletId(userId, extracted.fromWallet);
        if (!walletId) return `❌ Wallet "${extracted.fromWallet}" tidak ditemukan`;

        const categoryId = extracted.category
          ? await findCategoryId(userId, extracted.category)
          : null;

        await createTransaction({
          userId,
          walletId,
          type: "expense",
          amount: extracted.amount,
          description: extracted.description,
          categoryId,
        });

        return `✅ Pengeluaran dicatat!\n📤 ${extracted.fromWallet}\n💵 -${formatRupiah(extracted.amount)}\n📝 ${extracted.description}`;
      }

      case "income": {
        if (!extracted.toWallet) {
          return "❌ Pemasukan butuh wallet tujuan. Contoh: Gaji 5jt masuk BCA";
        }

        const walletId = await findWalletId(userId, extracted.toWallet);
        if (!walletId) return `❌ Wallet "${extracted.toWallet}" tidak ditemukan`;

        const categoryId = extracted.category
          ? await findCategoryId(userId, extracted.category)
          : null;

        await createTransaction({
          userId,
          walletId,
          type: "income",
          amount: extracted.amount,
          description: extracted.description,
          categoryId,
        });

        return `✅ Pemasukan dicatat!\n📥 ${extracted.toWallet}\n💵 +${formatRupiah(extracted.amount)}\n📝 ${extracted.description}`;
      }

      default:
        return "❌ Tipe transaksi tidak dikenali";
    }
  } catch (error: any) {
    console.error("Process transaction error:", error);
    return `❌ Gagal: ${error.message || "Terjadi kesalahan"}`;
  }
}

// ─── MAIN HANDLER ──────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, chatId, message, userName } = body;

    console.log(`📩 [${platform}] ${userName}: ${message}`);

    // 1. Ekstrak transaksi dengan Gemini
    const extracted = await extractTransactionFromChat(message);

    if (!extracted) {
      const errorMsg = "❌ Maaf, saya tidak bisa memahami transaksi kamu. Coba tulis lebih jelas ya!\nContoh: Top up GoPay 50rb pake BCA";
      
      if (platform === "telegram") await sendTelegramMessage(chatId, errorMsg);
      else if (platform === "whatsapp") await sendWhatsAppMessage(chatId, errorMsg);
      
      return NextResponse.json({ ok: true });
    }

    console.log("🤖 Extracted:", JSON.stringify(extracted, null, 2));

    // 2. Cari user berdasarkan platform
    let user;
    if (platform === "telegram") {
      user = await prisma.user.findFirst({
        where: { telegramId: BigInt(chatId) },
      });
    } else if (platform === "whatsapp") {
      user = await prisma.user.findFirst({
        where: { phoneNumber: chatId },
      });
    }

    if (!user) {
      // User belum terdaftar — buat akun otomatis
      user = await prisma.user.create({
        data: {
          name: userName,
          ...(platform === "telegram" ? { telegramId: BigInt(chatId) } : {}),
          ...(platform === "whatsapp" ? { phoneNumber: chatId } : {}),
        },
      });

      // Buat wallet default
      await prisma.wallet.createMany({
        data: [
          { userId: user.id, name: "Cash", type: "cash", initialBalance: 0 },
        ],
      });

      console.log(`👤 User baru terdaftar: ${user.id}`);
    }

    // 3. Proses transaksi
    const resultMessage = await processTransaction(user.id, extracted);

    // 4. Kirim balasan
    if (platform === "telegram") {
      await sendTelegramMessage(chatId, resultMessage);
    } else if (platform === "whatsapp") {
      await sendWhatsAppMessage(chatId, resultMessage);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Process endpoint error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}