"use client";

import { useState } from "react";
import { AvatarDisplay } from "@/components/avatar-display";
import { Badge, Card, Button } from "@/components/ui";

export type UserRole = "Super Admin" | "Editor" | "Author" | "Viewer";
export type UserStatus = "Active" | "Pending" | "Suspended";

export interface TeamUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  twoFactorEnabled: boolean;
  lastActive: string;
  joinedAt: string;
}

const INITIAL_USERS: TeamUser[] = [
  {
    id: "usr-1",
    username: "admin",
    name: "Primary Administrator",
    email: "admin@neroviax.com",
    role: "Super Admin",
    status: "Active",
    avatar: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=admin",
    twoFactorEnabled: true,
    lastActive: "Just now",
    joinedAt: "2026-01-10",
  },
  {
    id: "usr-2",
    username: "alex_dev",
    name: "Alex Nguyen",
    email: "alex@neroviax.com",
    role: "Editor",
    status: "Active",
    avatar: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Astro",
    twoFactorEnabled: true,
    lastActive: "2 hours ago",
    joinedAt: "2026-02-14",
  },
  {
    id: "usr-3",
    username: "sarah_cloud",
    name: "Sarah Jenkins",
    email: "sarah.j@neroviax.com",
    role: "Author",
    status: "Active",
    avatar: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Cyber",
    twoFactorEnabled: false,
    lastActive: "Yesterday",
    joinedAt: "2026-04-02",
  },
  {
    id: "usr-4",
    username: "marcus_reviewer",
    name: "Marcus Vance",
    email: "marcus.v@partner.neroviax.com",
    role: "Viewer",
    status: "Pending",
    avatar: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Spark",
    twoFactorEnabled: false,
    lastActive: "Never",
    joinedAt: "2026-08-20",
  },
];

const AUDIT_LOGS = [
  { id: "log-1", user: "admin", action: "Updated security credentials", target: "System", time: "10 mins ago" },
  { id: "log-2", user: "alex_dev", action: "Published article", target: "Top 7 Mini PCs for Home Server", time: "2 hours ago" },
  { id: "log-3", user: "admin", action: "Sent invitation", target: "marcus.v@partner.neroviax.com", time: "3 days ago" },
  { id: "log-4", user: "sarah_cloud", action: "Updated draft", target: "Best VPS Providers in Europe", time: "4 days ago" },
];

function generateRandomPassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint32Array(12);
    window.crypto.getRandomValues(array);
    return Array.from(array, (x) => chars[x % chars.length]).join("");
  }
  return "Neroviax@2026";
}

export function UserManagementClient({ currentUsername }: { currentUsername?: string }) {
  const [users, setUsers] = useState<TeamUser[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Modal states
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<TeamUser | null>(null);
  const [resetPwUser, setResetPwUser] = useState<TeamUser | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Invite form state
  const [inviteName, setInviteName] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("Editor");

  // Reset password state
  const [tempPassword, setTempPassword] = useState("");

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalMembers = users.length;
  const adminCount = users.filter((u) => u.role === "Super Admin").length;
  const editorCount = users.filter((u) => u.role === "Editor" || u.role === "Author").length;
  const pendingCount = users.filter((u) => u.status === "Pending").length;

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUsername.trim() || !inviteEmail.trim()) return;

    const newUser: TeamUser = {
      id: `usr-${Date.now()}`,
      username: inviteUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, ""),
      name: inviteName.trim() || inviteUsername.trim(),
      email: inviteEmail.trim().toLowerCase(),
      role: inviteRole,
      status: "Pending",
      avatar: `https://api.dicebear.com/10.x/bottts-neutral/svg?seed=${encodeURIComponent(inviteUsername)}`,
      twoFactorEnabled: false,
      lastActive: "Never",
      joinedAt: new Date().toISOString().slice(0, 10),
    };

    setUsers([newUser, ...users]);
    setInviteModalOpen(false);
    setInviteName("");
    setInviteUsername("");
    setInviteEmail("");
    setInviteRole("Editor");
    setFeedbackMsg({ type: "success", text: `Invitation sent to ${newUser.email} successfully.` });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleSaveEditRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setUsers(users.map((u) => (u.id === editUser.id ? editUser : u)));
    setEditUser(null);
    setFeedbackMsg({ type: "success", text: `Updated permissions for @${editUser.username}.` });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleToggleStatus = (user: TeamUser) => {
    const nextStatus: UserStatus = user.status === "Active" ? "Suspended" : "Active";
    setUsers(users.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
    setFeedbackMsg({
      type: "success",
      text: `User @${user.username} is now ${nextStatus.toLowerCase()}.`,
    });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleDeleteUser = (userId: string, username: string) => {
    if (username === "admin") {
      alert("The primary Super Admin account cannot be deleted.");
      return;
    }
    if (!confirm(`Are you sure you want to remove @${username} from the team?`)) return;
    setUsers(users.filter((u) => u.id !== userId));
    setFeedbackMsg({ type: "success", text: `Removed @${username} from team.` });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleGenerateReset = (user: TeamUser) => {
    setTempPassword(generateRandomPassword());
    setResetPwUser(user);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 @min-[640px]:flex-row @min-[640px]:items-end @min-[640px]:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Team & Users</h1>
          <p className="mt-2 text-sm text-slate-400">
            Manage team members, administrative privileges, and security permissions.
          </p>
        </div>
        <Button
          onClick={() => setInviteModalOpen(true)}
          variant="azure"
          className="flex items-center gap-2 shadow-lg"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span>Invite New User</span>
        </Button>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold flex items-center justify-between ${
            feedbackMsg.type === "success"
              ? "border-(--color-success-border) bg-(--color-success-soft) text-(--color-success-text)"
              : "border-(--color-danger-border) bg-(--color-danger-soft) text-(--color-danger-text)"
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button type="button" onClick={() => setFeedbackMsg(null)} className="text-xs opacity-75 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 @min-[640px]:grid-cols-2 @min-[1024px]:grid-cols-4">
        <Card className="p-5 border-l-4 border-l-(--color-brand)">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Members</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{totalMembers}</p>
          <p className="mt-1 text-[11px] text-slate-500">Full workspace access</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-cyan-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Administrators</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{adminCount}</p>
          <p className="mt-1 text-[11px] text-cyan-400">System & Auth access</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-emerald-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Content Editors</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{editorCount}</p>
          <p className="mt-1 text-[11px] text-emerald-400">Publishing & Affiliate ops</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-amber-400">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Invites</p>
          <p className="mt-2 text-3xl font-extrabold text-white">{pendingCount}</p>
          <p className="mt-1 text-[11px] text-amber-400">Awaiting acceptance</p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 @min-[768px]:flex-row @min-[768px]:items-center @min-[768px]:justify-between">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, username or email…"
              className="w-full rounded-xl border border-(--color-border) bg-(--color-bg) py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-(--color-brand-border) focus:ring-1 focus:ring-(--color-brand)"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-xs font-semibold text-slate-200 outline-none focus:border-(--color-brand-border)"
            >
              <option value="All">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Editor">Editor</option>
              <option value="Author">Author</option>
              <option value="Viewer">Viewer</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2.5 text-xs font-semibold text-slate-200 outline-none focus:border-(--color-brand-border)"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-(--color-border) bg-(--color-surface-muted) text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">2FA Security</th>
                <th className="px-6 py-4">Last Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--color-border)">
              {filteredUsers.map((user) => {
                const isCurrent = user.username === currentUsername;
                return (
                  <tr key={user.id} className="transition hover:bg-(--color-surface-muted)/50">
                    {/* User Profile */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full border border-(--color-brand-border) bg-(--color-brand-soft) p-0.5">
                          <AvatarDisplay avatar={user.avatar} username={user.username} className="size-8" />
                          {user.status === "Active" && (
                            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-(--color-surface)" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{user.name}</span>
                            {isCurrent && (
                              <span className="rounded-md bg-(--color-brand-soft) px-1.5 py-0.5 text-[10px] font-bold text-(--color-brand-light) border border-(--color-brand-border)">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            @{user.username} · <span className="text-slate-500">{user.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          user.role === "Super Admin"
                            ? "azure"
                            : user.role === "Editor"
                            ? "mint"
                            : "default"
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            user.status === "Active"
                              ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                              : user.status === "Pending"
                              ? "bg-amber-400"
                              : "bg-rose-400"
                          }`}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            user.status === "Active"
                              ? "text-emerald-300"
                              : user.status === "Pending"
                              ? "text-amber-300"
                              : "text-rose-300"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </td>

                    {/* 2FA */}
                    <td className="px-6 py-4">
                      {user.twoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                          Enabled
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">Disabled</span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4 text-xs text-slate-400">{user.lastActive}</td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditUser(user)}
                          title="Edit user role & permissions"
                          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted) hover:text-white"
                        >
                          Edit Role
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateReset(user)}
                          title="Reset user password"
                          className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted) hover:text-white"
                        >
                          Reset Pwd
                        </button>
                        {user.username !== "admin" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              title={user.status === "Active" ? "Suspend user" : "Reactivate user"}
                              className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted) hover:text-white"
                            >
                              {user.status === "Active" ? "Suspend" : "Activate"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              title="Delete user"
                              className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/20"
                            >
                              ✕
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-slate-400">
                    No team members found matching your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit & Activity Log */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-(--color-border) pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Team Activity</h2>
            <p className="text-xs text-slate-400">Audit trail of administrator and team changes.</p>
          </div>
          <Badge variant="default">Audit Trail</Badge>
        </div>
        <div className="mt-4 divide-y divide-(--color-border)">
          {AUDIT_LOGS.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center rounded-full bg-(--color-surface-muted) font-mono text-[10px] font-bold text-(--color-brand-light)">
                  @{log.user.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-white">@{log.user}</span>{" "}
                  <span className="text-slate-400">{log.action}</span>:{" "}
                  <span className="font-medium text-slate-200">{log.target}</span>
                </div>
              </div>
              <span className="text-slate-500">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Modal 1: Invite New User */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setInviteModalOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-4">
              <h3 className="text-base font-bold text-white">Invite Team Member</h3>
              <button
                type="button"
                onClick={() => setInviteModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-muted) hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleInviteSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="e.g. john_dev"
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@neroviax.com"
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Role & Permissions
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                >
                  <option value="Super Admin">Super Admin (Full system control)</option>
                  <option value="Editor">Editor (Publish articles & affiliate links)</option>
                  <option value="Author">Author (Draft and edit assigned posts)</option>
                  <option value="Viewer">Viewer (Read-only analytics access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-5 py-2 text-xs font-bold text-white hover:bg-(--color-brand-hover) shadow-sm"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit User Role */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setEditUser(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-4">
              <h3 className="text-base font-bold text-white">Edit Permissions: @{editUser.username}</h3>
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-muted) hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveEditRole} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  User Role
                </label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value as UserRole })}
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                >
                  <option value="Super Admin">Super Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Author">Author</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Status
                </label>
                <select
                  value={editUser.status}
                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value as UserStatus })}
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-5 py-2 text-xs font-bold text-white hover:bg-(--color-brand-hover) shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Temporary Password Generator */}
      {resetPwUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setResetPwUser(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-4">
              <h3 className="text-base font-bold text-white">Reset Password: @{resetPwUser.username}</h3>
              <button
                type="button"
                onClick={() => setResetPwUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-muted) hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <p className="text-xs text-slate-300">
                A temporary secure password has been generated for <strong>{resetPwUser.email}</strong>:
              </p>
              <div className="flex items-center justify-between rounded-xl border border-(--color-brand-border) bg-(--color-brand-soft) p-3 font-mono text-sm font-bold text-white">
                <span>{tempPassword}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(tempPassword);
                    alert("Temporary password copied to clipboard!");
                  }}
                  className="rounded-lg bg-(--color-brand) px-2.5 py-1 text-xs text-white hover:bg-(--color-brand-hover)"
                >
                  Copy
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                The user will be prompted to change this password on their next login session.
              </p>
              <div className="flex justify-end pt-2">
                <Button onClick={() => setResetPwUser(null)} variant="azure" size="small">
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
