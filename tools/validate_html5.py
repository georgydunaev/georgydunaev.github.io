#!/usr/bin/env python3
import sys
from pathlib import Path

pdir = Path(__file__).resolve().parent.parent
index_path = pdir / "index.html"
with open(index_path, "r", encoding="utf-8") as f:
    content = f.read()

assert "<!DOCTYPE html>" in content, "Missing DOCTYPE"
assert "<html lang=" in content, "Missing lang attribute"
assert "<title>" in content, "Missing title tag"
assert '<meta name="viewport"' in content, "Missing viewport meta"
assert "</html>" in content, "Unclosed html tag"
print("[PASS] HTML5 basic validation succeeded.")
