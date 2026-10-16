import { causes } from "./causes";
import { published } from "./meta";

/** Interest options for the join and volunteer forms: the six published mission areas. */
export const programInterests = () => published(causes).map((cause) => ({ id: cause.slug, label: cause.title }));

export const volunteerInterests = () => [...programInterests(), { id: "events", label: "Club events" }];

/**
 * Copy for the join and volunteer pages. Deliberately states no fees, dues, eligibility rules or
 * acceptance criteria: those come from the club.
 */
export const joinCopy = {
  intro:
    "Eko Club Louisiana brings together the sons, daughters and friends of Lagos in Louisiana. Tell us a little about yourself and a member of the club will be in touch about membership.",
  notice:
    "Sending this form is a request to join, not confirmation of membership. The club will contact you about the next steps.",
  acknowledge:
    "I understand this is a request to join, not confirmation of membership, and agree that the club may contact me about it.",
};

export const volunteerCopy = {
  intro:
    "Give your time and skills to the club's work in Louisiana. Tell us what interests you and when you are usually available, and the club will be in touch.",
  consent: "I agree that Eko Club Louisiana may contact me about volunteering.",
};
