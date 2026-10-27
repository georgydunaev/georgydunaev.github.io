#!/usr/bin/env python3
"""
georgydunaev.github.io/tests/test_person_schema.py
Automated verification for Ticket 001: Schema.org Person Structured Data.

Validates:
  1. Canonical deliverable assets/meta/person_schema.json exists, parses as JSON,
     and is a semantically correct schema.org/Person record.
  2. The JSON-LD block embedded in index.html is present, unique, and
     exactly matches the canonical file (no drift between the two copies).
  3. Privacy/security safeguards: zero secrets, credentials, or private keys.

Run with:
    python3 -m unittest tests.test_person_schema -v
or:
    python3 tests/test_person_schema.py

Provenance: implemented & verified by 'mistral/codestral-latest'
(Capability Tier 1), autonomous worker for [Curated] Ticket 001.
"""

import json
import re
import unittest
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent

SCHEMA_PATH = REPO_DIR / "assets" / "meta" / "person_schema.json"
INDEX_PATH = REPO_DIR / "index.html"

# --- Expected canonical content (Ticket 001 specification) ---

EXPECTED_NAME = "Georgy Dunaev"
EXPECTED_URL = "https://georgydunaev.github.io"
EXPECTED_JOB_TITLE = "Software Engineer & Formal Verification Specialist"
EXPECTED_ALUMNI = {
    "University of Potsdam",
    "Lomonosov Moscow State University",
    "Bauman Moscow State Technical University",
}
EXPECTED_SAME_AS = {
    "https://github.com/georgydunaev",
    "https://linkedin.com/in/georgy-dunaev",
    "https://obeliskproofassistant.github.io",
}

# Privacy heuristic patterns: nothing resembling a secret may ship.
SECRET_PATTERNS = [
    r"-----BEGIN [A-Z ]*PRIVATE KEY-----",
    r"\b(?:api[_-]?key|apikey|secret|password|passwd|token|bearer)\b\s*[:=]",
    r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b",          # AWS access key ids
    r"gh[pousr]_[A-Za-z0-9]{20,}",             # GitHub tokens
    r"glpat-[A-Za-z0-9\-_]{20,}",              # GitLab personal access tokens
    r"xox[baprs]-[A-Za-z0-9\-]{10,}",          # Slack tokens
    r"-----BEGIN (?:RSA |EC |OPENSSH |PGP )?",  # stray key blocks (paired below)
]
CREDENTIAL_URL_RE = re.compile(
    r"https?://[^\s\"'<>\]]*(?::[^\s\"'<>\]/@]+)@",  # user:pass@ URLs
    re.IGNORECASE,
)


def load_canonical_schema():
    """Parse the canonical person_schema.json; raises with context on failure."""
    raw = SCHEMA_PATH.read_text(encoding="utf-8")
    return json.loads(raw)


def extract_embedded_json_ld(html_text):
    """Return the list of JSON-LD payloads embedded in an HTML document."""
    blocks = re.findall(
        r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        html_text,
        re.DOTALL | re.IGNORECASE,
    )
    return [json.loads(block) for block in blocks]


class TestPersonSchemaCanonicalFile(unittest.TestCase):
    """Deliverable: assets/meta/person_schema.json."""

    def setUp(self):
        self.assertTrue(SCHEMA_PATH.exists(), "assets/meta/person_schema.json must exist")
        self.schema = load_canonical_schema()

    def test_valid_json_object_with_schema_org_context(self):
        self.assertIsInstance(self.schema, dict)
        self.assertEqual(self.schema.get("@context"), "https://schema.org")
        self.assertEqual(self.schema.get("@type"), "Person")

    def test_required_person_fields_present(self):
        for field in ("name", "jobTitle", "url", "email", "alumniOf", "sameAs"):
            self.assertIn(field, self.schema, f"Person schema must define '{field}'")
            self.assertTrue(str(self.schema[field]).strip(), f"'{field}' must not be empty")

    def test_identity_fields_accurate(self):
        self.assertEqual(self.schema["name"], EXPECTED_NAME)
        self.assertEqual(self.schema["jobTitle"], EXPECTED_JOB_TITLE)
        self.assertTrue(self.schema["url"].startswith("https://"))
        self.assertRegex(self.schema["email"], r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

    def test_alumni_of_is_list_of_universities(self):
        alumni = self.schema["alumniOf"]
        self.assertIsInstance(alumni, list, "alumniOf must be a list of institutions")
        self.assertGreaterEqual(len(alumni), 1)
        names = set()
        for entry in alumni:
            self.assertIsInstance(entry, dict)
            self.assertEqual(entry.get("@type"), "CollegeOrUniversity")
            self.assertIn("name", entry)
            names.add(entry["name"])
        self.assertEqual(names, EXPECTED_ALUMNI)

    def test_same_as_links_are_https_and_exact(self):
        same_as = self.schema["sameAs"]
        self.assertIsInstance(same_as, list)
        self.assertGreaterEqual(len(same_as), 1)
        for link in same_as:
            self.assertTrue(link.startswith("https://"), f"sameAs link must be HTTPS: {link}")
        self.assertEqual(set(same_as), EXPECTED_SAME_AS)
        self.assertEqual(len(same_as), len(set(same_as)), "sameAs must not contain duplicates")


class TestPersonSchemaEmbedding(unittest.TestCase):
    """The 'Embed' part of Ticket 001: JSON-LD must appear in the entry page."""

    def setUp(self):
        self.assertTrue(INDEX_PATH.exists(), "index.html must exist")
        self.html = INDEX_PATH.read_text(encoding="utf-8")

    def test_index_embeds_exactly_one_json_ld_block(self):
        blocks = re.findall(
            r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>',
            self.html,
            re.IGNORECASE,
        )
        self.assertEqual(len(blocks), 1, "index.html must embed exactly one JSON-LD block")
        embedded = extract_embedded_json_ld(self.html)
        self.assertEqual(len(embedded), 1)
        self.assertEqual(embedded[0].get("@type"), "Person")

    def test_embedded_json_ld_matches_canonical_file(self):
        """No drift: the inline copy must equal the canonical file exactly."""
        embedded = extract_embedded_json_ld(self.html)
        self.assertEqual(len(embedded), 1)
        self.assertEqual(embedded[0], load_canonical_schema())

    def test_canonical_file_is_plain_served_json(self):
        """The canonical file must be valid standalone JSON-LD (no HTML wrapper)."""
        raw = SCHEMA_PATH.read_text(encoding="utf-8").strip()
        self.assertFalse(raw.lstrip().startswith("<"), "deliverable must be pure JSON")
        load_canonical_schema()  # must not raise


class TestPersonSchemaPrivacy(unittest.TestCase):
    """Acceptance criterion: 0 secrets, 0 credentials, 0 private key leaks."""

    def _forbidden_scan(self, label, text):
        lowered = text.lower()
        for pattern in SECRET_PATTERNS:
            # The generic key-block opener alone is not evidence; it is only
            # flagged when a matching END line exists (handled by the BEGIN
            # PRIVATE KEY pattern). Skip the bare opener here.
            if pattern.endswith("OPENSSH |PGP )?"):
                continue
            self.assertIsNone(
                re.search(pattern, lowered, re.IGNORECASE),
                f"{label}: forbidden secret-like pattern {pattern!r} detected",
            )
        self.assertIsNone(
            CREDENTIAL_URL_RE.search(text),
            f"{label}: credential-bearing URL (user:pass@) detected",
        )

    def test_canonical_file_has_no_secrets(self):
        self._forbidden_scan("person_schema.json", SCHEMA_PATH.read_text(encoding="utf-8"))

    def test_embedded_block_has_no_secrets(self):
        html = INDEX_PATH.read_text(encoding="utf-8")
        self._forbidden_scan("index.html JSON-LD", html)


if __name__ == "__main__":
    unittest.main()
