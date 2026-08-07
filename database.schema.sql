export interface Wallet {
  id: string;
  name: string;             // Contoh: "BCA Tabungan Utama", "GoPay", "Kartu Kredit Mandiri"
  type: WalletType;
  currency: Currency;
  balance: number;          // Saldo saat ini
  creditLimit?: number;     // Khusus untuk CREDIT_CARD / PAYLATER
  accountNumber?: string;   // Nomor rekening / nomor HP e-wallet (opsional)
  icon?: string;            // Identifier ikon untuk UI
  color?: string;           // Warna tema kartu/dompet di UI
  isIncludedInTotal: boolean; // Menentukan apakah masuk ke akumulasi total kekayaan
}

export interface Category {
  id: string;
  name: string;             // Contoh: "Makanan & Minuman", "Gaji", "Listrik"
  type: CategoryType;
  icon?: string;
  color?: string;
  parentId?: string;        // Untuk mendukung Sub-Kategori (misal: "Kopi" di dalam sub "Makanan")
  isSystemDefault: boolean; // Menandai apakah kategori bawaan app atau buatan user
}

export interface Transaction {
  id: string;
  walletId: string;         // Dompet utama (Source)
  targetWalletId?: string;  // Khusus jika type === CategoryType.TRANSFER
  categoryId?: string;      // Opsional untuk TRANSFER, Wajib untuk INCOME/EXPENSE
  type: CategoryType;
  amount: number;
  adminFee?: number;        // Opsional untuk biaya transfer antar bank
  date: Date;
  note?: string;
}