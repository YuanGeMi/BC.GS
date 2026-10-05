import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ComplaintActions } from "@/components/admin/complaint-actions";
import { Link } from "@/i18n/navigation";
import { getAdminComplaint } from "@/lib/admin/complaints";

type Props = {
  params: Promise<{ locale: string; caseId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin.complaints" });
  return { title: t("detailTitle") };
}

export default async function AdminComplaintDetailPage({ params }: Props) {
  const { locale, caseId } = await params;
  setRequestLocale(locale);
  const tc = await getTranslations("Admin.complaints");

  const complaint = await getAdminComplaint(decodeURIComponent(caseId));
  if (!complaint) notFound();

  const dateTimeFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const notProvided = <span className="text-text/35">{tc("notProvided")}</span>;

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: tc("columns.type"), value: tc(`types.${complaint.type}`) },
    { label: tc("columns.source"), value: tc(`sources.${complaint.source}`) },
    {
      label: tc("columns.casino"),
      value: complaint.casinoId ? (
        <Link
          href={`/admin/casinos/${complaint.casinoId}`}
          className="text-accent hover:text-accent-highlight"
        >
          {complaint.casinoLabel}
        </Link>
      ) : complaint.casinoLabel ? (
        tc("notInDatabase", { name: complaint.casinoLabel })
      ) : (
        notProvided
      ),
    },
    { label: tc("contactName"), value: complaint.contactName || notProvided },
    { label: tc("contactEmail"), value: complaint.contactEmail || notProvided },
    {
      label: tc("telegramUserId"),
      value: complaint.telegramUserId ? (
        <span className="tabular-nums">{complaint.telegramUserId}</span>
      ) : (
        notProvided
      ),
    },
    {
      label: tc("columns.created"),
      value: (
        <span className="tabular-nums">
          {dateTimeFmt.format(new Date(complaint.createdAt))}
        </span>
      ),
    },
    {
      label: tc("updated"),
      value: (
        <span className="tabular-nums">
          {dateTimeFmt.format(new Date(complaint.updatedAt))}
        </span>
      ),
    },
    { label: tc("moderator"), value: complaint.moderatorLabel || notProvided },
    {
      label: tc("moderatedAt"),
      value: complaint.moderatedAt ? (
        <span className="tabular-nums">
          {dateTimeFmt.format(new Date(complaint.moderatedAt))}
        </span>
      ) : (
        notProvided
      ),
    },
  ];

  return (
    <section className="max-w-3xl">
      <p className="text-accent/80 text-[11px] font-medium tracking-[0.22em] uppercase">
        {tc("eyebrow")}
      </p>
      <h1 className="font-display mt-3 text-4xl tracking-tight tabular-nums">
        {complaint.caseId}
      </h1>
      <p className="text-text/45 mt-2 text-xs tracking-[0.16em] uppercase">
        {tc(`status.${complaint.status}`)}
      </p>

      <dl className="mt-10 grid gap-5 text-sm sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <dt className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
              {field.label}
            </dt>
            <dd className="mt-1 break-words">{field.value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-text/10 mt-10 border-t pt-8">
        <p className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
          {tc("columns.subject")}
        </p>
        <p className="mt-3 text-sm">{complaint.subject}</p>
        <p className="text-text/40 mt-6 text-[11px] tracking-[0.16em] uppercase">
          {tc("description")}
        </p>
        <p className="mt-3 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {complaint.description}
        </p>
      </div>

      <div className="border-text/10 mt-10 border-t pt-8">
        <p className="text-text/40 text-[11px] tracking-[0.16em] uppercase">
          {tc("evidence")}
        </p>
        {complaint.evidence.length === 0 ? (
          <p className="text-text/45 mt-3 text-sm">{tc("noEvidence")}</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {complaint.evidence.map((item) => (
              <li key={item.number}>
                {item.available ? (
                  <a
                    href={`/api/admin/complaints/${encodeURIComponent(complaint.caseId)}/evidence/${item.number}`}
                    download
                    rel="noopener noreferrer"
                    className="text-accent hover:text-accent-highlight"
                  >
                    {tc("attachment", { number: item.number })}
                  </a>
                ) : (
                  <span className="text-text/40">
                    {tc("attachmentUnavailable", { number: item.number })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="text-text/40 mt-3 text-xs">{tc("evidenceHelp")}</p>
      </div>

      <div className="border-text/10 mt-10 border-t pt-8">
        <ComplaintActions
          caseId={complaint.caseId}
          status={complaint.status}
          adminNotes={complaint.adminNotes ?? ""}
        />
      </div>

      <Link
        href="/admin/complaints"
        className="text-text/45 hover:text-accent mt-10 inline-block text-sm"
      >
        {tc("backToList")}
      </Link>
    </section>
  );
}
