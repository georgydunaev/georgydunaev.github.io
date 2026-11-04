#!/usr/bin/env python3
"""Unit tests for CV/tools/generate_vcard_qr.py (Ticket 062)."""

from pathlib import Path
import sys
import unittest
import xml.etree.ElementTree as ET

REPO_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_DIR / "tools"))

from generate_vcard_qr import generate_vcard_svg, load_vcard_payload, OUT_SVG  # noqa: E402


class TestVCardQRGenerator(unittest.TestCase):
    def test_vcard_payload_structure(self):
        payload = load_vcard_payload()
        self.assertIn("BEGIN:VCARD", payload)
        self.assertIn("VERSION:3.0", payload)
        self.assertIn("FN:Georgy Dunaev", payload)
        self.assertIn("END:VCARD", payload)

    def test_generates_valid_svg_with_viewbox_and_branding_color(self):
        out = generate_vcard_svg(OUT_SVG, primary_color="#1e293b")
        self.assertTrue(out.is_file())
        svg_text = out.read_text(encoding="utf-8")
        root = ET.fromstring(svg_text)
        self.assertTrue(root.tag.endswith("svg"))
        self.assertIn("viewBox", root.attrib)
        self.assertIn("#1e293b", svg_text)


if __name__ == "__main__":
    unittest.main()
