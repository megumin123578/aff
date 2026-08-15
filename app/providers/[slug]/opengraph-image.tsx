import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/social-card";
import { getProvider } from "@/lib/catalog";
export const size = { width: 1200, height: 630 }; export const contentType = "image/png";
export default async function Image({ params }: { params: Promise<{ slug: string }> }) { const provider = await getProvider((await params).slug); return new ImageResponse(<SocialCard eyebrow="Provider" title={provider ? `${provider.name} VPS Plans` : "VPS Provider"} detail={provider?.description || "Provider pricing, locations and practical trade-offs"} />, size); }
