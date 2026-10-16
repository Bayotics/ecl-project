import { meta } from "./meta";
import type { CopyBlock } from "./types";

/**
 * History is kept in two separate records so the original Eko Club's history is never presented as
 * Eko Club Louisiana's own founding (Prompt 2 factual flags).
 */

/** The original Eko Club. */
export const originalHistory: CopyBlock = {
  id: "original-eko-club",
  heading: "The original Eko Club",
  paragraphs: [
    "Eko Club was founded in 1974 and launched in May 1975. Eko is the traditional name for Lagos, and the club's name carries that heritage.",
    "These dates belong to the original Eko Club. They are not the founding date of Eko Club Louisiana.",
  ],
  ...meta(
    { source: "brief-prompt-2", note: "Prompt 2 factual flags: the original Eko Club's 1974 founding and May 1975 launch." },
    {
      verified: false,
      notes: ["Confirm the 1974/1975 dates and wording with Eko Club International before launch."],
    },
  ),
};

/**
 * Eko Club Louisiana's own history. Draft until the club supplies an approved account (founding date,
 * founders, milestones); the page shows an honest "being written" note while this is a draft.
 */
export const chapterHistory: CopyBlock = {
  id: "eko-club-louisiana",
  heading: "Eko Club Louisiana",
  paragraphs: [],
  ...meta(
    { source: "editorial-draft", note: "No approved chapter history has been supplied." },
    { verified: false, notes: ["Supply the approved history of the Louisiana chapter."] },
    "draft",
  ),
};
