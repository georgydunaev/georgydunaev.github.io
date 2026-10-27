#!/usr/bin/env python3
"""
georgydunaev.github.io/tests/test_scroll_spy.py

Non-vacuous acceptance gate for [Curated] Ticket 020 — Active Section Scroll Spy.

Layers:
  1. Deliverable exists at the declared path and follows repo JS conventions
     (self-contained IIFE, exported initScrollSpy, rAF efficiency).
  2. Scroll-spy semantics are actually implemented: sentinel geometry,
     document-order selection, bottom snap, top reset, hashchange support,
     and aria-current accessibility semantics.
  3. Privacy: zero network I/O, zero storage, zero dynamic code evaluation.
  4. Wiring: portfolio_ai.html loads the script and every nav fragment link
     resolves to a real in-page section id (cross-validated against the DOM).
  5. Functional: the module is executed in a deterministic fake DOM via Node
     (tests/scroll_spy_functional.mjs) — section transitions, exact sentinel
     boundary equality, rAF coalescing, bottom snap, top reset, resize, and
     inert-anchor guarantees are all exercised.
"""

import re
import shutil
import subprocess
import unittest
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
SCRIPT_PATH = REPO_DIR / "js" / "scroll_spy.js"
HARNESS_PATH = REPO_DIR / "tests" / "scroll_spy_functional.mjs"
PAGE_PATH = REPO_DIR / "portfolio_ai.html"

NODE_BIN = shutil.which("node")


def read_text(path):
    return path.read_text(encoding="utf-8")


class TestScrollSpyDeliverable(unittest.TestCase):
    def test_deliverable_exists_and_is_nonempty(self):
        self.assertTrue(SCRIPT_PATH.exists(), "js/scroll_spy.js must exist (Ticket 020 deliverable)")
        self.assertTrue(HARNESS_PATH.exists(), "tests/scroll_spy_functional.mjs must exist (functional gate)")
        self.assertGreater(len(read_text(SCRIPT_PATH).strip()), 0, "js/scroll_spy.js must not be empty")

    def test_module_shape_follows_repo_conventions(self):
        src = read_text(SCRIPT_PATH)
        self.assertRegex(src, r"\(\s*function\s*\(\s*\)\s*\{", "js/scroll_spy.js must be an IIFE")
        self.assertIn("'use strict'", src, "module must opt into strict mode")
        self.assertRegex(src, r"window\.initScrollSpy\s*=", "module must export window.initScrollSpy")
        self.assertIn("requestAnimationFrame", src, "updates must be rAF-coalesced")
        self.assertIn("getBoundingClientRect", src, "geometry must be measured from live layout")
        self.assertIn("scrollHeight", src, "bottom-of-page handling must consult document height")


class TestScrollSpySemantics(unittest.TestCase):
    def test_core_semantics_implemented(self):
        src = read_text(SCRIPT_PATH)
        for token in (
            "aria-current",          # accessibility semantics
            "hashchange",            # anchor navigation also re-locates
            "resize",                # viewport changes move the sentinel
            "scroll",                # primary driver
            "getElementById",        # fragment targets resolved by id
            "decodeURIComponent",    # robust fragment decoding
        ):
            self.assertIn(token, src, f"scroll_spy.js must implement {token!r}")

    def test_top_reset_and_bottom_snap_present(self):
        src = read_text(SCRIPT_PATH)
        # Bottom snap: near max scroll the ACTIVE state is forced to the last section.
        self.assertIn("maxScroll", src)
        # Top reset: above every section the active id becomes null (highlight cleared).
        self.assertIn("best ? best.id : null", src)

    def test_passive_listeners(self):
        src = read_text(SCRIPT_PATH)
        self.assertRegex(src, r"\{\s*passive:\s*true\s*\}", "scroll listener must be passive")


class TestScrollSpyPrivacy(unittest.TestCase):
    def test_no_network_storage_or_dynamic_eval(self):
        src = read_text(SCRIPT_PATH)
        forbidden = [
            "fetch(", "XMLHttpRequest", "WebSocket", "EventSource",
            "localStorage", "sessionStorage", "indexedDB", "document.cookie",
            "eval(", "new Function", "Worker(", "import(", "require(",
        ]
        for token in forbidden:
            self.assertNotIn(token, src, f"privacy violation: {token!r} must not appear in scroll_spy.js")
        self.assertIsNone(re.search(r"https?://", src), "scroll_spy.js must not embed network literals")


class TestScrollSpyWiring(unittest.TestCase):
    def test_script_is_loaded_by_the_section_bearing_page(self):
        html = read_text(PAGE_PATH)
        self.assertIn('<script src="js/scroll_spy.js" defer></script>', html)

    def test_nav_fragment_links_resolve_to_real_sections(self):
        html = read_text(PAGE_PATH)
        self.assertIn("<nav", html, "portfolio_ai.html must contain the navigation header")
        fragment_ids = {m for m in re.findall(r'<a href="#([^"]*)"', html) if m}
        section_ids = set(re.findall(r'id="([^"]+)"', html))
        self.assertGreaterEqual(len(fragment_ids), 6, "expected the full nav anchor set")
        for frag in sorted(fragment_ids):
            self.assertIn(frag, section_ids, f"nav target #{frag} must exist as an in-page section id")

    def test_active_state_is_styleable(self):
        css = read_text(PAGE_PATH)
        self.assertIn(".nav-links a.active", css, "active link must have a dedicated style rule")
        self.assertIn("text-underline-offset", css, "active underline must not shift layout")


@unittest.skipUnless(NODE_BIN, "node runtime unavailable — functional layer skipped (static gates still active)")
class TestScrollSpyFunctional(unittest.TestCase):
    def test_functional_scenarios_pass_in_node(self):
        result = subprocess.run(
            [NODE_BIN, str(HARNESS_PATH)],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=str(REPO_DIR),
        )
        self.assertEqual(
            result.returncode, 0,
            f"functional harness failed (exit {result.returncode}):\n"
            f"{result.stdout}\n{result.stderr}",
        )
        self.assertIn("[SCROLL-SPY PASS]", result.stdout, "harness must report explicit success")


if __name__ == "__main__":
    unittest.main()
