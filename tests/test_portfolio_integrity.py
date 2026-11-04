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

    def test_portal_switch_parity(self):
        index_html = REPO_DIR / "index.html"
        ai_html = REPO_DIR / "portfolio_ai.html"
        classic_html = REPO_DIR / "classic.html"
        alias_ai_html = REPO_DIR / "ai.html"

        self.assertTrue(index_html.exists() and ai_html.exists() and classic_html.exists() and alias_ai_html.exists())
        
        index_content = index_html.read_text(encoding="utf-8")
        self.assertIn("portal-switch-banner", index_content)
        self.assertIn("portfolio_ai.html", index_content)
        self.assertIn("Classic (Author)", index_content)

        ai_content = ai_html.read_text(encoding="utf-8")
        self.assertIn("portal-switch-banner", ai_content)
        self.assertIn("index.html", ai_content)
        self.assertIn("Modern AI", ai_content)
        self.assertIn("Classic Author Portal", ai_content)

    def test_noscript_fallback_and_theme_transitions(self):
        """Tickets 27455, 7437, 701: Verify <noscript> fallback, 200ms theme transitions, and research note links."""
        style_css = (REPO_DIR / "css" / "style.css").read_text(encoding="utf-8")
        self.assertIn("200ms", style_css)
        self.assertIn(".noscript-banner", style_css)

        for page_name in ("index.html", "portfolio_ai.html"):
            content = (REPO_DIR / page_name).read_text(encoding="utf-8")
            self.assertIn("<noscript>", content, f"{page_name} must contain a <noscript> fallback")
            self.assertIn("noscript-banner", content, f"{page_name} must include .noscript-banner inside <noscript>")
            self.assertIn("research/formula_as_type_vs_proof_term_mk_nbg.md", content)

        note_path = REPO_DIR / "research" / "formula_as_type_vs_proof_term_mk_nbg.md"
        self.assertTrue(note_path.exists(), "Research note for Ticket 701 must exist")

if __name__ == "__main__":
    unittest.main()
