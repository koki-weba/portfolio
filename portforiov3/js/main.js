'use strict';

/* =============================================
   LOADING SCREEN
============================================= */
function initLoader() {
  const loader = document.createElement('div');
  loader.className = 'loader';
  loader.innerHTML = `
    <div class="loader__logo">&lt;/&gt; SHO PORTFOLIO</div>
    <div class="loader__bar-wrap">
      <div class="loader__bar" id="loaderBar"></div>
    </div>
  `;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, 1800);
  });

  document.body.style.overflow = 'hidden';
}

/* =============================================
   HEADER SCROLL EFFECT
============================================= */
function initHeader() {
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    if (scrollY > 80) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    if (scrollY > 400) {
      backToTop.classList.add('is-visible');
    } else {
      backToTop.classList.remove('is-visible');
    }
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   MOBILE NAV
============================================= */
function initMobileNav() {
  const menuBtn = document.getElementById('menuBtn');
  const mobileNav = document.getElementById('mobileNav');
  const mobileLinks = mobileNav.querySelectorAll('.mobile-nav__link');

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('is-open');
    mobileNav.classList.toggle('is-open');
    document.body.style.overflow = mobileNav.classList.contains('is-open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('is-open');
      mobileNav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}

/* =============================================
   ACTIVE NAV HIGHLIGHT
============================================= */
function initActiveNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(section => observer.observe(section));
}

/* =============================================
   SCROLL ANIMATIONS (IntersectionObserver)
============================================= */
function initScrollAnimations() {
  // Fade up / fade left / fade right
  const fadeEls = document.querySelectorAll('.js-fade-up, .js-fade-right, .js-fade-left');

  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        setTimeout(() => {
          el.classList.add('is-visible');
        }, parseInt(delay));
        fadeObserver.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -80px 0px' });

  fadeEls.forEach(el => fadeObserver.observe(el));

  // Stagger cards
  const staggerGroups = document.querySelectorAll('.about__cards, .service__grid');

  staggerGroups.forEach(group => {
    const cards = group.querySelectorAll('.js-stagger');

    const groupObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          cards.forEach((card, i) => {
            setTimeout(() => {
              card.classList.add('is-visible');
            }, i * 120);
          });
          groupObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px' });

    groupObserver.observe(group);
  });
}

/* =============================================
   SECTION TITLE LINE ANIMATION
============================================= */
function initSectionLines() {
  const lines = document.querySelectorAll('.section__title-line');
  const lineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = '50px';
        lineObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -60px 0px' });

  lines.forEach(line => {
    line.style.width = '0';
    line.style.transition = 'width 0.6s ease 0.3s';
    lineObserver.observe(line);
  });
}

/* =============================================
   WORKS: FILTER + SLIDER
============================================= */
function initWorks() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');
  const track = document.getElementById('worksTrack');
  const dots = document.querySelectorAll('.works__dot');

  let currentIndex = 0;
  const visibleCount = getVisibleCount();

  function getVisibleCount() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 3;
    return 4;
  }

  // Filter
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('filter-btn--active'));
      btn.classList.add('filter-btn--active');

      const filter = btn.dataset.filter;

      workCards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.classList.remove('is-hidden');
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.classList.add('is-hidden');
        }
      });

      currentIndex = 0;
      updateSlider();
    });
  });

  // Slider dots
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      currentIndex = i;
      updateSlider();
    });
  });

  function updateSlider() {
    const cardWidth = track.querySelector('.work-card').offsetWidth + 24;
    const vc = getVisibleCount();
    const maxIndex = Math.max(0, workCards.length - vc);
    const clampedIndex = Math.min(currentIndex, maxIndex);
    track.style.transform = `translateX(-${clampedIndex * cardWidth}px)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('works__dot--active', i === currentIndex);
    });
  }

  // Auto slide
  let autoSlide = setInterval(() => {
    const vc = getVisibleCount();
    const maxIndex = Math.max(0, workCards.length - vc);
    currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
    updateSlider();
  }, 4000);

  track.parentElement.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.parentElement.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => {
      const vc = getVisibleCount();
      const maxIndex = Math.max(0, workCards.length - vc);
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateSlider();
    }, 4000);
  });

  // Touch / swipe
  let startX = 0;
  track.addEventListener('touchstart', e => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const vc = getVisibleCount();
      const maxIndex = Math.max(0, workCards.length - vc);
      if (diff > 0) {
        currentIndex = Math.min(currentIndex + 1, maxIndex);
      } else {
        currentIndex = Math.max(currentIndex - 1, 0);
      }
      updateSlider();
    }
  }, { passive: true });

  window.addEventListener('resize', () => {
    currentIndex = 0;
    updateSlider();
  });
}

/* =============================================
   CONTACT FORM
============================================= */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.btn--submit');
    submitBtn.textContent = '送信中...';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.innerHTML = `
        <div class="form-success is-active">
          <div class="form-success__icon">✓</div>
          <p class="form-success__title">送信が完了しました！</p>
          <p class="form-success__text">3営業日以内にご返信いたします。<br>お気軽にお待ちください。</p>
        </div>
      `;
    }, 1200);
  });
}

/* =============================================
   SMOOTH SCROLL FOR ANCHOR LINKS
============================================= */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const headerH = document.getElementById('header').offsetHeight;
        const targetY = target.getBoundingClientRect().top + window.scrollY - headerH;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    });
  });
}

/* =============================================
   PARALLAX EFFECT ON HERO BLOBS
============================================= */
function initParallax() {
  const blobs = document.querySelectorAll('.hero__blob, .about__blob');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    blobs.forEach((blob, i) => {
      const speed = i % 2 === 0 ? 0.15 : 0.1;
      blob.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }, { passive: true });
}

/* =============================================
   CODE EDITOR TYPEWRITER EFFECT
============================================= */
function initCodeTypewriter() {
  const codeLines = document.querySelectorAll('.code-editor .code-line');
  
  const heroSection = document.getElementById('hero');
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      let delay = 800;
      codeLines.forEach(line => {
        line.style.opacity = '0';
        setTimeout(() => {
          line.style.transition = 'opacity 0.3s ease';
          line.style.opacity = '1';
        }, delay);
        delay += 200;
      });
      observer.unobserve(heroSection);
    }
  }, { threshold: 0.3 });

  observer.observe(heroSection);
}

/* =============================================
   CURSOR TRAIL EFFECT (subtle)
============================================= */
function initCursorTrail() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const trail = document.createElement('div');
  trail.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    background: rgba(99, 102, 241, 0.4);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transition: transform 0.1s ease;
    mix-blend-mode: multiply;
  `;
  document.body.appendChild(trail);

  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateTrail() {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    trail.style.left = `${trailX - 4}px`;
    trail.style.top = `${trailY - 4}px`;
    requestAnimationFrame(animateTrail);
  }

  animateTrail();
}

/* =============================================
   SECTION NUMBER COUNT-UP ANIMATION
============================================= */
function initSectionNumbers() {
  const numbers = document.querySelectorAll('.section__number');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'numberAppear 0.8s ease both';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Add keyframe dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes numberAppear {
      from { opacity: 0; transform: translateX(-50%) scale(0.8); }
      to { opacity: 1; transform: translateX(-50%) scale(1); }
    }
  `;
  document.head.appendChild(style);

  numbers.forEach(n => observer.observe(n));
}

/* =============================================
   MAGNETIC BUTTON EFFECT
============================================= */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const buttons = document.querySelectorAll('.btn, .social-link');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* =============================================
   SCROLL PROGRESS BAR
============================================= */
function initScrollProgress() {
  const bar = document.createElement('div');
  bar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
    z-index: 200;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s ease;
    pointer-events: none;
  `;
  document.body.appendChild(bar);

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTop / docHeight;
    bar.style.transform = `scaleX(${progress})`;
  }, { passive: true });
}

/* =============================================
   ABOUT CARD HOVER TILT
============================================= */
function initCardTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.about__card, .service__card');

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) perspective(600px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* =============================================
   INIT ALL
============================================= */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initHeader();
  initMobileNav();
  initActiveNav();
  initScrollAnimations();
  initSectionLines();
  initWorks();
  initContactForm();
  initSmoothScroll();
  initParallax();
  initCodeTypewriter();
  initCursorTrail();
  initSectionNumbers();
  initMagneticButtons();
  initScrollProgress();
  initCardTilt();
});
