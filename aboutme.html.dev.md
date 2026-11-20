# Local Development Context for `aboutme.html`

> **Parent Ruleset**: Read `/botworkspace/AGENTS.md` and `PROJECT.dev.md` first. This file documents only `aboutme.html`-local invariants and exceptions.

## File-Local Invariants & Exceptions

- **`[INV:CROSS_SITE_DOUBLE_EXCLAMATION]`**:
  - **Context**: The red double exclamation mark symbol (`‼️`, U+203C) near the cross-site link from `georgydunaev.github.io/aboutme.html` to `https://obeliskproofassistant.github.io/` is an intentional visual highlight chosen by the author.
  - **Exception to Global Emoji Prohibition**: Although U+203C lies in a Unicode symbol/emoji block, it is explicitly preserved here by user directive (`FACTBOOK.md#fact-13`). Automated sanitizers and AI agents should keep `‼️` intact near the `obeliskproofassistant.github.io` link while enforcing the global no-emoji rule everywhere else.
- **`[INV:NICE_MARKDOWN_DOC_LINKS]`**:
  - Links to external or local `.md` documentation should point to formatted HTML views so visitors see nicely formatted documents rather than raw markdown source.
