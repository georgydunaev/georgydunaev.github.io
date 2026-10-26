# Ticket 012: Research Topics Faceted Filter & Tag Navigation

## Context & Objectives
As the number of publications and formal proofs expands, readers require instantaneous client-side faceted filtering by topic (e.g. "Set Theory", "Isabelle/ZF", "Formal Verification", "OCaml", "Type Systems").

## Requirements & Acceptance Criteria
1. Implement `js/topic_filter.js` filtering publication cards dynamically based on selected tag chips.
2. Maintain active tag state in browser URL hash (`#topic=set-theory`) for direct shareable links.
3. Accessible keyboard navigation for tag buttons (`aria-pressed`).
4. Unit tests in `tests/test_topic_filter.py` validating that each publication has at least one associated topic tag.
