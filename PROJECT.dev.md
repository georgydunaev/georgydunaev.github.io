# Project Development Context (`georgydunaev.github.io`)

> **Tier 0 Global Ruleset**: Read `/botworkspace/AGENTS.md` and `/botworkspace/FACTBOOK.md` first. Do not duplicate global rules here.

## Repository Scope & Boundaries
- **Personal Academic & Research Portal (`index.html`, `aboutme.html`, `portfolio_ai.html`, `classic.html`, `business_card.html`, `antivibecoding.html`, `yoneda_ai.html`)**: Check `aboutme.html.dev.md` before editing `aboutme.html` (preserves `‼️` on cross-site links to `obeliskproofassistant.github.io`).
- **Rendered Research Notes (`research/*.html`)**: Generated from `research/*.md` via `python3 /botworkspace/tools/render_site_markdown.py` so visitors view formatted documents rather than raw markdown source.

## Verification Commands
```bash
python3 /hostramdisk/georgydunaev.github.io/tools/check_html_links.py
python3 /hostramdisk/georgydunaev.github.io/tools/validate_html5.py
```
