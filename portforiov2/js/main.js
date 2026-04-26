/* ============================================================
   PORTFOLIO V2 — MAIN.JS
   ============================================================ */

'use strict';

/* ======================== LOADER ======================== */
function initLoader() {
  const loader = document.querySelector('.loader');
  if (!loader) return;

  const fill = loader.querySelector('.loader-fill');
  const num  = loader.querySelector('.loader-num');
  let count  = 0;

  const id = setInterval(() => {
    count += Math.random() < 0.3 ? 2 : 1;
    if (count > 100) count = 100;

    if (fill) fill.style.width = count + '%';
    if (num)  num.textContent  = count.toString().padStart(3, '0');

    if (count >= 100) {
      clearInterval(id);
      setTimeout(() => {
        loader.classList.add('hide');
        loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        revealHeroText();
        triggerInitialReveals();
      }, 400);
    }
  }, 22);
}

/* ======================== CUSTOM CURSOR ======================== */
function initCursor() {
  const dot  = document.querySelector('.cur-dot');
  const ring = document.querySelector('.cur-ring');
  if (!dot || !ring) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;
  let rafId;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  document.addEventListener('mousedown', () => {
    dot.classList.add('click'); ring.classList.add('click');
  });
  document.addEventListener('mouseup', () => {
    dot.classList.remove('click'); ring.classList.remove('click');
  });

  document.querySelectorAll('a, button, .cur-hover').forEach(el => {
    el.addEventListener('mouseenter', () => { dot.classList.add('hov'); ring.classList.add('hov'); });
    el.addEventListener('mouseleave', () => { dot.classList.remove('hov'); ring.classList.remove('hov'); });
  });

  function lerp(a, b, t) { return a + (b - a) * t; }

  function tickRing() {
    rx = lerp(rx, mx, 0.1);
    ry = lerp(ry, my, 0.1);
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    rafId = requestAnimationFrame(tickRing);
  }
  tickRing();
}

/* ======================== NAVIGATION ======================== */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mark active link
  const links = nav.querySelectorAll('.nav-link');
  const path  = location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ======================== HERO TEXT REVEAL ======================== */
function revealHeroText() {
  document.querySelectorAll('.line-in').forEach((el, i) => {
    setTimeout(() => el.classList.add('show'), i * 140);
  });
}

/* ======================== SCROLL REVEAL ======================== */
function initReveal() {
  const els = document.querySelectorAll('[data-r]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => obs.observe(el));
}

function triggerInitialReveals() {
  // Reveal elements already in viewport on load (for pages without loader)
  document.querySelectorAll('[data-r]').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) {
      el.classList.add('vis');
    }
  });
}

/* ======================== SKILL BARS ======================== */
function initSkillBars() {
  const fills = document.querySelectorAll('.sk-fill');
  if (!fills.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct = entry.target.dataset.pct || '0';
        entry.target.style.width = pct + '%';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(f => obs.observe(f));
}

/* ======================== WORKS FILTER ======================== */
function initWorksFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.w-item');
  if (!btns.length || !items.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('on'));
      btn.classList.add('on');

      const cat = btn.dataset.cat;
      items.forEach(item => {
        const show = cat === 'all' || item.dataset.cat === cat;
        item.style.opacity    = show ? '1' : '0.2';
        item.style.pointerEvents = show ? '' : 'none';
        item.style.transform  = show ? '' : 'translateX(-8px)';
        item.style.transition = 'opacity .4s, transform .4s';
      });
    });
  });
}

/* ======================== WORKS HOVER IMAGE ======================== */
function initWorksHoverImg() {
  const hoverImg = document.querySelector('.works-hover-img');
  const items    = document.querySelectorAll('.w-item');
  if (!hoverImg || !items.length) return;

  const innerEls = hoverImg.querySelectorAll('.whi-inner');
  const gradients = [
    'linear-gradient(135deg,#d8d8d8,#c4c4c4)',
    'linear-gradient(135deg,#e0e0e0,#cccccc)',
    'linear-gradient(120deg,#d4d4d4,#c0c0c0)',
    'linear-gradient(150deg,#dcdcdc,#c8c8c8)',
    'linear-gradient(135deg,#d0d0d0,#bcbcbc)',
    'linear-gradient(120deg,#e4e4e4,#d0d0d0)',
  ];

  let idx = 0;
  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
      idx = i % gradients.length;
      innerEls.forEach(el => el.style.background = gradients[idx]);
      hoverImg.style.opacity   = '1';
      hoverImg.style.transform = 'scale(1)';
    });
    item.addEventListener('mouseleave', () => {
      hoverImg.style.opacity   = '0';
      hoverImg.style.transform = 'scale(0.88)';
    });
  });

  document.addEventListener('mousemove', e => {
    hoverImg.style.left = (e.clientX + 24) + 'px';
    hoverImg.style.top  = (e.clientY - 80) + 'px';
  });
}

/* ======================== MAGNETIC BUTTONS ======================== */
function initMagnetic() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width  / 2);
      const dy = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.18}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .6s cubic-bezier(0.16,1,0.3,1), border-color .3s, color .3s';
      btn.style.transform  = '';
      setTimeout(() => { btn.style.transition = ''; }, 650);
    });
  });
}

/* ======================== CONTACT FORM ======================== */
function initForm() {
  const form = document.querySelector('.c-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('[type="submit"]');
    const orig = btn.querySelector('span').textContent;
    btn.querySelector('span').textContent = 'Sent!';
    btn.disabled = true;
    setTimeout(() => {
      btn.querySelector('span').textContent = orig;
      btn.disabled = false;
      form.reset();
    }, 3000);
  });
}

/* ======================== PAGE TRANSITION ======================== */
function initPageTransition() {
  const overlay = document.querySelector('.pg-trans');
  if (!overlay) return;

  // Play "back" animation on load (slide out upward)
  overlay.classList.add('back');
  overlay.addEventListener('animationend', () => {
    overlay.classList.remove('back');
  }, { once: true });

  // Intercept link clicks
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.classList.remove('back');
      overlay.classList.add('go');
      overlay.addEventListener('animationend', () => {
        window.location.href = href;
      }, { once: true });
    });
  });
}

/* ======================== COUNTER ANIMATION ======================== */
function initCounters() {
  const DURATION = 1800; // ms — fixed duration regardless of target value

  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count, 10);

    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        let startTime = null;
        const tick = (ts) => {
          if (!startTime) startTime = ts;
          const elapsed = ts - startTime;
          const progress = Math.min(elapsed / DURATION, 1);
          // ease-out cubic so the number slows down as it reaches the target
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.3 });

    obs.observe(el);
  });
}

/* ======================== NOISE GRAIN ======================== */
function initGrain() {
  const canvas = document.getElementById('grain');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function draw() {
    const img = ctx.createImageData(canvas.width, canvas.height);
    const d   = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 | 0;
      d[i] = d[i+1] = d[i+2] = v;
      d[i+3] = 12; // very subtle
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(draw);
  }
  draw();
}

/* ======================== INIT ======================== */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNav();
  initReveal();
  initSkillBars();
  initWorksFilter();
  initWorksHoverImg();
  initMagnetic();
  initForm();
  initPageTransition();
  initCounters();
  initGrain();

  // If no loader (sub pages), reveal hero text & initial elements immediately
  if (!document.querySelector('.loader')) {
    revealHeroText();
    setTimeout(triggerInitialReveals, 300);
  }
});
