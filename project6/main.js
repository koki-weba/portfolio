'use strict';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   整体院 葵 — main.js
   5-Page SPA + Advanced GSAP Animations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────
   State
───────────────────────────────────── */
let currentPage    = 'top';
let isTransitioning = false;
const visitedPages  = new Set(['top']);

/* ─────────────────────────────────────
   DOM refs
───────────────────────────────────── */
const header       = document.getElementById('header');
const hamburger    = document.getElementById('hamburger');
const mobileNav    = document.getElementById('mobileNav');
const pgPanel      = document.querySelector('.pg-panel');
const scrollBar    = document.getElementById('scrollProgress');
const floatingBtn  = document.getElementById('floatingBtn');
const cursorRing   = document.getElementById('cursorRing');
const cursorDot    = document.getElementById('cursorDot');

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. PAGE ROUTER  (curtain transition)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function navigateTo(pageId) {
  if (pageId === currentPage || isTransitioning) return;
  isTransitioning = true;

  const fromEl = document.getElementById(`page-${currentPage}`);
  const toEl   = document.getElementById(`page-${pageId}`);
  const isFirst = !visitedPages.has(pageId);

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onComplete: () => { isTransitioning = false; },
  });

  // Phase 1: Curtain sweeps in from left
  tl.fromTo(pgPanel,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 0.52 }
  )
  // Phase 2: Swap pages (hidden behind curtain)
  .call(() => {
    fromEl.classList.remove('active');
    // Reset inner-hero anim for re-entry
    const prevIh = fromEl.querySelector('.inner-hero');
    if (prevIh) prevIh.classList.remove('anim-in');

    toEl.classList.add('active');
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
    currentPage = pageId;
    visitedPages.add(pageId);
    updateNavActive(pageId);
    updateHeaderClass(pageId);

    if (isFirst) {
      runPageEntrance(toEl, pageId);
    } else {
      observeFadeIns(toEl);
      // Re-trigger inner-hero animation on revisit
      if (pageId !== 'top') {
        const ih = toEl.querySelector('.inner-hero');
        if (ih) requestAnimationFrame(() => ih.classList.add('anim-in'));
      }
    }
  })
  // Phase 3: Curtain sweeps out to right
  .to(pgPanel,
    { scaleX: 0, transformOrigin: 'right center', duration: 0.52 }
  );

  closeMobileNav();
}

function updateNavActive(pageId) {
  document.querySelectorAll('.nav-links a.nav-trigger').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });
}

function updateHeaderClass(pageId) {
  header.classList.toggle('on-inner-page', pageId !== 'top');
  // TOPに戻った際、scrolledクラスをscrollYに合わせて即時更新する
  if (pageId === 'top') {
    header.classList.toggle('scrolled', window.scrollY > 52);
  }
}

/* Attach nav-trigger clicks everywhere */
document.addEventListener('click', e => {
  const trigger = e.target.closest('.nav-trigger');
  if (!trigger) return;
  e.preventDefault();
  const page = trigger.dataset.page;
  if (page) navigateTo(page);
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   2. CUSTOM CURSOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const isTouch = () => window.matchMedia('(hover: none)').matches;

if (!isTouch()) {
  // Reveal cursors after first move
  let cursorReady = false;
  const cursorPos = { x: -200, y: -200 };
  let ringX = -200, ringY = -200;

  document.addEventListener('mousemove', e => {
    cursorPos.x = e.clientX;
    cursorPos.y = e.clientY;

    if (!cursorReady) {
      cursorReady = true;
      gsap.to([cursorRing, cursorDot], { opacity: 1, duration: 0.4 });
    }

    // Dot snaps immediately
    gsap.set(cursorDot, {
      x: cursorPos.x - 3,
      y: cursorPos.y - 3,
    });
  });

  // Ring follows with lerp
  gsap.ticker.add(() => {
    ringX += (cursorPos.x - ringX) * 0.1;
    ringY += (cursorPos.y - ringY) * 0.1;
    const hw = cursorRing.offsetWidth  / 2;
    const hh = cursorRing.offsetHeight / 2;
    gsap.set(cursorRing, { x: ringX - hw, y: ringY - hh });
  });

  // Hover states
  const hoverEls = 'a, button, .menu-item, .faq-q, .tilt-card, .mag-btn';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) cursorRing.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) cursorRing.classList.remove('cursor-hover');
  });
  document.addEventListener('mousedown', () => cursorRing.classList.add('cursor-active'));
  document.addEventListener('mouseup',   () => cursorRing.classList.remove('cursor-active'));

  document.addEventListener('mouseleave', () => {
    gsap.to([cursorRing, cursorDot], { opacity: 0, duration: 0.3 });
  });
  document.addEventListener('mouseenter', () => {
    if (cursorReady) gsap.to([cursorRing, cursorDot], { opacity: 1, duration: 0.3 });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   3. MAGNETIC BUTTONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (!isTouch()) {
  document.querySelectorAll('.mag-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r  = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(btn, { x: dx * 0.28, y: dy * 0.28, duration: 0.35, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.5)' });
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. 3D TILT CARDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
if (!isTouch()) {
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.tilt-card').forEach(card => {
      const r  = card.getBoundingClientRect();
      if (e.clientX < r.left - 60 || e.clientX > r.right  + 60 ||
          e.clientY < r.top  - 60 || e.clientY > r.bottom + 60) return;
      const nx = (e.clientX - r.left) / r.width  - 0.5;
      const ny = (e.clientY - r.top)  / r.height - 0.5;
      gsap.to(card, {
        rotateY:  nx * 14,
        rotateX: -ny * 14,
        duration: 0.45,
        ease: 'power2.out',
        transformPerspective: 800,
      });
    });
  });

  document.addEventListener('mouseleave', () => {
    document.querySelectorAll('.tilt-card').forEach(card => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.7, ease: 'power2.out' });
    });
  });

  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.65, ease: 'power2.out' });
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   5. INTERSECTION OBSERVER  (fade-in)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const delay = parseFloat(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('visible'), delay * 1000);
    fadeObserver.unobserve(el);
  });
}, { rootMargin: '0px 0px -60px 0px' });

function observeFadeIns(root = document) {
  root.querySelectorAll('.fade-in:not(.visible)').forEach(el => fadeObserver.observe(el));
}

/* Text reveals via GSAP ScrollTrigger */
function initRevealTriggers(root = document) {
  const groups = new Map();
  root.querySelectorAll('.reveal:not(.hero-reveal)').forEach(el => {
    const parent = el.parentElement;
    if (!groups.has(parent)) groups.set(parent, []);
    groups.get(parent).push(el);
  });
  groups.forEach((group, parent) => {
    gsap.to(group.map(el => el.querySelector('.reveal-inner')), {
      y: '0%',
      stagger: 0.12,
      duration: 1.05,
      ease: 'expo.out',
      scrollTrigger: { trigger: parent, start: 'top 88%', once: true },
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   6. PAGE-SPECIFIC ENTRANCE ANIMATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function runPageEntrance(pageEl, pageId) {
  observeFadeIns(pageEl);
  initRevealTriggers(pageEl);

  // Animate inner-hero for non-top pages
  if (pageId !== 'top') {
    const ih = pageEl.querySelector('.inner-hero');
    if (ih) requestAnimationFrame(() => ih.classList.add('anim-in'));
  }

  switch (pageId) {
    case 'top':
      runTopEntrance();
      break;
    case 'menu':
      runMenuEntrance(pageEl);
      break;
    case 'flow':
      runFlowEntrance(pageEl);
      break;
    case 'staff':
      runStaffEntrance(pageEl);
      break;
    case 'access':
      break;
  }

  initParallax(pageEl);
}

/* ──── TOP page ──── */
function runTopEntrance() {
  gsap.set(['.hero-sub', '.stat-item', '.hero-cta .btn'], { opacity: 0, y: 18 });

  const tl = gsap.timeline({ delay: 0.22, defaults: { ease: 'expo.out' } });
  tl
    .to('.hero-reveal .reveal-inner', { y: '0%', stagger: 0.14, duration: 1.15 })
    .to('.hero-sub',      { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' }, '<0.5')
    .to('.stat-item',     { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: 'power2.out' }, '<0.2')
    .to('.hero-cta .btn', { opacity: 1, y: 0, stagger: 0.1,  duration: 0.7, ease: 'power2.out' }, '<0.25')
    .call(() => runCountUp(document.querySelector('#page-top')), [], '<0.1');

  // Section rule
  ScrollTrigger.create({
    trigger: '.cta-strip',
    start: 'top 80%',
    once: true,
    onEnter: () => gsap.to('.cta-strip-inner', { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' }),
  });
}

/* ──── MENU page ──── */
function runMenuEntrance(pageEl) {
  gsap.from(pageEl.querySelectorAll('.menu-item'), {
    x: -32, opacity: 0,
    stagger: 0.08,
    duration: 0.85,
    ease: 'power2.out',
    delay: 0.35,
  });
  gsap.from(pageEl.querySelector('.menu-photo'), {
    scale: 0.95, opacity: 0,
    duration: 1.1,
    ease: 'power3.out',
    delay: 0.5,
  });
}

/* ──── FLOW page ──── */
function runFlowEntrance(pageEl) {
  // Stagger steps from top
  gsap.from(pageEl.querySelectorAll('.vflow-step'), {
    y: 40, opacity: 0,
    stagger: 0.12,
    duration: 0.85,
    ease: 'power2.out',
    delay: 0.35,
    onComplete: () => initFlowScrollAnim(pageEl),
  });
}

function initFlowScrollAnim(pageEl) {
  const steps = pageEl.querySelectorAll('.vflow-step');
  const stepObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('lit');
    });
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.3 });
  steps.forEach(s => stepObserver.observe(s));
}

/* ──── STAFF page ──── */
function runStaffEntrance(pageEl) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 641px)', () => {
    gsap.from(pageEl.querySelector('.staff-featured .staff-photo'), {
      x: -60, opacity: 0, duration: 1.2, ease: 'power3.out', delay: 0.35,
    });
    gsap.from(pageEl.querySelectorAll('.staff-featured .staff-info > *'), {
      x: 40, opacity: 0, stagger: 0.1, duration: 1.0, ease: 'power3.out', delay: 0.45,
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   7. PARALLAX  (scrub-based)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initParallax(root = document) {
  root.querySelectorAll('[data-parallax]').forEach(img => {
    const speed     = parseFloat(img.dataset.parallax) || 0.25;
    const container = img.closest('[data-parallax-container]');
    if (!container) return;
    gsap.fromTo(img,
      { yPercent: -(speed * 40) },
      {
        yPercent: speed * 40,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.8,
        },
      }
    );
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   8. COUNT-UP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function runCountUp(root = document) {
  root.querySelectorAll('.count-up').forEach(el => {
    const isDecimal = el.hasAttribute('data-decimal');
    const target    = parseFloat(el.dataset.target);
    const suffix    = el.dataset.suffix ?? '';
    const decimals  = parseInt(el.dataset.decimal ?? '0');
    const counter   = { value: 0 };

    const format = v => isDecimal
      ? v.toFixed(decimals) + suffix
      : Math.round(v).toLocaleString('ja-JP') + suffix;

    gsap.to(counter, {
      value: target,
      duration: 2.4,
      ease: 'power2.out',
      onUpdate()  { el.textContent = format(counter.value); },
      onComplete() { el.textContent = format(target); },
    });
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   9. HEADER  —  scroll class + progress bar
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxY    = document.documentElement.scrollHeight - window.innerHeight;

  header.classList.toggle('scrolled', scrollY > 52);

  // Scroll progress bar
  if (scrollBar) scrollBar.style.width = (maxY > 0 ? (scrollY / maxY) * 100 : 0) + '%';

  // Floating CTA: show when past 400px
  floatingBtn?.classList.toggle('show', scrollY > 400);
}, { passive: true });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   10. HAMBURGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const closeMobileNav = () => {
  hamburger?.classList.remove('open');
  mobileNav?.classList.remove('open');
  document.body.style.overflow = '';
  hamburger?.setAttribute('aria-expanded', 'false');
};

hamburger?.addEventListener('click', () => {
  const isOpen = mobileNav.classList.contains('open');
  if (isOpen) {
    closeMobileNav();
  } else {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    hamburger.setAttribute('aria-expanded', 'true');
  }
});

document.addEventListener('click', e => {
  if (mobileNav?.classList.contains('open') &&
      !mobileNav.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMobileNav();
  }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   11. MENU  (static — descriptions always visible)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// No expand logic needed; descriptions are rendered directly in HTML

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   12. FAQ ACCORDION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.querySelectorAll('.faq-item').forEach(item => {
  const trigger = item.querySelector('.faq-q');
  const toggle  = (forceClose = false) => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen && !forceClose) item.classList.add('open');
  };
  trigger?.addEventListener('click', () => toggle());
  trigger?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    if (e.key === 'Escape') toggle(true);
  });
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   13. CONTACT FORM  —  validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const form = document.getElementById('contactForm');
if (form) {
  const clearErrors = () => {
    form.querySelectorAll('.form-error-msg').forEach(e => e.remove());
    form.querySelectorAll('.input-err').forEach(e => e.classList.remove('input-err'));
  };
  const addError = (field, msg) => {
    field.classList.add('input-err');
    const span = Object.assign(document.createElement('span'), {
      className:   'form-error-msg',
      textContent: msg,
    });
    field.parentElement.appendChild(span);
  };

  form.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors();
    let valid = true;

    form.querySelectorAll('[required]').forEach(f => {
      if (!f.value.trim()) { addError(f, 'この項目は必須です'); valid = false; }
    });
    const emailEl = form.querySelector('#email');
    if (emailEl?.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value)) {
      addError(emailEl, 'メールアドレスの形式が正しくありません');
      valid = false;
    }

    if (!valid) {
      form.querySelector('.input-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = form.querySelector('[type="submit"]');
    btn.disabled    = true;
    btn.textContent = '送信中...';

    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success">
          <div class="form-success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="1.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h3>ご予約を受け付けました</h3>
          <p>内容を確認の上、24時間以内にご連絡いたします。<br>しばらくお待ちください。</p>
        </div>`;
      gsap.from('.form-success', { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out' });
    }, 1400);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   14. LOADER ANIMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initLoader(onComplete) {
  const loader   = document.getElementById('loader');
  if (!loader) { onComplete(); return; }

  const logoEl    = loader.querySelector('.loader-logo');
  const eyebrow   = loader.querySelector('.loader-eyebrow');
  const lineL     = loader.querySelector('.loader-eyebrow-line.l');
  const lineR     = loader.querySelector('.loader-eyebrow-line.r');
  const subEl     = loader.querySelector('.loader-sub');
  const progress  = loader.querySelector('.loader-progress');
  const barFill   = loader.querySelector('.loader-bar-fill');
  const pctEl     = loader.querySelector('.loader-pct');
  const inner     = loader.querySelector('.loader-inner');
  const panelT    = loader.querySelector('.loader-panel-t');
  const panelB    = loader.querySelector('.loader-panel-b');
  const counter   = { n: 0 };

  const tl = gsap.timeline({
    defaults: { ease: 'expo.out' },
  });

  tl
    // ① Eyebrow row fades in, lines extend outward
    .to(eyebrow, { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.3 })
    .to(lineL,   { width: 36, duration: 0.7, ease: 'power3.out' }, '<0.1')
    .to(lineR,   { width: 36, duration: 0.7, ease: 'power3.out' }, '<')

    // ② Logo text sweeps up from clip
    .to(logoEl,  { y: '0%', duration: 1.1, ease: 'expo.out' }, '<0.15')

    // ③ Subtitle fades in
    .to(subEl,   { opacity: 1, duration: 0.7, ease: 'power2.out' }, '<0.55')

    // ④ Progress bar + counter appear
    .to(progress, { opacity: 1, duration: 0.5, ease: 'power2.out' }, '<0.15')

    // ⑤ Bar fills + counter ticks  (1.4s)
    .to(barFill, { scaleX: 1, duration: 1.4, ease: 'power2.inOut' }, '<0.2')
    .to(counter, {
      n: 100,
      duration: 1.4,
      ease: 'power2.inOut',
      onUpdate() { pctEl.textContent = Math.round(counter.n); },
    }, '<')

    // ⑥ Brief hold at 100%
    .to({}, { duration: 0.35 })

    // ⑦ Exit: inner content fades; panels split apart simultaneously
    .to(inner, { opacity: 0, duration: 0.4, ease: 'power2.in' })
    .to(panelT, { y: '-101%', duration: 0.78, ease: 'power3.inOut' }, '<0.05')
    .to(panelB, { y:  '101%', duration: 0.78, ease: 'power3.inOut' }, '<0.04')

    // ⑧ Cleanup + hand off to page
    .call(() => {
      document.body.classList.remove('is-loading');
      loader.style.pointerEvents = 'none';
      loader.style.display = 'none';
      onComplete();
    });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
document.addEventListener('DOMContentLoaded', () => {
  const topPage = document.getElementById('page-top');
  updateNavActive('top');
  updateHeaderClass('top');

  // Section rules (observe globally once)
  gsap.utils.toArray('.section-rule').forEach(rule => {
    gsap.fromTo(rule,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: { trigger: rule, start: 'top 96%', once: true },
      }
    );
  });

  // Run loader first → then kick off page entrance
  initLoader(() => {
    runPageEntrance(topPage, 'top');
    window.dispatchEvent(new Event('scroll'));
  });
});
