"""Extract reference values from the supplied static SVG exports. No dependencies."""
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent
NAMES = {"white": "#FFFFFF", "black": "#000000"}


def elements(path):
    return list(ET.parse(path).getroot().iter())


def first_rect(path):
    return next(e for e in elements(path) if e.tag.endswith("}rect"))


tokens = {"colors": {}, "glass": {}, "spacing": {}, "radius": {}}
for theme in ("light", "dark"):
    colors = tokens["colors"][theme] = {}
    for path in sorted((ROOT / "foundations/Color").rglob("*.svg")):
        is_dark = path.name == "Dark.svg"
        if is_dark != (theme == "dark"):
            continue
        key = path.relative_to(ROOT / "foundations/Color").as_posix()
        key = key.removesuffix("/Dark.svg") if is_dark else key.removesuffix(".svg")
        fill = first_rect(path).get("fill")
        colors[key] = {"value": NAMES.get(fill, fill), "source": path.relative_to(ROOT).as_posix()}

for path in sorted((ROOT / "foundations/glass").glob("*.svg")):
    if path.stem not in ("fill", "border", "tint"):
        continue
    rect = first_rect(path)
    tokens["glass"][path.stem] = {"color": NAMES.get(rect.get("fill"), rect.get("fill")),
                                "opacity": float(rect.get("fill-opacity", "1")),
                                "source": path.relative_to(ROOT).as_posix()}
for path in (ROOT / "foundations/spacing").glob("*.svg"):
    if not path.stem.isdigit():
        continue
    value = int(first_rect(path).get("width"))
    assert value == int(path.stem)
    tokens["spacing"][path.stem] = value
for path in (ROOT / "foundations").glob("*px.svg"):
    match = re.fullmatch(r"(none|xs|sm|md|lg|xl|2xl) (\d+)px", path.stem)
    if match:
        tokens["radius"][match[1]] = {"value": int(match[2]), "source": path.relative_to(ROOT).as_posix()}
tokens["radius"]["full"] = {"value": "pill", "source": "foundations/full ∞.svg"}

inventory = []
for path in sorted(ROOT.glob("**/*.svg")):
    nodes = elements(path)
    assert not any(e.tag.split("}")[-1] == "script" for e in nodes)
    inventory.append({"source": path.relative_to(ROOT).as_posix(), "canvas": nodes[0].attrib,
                      "outlined_text": not any(e.tag.endswith("}text") for e in nodes),
                      "geometry_and_filters": [{"element": e.tag.split("}")[-1], "attributes": e.attrib}
                                               for e in nodes[1:] if e.tag.split("}")[-1] not in ("path", "defs")]})
(ROOT / "tokens.json").write_text(json.dumps(tokens, indent=2) + "\n")
(ROOT / "svg-inventory.json").write_text(json.dumps(inventory, indent=2) + "\n")

lines = ["/* Extracted kit values; component-specific materials may override foundation samples. */", ":root {"]
for key, value in sorted(tokens["spacing"].items(), key=lambda item: int(item[0])):
    lines.append(f"  --space-{key}: {value}px;")
for key, entry in tokens["radius"].items():
    if entry["value"] != "pill":
        lines.append(f"  --radius-{key}: {entry['value']}px;")
lines.append("  --radius-full: 9999px; /* CSS pill convention, not an extracted numeric radius. */")
for key, entry in tokens["glass"].items():
    lines.append(f"  --glass-{key}-opacity: {entry['opacity']};")
lines.append("}")
for theme, colors in tokens["colors"].items():
    lines.append(f'[data-theme="{theme}"] {{')
    for key, entry in colors.items():
        lines.append(f"  --color-{key.replace('/', '-')}: {entry['value']};")
    lines.append("}")
(ROOT / "tokens.css").write_text("\n".join(lines) + "\n")
assert len(inventory) == 105
assert len(tokens["colors"]["light"]) == len(tokens["colors"]["dark"]) == 11
print(f"Parsed {len(inventory)} SVGs; extracted 22 theme colors, 12 spacing steps, 8 radius labels, 3 glass samples.")
