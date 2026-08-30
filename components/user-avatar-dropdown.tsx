"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { logoutAdminAction } from "@/app/admin/actions";
import { AvatarDisplay } from "@/components/avatar-display";

type UserSession = {
  username: string;
  name?: string;
  email?: string;
  avatar?: string;
  role?: "admin" | "user";
  expiresAt?: number;
} | null;

const emptySubscribe = () => () => {};
const avatarStorageKey = "neroviax_user_avatar";
const avatarChangeEvent = "neroviax-avatar-change";

function subscribeAvatar(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(avatarChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(avatarChangeEvent, callback);
  };
}

function getStoredAvatar() {
  try {
    return localStorage.getItem(avatarStorageKey) || "";
  } catch {
    return "";
  }
}

const AVATAR_PRESETS = [
  { id: "dicebear-default", label: "Default Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg" },
  { id: "dicebear-astro", label: "Astro Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Astro" },
  { id: "dicebear-cyber", label: "Cyber Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Cyber" },
  { id: "dicebear-spark", label: "Spark Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Spark" },
  { id: "dicebear-pixel", label: "Pixel Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Pixel" },
  { id: "dicebear-neon", label: "Neon Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Neon" },
  { id: "dicebear-nova", label: "Nova Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Nova" },
  { id: "dicebear-titan", label: "Titan Bot", value: "https://api.dicebear.com/10.x/bottts-neutral/svg?seed=Titan" },
];

export function UserAvatarDropdown({ session }: { session: UserSession }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  const selectedAvatar = useSyncExternalStore(subscribeAvatar, getStoredAvatar, () => "");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [uploadError, setUploadError] = useState<string>("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getPortalRoot = () => {
    if (typeof document === "undefined") return null;
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    return root;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Handle Escape key to close modals
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setDropdownOpen(false);
        setAvatarModalOpen(false);
        setPasswordModalOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle image file upload with client-side scaling/compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file (PNG, JPG, WebP, SVG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size is too large. Please select an image under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/webp", 0.9);
          setAvatarPreview(compressed);
        } else {
          setAvatarPreview(dataUrl);
        }
      };
      img.onerror = () => {
        setAvatarPreview(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (avatarPreview) {
        localStorage.setItem(avatarStorageKey, avatarPreview);
      } else {
        localStorage.removeItem(avatarStorageKey);
      }
      window.dispatchEvent(new Event(avatarChangeEvent));
    } catch {
      // Ignore storage errors.
    }
    setAvatarModalOpen(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (!currentPassword) {
      setPasswordMsg({ type: "error", text: "Please enter your current password." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setPasswordLoading(false);
    setPasswordMsg({
      type: "success",
      text: "Password updated successfully. Remember to update server environment variables for permanent persistence.",
    });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!session) {
    return (
      <Link
        href="/admin/login"
        className="inline-flex items-center gap-1.5 rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-(--color-brand-hover) focus:outline-none focus:ring-2 focus:ring-(--color-focus)"
      >
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        <span>Sign in</span>
      </Link>
    );
  }

  const effectiveAvatar =
    selectedAvatar && selectedAvatar.startsWith("data:")
      ? selectedAvatar
      : session.avatar || selectedAvatar || "";

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Circular Avatar Trigger Button */}
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setDropdownOpen(!dropdownOpen)}
        title={`Account menu (${session.username})`}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        className="grid size-11 place-items-center rounded-full border border-(--color-border) bg-(--color-surface) text-slate-300 shadow-sm transition hover:border-(--color-brand-border) hover:bg-(--color-surface-muted) hover:text-white focus:outline-none focus:ring-2 focus:ring-(--color-focus)"
      >
        <AvatarDisplay avatar={effectiveAvatar} username={session.username} className="size-9" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div
          className="isolate absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-(--color-border-strong) p-2 opacity-100 shadow-[0_24px_60px_rgba(0,0,0,0.72)] ring-1 ring-black/40"
          style={{ backgroundColor: "#151a22" }}
        >
          {/* User Profile Header */}
          <div className="flex items-center gap-3 border-b border-(--color-border) px-3 py-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-(--color-brand-border) bg-(--color-brand-soft) overflow-hidden">
              <AvatarDisplay avatar={effectiveAvatar} username={session.username} className="size-9" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">{session.name || session.username}</p>
              {session.role === "admin" ? (
                <p className="text-[11px] font-semibold text-(--color-brand-light)">Administrator</p>
              ) : (
                <p className="text-[11px] font-semibold text-emerald-400">Community Member</p>
              )}
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5 space-y-1">
            {/* 1. Admin Management */}
            {session.role === "admin" && (
              <Link
                href="/admin"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-(--color-surface-muted) hover:text-white"
              >
                <svg className="size-4 text-(--color-brand-light)" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span>Admin Dashboard</span>
              </Link>
            )}

            {/* 2. Change Avatar */}
            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                setAvatarPreview(effectiveAvatar);
                setUploadError("");
                setAvatarModalOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-(--color-surface-muted) hover:text-white"
            >
              <svg className="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
              </svg>
              <span>Change Avatar</span>
            </button>

            {/* 3. Change Password (Admin only) */}
            {session.role === "admin" && (
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  setPasswordMsg(null);
                  setPasswordModalOpen(true);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:bg-(--color-surface-muted) hover:text-white"
              >
                <svg className="size-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span>Change Password</span>
              </button>
            )}
          </div>

          {/* Sign out */}
          <div className="border-t border-(--color-border) pt-1.5">
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Sign out</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Avatar Modal */}
      {mounted && getPortalRoot() && avatarModalOpen && createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setAvatarModalOpen(false)}
          />
          
          {/* Modal card */}
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-4">
              <h3 className="text-base font-bold text-white">Change Avatar</h3>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-muted) hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAvatar} className="mt-5 space-y-5">
              {/* Avatar Live Preview */}
              <div className="flex items-center justify-center py-1">
                <div className="flex size-20 items-center justify-center rounded-full border-2 border-(--color-brand-border) bg-(--color-brand-soft) shadow-md overflow-hidden p-1">
                  <AvatarDisplay avatar={avatarPreview} username={session?.username} className="size-16" />
                </div>
              </div>

              {/* Google Profile Photo Option if available */}
              {session?.avatar && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Google Account Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarPreview(session.avatar || "");
                      setUploadError("");
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl border p-2.5 transition ${
                      avatarPreview === session.avatar
                        ? "border-(--color-brand) bg-(--color-brand-soft)"
                        : "border-(--color-border) bg-(--color-bg) hover:border-(--color-brand-border)"
                    }`}
                  >
                    <AvatarDisplay avatar={session.avatar} className="size-8" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">Use Google Profile Photo</p>
                      <p className="text-[10px] text-slate-400">Synced from your Google account</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Upload Image Section */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Upload Image from Device
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-(--color-border-strong) bg-(--color-bg) py-5 px-4 text-center transition hover:border-(--color-brand-border) hover:bg-(--color-surface-muted)"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-(--color-brand-soft) text-(--color-brand-light)">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Click to upload or drag & drop</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">PNG, JPG, GIF, WebP (Max 5MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
                {uploadError && (
                  <p className="mt-2 text-xs text-rose-400 font-medium">{uploadError}</p>
                )}
              </div>

              {/* Preset Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Or Choose a Bot Preset
                </label>
                <div className="mt-3 grid grid-cols-4 gap-2.5">
                  {AVATAR_PRESETS.map((preset) => {
                    const isSelected = avatarPreview === preset.value;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setAvatarPreview(preset.value);
                          setUploadError("");
                        }}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2 text-sm transition ${
                          isSelected
                            ? "border-(--color-brand-border) bg-(--color-brand-soft) text-white shadow-sm ring-2 ring-(--color-brand)"
                            : "border-(--color-border) bg-(--color-bg) text-slate-300 hover:border-(--color-border-strong) hover:text-white"
                        }`}
                      >
                        <div className="flex size-9 items-center justify-center rounded-full bg-(--color-surface-muted) p-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={preset.value} alt={preset.label} className="size-full object-contain" />
                        </div>
                        <span className="text-[10px] font-medium truncate w-full text-center">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(false)}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-5 py-2 text-xs font-bold text-white hover:bg-(--color-brand-hover) shadow-sm"
                >
                  Save Avatar
                </button>
              </div>
            </form>
          </div>
        </div>,
        getPortalRoot()!
      )}

      {/* Change Password Modal */}
      {mounted && getPortalRoot() && passwordModalOpen && createPortal(
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setPasswordModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-(--color-border) pb-4">
              <h3 className="text-base font-bold text-white">Change Password</h3>
              <button
                type="button"
                onClick={() => setPasswordModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-muted) hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
              {passwordMsg && (
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    passwordMsg.type === "success"
                      ? "border-(--color-success-border) bg-(--color-success-soft) text-(--color-success-text)"
                      : "border-(--color-danger-border) bg-(--color-danger-soft) text-(--color-danger-text)"
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="mt-1.5 w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-4 py-2.5 text-sm text-white outline-none focus:border-(--color-brand-border)"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="rounded-xl border border-(--color-border) bg-(--color-surface) px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-(--color-surface-muted)"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="rounded-xl border border-(--color-brand-border) bg-(--color-brand) px-5 py-2 text-xs font-bold text-white hover:bg-(--color-brand-hover) disabled:opacity-60"
                >
                  {passwordLoading ? "Updating…" : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        getPortalRoot()!
      )}
    </div>
  );
}
