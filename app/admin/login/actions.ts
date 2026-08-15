"use server";

import { redirect } from "next/navigation";
import { authenticateAdmin, createAdminSession } from "@/lib/admin-auth";

export type LoginState = { error: string; username: string };

export async function loginAdminAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") || "").trim().slice(0, 128);
  const password = String(formData.get("password") || "").slice(0, 512);
  const valid = await authenticateAdmin(username, password);

  if (!valid) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { error: "Invalid username or password.", username };
  }

  await createAdminSession(username);
  redirect("/admin");
}
