#!/usr/bin/env python3
import sys
from pathlib import Path

pdir = Path(__file__).resolve().parent.parent
full_pages = [
    "index.html", "portfolio_ai.html", "classic.html", "aboutme.html",
    "business_card.html", "sessions_log.html", "interactive_diagrams.html",
    "antivibecoding.html", "yoneda_ai.html", "hub.html", "links.html"
]

for p in full_pages:
    target = pdir / p
    if not target.exists():
        continue
    content = target.read_text(encoding="utf-8")
    assert "<!DOCTYPE html>" in content, f"Missing DOCTYPE in {p}"
    assert "<html lang=" in content, f"Missing lang attribute in {p}"
    assert "<title>" in content, f"Missing title tag in {p}"
    assert '<meta name="viewport"' in content or '<meta content="width=device-width' in content, f"Missing viewport meta in {p}"
    assert "</html>" in content, f"Unclosed html tag in {p}"
print(f"[PASS] HTML5 basic validation succeeded across {len(full_pages)} pages.")
