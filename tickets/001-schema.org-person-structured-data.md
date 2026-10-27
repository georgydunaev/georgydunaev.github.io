# Ticket 001: Schema.org Person Structured Data

**Project:** `georgydunaev.github.io`  
**Category:** SEO & Metadata  
**Target Deliverable:** `assets/meta/person_schema.json`  
**Status:** `[COMPLETED]`  
**Date:** 2026-10-24  

---

## 1. Description & Rationale
Embed JSON-LD Person schema with alumniOf, jobTitle, sameAs links.

This ticket is an essential component of the `georgydunaev.github.io` engineering and presentation roadmap. It establishes rigorous standards, elevates production quality, and directly advances the mission of creating publication-ready, mathematically sound software and career assets.

---

## 2. Technical Specification & Implementation Plan
1. **Design & Interface:** Establish clean architecture, modular separation of concerns, and reproducible outputs.
2. **Implementation:** Create or refine `assets/meta/person_schema.json` with full test coverage and semantic accuracy.
3. **Verification:** Run automated verification tests ensuring zero regressions, complete accessibility, and strict adherence to privacy/security safeguards.

---

## 3. Acceptance Criteria
- [x] Deliverable `assets/meta/person_schema.json` is created, functional, and properly tracked.
- [x] Conforms to privacy guidelines (0 secrets, 0 credentials, 0 private key leaks).
- [x] Verified by automated test suites and validation runners.
- [x] Cleanly documented with instructions for execution and maintenance.

---

## 4. Execution Log
- **Status:** Verified and implemented.
- **Verification Result:** PASS (0 errors).

### Verification Entry — 2026-10-27
- **Verified/implemented by:** `mistral/codestral-latest` (Capability Tier 1), autonomous worker.
- **Enhancement:** The JSON-LD Person schema is now embedded in `index.html` (`<script type="application/ld+json">`, per the ticket's "Embed" requirement), with `assets/meta/person_schema.json` retained as the canonical source of truth.
- **New automated suite:** `tests/test_person_schema.py` (10 tests) validates the canonical file (`@context`, `@type: Person`, `name`, `jobTitle`, `url`, `email`, `alumniOf` as `CollegeOrUniversity` list, HTTPS `sameAs` links), enforces byte-exact parity between the inline JSON-LD copy and the canonical file (no drift), and scans for secrets/credentials/private keys (0 found).
- **Run:** `python3 -m unittest tests.test_person_schema -v` → OK (10 tests); full suite `tests.test_portfolio_integrity tests.test_scroll_spy tests.test_person_schema` → OK (25 tests, zero regressions).
- **Maintenance note:** `tests/acceptance_portfolio.py` fixed — stale hardcoded ticket count (185) replaced with a deletion-guard floor (≥ 185) since the ticket set has grown to 189.
