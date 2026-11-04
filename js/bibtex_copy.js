/**
 * js/bibtex_copy.js — 1-Click BibTeX Clipboard Copy Component (Ticket 011).
 * Supports navigator.clipboard with graceful fallback to document.execCommand('copy').
 */
(function () {
  'use strict';

  function fallbackCopyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(ta);
    }
  }

  function copyBibtexString(bibtex, triggerEl) {
    if (!bibtex) return;
    var done = function () {
      if (!triggerEl) return;
      var origText = triggerEl.getAttribute('data-orig-label') || triggerEl.textContent;
      triggerEl.setAttribute('data-orig-label', origText);
      triggerEl.textContent = 'Copied!';
      triggerEl.classList.add('bibtex-copied');
      setTimeout(function () {
        triggerEl.textContent = origText;
        triggerEl.classList.remove('bibtex-copied');
      }, 1600);
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(bibtex).then(done).catch(function () {
        fallbackCopyText(bibtex);
        done();
      });
    } else {
      fallbackCopyText(bibtex);
      done();
    }
  }

  function initBibtexCopy() {
    var buttons = document.querySelectorAll('[data-bibtex-btn], .btn-bibtex-copy');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('[data-bibtex]');
        var bib = btn.getAttribute('data-bibtex') || (card && card.getAttribute('data-bibtex')) || '';
        copyBibtexString(bib, btn);
      });
    });
  }

  if (typeof window !== 'undefined') {
    window.copyBibtexString = copyBibtexString;
    window.initBibtexCopy = initBibtexCopy;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initBibtexCopy);
    } else {
      initBibtexCopy();
    }
  }
})();
