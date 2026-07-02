// @vitest-environment node
import JSZip from "jszip";
import { expect, it } from "vitest";
import { createPresentationTemplate } from "./pptx-templates";
import { presentationTemplateKeys } from "./template-catalog";

it("generates every deck with embedded brand fonts", async () => {
  for (const key of presentationTemplateKeys) {
    for (const mode of ["light", "dark"] as const) {
      const bytes = await createPresentationTemplate(key, mode, "es");
      const zip = await JSZip.loadAsync(bytes);

      const presentation = await zip
        .file("ppt/presentation.xml")
        ?.async("string");
      expect(presentation).toContain('embedTrueTypeFonts="1"');
      expect(presentation).toContain("<p:embeddedFontLst>");

      const fonts = Object.keys(zip.files).filter((f) =>
        f.endsWith(".fntdata"),
      );
      expect(fonts).toHaveLength(7);
    }
  }
}, 120000);

it("keeps slide numbers active for new slides inserted from layouts", async () => {
  const bytes = await createPresentationTemplate("pitch", "light", "es");
  const zip = await JSZip.loadAsync(bytes);

  const master = await zip
    .file("ppt/slideMasters/slideMaster1.xml")
    ?.async("string");
  expect(master).toContain('<p:hf sldNum="1" hdr="0" ftr="0" dt="0"/>');
  expect(master).not.toContain("Slide Number Placeholder 0");

  const layoutFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slideLayouts\/slideLayout\d+\.xml$/.test(name))
    .sort((a, b) => {
      const slideNumberA = Number(a.match(/\d+/)?.[0] ?? 0);
      const slideNumberB = Number(b.match(/\d+/)?.[0] ?? 0);
      return slideNumberA - slideNumberB;
    });

  const urbsLayouts: { name: string; xml: string }[] = [];
  for (const layoutFile of layoutFiles) {
    const layout = await zip.file(layoutFile)?.async("string");
    const layoutName = layout?.match(/<p:cSld name="([^"]+)"/)?.[1];
    if (!layout || !layoutName?.startsWith("Urbs · ")) continue;
    urbsLayouts.push({ name: layoutName, xml: layout });
  }

  expect(urbsLayouts.map((layout) => layout.name)).toEqual([
    "Urbs · Portada",
    "Urbs · Contenido",
    "Urbs · Cierre",
    "Urbs · Separador",
    "Urbs · Sección",
    "Urbs · Subsección",
    "Urbs · Dos columnas",
    "Urbs · Tres columnas",
  ]);

  for (const layout of urbsLayouts) {
    if (layout.name === "Urbs · Portada") {
      expect(layout.xml).not.toContain('type="sldNum"');
      continue;
    }

    expect(layout.xml).toContain('type="sldNum"');
    expect(layout.xml).toContain('type="slidenum"');
  }
});
