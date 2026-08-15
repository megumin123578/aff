"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/client-analytics";

export function AnalyticsPageView() {
  const pathname = usePathname();
  useEffect(() => { trackEvent("page_view"); }, [pathname]);
  return null;
}

