"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, getAdminSession, requireAdminSession } from "@/lib/admin-auth";
import {
  approveArticle,
  deleteArticle,
  updateArticleStatus,
  upsertAffiliateLink,
  upsertArticle,
  type AffiliateLink,
  type Article,
  type ArticleStatus,
} from "@/lib/content";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function assertHttpUrl(value: string, field: string, allowEmpty = false) {
  if (!value && allowEmpty) return;
  const url = new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error(`${field} must use HTTP or HTTPS`);
}

function assertCoverImage(value: string) {
  if (value.startsWith("/uploads/") && /^\/uploads\/[a-f0-9-]+\.(?:jpg|png|webp|gif)$/.test(value)) return;
  assertHttpUrl(value, "Cover image");
}

export async function saveArticleAction(formData: FormData) {
  await requireAdminSession();
  const slug = text(formData, "slug");
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!validSlug(slug)) throw new Error("Slug must contain lowercase letters, numbers, and hyphens only");
  if (!title || !description) throw new Error("Title and description are required");

  const rawStatus = text(formData, "status");
  const status: ArticleStatus =
    rawStatus === "published" ? "published" : rawStatus === "pending" ? "pending" : "draft";
  const today = new Date().toISOString().slice(0, 10);
  const article: Article = {
    slug,
    title,
    description,
    category: text(formData, "category") || "Desk Setup",
    status,
    publishedAt: text(formData, "publishedAt") || (status === "published" ? today : ""),
    updatedAt: today,
    coverImage: text(formData, "coverImage"),
    affiliateIds: formData.getAll("affiliateIds").map(String),
    body: text(formData, "body"),
    authorName: text(formData, "authorName"),
    authorEmail: text(formData, "authorEmail"),
    authorAvatar: text(formData, "authorAvatar"),
  };
  if (!article.body) throw new Error("Article body is required");
  if (article.coverImage) assertCoverImage(article.coverImage);

  await upsertArticle(article);
  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath(`/forums/${slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/articles?saved=1");
}

export async function approveArticleAction(formData: FormData) {
  await requireAdminSession();
  const slug = text(formData, "slug");
  if (!validSlug(slug)) throw new Error("Invalid article slug");

  await approveArticle(slug);
  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath(`/forums/${slug}`);
  revalidatePath("/admin/articles");
  redirect("/admin/articles?approved=1");
}

export async function updateArticleStatusAction(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  const slug = text(formData, "slug");
  const rawStatus = text(formData, "status");
  if (!validSlug(slug)) throw new Error("Invalid post slug");
  if (rawStatus !== "draft" && rawStatus !== "pending" && rawStatus !== "published") {
    throw new Error("Invalid post status");
  }

  await updateArticleStatus(slug, rawStatus);
  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath(`/forums/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/articles");
  redirect("/admin/articles");
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdminSession();
  const slug = text(formData, "slug");
  if (!validSlug(slug)) throw new Error("Invalid post slug");

  await deleteArticle(slug);
  revalidatePath("/");
  revalidatePath("/forums");
  revalidatePath(`/forums/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/articles");
  redirect("/admin/articles?deleted=1");
}

export async function saveAffiliateLinkAction(formData: FormData) {
  await requireAdminSession();
  const id = text(formData, "id");
  if (!validSlug(id)) throw new Error("Affiliate ID must contain lowercase letters, numbers, and hyphens only");

  const link: AffiliateLink = {
    id,
    provider: text(formData, "provider"),
    label: text(formData, "label"),
    destinationUrl: text(formData, "destinationUrl"),
    affiliateUrl: text(formData, "affiliateUrl"),
    enabled: formData.get("enabled") === "on",
    lastVerified: text(formData, "lastVerified") || new Date().toISOString().slice(0, 10),
    notes: text(formData, "notes"),
  };
  if (!link.provider || !link.label || !link.destinationUrl) throw new Error("Provider, label and destination URL are required");
  assertHttpUrl(link.destinationUrl, "Destination URL");
  assertHttpUrl(link.affiliateUrl, "Affiliate URL", true);

  await upsertAffiliateLink(link);
  revalidatePath("/", "layout");
  redirect("/admin/affiliate-links?saved=1");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
