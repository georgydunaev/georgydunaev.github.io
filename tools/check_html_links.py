#!/usr/bin/env python3
"""
georgydunaev.github.io/tools/check_html_links.py — Link Integrity Checker (TKT-643).

Extracts all local relative links (href, src) from portfolio_ai.html and index.html,
verifying that every referenced local file or image actually exists on disk.
Exits 0 on success, exits 1 on broken local links.
"""

import os
import sys
import re
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent

def check_file_links(html_file: Path) -> int:
    if not html_file.exists():
        print(f"[ERROR] Target file {html_file.name} does not exist.")
        return 1

    content = html_file.read_text(encoding="utf-8")
    # Matches href="..." and src="..."
    matches = re.findall(r'(?:href|src)=["\']([^"\']+)["\']', content)

    broken_links = []
    checked_count = 0

    for link in matches:
        # Skip external URLs, protocol schemes, javascript, anchors, mailto
        if link.startswith(("http://", "https://", "mailto:", "javascript:", "#", "tel:", "data:")):
            continue
        
        # Clean query strings and hash anchors from relative path
        clean_path = link.split("?")[0].split("#")[0]
        if not clean_path:
            continue

        target = (REPO_DIR / clean_path).resolve()
        checked_count += 1

        if not target.exists():
            broken_links.append((link, str(target)))

    if broken_links:
        print(f"[FAIL] {html_file.name}: Found {len(broken_links)} broken local links:")
        for raw, abs_path in broken_links:
            print(f"  - '{raw}' -> missing {abs_path}")
        return 1
    else:
        print(f"[PASS] {html_file.name}: Checked {checked_count} local links. All exist!")
        return 0

def main():
    exit_code = 0
    targets = [REPO_DIR / "portfolio_ai.html", REPO_DIR / "index.html"]
    for t in targets:
        if t.exists():
            code = check_file_links(t)
            if code != 0:
                exit_code = 1

    sys.exit(exit_code)

if __name__ == "__main__":
    main()
