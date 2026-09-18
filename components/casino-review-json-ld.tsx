import { getSiteUrl } from "@/lib/seo";
import type { CasinoDetailView } from "@/lib/casinos";
import { getSiteConfig } from "@/lib/site";

type Props = {
  casino: CasinoDetailView;
  locale: string;
  slug: string;
};

export async function CasinoReviewJsonLd({ casino, locale, slug }: Props) {
  const reviewUrl = `${getSiteUrl()}/${locale}/casinos/${slug}`;
  const { siteName } = await getSiteConfig();
  const siteUrl = getSiteUrl();

  const schema = {
    "@context": "https://schema.org",
    "@type": "Review",
    url: reviewUrl,
    inLanguage: locale,
    itemReviewed: {
      "@type": "Organization",
      name: casino.name,
      ...(casino.logoUrl ? { image: casino.logoUrl } : {}),
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: casino.rating,
        bestRating: 5,
        worstRating: 1,
        ratingCount: 1,
      },
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: casino.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
    reviewBody: casino.review.join("\n\n"),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
