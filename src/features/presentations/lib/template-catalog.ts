import { m } from "#/paraglide/messages";

export const presentationTemplateKeys = [
  "executive",
  "data-review",
  "pitch",
  "case-study",
] as const;

export type PresentationTemplateKey = (typeof presentationTemplateKeys)[number];

export type PresentationTemplateMode = "light" | "dark";

/**
 * Slides per deck, shown in the catalog. Kept here (instead of derived from
 * `pptx-decks`) so the client bundle doesn't pull in every deck's copy; a test
 * asserts it stays in sync with the generated decks.
 */
export const presentationTemplateSlideCounts: Record<
  PresentationTemplateKey,
  number
> = {
  executive: 5,
  "data-review": 5,
  pitch: 5,
  "case-study": 5,
};

const templateCopy: Record<
  PresentationTemplateKey,
  { name: () => string; description: () => string }
> = {
  executive: {
    name: m.presentation_template_executive_name,
    description: m.presentation_template_executive_description,
  },
  "data-review": {
    name: m.presentation_template_data_review_name,
    description: m.presentation_template_data_review_description,
  },
  pitch: {
    name: m.presentation_template_pitch_name,
    description: m.presentation_template_pitch_description,
  },
  "case-study": {
    name: m.presentation_template_case_study_name,
    description: m.presentation_template_case_study_description,
  },
};

export function getPresentationTemplateCatalog() {
  return presentationTemplateKeys.map((key) => ({
    key,
    name: templateCopy[key].name(),
    description: templateCopy[key].description(),
    slides: m.presentation_template_slide_count({
      count: presentationTemplateSlideCounts[key],
    }),
  }));
}

export function isPresentationTemplateKey(
  key: string,
): key is PresentationTemplateKey {
  return presentationTemplateKeys.some((templateKey) => templateKey === key);
}

export function isPresentationTemplateMode(
  mode: string,
): mode is PresentationTemplateMode {
  return mode === "light" || mode === "dark";
}
