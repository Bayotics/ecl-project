import { meta } from "./meta";
import type { ImageSlot } from "./programs";
import type { CopyBlock, MediaRef, VideoSource } from "./types";

/**
 * History. The club's own account of how Eko Club began (supplied 2026-11-16), used word for word.
 * The original Eko Club's history is kept apart from Eko Club Louisiana's (Prompt 2 factual flags).
 */

/** The original Eko Club: the full account, shown in the reader window on /about/history. */
export const originalHistory: CopyBlock = {
  id: "original-eko-club",
  heading: "The history of Eko Club",
  paragraphs: [
    "Eko Club was founded in 1974 and was formally launched in May, 1975. To better understand the genesis of Eko Club, one would need to cast one’s mind back briefly to life in Lagos Island during the 1930’s and 1940’s – the period that saw the birth of all founding Members of the Club.",
    "EKO as Lagos Island is often referred to, consists of well demarcated areas each with its distinct characteristics and this mainly depends on the age of settlers in each area. Isale-Eko, Ebute-Ero, Alakoro, Idita, Isale-Offin, Apongbon, Itagarawu, Elegbata, Olowogbowo, Idumota, Ereko, Idumagbo, Oko-Awo, Isale-Gangan, Agoshofin, Okepopo, Epetedo, Lafiaji, Itafaji, Tinubu, Brazilian Quarters, Bamgbose, Campos, Obalende, each wore its various and distinct characteristics during occasions such as Egungun or Eyo Festivals. Ikoyi, was a different domain entirely, as the Race Course and the Burial Grounds at Ikoyi, provided the required buffer that effectively separated Eko from Ikoyi, the abode of the ruling whitemen. Apart from a house somewhere near the spot of the Police Post, there was no single constructed building at Victoria Island. It was all marsh land and coconut trees along the coast.",
    "The three bridges that joined Ikoyi and Victoria Island to Eko, then, were wooden plank bridges that could only take a car at a time. As a pedestrian, it was very dangerous to share the road with an on-coming vehicle.",
    "Schooling at the primary level was rather voluntary though the number of primary schools in Lagos then, was about twenty. Your hand must go across your head so that your finger touches the other ear before you can be admitted into Infant One. The British; unable to determine our age simply had to find a means to enable them get us into schools.",
    "The admission into these colleges was either by class or religious considerations. It was not surprising therefore, that not all Lagosians were able to get into these colleges. Some were admitted into far away institutions from home like the Ilesha Grammar School, Oduduwa College, Ile-Ife, Abeokuta Grammar School and Ijebu-Ode Grammar School, to mention a few.",
    "Lagosians, who were unable to secure secondary education, however got jobs with their Primary Six Certificate either in the Police or as clerks in the commercial shops or as Tally Clerks’ at Apapa Wharf.",
    "In those years, one could not forget some of the Cultural Activities such as: Egungun Masquerades such as Alapa Fuja, RA Bamgbose, Sunguru and Lampapa. Other cultural groups’ include- Igunnuko, Gelede, Gareta, Meboi, Isongbeto. There were also other games which were either in-door or out-door namely - Ogo, Ise, Ayo, Draught, Card Games.",
    "The formation of Boys’ Club in many areas of Lagos also assisted in bringing together youths in Lagos since inter social and educational activities were encouraged among the Boys’ Club. The notable ones are, Faji Boys’ Club, Alakoro Boys’ Club and Lafiaji Boys’ Club.",
    "Most Lagosians after secondary schools, proceeded abroad for further education or in search of golden fleece. As members, returned home from UK, USA, USSR in the late 1950’s and early 1960’s; Lagos, at this time had extended miles into the hinterland and many conurbations had developed within it. These included Apapa, Ajegunle, Surulere, Mushin, Shomolu, Ikeja, Ketu and Agege. This new trend made it difficult for these young men to meet as they used to do in their adolescent days.",
    "Most Nigerians (as well as the founding members) in these new areas of Lagos, worked on the Lagos Island, still using the very old and inadequate route to Lagos. This led to unprecedented traffic-jam termed “Go Slow” every day into Lagos in the morning and back on the mainland in the afternoon after close of work. Luckily, most Members of Eko Club, at the early stage had their family houses in Lagos Island, that they can still fall back on. As providence would have it, along the main route out of Lagos, the Sewing workshop and Show-Room of Mr. Sikiru.A. Agoro, alias “Boy Liverpool” was situated at 10, Bishop Street, (now Alhaji Issa Williams Street, Lagos). This served as the nerve-cooling centre for the founding members. Members would stop by to say hello to Mr Sikiru Agoro. The shop soon became a meeting point of friends, sitting down socializing till evening. Saturdays were known to be most notorious for traffic-jams, so the numbers of callers at Alhaji Agoro’s shop were highest on Saturdays. This mode of avoiding traffic-jam and invariably relaxation continued for a period, hence the need to purchase chairs, tables and glasses became inevitable. Members decided to make a contribution of £2 (Four Naira) per head for this purpose.",
    "By the end of 1973, the numbers of friends that gathered daily and especially on Saturdays, for relaxation and social gossips had doubled. On one such occasion the idea was mooted that the group be properly organized and that a separate identity be given this group of young men. The idea received overwhelming support and there and then a Club was born. Protem Officers were immediately chosen and Mr. Mutiu O. Bishogun, became the Protem Chairman. He was therefore privileged to preside over subsequent meetings and the Saturdays’ Sittings. The Chairman was vested with powers to impose fines ranging from one to two Naira. The element of fines, as well as homage paid to the Chairman in cash every Saturday, generated a lot of fun and the source of income for the new Club. This practice is still in existence till date and continues to be the main source of income for the club.",
    "In the subsequent year, Members of the group were formally registered and a Constitution Drafting Committee appointed. After a series of meeting of Registered Members at Apongbon Street site of the now defunct “West End Coliseum”, a Constitution was adopted and the Club christened ‘Eko’. This name was chosen amongst two others after a heated debate. The other names considered were: Lagos Elites Club, Lagos Social Club, House of Gentlemen etc.",
    "The Club has come a long way since its founding. With an initial membership of 93, it has now grown to over 1000 members. It has virtually become an institution, a reference point for the community at large. The Club’s activities permeate the whole society, and there has been a systematic devolution of leadership role of the Club in the recent past.",
    "For all of us, the Club has been the pillars upon which our living heritage rests. From those who came before, and for those who are yet to come",
  ],
  ...meta(
    { source: "club-supplied", note: "The club's history of Eko Club, supplied 2026-11-16 for the History page. Used word for word, with four typos corrected at the club's request (mooted, others, £2, notable)." },
    { verified: true, notes: [] },
  ),
};

/**
 * Eko Club Louisiana's own history. Draft until the club supplies an approved account (founding date,
 * founders, milestones). Not shown on the site while it is a draft.
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

/** The first `limit` characters of the account, cut at a word and closed with an ellipsis. */
export function historyExcerpt(paragraphs: string[], limit = 500): string[] {
  const out: string[] = [];
  let used = 0;
  for (const paragraph of paragraphs) {
    if (used + paragraph.length <= limit) {
      out.push(paragraph);
      used += paragraph.length;
      continue;
    }
    const room = limit - used;
    const cut = paragraph.slice(0, room);
    const end = cut.lastIndexOf(" ");
    out.push(`${(end > 0 ? cut.slice(0, end) : cut).replace(/[\s,;:–-]+$/, "")}…`);
    break;
  }
  return out;
}

/** The History page film is on R2 (over GitHub's 100 MB limit): see scripts/upload-history-video.mjs. */
const films = `${(process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "")}/site-media/history`;

/**
 * Everything else on /about/history is drawn from the account above. Photos are registered in
 * content/media.ts; an image slot without `image` shows a gradient placeholder.
 */
export const historyPage = {
  breadcrumb: [
    { label: "Home", href: "/" },
    { label: "About us", href: "/about" },
  ],
  eyebrow: "Our history · Since 1974",
  title: ["Born on", "Lagos Island"],
  lead: "Eko Club was founded in 1974 and formally launched in May 1975 by friends who grew up together on Lagos Island in the 1930s and 1940s.",
  facts: [
    { value: "1974", label: "Eko Club founded" },
    { value: "May 1975", label: "Formally launched" },
    { value: "93", label: "Founding members" },
    { value: "1,000+", label: "Members today" },
  ],
  story: {
    label: "The story",
    heading: "How it began",
    image: { label: "Lagos Island beside the lagoon", image: { asset: "historyLagosIsland" } } satisfies ImageSlot,
  },
  founder: {
    name: "The late Olusesi Dawodu",
    role: "Founding President, Eko Club International",
    image: { asset: "historyDawodu" } satisfies MediaRef,
  },
  film: {
    label: "Film · 2009",
    heading: "The keynote address",
    caption: "Keynote address, Eko Club International, the 6th International Convention. O’Hare Marriott Hotel, Chicago, Illinois, October 08–11, 2009",
    duration: "44 min",
    // #t=7.5 starts playback after the recording's "Beginning of disc 2" title card.
    sources: [{ src: `${films}/keynote-2009.mp4#t=7.5`, type: "video/mp4" }] as VideoSource[],
    poster: { asset: "historyKeynotePoster" } as MediaRef | undefined,
  },
  timeline: {
    label: "Timeline",
    heading: "From Saturday sittings to an institution",
    items: [
      { when: "Early 1970s", title: "Saturdays at 10 Bishop Street", text: "Avoiding the daily “Go Slow”, friends gathered at the shop of Mr. Sikiru A. Agoro, “Boy Liverpool”, and chipped in for chairs, tables and glasses." },
      { when: "End of 1973", title: "A club is born", text: "The gathering had doubled. The group agreed to organise, and Mr. Mutiu O. Bishogun became the Protem Chairman." },
      { when: "1974", title: "Founded and named ‘Eko’", text: "Members were formally registered and a Constitution adopted. ‘Eko’ was chosen over Lagos Elites Club, Lagos Social Club and House of Gentlemen." },
      { when: "May 1975", title: "Formally launched", text: "Eko Club was formally launched." },
      { when: "Today", title: "From 93 to over 1,000", text: "From an initial membership of 93, the club has grown to over 1000 members: a reference point for the community at large." },
    ],
  },
  quarters: {
    label: "Eko",
    heading: "Quarter by quarter",
    text: "Lagos Island was made of well-demarcated areas, each with its own character, worn with pride during the Egungun and Eyo festivals.",
    names: [
      "Isale-Eko", "Ebute-Ero", "Alakoro", "Idita", "Isale-Offin", "Apongbon", "Itagarawu", "Elegbata", "Olowogbowo", "Idumota", "Ereko", "Idumagbo",
      "Oko-Awo", "Isale-Gangan", "Agoshofin", "Okepopo", "Epetedo", "Lafiaji", "Itafaji", "Tinubu", "Brazilian Quarters", "Bamgbose", "Campos", "Obalende",
    ],
    image: { label: "An Eyo masquerade figure on a parade float in Lagos", image: { asset: "lagosEyoFloat" } } satisfies ImageSlot,
    culture: [
      { title: "Masquerades", items: ["Alapa Fuja", "RA Bamgbose", "Sunguru", "Lampapa"] },
      { title: "Cultural groups", items: ["Igunnuko", "Gelede", "Gareta", "Meboi", "Isongbeto"] },
      { title: "Games", items: ["Ogo", "Ise", "Ayo", "Draught", "Card games"] },
    ],
  },
  bishopStreet: {
    label: "10 Bishop Street",
    heading: "Chairs, tables and glasses",
    quote: "This served as the nerve-cooling centre for the founding members.",
    text: "Friends heading home stopped at the sewing workshop of Mr. Sikiru A. Agoro, “Boy Liverpool”, at 10 Bishop Street (now Alhaji Issa Williams Street), and stayed, socialising till evening. Saturdays brought the most friends, and soon chairs, tables and glasses had to be bought. Pulling up a chair together is still what the club does best.",
    image: { label: "Members seated together, drinks in hand, at an Eko Club Louisiana oldies night", image: { asset: "asoOkeCouple" } } satisfies ImageSlot,
  },
  closing: {
    text: "For all of us, the Club has been the pillars upon which our living heritage rests.",
    note: "From those who came before, and for those who are yet to come",
  },
  readLabel: "Read full history",
};
