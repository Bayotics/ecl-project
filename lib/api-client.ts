/** Calls the site's own JSON API from the browser; throws the server's message on failure. */
export async function api<T = Record<string, unknown>>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(path, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    headers: init.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: "same-origin",
    cache: "no-store",
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string } & T;
  if (!response.ok || data.ok === false) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

export type Me = { user: { id: string; email: string; role: "member" | "admin" } | null; profile: { full_name: string; phone: string } | null };

/** Uploads a file to media storage through a signed URL from the admin API; returns its public URL. */
export async function uploadMedia(bucket: "site-media" | "event-media", file: Blob) {
  const { uploadUrl, publicUrl } = await api<{ uploadUrl: string; publicUrl: string }>("/api/admin/upload", { body: { bucket, contentType: file.type, size: file.size } });
  const response = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!response.ok) throw new Error("The upload did not complete. Please try again.");
  return publicUrl;
}
