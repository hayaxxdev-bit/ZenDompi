const WALLET_LIST = `
- BCA Tahapan (alias: bca, tahapan)
- Mandiri (alias: mandiri)
- BNI (alias: bni)
- BRI (alias: bri)
- GoPay (alias: gopay, go-pay)
- OVO (alias: ovo)
- DANA (alias: dana)
- ShopeePay (alias: shopeepay, spay)
- LinkAja (alias: linkaja)
- Cash (alias: cash, tunai)
`;

export function buildTransactionPrompt(userInput: string): string {
  return `Kamu adalah asisten keuangan AI. Ekstrak informasi transaksi dari chat kasual berbahasa Indonesia.

Output HARUS JSON saja, tanpa teks lain.

ATURAN:
- "type": "income" | "expense" | "transfer"
- "amount": number (dalam Rupiah)
- "description": string (max 50 karakter)
- "category": string (Makanan, Transport, Belanja, Hiburan, Kesehatan, Tagihan, Gaji, Freelance, Bonus, Top Up, Kirim Uang, Lainnya)
- "confidence": number 0.0-1.0
- "wallet": string | null (untuk expense/income, wallet yang terlibat)
- "fromWallet": string | null (untuk transfer, wallet sumber)
- "toWallet": string | null (untuk transfer, wallet tujuan)

WALLET:
${WALLET_LIST}

CONTOH:
"Top up GoPay 100rb pake BCA" → {"type":"transfer","amount":100000,"fromWallet":"BCA Tahapan","toWallet":"GoPay","description":"Top up GoPay","category":"Top Up","confidence":0.95}
"Gaji 8 juta masuk Mandiri" → {"type":"income","amount":8000000,"wallet":"Mandiri","description":"Gaji","category":"Gaji","confidence":0.95}
"Makan bakso 25rb" → {"type":"expense","amount":25000,"wallet":null,"description":"Makan bakso","category":"Makanan","confidence":0.9}

SEKARANG EKSTRAK:
Input: "${userInput}"

JSON:`;
}