import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/social-card";
import { getArticle } from "@/lib/content";
export const size = { width: 1200, height: 630 }; export const contentType = "image/png";
export default async function Image({ params }: { params: Promise<{ slug: string }> }) { const article = await getArticle((await params).slug); return new ImageResponse(<SocialCard eyebrow="Guide" title={article?.title || "Infrastructure Guide"} detail={article?.description || "Practical, reproducible infrastructure guidance"} />, size); }
