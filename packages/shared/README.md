# @zendompi/shared

Shared package untuk semua aplikasi ZenDompi.

## Struktur

- `constants/` - Shared constants
- `dto/` - Data Transfer Objects
- `enums/` - TypeScript enums
- `errors/` - Custom error classes
- `schemas/` - Zod validation schemas
- `types/` - TypeScript types/interfaces
- `utils/` - Utility functions

## Usage

```typescript
import { TransactionType, WalletType } from "@zendompi/shared/enums";
import { formatRupiah } from "@zendompi/shared/utils";
import { transferSchema } from "@zendompi/shared/schemas";
```

---

## Langkah 2: Enums

### 2.1 `packages/shared/src/enums/transaction.enum.ts`

```typescript
/**
 * Tipe transaksi keuangan
 */
export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
}

/**
 * Tipe akun di double-entry ledger
 */
export enum LedgerAccountType {
  /** Uang masuk (increase balance) */
  DEBIT = "debit",
  /** Uang keluar (decrease balance) */
  CREDIT = "credit",
}