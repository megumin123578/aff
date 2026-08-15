"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { clearAdminSession, requireAdminSession } from "@/lib/admin-auth";
import {
  upsertAffiliateLink,
  upsertArticle,
  type AffiliateLink,
  type Article,
} from "@/lib/content";
import { upsertProvider, upsertVpsPlan } from "@/lib/catalog";
import type { CatalogLocation, CatalogPlan, CatalogProvider } from "@/lib/catalog-types";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function validSlug(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function list(formData: FormData, key: string) {
  return text(formData, key).split(/[,\n]/).map((value) => value.trim()).filter(Boolean);
}

function requiredNumber(formData: FormData, key: string, minimum = 0) {
  const value = Number(text(formData, key));
  if (!Number.isFinite(value) || value < minimum) throw new Error(`${key} must be at least ${minimum}`);
  return value;
}

function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw) return null;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${key} must be a number`);
  return value;
}

function assertHttpUrl(value: string, field: string, allowEmpty = false) {
  if (!value && allowEmpty) return;
  const url = new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error(`${field} must use HTTP or HTTPS`);
}

export async function saveArticleAction(formData: FormData) {
  await requireAdminSession();
  const slug = text(formData, "slug");
  const title = text(formData, "title");
  const description = text(formData, "description");
  if (!validSlug(slug)) throw new Error("Slug must contain lowercase letters, numbers, and hyphens only");
  if (!title || !description) throw new Error("Title and description are required");

  const status = text(formData, "status") === "published" ? "published" : "draft";
  const today = new Date().toISOString().slice(0, 10);
  const article: Article = {
    slug,
    title,
    description,
    category: text(formData, "category") || "Infrastructure",
    tags: text(formData, "tags").split(",").map((tag) => tag.trim()).filter(Boolean),
    status,
    publishedAt: text(formData, "publishedAt") || (status === "published" ? today : ""),
    updatedAt: today,
    coverImage: text(formData, "coverImage"),
    affiliateIds: formData.getAll("affiliateIds").map(String),
    body: text(formData, "body"),
  };
  if (!article.body) throw new Error("Article body is required");
  if (article.coverImage) assertHttpUrl(article.coverImage, "Cover image");

  await upsertArticle(article);
  revalidatePath("/");
  revalidatePath("/articles");
  revalidatePath(`/articles/${slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/articles?saved=1");
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

export async function saveProviderAction(formData: FormData) {
  await requireAdminSession();
  const slug = text(formData, "slug");
  if (!validSlug(slug)) throw new Error("Provider slug must contain lowercase letters, numbers, and hyphens only");
  const websiteUrl = text(formData, "websiteUrl");
  assertHttpUrl(websiteUrl, "Website URL");
  const locations: CatalogLocation[] = text(formData, "locations").split("\n")
    .map((line) => line.trim()).filter(Boolean).map((line, index) => {
      const [code, name, country, region] = line.split("|").map((value) => value.trim());
      if (!code || !name || !country || !region) throw new Error("Each location must use: code | name | country | region");
      return { id: index, code, name, country, region };
    });
  const provider: CatalogProvider = {
    slug, name: text(formData, "name"), description: text(formData, "description"),
    websiteUrl, affiliateLinkId: text(formData, "affiliateLinkId"),
    headquarters: text(formData, "headquarters"),
    foundedYear: optionalNumber(formData, "foundedYear"),
    features: list(formData, "features"), pros: list(formData, "pros"),
    cons: list(formData, "cons"), bestUseCases: list(formData, "bestUseCases"),
    alternatives: list(formData, "alternatives"), active: formData.get("active") === "on",
    lastUpdated: text(formData, "lastUpdated") || new Date().toISOString().slice(0, 10),
    locations,
  };
  if (!provider.name || !provider.description) throw new Error("Provider name and description are required");
  await upsertProvider(provider);
  revalidatePath("/providers");
  revalidatePath(`/providers/${slug}`);
  revalidatePath("/vps-plans");
  revalidatePath("/tools/vps-selector");
  revalidatePath("/sitemap.xml");
  redirect("/admin/providers?saved=1");
}

export async function saveVpsPlanAction(formData: FormData) {
  await requireAdminSession();
  const slug = text(formData, "slug");
  if (!validSlug(slug)) throw new Error("Plan slug must contain lowercase letters, numbers, and hyphens only");
  const sourceUrl = text(formData, "sourceUrl");
  assertHttpUrl(sourceUrl, "Pricing source URL");
  const plan: CatalogPlan = {
    slug, providerSlug: text(formData, "providerSlug"), providerName: "",
    providerAffiliateLinkId: "", name: text(formData, "name"),
    cpu: requiredNumber(formData, "cpu", 1), ram: requiredNumber(formData, "ram", 0.25),
    storage: requiredNumber(formData, "storage", 1),
    storageType: text(formData, "storageType") === "NVMe" ? "NVMe" : "SSD",
    architecture: text(formData, "architecture") === "arm64" ? "arm64" : "x86_64",
    transferTb: optionalNumber(formData, "transferTb"),
    networkSpeedMbps: optionalNumber(formData, "networkSpeedMbps"),
    egressCostPerGb: optionalNumber(formData, "egressCostPerGb"),
    ipv4: formData.get("ipv4") === "on", ipv6: formData.get("ipv6") === "on",
    priceMonthly: requiredNumber(formData, "priceMonthly"), currency: text(formData, "currency") || "USD",
    setupFee: requiredNumber(formData, "setupFee"),
    backupAvailable: formData.get("backupAvailable") === "on",
    snapshotAvailable: formData.get("snapshotAvailable") === "on",
    slaPercent: optionalNumber(formData, "slaPercent"), promotion: text(formData, "promotion"),
    available: formData.get("available") === "on", sourceUrl, note: text(formData, "note"),
    lastUpdated: text(formData, "lastUpdated") || new Date().toISOString().slice(0, 10), locations: [],
  };
  if (!validSlug(plan.providerSlug) || !plan.name) throw new Error("Provider and plan name are required");
  await upsertVpsPlan(plan);
  revalidatePath("/vps-plans");
  revalidatePath(`/vps-plans/${slug}`);
  revalidatePath(`/providers/${plan.providerSlug}`);
  revalidatePath("/tools/vps-selector");
  revalidatePath("/sitemap.xml");
  redirect("/admin/vps-plans?saved=1");
}

export async function logoutAdminAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
