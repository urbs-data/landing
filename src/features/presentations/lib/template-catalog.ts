import { m } from "#/paraglide/messages";

export const presentationTemplateKeys = [
  "executive",
  "data-review",
  "pitch",
  "case-study",
] as const;

export type PresentationTemplateKey = (typeof presentationTemplateKeys)[number];

export type PresentationTemplateMode = "light" | "dark";

export function getPresentationTemplateCatalog() {
  return [
    {
      key: "executive",
      name: m.presentation_template_executive_name(),
      description: m.presentation_template_executive_description(),
      slides: m.presentation_template_slide_count({ count: 5 }),
    },
    {
      key: "data-review",
      name: m.presentation_template_data_review_name(),
      description: m.presentation_template_data_review_description(),
      slides: m.presentation_template_slide_count({ count: 5 }),
    },
    {
      key: "pitch",
      name: m.presentation_template_pitch_name(),
      description: m.presentation_template_pitch_description(),
      slides: m.presentation_template_slide_count({ count: 5 }),
    },
    {
      key: "case-study",
      name: m.presentation_template_case_study_name(),
      description: m.presentation_template_case_study_description(),
      slides: m.presentation_template_slide_count({ count: 5 }),
    },
  ] satisfies {
    key: PresentationTemplateKey;
    name: string;
    description: string;
    slides: string;
  }[];
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
