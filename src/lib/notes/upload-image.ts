"use client";

import { data } from "@/lib/data/store";

export const NOTE_IMAGE_BUCKET = "note-images";
const MAX_SIDE = 2000;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/** Büyük görselleri en uzun kenarı 2000 px olacak şekilde küçültür; küçükleri olduğu gibi bırakır. */
async function shrink(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 1.5 * 1024 * 1024) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  return new Promise((res) => canvas.toBlob((b) => res(b ?? file), type, 0.86));
}

const toDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result));
    r.onerror = rej;
    r.readAsDataURL(b);
  });

/**
 * Not görselini kaydeder ve adresini döner.
 * Supabase bağlıyken kullanıcının kendi klasörüne yüklenir (Storage, "note-images");
 * önizleme modunda görsel notun içine gömülür.
 */
export async function uploadNoteImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Sadece JPG, PNG, WebP ya da GIF görsel eklenebilir.");
  if (file.size > MAX_BYTES) throw new Error("Görsel 10 MB'tan büyük olamaz.");
  const blob = await shrink(file);
  const { mode, userId } = data();
  if (mode !== "remote" || !userId) return toDataUrl(blob);

  const ext = { "image/png": "png", "image/gif": "gif", "image/webp": "webp" }[blob.type] ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const { error } = await supabase.storage.from(NOTE_IMAGE_BUCKET).upload(path, blob, { contentType: blob.type, cacheControl: "31536000" });
  // Depo henüz kurulmadıysa ya da yükleme başarısızsa görseli notun içine göm (veri kaybolmasın)
  if (error) return toDataUrl(blob);
  return supabase.storage.from(NOTE_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
