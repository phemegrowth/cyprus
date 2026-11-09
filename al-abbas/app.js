/* J.A Al Abbas Ltd: header, menu, reveals, hero drift, service photo swap, drag strip,
   process line, form validation, anchor scroll, footer year. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Header shrinks on scroll */
  var header = d.querySelector('.header');
  function onHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  onHeader();

  /* Mobile menu: opens, closes on link click and Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Language switch is a visible no-op for now */
  var lang = d.querySelector('.lang');
  if (lang) lang.addEventListener('click', function (e) { e.preventDefault(); });

  /* Scroll reveals with stagger; anything already on screen shows at once */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  function groupDelay(el) {
    var sib = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('r'); }) : [];
    var i = sib.indexOf(el);
    el.style.setProperty('--d', (Math.max(i, 0) * 0.08).toFixed(2) + 's');
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); }
      else { groupDelay(el); io.observe(el); }
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Service list swaps the photo on hover and focus */
  var swaps = d.querySelectorAll('.swap__img');
  var sItems = d.querySelectorAll('.slist__item');
  function setSwap(i) {
    swaps.forEach(function (img, k) { img.classList.toggle('is-on', k === i); });
    sItems.forEach(function (it) { it.classList.toggle('is-active', Number(it.getAttribute('data-swap')) === i); });
  }
  sItems.forEach(function (it) {
    var i = Number(it.getAttribute('data-swap'));
    it.addEventListener('mouseenter', function () { setSwap(i); });
    it.addEventListener('focus', function () { setSwap(i); });
    it.addEventListener('click', function () { setSwap(i); });
  });
  if (sItems.length) setSwap(0);

  /* Work strip: drag with the mouse, arrows step one photo */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, moved = false, startX = 0, startLeft = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    function step(dir) {
      var tile = strip.querySelector('.tile');
      var w = tile ? tile.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  }

  /* Scroll-linked: hero photo drifts slower than the page, process line draws */
  var drift = d.querySelector('.hero__drift');
  var steps = d.querySelector('[data-progress]');
  var ticking = false;
  function onScroll() {
    ticking = false;
    onHeader();
    if (reduce) return;
    var vh = window.innerHeight;
    if (drift) {
      var y = window.scrollY;
      if (y < vh * 1.2) drift.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }
    if (steps) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.25);
      p = Math.min(1, Math.max(0, p));
      steps.style.setProperty('--p', p.toFixed(3));
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(onScroll); } }, { passive: true });
  window.addEventListener('resize', function () { raf(onScroll); });
  if (reduce && steps) steps.style.setProperty('--p', '1');
  raf(onScroll);

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()]{6,}$/.test(field.value.trim())) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.type === 'hidden' || f.name === 'bot-field') return;
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f) && !firstBad) firstBad = f;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (a.getAttribute('aria-disabled') === 'true') return;
      if (!id) return;
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveal, work tiles tilt, magnetic hero buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__photo","tilt":".strip .tile","magnet":".btn--lg"};
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
    var $$ = function (s) { return s ? Array.prototype.slice.call(document.querySelectorAll(s)) : []; };

    /* Scroll progress line under the header */
    if (cfg.progress) {
      var bar = document.createElement('div');
      bar.className = 'pg-progress'; bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      var tick = false;
      var paint = function () {
        var max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
        tick = false;
      };
      addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true });
      paint();
    }

    if (reduce) return;

    /* Image reveals: a clip-path wipe as each photo enters the screen */
    var clips = $$(cfg.clip);
    if (clips.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pg-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      clips.forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight) return;
        el.classList.add('pg-clip'); io.observe(el);
      });
    }

    if (!fine) return;

    /* Cards tilt a little toward the cursor */
    $$(cfg.tilt).forEach(function (el) {
      el.addEventListener('pointerenter', function () { el.style.transition = 'transform .3s cubic-bezier(.2,.7,.2,1)'; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    /* Buttons pull toward the cursor */
    $$(cfg.magnet).forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transition = 'transform .2s ease-out';
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  })();
