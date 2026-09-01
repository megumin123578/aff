"use client";

import { useEffect, type ReactNode } from "react";

const recordedImpressions = new Set<number>();

export function TrackedPostLink({ id, href, children }: { id: number; href: string; children: ReactNode }) {
  useEffect(() => {
    if (recordedImpressions.has(id)) return;
    recordedImpressions.add(id);
    void fetch("/api/post-link-impressions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
      keepalive: true,
    });
  }, [id]);

  return <a href={href} rel="nofollow sponsored">{children}</a>;
}
