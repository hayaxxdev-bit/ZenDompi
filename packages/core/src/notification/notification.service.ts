/**
 * Notification Service
 *
 * Abstraksi untuk mengirim notifikasi ke berbagai platform.
 * Saat ini: placeholder. Nanti: integrasi Telegram, WhatsApp, Email, Push.
 */

export type NotificationChannel = "telegram" | "whatsapp" | "EMAIL" | "PUSH";

export type NotificationPayload = {
  userId: string;
  channel: NotificationChannel;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

export class NotificationService {
  /**
   * Kirim notifikasi ke user
   *
   * Untuk sekarang: log ke console.
   * Nanti: integrasi dengan provider masing-masing channel.
   */
  async send(payload: NotificationPayload): Promise<void> {
    console.log(`📢 [${payload.channel}] To: ${payload.userId}`, {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    });

    // TODO: Integrasi dengan:
    // - Telegram Bot API
    // - WhatsApp Cloud API
    // - Email (Resend, SendGrid)
    // - Push Notification (Firebase, Expo)
  }

  /**
   * Notifikasi transaksi berhasil
   */
  async notifyTransactionSuccess(
    userId: string,
    channel: NotificationChannel,
    transaction: { type: string; amount: number; description: string },
  ) {
    const emoji = transaction.type === "INCOME" ? "📥" : "📤";
    await this.send({
      userId,
      channel,
      title: "Transaksi Berhasil",
      body: `${emoji} ${
        transaction.description
      }\nRp ${transaction.amount.toLocaleString("id-ID")}`,
      // ✅ Objek transaction dimasukkan secara utuh
      data: { type: "transaction", transaction },
    });
  }
  /**
   * Notifikasi saldo rendah
   */
  async notifyLowBalance(
    userId: string,
    channel: NotificationChannel,
    walletName: string,
    balance: number,
  ) {
    await this.send({
      userId,
      channel,
      title: "⚠️ Saldo Rendah",
      body: `Saldo ${walletName} tersisa Rp ${balance.toLocaleString("id-ID")}`,
      data: { type: "low_balance", walletName, balance },
    });
  }
}

export const notificationService = new NotificationService();
