/* Site-wide scroll reveal, stagger, parallax and micro-interactions.
   Works against dynamically injected markup (service grids, blog cards,
   testimonials, etc.) via a MutationObserver, so it needs no changes to
   individual page templates. */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover:hover) and (pointer:fine)').matches;

/* ---------- Scroll reveal + stagger ---------- */

const SOLO_SELECTORS = ['.editorial-image', '.editorial-copy', '.provider-card', '.provider-copy',
  '.concierge-panel', '.detail-hero-mark', '.detail-aside', '.hero-image', '.section-head',
  '.provider-public-profile>img', '.provider-public-profile>div', '.promotion-feature>img',
  '.promotion-feature>div', '.services-hero-visual', '.detail-hero-copy', '.page-hero .eyebrow',
  '.page-hero h1', '.page-hero>p:last-child', '.dynamic-page .content-shell>h2',
  '.contact-grid>div', '.contact-form', '.services-directory-head', '.service-guidance>div'];
const STAGGER_SELECTORS = ['.service-grid', '.pathway-grid', '.value-list', '.journey-steps',
  '.benefit-list', '.quotes', '.blog-grid', '.gallery-grid', '#gallery-grid',
  '.before-after-grid', '.service-list', '#all-services', '.footer-top', '.faq'];

let revealObserver;
function ensureObserver() {
  if (revealObserver) return revealObserver;
  revealObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  return revealObserver;
}

function tagSolo(el) {
  if (el.dataset.revealDone) return;
  el.dataset.revealDone = '1';
  if (!/\breveal(-scale|-left|-right)?\b/.test(el.className)) {
    const directional = el.matches('.provider-card,.provider-public-profile>img,.contact-grid>div,.detail-aside') ? 'reveal-left' :
      el.matches('.provider-copy,.provider-public-profile>div,.contact-form,.detail-hero-mark') ? 'reveal-right' : 'reveal';
    el.classList.add(directional);
  }
  if (reduceMotion) el.classList.add('visible');
  else ensureObserver().observe(el);
}

function tagStagger(container) {
  if (container.dataset.revealDone) return;
  container.dataset.revealDone = '1';
  container.classList.add('stagger');
  [...container.children].forEach((child, i) => {
    child.style.setProperty('--reveal-delay', `${Math.min(i, 7) * 70}ms`);
  });
  if (reduceMotion) container.classList.add('visible');
  else ensureObserver().observe(container);
}

function scanForReveal(root = document) {
  SOLO_SELECTORS.forEach((sel) => root.querySelectorAll(sel).forEach(tagSolo));
  STAGGER_SELECTORS.forEach((sel) => root.querySelectorAll(sel).forEach((el) => {
    if (el.children.length) tagStagger(el);
  }));
}

/* ---------- Animated counters ---------- */

function initCounters(root = document) {
  root.querySelectorAll('[data-counter]').forEach((el) => {
    if (el.dataset.counterDone) return;
    el.dataset.counterDone = '1';
    const target = parseInt(el.dataset.counter, 10);
    if (!Number.isFinite(target)) return;
    if (reduceMotion) { el.textContent = String(target); return; }
    new IntersectionObserver(([entry], obs) => {
      if (!entry.isIntersecting) return;
      obs.disconnect();
      const start = performance.now(), dur = 1100;
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(eased * target));
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.6 }).observe(el);
  });
}

function markCounterTargets(root = document) {
  const badgeNum = root.querySelector('.services-hero-badge strong');
  if (badgeNum && !badgeNum.dataset.counter) {
    const n = badgeNum.textContent.trim();
    if (/^\d+$/.test(n)) badgeNum.dataset.counter = n;
  }
}

/* ---------- Parallax ---------- */

const PARALLAX_SELECTOR = '.hero-premium .hero-image img, .editorial-image img, ' +
  '.services-hero-visual img, .concierge-premium>img, .detail-hero-mark.has-image img';

function initParallax() {
  if (reduceMotion || !finePointer) return;
  let ticking = false;
  function update() {
    const vh = innerHeight;
    document.querySelectorAll(PARALLAX_SELECTOR).forEach((img) => {
      const rect = img.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      const offset = (rect.top + rect.height / 2) - vh / 2;
      const y = Math.max(-42, Math.min(42, offset * 0.06));
      img.style.transform = `scale(1.1) translateY(${y.toFixed(1)}px)`;
    });
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  addEventListener('resize', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } });
  update();
}

/* ---------- Scroll progress bar ---------- */

function initScrollProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  let ticking = false;
  function update() {
    const doc = document.documentElement;
    const height = doc.scrollHeight - doc.clientHeight;
    bar.style.width = `${height > 0 ? (doc.scrollTop / height) * 100 : 0}%`;
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
  update();
}

/* ---------- Button ripple + magnetic hover ---------- */

function initButtonInteractions() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });

  if (!finePointer || reduceMotion) return;
  const MAGNETIC_SELECTOR = '.btn, .pathway';
  let current = null;
  document.addEventListener('pointermove', (e) => {
    const el = e.target.closest(MAGNETIC_SELECTOR);
    if (el !== current) {
      if (current) current.style.transform = '';
      current = el;
    }
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const dy = (e.clientY - rect.top - rect.height / 2) / rect.height;
    el.style.transform = `translate(${dx * 6}px, ${dy * 6}px)`;
  });
  document.addEventListener('pointerleave', () => {
    if (current) { current.style.transform = ''; current = null; }
  }, true);
}

/* ---------- Live rescanning for dynamically injected content ---------- */

function initLiveRescan() {
  const targets = ['#main', '#site-footer'].map((s) => document.querySelector(s)).filter(Boolean);
  if (!targets.length) return;
  let scheduled = false;
  const mo = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      scanForReveal();
      markCounterTargets();
      initCounters();
    });
  });
  targets.forEach((t) => mo.observe(t, { childList: true, subtree: true }));
}

export function initAnimations() {
  document.documentElement.setAttribute('data-parallax-init', '1');
  scanForReveal();
  markCounterTargets();
  initCounters();
  initParallax();
  initScrollProgress();
  initButtonInteractions();
  initLiveRescan();
}
