import "server-only";

import { query } from "./db";

export type ArticleStatus = "draft" | "published" | "pending";

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  publishedAt: string;
  updatedAt: string;
  coverImage: string;
  affiliateIds: string[];
  body: string;
  authorName?: string;
  authorEmail?: string;
  authorAvatar?: string;
};

export type AffiliateLink = {
  id: string;
  provider: string;
  label: string;
  destinationUrl: string;
  affiliateUrl: string;
  enabled: boolean;
  lastVerified: string;
  notes: string;
};

type ArticleRow = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  status: ArticleStatus;
  published_at: string | Date | null;
  updated_at: string | Date;
  cover_image: string;
  affiliate_ids: string[];
  body_markdown: string;
  author_name?: string | null;
  author_email?: string | null;
  author_avatar?: string | null;
};

type AffiliateRow = {
  id: string;
  provider: string;
  label: string;
  destination_url: string;
  affiliate_url: string;
  enabled: boolean;
  last_verified: string | Date;
  notes: string;
};

function dateOnly(value: string | Date | null) {
  if (!value) return "";
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value).slice(0, 10);
}

function articleFromRow(row: ArticleRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: row.tags || [],
    status: row.status,
    publishedAt: dateOnly(row.published_at),
    updatedAt: dateOnly(row.updated_at),
    coverImage: row.cover_image || "",
    affiliateIds: row.affiliate_ids || [],
    body: row.body_markdown,
    authorName: row.author_name || "",
    authorEmail: row.author_email || "",
    authorAvatar: row.author_avatar || "",
  };
}

function affiliateFromRow(row: AffiliateRow): AffiliateLink {
  return {
    id: row.id,
    provider: row.provider,
    label: row.label,
    destinationUrl: row.destination_url,
    affiliateUrl: row.affiliate_url || "",
    enabled: row.enabled,
    lastVerified: dateOnly(row.last_verified),
    notes: row.notes || "",
  };
}

const articleColumns =
  "slug, title, description, category, tags, status, published_at, updated_at, cover_image, affiliate_ids, body_markdown, author_name, author_email, author_avatar";
const affiliateColumns =
  "id, provider, label, destination_url, affiliate_url, enabled, last_verified, notes";

export async function getAllArticles() {
  const result = await query<ArticleRow>(
    `SELECT ${articleColumns} FROM articles ORDER BY COALESCE(published_at, updated_at) DESC`
  );
  return result.rows.map(articleFromRow);
}

export async function getPublishedArticles() {
  const result = await query<ArticleRow>(
    `SELECT ${articleColumns} FROM articles WHERE status = $1 ORDER BY published_at DESC`,
    ["published"]
  );
  return result.rows.map(articleFromRow);
}

export async function getArticlesByAuthorEmail(email: string) {
  if (!email) return [];
  const result = await query<ArticleRow>(
    `SELECT ${articleColumns} FROM articles WHERE author_email = $1 ORDER BY updated_at DESC`,
    [email]
  );
  return result.rows.map(articleFromRow);
}

export async function getArticle(slug: string, includeNonPublished = false) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const result = await query<ArticleRow>(
    `SELECT ${articleColumns} FROM articles WHERE slug = $1 AND ($2::boolean OR status = 'published') LIMIT 1`,
    [slug, includeNonPublished]
  );
  return result.rows[0] ? articleFromRow(result.rows[0]) : null;
}

export async function upsertArticle(article: Article) {
  await query(
    `INSERT INTO articles (slug, title, description, category, tags, status, published_at, updated_at, cover_image, affiliate_ids, body_markdown, author_name, author_email, author_avatar)
     VALUES ($1, $2, $3, $4, $5, $6, NULLIF($7, '')::date, $8::date, $9, $10, $11, $12, $13, $14)
     ON CONFLICT (slug) DO UPDATE SET
       title = EXCLUDED.title, description = EXCLUDED.description, category = EXCLUDED.category,
       tags = EXCLUDED.tags, status = EXCLUDED.status, published_at = EXCLUDED.published_at,
       updated_at = EXCLUDED.updated_at, cover_image = EXCLUDED.cover_image,
       affiliate_ids = EXCLUDED.affiliate_ids, body_markdown = EXCLUDED.body_markdown,
       author_name = EXCLUDED.author_name, author_email = EXCLUDED.author_email, author_avatar = EXCLUDED.author_avatar`,
    [
      article.slug,
      article.title,
      article.description,
      article.category,
      article.tags,
      article.status,
      article.publishedAt,
      article.updatedAt,
      article.coverImage,
      article.affiliateIds,
      article.body,
      article.authorName || "",
      article.authorEmail || "",
      article.authorAvatar || "",
    ]
  );
}

export async function approveArticle(slug: string) {
  const today = new Date().toISOString().slice(0, 10);
  await query(
    `UPDATE articles SET status = 'published', published_at = COALESCE(published_at, $2::date), updated_at = $2::date WHERE slug = $1`,
    [slug, today]
  );
}

export async function getAffiliateLinks() {
  const result = await query<AffiliateRow>(`SELECT ${affiliateColumns} FROM affiliate_links ORDER BY provider, id`);
  return result.rows.map(affiliateFromRow);
}

export async function getAffiliateLink(id: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) return null;
  const result = await query<AffiliateRow>(`SELECT ${affiliateColumns} FROM affiliate_links WHERE id = $1 LIMIT 1`, [id]);
  return result.rows[0] ? affiliateFromRow(result.rows[0]) : null;
}

export async function upsertAffiliateLink(link: AffiliateLink) {
  await query(
    `INSERT INTO affiliate_links (id, provider, label, destination_url, affiliate_url, enabled, last_verified, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8)
     ON CONFLICT (id) DO UPDATE SET
       provider = EXCLUDED.provider, label = EXCLUDED.label, destination_url = EXCLUDED.destination_url,
       affiliate_url = EXCLUDED.affiliate_url, enabled = EXCLUDED.enabled,
       last_verified = EXCLUDED.last_verified, notes = EXCLUDED.notes`,
    [link.id, link.provider, link.label, link.destinationUrl, link.affiliateUrl, link.enabled, link.lastVerified, link.notes]
  );
}

export async function recordAffiliateClick(input: {
  affiliateId: string;
  source: string;
  articleSlug?: string;
  planId?: string;
  placement?: string;
}) {
  await query(
    `INSERT INTO affiliate_clicks (affiliate_link_id, source, article_slug, plan_id, placement)
     VALUES ($1, $2, $3, $4, $5)`,
    [input.affiliateId, input.source, input.articleSlug || null, input.planId || null, input.placement || null]
  );
}

export async function getAffiliateClickCount() {
  const result = await query<{ count: number }>("SELECT count(*)::int AS count FROM affiliate_clicks");
  return result.rows[0]?.count ?? 0;
}
