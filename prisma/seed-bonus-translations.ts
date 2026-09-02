import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const translations = {
  "nova-prime|welcome|100% up to $500": {
    zh: {
      title: "首存匹配优惠",
      terms: "100% 最高 $500\n\n奖金需完成 30 倍流水",
    },
    th: {
      title: "โบนัสฝากครั้งแรก",
      terms: "100% สูงสุด $500\n\nต้องทำเทิร์นโบนัส 30 เท่า",
    },
  },
  "aurelia-club|reload|50% up to $250": {
    zh: {
      title: "每周再存优惠",
      terms: "50% 最高 $250\n\n奖金需完成 35 倍流水",
    },
    th: {
      title: "โบนัสเติมเงินรายสัปดาห์",
      terms: "50% สูงสุด $250\n\nต้องทำเทิร์นโบนัส 35 เท่า",
    },
  },
  "lumen-bet|cashback|10% up to $100": {
    zh: {
      title: "周末返水优惠",
      terms: "10% 最高 $100\n\n返水需完成 10 倍流水",
    },
    th: {
      title: "แคชแบ็กสุดสัปดาห์",
      terms: "10% สูงสุด $100\n\nต้องทำเทิร์นแคชแบ็ก 10 เท่า",
    },
  },
  "northline|welcome|$400 match": {
    zh: {
      title: "真人荷官迎新优惠",
      terms: "$400 匹配优惠\n\n奖金需完成 35 倍流水",
    },
    th: {
      title: "โบนัสต้อนรับดีลเลอร์สด",
      terms: "แมตช์ $400\n\nต้องทำเทิร์นโบนัส 35 เท่า",
    },
  },
  "velvet-odds|welcome|125% up to $350": {
    zh: {
      title: "体育 + 娱乐场匹配优惠",
      terms: "125% 最高 $350\n\n奖金需完成 30 倍流水",
    },
    th: {
      title: "โบนัสแมตช์กีฬา + คาสิโน",
      terms: "125% สูงสุด $350\n\nต้องทำเทิร์นโบนัส 30 เท่า",
    },
  },
  "meridian-house|welcome|50% up to $1,000": {
    zh: {
      title: "高额玩家礼包",
      terms: "50% 最高 $1,000\n\n奖金需完成 25 倍流水",
    },
    th: {
      title: "แพ็กเกจสำหรับผู้เล่นเดิมพันสูง",
      terms: "50% สูงสุด $1,000\n\nต้องทำเทิร์นโบนัส 25 เท่า",
    },
  },
  "opal-desk|no-deposit|$20 no deposit": {
    zh: {
      title: "加密货币无存款彩金",
      terms: "$20 无需存款\n\n奖金需完成 35 倍流水",
    },
    th: {
      title: "เครดิตฟรีคริปโตไม่ต้องฝาก",
      terms: "$20 ไม่ต้องฝาก\n\nต้องทำเทิร์นโบนัส 35 เท่า",
    },
  },
  "arcadia-play|free-spins|80 free spins": {
    zh: {
      title: "手机免费旋转",
      terms: "80 次免费旋转\n\n奖金需完成 40 倍流水",
    },
    th: {
      title: "ฟรีสปินบนมือถือ",
      terms: "80 ฟรีสปิน\n\nต้องทำเทิร์นเงินรางวัล 40 เท่า",
    },
  },
  "cinder-park|no-deposit|$25 no deposit": {
    zh: {
      title: "无存款试玩优惠",
      terms: "$25 无需存款\n\n奖金需完成 40 倍流水",
    },
    th: {
      title: "โบนัสทดลองเล่นไม่ต้องฝาก",
      terms: "$25 ไม่ต้องฝาก\n\nต้องทำเทิร์นโบนัส 40 เท่า",
    },
  },
  "quartz-bet|free-spins|50 free spins": {
    zh: {
      title: "老虎机迎新免费旋转",
      terms: "50 次免费旋转\n\n奖金需完成 40 倍流水",
    },
    th: {
      title: "ฟรีสปินต้อนรับสล็อต",
      terms: "50 ฟรีสปิน\n\nต้องทำเทิร์นเงินรางวัล 40 เท่า",
    },
  },
  "sable-room|reload|40% up to $200": {
    zh: {
      title: "真人桌再存优惠",
      terms: "40% 最高 $200\n\n奖金需完成 30 倍流水",
    },
    th: {
      title: "โบนัสเติมเงินโต๊ะสด",
      terms: "40% สูงสุด $200\n\nต้องทำเทิร์นโบนัส 30 เท่า",
    },
  },
  "harbor-line|free-spins|30 free spins": {
    zh: {
      title: "英国免费旋转",
      terms: "30 次免费旋转\n\n奖金需完成 35 倍流水",
    },
    th: {
      title: "ฟรีสปินสำหรับสหราชอาณาจักร",
      terms: "30 ฟรีสปิน\n\nต้องทำเทิร์นเงินรางวัล 35 เท่า",
    },
  },
  "atlas-table|welcome|100% up to $750": {
    zh: {
      title: "银行转账迎新优惠",
      terms: "100% 最高 $750\n\n奖金需完成 30 倍流水",
    },
    th: {
      title: "โบนัสต้อนรับโอนผ่านธนาคาร",
      terms: "100% สูงสุด $750\n\nต้องทำเทิร์นโบนัส 30 เท่า",
    },
  },
  "ridge-play|welcome|200% up to $100": {
    zh: {
      title: "上线迎新优惠",
      terms: "200% 最高 $100\n\n奖金需完成 40 倍流水",
    },
    th: {
      title: "โบนัสต้อนรับช่วงเปิดตัว",
      terms: "200% สูงสุด $100\n\nต้องทำเทิร์นโบนัส 40 เท่า",
    },
  },
  "velvet-odds|cashback|12% up to $150": {
    zh: {
      title: "周中返水优惠",
      terms: "12% 最高 $150\n\n返水需完成 8 倍流水",
    },
    th: {
      title: "แคชแบ็กกลางสัปดาห์",
      terms: "12% สูงสุด $150\n\nต้องทำเทิร์นแคชแบ็ก 8 เท่า",
    },
  },
} as const;

type Locale = keyof (typeof translations)[keyof typeof translations];

function keyFor(bonus: {
  type: string;
  amount: string | null;
  casino: { slug: string };
}) {
  return `${bonus.casino.slug}|${bonus.type}|${bonus.amount ?? ""}`;
}

async function main() {
  const bonuses = await prisma.bonus.findMany({
    include: { casino: { select: { slug: true } } },
    orderBy: { createdAt: "asc" },
  });

  let seeded = 0;
  const skipped: string[] = [];

  for (const bonus of bonuses) {
    const key = keyFor(bonus);
    const data = translations[key as keyof typeof translations];

    if (!data) {
      skipped.push(key);
      continue;
    }

    for (const locale of Object.keys(data) as Locale[]) {
      await prisma.bonusTranslation.upsert({
        where: {
          bonusId_locale: {
            bonusId: bonus.id,
            locale,
          },
        },
        update: {
          title: data[locale].title,
          terms: data[locale].terms,
        },
        create: {
          bonusId: bonus.id,
          locale,
          title: data[locale].title,
          terms: data[locale].terms,
        },
      });

      seeded += 1;
    }
  }

  console.log(`Seeded ${seeded} zh/th bonus translations.`);

  if (skipped.length > 0) {
    console.log(`Skipped ${skipped.length} unmatched bonuses:`);
    for (const key of skipped) {
      console.log(`- ${key}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
