import { statSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";

import { PageIntro } from "@/components/page/PageIntro";
import { PageSection } from "@/components/page/PageSection";
import styles from "@/components/page/page.module.css";
import { published } from "@/content/meta";
import { pages } from "@/content/pages";
import { pageMetadata } from "@/lib/seo";
import { reportKindLabel, reports } from "@/content/reports";
import { settings } from "@/content/site";
import type { Report } from "@/content/types";

export const metadata: Metadata = pageMetadata({ title: pages.reports.title, description: pages.reports.description, path: pages.reports.href });

/** Size of a file under /public, or null when it does not exist (checked at build). */
function fileSize(publicPath: string | null): number | null {
  if (!publicPath?.startsWith("/")) return null;
  const resolved = path.join(process.cwd(), "public", publicPath);
  if (!resolved.startsWith(path.join(process.cwd(), "public"))) return null;
  try {
    const stat = statSync(resolved);
    return stat.isFile() ? stat.size : null;
  } catch {
    return null;
  }
}

const formatSize = (bytes: number) => (bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`);

const formatPeriod = ({ start, end }: Report["period"]) => {
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));
  return `${fmt(start)} – ${fmt(end)}`;
};

export default function ReportsPage() {
  const list = published(reports).sort((a, b) => b.period.end.localeCompare(a.period.end));
  const { email } = settings.contact;

  return (
    <>
      <PageIntro label={pages.reports.label} title={pages.reports.title} lead={pages.reports.lead} />
      <PageSection id="documents" title="Documents">
        {list.length ? (
          <ul role="list" className={styles.docs}>
            {list.map((report) => {
              const size = fileSize(report.file);
              const extension = report.file?.split(".").pop()?.toUpperCase() ?? "";
              return (
                <li key={report.slug} className={styles.doc}>
                  <div>
                    <p className={styles.docMeta}>
                      {reportKindLabel[report.kind]} · {formatPeriod(report.period)}
                    </p>
                    <h3 className={styles.docTitle}>{report.title}</h3>
                    <p className={styles.docText}>{report.description}</p>
                  </div>
                  {/* A download is offered only for a file that actually exists. */}
                  {report.file && size !== null ? (
                    <a href={report.file} download className={`${styles.action} ${styles.docAction}`}>
                      Download {extension} · {formatSize(size)}
                    </a>
                  ) : (
                    <p className={`${styles.docText} ${styles.docAction}`}>
                      Available on request from <a href={`mailto:${email}`}>{email}</a>
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.notice}>
            No reports have been published yet. Governance, financial and impact documents will appear here, with their
            reporting periods, as the club approves them for publication. Questions about the club&apos;s finances or
            governance are welcome at <a href={`mailto:${email}`}>{email}</a>.
          </p>
        )}
      </PageSection>
    </>
  );
}
