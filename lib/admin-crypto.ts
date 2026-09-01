import { createHmac, timingSafeEqual } from "node:crypto";
const SESSION_VERSION = 1;
export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60;

export type UserRole = "admin" | "user";

export type SessionPayload = {
  sub: string;
  email?: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
  iat: number;
  exp: number;
  v: number;
};

export type SessionOptions = {
  avatar?: string;
  email?: string;
  name?: string;
  role?: UserRole;
  now?: number;
};

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyAdminPassword(password: string, configuredPassword: string, passwordKey: string) {
  if (!password || !configuredPassword || !passwordKey) return false;
  const supplied = createHmac("sha256", passwordKey).update(password).digest();
  const expected = createHmac("sha256", passwordKey).update(configuredPassword).digest();
  return timingSafeEqual(supplied, expected);
}

export function signAdminSession(
  username: string,
  secret: string,
  nowOrAvatarOrOptions?: number | string | SessionOptions,
  avatar?: string
) {
  let now = Date.now();
  let avatarUrl: string | undefined = avatar;
  let email: string | undefined;
  let name: string | undefined;
  let role: UserRole = "admin";

  if (typeof nowOrAvatarOrOptions === "number") {
    now = nowOrAvatarOrOptions;
  } else if (typeof nowOrAvatarOrOptions === "string") {
    avatarUrl = nowOrAvatarOrOptions;
  } else if (nowOrAvatarOrOptions && typeof nowOrAvatarOrOptions === "object") {
    if (nowOrAvatarOrOptions.now) now = nowOrAvatarOrOptions.now;
    if (nowOrAvatarOrOptions.avatar) avatarUrl = nowOrAvatarOrOptions.avatar;
    if (nowOrAvatarOrOptions.email) email = nowOrAvatarOrOptions.email;
    if (nowOrAvatarOrOptions.name) name = nowOrAvatarOrOptions.name;
    if (nowOrAvatarOrOptions.role) role = nowOrAvatarOrOptions.role;
  }

  const issuedAt = Math.floor(now / 1000);
  const payload: SessionPayload = {
    sub: username,
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
    ...(avatarUrl ? { avatar: avatarUrl } : {}),
    role,
    iat: issuedAt,
    exp: issuedAt + SESSION_TTL_SECONDS,
    v: SESSION_VERSION,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyAdminSession(token: string, secret: string, now = Date.now()): SessionPayload | null {
  try {
    const [encodedPayload, suppliedSignature] = token.split(".");
    if (!encodedPayload || !suppliedSignature) return null;
    const expectedSignature = createHmac("sha256", secret).update(encodedPayload).digest("base64url");
    if (!safeEqual(suppliedSignature, expectedSignature)) return null;
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
    const currentTime = Math.floor(now / 1000);
    if (payload.v !== SESSION_VERSION || !payload.sub || payload.exp <= currentTime || payload.iat > currentTime + 60) return null;
    return payload;
  } catch {
    return null;
  }
}
