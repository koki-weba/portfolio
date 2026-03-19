// ===== Loader =====
window.addEventListener('load', function () {
    var fill = document.getElementById('loaderBarFill');
    var loader = document.getElementById('loader');
    var main = document.getElementById('mainContent');

    if (!fill || !loader || !main) return;

    var progress = 0;
    var duration = 600;
    var interval = 16;
    var step = 100 / (duration / interval);

    var timer = setInterval(function () {
        progress += step;
        if (progress >= 100) {
            progress = 100;
            clearInterval(timer);

            setTimeout(function () {
                loader.classList.add('hidden');
                main.classList.add('visible');

                setTimeout(animateHero, 300);

                setTimeout(function () {
                    loader.style.display = 'none';
                }, 900);
            }, 250);
        }
        fill.style.width = progress + '%';
    }, interval);
});

// ===== Hero Animation =====
function animateHero() {
    var lines = document.querySelectorAll('.hero-line');
    lines.forEach(function (line, i) {
        var delay = parseInt(line.getAttribute('data-delay'), 10) || 0;
        setTimeout(function () {
            line.classList.add('visible');
        }, delay * 300);
    });

    var sub = document.querySelector('.hero-sub');
    if (sub) sub.classList.add('visible');

    var scroll = document.querySelector('.hero-scroll-indicator');
    if (scroll) scroll.classList.add('visible');
}

// ===== Scroll Fade-In (IntersectionObserver) =====
document.addEventListener('DOMContentLoaded', function () {
    var fadeElements = document.querySelectorAll('.fade-in-up');
    if (!fadeElements.length) return;

    var observer = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px',
        }
    );

    fadeElements.forEach(function (el) {
        observer.observe(el);
    });
});

// ===== Staggered fade-in for grid children =====
document.addEventListener('DOMContentLoaded', function () {
    var grids = document.querySelectorAll(
        '.service-grid, .works-grid, .blog-grid'
    );

    grids.forEach(function (grid) {
        var children = grid.querySelectorAll('.fade-in-up');
        var gridObserver = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        children.forEach(function (child, i) {
                            child.style.transitionDelay = i * 0.12 + 's';
                            child.classList.add('visible');
                        });
                        gridObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1 }
        );
        gridObserver.observe(grid);
    });
});

// ===== Header scroll effect =====
document.addEventListener('DOMContentLoaded', function () {
    var header = document.getElementById('header');
    if (!header) return;

    function onScroll() {
        if (window.scrollY > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});

// ===== Hamburger menu =====
document.addEventListener('DOMContentLoaded', function () {
    var hamburger = document.getElementById('hamburger');
    var spMenu = document.getElementById('spMenu');
    if (!hamburger || !spMenu) return;

    var overlay = document.createElement('div');
    overlay.className = 'menu-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        hamburger.classList.add('active');
        spMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        hamburger.classList.remove('active');
        spMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
        if (spMenu.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    overlay.addEventListener('click', closeMenu);

    var menuLinks = spMenu.querySelectorAll('.sp-menu-link');
    menuLinks.forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });
});

// ===== Smooth scroll =====
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (href === '#' || href === '') return;

            e.preventDefault();
            var target = document.querySelector(href);
            if (!target) return;

            var headerHeight = 80;
            var top =
                target.getBoundingClientRect().top +
                window.pageYOffset -
                headerHeight;

            window.scrollTo({
                top: top,
                behavior: 'smooth',
            });
        });
    });
});

// ===== Works Preview iframe スケーリング =====
function scaleWorksPreviews() {
    document.querySelectorAll('.works-preview-wrap').forEach(function (wrap) {
        var frame = wrap.querySelector('.works-preview-frame');
        if (!frame) return;
        var frameW = 1280;
        var wrapW = wrap.offsetWidth;
        if (wrapW === 0) return;
        var scale = wrapW / frameW;
        frame.style.width = frameW + 'px';
        frame.style.height = '800px';
        frame.style.transform = 'scale(' + scale + ')';
    });
}

document.addEventListener('DOMContentLoaded', scaleWorksPreviews);
window.addEventListener('load', scaleWorksPreviews);
window.addEventListener('resize', scaleWorksPreviews);

// ===== Works Modal =====
document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('worksModal');
    var frame = document.getElementById('worksModalFrame');
    var closeBtn = document.getElementById('worksModalClose');
    if (!modal || !frame || !closeBtn) return;

    var overlay = modal.querySelector('.works-modal-overlay');

    document.querySelectorAll('.works-item[data-src]').forEach(function (card) {
        card.addEventListener('click', function (e) {
            e.preventDefault();
            frame.src = this.getAttribute('data-src');
            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        setTimeout(function () { frame.src = ''; }, 350);
    }

    closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Escキーでも閉じる
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
});

// ===== Chatbot toggle =====
document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('chatbot-toggle');
    var wrapper = document.getElementById('chatbot-wrapper');
    if (!toggle || !wrapper) return;

    toggle.addEventListener('click', function () {
        wrapper.classList.toggle('open');
    });
});
