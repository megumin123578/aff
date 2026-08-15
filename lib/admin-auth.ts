import "server-only";

import { cookies } from "next/headers";
import { signAdminSession, verifyAdminPassword, verifyAdminSession } from "./admin-crypto";

const ADMIN_COOKIE = "neroviax_admin_session";
const SESSION_MAX_AGE = 8 * 60 * 60;

function credentials() {
  return {
    username: process.env.ADMIN_USERNAME || "",
    password: process.env.ADMIN_PASSWORD || "",
    passwordKey: process.env.ADMIN_PASSWORD_KEY || "",
    secret: process.env.AUTH_SECRET || "",
  };
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

export async function createAdminSession(username: string) {
  const { secret } = credentials();
  if (!validSecret(secret)) throw new Error("AUTH_SECRET must contain at least 32 bytes");
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, signAdminSession(username, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function getAdminSession() {
  const configured = credentials();
  if (!configured.username || !validSecret(configured.secret)) return null;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyAdminSession(token, configured.secret);
  return payload?.sub === configured.username ? { username: payload.sub, expiresAt: payload.exp } : null;
}

export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
