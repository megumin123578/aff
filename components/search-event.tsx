"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/client-analytics";

export function SearchEvent({ query, resultCount }: { query: string; resultCount: number }) {
  useEffect(() => { if (query.length >= 2) trackEvent("search_performed", { query, resultCount }); }, [query, resultCount]);
  return null;
}

