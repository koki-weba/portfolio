/**
 * SHO PORTFOLIO – main.js
 * 共通JavaScriptインタラクション
 *
 * 機能一覧:
 *  1. ヘッダー スクロール挙動
 *  2. ハンバーガーメニュー（全画面ナビ）
 *  3. アクティブナビリンク
 *  4. Intersection Observer スクロールアニメーション
 *  5. パララックス効果
 *  6. カウンターアニメーション
 *  7. スキルバーアニメーション（skills.html用）
 *  8. ホバーマイクロインタラクション
 *  9. WORKSページ タブフィルター
 * 10. スムーズスクロール
 */

(function () {
  'use strict';

  /* =====================================================
     Utility
  ===================================================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /** easeOutCubic */
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  /** easeInOutCubic */
  function easeInOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  /* =====================================================
     1. Header – スクロール時にスタイル変更
  ===================================================== */
  const header = $('#header');
  let lastScrollY = 0;
  let ticking = false;

  function onHeaderScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onHeaderScroll);
      ticking = true;
    }
  }, { passive: true });

  /* =====================================================
     2. ハンバーガーメニュー / 全画面ナビゲーション
  ===================================================== */
  const menuToggle = $('#menuToggle');
  const fullscreenNav = $('#fullscreenNav');
  let isMenuOpen = false;

  function openMenu() {
    isMenuOpen = true;
    menuToggle.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    fullscreenNav.classList.add('is-open');
    fullscreenNav.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // メニューアイテムをリセット（再アニメーション用）
    $$('.fn-item', fullscreenNav).forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(30px)';
    });
  }

  function closeMenu() {
    isMenuOpen = false;
    menuToggle.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    fullscreenNav.classList.remove('is-open');
    fullscreenNav.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => {
    if (isMenuOpen) closeMenu();
    else openMenu();
  });

  // ESCキーで閉じる
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isMenuOpen) closeMenu();
  });

  // メニューリンクをクリックしたら閉じる
  $$('.fn-link', fullscreenNav).forEach(link => {
    link.addEventListener('click', () => {
      if (link.getAttribute('href').startsWith('#')) {
        closeMenu();
      }
    });
  });

  /* =====================================================
     3. アクティブナビリンク
  ===================================================== */
  function setActiveNav() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';

    $$('.gnav-link, .fn-link').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      const isActive =
        (page === '' || page === 'index.html') && (href === 'index.html' || href === '#top') ? true :
        href.includes(page) && page !== '';

      link.classList.toggle('active', isActive);
    });
  }
  setActiveNav();

  /* =====================================================
     4. Intersection Observer – スクロールアニメーション
  ===================================================== */
  const animateEls = $$('[data-animate]');

  if (animateEls.length > 0) {
    // delay属性をtransition-delayに適用
    animateEls.forEach(el => {
      const delay = el.dataset.delay || 0;
      if (delay) el.style.transitionDelay = delay + 'ms';
    });

    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');

          // 装飾ブロブは少し遅れて現れる（デコ要素）
          const nearbyDecos = entry.target.closest('.section')
            ? $$('.deco', entry.target.closest('.section'))
            : [];
          nearbyDecos.forEach((deco, i) => {
            setTimeout(() => deco.classList.add('is-visible'), i * 150 + 200);
          });

          scrollObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    animateEls.forEach(el => scrollObserver.observe(el));
  }

  /* =====================================================
     5. パララックス効果 – [data-parallax] 要素
  ===================================================== */
  const parallaxEls = $$('[data-parallax]');

  // モバイルはパララックス無効（パフォーマンス考慮）
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => window.innerWidth < 768;

  let parallaxRAF = null;

  function updateParallax() {
    if (isMobile() || prefersReducedMotion) return;
    const scrollY = window.scrollY;

    parallaxEls.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.1;
      const rect = el.parentElement.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
      const move = centerOffset * speed;
      el.style.transform = `translate3d(0, ${move}px, 0)`;
    });

    parallaxRAF = null;
  }

  window.addEventListener('scroll', () => {
    if (!parallaxRAF && !isMobile() && !prefersReducedMotion) {
      parallaxRAF = requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  /* =====================================================
     6. カウンターアニメーション
  ===================================================== */
  const counters = $$('.counter');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const value = Math.floor(easeOut(progress) * target);
          el.textContent = value.toLocaleString('ja-JP');
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString('ja-JP');
        }

        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* =====================================================
     7. スキルバーアニメーション（skills.html）
  ===================================================== */
  const skillBars = $$('.skill-bar-fill');

  if (skillBars.length > 0) {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const bar = entry.target;
        const pct = bar.dataset.pct || '0';
        setTimeout(() => {
          bar.style.width = pct + '%';
        }, parseInt(bar.dataset.delay || 0));
        skillObserver.unobserve(bar);
      });
    }, { threshold: 0.3 });

    skillBars.forEach(bar => skillObserver.observe(bar));
  }

  /* =====================================================
     8. ホバーマイクロインタラクション
  ===================================================== */

  /** マグネットボタン効果（primaryボタン） */
  function initMagneticButtons() {
    $$('.btn-primary').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }
  if (!isMobile()) initMagneticButtons();

  /** カードリップルエフェクト */
  function initRipple() {
    $$('.what-card, .numbers-card, .works-card').forEach(card => {
      card.addEventListener('click', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
          position:absolute; border-radius:50%;
          width:200px; height:200px;
          left:${x - 100}px; top:${y - 100}px;
          background:rgba(91,156,246,.12);
          transform:scale(0); pointer-events:none;
          animation:ripple .6s ease-out forwards;
        `;
        card.style.position = 'relative';
        card.style.overflow = 'hidden';
        card.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }

  // Rippleキーフレームをインジェクト
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = '@keyframes ripple{to{transform:scale(3);opacity:0}}';
  document.head.appendChild(rippleStyle);
  initRipple();

  /* =====================================================
     9. WORKSページ タブフィルター（高品質実装）
     – pickup-item と works-card 両方を対象に
     – フェードアウト → display切替 → スタガーフェードイン
  ===================================================== */
  const filterTabs = $$('.filter-tab');

  if (filterTabs.length > 0 && document.body.classList.contains('page-works')) {
    // フィルター対象: pickupアイテム + gridカード すべて
    const filterTargets = $$('[data-category]');
    const pickupSection = $('#pickupSection');
    let currentFilter  = 'all';
    let isAnimating    = false;

    /**
     * メインフィルター関数
     * Phase1: 全ターゲットをフェードアウト (220ms)
     * Phase2: display切替 → スタガーでフェードイン
     */
    function applyFilter(filter) {
      if (isAnimating || filter === currentFilter) return;
      isAnimating    = true;
      currentFilter  = filter;

      // ── アクティブタブ更新 ──
      filterTabs.forEach(t => {
        t.classList.toggle('active', t.dataset.filter === filter);
        t.setAttribute('aria-selected', t.dataset.filter === filter ? 'true' : 'false');
      });

      // ── Phase 1: 全ターゲット フェードアウト ──
      filterTargets.forEach(el => {
        el.style.transition   = 'opacity .2s ease, transform .22s ease';
        el.style.opacity      = '0';
        el.style.transform    = 'scale(0.88) translateY(10px)';
        el.style.pointerEvents= 'none';
      });

      // ── Phase 2: フェードアウト後 ──
      setTimeout(() => {

        // display切替
        filterTargets.forEach(el => {
          const match = filter === 'all' || el.dataset.category === filter;
          el.style.display = match ? '' : 'none';
        });

        // ピックアップセクション全体の表示制御
        if (pickupSection) {
          const anyPickup = $$('.pickup-item', pickupSection)
            .some(el => el.style.display !== 'none');
          pickupSection.style.display = anyPickup ? '' : 'none';
        }

        // ── Phase 3: 表示ターゲットをスタガーでフェードイン ──
        const visible = filterTargets.filter(el => el.style.display !== 'none');
        visible.forEach((el, i) => {
          el.style.transition = 'none';
          el.style.opacity    = '0';
          el.style.transform  = 'scale(0.9) translateY(18px)';

          setTimeout(() => {
            el.style.transition   = `opacity .4s ease, transform .45s cubic-bezier(.34,1.15,.64,1)`;
            el.style.opacity      = '1';
            el.style.transform    = '';
            el.style.pointerEvents= '';
          }, i * 55);
        });

        // アニメーション終了フラグ
        const totalTime = 250 + visible.length * 55;
        setTimeout(() => { isAnimating = false; }, totalTime);

      }, 240);
    }

    // タブクリックイベント
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
    });

    // キーボードナビゲーション
    filterTabs.forEach((tab, i) => {
      tab.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' && filterTabs[i + 1]) {
          filterTabs[i + 1].focus();
          applyFilter(filterTabs[i + 1].dataset.filter);
        }
        if (e.key === 'ArrowLeft' && filterTabs[i - 1]) {
          filterTabs[i - 1].focus();
          applyFilter(filterTabs[i - 1].dataset.filter);
        }
      });
    });
  }

  /* =====================================================
     10. スムーズスクロール（アンカーリンク）
  ===================================================== */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const headerOffset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* =====================================================
     11. ページトップへスクロール時のヒーロー演出
  ===================================================== */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    const heroContent = $('.hero-content');
    const heroVisual  = $('.hero-visual');
    if (heroContent) setTimeout(() => heroContent.classList.add('is-visible'), 200);
    if (heroVisual)  setTimeout(() => heroVisual.classList.add('is-visible'),  450);
  });

  /* =====================================================
     12. カーソルカスタム（デスクトップのみ）
  ===================================================== */
  if (!isMobile() && !prefersReducedMotion) {
    // ホバー可能な要素でカーソルが大きくなる控えめなエフェクト
    const interactiveEls = $$('a, button, .what-card, .numbers-card, .works-card, .process-step');
    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', () => el.style.cursor = 'pointer');
    });
  }

  /* =====================================================
     13. ページ遷移 → initPageTransition() IIFE に移譲
  ===================================================== */

  /* =====================================================
     14. コードウィンドウ タイピングエフェクト（TOPページ）
  ===================================================== */
  const codeLines = $$('.code-win-body .code-line');
  if (codeLines.length > 0 && document.body.classList.contains('page-top')) {
    codeLines.forEach((line, i) => {
      line.style.opacity = '0';
      line.style.transition = 'none';
    });

    setTimeout(() => {
      codeLines.forEach((line, i) => {
        setTimeout(() => {
          line.style.transition = 'opacity .3s ease';
          line.style.opacity = '1';
        }, i * 200 + 600);
      });
    }, 800);
  }

  /* =====================================================
     15. スクロール連動ヒーロー背景
  ===================================================== */
  const hero = $('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        // Hero自体を少しフェードアウト
        const opacity = Math.max(0, 1 - scrollY / (window.innerHeight * 0.6));
        const scale   = 1 - scrollY / (window.innerHeight * 15);
        const heroInner = $('.hero-inner', hero);
        if (heroInner) {
          heroInner.style.opacity    = opacity;
          heroInner.style.transform  = `scale(${scale})`;
        }
      }
    }, { passive: true });
  }


  /* =====================================================
     16. ABOUTページ専用インタラクション
  ===================================================== */
  /* =====================================================
     16. WORKSページ専用 マイクロインタラクション
  ===================================================== */
  if (document.body.classList.contains('page-works')) {

    /* ---- 16-a. ピックアップカード 3D チルト効果 ---- */
    if (!isMobile() && !prefersReducedMotion) {
      $$('.pickup-item-img-wrap').forEach(wrap => {
        const parent = wrap.closest('.pickup-item');
        if (!parent) return;

        parent.addEventListener('mousemove', e => {
          const rect   = wrap.getBoundingClientRect();
          const cx     = rect.left + rect.width  / 2;
          const cy     = rect.top  + rect.height / 2;
          const dx     = (e.clientX - cx) / (rect.width  / 2);  // -1 ~ 1
          const dy     = (e.clientY - cy) / (rect.height / 2);
          const rotX   =  dy * 4;   // 傾き上下
          const rotY   = -dx * 6;   // 傾き左右
          const scale  = 1.03;

          wrap.style.transition = 'transform .08s ease';
          wrap.style.transform  =
            `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateY(-4px)`;
        });

        parent.addEventListener('mouseleave', () => {
          wrap.style.transition = 'transform .45s cubic-bezier(.34,1.2,.64,1)';
          wrap.style.transform  = '';
        });
      });
    }

    /* ---- 16-b. worksカード カーソルグロー ---- */
    if (!isMobile() && !prefersReducedMotion) {
      $$('.works-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--gx', x + 'px');
          card.style.setProperty('--gy', y + 'px');
        });
      });

      // グロー用スタイルを注入
      const glowStyle = document.createElement('style');
      glowStyle.textContent = `
        .works-card::before {
          content:''; position:absolute; inset:0;
          background: radial-gradient(120px circle at var(--gx,50%) var(--gy,50%),
            rgba(91,156,246,.1), transparent 70%);
          opacity:0; transition:opacity .3s ease; border-radius:inherit; z-index:0;
          pointer-events:none;
        }
        .works-card:hover::before { opacity:1; }
      `;
      document.head.appendChild(glowStyle);
    }

    /* ---- 16-c. works-card ステータス line トップ装飾 ---- */
    $$('.works-card').forEach(card => {
      const line = document.createElement('div');
      line.className = 'works-card-line';
      line.style.cssText = `
        position:absolute; top:0; left:0; right:0; height:3px;
        background: linear-gradient(90deg,#5b9cf6,#8b7fd4);
        transform:scaleX(0); transform-origin:left;
        transition:transform .35s ease; border-radius:inherit; z-index:2;
      `;
      card.appendChild(line);

      card.addEventListener('mouseenter', () => { line.style.transform = 'scaleX(1)'; });
      card.addEventListener('mouseleave', () => { line.style.transform = 'scaleX(0)'; });
    });

    /* ---- 16-d. スクロールプログレスバー ---- */
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (docH > 0 ? window.scrollY / docH * 100 : 0) + '%';
    }, { passive: true });

    /* ---- 16-e. tech-badge ランダム浮遊 ---- */
    if (!prefersReducedMotion) {
      $$('.tech-badge').forEach((badge, i) => {
        badge.style.animationDelay = (i * 180) + 'ms';
        badge.addEventListener('mouseenter', () => {
          badge.style.transform = `translateY(-3px) scale(1.08)`;
          badge.style.transition= 'transform .25s cubic-bezier(.34,1.56,.64,1)';
        });
        badge.addEventListener('mouseleave', () => {
          badge.style.transform = '';
        });
      });
    }

  } // end page-works

  /* =====================================================
     17. ABOUTページ専用インタラクション
  ===================================================== */
  if (document.body.classList.contains('page-about')) {

    /* ---- 16-a. プロフィール行 – 視差フェードイン ---- */
    const profileRows = $$('.profile-row');
    if (profileRows.length > 0) {
      const profileObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const card = entry.target;
          $$('.profile-row', card).forEach((row, i) => {
            row.style.opacity    = '0';
            row.style.transform  = 'translateX(20px)';
            row.style.transition = `opacity .4s ease ${i * 60}ms, transform .4s ease ${i * 60}ms`;
            requestAnimationFrame(() => {
              row.style.opacity   = '1';
              row.style.transform = 'none';
            });
          });
          profileObserver.unobserve(card);
        });
      }, { threshold: 0.2 });

      const profileCard = $('.profile-card');
      if (profileCard) profileObserver.observe(profileCard);
    }

    /* ---- 16-b. タイムライン – ドット点灯アニメーション ---- */
    const tlItems = $$('.tl-item');
    if (tlItems.length > 0) {
      const tlObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const item = entry.target;
          const dot  = $('.tl-dot', item);
          if (dot) {
            dot.style.transform = 'scale(0)';
            dot.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
            setTimeout(() => { dot.style.transform = 'scale(1)'; }, 100);
          }
          tlObserver.unobserve(item);
        });
      }, { threshold: 0.4 });

      tlItems.forEach(item => tlObserver.observe(item));
    }

    /* ---- 16-c. 趣味カード – 画像エリアにホバー時ラベルオーバーレイ ---- */
    $$('.hobby-card').forEach(card => {
      const imgWrap = $('.hobby-img-wrap', card);
      if (!imgWrap) return;

      const overlay = document.createElement('div');
      overlay.className = 'hobby-overlay';
      overlay.innerHTML = '<i class="fas fa-expand-alt"></i>';
      imgWrap.appendChild(overlay);
    });

    /* ---- 16-d. アクセントカラーによるスクロールプログレスライン ---- */
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const docH   = document.documentElement.scrollHeight - window.innerHeight;
      const pct    = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });

    /* ---- 16-e. Bigクォートテキストのカーソル追従グロー ---- */
    const bigQuote = $('.about-big-quote');
    if (bigQuote && !isMobile()) {
      bigQuote.addEventListener('mousemove', e => {
        const rect = bigQuote.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        bigQuote.style.backgroundImage =
          `radial-gradient(ellipse 120px 60px at ${x}% ${y}%, rgba(91,156,246,.06), transparent)`;
      });
      bigQuote.addEventListener('mouseleave', () => {
        bigQuote.style.backgroundImage = '';
      });
    }

  } // end page-about

  /* =====================================================
     17. SKILLS PAGE – スキルバー＆インタラクション
  ===================================================== */
  if (document.body.classList.contains('page-skills')) {

    /* ---- 17-a. .skill-fill バーアニメーション ---- */
    const skillFills = $$('.skill-fill');
    if (skillFills.length > 0) {
      const fillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el  = entry.target;
          const pct = el.dataset.pct || '0';
          const delay = parseInt(el.dataset.delay || 0);
          setTimeout(() => { el.style.width = pct + '%'; }, delay);
          fillObserver.unobserve(el);
        });
      }, { threshold: 0.25, rootMargin: '0px 0px -40px 0px' });

      skillFills.forEach(el => fillObserver.observe(el));
    }

    /* ---- 17-b. スキルホイール ノード登場アニメーション ---- */
    const swNodes = $$('.sw-node');
    if (swNodes.length > 0) {
      const wheelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          swNodes.forEach((node) => {
            const delay = parseInt(node.dataset.swDelay || 0);
            setTimeout(() => node.classList.add('is-visible'), delay);
          });
          wheelObserver.disconnect();
        });
      }, { threshold: 0.3 });

      const swContainer = $('.sw-container');
      if (swContainer) wheelObserver.observe(swContainer);
    }

    /* ---- 17-c. スキルカラムカード ホバー時バー再アニメ防止 ---- */
    // 既にアニメーション済みのバーが二重にリセットされないようにフラグ管理
    $$('.skill-col-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.querySelectorAll('.skill-fill').forEach(fill => {
          const currentW = fill.style.width;
          if (currentW && currentW !== '0%') {
            fill.style.transition = 'none';
            // マウスリーブ後にtransitionを戻す
          }
        });
      });
      card.addEventListener('mouseleave', () => {
        card.querySelectorAll('.skill-fill').forEach(fill => {
          fill.style.transition = '';
        });
      });
    });

    /* ---- 17-d. 資格アイテム ホバーリップル ---- */
    $$('.cert-item').forEach(item => {
      item.addEventListener('click', e => {
        const ripple = document.createElement('span');
        const rect   = item.getBoundingClientRect();
        ripple.style.cssText = `
          position:absolute; pointer-events:none; border-radius:50%;
          width:6px; height:6px;
          background:rgba(91,156,246,.35);
          top:${e.clientY - rect.top - 3}px; left:${e.clientX - rect.left - 3}px;
          transform:scale(0); opacity:1;
          transition:transform .6s ease, opacity .5s ease .15s;
        `;
        item.style.position = 'relative';
        item.style.overflow  = 'hidden';
        item.appendChild(ripple);
        requestAnimationFrame(() => {
          ripple.style.transform = 'scale(80)';
          ripple.style.opacity   = '0';
        });
        setTimeout(() => ripple.remove(), 700);
      });
    });

    /* ---- 17-e. スクロール進捗バー (SKILLS ページ用) ---- */
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      progressBar.style.width = pct + '%';
    }, { passive: true });

    /* ---- 17-f. スキルホイール ノード – マウス追従微動 ---- */
    const swWrap = $('.skills-wheel-wrap');
    if (swWrap && !isMobile()) {
      swWrap.addEventListener('mousemove', e => {
        const rect = swWrap.getBoundingClientRect();
        const mx   = (e.clientX - rect.left - rect.width  / 2) / rect.width;
        const my   = (e.clientY - rect.top  - rect.height / 2) / rect.height;
        swNodes.forEach(node => {
          const factor = parseFloat(node.dataset.swDelay || 0) / 400 * 6;
          node.style.transform = node.style.transform.replace(/translate3d\([^)]+\)/, '');
          const base = node.classList.contains('sw-node-top')    ? 'translate(-50%, 0)' :
                       node.classList.contains('sw-node-bottom') ? 'translate(-50%, 0)' :
                       node.classList.contains('sw-node-left')   ? 'translate(0, -50%)' : '';
          node.style.transform = `${base} translate(${mx * factor}px, ${my * factor}px) scale(1)`;
        });
      });
      swWrap.addEventListener('mouseleave', () => {
        swNodes.forEach(node => {
          const base = node.classList.contains('sw-node-top')    ? 'translate(-50%, 0) scale(1)' :
                       node.classList.contains('sw-node-bottom') ? 'translate(-50%, 0) scale(1)' :
                       node.classList.contains('sw-node-left')   ? 'translate(0, -50%) scale(1)'  : 'scale(1)';
          node.style.transform = base;
        });
      });
    }

  } // end page-skills

  /* =====================================================
     18. SERVICE PAGE – インタラクション
  ===================================================== */
  if (document.body.classList.contains('page-service')) {

    /* ---- 18-a. FAQ アコーディオン ---- */
    $$('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen   = btn.getAttribute('aria-expanded') === 'true';
        const faqItem  = btn.closest('.faq-item');
        const answer   = faqItem.querySelector('.faq-a');

        /* 他の開いているアコーディオンを閉じる */
        $$('.faq-item').forEach(item => {
          const otherBtn = item.querySelector('.faq-q');
          const otherAns = item.querySelector('.faq-a');
          if (item !== faqItem && otherBtn.getAttribute('aria-expanded') === 'true') {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAns.removeAttribute('hidden');
            requestAnimationFrame(() => {
              otherAns.style.maxHeight = '0px';
              otherAns.style.paddingBottom = '0';
            });
            setTimeout(() => otherAns.setAttribute('hidden', ''), 450);
          }
        });

        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0px';
          setTimeout(() => answer.setAttribute('hidden', ''), 450);
        } else {
          btn.setAttribute('aria-expanded', 'true');
          answer.removeAttribute('hidden');
          requestAnimationFrame(() => {
            answer.style.maxHeight = answer.scrollHeight + 'px';
          });
        }
      });
    });

    /* ---- 18-b. 制作フロー ステップ順次登場 ---- */
    const flowSteps = $$('.flow-step');
    if (flowSteps.length > 0) {
      const flowObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          flowSteps.forEach((step, i) => {
            setTimeout(() => step.classList.add('is-visible'), i * 110);
          });
          flowObserver.disconnect();
        });
      }, { threshold: 0.2 });

      const flowTrack = $('.flow-track');
      if (flowTrack) flowObserver.observe(flowTrack);
    }

    /* ---- 18-c. 料金カード 3Dチルト ---- */
    if (!isMobile()) {
      $$('.pricing-card').forEach(card => {
        card.addEventListener('mousemove', e => {
          const rect   = card.getBoundingClientRect();
          const cx     = rect.left + rect.width  / 2;
          const cy     = rect.top  + rect.height / 2;
          const dx     = (e.clientX - cx) / (rect.width  / 2);
          const dy     = (e.clientY - cy) / (rect.height / 2);
          const rotX   = -dy * 5;
          const rotY   =  dx * 5;
          card.style.transform      = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
          card.style.transition     = 'box-shadow .2s';
          card.style.boxShadow      = `${-dx * 12}px ${-dy * 12}px 40px rgba(91,156,246,.18)`;
        });
        card.addEventListener('mouseleave', () => {
          const isPopular = card.classList.contains('pricing-card-popular');
          card.style.transform  = isPopular ? 'translateY(-16px)' : '';
          card.style.transition = 'transform .5s cubic-bezier(.25,.8,.25,1), box-shadow .5s';
          card.style.boxShadow  = '';
        });
      });
    }

    /* ---- 18-d. サービスカード カーソルグロー ---- */
    $$('.svc-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x    = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
        const y    = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
        card.style.backgroundImage =
          `radial-gradient(circle 200px at ${x}% ${y}%, rgba(91,156,246,.06), transparent)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.backgroundImage = '';
      });
    });

    /* ---- 18-e. スクロール進捗バー (SERVICE ページ用) ---- */
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (docH > 0 ? window.scrollY / docH * 100 : 0) + '%';
    }, { passive: true });

    /* ---- 18-f. 浮遊サービスカードアイコン hover micro-scale ---- */
    $$('.shc-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = card.style.transform.includes('translate')
          ? card.style.transform.replace(/scale\([^)]+\)/, '') + ' scale(1.08)'
          : card.style.transform + ' scale(1.08)';
        card.style.boxShadow = '0 12px 36px rgba(0,0,0,.14)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = card.style.transform.replace(/\s*scale\([^)]+\)/, '');
        card.style.boxShadow = '';
      });
    });

    /* ---- 18-g. 料金カード ナンバーカウントアップ ---- */
    const priceNums = $$('.price-num');
    if (priceNums.length > 0) {
      const priceObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const el      = entry.target;
          const target  = parseInt(el.textContent.replace(/,/g, ''), 10);
          const dur     = 1200;
          const start   = performance.now();
          const tick    = (now) => {
            const t   = Math.min((now - start) / dur, 1);
            const val = Math.round(easeOut(t) * target);
            el.textContent = val.toLocaleString('ja-JP');
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          priceObserver.unobserve(el);
        });
      }, { threshold: 0.5 });

      priceNums.forEach(el => priceObserver.observe(el));
    }

  } // end page-service

  /* =====================================================
     19. CONTACT PAGE – インタラクション
  ===================================================== */
  if (document.body.classList.contains('page-contact')) {

    /* ---- 19-a. テキストエリア 文字数カウント ---- */
    const textarea  = $('#message');
    const charCount = $('#charCount');
    const MAX_CHARS = 3000;

    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        const len = textarea.value.length;
        charCount.textContent = len.toLocaleString('ja-JP');

        if (len >= MAX_CHARS * 0.9) {
          charCount.style.color = '#e05252';
        } else if (len >= MAX_CHARS * 0.7) {
          charCount.style.color = '#f59e0b';
        } else {
          charCount.style.color = '';
        }
      });
    }

    /* ---- 19-b. CONTACTページ FAQ アコーディオン ---- */
    $$('.contact-faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const isOpen  = btn.getAttribute('aria-expanded') === 'true';
        const faqItem = btn.closest('.contact-faq-item');
        const answer  = faqItem.querySelector('.contact-faq-a');

        /* 他のアコーディオンを閉じる */
        $$('.contact-faq-item').forEach(item => {
          if (item === faqItem) return;
          const otherBtn = item.querySelector('.contact-faq-q');
          const otherAns = item.querySelector('.contact-faq-a');
          if (otherBtn.getAttribute('aria-expanded') === 'true') {
            otherBtn.setAttribute('aria-expanded', 'false');
            otherAns.style.maxHeight = '0px';
            otherAns.style.paddingBottom = '0';
            setTimeout(() => otherAns.setAttribute('hidden', ''), 420);
          }
        });

        if (isOpen) {
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = '0px';
          answer.style.paddingBottom = '0';
          setTimeout(() => answer.setAttribute('hidden', ''), 420);
        } else {
          btn.setAttribute('aria-expanded', 'true');
          answer.removeAttribute('hidden');
          requestAnimationFrame(() => {
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.style.paddingBottom = '20px';
          });
        }
      });
    });

    /* ---- 19-c. ページトップへ戻るボタン ---- */
    const pageTopBtn = $('#pageTopBtn');
    if (pageTopBtn) {
      window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
          pageTopBtn.classList.add('is-visible');
        } else {
          pageTopBtn.classList.remove('is-visible');
        }
      }, { passive: true });

      pageTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    /* ---- 19-d. スクロール進捗バー ---- */
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.prepend(progressBar);
    window.addEventListener('scroll', () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = (docH > 0 ? window.scrollY / docH * 100 : 0) + '%';
    }, { passive: true });

    /* ---- 19-e. SNSリンク ホバーインタラクション ---- */
    if (!isMobile() && !prefersReducedMotion) {
      $$('.sns-link-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
          item.style.transition = 'transform .3s cubic-bezier(.34,1.56,.64,1)';
        });
      });
    }

    /* ---- 19-f. フォーム送信インタラクション ---- */
    const form = $('#contactForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const submitBtn = form.querySelector('.cf-submit');
        if (!submitBtn) return;

        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 送信中...';

        /* デモ: 2秒後に完了 */
        setTimeout(() => {
          submitBtn.innerHTML = '<i class="fas fa-check"></i> 送信完了！';
          submitBtn.style.background = 'linear-gradient(135deg, #4ecb8d, #27ae60)';
          submitBtn.style.opacity = '1';
        }, 2000);
      });
    }

  } // end page-contact

})();


/* =====================================================
   ローディングアニメーション
   1. 初回ロード: フルスクリーンカーテンローダー（HTML は各ページに直接記述）
   2. ページ遷移: スライドオーバーレイ
===================================================== */
(function () {
  'use strict';

  const SESSION_KEY = 'pf_visited';
  const TRANSIT_KEY = 'pf_transition';

  /* ---- ページ遷移オーバーレイを注入 ---- */
  const ptEl = document.createElement('div');
  ptEl.id = 'page-transition';
  ptEl.innerHTML = '<div class="pt-panel"></div>';
  document.body.appendChild(ptEl);

  const isFirstVisit  = !sessionStorage.getItem(SESSION_KEY);
  const hasTransition = sessionStorage.getItem(TRANSIT_KEY);

  /* ========================================================
     ページ遷移: 新ページ到着時にオーバーレイを退場させる
  ======================================================== */
  if (hasTransition) {
    sessionStorage.removeItem(TRANSIT_KEY);
    const panel = ptEl.querySelector('.pt-panel');
    panel.style.transform  = 'translateY(0)';
    panel.style.transition = 'none';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        panel.style.transform  = '';
        panel.style.transition = '';
        ptEl.classList.add('is-leaving');
      });
    });
  }

  /* ========================================================
     内部リンククリック時にページ遷移アニメーションを起動
  ======================================================== */
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const raw  = link.getAttribute('href') || '';
    const href = link.href;

    if (
      raw.startsWith('#') ||
      raw.startsWith('mailto:') ||
      raw.startsWith('tel:') ||
      (link.hostname && link.hostname !== location.hostname)
    ) return;

    if (ptEl.classList.contains('is-entering')) return;

    e.preventDefault();
    sessionStorage.setItem(TRANSIT_KEY, '1');
    ptEl.classList.add('is-entering');

    setTimeout(function () {
      window.location.href = href;
    }, 480);
  }, true);

  /* ========================================================
     初回訪問: フルスクリーンローダーのアニメーション制御
     （HTMLは各ページの <body> 先頭に直接記述済み）
  ======================================================== */
  const ilEl     = document.getElementById('initial-loader');
  const counterEl = document.getElementById('ilCounter');
  const barFill   = document.getElementById('ilBarFill');

  /* ローダー要素が存在しない、または初回以外は何もしない */
  if (!ilEl || !counterEl || !barFill || !isFirstVisit) return;

  sessionStorage.setItem(SESSION_KEY, '1');
  document.body.classList.add('loader-active');

  let progress = 0;
  let loadDone = false;
  let animDone = false;
  const MIN_DURATION = 2400;
  let startTime = 0;
  let rafId;

  function tick(now) {
    if (!startTime) startTime = now;
    const elapsed = now - startTime;
    const t       = Math.min(elapsed / MIN_DURATION, 1);
    const eased   = t < .5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    const target  = loadDone ? 100 : Math.floor(eased * 95);

    if (progress < target) {
      progress = target;
      counterEl.textContent = progress;
      barFill.style.width   = progress + '%';
    }

    if (progress >= 100) { finish(); return; }
    rafId = requestAnimationFrame(tick);
  }

  function pushToHundred() {
    if (progress >= 100) { finish(); return; }
    progress++;
    counterEl.textContent = progress;
    barFill.style.width   = progress + '%';
    if (progress < 100) setTimeout(pushToHundred, 18);
    else finish();
  }

  function finish() {
    if (animDone) return;
    animDone = true;
    cancelAnimationFrame(rafId);
    counterEl.textContent = '100';
    barFill.style.width   = '100%';

    setTimeout(function () {
      ilEl.classList.add('is-leaving');
      document.body.classList.remove('loader-active');
      setTimeout(function () {
        if (ilEl.parentNode) ilEl.parentNode.removeChild(ilEl);
      }, 900);
    }, 300);
  }

  window.addEventListener('load', function () {
    loadDone = true;
    cancelAnimationFrame(rafId);
    pushToHundred();
  });

  setTimeout(function () {
    rafId = requestAnimationFrame(tick);
  }, 600);

})();

/* =====================================================
   スクロールプログレスバー CSS (JS インジェクト)
===================================================== */
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    .scroll-progress {
      position: fixed;
      top: 0; left: 0;
      height: 3px;
      width: 0;
      background: linear-gradient(90deg, #5b9cf6, #8b7fd4);
      z-index: 9999;
      transition: width .1s linear;
      pointer-events: none;
    }
    .hobby-overlay {
      position: absolute;
      inset: 0;
      background: rgba(26,26,46,.35);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24px;
      opacity: 0;
      transition: opacity .3s ease;
    }
    .hobby-card:hover .hobby-overlay { opacity: 1; }
  `;
  document.head.appendChild(s);
})();

