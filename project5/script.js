/* =============================================
   光整骨院 - script.js
   ============================================= */

(function () {
  'use strict';

  /* ---- Utility ---- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* =============================================
     Header: scroll effect + hamburger
     ============================================= */
  const header     = qs('#header');
  const hamburger  = qs('#hamburger');
  const nav        = qs('#nav');

  window.addEventListener('scroll', () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    pagetopBtn.classList.toggle('is-visible', window.scrollY > 400);
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('is-open');
    nav.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close nav on link click (mobile)
  qsa('.header__nav-list a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('is-open');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });

  /* =============================================
     Hero Slider
     ============================================= */
  const slides   = qsa('.hero__slide');
  const dots     = qsa('.hero__dot');
  let   current  = 0;
  let   timer    = null;

  function goSlide(index) {
    slides[current].classList.remove('is-active');
    dots[current].classList.remove('is-active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current].classList.add('is-active');
  }

  function startSlider() {
    timer = setInterval(() => goSlide(current + 1), 5000);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(timer);
      goSlide(parseInt(dot.dataset.index, 10));
      startSlider();
    });
  });

  startSlider();

  /* =============================================
     Scroll Fade Animation (IntersectionObserver)
     ============================================= */
  const fadeEls = qsa('.fade-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));

  /* =============================================
     Counter Animation (About stats)
     ============================================= */
  const counterEls = qsa('[data-count]');

  function animateCounter(el) {
    const target   = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start    = performance.now();

    function update(now) {
      const elapsed  = Math.min(now - start, duration);
      const progress = easeOutExpo(elapsed / duration);
      const value    = Math.round(progress * target);
      el.textContent = value >= 1000
        ? value.toLocaleString('ja-JP')
        : value;
      if (elapsed < duration) requestAnimationFrame(update);
      else el.textContent = target >= 1000
        ? target.toLocaleString('ja-JP')
        : target;
    }
    requestAnimationFrame(update);
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObserver.observe(el));

  /* =============================================
     News Tabs
     ============================================= */
  const newsTabs  = qsa('.news__tab');
  const newsItems = qsa('.news__item');

  newsTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      newsTabs.forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      const category = tab.dataset.tab;

      newsItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
          item.classList.remove('is-hidden');
          item.style.animation = 'fadeIn .35s ease both';
        } else {
          item.classList.add('is-hidden');
        }
      });
    });
  });

  /* =============================================
     Menu Tabs
     ============================================= */
  const menuTabs   = qsa('.menu__tab');
  const menuPanels = qsa('.menu__panel');

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => t.classList.remove('is-active'));
      menuPanels.forEach(p => p.classList.remove('is-active'));

      tab.classList.add('is-active');
      const panel = qs(`[data-mpanel="${tab.dataset.mtab}"]`);
      if (panel) {
        panel.classList.add('is-active');
        // Re-trigger fade-up for new items
        qsa('.fade-up', panel).forEach(el => {
          el.classList.remove('is-visible');
          setTimeout(() => observer.observe(el), 50);
        });
      }
    });
  });

  /* =============================================
     Page Top Button
     ============================================= */
  const pagetopBtn = qs('#pagetop');
  pagetopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =============================================
     Smooth scroll for all anchor links
     ============================================= */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerH = header.offsetHeight;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =============================================
     Contact Form: submit feedback
     ============================================= */
  const form = qs('#contactForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = qs('.cta__form-submit', form);
    btn.textContent = '送信中...';
    btn.disabled = true;
    btn.style.opacity = '.7';

    setTimeout(() => {
      form.innerHTML = `
        <div style="text-align:center; padding: 40px 20px;">
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin:0 auto 20px">
            <circle cx="36" cy="36" r="34" stroke="#b5607a" stroke-width="2.5"/>
            <path d="M22 36l10 10 18-20" stroke="#b5607a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <h3 style="font-size:2.2rem; font-family:'Noto Serif JP',serif; margin-bottom:12px; color:#2c2c2c;">お問い合わせを受け付けました</h3>
          <p style="font-size:1.5rem; color:#6b6b6b; line-height:1.9;">内容を確認の上、担当者よりご連絡いたします。<br>しばらくお待ちください。</p>
        </div>
      `;
    }, 1400);
  });

  /* =============================================
     Parallax: hero overlay subtle effect
     ============================================= */
  const heroContent = qs('.hero__content');
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (heroContent && scrollY < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrollY * 0.22}px)`;
      heroContent.style.opacity = 1 - scrollY / (window.innerHeight * 0.65);
    }
  }, { passive: true });

  /* =============================================
     Active nav highlight on scroll
     ============================================= */
  const sections = qsa('section[id]');
  const navLinks = qsa('.header__nav-list a[href^="#"]');

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('is-active-nav', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(sec => sectionObserver.observe(sec));

  // Add active nav style
  const style = document.createElement('style');
  style.textContent = `
    .header__nav-list a.is-active-nav {
      color: var(--color-primary) !important;
      background: var(--color-primary-light) !important;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

})();
