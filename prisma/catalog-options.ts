export const paymentMethodOptions = [
  {
    slug: "crypto",
    sortOrder: 10,
    labels: { en: "Crypto", zh: "加密货币", th: "คริปโต" },
  },
  {
    slug: "visa",
    sortOrder: 20,
    labels: { en: "Visa / Mastercard", zh: "Visa / Mastercard", th: "Visa / Mastercard" },
  },
  {
    slug: "paypal",
    sortOrder: 30,
    labels: { en: "PayPal", zh: "PayPal", th: "PayPal" },
  },
  {
    slug: "bank",
    sortOrder: 40,
    labels: { en: "Bank transfer", zh: "银行转账", th: "โอนธนาคาร" },
  },
] as const;

export const gameProviderOptions = [
  {
    slug: "evolution",
    sortOrder: 10,
    labels: { en: "Evolution", zh: "Evolution", th: "Evolution" },
  },
  {
    slug: "pragmatic",
    sortOrder: 20,
    labels: { en: "Pragmatic Play", zh: "Pragmatic Play", th: "Pragmatic Play" },
  },
  {
    slug: "netent",
    sortOrder: 30,
    labels: { en: "NetEnt", zh: "NetEnt", th: "NetEnt" },
  },
  {
    slug: "playngo",
    sortOrder: 40,
    labels: { en: "Play’n GO", zh: "Play’n GO", th: "Play’n GO" },
  },
  {
    slug: "hacksaw",
    sortOrder: 50,
    labels: { en: "Hacksaw", zh: "Hacksaw", th: "Hacksaw" },
  },
] as const;

export const bonusTypeOptions = [
  {
    slug: "welcome",
    sortOrder: 10,
    labels: { en: "Welcome bonus", zh: "迎新优惠", th: "โบนัสต้อนรับ" },
  },
  {
    slug: "no-deposit",
    sortOrder: 20,
    labels: { en: "No deposit", zh: "无需存款", th: "ไม่ต้องฝาก" },
  },
  {
    slug: "free-spins",
    sortOrder: 30,
    labels: { en: "Free spins", zh: "免费旋转", th: "ฟรีสปิน" },
  },
  {
    slug: "reload",
    sortOrder: 40,
    labels: { en: "Reload", zh: "再存优惠", th: "โบนัสเติม" },
  },
  {
    slug: "cashback",
    sortOrder: 50,
    labels: { en: "Cashback", zh: "返水", th: "แคชแบ็ก" },
  },
] as const;
