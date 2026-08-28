import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { createGoogleAuthUrl, getGoogleConfig } from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "http";
  const origin = `${proto}://${host}`;

  const { isConfigured } = getGoogleConfig(origin);
  if (!isConfigured) {
    return NextResponse.redirect(new URL("/admin/login?error=google_not_configured", origin));
  }

  // Generate random CSRF state token
  const stateBytes = new Uint8Array(24);
  crypto.getRandomValues(stateBytes);
  const state = Array.from(stateBytes, (b) => b.toString(16).padStart(2, "0")).join("");

  const cookieStore = await cookies();
  cookieStore.set("google_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60, // 10 minutes
  });

  const authUrl = createGoogleAuthUrl(state, origin);
  return NextResponse.redirect(authUrl);
}
