/**
 * js/scroll_spy.js — Active Section Scroll Spy
 * georgydunaev.github.io — [Curated] Ticket 020 (UX & Themes), 2026-10-24
 *
 * Highlights the section link in the navigation header whose target section is
 * currently anchored under the viewport sentinel line. The highlighted link
 * receives `.active` plus `aria-current="true"` so assistive technology
 * announces which part of the page the visitor is reading.
 *
 * Invariants (deliberate design decisions):
 *   - Zero dependencies, zero network I/O, zero persistence: nothing is
 *     fetched, stored, transmitted, or evaluated. Privacy-safe by
 *     construction — the module reads geometry and writes DOM state only.
 *   - Deterministic geometry: the active section is the LAST tracked section
 *     (in document order) whose top edge sits at or above the sentinel line at
 *     40% of the viewport height (tunable per <nav> via the
 *     data-scroll-spy-offset="0..1" attribute).
 *   - Top reset: scrolled above every tracked section clears the highlight
 *     ("resets to top-nav"), so no misleading link is marked active.
 *   - Bottom snap: within 16px of maximum scroll the LAST tracked section is
 *     always treated as active, even when its top edge cannot reach the
 *     sentinel line (short page tails must never leave the nav fully inert).
 *   - Robustness: header/logo href="#" and fragment targets that do not
 *     resolve (ghost links) are ignored; duplicate links to the same section
 *     are co-highlighted; a page without fragments makes the module a silent
 *     no-op; re-running initScrollSpy() re-scans linkage without leaving any
 *     stale highlight behind.
 *   - Efficiency: one requestAnimationFrame-coalesced, passive update handler
 *     per page, regardless of how many <nav> containers qualify.
 *
 * Public API:
 *   window.initScrollSpy() — (re)scan the document and (re)bind spies; safe to
 *   call repeatedly. The module auto-runs once scripts are deferrable
 *   (DOMContentLoaded or deferred end-of-body execution), so no manual wiring
 *   is required beyond including: <script src="js/scroll_spy.js" defer></script>
 *
 * Provenance: resolved and implemented by opencode/glm-5.3-flash-free
 * (Capability Tier 1) for [Curated] Ticket 020, acting on the peer-review
 * reopen (mistral/codestral-latest): deliverable + page wiring + test gate.
 */
(function() {
  'use strict';

  var SENTINEL_OFFSET_DEFAULT = 0.4; // sentinel line at 40% of viewport height
  var BOTTOM_TOLERANCE_PX = 16;      // snap to last section near max scroll
  var ACTIVE_CLASS = 'active';
  var ARIA_CURRENT = 'aria-current';
  var LINK_SELECTOR = 'a[href^="#"]';
  var SPY_CONTAINER_SELECTOR = 'nav[data-scroll-spy]';
  var NAV_CONTAINER_SELECTOR = 'nav';

  var spies = new Map(); // nav container -> spy (idempotent re-init support)
  var pageListenersBound = false;

  /**
   * Extract an in-page fragment id from a link href.
   * Returns null for href="#" (logo) or empty fragments.
   */
  function fragmentId(href) {
    if (typeof href !== 'string' || href.charAt(0) !== '#') return null;
    var raw = href.slice(1);
    if (!raw) return null;
    try {
      return decodeURIComponent(raw);
    } catch (err) {
      return raw; // id containing stray '%' characters — keep the raw form
    }
  }

  /**
   * Sentinel offset: explicit data-scroll-spy-offset on the nav container,
   * clamped to [0, 1]; default 0.4 (viewport 40% line).
   */
  function parseOffset(container) {
    var raw = container.getAttribute('data-scroll-spy-offset');
    if (raw === null) return SENTINEL_OFFSET_DEFAULT;
    var value = parseFloat(raw);
    if (!isFinite(value)) return SENTINEL_OFFSET_DEFAULT;
    return Math.min(Math.max(value, 0), 1);
  }

  /**
   * Map nav fragment links to their section targets:
   * [{ id, section, links: [link...] }] — duplicate hrefs co-highlight.
   * Unresolvable/ghost targets are skipped entirely.
   */
  function collectFrames(container) {
    var frames = [];
    var byId = Object.create(null);
    var links;
    try {
      links = container.querySelectorAll(LINK_SELECTOR);
    } catch (err) {
      links = [];
    }
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var id = fragmentId(link.getAttribute('href'));
      if (!id) continue;
      var section = document.getElementById(id);
      // Skip: missing target, self-reference, or sections living inside the
      // nav container itself.
      if (!section || section === container || container.contains(section)) continue;
      if (!Object.prototype.hasOwnProperty.call(byId, id)) {
        var frame = { id: id, section: section, links: [] };
        byId[id] = frame;
        frames.push(frame);
      }
      byId[id].links.push(link);
    }
    return frames;
  }

  /**
   * Apply (or clear) the active state for one specific section id.
   * All nav links pointing to that id are highlighted together.
   */
  function setActive(frames, activeId) {
    for (var i = 0; i < frames.length; i++) {
      var on = frames[i].id === activeId;
      for (var j = 0; j < frames[i].links.length; j++) {
        var link = frames[i].links[j];
        if (on) {
          link.classList.add(ACTIVE_CLASS);
          link.setAttribute(ARIA_CURRENT, 'true');
        } else {
          link.classList.remove(ACTIVE_CLASS);
          link.removeAttribute(ARIA_CURRENT);
        }
      }
    }
  }

  /**
   * Create one spy per nav container. locate() measures tracked sections and
   * decides the active one:
   *   1. Last section (document order) whose top <= sentinel line wins
   *      (regions between/after tracked sections map backwards).
   *   2. Near bottom of page the last section always wins (bottom snap).
   *   3. Above every section => null, highlight cleared (top reset).
   */
  function createSpy(container) {
    var frames = collectFrames(container);
    if (frames.length === 0) return null; // silent no-op nav
    var sentinelOffset = parseOffset(container);
    var activeId = null;

    function locate() {
      var docEl = document.documentElement;
      var winH = window.innerHeight || docEl.clientHeight || 1;
      var scrollY = window.pageYOffset || window.scrollY || docEl.scrollTop || 0;
      var maxScroll = Math.max(docEl.scrollHeight - winH, 0);
      var sentinel = winH * sentinelOffset;

      var candidates = [];
      for (var i = 0; i < frames.length; i++) {
        candidates.push({ frame: frames[i], top: frames[i].section.getBoundingClientRect().top });
      }
      // getBoundingClientRect().top shares one coordinate frame (viewport),
      // so sorting by it equals sorting by document position.
      candidates.sort(function(a, b) { return a.top - b.top; });

      var best = null;
      for (var k = 0; k < candidates.length; k++) {
        if (candidates[k].top <= sentinel) best = candidates[k].frame;
      }
      if (candidates.length > 0 && scrollY >= maxScroll - BOTTOM_TOLERANCE_PX) {
        best = candidates[candidates.length - 1].frame; // bottom snap
      }

      var nextId = best ? best.id : null;
      if (nextId === activeId) return;
      setActive(frames, nextId);
      activeId = nextId;
    }

    function dispose() {
      setActive(frames, null); // clear every highlight before rebinding
    }

    return { locate: locate, dispose: dispose };
  }

  /**
   * One rAF-coalesced locate pass for every live spy; nothing is scheduled
   * while a pass is already pending.
   */
  function locateAll() {
    spies.forEach(function(spy) { spy.locate(); });
  }

  function scheduleMacro(callback) {
    if (typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(callback);
    } else {
      callback();
    }
  }

  function bindPageListeners() {
    if (pageListenersBound || spies.size === 0) return;
    pageListenersBound = true;
    var scheduled = false;
    var requestLocate = function() {
      if (scheduled) return;
      scheduled = true;
      scheduleMacro(function() {
        scheduled = false;
        locateAll();
      });
    };
    window.addEventListener('scroll', requestLocate, { passive: true });
    window.addEventListener('resize', requestLocate);
    window.addEventListener('hashchange', requestLocate);
    window.addEventListener('load', requestLocate);
  }

  /** Nav containers: explicitly opted-in nav[data-scroll-spy], else every nav. */
  function collectContainers() {
    var explicit = [];
    var fallback = [];
    try {
      explicit = Array.prototype.slice.call(document.querySelectorAll(SPY_CONTAINER_SELECTOR));
      if (explicit.length === 0) {
        fallback = Array.prototype.slice.call(document.querySelectorAll(NAV_CONTAINER_SELECTOR));
      }
    } catch (err) {
      return []; // broken DOM environment: degrade to silent no-op
    }
    return explicit.length > 0 ? explicit : fallback;
  }

  /** (Re)scan the document: replaces stale spies and re-locates everything. */
  function initScrollSpy() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    var containers = collectContainers();
    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      var existing = spies.get(container);
      if (existing) existing.dispose();
      var spy = createSpy(container);
      if (spy) {
        spies.set(container, spy);
      } else {
        spies.delete(container);
      }
    }
    bindPageListeners();
    locateAll();
  }

  window.initScrollSpy = initScrollSpy;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { initScrollSpy(); }, { once: true });
  } else {
    initScrollSpy();
  }
})();
