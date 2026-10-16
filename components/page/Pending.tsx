import { ActionLink } from "@/components/ui/ActionLink";

import styles from "./page.module.css";

/**
 * Visitor-facing stand-in for content that has not been supplied yet (docs/ui-spec.md B8).
 * Search the codebase for <Pending to find every page section still waiting on content.
 */
export function Pending({ topic }: { topic: string }) {
  return (
    <div className={styles.pending}>
      <p>
        More about {topic} is on its way. In the meantime, we would be glad to answer your questions directly.
      </p>
      <ActionLink href="/contact" variant="text">
        Contact the club
      </ActionLink>
    </div>
  );
}
