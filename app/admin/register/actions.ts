"use server";

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

  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: "Registration request submitted. Please contact your administrator to activate access.",
    username: "",
    email: "",
  };
}
