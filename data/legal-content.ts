import { copy, type LocalizedText } from "@/data/mock-casinos";

export type LegalSlug = "privacy" | "terms" | "responsible-gambling";

export type LegalLink = {
  label: LocalizedText;
  href: string;
};

export type LegalSection = {
  id: string;
  heading: LocalizedText;
  paragraphs: LocalizedText[];
  list?: LocalizedText[];
  links?: LegalLink[];
};

export type LegalDocument = {
  slug: LegalSlug;
  eyebrow: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  lastUpdated: string;
  seoTitle: LocalizedText;
  seoDescription: LocalizedText;
  sections: LegalSection[];
};

const LAST_UPDATED = "2026-08-23";

export const legalDocuments: Record<LegalSlug, LegalDocument> = {
  privacy: {
    slug: "privacy",
    eyebrow: copy("Legal", "法律", "กฎหมาย"),
    title: copy("Privacy Policy", "隐私政策", "นโยบายความเป็นส่วนตัว"),
    description: copy(
      "How BC.GS collects, uses, and shares information when you visit this independent review site.",
      "当你访问这家独立评测网站时，BC.GS 如何收集、使用和分享信息。",
      "BC.GS เก็บ ใช้ และแบ่งปันข้อมูลอย่างไรเมื่อคุณเข้าชมเว็บไซต์รีวิวอิสระแห่งนี้",
    ),
    lastUpdated: LAST_UPDATED,
    seoTitle: copy("Privacy Policy", "隐私政策", "นโยบายความเป็นส่วนตัว"),
    seoDescription: copy(
      "Privacy policy for BC.GS — what we collect, how cookies and affiliate links work, and how to contact us about your data.",
      "BC.GS 隐私政策 — 我们收集什么、Cookie 与联盟链接如何运作，以及如何就你的数据联系我们。",
      "นโยบายความเป็นส่วนตัวของ BC.GS — เราเก็บอะไร Cookie และลิงก์พันธมิตรทำงานอย่างไร และจะติดต่อเรื่องข้อมูลของคุณได้อย่างไร",
    ),
    sections: [
      {
        id: "who-we-are",
        heading: copy("Who we are", "我们是谁", "เราคือใคร"),
        paragraphs: [
          copy(
            "BC.GS is an independent editorial website that publishes reviews, ratings, and comparisons of betting and casino operators. We are not a gambling operator, we do not take bets, and we do not hold player funds.",
            "BC.GS 是一家独立编辑网站，发布博彩与娱乐场运营商的评测、评分和对比。我们不是博彩运营商，不接受投注，也不保管玩家资金。",
            "BC.GS เป็นเว็บไซต์บรรณาธิการอิสระที่เผยแพร่รีวิว คะแนน และการเปรียบเทียบผู้ให้บริการเดิมพันและคาสิโน เราไม่ใช่ผู้ให้บริการพนัน ไม่รับเดิมพัน และไม่ถือเงินของผู้เล่น",
          ),
          copy(
            "This policy explains what information we process when you browse the site, use comparison tools, or follow an outbound link. It is placeholder wording for product development and should be reviewed by counsel before production use.",
            "本政策说明你浏览网站、使用对比工具或点击外链时，我们会处理哪些信息。当前为产品开发阶段的占位文案，正式上线前应由律师审阅。",
            "นโยบายนี้อธิบายว่าเราประมวลผลข้อมูลอะไรเมื่อคุณท่องเว็บ ใช้เครื่องมือเปรียบเทียบ หรือคลิกลิงก์ออกไป ข้อความนี้เป็นฉบับชั่วคราวสำหรับช่วงพัฒนาผลิตภัณฑ์ และควรให้ทนายความตรวจก่อนใช้งานจริง",
          ),
        ],
      },
      {
        id: "data-we-collect",
        heading: copy("Information we collect", "我们收集的信息", "ข้อมูลที่เราเก็บ"),
        paragraphs: [
          copy(
            "We collect as little as we need to run the site and understand how it is used. Depending on how you arrive and what you do, that may include:",
            "我们只收集维持网站运转、了解使用情况所需的最少信息。取决于你如何到来、做了什么，可能包括：",
            "เราเก็บให้น้อยที่สุดเท่าที่จำเป็นเพื่อให้เว็บไซต์ทำงาน และเพื่อเข้าใจการใช้งาน ขึ้นกับว่าคุณเข้ามาอย่างไรและทำอะไร อาจรวมถึง:",
          ),
        ],
        list: [
          copy(
            "Technical data such as IP address, browser type, device, language, and referring URL.",
            "技术数据，例如 IP 地址、浏览器类型、设备、语言和来源网址。",
            "ข้อมูลเทคนิค เช่น ที่อยู่ IP ประเภทเบราว์เซอร์ อุปกรณ์ ภาษา และ URL ที่อ้างอิงมา",
          ),
          copy(
            "Usage data such as pages viewed, links clicked, and time spent on a page.",
            "使用数据，例如浏览过的页面、点击的链接，以及在某页停留的时间。",
            "ข้อมูลการใช้งาน เช่น หน้าที่ดู ลิงก์ที่คลิก และเวลาที่ใช้ในแต่ละหน้า",
          ),
          copy(
            "Preference data stored in your browser, for example layout settings you choose on this site.",
            "存在浏览器里的偏好数据，例如你在本站选择的版式设置。",
            "ข้อมูลการตั้งค่าที่เก็บในเบราว์เซอร์ เช่น รูปแบบเลย์เอาต์ที่คุณเลือกบนเว็บนี้",
          ),
          copy(
            "Information you send us if you email a privacy or editorial inquiry.",
            "你通过邮件发送的隐私或编辑问询内容。",
            "ข้อมูลที่คุณส่งมาหากอีเมลสอบถามเรื่องความเป็นส่วนตัวหรือบรรณาธิการ",
          ),
        ],
      },
      {
        id: "cookies",
        heading: copy("Cookies and analytics", "Cookie 与分析", "Cookie และการวิเคราะห์"),
        paragraphs: [
          copy(
            "We may use first-party cookies or similar storage to remember settings and keep the site working. We may also use analytics tools to see which reviews are read and where people drop off. Those tools can set their own cookies.",
            "我们可能使用第一方 Cookie 或类似存储来记住设置、保证网站正常运行。也可能使用分析工具，了解哪些评测被阅读、读者在何处离开。这些工具可能自行设置 Cookie。",
            "เราอาจใช้คุกกี้ฝั่งเราเองหรือที่เก็บข้อมูลคล้ายกัน เพื่อจำการตั้งค่าและให้เว็บทำงานได้ อาจใช้เครื่องมือวิเคราะห์เพื่อดูว่ารีวิวใดถูกอ่าน และคนออกตรงไหน เครื่องมือเหล่านั้นสามารถตั้งคุกกี้ของตนเองได้",
          ),
          copy(
            "You can block or delete cookies in your browser. Some features, such as saved layout preferences, will then reset the next time you visit.",
            "你可以在浏览器中屏蔽或删除 Cookie。之后，已保存的版式偏好等功能会在下次访问时重置。",
            "คุณสามารถบล็อกหรือลบคุกกี้ในเบราว์เซอร์ได้ ฟีเจอร์บางอย่าง เช่น การตั้งค่าเลย์เอาต์ที่บันทึกไว้ จะถูกรีเซ็ตเมื่อคุณเข้ามาครั้งถัดไป",
          ),
        ],
      },
      {
        id: "affiliates",
        heading: copy(
          "Affiliate links and third parties",
          "联盟链接与第三方",
          "ลิงก์พันธมิตรและบุคคลที่สาม",
        ),
        paragraphs: [
          copy(
            "Some “Visit Casino” and similar buttons are affiliate links. If you click one, the operator or its tracking partner may receive a referral identifier so we can be paid a commission if you later open an account. That click may also be logged by the destination site under its own privacy policy.",
            "部分「前往娱乐场」及类似按钮是联盟链接。你点击后，运营商或其追踪合作方可收到推荐标识，以便你之后开户时我们能获得佣金。目标网站也可能按自己的隐私政策记录这次点击。",
            "ปุ่มอย่าง “ไปที่คาสิโน” บางอันเป็นลิงก์พันธมิตร หากคุณคลิก ผู้ให้บริการหรือพาร์ตเนอร์ติดตามอาจได้รับรหัสแนะนำ เพื่อให้เราได้รับค่าคอมมิชชันหากคุณเปิดบัญชีในภายหลัง เว็บปลายทางอาจบันทึกการคลิกนั้นตามนโยบายความเป็นส่วนตัวของตนเองด้วย",
          ),
          copy(
            "We do not sell your name or email to operators. We also do not control what an operator collects after you leave BC.GS. Read their policy before you register or deposit.",
            "我们不会把你的姓名或邮箱卖给运营商。你离开 BC.GS 之后运营商收集什么，我们也无法控制。注册或存款前，请先阅读对方的政策。",
            "เราไม่ขายชื่อหรืออีเมลของคุณให้ผู้ให้บริการ และไม่ควบคุมว่าผู้ให้บริการจะเก็บอะไรหลังจากคุณออกจาก BC.GS โปรดอ่านนโยบายของพวกเขาก่อนสมัครหรือฝากเงิน",
          ),
        ],
      },
      {
        id: "retention",
        heading: copy("How long we keep data", "我们保留数据多久", "เราเก็บข้อมูลนานแค่ไหน"),
        paragraphs: [
          copy(
            "Server logs and analytics records are kept only as long as needed for security, debugging, and aggregated reporting — typically no longer than 24 months, unless a longer period is required to investigate abuse.",
            "服务器日志和分析记录只保留到安全、排错和汇总报告所需的时长 — 通常不超过 24 个月，除非调查滥用行为需要更长时间。",
            "บันทึกเซิร์ฟเวอร์และข้อมูลวิเคราะห์เก็บเท่าที่จำเป็นเพื่อความปลอดภัย การแก้ปัญหา และรายงานภาพรวม — โดยทั่วไปไม่เกิน 24 เดือน เว้นแต่ต้องเก็บนานกว่านั้นเพื่อสอบสวนการใช้งานที่ผิดปกติ",
          ),
          copy(
            "Emails you send us are kept for as long as needed to answer the request and keep a reasonable business record.",
            "你发来的邮件会保留到足以回复请求、并留下合理业务记录为止。",
            "อีเมลที่คุณส่งมาจะเก็บเท่าที่จำเป็นเพื่อตอบคำขอ และเก็บหลักฐานทางธุรกิจตามสมควร",
          ),
        ],
      },
      {
        id: "rights",
        heading: copy("Your rights", "你的权利", "สิทธิ์ของคุณ"),
        paragraphs: [
          copy(
            "Depending on where you live, you may have the right to ask what personal data we hold, to correct it, to delete it, to restrict or object to certain processing, or to receive a copy in a portable format. You may also have the right to lodge a complaint with a data protection authority.",
            "视你所在地而定，你可能有权查询我们持有的个人数据、更正、删除、限制或反对某些处理，或以可携格式获取副本。你也可能有权向数据保护机构投诉。",
            "ขึ้นกับว่าคุณอยู่ที่ไหน คุณอาจมีสิทธิ์ถามว่าเรามีข้อมูลส่วนบุคคลอะไร แก้ไข ลบ จำกัดหรือคัดค้านการประมวลผลบางอย่าง หรือขอสำเนาในรูปแบบที่นำไปใช้ต่อได้ และอาจมีสิทธิ์ร้องเรียนต่อหน่วยงานคุ้มครองข้อมูล",
          ),
          copy(
            "Layout preferences stored only in your browser can be cleared by you at any time. For anything we hold on our side, use the contact below.",
            "仅存在浏览器里的版式偏好，你可以随时自行清除。我们这边保存的内容，请用下方联系方式。",
            "การตั้งค่าเลย์เอาต์ที่เก็บในเบราว์เซอร์เท่านั้น คุณล้างได้เองทุกเมื่อ ส่วนที่เราเก็บไว้ฝั่งเรา ใช้ช่องทางติดต่อด้านล่าง",
          ),
        ],
      },
      {
        id: "contact",
        heading: copy("Privacy contact", "隐私联系方式", "ช่องทางติดต่อเรื่องความเป็นส่วนตัว"),
        paragraphs: [
          copy(
            "For privacy questions, write to privacy@bc.gs and include the email address or details that help us find your request. We will respond as soon as we reasonably can.",
            "隐私相关问题请写信至 privacy@bc.gs，并附上能帮我们定位请求的邮箱或其他细节。我们会尽快回复。",
            "หากมีคำถามเรื่องความเป็นส่วนตัว ส่งมาที่ privacy@bc.gs พร้อมอีเมลหรือรายละเอียดที่ช่วยให้เราหาคำขอของคุณได้ เราจะตอบโดยเร็วตามสมควร",
          ),
        ],
        links: [
          {
            label: copy("Email privacy@bc.gs", "发送邮件至 privacy@bc.gs", "อีเมล privacy@bc.gs"),
            href: "mailto:privacy@bc.gs",
          },
        ],
      },
    ],
  },

  terms: {
    slug: "terms",
    eyebrow: copy("Legal", "法律", "กฎหมาย"),
    title: copy("Terms & Conditions", "服务条款", "ข้อกำหนดและเงื่อนไข"),
    description: copy(
      "The rules for using BC.GS — an editorial review site, not a gambling operator.",
      "使用 BC.GS 的规则 — 这是编辑评测站，不是博彩运营商。",
      "กติกาการใช้ BC.GS — เว็บไซต์รีวิวบรรณาธิการ ไม่ใช่ผู้ให้บริการพนัน",
    ),
    lastUpdated: LAST_UPDATED,
    seoTitle: copy("Terms & Conditions", "服务条款", "ข้อกำหนดและเงื่อนไข"),
    seoDescription: copy(
      "Terms of use for BC.GS, including site purpose, affiliate disclosure, accuracy disclaimer, age limits, and liability limits.",
      "BC.GS 使用条款，涵盖网站定位、联盟披露、准确性免责、年龄限制与责任上限。",
      "ข้อกำหนดการใช้งาน BC.GS รวมถึงวัตถุประสงค์ของเว็บ การเปิดเผยลิงก์พันธมิตร ข้อสงวนเรื่องความถูกต้อง ข้อจำกัดอายุ และขอบเขตความรับผิด",
    ),
    sections: [
      {
        id: "acceptance",
        heading: copy("Acceptance of these terms", "接受本条款", "การยอมรับข้อกำหนดเหล่านี้"),
        paragraphs: [
          copy(
            "By accessing BC.GS you agree to these terms. If you do not agree, do not use the site. We may update this page from time to time; the “last updated” date at the top is the version that applies.",
            "访问 BC.GS 即表示你同意本条款。若不同意，请勿使用本站。我们可能不时更新本页；顶部的「最后更新」日期即为适用版本。",
            "การเข้าใช้ BC.GS ถือว่าคุณยอมรับข้อกำหนดเหล่านี้ หากไม่ยอมรับ โปรดอย่าใช้เว็บ เราอาจอัปเดตหน้านี้เป็นครั้งคราว วันที่ “อัปเดตล่าสุด” ด้านบนคือฉบับที่ใช้บังคับ",
          ),
          copy(
            "This is placeholder wording for product development and is not a substitute for legal advice.",
            "此为产品开发阶段的占位文案，不能替代法律意见。",
            "ข้อความนี้เป็นฉบับชั่วคราวสำหรับช่วงพัฒนาผลิตภัณฑ์ ไม่ใช่คำแนะนำทางกฎหมาย",
          ),
        ],
      },
      {
        id: "purpose",
        heading: copy("What this site is", "本站是什么", "เว็บนี้คืออะไร"),
        paragraphs: [
          copy(
            "BC.GS publishes independent editorial reviews, ratings, and comparisons of betting and casino brands. We are a media site. We are not a casino, sportsbook, payment processor, or gambling licensee. You cannot open an account, place a bet, or withdraw funds on BC.GS.",
            "BC.GS 发布博彩与娱乐场品牌的独立编辑评测、评分和对比。我们是媒体站点，不是娱乐场、体育博彩、支付处理商或博彩持牌方。你无法在 BC.GS 开户、下注或提现。",
            "BC.GS เผยแพร่รีวิวบรรณาธิการอิสระ คะแนน และการเปรียบเทียบแบรนด์เดิมพันและคาสิโน เราเป็นสื่อ ไม่ใช่คาสิโน บุ๊คเมกเกอร์ ผู้ประมวลผลการชำระเงิน หรือผู้ถือใบอนุญาตพนัน คุณเปิดบัญชี วางเดิมพัน หรือถอนเงินบน BC.GS ไม่ได้",
          ),
          copy(
            "Outbound “Visit Casino” links take you to a third-party operator. Any account you open there is between you and that operator.",
            "外链「前往娱乐场」会带你到第三方运营商。你在那里开的账户，只存在于你与该运营商之间。",
            "ลิงก์ออกไปอย่าง “ไปที่คาสิโน” พาคุณไปยังผู้ให้บริการภายนอก บัญชีที่คุณเปิดที่นั่นเป็นเรื่องระหว่างคุณกับผู้ให้บริการนั้น",
          ),
        ],
      },
      {
        id: "affiliates",
        heading: copy("Affiliate disclosure", "联盟披露", "การเปิดเผยลิงก์พันธมิตร"),
        paragraphs: [
          copy(
            "We may earn a commission if you click an affiliate link and later register or deposit with an operator. That does not change our scoring method. Ratings are editorial judgments based on research and hands-on testing, not on who pays the highest commission.",
            "如果你点击联盟链接，随后在运营商处注册或存款，我们可能获得佣金。这不会改变我们的评分方法。评分是基于调研和实际测试的编辑判断，不是看谁给的佣金最高。",
            "เราอาจได้รับค่าคอมมิชชันหากคุณคลิกลิงก์พันธมิตร แล้วสมัครหรือฝากเงินกับผู้ให้บริการในภายหลัง สิ่งนี้ไม่เปลี่ยนวิธีให้คะแนนของเรา คะแนนคือดุลยพินิจบรรณาธิการจากงานวิจัยและการทดสอบจริง ไม่ใช่จากใครจ่ายคอมมิชชันสูงสุด",
          ),
        ],
      },
      {
        id: "accuracy",
        heading: copy("Accuracy of information", "信息准确性", "ความถูกต้องของข้อมูล"),
        paragraphs: [
          copy(
            "Offers, payout times, licenses, and bonus terms change. We try to keep reviews current, but we do not warrant that every figure on the site is complete, current, or error-free. Always read the operator’s own terms before you deposit.",
            "优惠、出款时间、牌照和奖金条款都会变。我们尽量保持评测更新，但不保证站上每个数字都完整、最新或无误。存款前务必阅读运营商自己的条款。",
            "ข้อเสนอ เวลาถอน ใบอนุญาต และเงื่อนไขโบนัสเปลี่ยนแปลงได้ เราพยายามให้รีวิวทันสมัย แต่ไม่รับประกันว่าตัวเลขทุกตัวบนเว็บครบ ปัจจุบัน หรือไม่มีข้อผิดพลาด โปรดอ่านข้อกำหนดของผู้ให้บริการเองก่อนฝากเงิน",
          ),
          copy(
            "Nothing on BC.GS is financial, legal, or gambling advice. Rankings are opinions, not guarantees of future performance.",
            "BC.GS 上的内容不是财务、法律或博彩建议。排名是观点，不保证未来表现。",
            "เนื้อหาบน BC.GS ไม่ใช่คำแนะนำทางการเงิน กฎหมาย หรือการพนัน อันดับคือความเห็น ไม่ใช่การรับประกันผลในอนาคต",
          ),
        ],
      },
      {
        id: "age",
        heading: copy("Age restriction", "年龄限制", "ข้อจำกัดด้านอายุ"),
        paragraphs: [
          copy(
            "You must be of legal gambling age in your jurisdiction to follow outbound links to gambling operators — 18 or older in many places, 21 or older in others. If you are under that age, do not use those links.",
            "只有达到你所在地法定博彩年龄，才能点击通往博彩运营商的外链 — 许多地方是 18 岁及以上，有些地方是 21 岁及以上。未达该年龄请勿使用这些链接。",
            "คุณต้องมีอายุถึงเกณฑ์การพนันที่ถูกต้องตามกฎหมายในเขตของคุณ จึงจะคลิกลิงก์ออกไปยังผู้ให้บริการพนันได้ — หลายแห่งคือ 18 ปีขึ้นไป บางแห่งคือ 21 ปีขึ้นไป หากยังไม่ถึงอายุนั้น อย่าใช้ลิงก์เหล่านั้น",
          ),
          copy(
            "It is your responsibility to know whether online gambling is legal where you live. We do not target jurisdictions where this content is not permitted.",
            "你有责任了解所在地在线博彩是否合法。我们不面向禁止此类内容的司法辖区。",
            "เป็นหน้าที่ของคุณที่จะรู้ว่าการพนันออนไลน์ถูกกฎหมายในที่ที่คุณอยู่หรือไม่ เราไม่ได้มุ่งเป้าเขตที่เนื้อหานี้ไม่อนุญาต",
          ),
        ],
      },
      {
        id: "conduct",
        heading: copy("Acceptable use", "可接受的使用", "การใช้งานที่ยอมรับได้"),
        paragraphs: [
          copy(
            "Do not scrape the site in a way that harms availability, attempt to break security, or present our reviews as your own. You may link to our pages. You may not copy reviews wholesale without permission.",
            "请勿以损害可用性的方式抓取本站、尝试破坏安全，或把我们的评测当作自己的作品。你可以链接到我们的页面。未经许可，不得整篇复制评测。",
            "อย่าดึงข้อมูลเว็บในทางที่กระทบการให้บริการ พยายามเจาะระบบความปลอดภัย หรือนำรีวิวของเราไปเป็นของตนเอง คุณลิงก์มายังหน้าของเราได้ แต่ห้ามคัดลอกรีวิวทั้งก้อนโดยไม่ได้รับอนุญาต",
          ),
        ],
      },
      {
        id: "liability",
        heading: copy("Limitation of liability", "责任限制", "ข้อจำกัดความรับผิด"),
        paragraphs: [
          copy(
            "To the fullest extent allowed by law, BC.GS and its contributors are not liable for losses that arise from using the site or from relying on a review — including lost deposits, bonus disputes, or account closures at a third-party operator.",
            "在法律允许的最大范围内，BC.GS 及其撰稿人对因使用本站或依赖评测而产生的损失不承担责任 — 包括在第三方运营商处的存款损失、优惠争议或账户关闭。",
            "ในขอบเขตสูงสุดที่กฎหมายอนุญาต BC.GS และผู้ร่วมเขียนไม่รับผิดต่อความเสียหายที่เกิดจากการใช้เว็บหรือการพึ่งพารีวิว — รวมถึงเงินฝากที่สูญ โบนัสที่โต้แย้ง หรือบัญชีที่ถูกปิดที่ผู้ให้บริการภายนอก",
          ),
          copy(
            "The site is provided “as is.” We do not promise uninterrupted access or that every outbound link will remain live.",
            "本站按「现状」提供。我们不承诺不间断访问，也不保证每条外链始终有效。",
            "เว็บให้บริการแบบ “ตามสภาพ” เราไม่สัญญาว่าจะเข้าถึงได้ตลอดเวลา หรือว่าทุกลิงก์ออกไปจะยังใช้งานได้",
          ),
        ],
      },
      {
        id: "law",
        heading: copy("Governing law", "适用法律", "กฎหมายที่ใช้บังคับ"),
        paragraphs: [
          copy(
            "These terms are governed by the laws of [jurisdiction to be confirmed], without regard to conflict-of-law rules. Courts in that jurisdiction shall have exclusive venue, except where consumer-protection law requires otherwise.",
            "本条款受【待确认司法辖区】法律管辖，不考虑法律冲突规则。除消费者保护法另有要求外，该辖区法院拥有专属管辖权。",
            "ข้อกำหนดเหล่านี้อยู่ภายใต้กฎหมายของ [เขตอำนาจที่จะยืนยันในภายหลัง] โดยไม่คำนึงถึงหลักกฎหมายขัดกัน ศาลในเขตนั้นมีอำนาจพิจารณาแต่เพียงผู้เดียว เว้นแต่กฎหมายคุ้มครองผู้บริโภคกำหนดเป็นอย่างอื่น",
          ),
        ],
      },
      {
        id: "contact",
        heading: copy("Contact", "联系我们", "ติดต่อเรา"),
        paragraphs: [
          copy(
            "Questions about these terms can be sent to legal@bc.gs. For safer-gambling help, use the resources on our Responsible Gambling page — we are not a counselling service.",
            "关于本条款的问题可发送至 legal@bc.gs。需要更安全博彩方面的帮助，请使用「负责任博彩」页上的资源 — 我们不是咨询服务机构。",
            "คำถามเกี่ยวกับข้อกำหนดเหล่านี้ส่งได้ที่ legal@bc.gs หากต้องการความช่วยเหลือเรื่องการพนันอย่างปลอดภัย ใช้แหล่งข้อมูลในหน้าการพนันอย่างรับผิดชอบ — เราไม่ใช่บริการให้คำปรึกษา",
          ),
        ],
        links: [
          {
            label: copy("Email legal@bc.gs", "发送邮件至 legal@bc.gs", "อีเมล legal@bc.gs"),
            href: "mailto:legal@bc.gs",
          },
          {
            label: copy("Responsible Gambling", "负责任博彩", "การพนันอย่างรับผิดชอบ"),
            href: "/responsible-gambling",
          },
        ],
      },
    ],
  },

  "responsible-gambling": {
    slug: "responsible-gambling",
    eyebrow: copy("Legal", "法律", "กฎหมาย"),
    title: copy("Responsible Gambling", "负责任博彩", "การพนันอย่างรับผิดชอบ"),
    description: copy(
      "BC.GS reviews gambling operators. We do not take bets. If gambling is causing harm, stop and get help.",
      "BC.GS 评测博彩运营商，我们不接受投注。如果博彩正在造成伤害，请停下来寻求帮助。",
      "BC.GS รีวิวผู้ให้บริการพนัน เราไม่รับเดิมพัน หากการพนันกำลังก่ออันตราย หยุดแล้วขอความช่วยเหลือ",
    ),
    lastUpdated: LAST_UPDATED,
    seoTitle: copy("Responsible Gambling", "负责任博彩", "การพนันอย่างรับผิดชอบ"),
    seoDescription: copy(
      "Responsible gambling information from BC.GS, including age limits, warning signs, and links to independent support organisations.",
      "来自 BC.GS 的负责任博彩信息，包括年龄限制、警示信号，以及独立援助组织的链接。",
      "ข้อมูลการพนันอย่างรับผิดชอบจาก BC.GS รวมถึงข้อจำกัดอายุ สัญญาณเตือน และลิงก์ไปยังองค์กรช่วยเหลืออิสระ",
    ),
    sections: [
      {
        id: "not-an-operator",
        heading: copy(
          "We are not a gambling operator",
          "我们不是博彩运营商",
          "เราไม่ใช่ผู้ให้บริการพนัน",
        ),
        paragraphs: [
          copy(
            "BC.GS is an independent review publication. We do not offer games, take wagers, or hold player balances. If you choose to visit an operator we write about, you leave this site and use their product under their rules.",
            "BC.GS 是独立评测媒体。我们不提供游戏、不接受投注、不保管玩家余额。如果你选择访问我们写过的运营商，即离开本站，并按对方规则使用其产品。",
            "BC.GS เป็นสื่อรีวิวอิสระ เราไม่ให้บริการเกม ไม่รับเดิมพัน และไม่ถือยอดเงินของผู้เล่น หากคุณเลือกไปที่ผู้ให้บริการที่เราเขียนถึง คุณออกจากเว็บนี้แล้วใช้ผลิตภัณฑ์ของพวกเขาภายใต้กติกาของพวกเขา",
          ),
          copy(
            "This page is general information, not personal advice. Placeholder wording here should be checked by counsel before launch.",
            "本页是一般信息，不是针对个人的建议。此处占位文案应在上线前由律师核对。",
            "หน้านี้เป็นข้อมูลทั่วไป ไม่ใช่คำแนะนำส่วนบุคคล ข้อความชั่วคราวที่นี่ควรให้ทนายความตรวจก่อนเปิดใช้",
          ),
        ],
      },
      {
        id: "age",
        heading: copy("Age and legality", "年龄与合法性", "อายุและความถูกกฎหมาย"),
        paragraphs: [
          copy(
            "Gambling is for adults only. You must meet the minimum legal age where you live — often 18, and 21 in some jurisdictions — and gambling must be lawful in that place. If you are underage, do not follow links to operators.",
            "博彩仅限成年人。你必须达到所在地最低法定年龄 — 通常是 18 岁，部分辖区是 21 岁 — 且当地博彩必须合法。未成年人请勿点击通往运营商的链接。",
            "การพนันสำหรับผู้ใหญ่เท่านั้น คุณต้องมีอายุถึงเกณฑ์ขั้นต่ำตามกฎหมายในที่ที่คุณอยู่ — มักเป็น 18 ปี และ 21 ปีในบางเขต — และการพนันต้องถูกกฎหมายในที่นั้น หากยังไม่บรรลุนิติภาวะ อย่าคลิกลิงก์ไปยังผู้ให้บริการ",
          ),
        ],
      },
      {
        id: "signs",
        heading: copy(
          "Signs that gambling may be a problem",
          "博彩可能出问题的信号",
          "สัญญาณว่าการพนันอาจเป็นปัญหา",
        ),
        paragraphs: [
          copy(
            "Seek help if any of the following feel familiar. They are common warning signs, not a diagnosis:",
            "如果以下情况听起来眼熟，请寻求帮助。这些是常见警示信号，不是诊断：",
            "ขอความช่วยเหลือหากข้อใดต่อไปนี้รู้สึกคุ้นเคย นี่คือสัญญาณเตือนที่พบบ่อย ไม่ใช่การวินิจฉัย:",
          ),
        ],
        list: [
          copy(
            "Betting more money or more often than you planned.",
            "下注金额或频率超过原计划。",
            "เดิมพันเงินมากกว่า หรือบ่อยกว่าที่ตั้งใจไว้",
          ),
          copy(
            "Chasing losses or borrowing money to gamble.",
            "追损，或借钱去赌。",
            "ไล่ตามเงินที่เสีย หรือยืมเงินมาเล่นพนัน",
          ),
          copy(
            "Hiding play from family or work.",
            "对家人或职场隐瞒自己的博彩。",
            "ปิดบังการเล่นจากครอบครัวหรือที่ทำงาน",
          ),
          copy(
            "Feeling restless or irritable when you try to stop.",
            "试图停下来时感到烦躁或易怒。",
            "รู้สึกกระวนกระวายหรือหงุดหงิดเมื่อพยายามหยุด",
          ),
          copy(
            "Gambling to escape stress, debt, or low mood.",
            "用博彩逃避压力、债务或低落情绪。",
            "เล่นพนันเพื่อหนีความเครียด หนี้สิน หรืออารมณ์ตก",
          ),
          copy(
            "Neglecting work, study, or relationships because of gambling.",
            "因博彩而忽视工作、学业或人际关系。",
            "ละเลยงาน การเรียน หรือความสัมพันธ์เพราะการพนัน",
          ),
        ],
      },
      {
        id: "support",
        heading: copy("Where to get help", "去哪里求助", "จะขอความช่วยเหลือได้ที่ไหน"),
        paragraphs: [
          copy(
            "These organisations offer confidential information and support. They are independent of BC.GS. Use the service that matches your country when you can.",
            "这些组织提供保密信息与支持，独立于 BC.GS。尽可能选择与你所在国家对应的服务。",
            "องค์กรเหล่านี้ให้ข้อมูลและการสนับสนุนแบบลับ พวกเขาเป็นอิสระจาก BC.GS ใช้บริการที่ตรงกับประเทศของคุณเมื่อทำได้",
          ),
        ],
        links: [
          {
            label: copy("BeGambleAware", "BeGambleAware", "BeGambleAware"),
            href: "https://www.begambleaware.org/",
          },
          {
            label: copy("GamCare", "GamCare", "GamCare"),
            href: "https://www.gamcare.org.uk/",
          },
          {
            label: copy(
              "National Council on Problem Gambling",
              "National Council on Problem Gambling（美国问题博彩全国委员会）",
              "National Council on Problem Gambling (สภาแห่งชาติว่าด้วยปัญหาการพนัน)",
            ),
            href: "https://www.ncpgambling.org/",
          },
          {
            label: copy(
              "Gamblers Anonymous",
              "Gamblers Anonymous（匿名赌徒互助会）",
              "Gamblers Anonymous (กลุ่มไม่เปิดเผยชื่อสำหรับผู้มีปัญหาการพนัน)",
            ),
            href: "https://www.gamblersanonymous.org/",
          },
        ],
      },
      {
        id: "tools",
        heading: copy("Limits and self-exclusion", "限额与自我排除", "วงเงินและการตัดตนเอง"),
        paragraphs: [
          copy(
            "Reputable operators provide deposit limits, session reminders, time-outs, and self-exclusion. Use those tools on the operator’s site if you want to restrict play. National self-exclusion schemes (for example GAMSTOP in the UK) may also be available where you live.",
            "可靠运营商会提供存款限额、会话提醒、冷静期和自我排除。若要限制自己的游戏，请在运营商网站使用这些工具。你所在地也可能有国家级自我排除计划（例如英国的 GAMSTOP）。",
            "ผู้ให้บริการที่น่าเชื่อถือมีวงเงินฝาก ตัวเตือนเซสชัน พักเล่นชั่วคราว และการตัดตนเอง หากต้องการจำกัดการเล่น ให้ใช้เครื่องมือเหล่านั้นบนเว็บของผู้ให้บริการ โครงการตัดตนเองระดับประเทศ (เช่น GAMSTOP ในสหราชอาณาจักร) อาจมีในที่ที่คุณอยู่ด้วย",
          ),
          copy(
            "BC.GS cannot exclude you from third-party casinos. If you need a site-wide block, contact the operator and any national scheme directly.",
            "BC.GS 无法把你排除在第三方娱乐场之外。若需要全站屏蔽，请直接联系运营商及任何国家级计划。",
            "BC.GS ไม่สามารถตัดคุณออกจากคาสิโนภายนอกได้ หากต้องการบล็อกทั้งไซต์ ติดต่อผู้ให้บริการและโครงการระดับประเทศโดยตรง",
          ),
        ],
      },
      {
        id: "our-role",
        heading: copy("How we treat this on BC.GS", "我们在 BC.GS 上如何对待此事", "เราจัดการเรื่องนี้บน BC.GS อย่างไร"),
        paragraphs: [
          copy(
            "We do not present gambling as a way to make money. Reviews talk about product quality, fairness, and payouts — not “winning systems.” If an operator’s safer-gambling tools are weak, that can affect our Trust & Safety score.",
            "我们不会把博彩包装成赚钱途径。评测谈的是产品品质、公平性和出款 — 不是「稳赢系统」。如果运营商的更安全博彩工具薄弱，可能影响我们的「信任与安全」评分。",
            "เราไม่นำเสนอการพนันว่าเป็นทางทำเงิน รีวิวพูดถึงคุณภาพสินค้า ความยุติธรรม และการถอน — ไม่ใช่ “ระบบชนะ” หากเครื่องมือการพนันอย่างปลอดภัยของผู้ให้บริการอ่อนแอ อาจกระทบคะแนนความน่าเชื่อถือของเรา",
          ),
        ],
      },
    ],
  },
};

export function getLegalDocument(slug: LegalSlug): LegalDocument {
  return legalDocuments[slug];
}

export const legalSlugs = Object.keys(legalDocuments) as LegalSlug[];
