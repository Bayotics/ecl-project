"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type FormEvent } from "react";

import { api } from "@/lib/api-client";

import styles from "./EventMediaManager.module.css";

type Category = { id: string; title: string; slug?: string; published?: boolean };
type Media = {
  id: string; category_id: string; title: string; media_type: "image" | "video"; media_url: string;
  poster_url: string; preview_url?: string; alt_text: string; caption: string; sort_order: number; published: boolean; created_at: string;
};
type Job = { key: string; file: File; type: string; kind: "image" | "video"; progress: number; state: "waiting" | "preparing" | "uploading" | "saving" | "done" | "failed"; error?: string };

/** What can be uploaded. Originals are stored exactly as chosen; photos also get a web-size copy for display. */
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const IMAGE_MAX_MB = 50;
const VIDEO_MAX_MB = 2048;
const AT_ONCE = 3;
const EXTENSIONS: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", avif: "image/avif", mp4: "video/mp4", m4v: "video/mp4", webm: "video/webm", mov: "video/quicktime" };

/** Some systems leave the type blank (often for .mov): fall back to the file extension. */
const typeOf = (file: File) => (file.type && file.type !== "application/octet-stream" ? file.type : EXTENSIONS[file.name.split(".").pop()?.toLowerCase() ?? ""] ?? file.type);
const sizeLabel = (bytes: number) => (bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(2)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`);

function check(file: File): string | null {
  const type = typeOf(file);
  const video = VIDEO_TYPES.includes(type);
  if (/\.(heic|heif)$/i.test(file.name)) return "HEIC photos do not display in most browsers. Export as JPEG first (on iPhone: Settings › Camera › Formats › Most Compatible).";
  if (!video && !IMAGE_TYPES.includes(type)) return "Not a supported file. Use JPEG, PNG, WebP or AVIF photos, or MP4, MOV or WebM videos.";
  if (file.size > (video ? VIDEO_MAX_MB : IMAGE_MAX_MB) * 1024 * 1024) return video ? "Videos must be under 2 GB." : `Photos must be under ${IMAGE_MAX_MB} MB.`;
  return null;
}

/** Long edge of the web-size copy: sharp on large and high-density screens, a fraction of a camera original's size. */
const PREVIEW_EDGE = 2400;

/**
 * Camera originals run to 15–20 MB, far too heavy for a page of thumbnails, so photos also get a
 * web-size copy (about 2400px, WebP or JPEG at high quality, typically under 1 MB) that the website
 * shows. The original is uploaded untouched alongside it. Returns null when the photo is already
 * small enough to show as it is.
 */
async function webCopy(file: File): Promise<Blob | null> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, PREVIEW_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1.5 * 1024 * 1024) return null;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) return null;
    context.imageSmoothingQuality = "high";
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const encode = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));
    // Browsers that cannot write WebP (older Safari) silently return PNG: use JPEG there instead.
    const webp = await encode("image/webp");
    return webp?.type === "image/webp" ? webp : await encode("image/jpeg");
  } finally {
    bitmap.close();
  }
}

/** PUT straight to Cloudflare R2 through a signed URL, reporting progress. */
function put(url: string, file: Blob, type: string, onProgress: (fraction: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", type);
    xhr.upload.onprogress = (event) => event.lengthComputable && onProgress(event.loaded / event.total);
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("The connection dropped. Retry this file."));
    xhr.send(file);
  });
}

const record = (item: Media) => ({
  title: item.title, category_id: item.category_id, media_type: item.media_type, media_url: item.media_url, poster_url: item.poster_url ?? "",
  preview_url: item.preview_url ?? "", alt_text: item.alt_text, caption: item.caption ?? "", sort_order: item.sort_order ?? 0, published: Boolean(item.published),
});

export function EventMediaManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [batchTitle, setBatchTitle] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState<Media | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const running = useRef(false);

  const load = useCallback(async () => {
    try {
      const result = await api<{ rows: Media[]; categories: Category[] }>("/api/admin/event_media");
      setMedia(result.rows);
      setCategories(result.categories);
      setSelected((current) => current || result.categories[0]?.id || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load photos and videos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => void load());
    return () => cancelAnimationFrame(frame);
  }, [load]);

  const category = categories.find((c) => c.id === selected);
  const items = useMemo(() => media.filter((m) => m.category_id === selected), [media, selected]);
  const counts = (id: string) => {
    const list = media.filter((m) => m.category_id === id);
    const videos = list.filter((m) => m.media_type === "video").length;
    return { photos: list.length - videos, videos };
  };

  const patchJob = useCallback((key: string, patch: Partial<Job>) => setJobs((all) => all.map((job) => (job.key === key ? { ...job, ...patch } : job))), []);

  /** Uploads one file and creates its record under the chosen category. */
  const send = useCallback(
    async (job: Job, categoryId: string, title: string, categoryTitle: string, published: boolean) => {
      patchJob(job.key, { state: job.kind === "image" ? "preparing" : "uploading", progress: 0, error: undefined });
      try {
        const sign = (type: string, size: number) => api<{ uploadUrl: string; publicUrl: string }>("/api/admin/upload", { body: { bucket: "event-media", contentType: type, size } });
        // The web-size copy is made first (a second or two) so its upload is part of the progress bar.
        let copy: Blob | null = null;
        if (job.kind === "image") {
          try {
            copy = await webCopy(job.file);
          } catch {
            copy = null; // A photo the browser cannot decode is still uploaded; the site then shows the original.
          }
          patchJob(job.key, { state: "uploading" });
        }
        const total = job.file.size + (copy?.size ?? 0);
        const original = await sign(job.type, job.file.size);
        await put(original.uploadUrl, job.file, job.type, (fraction) => patchJob(job.key, { progress: (fraction * job.file.size) / total }));
        let previewUrl = "";
        if (copy) {
          const preview = await sign(copy.type, copy.size);
          await put(preview.uploadUrl, copy, copy.type, (fraction) => patchJob(job.key, { progress: (job.file.size + fraction * copy.size) / total }));
          previewUrl = preview.publicUrl;
        }
        patchJob(job.key, { state: "saving", progress: 1 });
        const name = title || categoryTitle;
        await api("/api/admin/event_media", {
          body: {
            title: name, category_id: categoryId, media_type: job.kind, media_url: original.publicUrl, poster_url: "", preview_url: previewUrl,
            alt_text: `${job.kind === "video" ? "Video" : "Photo"} from ${name}`, caption: "", sort_order: 0, published,
          },
        });
        patchJob(job.key, { state: "done" });
        return true;
      } catch (e) {
        patchJob(job.key, { state: "failed", error: e instanceof Error ? e.message : "Upload failed." });
        return false;
      }
    },
    [patchJob],
  );

  /** Runs the queue AT_ONCE files at a time, then reloads the grid. */
  const run = useCallback(
    async (queue: Job[]) => {
      if (!category || running.current || !queue.length) return;
      running.current = true;
      setNotice("");
      const settings = [category.id, batchTitle.trim(), category.title, publishNow] as const;
      let next = 0;
      let failed = 0;
      const worker = async () => {
        while (next < queue.length) {
          const job = queue[next++];
          if (!(await send(job, ...settings))) failed++;
        }
      };
      await Promise.all(Array.from({ length: Math.min(AT_ONCE, queue.length) }, worker));
      running.current = false;
      await load();
      const done = queue.length - failed;
      setNotice(failed ? `${done} of ${queue.length} uploaded. Retry the ones marked failed.` : `${done} ${done === 1 ? "file" : "files"} added to ${category.title}${publishNow ? " and published" : " as drafts"}.`);
    },
    [category, batchTitle, publishNow, send, load],
  );

  const add = (files: FileList | File[] | null) => {
    if (!files?.length || !category) return;
    setError("");
    const rejected: string[] = [];
    const queue: Job[] = [];
    for (const file of Array.from(files)) {
      const problem = check(file);
      if (problem) {
        rejected.push(`${file.name}: ${problem}`);
        continue;
      }
      const type = typeOf(file);
      queue.push({ key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`, file, type, kind: VIDEO_TYPES.includes(type) ? "video" : "image", progress: 0, state: "waiting" });
    }
    setJobs((all) => [...all.filter((job) => job.state !== "done"), ...queue]);
    if (rejected.length) setError(`Skipped ${rejected.length} ${rejected.length === 1 ? "file" : "files"}:\n${rejected.join("\n")}`);
    void run(queue);
  };

  const retry = () => {
    setError("");
    void run(jobs.filter((job) => job.state === "failed"));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    add(event.dataTransfer.files);
  };

  async function save(item: Media) {
    setBusy(true);
    setError("");
    try {
      await api(`/api/admin/event_media/${encodeURIComponent(item.id)}`, { method: "PATCH", body: record(item) });
      await load();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Media) {
    if (!confirm(`Delete this ${item.media_type === "video" ? "video" : "photo"} from the website? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await api(`/api/admin/event_media/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setBusy(false);
    }
  }

  async function submitEdit(event: FormEvent) {
    event.preventDefault();
    if (editing && (await save(editing))) {
      setEditing(null);
      setNotice("Saved.");
    }
  }

  const active = jobs.filter((job) => job.state !== "done" && job.state !== "failed").length;
  const failed = jobs.filter((job) => job.state === "failed").length;

  return (
    <section className={styles.shell}>
      <div className={styles.content}>
        <Link className={styles.back} href="/admin">
          ← Administration
        </Link>
        <div className={styles.header}>
          <div>
            <h1>Event photos &amp; videos</h1>
            <p className={styles.lead}>Choose a category, then add as many photos and videos as you like. They go straight to Cloudflare at full quality.</p>
          </div>
          <Link className={styles.secondaryLink} href="/admin/event_categories">
            Manage categories
          </Link>
        </div>

        {error && <p role="alert" className={styles.error}>{error}</p>}
        {notice && <p role="status" className={styles.notice}>{notice}</p>}

        {loading ? (
          <p role="status">Loading…</p>
        ) : !categories.length ? (
          <p className={styles.empty}>
            No event categories yet. <Link href="/admin/event_categories">Create a category</Link> first.
          </p>
        ) : (
          <>
            <div className={styles.categories} role="tablist" aria-label="Event categories">
              {categories.map((c) => {
                const { photos, videos } = counts(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={c.id === selected}
                    className={styles.category}
                    onClick={() => {
                      setSelected(c.id);
                      setEditing(null);
                    }}
                    disabled={active > 0}
                  >
                    <span className={styles.categoryTitle}>{c.title}</span>
                    <span className={styles.categoryCount}>
                      {photos} {photos === 1 ? "photo" : "photos"} · {videos} {videos === 1 ? "video" : "videos"}
                    </span>
                    {c.published === false && <span className={styles.badge}>Hidden category</span>}
                  </button>
                );
              })}
            </div>

            {category && (
              <div className={styles.panel} role="tabpanel" aria-label={category.title}>
                <div
                  className={styles.drop}
                  data-dragging={dragging || undefined}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <p className={styles.dropTitle}>Add to {category.title}</p>
                  <p className={styles.dropText}>Drag photos and videos here, or</p>
                  <button type="button" className={styles.primary} onClick={() => input.current?.click()} disabled={active > 0}>
                    Choose files
                  </button>
                  <input
                    ref={input}
                    type="file"
                    multiple
                    hidden
                    accept={[...IMAGE_TYPES, ...VIDEO_TYPES, ".mov", ".m4v"].join(",")}
                    onChange={(e) => {
                      add(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <p className={styles.hint}>
                    Photos: JPEG, PNG, WebP or AVIF up to {IMAGE_MAX_MB} MB. Videos: MP4, MOV or WebM up to 2 GB. Originals are kept exactly as uploaded; the website shows a sharp web-size copy of each photo so pages load quickly.
                  </p>
                  <div className={styles.batch}>
                    <label>
                      Title shown with these uploads
                      <input value={batchTitle} placeholder={category.title} onChange={(e) => setBatchTitle(e.target.value)} disabled={active > 0} />
                    </label>
                    <label className={styles.check}>
                      <input type="checkbox" checked={publishNow} onChange={(e) => setPublishNow(e.target.checked)} disabled={active > 0} />
                      Publish on the website straight away
                    </label>
                  </div>
                </div>

                {jobs.length > 0 && (
                  <div className={styles.queue}>
                    <div className={styles.queueHead}>
                      <p>{active ? `Uploading… ${jobs.length - active} of ${jobs.length} finished` : "Uploads"}</p>
                      <div>
                        {failed > 0 && !active && (
                          <button type="button" className={styles.secondary} onClick={retry}>
                            Retry {failed} failed
                          </button>
                        )}
                        {!active && (
                          <button type="button" className={styles.linkButton} onClick={() => setJobs([])}>
                            Clear list
                          </button>
                        )}
                      </div>
                    </div>
                    <ul role="list">
                      {jobs.map((job) => (
                        <li key={job.key} className={styles.job} data-state={job.state}>
                          <span className={styles.jobName}>
                            {job.kind === "video" ? "▶ " : ""}
                            {job.file.name}
                          </span>
                          <span className={styles.jobSize}>{sizeLabel(job.file.size)}</span>
                          <span className={styles.jobState}>
                            {job.state === "uploading" ? `${Math.round(job.progress * 100)}%` : job.state === "preparing" ? "Preparing…" : job.state === "saving" ? "Saving…" : job.state === "done" ? "Done" : job.state === "failed" ? "Failed" : "Waiting"}
                          </span>
                          <span className={styles.bar} aria-hidden="true">
                            <span style={{ transform: `scaleX(${job.state === "done" ? 1 : job.progress})` }} />
                          </span>
                          {job.error && <span className={styles.jobError}>{job.error}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {editing && (
                  <form className={styles.editor} onSubmit={submitEdit}>
                    <h2>Edit {editing.media_type === "video" ? "video" : "photo"}</h2>
                    <div className={styles.editorGrid}>
                      <div className={styles.editorPreview}>
                        {editing.media_type === "video" ? (
                          <video src={editing.media_url} controls preload="metadata" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- admin preview of the web-size copy
                          <img src={editing.preview_url || editing.media_url} alt="" />
                        )}
                      </div>
                      <div className={styles.editorFields}>
                        <label>
                          Title
                          <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                        </label>
                        <label>
                          Description (read aloud by screen readers)
                          <input required value={editing.alt_text} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} />
                        </label>
                        <label>
                          Caption {editing.media_type === "video" ? "or transcript" : ""}
                          <textarea value={editing.caption ?? ""} onChange={(e) => setEditing({ ...editing, caption: e.target.value })} />
                        </label>
                        <label>
                          Category
                          <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                            {categories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        {editing.media_type === "video" && (
                          <label>
                            Poster image URL (optional, shown before the video plays)
                            <input value={editing.poster_url ?? ""} onChange={(e) => setEditing({ ...editing, poster_url: e.target.value })} />
                          </label>
                        )}
                        <label>
                          Display order (lower shows first)
                          <input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) || 0 })} />
                        </label>
                        <label className={styles.check}>
                          <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                          Published on the website
                        </label>
                        <div className={styles.actions}>
                          <button type="submit" className={styles.primary} disabled={busy}>
                            {busy ? "Saving…" : "Save changes"}
                          </button>
                          <button type="button" className={styles.secondary} onClick={() => setEditing(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                <div className={styles.gridHead}>
                  <h2>In {category.title}</h2>
                  <p>{items.length ? `${items.length} ${items.length === 1 ? "item" : "items"}` : ""}</p>
                </div>
                {items.length ? (
                  <ul role="list" className={styles.grid}>
                    {items.map((item) => (
                      <li key={item.id} className={styles.tile}>
                        <div className={styles.thumb}>
                          {item.media_type === "video" ? (
                            <video src={`${item.media_url}#t=0.5`} poster={item.poster_url || undefined} preload="metadata" muted playsInline />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of the web-size copy
                            <img src={item.preview_url || item.media_url} alt={item.alt_text} loading="lazy" decoding="async" />
                          )}
                          <span className={styles.type}>{item.media_type === "video" ? "Video" : "Photo"}</span>
                          <span className={styles.status} data-published={item.published || undefined}>
                            {item.published ? "Published" : "Draft"}
                          </span>
                        </div>
                        <p className={styles.tileTitle}>{item.title}</p>
                        <div className={styles.tileActions}>
                          <button type="button" onClick={() => setEditing({ ...item })} disabled={busy}>
                            Edit
                          </button>
                          <button type="button" onClick={() => void save({ ...item, published: !item.published })} disabled={busy}>
                            {item.published ? "Hide" : "Publish"}
                          </button>
                          <button type="button" onClick={() => void remove(item)} disabled={busy}>
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>Nothing in {category.title} yet. Add photos and videos above.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
