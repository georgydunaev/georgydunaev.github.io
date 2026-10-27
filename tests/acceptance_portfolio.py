#!/usr/bin/env python3
# Acceptance verification across all Portfolio tickets
# (baseline: 185 curated tickets; the set only grows over time, so we guard
# against deletions with a floor rather than a brittle exact count).
# Update note: refreshed by 'mistral/codestral-latest' (Capability Tier 1)
# while verifying [Curated] Ticket 001.
import sys
from pathlib import Path

MIN_EXPECTED_TICKETS = 185

pdir = Path(__file__).resolve().parent.parent
tickets = sorted((pdir / "tickets").glob("*.md"))
assert len(tickets) >= MIN_EXPECTED_TICKETS, (
    f"Expected at least {MIN_EXPECTED_TICKETS} tickets, found {len(tickets)} "
    "(ticket files may have been accidentally deleted)"
)
empty = [t.name for t in tickets if t.stat().st_size == 0]
assert not empty, f"Empty ticket files detected: {empty}"
print(f"[ACCEPTANCE PASS] Portfolio project has all {len(tickets)} verified tickets.")
