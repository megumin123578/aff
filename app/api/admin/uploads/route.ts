import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

const imageExtensions = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No image file was provided" }, { status: 400 });

  const extension = imageExtensions.get(file.type);
  if (!extension) return NextResponse.json({ error: "Only JPEG, PNG, WebP and GIF images are supported" }, { status: 415 });
  if (file.size === 0 || file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "Image must be between 1 byte and 8 MB" }, { status: 413 });

  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  const filename = `${randomUUID()}.${extension}`;
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()), { flag: "wx" });

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
