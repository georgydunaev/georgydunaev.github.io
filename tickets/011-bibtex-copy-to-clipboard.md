# Ticket 011: BibTeX 1-Click Clipboard Copy Component

## Context & Objectives
Academic publications displayed on the personal portfolio website require an intuitive, 1-click button to copy citation entries directly to the user's clipboard in clean BibTeX format.

## Requirements & Acceptance Criteria
1. Add an interactive clipboard copy utility in `js/bibtex_copy.js` with visual feedback tooltip ("Copied!").
2. Embed valid BibTeX citation data attributes `data-bibtex` on publication entry cards in `index.html`.
3. Fallback gracefully for older browsers using `document.execCommand('copy')` if `navigator.clipboard` is unavailable.
4. Add automated test in `tests/test_bibtex_component.py` asserting all publication entries contain valid non-empty BibTeX strings.
