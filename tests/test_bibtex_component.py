#!/usr/bin/env python3
"""Unit tests for BibTeX 1-Click Clipboard Copy Component (Ticket 011)."""

from pathlib import Path
import re
import unittest

REPO_DIR = Path(__file__).resolve().parent.parent


class TestBibtexComponent(unittest.TestCase):
    def test_bibtex_copy_js_exists_with_clipboard_and_fallback(self):
        js_path = REPO_DIR / "js" / "bibtex_copy.js"
        self.assertTrue(js_path.is_file(), "js/bibtex_copy.js must exist")
        text = js_path.read_text(encoding="utf-8")
        self.assertIn("navigator.clipboard", text)
        self.assertIn("execCommand('copy')", text)
        self.assertIn("Copied!", text)

    def test_publication_cards_have_non_empty_data_bibtex(self):
        for page_name in ("index.html", "portfolio_ai.html"):
            html = (REPO_DIR / page_name).read_text(encoding="utf-8")
            matches = re.findall(r'data-bibtex="([^"]+)"', html)
            self.assertGreaterEqual(len(matches), 2, f"{page_name} must have publication cards with data-bibtex")
            for bib in matches:
                self.assertTrue(bib.strip().startswith("@"), f"Invalid BibTeX string: {bib}")
                self.assertIn("author=", bib)
                self.assertIn("title=", bib)


if __name__ == "__main__":
    unittest.main()
