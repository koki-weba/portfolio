/* ============================================================
   script.js  -  Seitai-in NAGOMI
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. HERO FADE-IN ON LOAD
  ---------------------------------------------------------- */
  function initHeroAnimations() {
    const items = document.querySelectorAll('.hero .fade-up');
    items.forEach(function (el) {
      const delay = parseInt(el.dataset.delay || '0', 10);
      setTimeout(function () {
        el.classList.add('is-visible');
      }, 300 + delay);
    });
  }

  /* ----------------------------------------------------------
     2. SCROLL REVEAL  (IntersectionObserver)
  ---------------------------------------------------------- */
  function initScrollReveal() {
    const targets = document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .visual-accent-card'
    );

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.dataset.delay || '0', 10);
          setTimeout(function () {
            el.classList.add('is-visible');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '0px 0px -80px 0px',
      threshold: 0.08
    });

    targets.forEach(function (el) {
      // make sure visual-accent-card has correct initial state
      if (el.classList.contains('visual-accent-card')) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
      }
      observer.observe(el);
    });

    // When visual-accent-card becomes visible
    document.querySelectorAll('.visual-accent-card').forEach(function (el) {
      el.classList.add('reveal-up');
    });
  }

  /* ----------------------------------------------------------
     3. HEADER – scroll state
  ---------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById('top')
                  ? document.querySelector('.site-header')
                  : document.querySelector('.site-header');

    window.addEventListener('scroll', function () {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     4. MOBILE NAV TOGGLE
  ---------------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav    = document.getElementById('globalNav');
    var links  = nav.querySelectorAll('a');

    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    links.forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ----------------------------------------------------------
     5. SYMPTOM TABS
  ---------------------------------------------------------- */
  function initTabs() {
    var btns   = document.querySelectorAll('.tab-btn');
    var panels = document.querySelectorAll('.tab-panel');

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.dataset.tab;

        btns.forEach(function (b) { b.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });

        btn.classList.add('active');
        var activePanel = document.getElementById('tab-' + target);
        if (activePanel) {
          activePanel.classList.add('active');

          // Re-trigger reveal for items in new panel
          activePanel.querySelectorAll('.reveal-up').forEach(function (el) {
            el.classList.remove('is-visible');
            var delay = parseInt(el.dataset.delay || '0', 10);
            setTimeout(function () {
              el.classList.add('is-visible');
            }, 50 + delay);
          });
        }
      });
    });
  }

  /* ----------------------------------------------------------
     6. PAGE TOP BUTTON
  ---------------------------------------------------------- */
  function initPageTop() {
    var btn = document.getElementById('pageTopBtn');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.scrollY > 500) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     7. SMOOTH SCROLL for anchor links
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    var headerH = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-h'),
      10
    ) || 72;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var href = link.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ----------------------------------------------------------
     8. NUMBER COUNT-UP ANIMATION
  ---------------------------------------------------------- */
  function initCountUp() {
    var nums = document.querySelectorAll('.accent-num');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var text = el.textContent.replace(/[^0-9]/g, '');
        var end  = parseInt(text, 10);
        if (!end) return;
        observer.unobserve(el);

        var duration = 1200;
        var start    = 0;
        var startTime = null;
        var sup = el.querySelector('sup') ? '+' : '';

        function step(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var ease = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(ease * end);
          el.textContent = current.toLocaleString();
          if (sup) {
            var supEl = document.createElement('sup');
            supEl.textContent = sup;
            el.appendChild(supEl);
          }
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    nums.forEach(function (el) { observer.observe(el); });
  }

  /* ----------------------------------------------------------
     9. FORM SUBMIT  (mock)
  ---------------------------------------------------------- */
  function initForm() {
    var form = document.getElementById('reserveForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('.btn-submit');
      btn.textContent = '送信中…';
      btn.disabled = true;
      btn.style.opacity = '0.7';

      setTimeout(function () {
        btn.textContent = '✓ 送信が完了しました';
        btn.style.background = '#4a8a60';
        btn.style.color = '#fff';
        btn.style.opacity = '1';
        form.reset();

        setTimeout(function () {
          btn.textContent = '送信する';
          btn.disabled = false;
          btn.style.background = '';
          btn.style.color = '';
        }, 4000);
      }, 1500);
    });
  }

  /* ----------------------------------------------------------
     10. PARALLAX  – subtle hero pattern movement
  ---------------------------------------------------------- */
  function initParallax() {
    var pattern = document.querySelector('.hero-pattern');
    if (!pattern) return;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      pattern.style.transform = 'translateY(' + (y * 0.15) + 'px)';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     11. ACTIVE NAV on scroll
  ---------------------------------------------------------- */
  function initActiveNav() {
    var sections = document.querySelectorAll('section[id]');
    var navLinks = document.querySelectorAll('.global-nav a[href^="#"]');
    var headerH  = 80;

    window.addEventListener('scroll', function () {
      var scrollY = window.scrollY + headerH + 40;

      sections.forEach(function (section) {
        var top    = section.offsetTop;
        var bottom = top + section.offsetHeight;

        if (scrollY >= top && scrollY < bottom) {
          navLinks.forEach(function (link) {
            link.classList.remove('is-active');
            if (link.getAttribute('href') === '#' + section.id) {
              link.classList.add('is-active');
            }
          });
        }
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     INIT
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', function () {
    initHeroAnimations();
    initScrollReveal();
    initHeader();
    initMobileNav();
    initTabs();
    initPageTop();
    initSmoothScroll();
    initCountUp();
    initForm();
    initParallax();
    initActiveNav();
  });

})();
