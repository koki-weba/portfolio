/* ===========================
   みずほ整体院 - JavaScript
   =========================== */

(function () {
  'use strict';

  /* ---- Header scroll behaviour ---- */
  const header = document.getElementById('header');
  function onScroll() {
    if (window.scrollY > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Hamburger menu ---- */
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const globalNav    = document.getElementById('globalNav');
  const navOverlay   = document.getElementById('navOverlay');

  function openNav() {
    hamburgerBtn.classList.add('active');
    globalNav.classList.add('open');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    hamburgerBtn.setAttribute('aria-label', 'メニューを閉じる');
  }
  function closeNav() {
    hamburgerBtn.classList.remove('active');
    globalNav.classList.remove('open');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
    hamburgerBtn.setAttribute('aria-label', 'メニューを開く');
  }
  hamburgerBtn.addEventListener('click', function () {
    if (globalNav.classList.contains('open')) closeNav(); else openNav();
  });
  navOverlay.addEventListener('click', closeNav);
  globalNav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  /* ---- Scroll animations (Intersection Observer) ---- */
  const sectionFades  = document.querySelectorAll('.section-fade');
  const staggerFades  = document.querySelectorAll('.stagger-fade');

  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  sectionFades.forEach(function (el) { fadeObserver.observe(el); });

  const staggerObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        /* Trigger all stagger siblings in this parent */
        const siblings = entry.target.parentElement.querySelectorAll('.stagger-fade');
        siblings.forEach(function (sib) { sib.classList.add('is-visible'); });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  staggerFades.forEach(function (el) { staggerObserver.observe(el); });

  /* ---- Voice card slider ---- */
  const track       = document.getElementById('voiceTrack');
  const prevBtn     = document.getElementById('voicePrev');
  const nextBtn     = document.getElementById('voiceNext');
  const dotsWrapper = document.getElementById('voiceDots');

  if (track && prevBtn && nextBtn) {
    const cards        = track.querySelectorAll('.voice-card');
    let currentIndex   = 0;
    let autoPlayTimer  = null;
    let cardsPerView   = getCardsPerView();

    function getCardsPerView() {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }

    const totalSlides = Math.max(0, cards.length - cardsPerView);

    /* Build dots */
    function buildDots() {
      dotsWrapper.innerHTML = '';
      for (let i = 0; i <= totalSlides; i++) {
        const dot = document.createElement('button');
        dot.className = 'voice-slider__dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', (i + 1) + '番目のカードへ');
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrapper.appendChild(dot);
      }
    }

    function updateDots() {
      dotsWrapper.querySelectorAll('.voice-slider__dot').forEach(function (d, i) {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    function getCardWidth() {
      if (cards.length === 0) return 0;
      const card    = cards[0];
      const style   = window.getComputedStyle(track);
      const gap     = parseFloat(style.gap) || 24;
      return card.offsetWidth + gap;
    }

    function goTo(index) {
      currentIndex = Math.max(0, Math.min(index, totalSlides));
      track.style.transform = 'translateX(-' + (currentIndex * getCardWidth()) + 'px)';
      updateDots();
    }

    function goNext() { goTo(currentIndex < totalSlides ? currentIndex + 1 : 0); }
    function goPrev() { goTo(currentIndex > 0 ? currentIndex - 1 : totalSlides); }

    prevBtn.addEventListener('click', function () { goPrev(); resetAutoPlay(); });
    nextBtn.addEventListener('click', function () { goNext(); resetAutoPlay(); });

    function startAutoPlay() {
      autoPlayTimer = setInterval(goNext, 4500);
    }
    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      startAutoPlay();
    }

    /* Touch / swipe support */
    let touchStartX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) goNext(); else goPrev();
        resetAutoPlay();
      }
    }, { passive: true });

    function init() {
      cardsPerView = getCardsPerView();
      buildDots();
      goTo(0);
      startAutoPlay();
    }

    window.addEventListener('resize', function () {
      cardsPerView = getCardsPerView();
      goTo(0);
    });

    init();
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-item__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      /* Close all */
      document.querySelectorAll('.faq-item__q').forEach(function (b) {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      /* Open clicked if it was closed */
      if (!expanded) {
        btn.setAttribute('aria-expanded', 'true');
        btn.nextElementSibling.classList.add('open');
      }
    });
  });

  /* ---- Floating CTA ---- */
  const floatingCta = document.getElementById('floatingCta');
  const heroSection = document.querySelector('.hero');

  function toggleFloatingCta() {
    if (!floatingCta || !heroSection) return;
    const heroBottom = heroSection.getBoundingClientRect().bottom;
    if (heroBottom < 0) {
      floatingCta.classList.add('show');
    } else {
      floatingCta.classList.remove('show');
    }
  }
  window.addEventListener('scroll', toggleFloatingCta, { passive: true });
  toggleFloatingCta();

  /* ---- Back to top ---- */
  const backToTopBtn = document.getElementById('backToTop');
  function toggleBackToTop() {
    if (!backToTopBtn) return;
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  }
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  window.addEventListener('scroll', toggleBackToTop, { passive: true });
  toggleBackToTop();

  /* ---- Contact form ---- */
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      /* Create and show success message */
      const success = document.createElement('div');
      success.className = 'form-success show';
      success.innerHTML = '<p>✅ お問い合わせを受け付けました。<br>担当者より折り返しご連絡いたします。</p>';
      contactForm.replaceWith(success);
    });
  }

  /* ---- Hero particle effect ---- */
  const particleContainer = document.getElementById('heroParticles');
  if (particleContainer) {
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('div');
      p.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'pointer-events:none',
        'background:rgba(150,220,100,0.15)',
        'width:' + (Math.random() * 80 + 20) + 'px',
        'height:' + (Math.random() * 80 + 20) + 'px',
        'top:' + (Math.random() * 100) + '%',
        'left:' + (Math.random() * 100) + '%',
        'animation:leafFloat ' + (Math.random() * 8 + 6) + 's ease-in-out infinite',
        'animation-delay:-' + (Math.random() * 8) + 's',
      ].join(';');
      particleContainer.appendChild(p);
    }
  }

  /* ---- Smooth anchor scroll (account for fixed header) ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      const headerHeight = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

})();
