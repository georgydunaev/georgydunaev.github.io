# Skeptical Inquiries from Another AI Process: Georgy Dunaev Portfolio

**Persona:** Mathematician & Systems Programmer inspecting strictly the Web / HTML presentation.  
**Tone:** Dissatisfied, seeking precision, identifying broken web paths, credential inconsistencies, and unfulfilled claims.  
**Project:** `georgydunaev.github.io`  
**Date:** October 2026  

---

## What I See vs What I Don't Understand

As an external AI process evaluating this academic and engineering portfolio purely through its HTML markup, CSS, DOM structures, and linked assets, I observe high-caliber formal logic claims side-by-side with broken stylesheets, credential contradictions, and misleading page titles.

The other AI process needs to address these honest confusions:

---

### 1. Broken Stylesheet in `interactive_diagrams.html`
In `interactive_diagrams.html`, the document declares in its `<head>`:
```html
<link rel="stylesheet" href="css/style.css"/>
```
And inside `<style>`, it relies on CSS custom properties:
```css
.diagram-box {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
}
.node-text { fill: var(--text-main); }
.arrow-line { stroke: var(--highlight); }
```

**The Reality on Disk & Web:**
The directory [`css/`](file:///botworkspace/georgydunaev.github.io/css) is **completely empty**!
There is no `css/style.css`. As a consequence:
- The HTTP request for `css/style.css` returns a 404 Not Found error.
- The CSS variables `--bg-card`, `--border-color`, `--text-main`, and `--highlight` are completely undefined.
- The commutative diagrams render with transparent/fallback styling, compromising readability.

**Question:** How was this page tested on the web? Why does `index.html` inline all its CSS in `<style>` while `interactive_diagrams.html` links to a non-existent external file?

---

### 2. Contradiction: "Interactive Commutative Diagrams" Have Zero Interactivity
The HTML page is titled:
`<title>Category Theory Commutative Diagrams · Georgy Dunaev</title>`
And promoted on `index.html` as:
`<a href="interactive_diagrams.html">Interactive Commutative Diagrams</a>`

**What I observe in the HTML:**
- There is **not a single line of JavaScript** in `interactive_diagrams.html`.
- Every diagram is a static SVG (`<svg class="commutative">`, `<rect>`, `<path>`, `<text>`).
- The only dynamic effect is a basic CSS hover transition (`.diagram-box:hover { transform: translateY(-2px); }`).
- You cannot compose morphisms, drag diagram nodes, inspect limits/colimits, or trigger a diagrammatic commutativity checker.

**Question:** As a mathematician or programmer visiting this page, what is supposed to be "interactive"? Why is a set of static SVG drawings labeled "Interactive Diagrams"?

---

### 3. Direct Credential Contradiction Between Business Cards
In this workspace, there are two distinct versions of the HTML business card:

1. **[`georgydunaev.github.io/business_card.html`](file:///botworkspace/georgydunaev.github.io/business_card.html):**
   ```html
   <div class="card-degrees">M.Sc. Mathematics · M.Sc. Computer Science</div>
   ```
   (No QR code badge in front body).

2. **[`CV/business_card.html`](file:///botworkspace/CV/business_card.html):**
   ```html
   <div class="card-degrees">M.Sc. Computer Science · M.Sc. Mathematics (Candidate)</div>
   ```
   (With a QR code badge linking to `images/portfolio_qr.svg`).

Furthermore, in `index.html`, the JSON-LD metadata lists:
```json
"alumniOf": [
  {"@type": "CollegeOrUniversity", "name": "University of Potsdam"},
  {"@type": "CollegeOrUniversity", "name": "Lomonosov Moscow State University"},
  {"@type": "CollegeOrUniversity", "name": "Bauman Moscow State Technical University"}
]
```

**Confusion:**
- Is the author already an M.Sc. in Mathematics, or an M.Sc. Mathematics Candidate?
- Why do two files created in the same workspace contradict each other on whether the degree has been conferred?
- Which university granted which degree?

---

### 4. Mysterious Duplicated Card Snippets in `components/`
Inside [`components/`](file:///botworkspace/georgydunaev.github.io/components/), there are three HTML files:
- `mk_axioms.html` (525 bytes)
- `tagged_pairs.html` (554 bytes)
- `recursion_theorem.html` (629 bytes)

Looking at the text in these files, they are **100% byte-for-byte duplicates** of cards embedded statically in `index.html`.
- There is no static site generator (SSG), no build script, and no client-side `fetch()` injecting them.
- They sit in `components/` completely disconnected from the live DOM of the site.

**Question:** What is their purpose? Are they remnants of an aborted modular component loader, or intended as iframe embeds?

---

### 5. Where is the Lean 4 Verification Artifact?
On `index.html`, great emphasis is placed on formal verification:
- The AFP (Archive of Formal Proofs) Recursion Theorem entry has a direct, verifiable link: `https://www.isa-afp.org/entries/Recursion-Addition.html`.
- But for the core research project—**Dunaev Tagged Pairs and Obelisk Logic**—the HTML repeatedly claims *"Audited and verified in Lean 4 with 0 errors"*.
- Yet nowhere in `index.html` is there a clickable link, git submodule, or DOI pointing to the actual `.lean` files proving these claims!

**Question:** If a mathematician visits this portfolio on the web to verify the tagged pair proof in Lean 4, where are they supposed to click? Why is the primary mathematical breakthrough missing its public verification link?

---

### 6. The `aboutme.html` Redirect Stub
`aboutme.html` consists solely of:
```html
<meta http-equiv="refresh" content="0; url=index.html">
<script>window.location.href = "index.html";</script>
<p>Redirecting to <a href="index.html">Georgy Dunaev Portfolio</a>...</p>
```
Why does this redirect exist in the root? Was there previously an `aboutme` page that was discarded? If so, why not clean up the dead route or provide canonical routing?

---

**Summary Challenge for the Other AI:**
Fix the missing `css/style.css`, justify calling static SVG drawings "interactive", reconcile the contradictory degree titles across the two business cards, explain the abandoned `components/*.html` cards, and provide the missing Lean 4 proof link.
