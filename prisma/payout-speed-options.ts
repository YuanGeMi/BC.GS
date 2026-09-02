export const payoutSpeedOptions = [
  {
    slug: "under-1-hour",
    sortOrder: 10,
    labels: {
      en: "Under 1 hour",
      zh: "低于1小时",
      th: "น้อยกว่า 1 ชั่วโมง",
    },
  },
  {
    slug: "under-2-hours",
    sortOrder: 20,
    labels: {
      en: "Under 2 hours",
      zh: "低于2小时",
      th: "น้อยกว่า 2 ชั่วโมง",
    },
  },
  {
    slug: "same-day",
    sortOrder: 30,
    labels: {
      en: "Same day",
      zh: "当天",
      th: "ภายในวันเดียวกัน",
    },
  },
  {
    slug: "under-6-hours",
    sortOrder: 40,
    labels: {
      en: "Under 6 hours",
      zh: "低于6小时",
      th: "น้อยกว่า 6 ชั่วโมง",
    },
  },
  {
    slug: "12-24-hours",
    sortOrder: 50,
    labels: {
      en: "12–24 hours",
      zh: "12–24小时",
      th: "12–24 ชั่วโมง",
    },
  },
  {
    slug: "24-48-hours",
    sortOrder: 60,
    labels: {
      en: "24–48 hours",
      zh: "24–48小时",
      th: "24–48 ชั่วโมง",
    },
  },
  {
    slug: "1-2-days",
    sortOrder: 70,
    labels: {
      en: "1–2 days",
      zh: "1–2天",
      th: "1–2 วัน",
    },
  },
] as const;

export const payoutSpeedSlugByWithdrawalTime: Record<string, string> = {
  "Under 1 hour": "under-1-hour",
  "Under 2 hours": "under-2-hours",
  "Same day": "same-day",
  "Under 6 hours": "under-6-hours",
  "Under 12 hours": "12-24-hours",
  "12–24 hours": "12-24-hours",
  "24 hours": "12-24-hours",
  "24–48 hours": "24-48-hours",
  "1–2 days": "1-2-days",
  "2–3 days": "1-2-days",
  "3–5 days": "1-2-days",
};
