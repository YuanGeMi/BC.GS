import { copy, PHRASE, type LocalizedText, type MockCasino } from "@/data/mock-casinos";

export type CasinoScores = {
  bonuses: number;
  gameVariety: number;
  support: number;
  payoutSpeed: number;
  trust: number;
};

export type CasinoBonusTerms = {
  title: LocalizedText;
  value: LocalizedText;
  wagering: LocalizedText;
  minDeposit: LocalizedText;
  expiry: LocalizedText;
};

export type CasinoDetailFields = {
  establishedYear: number;
  minDeposit: LocalizedText;
  withdrawalTime: LocalizedText;
  affiliateUrl: string;
  scores: CasinoScores;
  pros: LocalizedText[];
  cons: LocalizedText[];
  bonusTerms: CasinoBonusTerms;
  review: LocalizedText[];
};

export type CasinoProfile = MockCasino & CasinoDetailFields;

type DetailDraft = Omit<CasinoDetailFields, "affiliateUrl" | "withdrawalTime"> & {
  withdrawalTime?: LocalizedText;
};

const drafts: Record<string, DetailDraft> = {
  "nova-prime": {
    establishedYear: 2018,
    minDeposit: { en: "$20" },
    scores: { bonuses: 4.6, gameVariety: 4.8, support: 4.7, payoutSpeed: 4.9, trust: 4.8 },
    pros: [
      copy(
        "Withdrawals typically clear in under two hours",
        "出款通常在两小时内到账",
        "การถอนโดยทั่วไปเข้าบัญชีภายในสองชั่วโมง",
      ),
      copy(
        "Support replies like a desk, not a script",
        "客服像柜台在答，不是念脚本",
        "ฝ่ายบริการตอบเหมือนโต๊ะจริง ไม่ใช่สคริปต์",
      ),
      copy(
        "Bonus terms are readable and restrained",
        "优惠条款好读、也克制",
        "เงื่อนไขโบนัสอ่านง่ายและพอประมาณ",
      ),
    ],
    cons: [
      copy(
        "Table limits can feel tight at peak hours",
        "高峰时段桌限可能偏紧",
        "วงเงินโต๊ะอาจแน่นในช่วงเวลาเร่ง",
      ),
      copy(
        "Sportsbook is thinner than the casino side",
        "体育比娱乐场一侧薄",
        "กีฬาบางกว่าฝั่งคาสิโน",
      ),
    ],
    bonusTerms: {
      title: copy("First deposit match", "首次存款匹配", "แมตช์ฝากครั้งแรก"),
      value: PHRASE.match("100%", "$500"),
      wagering: PHRASE.wagerBonus("30"),
      minDeposit: { en: "$20" },
      expiry: PHRASE.days("30"),
    },
    review: [
      copy(
        "Nova Prime is the operator we send people to first when they want a clean, grown-up product. The lobby is quiet, the cashier is obvious, and nothing on the homepage tries to shout you into a deposit.",
        "Nova Prime 是我们会首先推荐给想要干净、成熟产品的人。大厅安静，收银台一目了然，首页也没有硬推你去存款。",
        "Nova Prime คือผู้ให้บริการที่เราแนะนำเป็นอันดับแรกเมื่ออยากได้ผลิตภัณฑ์ที่สะอาดและโตแล้ว ล็อบบี้เงียบ แคชเชียร์ชัดเจน และหน้าแรกไม่ได้ตะโกนให้ฝาก",
      ),
      copy(
        "What held up under testing was the payout desk. Crypto and cards both cleared inside the window they advertise. Support answered with names and next steps, not canned paragraphs.",
        "测试里站得住的是出款柜台。加密货币和银行卡都在他们宣传的时限内到账。客服报出名和下一步，而不是套话。",
        "สิ่งที่ผ่านการทดสอบคือโต๊ะถอน คริปโตและบัตรเข้าบัญชีภายในเวลาที่โฆษณา ฝ่ายบริการตอบด้วยชื่อและขั้นตอนถัดไป ไม่ใช่ย่อหน้าสำเร็จรูป",
      ),
      copy(
        "The welcome match is modest on purpose. Wagering sits at 30x and the game weighting is published in one place. That is rarer than it should be, and it is why the score on bonuses is high without being inflated.",
        "迎新匹配刻意克制。流水是 30x，游戏权重集中在一处公布。这本该更常见，也是优惠分高却不虚高的原因。",
        "แมตช์ต้อนรับพอประมาณโดยตั้งใจ เทิร์นอยู่ที่ 30x และน้ำหนักเกมประกาศไว้ที่เดียว ซึ่งหายากกว่าที่ควร และเป็นเหตุผลที่คะแนนโบนัสสูงโดยไม่โป่ง",
      ),
    ],
  },
  "aurelia-club": {
    establishedYear: 2024,
    minDeposit: { en: "$15" },
    scores: { bonuses: 4.5, gameVariety: 4.6, support: 4.4, payoutSpeed: 4.8, trust: 4.3 },
    pros: [
      copy(
        "Same-day payouts on cards and PayPal",
        "银行卡和 PayPal 当天出款",
        "ถอนบัตรและ PayPal ภายในวันเดียวกัน",
      ),
      copy(
        "Fresh lobby with Hacksaw and Pragmatic in good shape",
        "大厅很新，Hacksaw 和 Pragmatic 状态不错",
        "ล็อบบี้ใหม่ Hacksaw และ Pragmatic อยู่ในสภาพดี",
      ),
      copy(
        "Welcome package is easy to understand",
        "迎新套餐好懂",
        "แพ็กเกจต้อนรับเข้าใจง่าย",
      ),
    ],
    cons: [
      copy(
        "License is Curaçao only — thinner recourse if something goes wrong",
        "只有 Curaçao 牌照 — 出事时申诉途径更薄",
        "ใบอนุญาตมีแค่ Curaçao — ช่องทางเยียวยาน้อยกว่าถ้ามีปัญหา",
      ),
      copy("Still adding live tables", "真人桌还在补", "ยังเพิ่มโต๊ะสดอยู่"),
    ],
    bonusTerms: {
      title: copy("New player match", "新玩家匹配", "แมตช์ผู้เล่นใหม่"),
      value: PHRASE.match("150%", "$300"),
      wagering: PHRASE.wagerBonus("35"),
      minDeposit: { en: "$15" },
      expiry: PHRASE.days("21"),
    },
    review: [
      copy(
        "Aurelia Club is new, and it reads that way — in a good sense. The product is light, the cashier is fast, and the welcome offer is written in one screen instead of three footnotes.",
        "Aurelia Club 很新，读起来也像新的 — 是好事。产品轻，收银台快，迎新优惠一屏写完，而不是三条脚注。",
        "Aurelia Club ใหม่ และอ่านออกแบบนั้น — ในแง่ดี ผลิตภัณฑ์เบา แคชเชียร์เร็ว และข้อเสนอต้อนรับเขียนจบในหน้าเดียว ไม่ใช่สามเชิงอรรถ",
      ),
      copy(
        "Payouts were the surprise. Same-day card withdrawals landed before evening. PayPal was slower by a few hours, still inside the advertised window.",
        "出款是意外惊喜。银行卡当天出金傍晚前到账。PayPal 慢几个小时，仍在宣传时限内。",
        "การถอนคือเรื่องเซอร์ไพรส์ ถอนบัตรวันเดียวกันเข้าบัญชีก่อนเย็น PayPal ช้ากว่าไม่กี่ชั่วโมง ยังอยู่ในกรอบที่โฆษณา",
      ),
      copy(
        "Trust is the open question. A single Curaçao license is not a red flag on its own, but it is why we keep the safety score a notch below the product score until the operator has a longer public record.",
        "信任仍是未决问题。单一 Curaçao 牌照本身不是红旗，但在运营商有更长公开记录之前，安全分会比产品分低一档。",
        "ความน่าเชื่อถือยังเป็นคำถามเปิด ใบอนุญาต Curaçao ใบเดียวไม่ใช่ธงแดงในตัว แต่เป็นเหตุผลที่เราให้คะแนนความปลอดภัยต่ำกว่าคะแนนผลิตภัณฑ์จนกว่าผู้ให้บริการจะมีประวัติสาธารณะยาวขึ้น",
      ),
    ],
  },
  "lumen-bet": {
    establishedYear: 2016,
    minDeposit: { en: "$10" },
    scores: { bonuses: 4.3, gameVariety: 4.4, support: 4.6, payoutSpeed: 4.2, trust: 4.7 },
    pros: [
      copy(
        "Long track record and a Malta license",
        "经营年限长，还有马耳他牌照",
        "ประวัติยาวนานและใบอนุญาตมอลตา",
      ),
      copy(
        "Support is calm and unusually patient",
        "客服沉稳，耐心少见",
        "ฝ่ายบริการสงบและอดทนผิดปกติ",
      ),
      copy(
        "NetEnt and Play’n GO catalogues are well kept",
        "NetEnt 和 Play’n GO 目录维护得好",
        "แคตตาล็อก NetEnt และ Play’n GO ดูแลดี",
      ),
    ],
    cons: [
      copy(
        "Withdrawals take a full day or two",
        "出款要一整天到两天",
        "การถอนใช้เวลาหนึ่งถึงสองวันเต็ม",
      ),
      copy(
        "Welcome bonus is small if you deposit above $200",
        "存款超过 $200 时，迎新优惠偏小",
        "โบนัสต้อนรับเล็กถ้าฝากเกิน $200",
      ),
    ],
    bonusTerms: {
      title: copy("Welcome match", "迎新匹配", "แมตช์ต้อนรับ"),
      value: PHRASE.match("200%", "$200"),
      wagering: PHRASE.wagerBonus("40"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("14"),
    },
    review: [
      copy(
        "Lumen Bet does not try to look new. The lobby is older in places, but the operator behind it is settled — Malta licensed, consistent ownership, and a support team that does not vanish on weekends.",
        "Lumen Bet 不装新。大厅有些地方显旧，但背后的运营商很稳 — 马耳他牌照、股权稳定，客服周末也不会消失。",
        "Lumen Bet ไม่พยายามดูใหม่ ล็อบบี้เก่าในบางจุด แต่ผู้ให้บริการด้านหลังมั่นคง — ใบอนุญาตมอลตา เจ้าของต่อเนื่อง และทีมบริการที่ไม่หายไปวันหยุด",
      ),
      copy(
        "Payouts are the trade-off. We saw 24–48 hours on bank and card, which matches their own copy. If speed is your first filter, look elsewhere. If you want fewer surprises, this is a safer desk.",
        "出款是取舍。银行和银行卡我们看到 24–48 小时，和他们自己写的一致。若速度是第一筛选，另找别处。若想少些意外，这是更稳的柜台。",
        "การถอนคือข้อแลก เราเห็น 24–48 ชั่วโมงบนธนาคารและบัตร ซึ่งตรงกับข้อความของพวกเขา ถ้าความเร็วคือตัวกรองแรก ให้มองที่อื่น ถ้าอยากเซอร์ไพรส์น้อย นี่คือโต๊ะที่ปลอดภัยกว่า",
      ),
      copy(
        "The 200% match sounds loud until you notice the $200 cap. Fine for a first deposit; not a high-roller package.",
        "200% 匹配听起来很响，直到你看到 $200 上限。适合首次存款；不是高额玩家套餐。",
        "แมตช์ 200% ฟังดังจนกว่าจะเห็นเพดาน $200 ดีสำหรับฝากครั้งแรก ไม่ใช่แพ็กเกจไฮโรลเลอร์",
      ),
    ],
  },
  northline: {
    establishedYear: 2014,
    minDeposit: { en: "$20" },
    scores: { bonuses: 4.4, gameVariety: 4.6, support: 4.5, payoutSpeed: 4.3, trust: 4.8 },
    pros: [
      copy("UKGC and Gibraltar coverage", "有 UKGC 和 Gibraltar 覆盖", "ครอบคลุม UKGC และ Gibraltar"),
      copy("Strong live dealer floor", "真人荷官区扎实", "ชั้นดีลเลอร์สดแข็งแรง"),
      copy(
        "A genuine no-deposit offer for new accounts",
        "新账户有真正的免存款优惠",
        "ข้อเสนอไม่ต้องฝากจริงสำหรับบัญชีใหม่",
      ),
    ],
    cons: [
      copy(
        "Verification can take a full working day",
        "核验可能要一整工作日",
        "การยืนยันตัวตนอาจใช้เวลาหนึ่งวันทำการเต็ม",
      ),
      copy(
        "The cashier feels dated on mobile",
        "移动端收银台显得过时",
        "แคชเชียร์บนมือถือดูล้าสมัย",
      ),
    ],
    bonusTerms: {
      title: copy("Welcome + no deposit", "迎新 + 免存款", "ต้อนรับ + ไม่ต้องฝาก"),
      value: PHRASE.match("100%", "$400"),
      wagering: PHRASE.wagerBonus("35"),
      minDeposit: { en: "$20" },
      expiry: PHRASE.days("30"),
    },
    review: [
      copy(
        "Northline is built for players who want a regulated desk first and a pretty lobby second. UKGC plus Gibraltar is the kind of paperwork that actually matters when a withdrawal is delayed.",
        "Northline 面向先要合规柜台、大厅漂亮其次的玩家。UKGC 加上 Gibraltar，是出款被拖时真正有用的那类文件。",
        "Northline สร้างมาสำหรับผู้เล่นที่อยากได้โต๊ะที่ถูกกำกับก่อน ล็อบบี้สวยทีหลัง UKGC บวก Gibraltar คือเอกสารที่ยังมีความหมายเมื่อการถอนล่าช้า",
      ),
      copy(
        "The live floor is the product. Evolution tables are well stacked, and we did not see the usual bait-and-switch of three empty studios behind a banner.",
        "真人区才是产品。Evolution 桌排得满，我们没看到横幅后面只剩三间空棚那种诱饵。",
        "ชั้นสดคือผลิตภัณฑ์ โต๊ะ Evolution จัดเต็ม และเราไม่เห็นกลลวงแบบสามสตูดิโอว่างหลังแบนเนอร์",
      ),
      copy(
        "Expect to verify before the first cash-out. That slowed us by a day. After that, 12–24 hour payouts were consistent.",
        "第一次出金前要做好核验准备。这让我们慢了一天。之后 12–24 小时出款很稳定。",
        "คาดว่าต้องยืนยันตัวตนก่อนถอนครั้งแรก ทำให้เราช้าไปหนึ่งวัน หลังจากนั้นการถอน 12–24 ชั่วโมงสม่ำเสมอ",
      ),
    ],
  },
  "velvet-odds": {
    establishedYear: 2019,
    minDeposit: { en: "$15" },
    scores: { bonuses: 4.4, gameVariety: 4.5, support: 4.2, payoutSpeed: 4.6, trust: 4.4 },
    pros: [
      copy(
        "Casino and sports in one account that actually works",
        "娱乐场和体育共用一个真正能用的账户",
        "คาสิโนและกีฬาในบัญชีเดียวที่ใช้ได้จริง",
      ),
      copy("Crypto and PayPal both available", "加密货币和 PayPal 都可用", "มีทั้งคริปโตและ PayPal"),
      copy(
        "Withdrawals under six hours in our tests",
        "我们测试中出款不到六小时",
        "การถอนไม่ถึงหกชั่วโมงในการทดสอบของเรา",
      ),
    ],
    cons: [
      copy(
        "Support queues stretch on event nights",
        "赛事夜客服排队会拉长",
        "คิวบริการยืดในคืนที่มีอีเวนต์",
      ),
      copy(
        "Two licenses, uneven complaint handling",
        "两张牌照，投诉处理不均",
        "สองใบอนุญาต การจัดการร้องเรียนไม่สม่ำเสมอ",
      ),
    ],
    bonusTerms: {
      title: copy("Sports + casino match", "体育 + 娱乐场匹配", "แมตช์กีฬา + คาสิโน"),
      value: PHRASE.match("125%", "$350"),
      wagering: PHRASE.wagerBonus("30"),
      minDeposit: { en: "$15" },
      expiry: PHRASE.days("21"),
    },
    review: [
      copy(
        "Velvet Odds is one of the few dual products on this list that does not feel like a casino with a sports widget taped on. Bets and tables share a wallet, and the cashier treats both the same way.",
        "Velvet Odds 是这份名单里少数不像娱乐场贴了个体育插件的双产品。投注和桌子共用钱包，收银台两边一样对待。",
        "Velvet Odds เป็นหนึ่งในไม่กี่ผลิตภัณฑ์คู่ในรายการนี้ที่ไม่รู้สึกเหมือนคาสิโนแปะวิดเจตกีฬา เดิมพันและโต๊ะใช้กระเป๋าเงินร่วม และแคชเชียร์ปฏิบัติทั้งสองแบบเดียวกัน",
      ),
      copy(
        "Speed is a strength. Card and crypto withdrawals landed inside six hours. PayPal was close behind.",
        "速度是强项。银行卡和加密货币出款六小时内到账。PayPal 紧随其后。",
        "ความเร็วคือจุดแข็ง ถอนบัตรและคริปโตเข้าบัญชีภายในหกชั่วโมง PayPal ตามมาติดๆ",
      ),
      copy(
        "Write to support on a Saturday night in season and you will wait. That is the main reason the support score sits below the rest of the card.",
        "赛季周六晚上写信给客服，你得等。这是客服分低于卡片其余部分的主要原因。",
        "เขียนถึงฝ่ายบริการคืนวันเสาร์ในฤดูกาลแล้วคุณจะรอ นั่นคือเหตุผลหลักที่คะแนนบริการอยู่ต่ำกว่าส่วนอื่นของการ์ด",
      ),
    ],
  },
  "arcadia-play": {
    establishedYear: 2022,
    minDeposit: { en: "$10" },
    scores: { bonuses: 4.1, gameVariety: 4.2, support: 4.3, payoutSpeed: 4.0, trust: 4.1 },
    pros: [
      copy("Best mobile lobby on the list", "名单上最好的手机大厅", "ล็อบบี้มือถือที่ดีที่สุดในรายการ"),
      copy(
        "Hacksaw titles load quickly on mid-range phones",
        "Hacksaw 游戏在中端手机上加载快",
        "เกม Hacksaw โหลดเร็วบนมือถือระดับกลาง",
      ),
      copy("Low minimum deposit", "最低存款低", "ฝากขั้นต่ำต่ำ"),
    ],
    cons: [
      copy("Payouts take a day or two", "出款要一两天", "การถอนใช้เวลาหนึ่งถึงสองวัน"),
      copy(
        "Desktop site is clearly second priority",
        "桌面站明显是次要的",
        "เว็บเดสก์ท็อปชัดเจนว่าเป็นลำดับสอง",
      ),
    ],
    bonusTerms: {
      title: copy("Mobile welcome", "手机迎新", "ต้อนรับมือถือ"),
      value: PHRASE.match("100%", "$250"),
      wagering: PHRASE.wagerBonus("40"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("14"),
    },
    review: [
      copy(
        "Arcadia Play is built for a phone first. The lobby, the cashier, and live chat all sit in one thumb-reach column. On a laptop it feels thinner, which we take as an honest product choice rather than neglect.",
        "Arcadia Play 先为手机而建。大厅、收银台和在线客服都挤在一根拇指够得到的栏里。笔记本上会显得薄，我们当成诚实的产品选择，而不是疏忽。",
        "Arcadia Play สร้างเพื่อมือถือก่อน ล็อบบี้ แคชเชียร์ และแชทสดอยู่ในคอลัมน์ที่นิ้วโป้งเอื้อมถึง บนแล็ปท็อปบางลง ซึ่งเราถือเป็นการเลือกผลิตภัณฑ์ที่ซื่อสัตย์ ไม่ใช่การละเลย",
      ),
      copy(
        "Hacksaw and Play’n GO are the catalogue. If you want a deep live floor, this is not the desk. If you want slots that do not stutter on a commute, it is.",
        "目录就是 Hacksaw 和 Play’n GO。若要深的真人区，这里不是那家柜台。若要通勤时老虎机不卡，这里就是。",
        "Hacksaw และ Play’n GO คือแคตตาล็อก ถ้าอยากได้ชั้นสดลึก นี่ไม่ใช่โต๊ะนั้น ถ้าอยากได้สล็อตที่ไม่กระตุกตอนเดินทาง นี่คือ",
      ),
      copy(
        "Payouts were fine, not fast: one to two days. The free-spins welcome is the main offer, and wagering is on the stricter side.",
        "出款还行，不快：一两天。免费旋转迎新是主打，流水偏严。",
        "การถอนใช้ได้ ไม่เร็ว: หนึ่งถึงสองวัน ฟรีสปินต้อนรับคือข้อเสนอหลัก และเทิร์นค่อนข้างเข้ม",
      ),
    ],
  },
  "meridian-house": {
    establishedYear: 2012,
    minDeposit: { en: "$50" },
    scores: { bonuses: 4.0, gameVariety: 4.5, support: 4.4, payoutSpeed: 4.6, trust: 4.6 },
    pros: [
      copy("High limits that are actually honored", "高限额是真给的", "วงเงินสูงที่ให้จริง"),
      copy("Same-day withdrawals after KYC", "KYC 后当天出款", "ถอนวันเดียวกันหลัง KYC"),
      copy("Gibraltar and UK coverage", "有 Gibraltar 和英国覆盖", "ครอบคลุม Gibraltar และสหราชอาณาจักร"),
    ],
    cons: [
      copy(
        "Fifty-dollar minimum will put some players off",
        "五十美元最低存款会劝退一部分人",
        "ขั้นต่ำห้าสิบดอลลาร์จะทำให้ผู้เล่นบางคนถอย",
      ),
      copy("Welcome match is conservative", "迎新匹配偏保守", "แมตช์ต้อนรับค่อนข้างระมัดระวัง"),
    ],
    bonusTerms: {
      title: copy("High-limit match", "高限额匹配", "แมตช์วงเงินสูง"),
      value: PHRASE.match("50%", "$1,000"),
      wagering: PHRASE.wagerBonus("25"),
      minDeposit: { en: "$50" },
      expiry: PHRASE.days("30"),
    },
    review: [
      copy(
        "Meridian House is for people who already know what they want. Limits are high, the welcome match is not trying to look generous, and the cashier assumes you have done this before.",
        "Meridian House 给已经知道自己要什么的人。限额高，迎新匹配不装慷慨，收银台默认你做过这件事。",
        "Meridian House สำหรับคนที่รู้แล้วว่าต้องการอะไร วงเงินสูง แมตช์ต้อนรับไม่พยายามดูใจกว้าง และแคชเชียร์สมมติว่าคุณเคยทำมาก่อน",
      ),
      copy(
        "Once verified, same-day bank and card payouts held up. The first cash-out needed documents. After that, the desk was quiet and fast.",
        "核验后，银行和银行卡当天出款站得住。第一次出金要文件。之后柜台安静又快。",
        "เมื่อยืนยันแล้ว การถอนธนาคารและบัตรวันเดียวกันยืนได้ การถอนครั้งแรกต้องใช้เอกสาร หลังจากนั้นโต๊ะเงียบและเร็ว",
      ),
      copy(
        "The 50% match up to $1,000 is the right shape for this audience. Wagering at 25x is among the cleaner terms on the list.",
        "50% 最高 $1,000 的匹配对这批玩家形状对。25x 流水是名单里更干净的条款之一。",
        "แมตช์ 50% สูงสุด $1,000 เป็นรูปทรงที่ถูกสำหรับกลุ่มนี้ เทิร์น 25x อยู่ในเงื่อนไขที่สะอาดกว่าในรายการ",
      ),
    ],
  },
  "opal-desk": {
    establishedYear: 2021,
    minDeposit: { en: "$10" },
    scores: { bonuses: 3.9, gameVariety: 4.0, support: 4.1, payoutSpeed: 4.9, trust: 4.0 },
    pros: [
      copy("Crypto withdrawals in under an hour", "加密货币出款不到一小时", "ถอนคริปโตไม่ถึงหนึ่งชั่วโมง"),
      copy(
        "No-deposit and free-spin offers that actually credit",
        "免存款和免费旋转优惠真会到账",
        "ข้อเสนอไม่ต้องฝากและฟรีสปินที่เข้าเครดิตจริง",
      ),
      copy("Simple, uncluttered cashier", "收银台简单、不杂", "แคชเชียร์เรียบ ไม่รก"),
    ],
    cons: [
      copy("Crypto only — no cards or bank", "仅加密货币 — 没有卡或银行", "คริปโตอย่างเดียว — ไม่มีบัตรหรือธนาคาร"),
      copy("Catalogue is still slim", "目录仍然偏瘦", "แคตตาล็อกยังบาง"),
    ],
    bonusTerms: {
      title: copy("Crypto welcome", "加密货币迎新", "ต้อนรับคริปโต"),
      value: PHRASE.match("100%", "$150"),
      wagering: PHRASE.wagerBonus("35"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("10"),
    },
    review: [
      copy(
        "Opal Desk is a crypto cashier with a casino attached. If that is what you want, it is excellent. If you need a card, stop here.",
        "Opal Desk 是挂了娱乐场的加密收银台。若这就是你要的，它很好。若需要银行卡，到此为止。",
        "Opal Desk คือแคชเชียร์คริปโตที่มีคาสิโนติดมา ถ้าอย่างนั้นคือสิ่งที่ต้องการ มันยอดเยี่ยม ถ้าต้องการบัตร หยุดตรงนี้",
      ),
      copy(
        "Our test withdrawal confirmed in 41 minutes. That is the product. Everything else — lobby, live chat, bonus — is built around keeping that rail clean.",
        "我们的测试出款 41 分钟确认。这就是产品。其余 — 大厅、在线客服、优惠 — 都围着把这条通道保持干净。",
        "การถอนทดสอบของเรายืนยันใน 41 นาที นั่นคือผลิตภัณฑ์ ส่วนอื่น — ล็อบบี้ แชทสด โบนัส — สร้างรอบการรักษารางนั้นให้สะอาด",
      ),
      copy(
        "The no-deposit and free-spin offers credited without a ticket. Expiry is short, so treat them as a trial, not a plan.",
        "免存款和免费旋转优惠不用工单就到账。有效期短，当试用，不当计划。",
        "ข้อเสนอไม่ต้องฝากและฟรีสปินเข้าเครดิตโดยไม่ต้องเปิดตั๋ว หมดอายุสั้น จึงถือเป็นทดลอง ไม่ใช่แผน",
      ),
    ],
  },
  "sable-room": {
    establishedYear: 2017,
    minDeposit: { en: "$25" },
    scores: { bonuses: 4.2, gameVariety: 4.1, support: 4.3, payoutSpeed: 4.5, trust: 4.0 },
    pros: [
      copy(
        "Live tables are the whole point, and they are well run",
        "真人桌就是全部意义，而且运营得好",
        "โต๊ะสดคือจุดทั้งหมด และบริหารได้ดี",
      ),
      copy("PayPal and bank both available", "PayPal 和银行都可用", "มีทั้ง PayPal และธนาคาร"),
      copy(
        "Same-day payouts after the first review",
        "首次审核后当天出款",
        "ถอนวันเดียวกันหลังตรวจครั้งแรก",
      ),
    ],
    cons: [
      copy("Slots library is an afterthought", "老虎机库像事后补的", "คลังสล็อตเป็นของแถมทีหลัง"),
      copy(
        "Kahnawake license is less familiar to some players",
        "Kahnawake 牌照对部分玩家较陌生",
        "ใบอนุญาต Kahnawake ผู้เล่นบางคนคุ้นน้อยกว่า",
      ),
    ],
    bonusTerms: {
      title: copy("Live welcome", "真人迎新", "ต้อนรับสด"),
      value: PHRASE.match("75%", "$600"),
      wagering: PHRASE.wagerBonus("30"),
      minDeposit: { en: "$25" },
      expiry: PHRASE.days("30"),
    },
    review: [
      copy(
        "Sable Room does not pretend to be a slots destination. You come for Evolution tables, stay if the cashier behaves, and leave the rest.",
        "Sable Room 不装成老虎机目的地。你为 Evolution 桌而来，收银台靠谱就留下，其余放下。",
        "Sable Room ไม่แสร้งเป็นจุดหมายสล็อต มาเพราะโต๊ะ Evolution อยู่ต่อถ้าแคชเชียร์ประพฤติตัว และปล่อยส่วนที่เหลือ",
      ),
      copy(
        "It did behave. PayPal and bank withdrawals both returned same day after an initial document check.",
        "它确实靠谱。PayPal 和银行出款在首次文件核验后都是当天到账。",
        "มันประพฤติตัว PayPal และการถอนธนาคารกลับวันเดียวกันหลังตรวจเอกสารครั้งแรก",
      ),
      copy(
        "The 75% match is aimed at table players. Wagering is fair; contribution from live games is published and not buried.",
        "75% 匹配面向桌面玩家。流水公平；真人游戏贡献公开，没有埋。",
        "แมตช์ 75% มุ่งผู้เล่นโต๊ะ เทิร์นยุติธรรม น้ำหนักจากเกมสดประกาศไว้ ไม่ถูกฝัง",
      ),
    ],
  },
  "cinder-park": {
    establishedYear: 2023,
    minDeposit: { en: "$10" },
    scores: { bonuses: 4.0, gameVariety: 3.8, support: 3.9, payoutSpeed: 3.6, trust: 3.7 },
    pros: [
      copy(
        "A real no-deposit credit for new accounts",
        "新账户有真正的免存款额度",
        "เครดิตไม่ต้องฝากจริงสำหรับบัญชีใหม่",
      ),
      copy("Low barrier to try the lobby", "试大厅门槛低", "กำแพงต่ำในการลองล็อบบี้"),
      copy("PayPal is available from day one", "第一天就能用 PayPal", "PayPal ใช้ได้ตั้งแต่วันแรก"),
    ],
    cons: [
      copy("Withdrawals took two to three days", "出款要两三天", "การถอนใช้เวลาสองถึงสามวัน"),
      copy("Game list is short and uneven", "游戏列表短且不均", "รายการเกมสั้นและไม่สม่ำเสมอ"),
    ],
    bonusTerms: {
      title: copy("No-deposit trial", "免存款试用", "ทดลองไม่ต้องฝาก"),
      value: PHRASE.noDeposit("$25"),
      wagering: PHRASE.wagerBonus("40"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("7"),
    },
    review: [
      copy(
        "Cinder Park is on this list because the no-deposit credit actually arrived. That is a low bar, and most operators still fail it.",
        "Cinder Park 在名单上，是因为免存款额度真到了。门槛很低，多数运营商仍过不了。",
        "Cinder Park อยู่ในรายการนี้เพราะเครดิตไม่ต้องฝากมาจริง นั่นคือมาตรฐานต่ำ และผู้ให้บริการส่วนใหญ่ยังพลาด",
      ),
      copy(
        "Do not come for speed. Two to three days on payouts, and the catalogue is not deep enough to justify a long stay.",
        "别冲着速度来。出款两三天，目录也不够深，撑不起长住。",
        "อย่ามาเพราะความเร็ว ถอนสองถึงสามวัน และแคตตาล็อกไม่ลึกพอจะอยู่ยาว",
      ),
      copy(
        "Treat it as a trial desk. If the $25 clears and you like the tables, fine. It is not a first recommendation for a full bankroll.",
        "当试用柜台。若 $25 能提出来、桌子也对口味，可以。它不是整笔资金的首选。",
        "ถือเป็นโต๊ะทดลอง ถ้า $25 เคลียร์แล้วชอบโต๊ะ ก็ได้ ไม่ใช่คำแนะนำแรกสำหรับเงินทุนเต็มก้อน",
      ),
    ],
  },
  "harbor-line": {
    establishedYear: 2015,
    minDeposit: { en: "$10" },
    scores: { bonuses: 4.1, gameVariety: 4.2, support: 4.3, payoutSpeed: 4.2, trust: 4.5 },
    pros: [
      copy("UKGC licensed end to end", "全程 UKGC 牌照", "ใบอนุญาต UKGC ตลอดสาย"),
      copy("Clear safer-gambling tools", "负责任博彩工具清楚", "เครื่องมือเล่นพนันอย่างปลอดภัยชัดเจน"),
      copy("24-hour payouts once verified", "核验后 24 小时出款", "ถอน 24 ชั่วโมงเมื่อยืนยันแล้ว"),
    ],
    cons: [
      copy(
        "Offer is modest compared with offshore desks",
        "优惠比离岸柜台克制",
        "ข้อเสนอพอประมาณเมื่อเทียบกับโต๊ะนอกชายฝั่ง",
      ),
      copy("Some titles are geo-restricted", "部分游戏有地域限制", "บางเกมจำกัดตามภูมิศาสตร์"),
    ],
    bonusTerms: {
      title: copy("UK welcome", "英国迎新", "ต้อนรับสหราชอาณาจักร"),
      value: PHRASE.match("100%", "$200"),
      wagering: PHRASE.wagerBonus("35"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("30"),
    },
    review: [
      copy(
        "Harbor Line is the UK-shaped operator on this desk: quieter bonuses, clearer tools, and a license that means something if you need to escalate.",
        "Harbor Line 是这张桌上英国形状的运营商：优惠更安静，工具更清楚，需要升级时牌照有分量。",
        "Harbor Line คือผู้ให้บริการรูปสหราชอาณาจักรบนโต๊ะนี้: โบนัสเงียบกว่า เครื่องมือชัดกว่า และใบอนุญาตที่มีความหมายถ้าต้องยกระดับเรื่อง",
      ),
      copy(
        "Payouts landed in a day after verification. The welcome match is small on purpose. That is the UK market, not a failure of the product.",
        "核验后出款一天内到账。迎新匹配刻意偏小。这是英国市场，不是产品失败。",
        "การถอนเข้าบัญชีในหนึ่งวันหลังยืนยัน แมตช์ต้อนรับเล็กโดยตั้งใจ นั่นคือตลาดสหราชอาณาจักร ไม่ใช่ความล้มเหลวของผลิตภัณฑ์",
      ),
      copy(
        "If you want unrestricted catalogues and louder offers, look at the MGA or Curaçao names. If you want the paperwork, stay here.",
        "若要不受限的目录和更响的优惠，看 MGA 或 Curaçao 那些名字。若要文件，留在这里。",
        "ถ้าอยากได้แคตตาล็อกไม่จำกัดและข้อเสนอดังกว่า ให้ดูชื่อ MGA หรือ Curaçao ถ้าอยากได้เอกสาร อยู่ที่นี่",
      ),
    ],
  },
  "quartz-bet": {
    establishedYear: 2020,
    minDeposit: { en: "$10" },
    scores: { bonuses: 3.8, gameVariety: 4.4, support: 3.9, payoutSpeed: 4.0, trust: 4.2 },
    pros: [
      copy("Slots catalogue is deep and current", "老虎机目录深且新", "แคตตาล็อกสล็อตลึกและทันสมัย"),
      copy("Malta license", "马耳他牌照", "ใบอนุญาตมอลตา"),
      copy("Crypto and PayPal both work", "加密货币和 PayPal 都能用", "คริปโตและ PayPal ใช้ได้ทั้งคู่"),
    ],
    cons: [
      copy(
        "The welcome is spins only — no cash match",
        "迎新只有旋转 — 没有现金匹配",
        "ต้อนรับมีแค่สปิน — ไม่มีแมตช์เงินสด",
      ),
      copy(
        "Live chat is slower than the lobby suggests",
        "在线客服比大厅看起来慢",
        "แชทสดช้ากว่าที่ล็อบบี้ออกจะบอก",
      ),
    ],
    bonusTerms: {
      title: copy("Spins welcome", "旋转迎新", "ต้อนรับสปิน"),
      value: PHRASE.freeSpins("50"),
      wagering: PHRASE.wagerWinnings("40"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("7"),
    },
    review: [
      copy(
        "Quartz Bet is a slots desk. Hacksaw, Pragmatic, and Play’n GO are stocked like a shop that knows its customers. Live tables exist; they are not the reason to open an account.",
        "Quartz Bet 是老虎机柜台。Hacksaw、Pragmatic 和 Play’n GO 备货像懂客人的店。真人桌有，但不是开户的理由。",
        "Quartz Bet คือโต๊ะสล็อต Hacksaw, Pragmatic และ Play’n GO สต็อกเหมือนร้านที่รู้จักลูกค้า โต๊ะสดมีอยู่ แต่ไม่ใช่เหตุผลเปิดบัญชี",
      ),
      copy(
        "The welcome is fifty spins. Winnings sit behind 40x. Fine as a taste, poor as a bankroll plan.",
        "迎新是五十次旋转。奖金后面是 40x。当尝尝可以，当资金计划不行。",
        "ต้อนรับคือห้าสิบสปิน เงินรางวัลอยู่หลัง 40x ดีในฐานะชิม ไม่ดีในฐานะแผนเงินทุน",
      ),
      copy(
        "Malta licensing and a mixed cashier (crypto plus PayPal) keep the trust score above the support score. Chat was polite and slow.",
        "马耳他牌照加上混合收银台（加密货币加 PayPal）让信任分高于客服分。聊天礼貌但慢。",
        "ใบอนุญาตมอลตาและแคชเชียร์ผสม (คริปโตบวก PayPal) ทำให้คะแนนความน่าเชื่อถือสูงกว่าคะแนนบริการ แชทสุภาพและช้า",
      ),
    ],
  },
  "atlas-table": {
    establishedYear: 2013,
    minDeposit: { en: "$30" },
    scores: { bonuses: 4.3, gameVariety: 3.7, support: 4.2, payoutSpeed: 3.4, trust: 4.4 },
    pros: [
      copy(
        "Bank transfer is first-class, not a leftover",
        "银行转账是一等舱，不是边角料",
        "โอนธนาคารเป็นชั้นหนึ่ง ไม่ใช่ของเหลือ",
      ),
      copy(
        "Generous match if you can wait on payouts",
        "若能等出款，匹配很慷慨",
        "แมตช์ใจกว้างถ้าคุณรอการถอนได้",
      ),
      copy("Gibraltar licensed", "Gibraltar 牌照", "ใบอนุญาต Gibraltar"),
    ],
    cons: [
      copy("Withdrawals took three to five days", "出款要三到五天", "การถอนใช้เวลาสามถึงห้าวัน"),
      copy("NetEnt-heavy lobby, little else", "大厅偏 NetEnt，其余很少", "ล็อบบี้เน้น NetEnt นอกนั้นน้อย"),
    ],
    bonusTerms: {
      title: copy("Bank welcome", "银行迎新", "ต้อนรับธนาคาร"),
      value: PHRASE.match("100%", "$750"),
      wagering: PHRASE.wagerBonus("30"),
      minDeposit: { en: "$30" },
      expiry: PHRASE.days("30"),
    },
    review: [
      copy(
        "Atlas Table is a bank-transfer operator in a card world. If that is your rail, the cashier is unusually careful with it. If you want instant, look at Opal or Nova.",
        "Atlas Table 是卡世界里的银行转账运营商。若那是你的通道，收银台对它格外仔细。若要即时，看 Opal 或 Nova。",
        "Atlas Table คือผู้ให้บริการโอนธนาคารในโลกของบัตร ถ้านั่นคือรางของคุณ แคชเชียร์ระมัดระวังกับมันผิดปกติ ถ้าอยากได้ทันที ให้ดู Opal หรือ Nova",
      ),
      copy(
        "The $750 match is the headline. Wagering is reasonable. The wait is the cost: three to five days on the way out in our tests.",
        "$750 匹配是头条。流水合理。等待是代价：我们测试里出去要三到五天。",
        "แมตช์ $750 คือพาดหัว เทิร์นสมเหตุสมผล การรอคือต้นทุน: สามถึงห้าวันขาออกในการทดสอบของเรา",
      ),
      copy(
        "The lobby is NetEnt and not much else. Come for the cashier, not the catalogue.",
        "大厅是 NetEnt，其余不多。冲收银台来，别冲目录。",
        "ล็อบบี้คือ NetEnt และไม่มากไปกว่านั้น มาเพราะแคชเชียร์ ไม่ใช่แคตตาล็อก",
      ),
    ],
  },
  "ridge-play": {
    establishedYear: 2026,
    minDeposit: { en: "$10" },
    scores: { bonuses: 3.7, gameVariety: 3.6, support: 3.8, payoutSpeed: 4.3, trust: 3.5 },
    pros: [
      copy(
        "New, and payouts were already under twelve hours",
        "新，出款已经不到十二小时",
        "ใหม่ และการถอนไม่ถึงสิบสองชั่วโมงแล้ว",
      ),
      copy(
        "Crypto, cards, and PayPal from launch",
        "上线就有加密货币、银行卡和 PayPal",
        "คริปโต บัตร และ PayPal ตั้งแต่เปิดตัว",
      ),
      copy("A no-deposit credit for testers", "给试用者的免存款额度", "เครดิตไม่ต้องฝากสำหรับผู้ทดลอง"),
    ],
    cons: [
      copy("Too new for a full trust score", "太新，给不满信任分", "ใหม่เกินไปสำหรับคะแนนความน่าเชื่อถือเต็ม"),
      copy(
        "Hacksaw-only catalogue feels thin",
        "只有 Hacksaw 的目录显得薄",
        "แคตตาล็อกมีแต่ Hacksaw รู้สึกบาง",
      ),
    ],
    bonusTerms: {
      title: copy("Launch welcome", "上线迎新", "ต้อนรับเปิดตัว"),
      value: PHRASE.match("200%", "$100"),
      wagering: PHRASE.wagerBonus("40"),
      minDeposit: { en: "$10" },
      expiry: PHRASE.days("10"),
    },
    review: [
      copy(
        "Ridge Play launched this year. We listed it because the cashier already works — not because the catalogue is ready.",
        "Ridge Play 今年上线。我们列它是因为收银台已经能用 — 不是因为目录准备好了。",
        "Ridge Play เปิดตัวปีนี้ เราใส่ไว้เพราะแคชเชียร์ใช้ได้แล้ว — ไม่ใช่เพราะแคตตาล็อกพร้อม",
      ),
      copy(
        "A 200% match on a $100 cap is a marketing line. Wagering is 40x and the expiry is short. The no-deposit credit is the more honest way in.",
        "$100 上限的 200% 匹配是营销话术。流水 40x，有效期短。免存款额度是更诚实的入口。",
        "แมตช์ 200% บนเพดาน $100 คือประโยคการตลาด เทิร์น 40x และหมดอายุสั้น เครดิตไม่ต้องฝากคือทางเข้าที่ซื่อกว่า",
      ),
      copy(
        "Trust stays conservative until there is a year of public payout history. Come back later if you want a finished product.",
        "在有一年公开出款记录之前，信任分保持保守。若要成品，稍后再来。",
        "ความน่าเชื่อถือยังระมัดระวังจนกว่าจะมีประวัติถอนสาธารณะหนึ่งปี กลับมาทีหลังถ้าอยากได้ผลิตภัณฑ์ที่เสร็จแล้ว",
      ),
    ],
  },
};

function withdrawalFrom(casino: MockCasino): LocalizedText {
  const row = casino.highlights[1];
  return row?.value ?? PHRASE.oneToTwoDays;
}

export function toCasinoProfile(casino: MockCasino): CasinoProfile {
  const extra = drafts[casino.slug];

  if (!extra) {
    throw new Error(`Missing detail draft for ${casino.slug}`);
  }

  return {
    ...casino,
    ...extra,
    withdrawalTime: extra.withdrawalTime ?? withdrawalFrom(casino),
    affiliateUrl: `https://example.com/visit/${casino.slug}`,
  };
}

export function getCasinoProfile(slug: string, casinos: MockCasino[]): CasinoProfile | undefined {
  const casino = casinos.find((item) => item.slug === slug);
  return casino ? toCasinoProfile(casino) : undefined;
}

export function getRelatedCasinos(
  casino: MockCasino,
  casinos: MockCasino[],
  count = 4,
): MockCasino[] {
  const sameLicense = casinos.filter(
    (item) =>
      item.id !== casino.id &&
      item.licenses.some((license) => casino.licenses.includes(license)),
  );

  const pool = sameLicense.length >= count
    ? sameLicense
    : casinos.filter((item) => item.id !== casino.id);

  return [...pool]
    .sort((a, b) => Math.abs(a.rating - casino.rating) - Math.abs(b.rating - casino.rating))
    .slice(0, count);
}
