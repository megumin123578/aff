"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent, type AnalyticsProperties } from "@/lib/client-analytics";

export function TrackedLink({ eventName, eventProperties, onClick, ...props }: ComponentProps<typeof Link> & { eventName: string; eventProperties?: AnalyticsProperties }) {
  return <Link {...props} onClick={(event) => { trackEvent(eventName, eventProperties); onClick?.(event); }} />;
}

