import type { Metadata } from "next";
import { getAdminSession } from "@/lib/admin-auth";
import { UserManagementClient } from "./user-management-client";

export const metadata: Metadata = {
  title: "Team & Users - Admin CMS",
  description: "Manage team members, roles, and administrative access permissions.",
};

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getAdminSession();
  return <UserManagementClient currentUsername={session?.username} />;
}
