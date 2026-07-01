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
