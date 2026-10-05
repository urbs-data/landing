/**
 * Canonical brand violet. Mirrors the `--primary` token in `src/styles.css`
 * (`oklch(50.2% 0.1452 297.1)` → `#6E4DAB`) for surfaces that cannot read CSS
 * variables: OG images, generated PPTX decks and email signatures.
 */
export const BRAND_VIOLET = "#6E4DAB";

/** {@link BRAND_VIOLET} without the leading `#`, as OOXML/pptxgenjs expects. */
export const BRAND_VIOLET_HEX = BRAND_VIOLET.slice(1);
