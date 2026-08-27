import type { Metadata } from "next";
import { TrustPage } from "@/components/trust-page";

export const metadata: Metadata = {
  title: "About",
  description: "About Neroviax and our honest approach to tech reviews, hardware benchmarks, and workspace setups.",
  alternates: { canonical: "/about" },
};

export default function Page() {
  return (
    <TrustPage
      eyebrow="About Neroviax"
      title="Hardware & Tech Recommendations Backed by Real Testing"
      intro="Neroviax provides in-depth hardware reviews, homelab experiments, and minimalist desk setup guides for developers and tech enthusiasts."
      sections={[
        {
          title: "What we publish",
          body: "We test and review monitors, mechanical keyboards, ergonomic accessories, Mini PCs, and developer tools with zero marketing fluff.",
        },
        {
          title: "Our principles",
          body: "Real-world testing over marketing claims. We evaluate products in daily 8+ hour workloads, document all trade-offs, and maintain transparent affiliate partnerships.",
        },
        {
          title: "Editorial Independence",
          body: "Affiliate commissions help support our testing and operating costs, but brands cannot pay to change our reviews or test results.",
        },
      ]}
    />
  );
}
