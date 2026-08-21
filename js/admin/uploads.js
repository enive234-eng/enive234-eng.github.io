const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateImage(file, maxMB = 5) {
  if (!ALLOWED_TYPES[file.type])
    return "Please choose a JPEG, PNG or WebP image.";
  if (file.size > maxMB * 1024 * 1024)
    return `Images must be ${maxMB}MB or smaller.`;
  return null;
}

export function slugify(text) {
  return (
    String(text || "image")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60) || "image"
  );
}

function buildFilename(baseName, file) {
  const ext = ALLOWED_TYPES[file.type];
  const unique = (
    crypto.randomUUID ? crypto.randomUUID() : String(Date.now())
  ).slice(0, 8);
  return `${slugify(baseName)}-${unique}.${ext}`;
}

export async function uploadImage(
  client,
  bucket,
  file,
  { baseName, folder, oldPath } = {},
) {
  const filename = buildFilename(baseName, file);
  const path = folder ? `${folder}/${filename}` : filename;
  const { error } = await client.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type,
  });
  if (error) return { error };
  if (oldPath)
    await client.storage
      .from(bucket)
      .remove([oldPath])
      .catch(() => {});
  return { path };
}

export async function removeImage(client, bucket, path) {
  if (!path) return { error: null };
  const { error } = await client.storage.from(bucket).remove([path]);
  return { error };
}

export function publicUrl(client, bucket, path) {
  if (!path) return "";
  return client.storage.from(bucket).getPublicUrl(path).data?.publicUrl || "";
}
