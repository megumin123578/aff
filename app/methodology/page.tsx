import type { Metadata } from "next";
import { TrustPage } from "@/components/trust-page";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How Neroviax tests tech hardware, benchmarks gear, and evaluates workspace tools.",
  alternates: { canonical: "/methodology" },
};

export default function Page() {
  return (
    <TrustPage
      eyebrow="Methodology"
      title="How We Test & Review Tech Products"
      intro="Our goal is to make every review, hardware teardown, and setup recommendation reproducible, honest, and verifiable."
      sections={[
        {
          title: "Real-world workload testing",
          body: "We do not just unbox and recite spec sheets. Hardware (monitors, keyboards, mini PCs, docks) is tested in real software engineering and creative workflows for extended periods.",
        },
        {
          title: "Honest trade-off reporting",
          body: "No gadget is perfect. Every review explicitly documents trade-offs (such as coil whine, software bloat, port limitations, thermal throttling, or loud switches) alongside benefits.",
        },
        {
          title: "Pricing and deals tracking",
          body: "We cross-reference prices across major platforms (Shopee, Lazada, Amazon, Direct) to point readers toward the most reliable vendors and verified discounts.",
        },
        {
          title: "Affiliate independence",
          body: "Outbound affiliate links help support our testing equipment, but brands have no say in our final ratings, scoring, or editorial decisions.",
        },
      ]}
    />
  );
}
