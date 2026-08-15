export const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://neroviax.com");

export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl).toString();
}

export function jsonLd(value: unknown) {
  return { __html: JSON.stringify(value).replace(/</g, "\\u003c") };
}

export const organizationJsonLd = {
  "@type": "Organization",
  "@id": absoluteUrl("/#organization"),
  name: "Neroviax",
  url: absoluteUrl("/"),
  logo: absoluteUrl("/favicon.ico"),
};

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
