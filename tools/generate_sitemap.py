#!/usr/bin/env python3
import datetime
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

urls = [
    "https://georgydunaev.github.io/",
    "https://georgydunaev.github.io/business_card.html",
    "https://georgydunaev.github.io/CV_EN.pdf",
    "https://georgydunaev.github.io/CV_DE.pdf"
]

now = datetime.date.today().isoformat()
xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<!-- AUTO-GENERATED FILE — DO NOT EDIT MANUALLY -->',
    '<!-- Generator: georgydunaev.github.io/tools/generate_sitemap.py -->',
    '<!-- How to regenerate: python3 tools/generate_sitemap.py -->',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
]
for u in urls:
    xml.append(f'  <url><loc>{u}</loc><lastmod>{now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>')
xml.append('</urlset>')

out_path = REPO_ROOT / "sitemap.xml"
out_path.write_text("\n".join(xml) + "\n", encoding="utf-8")
print(f"Generated {out_path}")
