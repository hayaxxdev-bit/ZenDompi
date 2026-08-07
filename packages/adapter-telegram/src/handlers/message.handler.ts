import type { BotContext } from "../bot";
import { parseIncomingMessage } from "../parser";
import { 
  transactionService, 
  transferService, 
  walletService, 
  chatService 
} from "@zendompi/core";
import { 
  eventBus, 
  MessageReceivedEvent, 
  TransactionCreatedEvent 
} from "@zendompi/events";
import { extractTransaction, type ExtractedTransaction } from "@zendompi/parser";
import { sendText } from "../sender";
import { formatRupiah } from "@zendompi/shared";

/**
 * Handler untuk pesan bebas (pencatatan transaksi via teks)
 */
export async function handleMessage(ctx: BotContext) {
  const text = ctx.message?.text;
  if (!text) return;

  const chatId = ctx.chat?.id;
  if (!chatId) return;

  // ==========================================
  // 1. FILTER INTENT & NATURAL LANGUAGE
  // ==========================================
  const lowerText = text.toLowerCase().trim();
  
  // A. Filter Sapaan Dasar (Greetings)
  const greetings = ["halo", "hallo", "hi", "hai", "helo", "hello", "ping", "p", "test", "tes"];
  if (greetings.includes(lowerText)) {
    await ctx.reply(
      `Halo juga! 👋\n\nAku siap mencatat keuanganmu. Langsung aja ketik transaksimu ya!\n\nContoh: <i>"Makan siang 25rb pake BCA"</i>\nKetik /bantuan untuk melihat menu.`,
      { parse_mode: "HTML" }
    );
    return; 
  }

  // B. Filter Ucapan Terima Kasih
  const thanks = ["makasih", "terima kasih", "thanks", "tq", "thank you", "makasi", "thx"];
  if (thanks.includes(lowerText)) {
    await ctx.reply("Sama-sama! Senang bisa membantu kelola keuanganmu. ☺️", { parse_mode: "HTML" });
    return;
  }

  // C. Filter Pertanyaan Info/Laporan (Inquiry)
  const isAskingInfo = /berapa|gimana|saldo|total|laporan|info|sisa|keuangan|ngeluarin|habis|cek/i.test(lowerText);
  // Deteksi jika ada angka/nominal (3 digit angka, atau angka diikuti rb/ribu/k/jt/juta)
  const hasNominal = /\d{3,}|\d+\s*(rb|ribu|k|jt|juta|milyar)/i.test(lowerText);

  // Jika nanya info TAPI TIDAK ADA nominal uang, arahkan ke menu (Jangan panggil AI)
  if (isAskingInfo && !hasNominal) {
    await ctx.reply(
      `📊 <b>Mencari Info Keuangan?</b>\n\n` +
      `Untuk saat ini, gunakan menu perintah berikut untuk mengecek keuanganmu:\n\n` +
      `💳 /saldo - Cek sisa saldo tiap dompet\n` +
      `📈 /laporan - Ringkasan keuangan bulan ini\n\n` +
      `<i>(Tips: Jika ingin mencatat transaksi, pastikan kamu mengetik nominal uangnya, misal: 50rb atau 50000)</i>`,
      { parse_mode: "HTML" }
    );
    return;
  }
  // ==========================================

  // 2. AMBIL DATA USER
  const dbUserId = (ctx as any).zenUserId;
  if (!dbUserId) {
    console.error("[MessageHandler] User ID tidak ditemukan di context");
    await sendText({
      chatId: chatId.toString(),
      text: "❌ Gagal memproses pesan. Pastikan kamu sudah menekan /start.",
    });
    return;
  }

  // 3. NORMALISASI & SIMPAN CHAT KE LOG
  const incoming = parseIncomingMessage(ctx);

  await chatService.save({
    userId: dbUserId,
    platform: "telegram",
    chatId: incoming.chatId,
    direction: "incoming",
    messageType: "text",
    content: incoming.text,
  });

  await eventBus.publish(
    new MessageReceivedEvent({
      userId: dbUserId,
      platform: "telegram",
      chatId: incoming.chatId,
      content: incoming.text,
    })
  );

  // 4. UX: PESAN LOADING
  const loadingMsg = await ctx.reply("⏳ <i>Menganalisis pesanmu...</i>", { parse_mode: "HTML" });

  // 5. PROSES AI EXTRACTION (Dengan Anti-Limit)
  let extracted: ExtractedTransaction | null = null;
  try {
    extracted = await extractTransaction(incoming);
  } catch (error: any) {
    if (error.message === "RATE_LIMIT") {
      await ctx.api.editMessageText(
        chatId,
        loadingMsg.message_id,
        "🤖 <b>Sistem Sibuk!</b>\nKuota AI sedang penuh karena terlalu banyak request. Tolong tunggu sekitar 1 menit lalu coba lagi ya. 🙏",
        { parse_mode: "HTML" }
      );
      return;
    }
    
    console.error("[MessageHandler] AI Extraction Error:", error);
    await ctx.api.editMessageText(
      chatId,
      loadingMsg.message_id,
      "❌ <b>Gagal Menganalisis</b>\nTerjadi kesalahan pada sistem AI saat memproses pesanmu.",
      { parse_mode: "HTML" }
    );
    return;
  }

  // Jika AI gagal paham atau ragu-ragu
  if (!extracted || extracted.confidence < 0.5) {
    const fallbackText = 
      `🤔 <b>Maaf, aku belum mengerti maksud kamu.</b>\n\n` +
      `Pastikan kamu menyebutkan nominal dan nama dompetnya. Coba format seperti ini:\n` +
      `📤 <b>Pengeluaran:</b> Makan bakso 25rb pake GoPay\n` +
      `📥 <b>Pemasukan:</b> Gaji 8jt masuk BCA\n` +
      `🔄 <b>Transfer:</b> Top up OVO 50rb dari BCA\n\n` +
      `<i>Ketik /bantuan untuk panduan lengkap.</i>`;
      
    await ctx.api.editMessageText(chatId, loadingMsg.message_id, fallbackText, { parse_mode: "HTML" });
    return;
  }

  // 6. EKSEKUSI TRANSAKSI KE DATABASE CORE
  try {
    const wallets = await walletService.list(dbUserId);

    if (extracted.type === "EXPENSE" || extracted.type === "INCOME") {
      if (!extracted.wallet) {
        await ctx.api.editMessageText(
          chatId,
          loadingMsg.message_id,
          "❌ <b>Dompet Tidak Jelas</b>\nSebutkan dompet yang digunakan.\nContoh: <i>Makan 25rb pake GoPay</i>",
          { parse_mode: "HTML" }
        );
        return;
      }

      const wallet = wallets.find((w) => w.name.toLowerCase() === extracted.wallet?.toLowerCase());
      if (!wallet) {
        await ctx.api.editMessageText(
          chatId,
          loadingMsg.message_id,
          `❌ Dompet <b>"${extracted.wallet}"</b> tidak ditemukan di akunmu.\nKetik /saldo untuk melihat daftar dompetmu.`,
          { parse_mode: "HTML" }
        );
        return;
      }

      // Simpan ke Database
      const tx = await transactionService.create({
        userId: dbUserId,
        walletId: wallet.id,
        type: extracted.type,
        amount: extracted.amount,
        description: extracted.description,
        categoryId: extracted.category || undefined,
      });

      // Publish event
      await eventBus.publish(
        new TransactionCreatedEvent({
          transactionId: tx.id,
          userId: dbUserId,
          walletId: wallet.id,
          type: extracted.type,
          amount: extracted.amount,
          description: extracted.description,
          categoryId: extracted.category || null,
        })
      );

      const emoji = extracted.type === "INCOME" ? "📥" : "📤";
      const sign = extracted.type === "INCOME" ? "+" : "-";

      const successText = 
        `✅ <b>Transaksi Tersimpan!</b>\n\n` +
        `${emoji} ${extracted.description}\n` +
        `💳 ${wallet.name}\n` +
        `💵 ${sign} ${formatRupiah(extracted.amount)}\n` +
        (extracted.category ? `🏷️ Kategori: ${extracted.category}` : "");

      await ctx.api.editMessageText(chatId, loadingMsg.message_id, successText, { parse_mode: "HTML" });

    } else if (extracted.type === "TRANSFER") {
      if (!extracted.fromWallet || !extracted.toWallet) {
        await ctx.api.editMessageText(
          chatId,
          loadingMsg.message_id,
          "❌ <b>Detail Transfer Kurang</b>\nSebutkan dompet asal dan tujuan.\nContoh: <i>Transfer 100rb dari BCA ke OVO</i>",
          { parse_mode: "HTML" }
        );
        return;
      }

      const fromWallet = wallets.find((w) => w.name.toLowerCase() === extracted.fromWallet?.toLowerCase());
      const toWallet = wallets.find((w) => w.name.toLowerCase() === extracted.toWallet?.toLowerCase());

      if (!fromWallet || !toWallet) {
        await ctx.api.editMessageText(
          chatId,
          loadingMsg.message_id,
          `❌ <b>Dompet tidak ditemukan</b>\nPastikan dompet "${extracted.fromWallet}" dan "${extracted.toWallet}" sudah kamu buat.`,
          { parse_mode: "HTML" }
        );
        return;
      }

      // Eksekusi Transfer
      await transferService.execute({
        userId: dbUserId,
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        amount: extracted.amount,
        description: extracted.description,
      });

      const successText = 
        `✅ <b>Transfer Berhasil!</b>\n\n` +
        `📤 ${fromWallet.name} ➡️ 📥 ${toWallet.name}\n` +
        `💵 ${formatRupiah(extracted.amount)}\n` +
        `📝 ${extracted.description}`;

      await ctx.api.editMessageText(chatId, loadingMsg.message_id, successText, { parse_mode: "HTML" });
    }

  } catch (error: any) {
    console.error("[MessageHandler] Database/Core Error:", error);
    await ctx.api.editMessageText(
      chatId,
      loadingMsg.message_id,
      `❌ <b>Gagal Menyimpan</b>\n${error.message || "Terjadi kesalahan sistem saat menyimpan transaksi."}`,
      { parse_mode: "HTML" }
    );
  }
}