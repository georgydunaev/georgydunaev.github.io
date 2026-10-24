#!/usr/bin/env python3
"""
georgydunaev.github.io/tests/test_portfolio_integrity.py
Automated verification for portfolio stylesheets, interactive SVG diagrams,
academic degree alignment, and formal logic links.
"""

import unittest
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent

class TestPortfolioIntegrity(unittest.TestCase):
    def test_css_stylesheet_exists_and_defines_variables(self):
        style_css = REPO_DIR / "css" / "style.css"
        self.assertTrue(style_css.exists(), "css/style.css must exist")
        content = style_css.read_text(encoding="utf-8")
        required_vars = ["--bg-card", "--border-color", "--text-main", "--highlight"]
        for var in required_vars:
            self.assertIn(var, content, f"css/style.css must define CSS variable {var}")

    def test_interactive_diagrams_script_and_markup(self):
        diag_html = REPO_DIR / "interactive_diagrams.html"
        self.assertTrue(diag_html.exists(), "interactive_diagrams.html must exist")
        content = diag_html.read_text(encoding="utf-8")
        self.assertIn("css/style.css", content)
        self.assertIn("node-group", content)
        self.assertIn("highlightYoneda", content)
        self.assertIn("highlightFunctor", content)
        self.assertIn("addEventListener('pointerdown'", content)

    def test_academic_degree_alignment(self):
        bc_html = REPO_DIR / "business_card.html"
        self.assertTrue(bc_html.exists(), "business_card.html must exist")
        content = bc_html.read_text(encoding="utf-8")
        self.assertIn("Candidate", content, "Degree must accurately state candidate status")

    def test_lean4_audit_link(self):
        index_html = REPO_DIR / "index.html"
        self.assertTrue(index_html.exists(), "index.html must exist")
        content = index_html.read_text(encoding="utf-8")
        self.assertIn("Obelisk.lean", content, "index.html must link to Obelisk.lean formal proof artifact")

if __name__ == "__main__":
    unittest.main()
