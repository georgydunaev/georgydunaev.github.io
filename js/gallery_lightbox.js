/**
 * Interactive Lightbox Gallery for images/edited/01.png .. 12.png
 * Opens a centered modal view when a visitor clicks any gallery image,
 * with Previous / Next buttons to cycle back and forth.
 */
(function () {
  'use strict';

  function initGalleryLightbox() {
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
      overlay.innerHTML =
        '<div class="gd-lightbox-dialog" role="document">' +
          '<div class="gd-lightbox-header">' +
            '<span id="gd-lightbox-counter" class="gd-lightbox-counter">1 / ' + slides.length + '</span>' +
            '<span id="gd-lightbox-caption" class="gd-lightbox-caption"></span>' +
            '<button type="button" id="gd-lightbox-close" class="gd-lightbox-btn gd-lightbox-close" aria-label="Close gallery">Close</button>' +
          '</div>' +
          '<div class="gd-lightbox-body">' +
            '<button type="button" id="gd-lightbox-prev" class="gd-lightbox-btn gd-lightbox-nav" aria-label="Previous image">Previous</button>' +
            '<div class="gd-lightbox-stage">' +
              '<img id="gd-lightbox-img" class="gd-lightbox-img" src="" alt="" />' +
            '</div>' +
            '<button type="button" id="gd-lightbox-next" class="gd-lightbox-btn gd-lightbox-nav" aria-label="Next image">Next</button>' +
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
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }

    function closeLightbox() {
      isOpen = false;
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

    return {
      open: openLightbox,
      close: closeLightbox,
      next: showNext,
      prev: showPrev,
      getCurrentIndex: function () { return currentIndex; }
    };
  }

  window.initGalleryLightbox = initGalleryLightbox;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGalleryLightbox);
  } else {
    initGalleryLightbox();
  }
})();
