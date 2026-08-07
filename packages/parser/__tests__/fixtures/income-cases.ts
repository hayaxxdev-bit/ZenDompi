export const incomeCases = [
  {
    input: "Gaji 8 juta masuk Mandiri",
    expected: {
      type: "INCOME",
      amount: 8000000,
      wallet: "Mandiri",
      category: "Gaji",
      description: "Gaji",
    },
  },
  {
    input: "Freelance 2.5jt masuk BCA",
    expected: {
      type: "INCOME",
      amount: 2500000,
      wallet: "BCA Tahapan",
      category: "Freelance",
      description: "Freelance",
    },
  },
  {
    input: "Bonus akhir tahun 10 juta",
    expected: {
      type: "INCOME",
      amount: 10000000,
      wallet: null, // Tidak disebutkan wallet
      category: "Bonus",
      description: "Bonus akhir tahun",
    },
  },
  {
    input: "Dapat THR 5jt masuk BCA",
    expected: {
      type: "INCOME",
      amount: 5000000,
      wallet: "BCA Tahapan",
      category: "Bonus",
      description: "THR",
    },
  },
];