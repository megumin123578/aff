"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/admin-auth";
import { upsertArticle, type Article } from "@/lib/content";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export async function submitArticleAction(formData: FormData) {
  const session = await getAuthSession();
  if (!session) {
    throw new Error("You must be signed in to submit an article.");
  }

  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const category = String(formData.get("category") || "Community").trim();
  const coverImage = String(formData.get("coverImage") || "").trim();
  const body = String(formData.get("body") || "").trim();

  if (!title || !description || !body) {
    throw new Error("Title, summary description, and article content are required.");
  }

  let slug = String(formData.get("slug") || "").trim();
  if (!slug) {
    slug = slugify(title);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    slug = `${slugify(title)}-${Date.now().toString().slice(-4)}`;
  }

  const today = new Date().toISOString().slice(0, 10);

  const article: Article = {
    slug,
    title,
    description,
    category,
    status: "pending", // Always pending for user submissions
    publishedAt: "",
    updatedAt: today,
    coverImage,
    affiliateIds: [],
    body,
    authorName: session.name || session.username,
    authorEmail: session.email || "",
    authorAvatar: session.avatar || "",
  };

  await upsertArticle(article);

  revalidatePath("/admin/articles");
  revalidatePath("/submit-article");

  redirect("/submit-article?submitted=1");
}
