import { redirect } from "next/navigation";

export default async function ArticleRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/posts/${slug}`);
}
