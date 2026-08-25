import {
  copy,
  localize,
  type LocalizedText,
  type MockCasino,
} from "@/data/mock-casinos";

export type BestCategory = {
  slug: string;
  title: LocalizedText;
  /** One-line blurb for cards and the homepage grid. */
  summary: LocalizedText;
  /** Editorial intro used on the category page. */
  description: LocalizedText;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  /** Matches `highlight.label.en` when featuring a single stat on the rank row. */
  highlightLabelEn: string;
  methodology: LocalizedText[];
  matches: (casino: MockCasino) => boolean;
};

function highlightValue(casino: MockCasino, labelEn: string): string {
  return (
    casino.highlights.find((row) => row.label.en === labelEn)?.value.en ?? ""
  );
}

function hasBadge(casino: MockCasino, pattern: RegExp): boolean {
  return casino.badges.some((badge) => pattern.test(badge.en));
}

export const bestCategories: BestCategory[] = [
  {
    slug: "crypto-casinos",
    title: copy("Best Crypto Casinos", "最佳加密货币娱乐场", "คาสิโนคริปโตที่ดีที่สุด"),
    summary: copy(
      "Operators with strong digital-asset support and fast settlement.",
      "数字资产支持扎实、结算够快的运营商。",
      "ผู้ให้บริการที่รองรับสินทรัพย์ดิจิทัลจริง และเคลียร์ยอดได้เร็ว",
    ),
    description: copy(
      "Operators that actually settle in digital assets — not a Bitcoin logo parked on the cashier. Ranked by how cleanly deposits land, how quickly withdrawals clear, and whether support treats a wallet request like a real ticket.",
      "真正用数字资产结算的运营商 — 不是收银台贴个比特币图标。按存款是否干净到账、出款是否按时、客服是否把钱包请求当正经工单来排名。",
      "ผู้ให้บริการที่เคลียร์ด้วยสินทรัพย์ดิจิทัลจริง — ไม่ใช่แค่โลโก้บิตคอยน์ที่หน้าแคชเชียร์ จัดอันดับจากความเรียบของการฝาก ความเร็วในการถอน และว่าฝ่ายบริการรับเรื่องวอลเล็ตเหมือนตั๋วจริงหรือไม่",
    ),
    seoTitle: copy("Best Crypto Casinos 2026", "2026 最佳加密货币娱乐场", "คาสิโนคริปโตที่ดีที่สุด 2026"),
    seoDescription: copy(
      "Independent ranking of crypto-friendly casinos. We score settlement speed, coin support, and whether withdrawals clear without a runaround.",
      "独立的加密友好娱乐场排名。我们看结算速度、币种支持，以及出款会不会被绕圈子。",
      "อันดับอิสระของคาสิโนที่รองรับคริปโต เราให้คะแนนความเร็วในการเคลียร์ การรองรับเหรียญ และการถอนที่ไม่ถูกปัดไปมา",
    ),
    highlightLabelEn: "Welcome bonus",
    methodology: [
      copy(
        "A crypto badge is not a ranking criterion. We only list operators we have funded and withdrawn from with at least one digital asset — usually BTC or USDT — under the same account we use for the written review.",
        "加密货币标签本身不是排名标准。上榜的都是我们用评测同一账户、至少用一种数字资产（通常是 BTC 或 USDT）完成过存款和出款的运营商。",
        "ป้ายคริปโตไม่ใช่เกณฑ์จัดอันดับ เราลงเฉพาะรายที่เราฝากและถอนด้วยสินทรัพย์ดิจิทัลอย่างน้อยหนึ่งชนิด — มักเป็น BTC หรือ USDT — ในบัญชีเดียวกับที่ใช้เขียนรีวิว",
      ),
      copy(
        "Speed outweighs coin count. A desk that clears two coins inside the window it advertises ranks above one that lists a dozen networks and stalls on the first request. Network fees and minimums are read in the cashier, not the blog.",
        "速度比币种数量更重要。两币种能在承诺时间内到账的，排在列出十几种网络却第一笔就卡住的前面。网络费和最低限额看收银台，不看博客。",
        "ความเร็วสำคัญกว่าจำนวนเหรียญ รายที่เคลียร์สองเหรียญในเวลาที่โฆษณา จะอยู่เหนือรายที่โชว์สิบกว่าเครือข่ายแล้วยืดในคำขอแรก ค่าธรรมเนียมและขั้นต่ำอ่านที่แคชเชียร์ ไม่ใช่ในบล็อก",
      ),
      copy(
        "Licensing still matters. Crypto does not replace recourse when a withdrawal is held. MGA and Gibraltar paperwork carries more weight than a Curaçao stamp paired with a Telegram cashier.",
        "牌照仍然重要。加密货币不能替代出款被扣时的追索途径。马耳他和直布罗陀的手续，比库拉索印章配 Telegram 收银台更有分量。",
        "ใบอนุญาตยังสำคัญ คริปโตทดแทนช่องทางร้องเรียนเมื่อการถอนถูกพักไม่ได้ เอกสาร MGA และยิบรอลตาร์มีน้ำหนักมากกว่าตราคูราเซาคู่กับแคชเชียร์ในเทเลแกรม",
      ),
    ],
    matches: (casino) => casino.payments.includes("crypto"),
  },
  {
    slug: "fast-payouts",
    title: copy("Fastest Payouts", "出款最快", "ถอนเร็วที่สุด"),
    summary: copy(
      "Brands that consistently clear withdrawals without drama.",
      "出款稳定、不折腾的品牌。",
      "แบรนด์ที่เคลียร์การถอนได้สม่ำเสมอ โดยไม่ดราม่า",
    ),
    description: copy(
      "Brands that clear withdrawals when they say they will. This list is ranked on cashier behaviour after the first document check — not on a homepage promise of “instant” that only applies to the deposit.",
      "说到就能出款的品牌。这份榜单看的是第一次核验之后收银台的表现 — 不是只适用于存款的首页“即时到账”。",
      "แบรนด์ที่ถอนได้ตามที่บอก รายการนี้จัดจากพฤติกรรมแคชเชียร์หลังตรวจเอกสารครั้งแรก — ไม่ใช่คำว่า “ทันที” บนหน้าแรกที่ใช้ได้แค่ตอนฝาก",
    ),
    seoTitle: copy("Fastest Casino Payouts 2026", "2026 出款最快的娱乐场", "คาสิโนถอนเร็วที่สุด 2026"),
    seoDescription: copy(
      "Casinos ranked by real withdrawal speed. Same-day cards, sub-two-hour crypto, and desks that do not invent extra checks after you request a cash-out.",
      "按真实出款速度排名。当天到账的银行卡、两小时内的加密货币，以及点了出金后不会再发明一轮核验的收银台。",
      "จัดอันดับตามความเร็วถอนจริง บัตรเข้าวันเดียวกัน คริปโตในสองชั่วโมง และแคชเชียร์ที่ไม่ invent การตรวจเพิ่มหลังคุณกดถอน",
    ),
    highlightLabelEn: "Payout speed",
    methodology: [
      copy(
        "Every operator here has paid us out. We request a withdrawal on the same account used for gameplay, after KYC is complete, and we record the time from request to funds received — not the time to “processing.”",
        "这里的每一家都给我们出过款。我们在完成 KYC 后，用游戏同一账户申请出款，记录的是从申请到资金到账的时间 — 不是进入“处理中”的时间。",
        "ทุกผู้ให้บริการที่นี่จ่ายเงินออกให้เราแล้ว เราขอถอนจากบัญชีเดียวกับที่ใช้เล่น หลัง KYC ครบ และจับเวลาจากคำขอถึงเงินเข้า — ไม่ใช่เวลาไปสถานะ “กำลังดำเนินการ”",
      ),
      copy(
        "Same-day cards and sub-two-hour crypto sit at the top. “24 hours” is acceptable when it is honest. “Pending review” that appears only after the cash-out button is pressed is a rank killer.",
        "当天银行卡和两小时内加密货币排在最前。“24 小时”只要诚实就可以接受。只有按下出金按钮才出现的“审核中”，会直接拉低名次。",
        "บัตรวันเดียวกันและคริปโตในสองชั่วโมงอยู่บนสุด “24 ชั่วโมง” รับได้ถ้าพูดตรง “รอตรวจสอบ” ที่โผล่หลังกดถอนเท่านั้น คือตัวทำลายอันดับ",
      ),
      copy(
        "A large welcome bonus does not buy a place on this list. If the cashier is slow, the bonus is a delay with extra steps. We would rather send you to a quieter offer that lands in the account the same afternoon.",
        "迎新优惠再大也买不进这份榜。收银台慢，优惠就只是多几步的拖延。我们宁愿推荐当天下午就能到账、看起来不那么热闹的优惠。",
        "โบนัสต้อนรับก้อนใหญ่ซื้อที่บนรายการนี้ไม่ได้ ถ้าแคชเชียร์ช้า โบนัสก็เป็นแค่ความล่าช้าที่เพิ่มขั้นตอน เราอยากส่งคุณไปข้อเสนอที่เงียบกว่าแต่อยู่ในบัญชีบ่ายวันเดียวกัน",
      ),
    ],
    matches: (casino) => {
      if (hasBadge(casino, /fast payout/i)) return true;
      return /under|same day/i.test(highlightValue(casino, "Payout speed"));
    },
  },
  {
    slug: "live-dealer",
    title: copy("Best Live Dealer", "最佳真人荷官", "ดีลเลอร์สดที่ดีที่สุด"),
    summary: copy(
      "Studios and tables that feel polished, fair, and well-run.",
      "工作室和牌桌干净、公平、运转正常。",
      "สตูดิโอและโต๊ะที่ดูประณีต ยุติธรรม และบริหารดี",
    ),
    description: copy(
      "Studios and tables that feel staffed, fair, and well-run — Evolution floors with real limits, not three empty blackjack seats and a laggy stream. Ranked on table depth, stream quality, and whether the lobby is still playable at peak hours.",
      "看起来有人值守、公平、运转正常的工作室和牌桌 — 有真实限红的 Evolution 场，不是三张空的二十一点桌加卡顿直播。按桌台深度、画面质量，以及高峰时段大厅是否还能玩来排名。",
      "สตูดิโอและโต๊ะที่มีคนดูแล ยุติธรรม และเดินเครื่องดี — พื้น Evolution ที่มีลิมิตจริง ไม่ใช่ที่นั่งแบล็คแจ็กว่างสามที่กับสตรีมกระตุก จัดจากความลึกของโต๊ะ คุณภาพสตรีม และว่าล็อบบี้ยังเล่นได้ในชั่วโมงเร่งหรือไม่",
    ),
    seoTitle: copy("Best Live Dealer Casinos 2026", "2026 最佳真人荷官娱乐场", "คาสิโนดีลเลอร์สดที่ดีที่สุด 2026"),
    seoDescription: copy(
      "Live dealer casinos ranked on studio quality, table depth, and whether the floor still works when the lobby is busy — not on how many empty rooms are listed.",
      "按工作室质量、桌台深度，以及大厅忙碌时场地是否还能运转来排名 — 不是看列出了多少间空房间。",
      "จัดอันดับคาสิโนดีลเลอร์สดจากคุณภาพสตูดิโอ ความลึกของโต๊ะ และว่าพื้นยังทำงานเมื่อล็อบบี้แน่น — ไม่ใช่จากจำนวนห้องว่างที่ลิสต์ไว้",
    ),
    highlightLabelEn: "Games",
    methodology: [
      copy(
        "We sit the tables. Stream stability, dealer pacing, and whether a seat is actually available at dinner-hour traffic count more than a provider logo on the homepage.",
        "我们会坐下玩。直播稳定性、荷官节奏，以及晚餐高峰是否真有座位，比首页的厂商标志更重要。",
        "เรานั่งโต๊ะจริง ความนิ่งของสตรีม จังหวะดีลเลอร์ และว่ามีที่นั่งจริงในชั่วโมงเย็น สำคัญกว่าโลโก้ผู้ให้บริการบนหน้าแรก",
      ),
      copy(
        "Evolution is the usual floor. That is not automatic first place — a thin Evolution embed with three blackjack seats ranks below a fuller lobby that also keeps NetEnt or Pragmatic in good shape beside it.",
        "Evolution 是常见的场地，但不等于自动第一。只有三张二十一点桌的薄嵌入，排在大厅更完整、旁边 NetEnt 或 Pragmatic 也保养良好的后面。",
        "Evolution เป็นพื้นปกติ แต่ไม่ได้ที่หนึ่งอัตโนมัติ — การฝัง Evolution บาง ๆ สามที่นั่งแบล็คแจ็ก อยู่ต่ำกว่าล็อบบี้ที่เต็มกว่าและยังดูแล NetEnt หรือ Pragmatic ข้าง ๆ ได้ดี",
      ),
      copy(
        "Limits and verification are part of the product. A beautiful studio that holds a withdrawal for three days after a baccarat session does not belong near the top of a live-dealer list.",
        "限红和核验也是产品的一部分。百家乐结束后出款扣三天的漂亮工作室，不该靠近真人荷官榜的顶端。",
        "ลิมิตและการยืนยันตัวตนเป็นส่วนหนึ่งของผลิตภัณฑ์ สตูดิโอสวยที่พักการถอนสามวันหลังเซสชันบาคาร่า ไม่สมควรอยู่ใกล้ยอดรายการดีลเลอร์สด",
      ),
    ],
    matches: (casino) =>
      casino.providers.includes("evolution") || hasBadge(casino, /live/i),
  },
  {
    slug: "mobile-casinos",
    title: copy("Best Mobile Casinos", "最佳手机娱乐场", "คาสิโนมือถือที่ดีที่สุด"),
    summary: copy(
      "Smooth play on phone and tablet without cutting corners.",
      "手机和平板上玩得顺，不偷工减料。",
      "เล่นลื่นบนมือถือและแท็บเล็ต โดยไม่ตัดมุม",
    ),
    description: copy(
      "Lobbies that hold up on a phone without turning into a cropped desktop. Ranked on cashier clarity, live-table usability, and whether you can deposit, play, and request a withdrawal without pinching a 1280-pixel layout.",
      "在手机上站得住的大厅，而不是被裁切的桌面版。按收银台是否清楚、真人桌是否好用，以及你能否存款、游戏、申请出款而不必捏着 1280 像素的布局来排名。",
      "ล็อบบี้ที่อยู่ได้บนมือถือโดยไม่กลายเป็นเดสก์ท็อปที่ถูกครอป จัดจากความชัดของแคชเชียร์ การใช้โต๊ะสด และว่าคุณฝาก เล่น และขอถอนได้โดยไม่ต้องหยิกเลย์เอาต์ 1280 พิกเซล",
    ),
    seoTitle: copy("Best Mobile Casinos 2026", "2026 最佳手机娱乐场", "คาสิโนมือถือที่ดีที่สุด 2026"),
    seoDescription: copy(
      "Mobile casinos ranked on real phone use: cashier, live tables, and withdrawals that work in a browser or app — not a shrunk desktop lobby.",
      "按真实手机使用来排名：收银台、真人桌，以及浏览器或 App 里能用的出款 — 不是缩小的桌面大厅。",
      "จัดอันดับคาสิโนมือถือจากการใช้โทรศัพท์จริง: แคชเชียร์ โต๊ะสด และการถอนที่ใช้ได้ในเบราว์เซอร์หรือแอป — ไม่ใช่ล็อบบี้เดสก์ท็อปที่ย่อมา",
    ),
    highlightLabelEn: "Welcome bonus",
    methodology: [
      copy(
        "We test on a phone first. If the cashier, support chat, or withdrawal form requires desktop width, the operator does not make this list — regardless of the desktop score.",
        "我们先在手机上测。如果收银台、客服聊天或出款表单必须桌面宽度，无论桌面评分多高，都不会进这份榜。",
        "เราทดสอบบนมือถือก่อน ถ้าแคชเชียร์ แชทฝ่ายบริการ หรือฟอร์มถอนต้องใช้ความกว้างเดสก์ท็อป ผู้ให้บริการจะไม่ขึ้นรายการนี้ — ไม่ว่าคะแนนเดสก์ท็อปจะเท่าไร",
      ),
      copy(
        "A dedicated app is a plus only when it does not hide worse terms or a weaker cashier. Browser play that is simply well laid out often beats a store listing that exists to send push offers.",
        "独立 App 只有在不藏更差条款或更弱收银台时才算加分。布局干净的浏览器，往往好过只为推送优惠而存在的商店应用。",
        "แอปเฉพาะทางเป็นข้อได้เปรียบเฉพาะเมื่อไม่ซ่อนเงื่อนไขแย่กว่าหรือแคชเชียร์อ่อนกว่า การเล่นในเบราว์เซอร์ที่จัดเลย์เอาต์ดี มักชนะแอปในสโตร์ที่มีไว้ส่งข้อเสนอพุช",
      ),
      copy(
        "Live tables and crypto cashiers are the usual failure points on mobile. Operators that keep both usable one-handed sit above pretty slot lobbies that collapse the moment you try to cash out.",
        "真人桌和加密收银台是手机上最常见的翻车点。两者都能单手用的运营商，排在出金一刻就垮掉的漂亮老虎机大厅前面。",
        "โต๊ะสดและแคชเชียร์คริปโตคือจุดพังปกติบนมือถือ รายที่ทำให้ทั้งสองใช้มือเดียวได้ จะอยู่เหนือล็อบบี้สล็อตสวยที่พังทันทีเมื่อคุณพยายามถอน",
      ),
    ],
    matches: (casino) =>
      hasBadge(casino, /mobile/i) ||
      (casino.rating >= 4 &&
        (casino.payments.includes("visa") ||
          casino.payments.includes("crypto"))),
  },
];

export function getBestCategory(slug: string): BestCategory | undefined {
  return bestCategories.find((category) => category.slug === slug);
}

export function getRelatedBestCategories(
  slug: string,
  count = 3,
): BestCategory[] {
  const others = bestCategories.filter((category) => category.slug !== slug);
  return others.slice(0, count);
}

export function getRankedCasinos(
  category: BestCategory,
  casinos: MockCasino[],
): MockCasino[] {
  return casinos
    .filter(category.matches)
    .sort((a, b) => b.rating - a.rating || a.slug.localeCompare(b.slug));
}

export function getFeaturedHighlight(
  casino: MockCasino,
  locale: string,
  labelEn: string,
): { label: string; value: string } {
  const row =
    casino.highlights.find((item) => item.label.en === labelEn) ??
    casino.highlights[0];

  if (!row) {
    return { label: "", value: "—" };
  }

  return {
    label: localize(row.label, locale),
    value: localize(row.value, locale),
  };
}

export function getWelcomeBonus(casino: MockCasino, locale: string): string {
  return getFeaturedHighlight(casino, locale, "Welcome bonus").value;
}
