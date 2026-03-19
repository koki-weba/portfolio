'use strict';

/* ======================================
   HEADER: scroll state
====================================== */
const header = document.getElementById('header');

const onScroll = () => {
  if (window.scrollY > 60) {
    header.classList.add('is-scrolled');
  } else {
    header.classList.remove('is-scrolled');
  }
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


/* ======================================
   HAMBURGER MENU
====================================== */
const menuBtn = document.getElementById('menuBtn');
const globalNav = document.getElementById('globalNav');

menuBtn.addEventListener('click', () => {
  const isOpen = menuBtn.classList.toggle('is-open');
  globalNav.classList.toggle('is-open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// navのリンクをクリックしたら閉じる
globalNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menuBtn.classList.remove('is-open');
    globalNav.classList.remove('is-open');
    document.body.style.overflow = '';
  });
});


/* ======================================
   TAB SWITCHER
   - 同一の .tab-wrapper 内の .tab-btn と .tab-content を制御
====================================== */
document.querySelectorAll('.tab-wrapper').forEach(wrapper => {
  const btns     = wrapper.querySelectorAll('.tab-btn');
  const contents = wrapper.querySelectorAll('.tab-content');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // ボタンのアクティブ切り替え
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // コンテンツの表示切り替え
      contents.forEach(c => {
        const isTarget = c.id === `tab-${target}`;
        c.classList.toggle('active', isTarget);
      });
    });
  });
});


/* ======================================
   FADE IN ON SCROLL (IntersectionObserver)
====================================== */
const fadeElements = document.querySelectorAll('.fade-in');

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // 同じ親要素内の兄弟 fade-in 要素に対してスタッガーを付与
        const siblings = Array.from(
          entry.target.parentElement.querySelectorAll('.fade-in')
        );
        const siblingIndex = siblings.indexOf(entry.target);
        const delay = siblingIndex * 80; // 80ms ずつずらす

        entry.target.style.transitionDelay = `${delay}ms`;
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  }
);

fadeElements.forEach(el => fadeObserver.observe(el));


/* ======================================
   FEATURE CARDS: staggered fade-in
====================================== */
const featureCards = document.querySelectorAll('.feature-card');

const cardObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const cards = Array.from(featureCards);
        const idx = cards.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 120}ms`;
        entry.target.classList.add('is-visible');
        cardObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
);

featureCards.forEach(card => cardObserver.observe(card));


/* ======================================
   SMOOTH SCROLL (for older browsers fallback)
====================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const headerH = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH;

    window.scrollTo({ top, behavior: 'smooth' });
  });
});


/* ======================================
   SCROLL PROGRESS BAR (optional: thin line at top)
====================================== */
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  width: 0%;
  background-color: #0d0d0d;
  z-index: 200;
  transition: width 0.1s linear;
  pointer-events: none;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const progress     = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}, { passive: true });
