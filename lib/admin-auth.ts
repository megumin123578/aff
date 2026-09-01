import "server-only";

import { cookies } from "next/headers";
import {
  signAdminSession,
  SESSION_TTL_SECONDS,
  verifyAdminPassword,
  verifyAdminSession,
  type SessionOptions,
  type UserRole,
} from "./admin-crypto";
import { isEmailAllowedForAdmin } from "./google-auth";

export const ADMIN_COOKIE = "neroviax_admin_session";
export const SESSION_MAX_AGE = SESSION_TTL_SECONDS;

export function credentials() {
  return {
    username: process.env.ADMIN_USERNAME || "",
    password: process.env.ADMIN_PASSWORD || "",
    passwordKey: process.env.ADMIN_PASSWORD_KEY || "",
    secret: process.env.AUTH_SECRET || "",
  };
}

export function isSecureCookie() {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return appUrl.startsWith("https://");
}

function validSecret(secret: string) {
  return Buffer.byteLength(secret) >= 32;
}

export async function authenticateAdmin(username: string, password: string) {
  const configured = credentials();
  const usernameMatches = username.length === configured.username.length && username === configured.username;
  const passwordMatches = verifyAdminPassword(password, configured.password, configured.passwordKey);
  return Boolean(
    configured.username &&
      usernameMatches &&
      passwordMatches &&
      validSecret(configured.passwordKey) &&
      validSecret(configured.secret) &&
      configured.passwordKey !== configured.secret,
  );
}

export type AuthSession = {
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  role: UserRole;
  expiresAt: number;
};

// Backward-compatibility alias
export type AdminSession = AuthSession;

export async function createAdminSession(
  username: string,
  avatarOrOptions?: string | SessionOptions
) {
  const { secret } = credentials();
  if (!validSecret(secret)) throw new Error("AUTH_SECRET must contain at least 32 bytes");
  const cookieStore = await cookies();
  const options: SessionOptions =
    typeof avatarOrOptions === "string"
      ? { avatar: avatarOrOptions, role: "admin" }
      : { role: "admin", ...avatarOrOptions };

  cookieStore.set(ADMIN_COOKIE, signAdminSession(username, secret, options), {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

// Returns session for any logged in user (both admin and regular community members)
export async function getAuthSession(): Promise<AuthSession | null> {
  const configured = credentials();
  if (!validSecret(configured.secret)) return null;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyAdminSession(token, configured.secret);
  if (!payload?.sub) return null;

  let role: UserRole = payload.role || "user";
  if (
    payload.sub === configured.username ||
    (payload.email && isEmailAllowedForAdmin(payload.email))
  ) {
    role = "admin";
  }

  return {
    username: payload.sub,
    name: payload.name || payload.sub,
    email: payload.email,
    avatar: payload.avatar,
    role,
    expiresAt: payload.exp,
  };
}

// Returns session ONLY if the user is an Administrator
export async function getAdminSession(): Promise<AuthSession | null> {
  const session = await getAuthSession();
  if (!session || session.role !== "admin") return null;
  return session;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
