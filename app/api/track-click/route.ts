import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

type TrackClickBody = {
  casinoId?: string;
  bonusId?: string;
  locale?: string;
};

export async function POST(request: NextRequest) {
  let body: TrackClickBody;

  try {
    body = (await request.json()) as TrackClickBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const casinoId = body.casinoId?.trim();
  const locale = body.locale?.trim();
  const bonusId = body.bonusId?.trim() || null;

  if (!casinoId || !locale) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const referrer =
    request.headers.get("referer") ?? request.headers.get("referrer");

  try {
    const casino = await prisma.casino.findFirst({
      where: {
        OR: [{ id: casinoId }, { slug: casinoId }],
      },
      select: { id: true },
    });

    if (!casino) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await prisma.affiliateClick.create({
      data: {
        casinoId: casino.id,
        bonusId,
        locale,
        referrer,
      },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
