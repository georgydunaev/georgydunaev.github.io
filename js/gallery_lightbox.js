/**
 * Independent Centered Popup Lightbox Gallery for images/edited/01.png .. 12.png
 * Self-contained styles so browser/SW stylesheet caching can never cause
 * the modal to render inline at the bottom of the page.
 */
(function () {
  'use strict';

  var LIGHTBOX_CSS =
    '#gd-gallery-lightbox {' +
      'position: fixed !important;' +
      'top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;' +
      'width: 100vw !important; height: 100vh !important;' +
      'z-index: 2147483647 !important;' +
      'background: rgba(8, 12, 22, 0.85) !important;' +
      'backdrop-filter: blur(5px);' +
      'display: none;' +
      'align-items: center !important;' +
      'justify-content: center !important;' +
      'padding: 16px !important;' +
      'box-sizing: border-box !important;' +
    '}' +
    '#gd-gallery-lightbox.is-open {' +
      'display: flex !important;' +
    '}' +
    '.gd-lightbox-dialog {' +
      'position: relative !important;' +
      'background: #0f172a !important;' +
      'border: 2px solid #38bdf8 !important;' +
      'border-radius: 12px !important;' +
      'padding: 14px 18px !important;' +
      'max-width: 92vw !important;' +
      'max-height: 90vh !important;' +
      'width: 980px !important;' +
      'display: flex !important;' +
      'flex-direction: column !important;' +
      'gap: 10px !important;' +
      'box-shadow: 0 25px 70px rgba(0, 0, 0, 0.85) !important;' +
      'color: #f8fafc !important;' +
      'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;' +
      'box-sizing: border-box !important;' +
    '}' +
    '.gd-lightbox-header {' +
      'display: flex !important;' +
      'align-items: center !important;' +
      'justify-content: space-between !important;' +
      'gap: 10px !important;' +
      'padding-bottom: 8px !important;' +
      'border-bottom: 1px solid rgba(255, 255, 255, 0.16) !important;' +
    '}' +
    '.gd-lightbox-counter {' +
      'font-size: 13px !important;' +
      'font-weight: 700 !important;' +
      'color: #38bdf8 !important;' +
      'background: rgba(56, 189, 248, 0.14) !important;' +
      'border: 1px solid rgba(56, 189, 248, 0.35) !important;' +
      'padding: 3px 10px !important;' +
      'border-radius: 999px !important;' +
      'white-space: nowrap !important;' +
    '}' +
    '.gd-lightbox-caption {' +
      'font-size: 14px !important;' +
      'font-weight: 600 !important;' +
      'color: #e2e8f0 !important;' +
      'text-align: center !important;' +
      'flex: 1 !important;' +
      'overflow: hidden !important;' +
      'text-overflow: ellipsis !important;' +
      'white-space: nowrap !important;' +
    '}' +
    '.gd-lightbox-stage {' +
      'display: flex !important;' +
      'align-items: center !important;' +
      'justify-content: center !important;' +
      'background: #020617 !important;' +
      'border-radius: 8px !important;' +
      'border: 1px solid rgba(255, 255, 255, 0.1) !important;' +
      'padding: 8px !important;' +
      'min-height: 220px !important;' +
      'max-height: 70vh !important;' +
      'overflow: hidden !important;' +
    '}' +
    '.gd-lightbox-img {' +
      'max-width: 100% !important;' +
      'max-height: 68vh !important;' +
      'width: auto !important;' +
      'height: auto !important;' +
      'object-fit: contain !important;' +
      'display: block !important;' +
      'margin: 0 auto !important;' +
      'border-radius: 4px !important;' +
    '}' +
    '.gd-lightbox-controls {' +
      'display: flex !important;' +
      'align-items: center !important;' +
      'justify-content: center !important;' +
      'gap: 14px !important;' +
      'padding-top: 4px !important;' +
    '}' +
    '.gd-lightbox-btn {' +
      'background: #1e293b !important;' +
      'color: #f8fafc !important;' +
      'border: 1px solid #38bdf8 !important;' +
      'border-radius: 8px !important;' +
      'padding: 7px 18px !important;' +
      'font-size: 14px !important;' +
      'font-weight: 700 !important;' +
      'cursor: pointer !important;' +
      'line-height: 1.2 !important;' +
      'user-select: none !important;' +
    '}' +
    '.gd-lightbox-btn:hover {' +
      'background: #2563eb !important;' +
      'border-color: #60a5fa !important;' +
    '}' +
    '.gd-lightbox-close {' +
      'background: #7f1d1d !important;' +
      'border-color: #f87171 !important;' +
      'color: #ffffff !important;' +
    '}' +
    '.gd-lightbox-close:hover {' +
      'background: #dc2626 !important;' +
    '}';

  function injectStyles(doc) {
    if (!doc || doc.getElementById('gd-lightbox-injected-css')) {
      return;
    }
    var styleEl = doc.createElement('style');
    styleEl.id = 'gd-lightbox-injected-css';
    styleEl.textContent = LIGHTBOX_CSS;
    (doc.head || doc.documentElement).appendChild(styleEl);
  }

  function initGalleryLightbox() {
    injectStyles(document);

    var items = Array.prototype.slice.call(
      document.querySelectorAll('[data-gallery-index]')
    );
    if (!items.length) {
      return;
    }

    var slides = items.map(function (el) {
      var img = el.querySelector('img');
      var src = el.getAttribute('data-gallery-src') || el.getAttribute('href') || (img ? img.getAttribute('src') : '');
      var caption = el.getAttribute('data-gallery-caption') || (img ? img.getAttribute('alt') : '') || '';
      return { src: src, caption: caption };
    });

    var overlay = document.getElementById('gd-gallery-lightbox');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'gd-gallery-lightbox';
      overlay.className = 'gd-lightbox-overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'Image Gallery Viewer');
      overlay.setAttribute('aria-hidden', 'true');
      // Inline fallback style guarantees it never renders at page bottom even if CSS is blocked
      overlay.style.cssText =
        'position:fixed;top:0;left:0;right:0;bottom:0;width:100vw;height:100vh;' +
        'z-index:2147483647;background:rgba(8,12,22,0.85);display:none;' +
        'align-items:center;justify-content:center;padding:16px;box-sizing:border-box;';

      overlay.innerHTML =
        '<div class="gd-lightbox-dialog" role="document">' +
          '<div class="gd-lightbox-header">' +
            '<span id="gd-lightbox-counter" class="gd-lightbox-counter">1 / ' + slides.length + '</span>' +
            '<span id="gd-lightbox-caption" class="gd-lightbox-caption"></span>' +
            '<button type="button" id="gd-lightbox-close-top" class="gd-lightbox-btn gd-lightbox-close" aria-label="Close gallery">close</button>' +
          '</div>' +
          '<div class="gd-lightbox-stage">' +
            '<img id="gd-lightbox-img" class="gd-lightbox-img" src="" alt="" />' +
          '</div>' +
          '<div class="gd-lightbox-controls">' +
            '<button type="button" id="gd-lightbox-prev" class="gd-lightbox-btn gd-lightbox-nav" aria-label="Previous image">&lt;-</button>' +
            '<button type="button" id="gd-lightbox-close" class="gd-lightbox-btn gd-lightbox-close" aria-label="Close gallery">close</button>' +
            '<button type="button" id="gd-lightbox-next" class="gd-lightbox-btn gd-lightbox-nav" aria-label="Next image">-&gt;</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
    }

    var imgEl = document.getElementById('gd-lightbox-img');
    var counterEl = document.getElementById('gd-lightbox-counter');
    var captionEl = document.getElementById('gd-lightbox-caption');
    var prevBtn = document.getElementById('gd-lightbox-prev');
    var nextBtn = document.getElementById('gd-lightbox-next');
    var closeBtn = document.getElementById('gd-lightbox-close');
    var closeTopBtn = document.getElementById('gd-lightbox-close-top');
    var currentIndex = 0;
    var isOpen = false;

    function renderSlide(index) {
      var total = slides.length;
      currentIndex = ((index % total) + total) % total;
      var slide = slides[currentIndex];
      imgEl.setAttribute('src', slide.src);
      imgEl.setAttribute('alt', slide.caption || ('Image ' + (currentIndex + 1)));
      counterEl.textContent = (currentIndex + 1) + ' / ' + total;
      captionEl.textContent = slide.caption;
    }

    function openLightbox(index) {
      renderSlide(index);
      isOpen = true;
      overlay.style.display = 'flex';
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
      isOpen = false;
      overlay.style.display = 'none';
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }

    function showPrev() {
      renderSlide(currentIndex - 1);
    }

    function showNext() {
      renderSlide(currentIndex + 1);
    }

    items.forEach(function (el, idx) {
      el.addEventListener('click', function (ev) {
        ev.preventDefault();
        openLightbox(idx);
      });
    });

    var openTriggers = Array.prototype.slice.call(
      document.querySelectorAll('[data-gallery-open]')
    );
    openTriggers.forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.preventDefault();
        var startIdx = parseInt(btn.getAttribute('data-gallery-open') || '0', 10) || 0;
        openLightbox(startIdx);
      });
    });

    prevBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      showPrev();
    });

    nextBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      showNext();
    });

    closeBtn.addEventListener('click', function (ev) {
      ev.stopPropagation();
      closeLightbox();
    });

    if (closeTopBtn) {
      closeTopBtn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        closeLightbox();
      });
    }

    overlay.addEventListener('click', function (ev) {
      if (ev.target === overlay) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', function (ev) {
      if (!isOpen) {
        return;
      }
      if (ev.key === 'Escape') {
        closeLightbox();
      } else if (ev.key === 'ArrowLeft') {
        showPrev();
      } else if (ev.key === 'ArrowRight') {
        showNext();
      }
    });

    var api = {
      open: openLightbox,
      close: closeLightbox,
      next: showNext,
      prev: showPrev,
      getCurrentIndex: function () { return currentIndex; }
    };
    window.gdGalleryLightbox = api;
    return api;
  }

  window.initGalleryLightbox = initGalleryLightbox;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryLightbox);
  } else {
    initGalleryLightbox();
  }
})();
