#!/usr/bin/env python3
import datetime

urls = [
    "https://georgydunaev.github.io/",
    "https://georgydunaev.github.io/business_card.html",
    "https://georgydunaev.github.io/CV_EN.pdf",
    "https://georgydunaev.github.io/CV_DE.pdf"
]

now = datetime.date.today().isoformat()
xml = ['<?xml version="1.0" encoding="UTF-8"?>',
       '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for u in urls:
    xml.append(f'  <url><loc>{u}</loc><lastmod>{now}</lastmod><changefreq>weekly</changefreq><priority>1.0</priority></url>')
xml.append('</urlset>')

with open("/botworkspace/georgydunaev.github.io/sitemap.xml", "w", encoding="utf-8") as f:
    f.write("\n".join(xml))
print("Generated sitemap.xml")
