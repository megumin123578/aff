import { ImageResponse } from "next/og";
import { SocialCard } from "@/components/social-card";
import { getVpsPlan } from "@/lib/catalog";
export const size = { width: 1200, height: 630 }; export const contentType = "image/png";
export default async function Image({ params }: { params: Promise<{ slug: string }> }) { const plan = await getVpsPlan((await params).slug); return new ImageResponse(<SocialCard eyebrow="VPS Plan" title={plan ? `${plan.providerName} ${plan.name}` : "VPS Plan"} detail={plan ? `${plan.cpu} vCPU · ${plan.ram} GB RAM · ${plan.storage} GB ${plan.storageType} · $${plan.priceMonthly}/mo` : "Normalized specifications and pricing"} />, size); }
