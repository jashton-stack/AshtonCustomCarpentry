(() => {
  const body = document.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader ---------- */
  body.classList.add('is-loading');
  const finishLoad = () => {
    document.querySelector('.preloader')?.classList.add('is-done');
    body.classList.remove('is-loading');
    body.classList.add('is-ready');
  };
  window.addEventListener('load', () => setTimeout(finishLoad, reduceMotion ? 0 : 1300));
  setTimeout(finishLoad, 4000); // safety net

  /* ---------- Nav: shrink on scroll, hide on scroll-down ---------- */
  const nav = document.getElementById('nav');
  let lastY = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.classList.contains('is-open'));
    lastY = y;
  }, { passive: true });

  const toggle = nav.querySelector('.nav__toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('.nav__links a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }));

  /* ---------- Active nav link ---------- */
  const navLinks = [...nav.querySelectorAll('.nav__links a[href^="#"]:not(.btn)')];
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(l => {
    const s = document.querySelector(l.getAttribute('href'));
    if (s) sectionObs.observe(s);
  });

  /* ---------- Scroll reveal ---------- */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ---------- Stat counters ---------- */
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const dur = 2000;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 4)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

  /* ---------- Gallery filter ---------- */
  const filters = document.querySelectorAll('.filter');
  const items = document.querySelectorAll('.gallery__item');
  filters.forEach(btn => btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    items.forEach(it => {
      const show = f === 'all' || it.dataset.cat === f;
      it.classList.toggle('is-filtered', !show);
      if (show) {
        it.classList.remove('is-visible');
        requestAnimationFrame(() => requestAnimationFrame(() => it.classList.add('is-visible')));
      }
    });
  }));

  /* ---------- Testimonials ---------- */
  const quotes = [...document.querySelectorAll('.quote')];
  const dotsWrap = document.querySelector('.quotes__dots');
  let qi = 0, qTimer;
  const showQuote = i => {
    qi = i;
    quotes.forEach((q, n) => q.classList.toggle('is-active', n === i));
    dotsWrap.querySelectorAll('button').forEach((d, n) => d.classList.toggle('is-active', n === i));
  };
  quotes.forEach((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', `Testimonial ${i + 1}`);
    d.addEventListener('click', () => { showQuote(i); restart(); });
    dotsWrap.appendChild(d);
  });
  const restart = () => { clearInterval(qTimer); qTimer = setInterval(() => showQuote((qi + 1) % quotes.length), 6500); };
  showQuote(0);
  restart();

  /* ---------- Hero: floating gold dust ---------- */
  const canvas = document.querySelector('.hero__dust');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(w, 1400) / 14);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.35 + 0.05),
        a: Math.random() * 0.6 + 0.2,
        t: Math.random() * Math.PI * 2
      }));
    };
    let mx = 0, my = 0;
    window.addEventListener('mousemove', e => { mx = (e.clientX / w - 0.5); my = (e.clientY / h - 0.5); }, { passive: true });
    let visible = true;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

    const draw = () => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.t += 0.02;
          p.x += p.vx + mx * 0.3 * p.r;
          p.y += p.vy + my * 0.15 * p.r;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          const alpha = p.a * (0.6 + 0.4 * Math.sin(p.t));
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
          g.addColorStop(0, `rgba(243,217,139,${alpha})`);
          g.addColorStop(1, 'rgba(212,175,55,0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener('resize', resize);
    draw();
  }

  /* ---------- Hero parallax ---------- */
  const heroContent = document.querySelector('.hero__content');
  if (heroContent && !reduceMotion) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroContent.style.transform = `translateY(${y * 0.3}px)`;
        heroContent.style.opacity = 1 - y / (window.innerHeight * 0.9);
      }
    }, { passive: true });
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
