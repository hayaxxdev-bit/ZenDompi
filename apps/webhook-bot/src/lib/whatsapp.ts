const whatsapp_API_URL = `https://graph.facebook.com/v21.0/${process.env.whatsapp_PHONE_NUMBER_ID}/messages`;

/**
 * Kirim pesan balasan ke user WhatsApp
 */
export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<void> {
  try {
    const response = await fetch(whatsapp_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.whatsapp_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });

    if (!response.ok) {
      console.error("WhatsApp send error:", await response.json());
    }
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error);
  }
}