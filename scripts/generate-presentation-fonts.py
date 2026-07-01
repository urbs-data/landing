#!/usr/bin/env python3
"""Builds the static TTF faces embedded into every .pptx so the brand fonts
render on any machine, and emits src/features/presentations/lib/font-assets.ts
(base64). Variable fonts are instanced to the exact weights used by the deck.

    python3 scripts/generate-presentation-fonts.py

Requires: fonttools + brotli (already available in this repo's toolchain).
"""

import base64
import os
import tempfile
from typing import Any, cast

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

# Latin + the punctuation/symbols the templates use. Keeps embedded fonts tiny
# while covering any Spanish text the user might type when editing.
UNICODES = (
    list(range(0x20, 0x7F))  # basic latin
    + list(range(0xA0, 0x100))  # latin-1 (accents, ñ, ¿ ¡ · « »)
    + list(range(0x100, 0x180))  # latin extended-A
    + [
        0x2013,
        0x2014,
        0x2018,
        0x2019,
        0x201C,
        0x201D,
        0x2022,
        0x2026,
        0x2190,
        0x2191,
        0x2192,
        0x2193,
        0x25B2,
        0x25BC,
        0x20AC,
        0x2122,
        0x2212,
    ]
)

ROOT = os.getcwd()
FS = os.path.join(ROOT, "node_modules")
OUT_TS = os.path.join(ROOT, "src", "features", "presentations", "lib", "font-assets.ts")


def src(pkg, name):
    return os.path.join(FS, pkg, "files", name)


# (typeface, style, source woff2, instance weight | None if already static)
FACES = [
    (
        "Instrument Sans",
        "regular",
        src(
            "@fontsource-variable/instrument-sans",
            "instrument-sans-latin-wght-normal.woff2",
        ),
        400,
    ),
    (
        "Instrument Sans",
        "bold",
        src(
            "@fontsource-variable/instrument-sans",
            "instrument-sans-latin-wght-normal.woff2",
        ),
        700,
    ),
    (
        "IBM Plex Sans",
        "regular",
        src(
            "@fontsource-variable/ibm-plex-sans",
            "ibm-plex-sans-latin-wght-normal.woff2",
        ),
        400,
    ),
    (
        "IBM Plex Sans",
        "bold",
        src(
            "@fontsource-variable/ibm-plex-sans",
            "ibm-plex-sans-latin-wght-normal.woff2",
        ),
        700,
    ),
    (
        "Pitagon Sans Mono",
        "regular",
        src(
            "@fontsource/pitagon-sans-mono", "pitagon-sans-mono-latin-400-normal.woff2"
        ),
        None,
    ),
    (
        "Pitagon Sans Mono",
        "bold",
        src(
            "@fontsource/pitagon-sans-mono", "pitagon-sans-mono-latin-700-normal.woff2"
        ),
        None,
    ),
    (
        "Pitagon Sans Mono",
        "italic",
        src(
            "@fontsource/pitagon-sans-mono", "pitagon-sans-mono-latin-400-italic.woff2"
        ),
        None,
    ),
]


def set_style(font, family, bold, italic):
    subfamily = (
        "Bold Italic"
        if bold and italic
        else "Bold"
        if bold
        else "Italic"
        if italic
        else "Regular"
    )
    full = f"{family} {subfamily}"
    ps = f"{family.replace(' ', '')}-{subfamily.replace(' ', '')}"
    name = font["name"]

    def setn(nid, val):
        name.setName(val, nid, 3, 1, 0x409)  # Windows
        name.setName(val, nid, 1, 0, 0)  # Mac

    setn(1, family)
    setn(2, subfamily)
    setn(3, f"Urbs;{full}")
    setn(4, full)
    setn(6, ps)
    setn(16, family)
    setn(17, subfamily)

    os2 = font["OS/2"]
    os2.usWeightClass = 700 if bold else 400
    fs = os2.fsSelection & ~0x61  # clear ITALIC | BOLD | REGULAR
    if italic:
        fs |= 0x01
    if bold:
        fs |= 0x20
    if not bold and not italic:
        fs |= 0x40
    os2.fsSelection = fs

    mac = font["head"].macStyle & ~0x03
    if bold:
        mac |= 0x01
    if italic:
        mac |= 0x02
    font["head"].macStyle = mac


def build_ttf(path, weight, family, bold, italic, out_path):
    font = TTFont(path)  # reads woff2 (brotli)
    if weight is not None and "fvar" in font:
        instantiateVariableFont(
            font, {"wght": weight}, inplace=True, updateFontNames=False
        )

    opts = Options()
    opts.glyph_names = False
    opts.recalc_timestamp = False
    opts.name_IDs = cast(Any, ["*"])
    opts.name_languages = cast(Any, ["*"])
    opts.name_legacy = True
    opts.layout_features = ["*"]
    sub = Subsetter(options=opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)

    set_style(font, family, bold, italic)
    font.flavor = None  # write plain TTF, not woff2
    font.save(out_path)
    return os.path.getsize(out_path)


def main():
    tmp = tempfile.mkdtemp(prefix="urbs-fonts-")
    assets = {}
    total = 0
    for typeface, style, path, weight in FACES:
        bold = style in ("bold", "boldItalic")
        italic = style in ("italic", "boldItalic")
        out = os.path.join(tmp, f"{typeface}-{style}.ttf".replace(" ", "-"))
        size = build_ttf(path, weight, typeface, bold, italic, out)
        total += size
        with open(out, "rb") as fh:
            b64 = base64.b64encode(fh.read()).decode("ascii")
        assets.setdefault(typeface, {})[style] = b64
        print(f"  {typeface:20} {style:8} {size / 1024:6.1f} KB")

    lines = [
        "// AUTO-GENERATED by scripts/generate-presentation-fonts.py — do not edit by hand.",
        "// Base64 TTF faces embedded into every .pptx so the brand fonts render",
        "// on any machine without an install. Variable fonts are instanced.",
        "export type FontFace = {",
        "  regular: string;",
        "  bold?: string;",
        "  italic?: string;",
        "  boldItalic?: string;",
        "};",
        "",
        "export const fontAssets: Record<string, FontFace> = {",
    ]
    for typeface, styles in assets.items():
        lines.append(f"  {json_key(typeface)}: {{")
        for style in ("regular", "bold", "italic", "boldItalic"):
            if style in styles:
                lines.append(f'    {style}: "{styles[style]}",')
        lines.append("  },")
    lines.append("};")
    with open(OUT_TS, "w") as fh:
        fh.write("\n".join(lines) + "\n")

    print(f"\n✓ {OUT_TS}  (total embedded ~{total / 1024:.0f} KB)")


def json_key(s):
    return '"' + s.replace('"', '\\"') + '"'


if __name__ == "__main__":
    main()
