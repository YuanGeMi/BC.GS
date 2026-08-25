import type { Locale } from "@/i18n/routing";

/** Text that can later carry per-locale copy; `en` is required. */
export type LocalizedText = { en: string } & Partial<Record<Locale, string>>;

export function localize(text: LocalizedText, locale: string): string {
  return text[locale as Locale] ?? text.en;
}

/** Build a string that exists in all three site locales. */
export function copy(en: string, zh: string, th: string): LocalizedText {
  return { en, zh, th };
}

export const HIGHLIGHT_LABEL = {
  welcome: copy("Welcome bonus", "迎新优惠", "โบนัสต้อนรับ"),
  payout: copy("Payout speed", "出款速度", "ความเร็วในการถอน"),
  games: copy("Games", "游戏", "เกม"),
};

function match(percent: string, cap: string): LocalizedText {
  return copy(
    `${percent} up to ${cap}`,
    `${percent} 最高 ${cap}`,
    `${percent} สูงสุด ${cap}`,
  );
}

export const PHRASE = {
  sameDay: copy("Same day", "当天到账", "ภายในวันเดียวกัน"),
  oneToTwoDays: copy("1–2 days", "1–2 天", "1–2 วัน"),
  twoToThreeDays: copy("2–3 days", "2–3 天", "2–3 วัน"),
  threeToFiveDays: copy("3–5 days", "3–5 天", "3–5 วัน"),
  twentyFourHours: copy("24 hours", "24 小时", "24 ชั่วโมง"),
  twentyFourToFortyEight: copy("24–48 hours", "24–48 小时", "24–48 ชั่วโมง"),
  twelveToTwentyFour: copy("12–24 hours", "12–24 小时", "12–24 ชั่วโมง"),
  underOneHour: copy("Under 1 hour", "1 小时内", "ไม่เกิน 1 ชั่วโมง"),
  underTwoHours: copy("Under 2 hours", "2 小时内", "ไม่เกิน 2 ชั่วโมง"),
  underSixHours: copy("Under 6 hours", "6 小时内", "ไม่เกิน 6 ชั่วโมง"),
  underTwelveHours: copy("Under 12 hours", "12 小时内", "ไม่เกิน 12 ชั่วโมง"),
  days: (n: string) => copy(`${n} days`, `${n} 天`, `${n} วัน`),
  wagerBonus: (n: string) => copy(`${n}x bonus`, `${n}x 优惠流水`, `เทิร์นโบนัส ${n}x`),
  wagerWinnings: (n: string) =>
    copy(`${n}x winnings`, `${n}x 奖金流水`, `เทิร์นเงินรางวัล ${n}x`),
  wagerCashback: (n: string) =>
    copy(`${n}x cashback`, `${n}x 返水流水`, `เทิร์นแคชแบ็ก ${n}x`),
  freeSpins: (n: string) => copy(`${n} free spins`, `${n} 次免费旋转`, `${n} ฟรีสปิน`),
  noDeposit: (amount: string) =>
    copy(`${amount} no deposit`, `${amount} 无需存款`, `${amount} ไม่ต้องฝาก`),
  match,
};

export type LicenseId = "mga" | "curacao" | "gibraltar" | "ukgc" | "kahnawake";
export type PaymentId = "crypto" | "visa" | "paypal" | "bank";
export type ProviderId =
  | "evolution"
  | "pragmatic"
  | "netent"
  | "playngo"
  | "hacksaw";
export type BonusTypeId =
  | "welcome"
  | "no-deposit"
  | "free-spins"
  | "reload"
  | "cashback";

export type MockCasinoHighlight = {
  label: LocalizedText;
  value: LocalizedText;
};

export type MockCasino = {
  id: string;
  slug: string;
  rating: number;
  logoUrl?: string;
  name: LocalizedText;
  /** Short editorial blurb for cover-story / lead placements. */
  coverLede?: LocalizedText;
  badges: LocalizedText[];
  highlights: MockCasinoHighlight[];
  licenses: LicenseId[];
  payments: PaymentId[];
  providers: ProviderId[];
  bonusTypes: BonusTypeId[];
  /** ISO date — used for Newest sort. */
  listedAt: string;
  /** Approximate max bonus in USD — used for Bonus Value sort. */
  bonusValue: number;
};

export const mockCasinos: MockCasino[] = [
  {
    id: "nova-prime",
    slug: "nova-prime",
    rating: 4.8,
    name: { en: "Nova Prime" },
    coverLede: copy(
      "Still the cleanest all-rounder we’ve reviewed — fast withdrawals, restrained bonuses, and support that answers like a real team.",
      "仍是我们评过最干净的全能型 — 出款快、优惠克制，客服像真人团队而不是脚本。",
      "ยังเป็นคาสิโนครบเครื่องที่สะอาดที่สุดที่เราได้รีวิว — ถอนเร็ว โบนัสพอประมาณ และฝ่ายบริการที่ตอบเหมือนทีมจริง",
    ),
    badges: [
      copy("Editor's Pick", "编辑精选", "ตัวเลือกบรรณาธิการ"),
      copy("Crypto Friendly", "支持加密货币", "รองรับคริปโต"),
    ],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("100%", "$500") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.underTwoHours },
      { label: HIGHLIGHT_LABEL.games, value: { en: "3,200+" } },
    ],
    licenses: ["mga", "gibraltar"],
    payments: ["crypto", "visa", "bank"],
    providers: ["evolution", "pragmatic", "netent"],
    bonusTypes: ["welcome", "reload"],
    listedAt: "2025-11-04",
    bonusValue: 500,
  },
  {
    id: "aurelia-club",
    slug: "aurelia-club",
    rating: 4.7,
    name: { en: "Aurelia Club" },
    coverLede: copy(
      "Card withdrawals landed the same day in our tests, and the welcome offer fits on one screen. New, but payouts are already the reason to try it.",
      "我们测试中银行卡出款当天到账，迎新优惠一屏就能读完。虽然新，但出款已经是值得一试的理由。",
      "การถอนบัตรเข้าบัญชีวันเดียวกันในการทดสอบ และโบนัสต้อนรับอ่านจบในหน้าเดียว ใหม่ แต่การถอนคือเหตุผลที่ควรลอง",
    ),
    badges: [
      copy("Fast Payout", "极速出款", "ถอนเร็ว"),
      copy("New", "新上线", "ใหม่"),
    ],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("150%", "$300") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.sameDay },
      { label: HIGHLIGHT_LABEL.games, value: { en: "2,800+" } },
    ],
    licenses: ["curacao"],
    payments: ["visa", "paypal"],
    providers: ["pragmatic", "hacksaw"],
    bonusTypes: ["welcome", "free-spins"],
    listedAt: "2026-06-18",
    bonusValue: 300,
  },
  {
    id: "lumen-bet",
    slug: "lumen-bet",
    rating: 4.6,
    name: { en: "Lumen Bet" },
    badges: [copy("Trusted", "值得信赖", "น่าเชื่อถือ")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("200%", "$200") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.twentyFourToFortyEight },
      { label: HIGHLIGHT_LABEL.games, value: { en: "1,900+" } },
    ],
    licenses: ["mga"],
    payments: ["visa", "bank"],
    providers: ["netent", "playngo"],
    bonusTypes: ["welcome"],
    listedAt: "2025-08-12",
    bonusValue: 200,
  },
  {
    id: "northline",
    slug: "northline",
    rating: 4.5,
    name: { en: "Northline" },
    coverLede: copy(
      "UKGC plus Gibraltar — the kind of license that still matters if a withdrawal is delayed. Live tables are well stocked; expect to verify before the first cash-out.",
      "UKGC 加上直布罗陀 — 出款被拖时，这种牌照仍然有用。真人桌充足；第一次出金前要做好核验准备。",
      "UKGC บวกยิบรอลตาร์ — ใบอนุญาตที่ยังมีความหมายเมื่อการถอนล่าช้า โต๊ะสดมีพอ ต้องยืนยันตัวตนก่อนถอนครั้งแรก",
    ),
    badges: [copy("Live Dealer", "真人荷官", "ดีลเลอร์สด")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("100%", "$400") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.twelveToTwentyFour },
      { label: HIGHLIGHT_LABEL.games, value: { en: "2,400+" } },
    ],
    licenses: ["ukgc", "gibraltar"],
    payments: ["visa", "paypal", "bank"],
    providers: ["evolution", "netent"],
    bonusTypes: ["welcome", "no-deposit"],
    listedAt: "2025-03-22",
    bonusValue: 400,
  },
  {
    id: "velvet-odds",
    slug: "velvet-odds",
    rating: 4.4,
    name: { en: "Velvet Odds" },
    badges: [copy("Sports + Casino", "体育 + 娱乐场", "กีฬา + คาสิโน")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("125%", "$350") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.underSixHours },
      { label: HIGHLIGHT_LABEL.games, value: { en: "2,100+" } },
    ],
    licenses: ["mga", "curacao"],
    payments: ["crypto", "visa", "paypal"],
    providers: ["pragmatic", "evolution"],
    bonusTypes: ["welcome", "reload"],
    listedAt: "2025-12-09",
    bonusValue: 350,
  },
  {
    id: "arcadia-play",
    slug: "arcadia-play",
    rating: 4.3,
    name: { en: "Arcadia Play" },
    badges: [copy("Mobile First", "手机优先", "มือถือเป็นหลัก")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("100%", "$250") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.oneToTwoDays },
      { label: HIGHLIGHT_LABEL.games, value: { en: "1,600+" } },
    ],
    licenses: ["curacao"],
    payments: ["crypto", "visa"],
    providers: ["hacksaw", "playngo"],
    bonusTypes: ["free-spins"],
    listedAt: "2026-01-30",
    bonusValue: 250,
  },
  {
    id: "meridian-house",
    slug: "meridian-house",
    rating: 4.2,
    name: { en: "Meridian House" },
    badges: [copy("High Limits", "高限额", "วงเงินสูง")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("50%", "$1,000") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.sameDay },
      { label: HIGHLIGHT_LABEL.games, value: { en: "2,600+" } },
    ],
    licenses: ["gibraltar", "ukgc"],
    payments: ["visa", "bank"],
    providers: ["evolution", "netent", "playngo"],
    bonusTypes: ["welcome"],
    listedAt: "2024-11-15",
    bonusValue: 1000,
  },
  {
    id: "opal-desk",
    slug: "opal-desk",
    rating: 4.1,
    name: { en: "Opal Desk" },
    badges: [copy("Crypto Friendly", "支持加密货币", "รองรับคริปโต")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("100%", "$150") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.underOneHour },
      { label: HIGHLIGHT_LABEL.games, value: { en: "1,400+" } },
    ],
    licenses: ["curacao"],
    payments: ["crypto"],
    providers: ["hacksaw", "pragmatic"],
    bonusTypes: ["no-deposit", "free-spins"],
    listedAt: "2026-04-02",
    bonusValue: 150,
  },
  {
    id: "sable-room",
    slug: "sable-room",
    rating: 4.0,
    name: { en: "Sable Room" },
    coverLede: copy(
      "You come for Evolution live tables and stay if withdrawals work. They did — PayPal and bank both returned the same day after the first document check.",
      "你为 Evolution 真人桌而来，出款靠谱才会留下。我们测过：PayPal 和银行转账在首次核验后都是当天到账。",
      "มาเพราะโต๊ะสด Evolution และอยู่ต่อถ้าถอนได้จริง — ได้จริง PayPal และโอนธนาคารกลับวันเดียวกันหลังตรวจเอกสารครั้งแรก",
    ),
    badges: [copy("Live Tables", "真人桌", "โต๊ะสด")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("75%", "$600") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.sameDay },
      { label: HIGHLIGHT_LABEL.games, value: { en: "1,200+" } },
    ],
    licenses: ["kahnawake"],
    payments: ["paypal", "bank"],
    providers: ["evolution"],
    bonusTypes: ["welcome", "reload"],
    listedAt: "2025-06-01",
    bonusValue: 600,
  },
  {
    id: "cinder-park",
    slug: "cinder-park",
    rating: 3.9,
    name: { en: "Cinder Park" },
    badges: [copy("No Deposit", "无需存款", "ไม่ต้องฝาก")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.noDeposit("$25") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.twoToThreeDays },
      { label: HIGHLIGHT_LABEL.games, value: { en: "980+" } },
    ],
    licenses: ["curacao"],
    payments: ["visa", "paypal"],
    providers: ["pragmatic", "playngo"],
    bonusTypes: ["no-deposit", "welcome"],
    listedAt: "2026-07-11",
    bonusValue: 25,
  },
  {
    id: "harbor-line",
    slug: "harbor-line",
    rating: 3.8,
    name: { en: "Harbor Line" },
    badges: [copy("UK Licensed", "英国牌照", "ใบอนุญาตสหราชอาณาจักร")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("100%", "$200") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.twentyFourHours },
      { label: HIGHLIGHT_LABEL.games, value: { en: "1,100+" } },
    ],
    licenses: ["ukgc"],
    payments: ["visa", "bank"],
    providers: ["netent", "evolution"],
    bonusTypes: ["welcome", "free-spins"],
    listedAt: "2025-01-19",
    bonusValue: 200,
  },
  {
    id: "quartz-bet",
    slug: "quartz-bet",
    rating: 3.7,
    name: { en: "Quartz Bet" },
    badges: [copy("Slots Focus", "老虎机为主", "เน้นสล็อต")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.freeSpins("50") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.oneToTwoDays },
      { label: HIGHLIGHT_LABEL.games, value: { en: "2,000+" } },
    ],
    licenses: ["mga"],
    payments: ["crypto", "paypal"],
    providers: ["hacksaw", "pragmatic", "playngo"],
    bonusTypes: ["free-spins"],
    listedAt: "2026-03-08",
    bonusValue: 80,
  },
  {
    id: "atlas-table",
    slug: "atlas-table",
    rating: 3.6,
    name: { en: "Atlas Table" },
    badges: [copy("Bank Transfer", "银行转账", "โอนธนาคาร")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("100%", "$750") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.threeToFiveDays },
      { label: HIGHLIGHT_LABEL.games, value: { en: "860+" } },
    ],
    licenses: ["gibraltar"],
    payments: ["bank"],
    providers: ["netent"],
    bonusTypes: ["welcome", "reload"],
    listedAt: "2024-09-03",
    bonusValue: 750,
  },
  {
    id: "ridge-play",
    slug: "ridge-play",
    rating: 3.5,
    name: { en: "Ridge Play" },
    badges: [copy("New", "新上线", "ใหม่")],
    highlights: [
      { label: HIGHLIGHT_LABEL.welcome, value: PHRASE.match("200%", "$100") },
      { label: HIGHLIGHT_LABEL.payout, value: PHRASE.underTwelveHours },
      { label: HIGHLIGHT_LABEL.games, value: { en: "740+" } },
    ],
    licenses: ["kahnawake", "curacao"],
    payments: ["crypto", "visa", "paypal"],
    providers: ["hacksaw"],
    bonusTypes: ["welcome", "no-deposit"],
    listedAt: "2026-08-01",
    bonusValue: 100,
  },
];
