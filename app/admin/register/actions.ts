"use server";

import { redirect } from "next/navigation";
import { createAdminSession } from "@/lib/admin-auth";

export type RegisterState = {
  error?: string;
  success?: string;
  username?: string;
  email?: string;
};

export async function registerAdminAction(
  _state: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const username = String(formData.get("username") || "").trim().slice(0, 128);
  const email = String(formData.get("email") || "").trim().slice(0, 256);
  const password = String(formData.get("password") || "").slice(0, 512);
  const confirmPassword = String(formData.get("confirmPassword") || "").slice(0, 512);

  if (!username || !password) {
    return { error: "Please enter both username and password.", username, email };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters.", username, email };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", username, email };
  }

  const avatar = `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}`;
  await createAdminSession(username, {
    email: email || undefined,
    avatar,
    role: "admin",
  });

  redirect("/admin");
}
