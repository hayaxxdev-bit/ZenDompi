export const expenseCases = [
  {
    input: "Makan bakso 25rb",
    expected: {
      type: "EXPENSE",
      amount: 25000,
      wallet: "Cash",
      category: "Makanan",
      description: "Makan bakso",
    },
  },
  {
    input: "Makan ayam geprek 25000 pakai GoPay",
    expected: {
      type: "EXPENSE",
      amount: 25000,
      wallet: "GoPay",
      category: "Makanan",
      description: "Ayam geprek",
    },
  },
  {
    input: "Bensin pertamax 100 ribu pake BCA",
    expected: {
      type: "EXPENSE",
      amount: 100000,
      wallet: "BCA Tahapan",
      category: "Transport",
      description: "Bensin pertamax",
    },
  },
  {
    input: "Beli pulsa 50k pake DANA",
    expected: {
      type: "EXPENSE",
      amount: 50000,
      wallet: "DANA",
      category: "Belanja",
      description: "Beli pulsa",
    },
  },
  {
    input: "Ngopi di starbucks 85.000 cash",
    expected: {
      type: "EXPENSE",
      amount: 85000,
      wallet: "Cash",
      category: "Makanan",
      description: "Ngopi di starbucks",
    },
  },
];