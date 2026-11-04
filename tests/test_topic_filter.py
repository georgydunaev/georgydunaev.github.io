#!/usr/bin/env python3
"""Unit tests for Research Topics Faceted Filter & Tag Navigation (Ticket 012 & Ticket 701)."""

from pathlib import Path
import re
import unittest

REPO_DIR = Path(__file__).resolve().parent.parent


class TestTopicFilter(unittest.TestCase):
    def test_topic_filter_js_exists_with_hash_and_aria(self):
        js_path = REPO_DIR / "js" / "topic_filter.js"
        self.assertTrue(js_path.is_file(), "js/topic_filter.js must exist")
        text = js_path.read_text(encoding="utf-8")
        self.assertIn("aria-pressed", text)
        self.assertIn("#topic=", text)
        self.assertIn("filterPublicationsByTopic", text)

    def test_each_publication_has_associated_topic_tags_and_mk_nbg_note(self):
        html = (REPO_DIR / "portfolio_ai.html").read_text(encoding="utf-8")
        matches = re.findall(r'data-topics="([^"]+)"', html)
        self.assertGreaterEqual(len(matches), 4)
        for topic_csv in matches:
            tags = [t.strip() for t in topic_csv.split(",") if t.strip()]
            self.assertGreaterEqual(len(tags), 1)
        self.assertIn("Formulas-as-Types vs. Proof-Term Compilation in MK/NBG", html)
        self.assertIn("ClassSort", html)
        self.assertIn("SetSort", html)


if __name__ == "__main__":
    unittest.main()
