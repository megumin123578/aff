import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_MAX_AGE, credentials, isSecureCookie } from "@/lib/admin-auth";
import { signAdminSession } from "@/lib/admin-crypto";
import {
  exchangeCodeForTokens,
  getGoogleUserInfo,
  isEmailAllowedForAdmin,
} from "@/lib/google-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "") || "http";
  const origin = `${proto}://${host}`;

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/admin/login?error=${encodeURIComponent(error)}`, origin));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_request", origin));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get("google_oauth_state")?.value;
  cookieStore.delete("google_oauth_state");

  if (!savedState || savedState !== state) {
    return NextResponse.redirect(new URL("/admin/login?error=state_mismatch", origin));
  }

  const tokenData = await exchangeCodeForTokens(code, origin);
  if (!tokenData?.access_token) {
    return NextResponse.redirect(new URL("/admin/login?error=token_exchange_failed", origin));
  }

  const userInfo = await getGoogleUserInfo(tokenData.access_token);
  if (!userInfo?.email) {
    return NextResponse.redirect(new URL("/admin/login?error=user_info_failed", origin));
  }

  // Determine if this user has Administrator permissions
  const isAdmin = isEmailAllowedForAdmin(userInfo.email);
  const role = isAdmin ? "admin" : "user";

  const sessionUsername = userInfo.email.split("@")[0] || "user";
  const userAvatar = userInfo.picture || "";
  const userName = userInfo.name || userInfo.given_name || sessionUsername;

  const { secret } = credentials();
  const sessionToken = signAdminSession(sessionUsername, secret, {
    email: userInfo.email,
    name: userName,
    avatar: userAvatar,
    role,
  });

  // Admin gets redirected to /admin dashboard, while regular readers return to / (or reading articles)
  const destination = isAdmin ? "/admin" : "/";
  const response = NextResponse.redirect(new URL(destination, origin));

  response.cookies.set(ADMIN_COOKIE, sessionToken, {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
