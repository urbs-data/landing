import JSZip from "jszip";
import PptxGenJS from "pptxgenjs";
import type { AppLocale } from "#/i18n";
import { BRAND_VIOLET_HEX } from "#/lib/brand";
import { m } from "#/paraglide/messages";
import { brandAssets } from "./brand-assets";
import { type FontFace, fontAssets } from "./font-assets";
import {
  type BarChartData,
  buildDecks,
  type Deck,
  type Metric,
  msg,
  type SlideSpec,
  type Step,
} from "./pptx-decks";
import type {
  PresentationTemplateKey,
  PresentationTemplateMode,
} from "./template-catalog";

/* -------------------------------------------------------------------------- */
/*  Brand system                                                              */
/* -------------------------------------------------------------------------- */

const LAYOUT = { name: "URBS_WIDE", width: 13.333, height: 7.5 };

// Straight corners everywhere ("esquinas rectas"). Brand fonts are referenced
// by name; the logo and "urbs" wordmark ship as raster assets so Syne is
// never required on the machine that opens the file.
const FONT = {
  heading: "Instrument Sans", // titulares
  body: "IBM Plex Sans", // cuerpo / UI
  mono: "Pitagon Sans Mono", // kickers / datos / código
};

// Escala de datos derivada del morado de marca (dark → light).
const DATA_SCALE = [BRAND_VIOLET_HEX, "AA95DE", "C0B1E9", "D2C6F3", "DED5F9"];

const SEMANTIC = { ok: "2B9A66", warn: "E8A400", err: "E5484D" };

type Palette = ReturnType<typeof palette>;
function palette(mode: PresentationTemplateMode) {
  if (mode === "dark") {
    return {
      mode,
      bg: "111113",
      surface: "19191B",
      surfaceAlt: "201C29",
      ink: "EDEEF0",
      muted: "B2B3BE",
      faint: "70727C",
      border: "34343A",
      accent: BRAND_VIOLET_HEX, // rellenos sólidos y botones
      accentText: "C087FF", // logo y textos pequeños (intensificado)
      onAccent: "FFFFFF",
      data: DATA_SCALE,
    };
  }
  return {
    mode,
    bg: "FCFCFD",
    surface: "FFFFFF",
    surfaceAlt: "F0EDFA", // lila suave
    ink: "1C2024",
    muted: "60646C",
    faint: "8B8D98",
    border: "D9D9E0",
    accent: BRAND_VIOLET_HEX,
    accentText: BRAND_VIOLET_HEX,
    onAccent: "FFFFFF",
    data: DATA_SCALE,
  };
}

// Deep-plum background for closing / hero-accent slides.
const CLOSING = {
  bg: "2A1D45",
  ink: "FFFFFF",
  muted: "C9BEE6",
  border: "4A3B6B",
  accent: BRAND_VIOLET_HEX,
  accentText: "C9B3F5",
};

// Slide layouts embedded in every file. These show up in PowerPoint's
// "New Slide" / "Layout" picker, so anyone extending the deck gets the brand
// furniture (logo, header, footer, page number) for free.
//
// cover / content / closing are furniture-only (no placeholders) — the
// generated slides draw their content with absolute boxes, so leaving
// placeholders here would show empty "Click to add…" prompts on top. The
// remaining layouts are placeholder-driven and exist purely for "New Slide".
function masterNames(locale: AppLocale) {
  return {
    cover: msg(locale, m.ppt_layout_cover),
    content: msg(locale, m.ppt_layout_content),
    closing: msg(locale, m.ppt_layout_closing),
    separator: msg(locale, m.ppt_layout_separator),
    section: msg(locale, m.ppt_layout_section),
    subsection: msg(locale, m.ppt_layout_subsection),
    twoCol: msg(locale, m.ppt_layout_two_columns),
    threeCol: msg(locale, m.ppt_layout_three_columns),
  };
}

type MasterNames = ReturnType<typeof masterNames>;

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                  */
/* -------------------------------------------------------------------------- */

const MX = 0.75; // side margin
const CW = LAYOUT.width - MX * 2; // content width
const RIGHT = LAYOUT.width - MX; // right edge
const FOOT_RULE_Y = 6.78;
const FOOT_TXT_Y = 6.94;

type Slide = PptxGenJS.Slide;

/** Absolute frame in inches. */
type Box = { x: number; y: number; w: number; h: number };
/** Frame whose height is driven by its content (rows, table). */
type Span = Omit<Box, "h">;

/* -------------------------------------------------------------------------- */
/*  Brand asset helpers                                                       */
/* -------------------------------------------------------------------------- */

function logo(mode: PresentationTemplateMode, white = false) {
  if (white) return brandAssets.logoWhite;
  return mode === "dark"
    ? brandAssets.logoIntensified
    : brandAssets.logoPrimary;
}

function wordmark(mode: PresentationTemplateMode, white = false) {
  if (white) return brandAssets.wordmarkWhite;
  return mode === "dark" ? brandAssets.wordmarkDark : brandAssets.wordmarkLight;
}

const WORDMARK_RATIO = 367 / 150; // asset aspect ratio (brand/wordmark-*.svg)
const LOGO_RATIO = 193 / 150; // asset aspect ratio (brand/logo*.svg)

/* -------------------------------------------------------------------------- */
/*  Slide masters (reusable layouts + brand furniture)                        */
/* -------------------------------------------------------------------------- */

type MasterObjects = NonNullable<PptxGenJS.SlideMasterProps["objects"]>;
type MasterObject = MasterObjects[number];
type PlaceholderObject = Extract<MasterObject, { placeholder: unknown }>;
type PlaceholderOptions = PlaceholderObject["placeholder"]["options"];

function placeholderOptions(
  options: PlaceholderOptions & { charSpacing?: number },
): PlaceholderOptions {
  return options;
}

function defineMasters(
  pptx: PptxGenJS,
  mode: PresentationTemplateMode,
  deck: Deck,
  locale: AppLocale,
  MASTER: MasterNames,
) {
  const t = palette(mode);
  const label = deck.label.toUpperCase();
  const lockW = 1.14;

  // Header: brand wordmark (logo + "urbs") top-left, deck label top-right.
  const header = (dark = false): MasterObjects => [
    {
      image: {
        data: wordmark(mode, dark),
        x: MX,
        y: 0.44,
        w: lockW,
        h: lockW / WORDMARK_RATIO,
      },
    },
    {
      text: {
        text: label,
        options: {
          x: RIGHT - 5,
          y: 0.5,
          w: 5,
          h: 0.3,
          align: "right",
          valign: "middle",
          color: dark ? CLOSING.muted : t.faint,
          fontFace: FONT.mono,
          fontSize: 8,
          charSpacing: 1.4,
          margin: 0,
        },
      },
    },
  ];

  const footer = (dark = false): MasterObjects => [
    {
      rect: {
        x: MX,
        y: FOOT_RULE_Y,
        w: CW,
        h: 0.01,
        fill: { color: dark ? CLOSING.border : t.border },
        line: { type: "none" },
      },
    },
    {
      text: {
        text: label,
        options: {
          x: MX,
          y: FOOT_TXT_Y,
          w: 8,
          h: 0.22,
          color: dark ? CLOSING.muted : t.faint,
          fontFace: FONT.mono,
          fontSize: 7.2,
          charSpacing: 1.4,
          margin: 0,
        },
      },
    },
  ];

  const pageNumber = (dark = false) => ({
    x: RIGHT - 1.1,
    y: FOOT_TXT_Y,
    w: 1.1,
    h: 0.22,
    align: "right" as const,
    color: dark ? CLOSING.muted : t.faint,
    fontFace: FONT.mono,
    fontSize: 7.6,
  });

  const watermarkW = 4.2;
  const watermarkH = watermarkW / LOGO_RATIO;
  const watermark = (dark = false): MasterObject => ({
    image: {
      data: logo(mode, dark),
      x: LAYOUT.width - 3.5,
      y: LAYOUT.height - watermarkH + 0.7,
      w: watermarkW,
      h: watermarkH,
      transparency: dark ? 92 : 90,
    },
  });

  const titlePh = (
    y: number,
    h: number,
    size: number,
    prompt: string,
    w = 11,
  ): MasterObject => ({
    placeholder: {
      options: placeholderOptions({
        name: "title",
        type: "title",
        x: MX,
        y,
        w,
        h,
        color: t.ink,
        fontFace: FONT.heading,
        fontSize: size,
        bold: true,
        charSpacing: -0.5,
        align: "left",
        valign: "top",
      }),
      text: prompt,
    },
  });

  const bodyPh = (
    name: string,
    { x, y, w, h }: Box,
    prompt: string,
    size = 14,
  ): MasterObject => ({
    placeholder: {
      options: {
        name,
        type: "body",
        x,
        y,
        w,
        h,
        color: t.muted,
        fontFace: FONT.body,
        fontSize: size,
        align: "left",
        valign: "top",
      },
      text: prompt,
    },
  });

  // Accent dash + kicker placeholder, mirroring the manual's "— SECCIÓN".
  const kickerPh = (y: number): MasterObjects => [
    {
      rect: {
        x: MX,
        y: y + 0.075,
        w: 0.22,
        h: 0.03,
        fill: { color: t.accentText },
        line: { type: "none" },
      },
    },
    {
      placeholder: {
        options: placeholderOptions({
          name: "kicker",
          type: "body",
          x: MX + 0.32,
          y,
          w: 6,
          h: 0.24,
          color: t.accentText,
          fontFace: FONT.mono,
          fontSize: 9.5,
          charSpacing: 1.8,
          align: "left",
          valign: "top",
        }),
        text: msg(locale, m.ppt_master_section),
      },
    },
  ];

  /* -- Portada (furniture only; generated cover adds the content) -- */
  pptx.defineSlideMaster({
    title: MASTER.cover,
    background: { color: t.bg },
    objects: [
      watermark(),
      {
        image: {
          data: wordmark(mode),
          x: MX,
          y: 0.92,
          w: 2.9,
          h: 2.9 / WORDMARK_RATIO,
        },
      },
      {
        rect: {
          x: MX,
          y: FOOT_RULE_Y,
          w: CW,
          h: 0.01,
          fill: { color: t.border },
          line: { type: "none" },
        },
      },
      {
        text: {
          text: "URBS DATA",
          options: {
            x: MX,
            y: FOOT_TXT_Y,
            w: 1.1,
            h: 0.22,
            color: t.ink,
            bold: true,
            fontFace: FONT.mono,
            fontSize: 7.6,
            charSpacing: 0.8,
            margin: 0,
          },
        },
      },
      {
        text: {
          text: msg(locale, m.ppt_footer_service),
          options: {
            x: MX + 1.02,
            y: FOOT_TXT_Y,
            w: 8,
            h: 0.22,
            color: t.faint,
            fontFace: FONT.mono,
            fontSize: 7.6,
            charSpacing: 0.8,
            margin: 0,
          },
        },
      },
      {
        text: {
          text: msg(locale, m.ppt_footer_origin),
          options: {
            x: RIGHT - 4,
            y: FOOT_TXT_Y,
            w: 4,
            h: 0.22,
            align: "right",
            color: t.faint,
            fontFace: FONT.mono,
            fontSize: 7.6,
            charSpacing: 1,
            margin: 0,
          },
        },
      },
    ],
  });

  /* -- Contenido (furniture only) -- */
  pptx.defineSlideMaster({
    title: MASTER.content,
    background: { color: t.bg },
    slideNumber: pageNumber(),
    objects: [...header(), ...footer()],
  });

  /* -- Cierre (furniture only) -- */
  pptx.defineSlideMaster({
    title: MASTER.closing,
    background: { color: CLOSING.bg },
    slideNumber: pageNumber(true),
    objects: [
      watermark(true),
      {
        image: {
          data: wordmark(mode, true),
          x: MX,
          y: 0.9,
          w: 2.3,
          h: 2.3 / WORDMARK_RATIO,
        },
      },
      ...footer(true),
    ],
  });

  /* -- Separador (section divider) -- */
  pptx.defineSlideMaster({
    title: MASTER.separator,
    background: { color: t.surfaceAlt },
    slideNumber: pageNumber(),
    objects: [
      watermark(),
      ...header(),
      ...footer(),
      {
        placeholder: {
          options: placeholderOptions({
            name: "kicker",
            type: "body",
            x: MX,
            y: 2.7,
            w: 10,
            h: 0.5,
            color: t.accentText,
            fontFace: FONT.mono,
            fontSize: 16,
            charSpacing: 2,
            bold: true,
            align: "left",
            valign: "top",
          }),
          text: msg(locale, m.ppt_master_separator),
        },
      },
      titlePh(3.25, 1.9, 40, msg(locale, m.ppt_master_separator_title)),
    ],
  });

  /* -- Sección (kicker + title + body) -- */
  pptx.defineSlideMaster({
    title: MASTER.section,
    background: { color: t.bg },
    slideNumber: pageNumber(),
    objects: [
      ...header(),
      ...footer(),
      ...kickerPh(1.28),
      titlePh(1.66, 1.2, 30, msg(locale, m.ppt_master_section_title)),
      bodyPh(
        "body",
        { x: MX, y: 2.9, w: 10.6, h: 3.2 },
        msg(locale, m.ppt_master_slide_body),
      ),
    ],
  });

  /* -- Subsección (smaller title + body) -- */
  pptx.defineSlideMaster({
    title: MASTER.subsection,
    background: { color: t.bg },
    slideNumber: pageNumber(),
    objects: [
      ...header(),
      ...footer(),
      titlePh(1.5, 0.9, 22, msg(locale, m.ppt_master_subtitle)),
      bodyPh(
        "body",
        { x: MX, y: 2.5, w: 10.6, h: 3.6 },
        msg(locale, m.ppt_master_content),
        13,
      ),
    ],
  });

  /* -- Dos columnas -- */
  pptx.defineSlideMaster({
    title: MASTER.twoCol,
    background: { color: t.bg },
    slideNumber: pageNumber(),
    objects: [
      ...header(),
      ...footer(),
      ...kickerPh(1.28),
      titlePh(1.66, 0.9, 26, msg(locale, m.ppt_master_title)),
      bodyPh(
        "left",
        { x: MX, y: 2.85, w: 5.55, h: 3.3 },
        msg(locale, m.ppt_master_left_column),
        13,
      ),
      bodyPh(
        "right",
        { x: 7.03, y: 2.85, w: 5.55, h: 3.3 },
        msg(locale, m.ppt_master_right_column),
        13,
      ),
    ],
  });

  /* -- Tres columnas -- */
  pptx.defineSlideMaster({
    title: MASTER.threeCol,
    background: { color: t.bg },
    slideNumber: pageNumber(),
    objects: [
      ...header(),
      ...footer(),
      ...kickerPh(1.28),
      titlePh(1.66, 0.9, 26, msg(locale, m.ppt_master_title)),
      bodyPh(
        "col1",
        { x: MX, y: 2.85, w: 3.6, h: 3.3 },
        msg(locale, m.ppt_master_column_1),
        12.5,
      ),
      bodyPh(
        "col2",
        { x: 4.86, y: 2.85, w: 3.6, h: 3.3 },
        msg(locale, m.ppt_master_column_2),
        12.5,
      ),
      bodyPh(
        "col3",
        { x: 8.98, y: 2.85, w: 3.6, h: 3.3 },
        msg(locale, m.ppt_master_column_3),
        12.5,
      ),
    ],
  });
}

// Kicker with a short accent dash, mirroring the manual's "— SECCIÓN" style.
function addKicker(
  slide: Slide,
  t: Palette,
  text: string,
  x = MX,
  y = 1.28,
  onDark = false,
) {
  const accent = onDark ? CLOSING.accentText : t.accentText;
  slide.addShape("rect", {
    x,
    y: y + 0.075,
    w: 0.22,
    h: 0.03,
    fill: { color: accent },
    line: { type: "none" },
  });
  slide.addText(text.toUpperCase(), {
    x: x + 0.32,
    y,
    w: 6,
    h: 0.24,
    color: accent,
    fontFace: FONT.mono,
    fontSize: 9.5,
    charSpacing: 1.8,
    margin: 0,
  });
}

/* -------------------------------------------------------------------------- */
/*  Content modules                                                           */
/* -------------------------------------------------------------------------- */

function addMetricCard(
  slide: Slide,
  t: Palette,
  { x, y, w, h }: Box,
  m: Metric,
) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: t.surface },
    line: { color: t.border, width: 1 },
  });
  slide.addShape("rect", {
    x,
    y,
    w,
    h: 0.045,
    fill: { color: t.accent },
    line: { type: "none" },
  });
  slide.addText(m.value, {
    x: x + 0.22,
    y: y + 0.26,
    w: w - 0.44,
    h: 0.6,
    color: t.ink,
    fontFace: FONT.heading,
    fontSize: 30,
    bold: true,
    charSpacing: -0.4,
    margin: 0,
  });
  slide.addText(m.label.toUpperCase(), {
    x: x + 0.24,
    y: y + h - 0.42,
    w: w - 0.48,
    h: 0.24,
    color: t.muted,
    fontFace: FONT.mono,
    fontSize: 7.6,
    charSpacing: 1.2,
    margin: 0,
  });
  if (m.delta) {
    const c = m.dir === "down" ? SEMANTIC.err : SEMANTIC.ok;
    slide.addText(`${m.dir === "down" ? "▼" : "▲"} ${m.delta}`, {
      x: x + w - 1.1,
      y: y + 0.3,
      w: 0.9,
      h: 0.24,
      align: "right",
      color: c,
      fontFace: FONT.mono,
      fontSize: 8.5,
      margin: 0,
    });
  }
}

function addMetricRow(
  slide: Slide,
  t: Palette,
  { x, y, w, h }: Box,
  metrics: Metric[],
) {
  const gap = 0.24;
  const cardW = (w - gap * (metrics.length - 1)) / metrics.length;
  metrics.forEach((m, i) => {
    addMetricCard(slide, t, { x: x + i * (cardW + gap), y, w: cardW, h }, m);
  });
}

// Column bar chart drawn with native shapes for pixel-consistent brand look.
function addBarChart(
  slide: Slide,
  t: Palette,
  { x, y, w, h }: Box,
  { cats, vals }: BarChartData,
) {
  const labelBand = 0.3;
  const valueBand = 0.28;
  const plotH = h - labelBand - valueBand;
  const baseY = y + valueBand + plotH;
  const max = Math.max(...vals);
  const n = vals.length;
  const slot = w / n;
  const barW = Math.min(0.7, slot * 0.5);

  // baseline
  slide.addShape("rect", {
    x,
    y: baseY,
    w,
    h: 0.012,
    fill: { color: t.border },
    line: { type: "none" },
  });

  vals.forEach((v, i) => {
    const bh = (v / max) * plotH;
    const bx = x + i * slot + (slot - barW) / 2;
    const isLast = i === n - 1;
    slide.addShape("rect", {
      x: bx,
      y: baseY - bh,
      w: barW,
      h: bh,
      fill: { color: isLast ? t.accent : t.data[1] },
      line: { type: "none" },
    });
    slide.addText(String(v), {
      x: bx - slot * 0.2,
      y: baseY - bh - valueBand,
      w: barW + slot * 0.4,
      h: valueBand,
      align: "center",
      valign: "bottom",
      color: isLast ? t.accentText : t.muted,
      fontFace: FONT.mono,
      fontSize: 8.5,
      bold: isLast,
      margin: 0,
    });
    slide.addText(cats[i], {
      x: x + i * slot,
      y: baseY + 0.06,
      w: slot,
      h: labelBand - 0.06,
      align: "center",
      color: t.faint,
      fontFace: FONT.mono,
      fontSize: 8,
      charSpacing: 0.5,
      margin: 0,
    });
  });
}

function addBullets(
  slide: Slide,
  t: Palette,
  { x, y, w }: Span,
  items: string[],
  rowH = 0.62,
) {
  items.forEach((item, i) => {
    const ry = y + i * rowH;
    slide.addShape("rect", {
      x,
      y: ry + 0.08,
      w: 0.1,
      h: 0.1,
      fill: { color: t.accent },
      line: { type: "none" },
    });
    slide.addText(item, {
      x: x + 0.28,
      y: ry,
      w: w - 0.28,
      h: rowH,
      valign: "top",
      color: t.ink,
      fontFace: FONT.body,
      fontSize: 13,
      lineSpacingMultiple: 1.15,
      margin: 0,
    });
  });
}

function addSteps(
  slide: Slide,
  t: Palette,
  { x, y, w, h }: Box,
  steps: Step[],
) {
  const gap = 0.24;
  const cardW = (w - gap * (steps.length - 1)) / steps.length;
  steps.forEach((s, i) => {
    const cx = x + i * (cardW + gap);
    slide.addShape("rect", {
      x: cx,
      y,
      w: cardW,
      h,
      fill: { color: t.surface },
      line: { color: t.border, width: 1 },
    });
    slide.addShape("rect", {
      x: cx,
      y,
      w: 0.045,
      h,
      fill: { color: t.accent },
      line: { type: "none" },
    });
    slide.addText(String(i + 1).padStart(2, "0"), {
      x: cx + 0.24,
      y: y + 0.22,
      w: cardW - 0.4,
      h: 0.4,
      color: t.accentText,
      fontFace: FONT.mono,
      fontSize: 15,
      bold: true,
      margin: 0,
    });
    slide.addText(s.title, {
      x: cx + 0.24,
      y: y + 0.66,
      w: cardW - 0.44,
      h: 0.4,
      color: t.ink,
      fontFace: FONT.heading,
      fontSize: 14,
      bold: true,
      charSpacing: -0.2,
      margin: 0,
    });
    slide.addText(s.desc, {
      x: cx + 0.24,
      y: y + 1.08,
      w: cardW - 0.44,
      h: h - 1.24,
      color: t.muted,
      fontFace: FONT.body,
      fontSize: 10.5,
      lineSpacingMultiple: 1.2,
      valign: "top",
      margin: 0,
    });
  });
}

function addDataTable(
  slide: Slide,
  t: Palette,
  { x, y, w }: Span,
  { head, rows }: { head: string[]; rows: string[][] },
) {
  const headRow: PptxGenJS.TableRow = head.map((c) => ({
    text: c.toUpperCase(),
    options: {
      fill: { color: t.surfaceAlt },
      color: t.accentText,
      fontFace: FONT.mono,
      fontSize: 8.5,
      bold: true,
      charSpacing: 1,
      align: "left" as const,
      valign: "middle" as const,
    },
  }));
  const bodyRows: PptxGenJS.TableRow[] = rows.map((r) =>
    r.map((c, ci) => ({
      text: c,
      options: {
        fill: { color: t.surface },
        color: ci === 0 ? t.ink : t.muted,
        fontFace: FONT.body,
        fontSize: 11,
        bold: ci === 0,
        align: "left" as const,
        valign: "middle" as const,
      },
    })),
  );
  slide.addTable([headRow, ...bodyRows], {
    x,
    y,
    w,
    colW: tableColW(w, head.length),
    rowH: [0.42, ...rows.map(() => 0.64)],
    border: { type: "solid", color: t.border, pt: 1 },
    margin: [6, 12, 6, 12],
    valign: "middle",
  });
}

function tableColW(w: number, cols: number) {
  const first = w * 0.34;
  const rest = (w - first) / (cols - 1);
  return [first, ...Array.from({ length: cols - 1 }, () => rest)];
}

// Side "note" card used as a secondary column. Content is vertically
// centered so the full-height panel reads as an intentional callout.
function addNoteCard(
  slide: Slide,
  t: Palette,
  { x, y, w, h }: Box,
  { label, body }: { label: string; body: string },
) {
  slide.addShape("rect", {
    x,
    y,
    w,
    h,
    fill: { color: t.surfaceAlt },
    line: { color: t.border, width: 1 },
  });
  const px = x + 0.34;
  const pw = w - 0.68;
  const top = y + h / 2 - 0.9;
  slide.addShape("rect", {
    x: px,
    y: top,
    w: 0.36,
    h: 0.03,
    fill: { color: t.accentText },
    line: { type: "none" },
  });
  slide.addText(label.toUpperCase(), {
    x: px,
    y: top + 0.16,
    w: pw,
    h: 0.24,
    color: t.accentText,
    fontFace: FONT.mono,
    fontSize: 8.5,
    charSpacing: 1.4,
    margin: 0,
  });
  slide.addText(body, {
    x: px,
    y: top + 0.5,
    w: pw,
    h: 1.4,
    color: t.ink,
    fontFace: FONT.body,
    fontSize: 13,
    lineSpacingMultiple: 1.35,
    valign: "top",
    margin: 0,
  });
}

/* -------------------------------------------------------------------------- */
/*  Slide renderers                                                           */
/* -------------------------------------------------------------------------- */

// Left column shared by every non-cover, non-closing content slide.
function addContentHeadings(
  slide: Slide,
  t: Palette,
  spec: Extract<SlideSpec, { title: string }>,
  sectionNo: number,
  colW: number,
) {
  addKicker(slide, t, `${String(sectionNo).padStart(2, "0")} — ${spec.kicker}`);
  slide.addText(spec.title, {
    x: MX,
    y: 1.66,
    w: colW,
    h: 1.5,
    color: t.ink,
    fontFace: FONT.heading,
    fontSize: 30,
    bold: true,
    charSpacing: -0.5,
    lineSpacingMultiple: 1.02,
    valign: "top",
    margin: 0,
  });
  slide.addText(spec.body, {
    x: MX,
    y: 2.74,
    w: colW,
    h: 0.9,
    color: t.muted,
    fontFace: FONT.body,
    fontSize: 13.5,
    lineSpacingMultiple: 1.35,
    valign: "top",
    margin: 0,
  });
}

// Cover: furniture (bg, watermark, wordmark, signature footer) lives in the
// MASTER.cover layout; here we only add the headline content.
function renderCover(
  slide: Slide,
  t: Palette,
  spec: Extract<SlideSpec, { layout: "cover" }>,
) {
  addKicker(slide, t, spec.kicker, MX, 2.5);

  slide.addText(spec.title, {
    x: MX,
    y: 2.95,
    w: 9.4,
    h: 2,
    color: t.ink,
    fontFace: FONT.heading,
    fontSize: 44,
    bold: true,
    charSpacing: -0.8,
    lineSpacingMultiple: 1.02,
    valign: "top",
    margin: 0,
  });

  slide.addText(spec.body, {
    x: MX,
    y: 4.9,
    w: 7.2,
    h: 1,
    color: t.muted,
    fontFace: FONT.body,
    fontSize: 14.5,
    lineSpacingMultiple: 1.4,
    valign: "top",
    margin: 0,
  });
}

// Closing: furniture (deep-plum bg, white wordmark, watermark, footer) lives in
// the MASTER.closing layout; here we add the message and CTA.
function renderClosing(
  slide: Slide,
  t: Palette,
  spec: Extract<SlideSpec, { layout: "closing" }>,
) {
  addKicker(slide, t, spec.kicker, MX, 2.6, true);

  slide.addText(spec.title, {
    x: MX,
    y: 3.05,
    w: 9.6,
    h: 1.9,
    color: CLOSING.ink,
    fontFace: FONT.heading,
    fontSize: 40,
    bold: true,
    charSpacing: -0.7,
    lineSpacingMultiple: 1.03,
    valign: "top",
    margin: 0,
  });

  slide.addText(spec.body, {
    x: MX,
    y: 4.95,
    w: 7.6,
    h: 0.9,
    color: CLOSING.muted,
    fontFace: FONT.body,
    fontSize: 14,
    lineSpacingMultiple: 1.4,
    valign: "top",
    margin: 0,
  });

  // CTA button (inverse of the brand button, per manual)
  const ctaW = 2.1;
  const ctaY = 5.95;
  slide.addShape("rect", {
    x: MX,
    y: ctaY,
    w: ctaW,
    h: 0.5,
    fill: { color: CLOSING.ink },
    line: { type: "none" },
  });
  slide.addText(spec.cta, {
    x: MX,
    y: ctaY,
    w: ctaW,
    h: 0.5,
    align: "center",
    valign: "middle",
    color: CLOSING.bg,
    fontFace: FONT.body,
    fontSize: 12.5,
    bold: true,
    margin: 0,
  });
  slide.addText(spec.contact, {
    x: MX + ctaW + 0.35,
    y: ctaY,
    w: 6,
    h: 0.5,
    valign: "middle",
    color: CLOSING.muted,
    fontFace: FONT.mono,
    fontSize: 10,
    charSpacing: 0.5,
    margin: 0,
  });
}

/* -------------------------------------------------------------------------- */
/*  Assembly                                                                  */
/* -------------------------------------------------------------------------- */

// Content slides: bg + header + footer live in MASTER.content; here we add the
// kicker, headings and the layout-specific module.
function renderContentSlide(
  slide: Slide,
  t: Palette,
  spec: SlideSpec,
  section: number,
) {
  const rightX = 7.35;
  const rightW = RIGHT - rightX;

  switch (spec.layout) {
    case "content": {
      const colW = spec.note ? 5.35 : 5.6;
      addContentHeadings(slide, t, spec, section, colW);
      if (spec.bullets) {
        addBullets(slide, t, { x: MX, y: 3.9, w: colW }, spec.bullets);
      }
      if (spec.note) {
        addNoteCard(
          slide,
          t,
          { x: rightX, y: 1.62, w: rightW, h: 4.55 },
          spec.note,
        );
      }
      break;
    }
    case "metrics": {
      addContentHeadings(slide, t, spec, section, 8.5);
      if (spec.chart) {
        addMetricRow(slide, t, { x: MX, y: 3.55, w: CW, h: 1.5 }, spec.metrics);
        addBarChart(slide, t, { x: MX, y: 5.35, w: CW, h: 1.25 }, spec.chart);
      } else {
        addMetricRow(slide, t, { x: MX, y: 3.75, w: CW, h: 2.1 }, spec.metrics);
      }
      break;
    }
    case "chart": {
      addContentHeadings(slide, t, spec, section, 5.7);
      addBarChart(
        slide,
        t,
        { x: rightX, y: 1.75, w: rightW, h: 3.55 },
        spec.chart,
      );
      if (spec.caption) {
        slide.addText(spec.caption, {
          x: rightX,
          y: 5.55,
          w: rightW,
          h: 0.4,
          color: t.faint,
          fontFace: FONT.mono,
          fontSize: 8,
          italic: true,
          margin: 0,
        });
      }
      break;
    }
    case "table": {
      addContentHeadings(slide, t, spec, section, 9.6);
      addDataTable(slide, t, { x: MX, y: 3.55, w: CW }, spec.table);
      break;
    }
    case "steps": {
      addContentHeadings(slide, t, spec, section, 10);
      addSteps(slide, t, { x: MX, y: 3.95, w: CW, h: 2.5 }, spec.steps);
      break;
    }
  }
}

/* -------------------------------------------------------------------------- */
/*  Font embedding                                                            */
/* -------------------------------------------------------------------------- */

const FONT_STYLE_TAG: Record<keyof FontFace, string> = {
  regular: "p:regular",
  bold: "p:bold",
  italic: "p:italic",
  boldItalic: "p:boldItalic",
};

// pptxgenjs has no font-embedding API, so we post-process the OOXML package:
// drop each brand TTF into ppt/fonts, register it, and list it in
// presentation.xml. PowerPoint then renders the deck in-brand with no install.
async function embedFonts(bytes: Uint8Array): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(bytes);
  const relationships: string[] = [];
  const embeddedFonts: string[] = [];
  let n = 0;

  for (const [typeface, face] of Object.entries(fontAssets)) {
    const slots: string[] = [];
    for (const style of Object.keys(FONT_STYLE_TAG) as (keyof FontFace)[]) {
      const data = face[style];
      if (!data) continue;
      n += 1;
      const rid = `rIdUrbsFont${n}`;
      const file = `font${n}.fntdata`;
      zip.file(`ppt/fonts/${file}`, data, { base64: true });
      relationships.push(
        `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/${file}"/>`,
      );
      slots.push(`<${FONT_STYLE_TAG[style]} r:id="${rid}"/>`);
    }
    embeddedFonts.push(
      `<p:embeddedFont><p:font typeface="${typeface}"/>${slots.join("")}</p:embeddedFont>`,
    );
  }

  const readXml = (path: string) => {
    const entry = zip.file(path);
    if (!entry) throw new Error(`Missing OOXML part: ${path}`);
    return entry.async("string");
  };

  const activateSlideNumbers = async () => {
    let master = await readXml("ppt/slideMasters/slideMaster1.xml");

    // PptxGenJS hardcodes sldNum="0" in the real slide master, which prevents
    // PowerPoint from applying layout-level slide numbers to newly inserted
    // slides. Keep the number fields in the layouts, but remove the global
    // master field so cover-style layouts do not inherit one accidentally.
    master = master.replace(
      /<p:sp>\s*<p:nvSpPr>\s*<p:cNvPr id="25" name="Slide Number Placeholder 0"[\s\S]*?<\/p:sp>/,
      "",
    );
    master = master.replace(
      /<p:hf\b([^>]*)\bsldNum="0"([^>]*)\/>/,
      '<p:hf$1sldNum="1"$2/>',
    );

    zip.file("ppt/slideMasters/slideMaster1.xml", master);
  };

  await activateSlideNumbers();

  // Declare the font part type.
  let ct = await readXml("[Content_Types].xml");
  if (!ct.includes('Extension="fntdata"')) {
    ct = ct.replace(
      "</Types>",
      '<Default Extension="fntdata" ContentType="application/x-fontdata"/></Types>',
    );
    zip.file("[Content_Types].xml", ct);
  }

  // Register the font relationships.
  let rels = await readXml("ppt/_rels/presentation.xml.rels");
  rels = rels.replace(
    "</Relationships>",
    `${relationships.join("")}</Relationships>`,
  );
  zip.file("ppt/_rels/presentation.xml.rels", rels);

  // Enable embedding and list the fonts (schema: before defaultTextStyle).
  let pres = await readXml("ppt/presentation.xml");
  pres = pres.replace(
    /<p:presentation\b([^>]*)>/,
    (_m, attrs: string) =>
      `<p:presentation${
        /embedTrueTypeFonts=/.test(attrs) ? "" : ' embedTrueTypeFonts="1"'
      }${attrs}>`,
  );
  const lst = `<p:embeddedFontLst>${embeddedFonts.join("")}</p:embeddedFontLst>`;
  pres = pres.includes("<p:defaultTextStyle")
    ? pres.replace("<p:defaultTextStyle", `${lst}<p:defaultTextStyle`)
    : pres.replace("</p:presentation>", `${lst}</p:presentation>`);
  zip.file("ppt/presentation.xml", pres);

  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

export async function createPresentationTemplate(
  key: PresentationTemplateKey,
  mode: PresentationTemplateMode,
  locale: AppLocale,
) {
  const deck = buildDecks(locale)[key];
  const pptx = new PptxGenJS();
  pptx.author = "Urbs Data";
  pptx.company = "Urbs Data";
  pptx.subject = msg(locale, m.ppt_subject);
  pptx.title = `Urbs Data — ${deck.label}`;
  pptx.defineLayout(LAYOUT);
  pptx.layout = LAYOUT.name;
  pptx.theme = {
    headFontFace: FONT.heading,
    bodyFontFace: FONT.body,
  };

  const t = palette(mode);
  const MASTER = masterNames(locale);
  defineMasters(pptx, mode, deck, locale, MASTER);
  let section = 0;

  deck.slides.forEach((spec) => {
    if (spec.layout === "cover") {
      const slide = pptx.addSlide({ masterName: MASTER.cover });
      renderCover(slide, t, spec);
    } else if (spec.layout === "closing") {
      const slide = pptx.addSlide({ masterName: MASTER.closing });
      renderClosing(slide, t, spec);
    } else {
      section += 1;
      const slide = pptx.addSlide({ masterName: MASTER.content });
      renderContentSlide(slide, t, spec, section);
    }
  });

  const bytes = (await pptx.write({ outputType: "uint8array" })) as Uint8Array;
  return embedFonts(bytes);
}

export function presentationTemplateFilename(
  key: PresentationTemplateKey,
  mode: PresentationTemplateMode,
) {
  return `urbs-${key}-${mode}.pptx`;
}
