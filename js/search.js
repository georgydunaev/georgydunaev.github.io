/**
 * js/search.js — Fast Client-Side Research and Publication Search Engine
 * Zero-dependency, instantaneous keyword matching across research papers, axioms, and CV assets.
 */

(function() {
  const SEARCH_INDEX = [
    { title: "Recursion Theorem in ZF", category: "Publications", url: "#publications", tags: ["Isabelle/ZF", "AFP", "Recursion", "Transfinite", "Logic"], snippet: "Peer-reviewed mechanization in the Archive of Formal Proofs using tagged pairs." },
    { title: "Dunaev Tagged Pairs & Axiom of Regularity", category: "Research", url: "#math", tags: ["Set Theory", "Foundation", "Regularity", "Universe", "Model"], snippet: "Constructing models avoiding non-circularity and providing tagged pairs." },
    { title: "Yoneda Lemma & Presheaf Categories", category: "Research", url: "#math", tags: ["Category Theory", "Yoneda", "Presheaves", "Functors", "Adjunctions"], snippet: "Interactive visualization: Nat(h_A, F) ≅ F(A) for locally small categories." },
    { title: "Obelisk Proof Assistant", category: "Software", url: "https://obeliskproofassistant.github.io", tags: ["Proof Assistant", "Sequent Calculus", "De Bruijn", "Morse-Kelley"], snippet: "Standalone theorem prover in Standard ML with verified deduction engine." },
    { title: "Anti-Vibe Coding Manifesto", category: "Methodology", url: "https://georgydunaev.github.io/antivibecoding", tags: ["Verification", "Anti-Vibe", "Formal Methods", "Dijkstra"], snippet: "The Ten Inviolable Laws of Rigorous Verification against unverified vibe coding." },
    { title: "Curriculum Vitae (Executive 1-Page)", category: "CV", url: "/preview/CV/CV_Executive.pdf", tags: ["CV", "Resume", "Executive", "FinTech", "Quant"], snippet: "Compact, high-impact 1-page CV for engineering leadership." },
    { title: "Curriculum Vitae (Full 2-Page English PDF)", category: "CV", url: "/preview/CV/CV_EN.pdf", tags: ["CV", "Resume", "English", "ReportLab"], snippet: "Complete 2-page formal methods and logic engineering resume." },
    { title: "Lebenslauf (German 2-Page PDF)", category: "CV", url: "/preview/CV/CV_DE.pdf", tags: ["CV", "Lebenslauf", "German", "Deutsch"], snippet: "Deutscher Lebenslauf mit Publikationen und Lehre an der Universität Potsdam." },
    { title: "Formal Methods Cover Letter", category: "Career", url: "/preview/CV/cover_letter_en.pdf", tags: ["Cover Letter", "Formal Verification", "Logic", "Letter"], snippet: "Targeted formal methods cover letter articulating engineering impact." },
    { title: "3D Digital Business Card", category: "Interactive", url: "/preview/CV/business_card.html", tags: ["Business Card", "vCard", "Interactive", "3D"], snippet: "Interactive 3D flip card with QR code and contact export." }
  ];

  window.initSearch = function(inputId, resultsId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(resultsId);
    if (!input || !container) return;

    input.addEventListener("input", function(e) {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        container.innerHTML = "";
        container.style.display = "none";
        return;
      }

      const matches = SEARCH_INDEX.filter(item => {
        const str = (item.title + " " + item.snippet + " " + item.tags.join(" ")).toLowerCase();
        return str.includes(q);
      });

      if (matches.length === 0) {
        container.innerHTML = `<div style="padding: 12px; color: var(--text-muted); font-size: 0.9rem;">No matching research assets found for "<strong>${escapeHtml(q)}</strong>".</div>`;
        container.style.display = "block";
        return;
      }

      let html = `<div style="display: flex; flex-direction: column; gap: 8px; padding: 12px;">`;
      matches.forEach(m => {
        html += `
          <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 6px; padding: 10px 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <a href="${m.url}" target="_blank" style="color: var(--accent-hover); font-weight: 600; text-decoration: none; font-size: 0.95rem;">${escapeHtml(m.title)}</a>
              <span class="badge" style="background: rgba(123,88,207,0.18); color: var(--accent-purple); font-size: 0.72rem;">${escapeHtml(m.category)}</span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 6px;">${escapeHtml(m.snippet)}</div>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${m.tags.map(t => `<span class="tag" style="font-size: 0.7rem;">${escapeHtml(t)}</span>`).join("")}
            </div>
          </div>
        `;
      });
      html += `</div>`;
      container.innerHTML = html;
      container.style.display = "block";
    });
  };

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
})();
