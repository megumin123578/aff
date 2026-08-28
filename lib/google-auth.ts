import "server-only";

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email?: boolean;
  name: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export function getGoogleConfig(currentOrigin?: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID || "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
  const appUrl =
    currentOrigin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === "production" ? "http://localhost:3000" : "http://localhost:3000");
  const redirectUri = `${appUrl.replace(/\/$/, "")}/api/auth/google/callback`;
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return {
    clientId,
    clientSecret,
    redirectUri,
    allowedEmails,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

export function createGoogleAuthUrl(state: string, currentOrigin?: string) {
  const { clientId, redirectUri } = getGoogleConfig(currentOrigin);
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: redirectUri,
    client_id: clientId,
    access_type: "offline",
    response_type: "code",
    prompt: "select_account",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
      "openid",
    ].join(" "),
    state,
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  currentOrigin?: string
): Promise<{ access_token: string; id_token?: string } | null> {
  const { clientId, clientSecret, redirectUri } = getGoogleConfig(currentOrigin);
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  };

  try {
    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(values).toString(),
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

export function isEmailAllowedForAdmin(email: string): boolean {
  const { allowedEmails } = getGoogleConfig();
  const adminUsername = (process.env.ADMIN_USERNAME || "").trim().toLowerCase();
  const lowerEmail = email.trim().toLowerCase();

  if (adminUsername && lowerEmail === adminUsername) return true;
  if (allowedEmails.includes(lowerEmail)) return true;

  if (allowedEmails.length === 0) {
    return true;
  }

  return false;
}
