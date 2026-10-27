/**
 * scroll_spy_functional.mjs — Ticket 020 functional harness (Node ≥18, zero deps).
 *
 * Executes js/scroll_spy.js inside a deterministic fake-DOM environment and
 * verifies its full contract:
 *   - init transitions across every nav-linked section (exact sentinel-line
 *     equality and one-px-below strictness),
 *   - top-of-page reset above the first tracked section (no stale highlight),
 *   - bottom-of-page snap within the 16px tolerance (including the boundary
 *     equality and a discriminative case where geometry alone would degrade),
 *   - trailing unlinked regions mapping backwards to the last tracked item,
 *   - viewport resize moving the sentinel line,
 *   - requestAnimationFrame coalescing (queued scrolls resolve to the latest),
 *   - inert anchors (logo "#", ghost "#missing", external page links) are
 *     never highlighted,
 *   - aria-current vs .active always agree and annotate at most one section,
 *   - duplicate links to the same section co-highlight,
 *   - idempotent re-initialization (initScrollSpy twice, still correct),
 *   - deferred boot via document 'DOMContentLoaded' when readyState 'loading',
 *   - explicit nav[data-scroll-spy] opt-in container selection.
 *
 * Prints "[SCROLL-SPY PASS] N assertions" on success; exits 1 on the first
 * failing assertion with the failure printed on stderr.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const MODULE_PATH = resolve(here, '..', 'js', 'scroll_spy.js');
const MODULE_SRC = readFileSync(MODULE_PATH, 'utf8');

let assertionCount = 0;
function assert(cond, message) {
  assertionCount++;
  if (!cond) {
    console.error(`[SCROLL-SPY ASSERT] ${message}`);
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ *
 * Fake DOM (exactly the API surface js/scroll_spy.js consumes)
 * ------------------------------------------------------------------ */

function makeEnv(config, { readyState = 'complete' } = {}) {
  const state = { scrollY: 0 };

  const listeners = new Map();     // window listeners
  const docListeners = new Map();  // document listeners
  const rafQueue = [];

  function addListener(map, type, fn) {
    if (!map.has(type)) map.set(type, []);
    map.get(type).push(fn);
  }

  class ClassListShim {
    constructor() { this._set = new Set(); }
    add(...names) { for (const n of names) this._set.add(String(n)); }
    remove(...names) { for (const n of names) this._set.delete(String(n)); }
    contains(name) { return this._set.has(String(name)); }
    get value() { return [...this._set].join(' '); }
  }

  class ElementShim {
    constructor(tagName, attributes = {}) {
      this.tagName = String(tagName).toUpperCase();
      this.attributes = {};
      for (const [k, v] of Object.entries(attributes)) this.attributes[k] = String(v);
      this.children = [];
      this.parentNode = null;
      this.classList = new ClassListShim();
      this.docTop = 0;
      this.docHeight = 0;
    }
    getAttribute(name) {
      return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null;
    }
    setAttribute(name, value) { this.attributes[String(name)] = String(value); }
    removeAttribute(name) { delete this.attributes[String(name)]; }
    appendChild(child) {
      if (child.parentNode) {
        child.parentNode.children = child.parentNode.children.filter((c) => c !== child);
      }
      child.parentNode = this;
      this.children.push(child);
      return child;
    }
    contains(el) {
      for (let node = el; node != null; node = node.parentNode) {
        if (node === this) return true;
      }
      return false;
    }
    getBoundingClientRect() {
      return { top: this.docTop - state.scrollY, height: this.docHeight };
    }
    querySelectorAll(selector) {
      const out = [];
      for (const el of walkAll(this)) {
        if (el !== this && matchesSelector(el, selector)) out.push(el);
      }
      return out;
    }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
  }

  function* walkAll(root) {
    for (const child of root.children) {
      yield child;
      yield* walkAll(child);
    }
  }

  function matchesSelector(el, selector) {
    // Supported: tag | tag[attr] | tag[attr="v"] | tag[attr^="v"]
    const sel = String(selector).trim();
    const m = /^([a-zA-Z][a-zA-Z0-9-]*)((?:\[[^\]]+\])*)$/.exec(sel);
    if (!m) throw new Error(`fake DOM shim: unsupported selector "${sel}"`);
    if (el.tagName !== m[1].toUpperCase()) return false;
    const attrRegex = /\[([a-zA-Z_][a-zA-Z0-9_-]*)(?:(\^?=)\s*(?:"([^"]*)"))?\]/g;
    let am;
    while ((am = attrRegex.exec(m[2])) !== null) {
      const name = am[1];
      const operator = am[2];
      const value = am[3] ?? am[4] ?? '';
      const actual = el.getAttribute(name);
      if (actual === null) return false;
      if (operator === '=' && actual !== value) return false;
      if (operator === '^=' && !actual.startsWith(value)) return false;
    }
    return true;
  }

  function layout(el, { top, height }) {
    el.docTop = top;
    el.docHeight = height;
  }

  /* -- build the document -- */
  const docEl = new ElementShim('html');
  const headEl = new ElementShim('head');
  const bodyEl = new ElementShim('body');
  docEl.appendChild(headEl);
  docEl.appendChild(bodyEl);

  if (config.prefix) {
    const prefixEl = new ElementShim('div', { class: 'prefix-band' });
    layout(prefixEl, { top: config.prefix.top, height: config.prefix.height });
    bodyEl.appendChild(prefixEl);
  }

  const navEl = new ElementShim('nav', config.marked ? { 'data-scroll-spy': '' } : {});
  const ulEl = new ElementShim('ul', { class: 'nav-links' });
  navEl.appendChild(ulEl);
  bodyEl.appendChild(navEl);

  for (const item of config.navLinks) {
    const liEl = new ElementShim('li');
    const aEl = new ElementShim('a', { href: item.href, class: 'nav-link' });
    aEl.textContent = item.title;
    liEl.appendChild(aEl);
    ulEl.appendChild(liEl);
  }

  const logoLink = new ElementShim('a', { href: '#', class: 'nav-logo' });
  logoLink.textContent = 'GD.';
  ulEl.appendChild(logoLink);

  const ghostLink = config.ghostLink === false
    ? null
    : (() => {
        const aEl = new ElementShim('a', { href: '#ghost-target', class: 'nav-ghost' });
        aEl.textContent = 'Ghost';
        ulEl.appendChild(aEl);
        return aEl;
      })();

  const extLink = new ElementShim('a', { href: 'other_page.html', class: 'nav-ext' });
  extLink.textContent = 'External';
  ulEl.appendChild(extLink);

  function appendSection(id) {
    const el = new ElementShim('section', { id });
    bodyEl.appendChild(el);
    return el;
  }

  /* layout for sections */
  for (const sec of config.sections) {
    layout(appendSection(sec.id), { top: sec.top, height: sec.height });
  }

  const win = {
    innerHeight: config.viewport,
    fire(type) {
      for (const fn of (listeners.get(type) || []).slice()) fn({ type, preventDefault() {} });
    },
    drain() {
      let steps = 0;
      while (rafQueue.length > 0) {
        const pending = rafQueue.splice(0, rafQueue.length);
        for (const cb of pending) cb();
        if (++steps > 1000) throw new Error('rAF queue failed to settle');
      }
    },
  };
  Object.defineProperty(win, 'scrollY', {
    get: () => state.scrollY,
    set: (v) => { state.scrollY = v; },
  });
  Object.defineProperty(win, 'pageYOffset', {
    get: () => state.scrollY,
    set: (v) => { state.scrollY = v; },
  });
  win.addEventListener = (type, fn, opts) => { void opts; addListener(listeners, type, fn); };
  win.requestAnimationFrame = (cb) => { rafQueue.push(cb); };

  const document_ = {
    readyState,
    documentElement: docEl,
  };
  document_.getElementById = (id) => {
    for (const el of walkAll(docEl)) {
      if (el.getAttribute('id') === String(id)) return el;
    }
    return null;
  };
  document_.querySelectorAll = (sel) => docEl.querySelectorAll(sel);
  document_.querySelector = (sel) => docEl.querySelectorAll(sel)[0] || null;
  document_.addEventListener = (type, fn, opts) => { void opts; addListener(docListeners, type, fn); };

  Object.defineProperty(docEl, 'scrollHeight', {
    get() {
      let extent = win.innerHeight;
      for (const el of walkAll(bodyEl)) extent = Math.max(extent, el.docTop + el.docHeight);
      return extent;
    },
  });
  Object.defineProperty(docEl, 'clientHeight', { get: () => win.innerHeight });

  const env = {
    window: win,
    document: document_,
    links: {},
    sections: {},
    logoLink,
    ghostLink,
    extLink,
    navEl,
    fireDocument(type) {
      for (const fn of (docListeners.get(type) || []).slice()) fn({ type, preventDefault() {} });
    },
  };
  // Title-keyed link registry: duplicates share an href but keep distinct keys.
  const anchors = ulEl.querySelectorAll('a[href^="#"]');
  for (const aEl of anchors) {
    const href = aEl.getAttribute('href');
    if (href === '#') continue; // logo anchor
    const item = config.navLinks.find((i) => i.href === href && !(i.title in env.links));
    if (item) env.links[item.title] = aEl;
  }
  for (const sec of config.sections) env.sections[sec.id] = document_.getElementById(sec.id);

  return env;
}

function evalUnder(env) {
  // Fresh function scope per environment — scenarios cannot leak state.
  new Function('window', 'document', MODULE_SRC)(env.window, env.document);
}

/* ------------------------------------------------------------------ *
 * Shared assertions
 * ------------------------------------------------------------------ */

function assertActive(env, expectedTitles, label) {
  const expected = expectedTitles === null ? [] : [...expectedTitles];
  const annotated = [];
  for (const [title, el] of Object.entries(env.links)) {
    const aria = el.getAttribute('aria-current') === 'true';
    const cls = el.classList.contains('active');
    assert(aria === cls, `${label}: aria-current vs .active disagree on "${title}"`);
    if (aria) annotated.push(title);
  }
  const got = annotated.sort().join(',');
  const want = expected.sort().join(',');
  assert(got === want, `${label}: expected active [${want}] but found [${got}]`);
  for (const inert of [env.logoLink, env.ghostLink, env.extLink]) {
    if (!inert) continue;
    assert(!inert.getAttribute('aria-current'), `${label}: inert anchor "${inert.textContent}" got aria-current`);
    assert(!inert.classList.contains('active'), `${label}: inert anchor "${inert.textContent}" got .active`);
  }
}

function runScroll(env, y) {
  env.window.scrollY = y;
  env.window.fire('scroll');
  env.window.drain();
}

/* ------------------------------------------------------------------ *
 * Layout fixtures (sentinel = 0.4 * viewport, tolerance = 16px)
 * ------------------------------------------------------------------ */

/*
 * MAIN: viewport 700 -> sentinel 280; extent 5240 -> maxScroll 4540.
 *   about 0..720 | projects 720..1720 | math 1720..2840
 *   experience 2840..4120 | skills 4120..4680
 *   contact 4680..4980 + extra 4980..5240 : NOT nav-linked (trailing region)
 */
const MAIN = {
  viewport: 700,
  navLinks: [
    { href: '#about', title: 'About' },
    { href: '#about', title: 'AboutDup' },   // duplicate target: co-highlight
    { href: '#projects', title: 'Projects' },
    { href: '#math', title: 'Mathematics' },
    { href: '#experience', title: 'Experience' },
    { href: '#skills', title: 'Skills' },
  ],
  ghostLink: true,
  sections: [
    { id: 'about', top: 0, height: 720 },
    { id: 'projects', top: 720, height: 1000 },
    { id: 'math', top: 1720, height: 1120 },
    { id: 'experience', top: 2840, height: 1280 },
    { id: 'skills', top: 4120, height: 560 },
    { id: 'contact', top: 4680, height: 300 },
    { id: 'extra', top: 4980, height: 260 },
  ],
};

/*
 * BOTTOM: viewport 450 -> sentinel 180; extent 4780 -> maxScroll 4330.
 * skills 4120..4530 | contact 4530..4680 (nav-linked) | extra 4680..4780.
 * Content below the LAST tracked section (contact+extra = 250) is thinner than
 * 0.6*450 = 270 => at absolute bottom contact.top = 4530-4330 = 200 > 180, so
 * geometry alone would pick Skills; the bottom snap must pick Contact.
 */
const BOTTOM = {
  viewport: 450,
  navLinks: [
    { href: '#about', title: 'About' },
    { href: '#projects', title: 'Projects' },
    { href: '#math', title: 'Mathematics' },
    { href: '#experience', title: 'Experience' },
    { href: '#skills', title: 'Skills' },
    { href: '#contact', title: 'Contact' },
  ],
  ghostLink: true,
  sections: [
    { id: 'about', top: 0, height: 700 },
    { id: 'projects', top: 720, height: 1000 },
    { id: 'math', top: 1720, height: 1120 },
    { id: 'experience', top: 2840, height: 1280 },
    { id: 'skills', top: 4120, height: 410 },
    { id: 'contact', top: 4530, height: 150 },
    { id: 'extra', top: 4680, height: 100 },
  ],
};

/*
 * TOPRESET: viewport 600 -> sentinel 240; a non-tracked prefix band 0..350
 * precedes the first tracked section, making "scrolled above everything"
 * reachable at y=0 / y=109 (about.top = 241 > 240).
 */
const TOPRESET = {
  viewport: 600,
  prefix: { top: 0, height: 350 },
  navLinks: [
    { href: '#about', title: 'About' },
    { href: '#projects', title: 'Projects' },
  ],
  ghostLink: true,
  sections: [
    { id: 'about', top: 350, height: 400 },
    { id: 'projects', top: 750, height: 900 },
    { id: 'extra', top: 1650, height: 100 },
  ],
};

/* ------------------------------------------------------------------ *
 * Scenarios
 * ------------------------------------------------------------------ */

function scenarioMain() {
  const env = makeEnv(MAIN);
  evalUnder(env);
  const w = env.window;

  assert(typeof w.initScrollSpy === 'function', 'window.initScrollSpy must be exposed');
  assertActive(env, ['About', 'AboutDup'], 'initial locate (y=0 sentinel picks About)');

  runScroll(env, 100);
  assertActive(env, ['About', 'AboutDup'], 'y=100');

  runScroll(env, 439); // projects.top = 281 > 280
  assertActive(env, ['About', 'AboutDup'], 'y=439 one px below line');

  runScroll(env, 440); // projects.top = 280 == sentinel (exact equality)
  assertActive(env, ['Projects'], 'y=440 exact boundary');

  runScroll(env, 1440); // math.top = 280
  assertActive(env, ['Mathematics'], 'y=1440');

  runScroll(env, 2560); // experience.top = 280
  assertActive(env, ['Experience'], 'y=2560');

  runScroll(env, 3840); // skills.top = 280
  assertActive(env, ['Skills'], 'y=3840');

  // hashchange must also trigger a locate:
  w.scrollY = 3900;
  w.fire('hashchange');
  w.drain();
  assertActive(env, ['Skills'], 'y=3900 via hashchange');

  // Resize moves the sentinel: 0.4*1400 = 560 (decisive flip at y=3800).
  runScroll(env, 3800);
  assertActive(env, ['Experience'], 'y=3800 sentinel 280');
  w.innerHeight = 1400;
  w.fire('resize');
  w.drain();
  assertActive(env, ['Skills'], 'y=3800 sentinel 560 after resize');
  w.innerHeight = 700;
  w.fire('resize');
  w.drain();
  assertActive(env, ['Experience'], 'y=3800 back to sentinel 280');

  // Trailing unlinked region maps backwards to the last tracked id:
  runScroll(env, 4500);
  assertActive(env, ['Skills'], 'y=4500 trailing region');

  // Absolute bottom (y = 4540 = maxScroll): snap keeps last tracked id.
  runScroll(env, 4540);
  assertActive(env, ['Skills'], 'y=4540 absolute bottom');

  // Idempotent re-init must stay consistent:
  w.initScrollSpy();
  w.initScrollSpy();
  runScroll(env, 4540);
  assertActive(env, ['Skills'], 'y=4540 after double re-init');
  runScroll(env, 0);
  assertActive(env, ['About', 'AboutDup'], 'y=0 after double re-init');
}

function scenarioCoalescing() {
  const env = makeEnv(MAIN);
  evalUnder(env);
  const w = env.window;

  w.scrollY = 0;
  w.fire('scroll');
  w.drain();
  assertActive(env, ['About', 'AboutDup'], 'coalescing baseline');

  // Three scroll events queued without a drain; nothing may apply yet:
  w.scrollY = 1440; // -> Mathematics
  w.fire('scroll');
  assertActive(env, ['About', 'AboutDup'], 'queued locate must not apply early');
  w.scrollY = 2560; // -> Experience
  w.fire('scroll');
  w.scrollY = 3840; // -> Skills
  w.fire('scroll');
  w.drain();
  assertActive(env, ['Skills'], 'after drain the LATEST queued scroll wins');

  // Every queued frame on the same scope is required; repeated breakages caught upstream
  env.window.fire('scroll');
  env.window.drain();
  assertActive(env, ['Skills'], 'steady state after coalesced application');
}

function scenarioBottomSnap() {
  const env = makeEnv(BOTTOM);
  evalUnder(env);
  const w = env.window;

  runScroll(env, 0);
  assertActive(env, ['About'], 'bottom fixture initial');
  runScroll(env, 3000); // experience.top=-160 <= 180, skills.top=1120 > 180
  assertActive(env, ['Experience'], 'y=3000');
  runScroll(env, 4270); // no snap: below deltaY 4314; skills.top=-150, contact.top=260>180
  assertActive(env, ['Skills'], 'y=4270 pre-snap');
  runScroll(env, 4314); // snap tolerance boundary: 4314 >= 4330 - 16 (exact)
  assertActive(env, ['Contact'], 'y=4314 tolerance boundary snap');
  runScroll(env, 4270);
  assertActive(env, ['Skills'], 'y=4270 again (no snap)');
  runScroll(env, 4330); // absolute maxScroll: contact.top=200>180 -> snap MUST force Contact
  assertActive(env, ['Contact'], 'y=4330 maxScroll discriminative snap');
}

function scenarioTopReset() {
  const env = makeEnv(TOPRESET);
  evalUnder(env);
  const w = env.window;

  runScroll(env, 0); // about.top = 350 > 240, projects.top = 750 > 240
  assertActive(env, null, 'y=0 above first section -> top-nav reset');
  runScroll(env, 109); // about.top = 241 > 240 (one px tight)
  assertActive(env, null, 'y=109 still above line');
  runScroll(env, 150); // about.top = 200 <= 240
  assertActive(env, ['About'], 'y=150 About active');
  runScroll(env, 620); // projects.top = 130 <= 240
  assertActive(env, ['Projects'], 'y=620 Projects active');
  runScroll(env, 1150); // absolute bottom snap -> last tracked
  assertActive(env, ['Projects'], 'y=1150 bottom snap top fixture');
}

function scenarioDeferredBoot() {
  const env = makeEnv(MAIN, { readyState: 'loading' });
  evalUnder(env);

  assert(typeof env.window.initScrollSpy === 'function', 'api exposed even before boot');
  assertActive(env, null, 'deferred: nothing highlighted before DOMContentLoaded');
  env.fireDocument('DOMContentLoaded');
  env.window.drain();
  assertActive(env, ['About', 'AboutDup'], 'boot after DOMContentLoaded');
}

function scenarioExplicitContainer() {
  const env = makeEnv({ ...MAIN, marked: true });
  evalUnder(env);
  env.window.drain();
  assertActive(env, ['About', 'AboutDup'], 'explicit nav[data-scroll-spy] container');
  runScroll(env, 1440);
  assertActive(env, ['Mathematics'], 'explicit container transition');
}

/* ------------------------------------------------------------------ */

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  scenarioMain();
  scenarioCoalescing();
  scenarioBottomSnap();
  scenarioTopReset();
  scenarioDeferredBoot();
  scenarioExplicitContainer();
  console.log(`[SCROLL-SPY PASS] ${assertionCount} assertions across 6 functional scenarios`);
}
