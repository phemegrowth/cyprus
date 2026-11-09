/* A. Nicolaou & Son: header, menu, reveals, hero parallax, drag strip, steps line, form, anchors. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onHeader() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
  }
  window.addEventListener('scroll', onHeader, { passive: true });
  onHeader();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* Scroll reveals: anything already in view shows at once */
  var items = d.querySelectorAll('.r, [data-steps]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero parallax: the photo moves slower than the page (transform only) */
  var par = d.querySelector('[data-parallax]');
  if (par && !reduce) {
    var hero = par.closest('.hero');
    var ticking = false;
    function onPar() {
      ticking = false;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;
      var y = Math.min(window.scrollY, rect.height) * 0.22;
      par.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(onPar); }
    }, { passive: true });
    onPar();
  }

  /* Houses strip: arrows plus drag to scroll */
  d.querySelectorAll('[data-strip]').forEach(function (section) {
    var strip = section.querySelector('.strip');
    var prev = section.querySelector('[data-prev]');
    var next = section.querySelector('[data-next]');
    if (!strip) return;
    function step(dir) {
      var tile = strip.querySelector('.tile');
      var w = tile ? tile.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) { moved = true; strip.classList.add('is-dragging'); }
      if (moved) { strip.scrollLeft = startLeft - dx; e.preventDefault(); }
    });
    function up() { down = false; strip.classList.remove('is-dragging'); }
    strip.addEventListener('pointerup', up);
    strip.addEventListener('pointercancel', up);
    strip.addEventListener('pointerleave', up);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });
  });

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value)) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { check(f); });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true, firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f)) { allOk = false; if (!firstBad) firstBad = f; }
      });
      if (!allOk) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var offset = id === 'top' ? 0 : 72;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* Scroll progress line and clip reveal of the wide house photo */
  var bar = d.querySelector('[data-progress]');
  var clips = [].slice.call(d.querySelectorAll('[data-clip]'));
  if (!reduce && clips.length) d.documentElement.classList.add('js-clip');
  var ticking = false;
  function onProgress() {
    ticking = false;
    var de = d.documentElement, max = de.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0) + ')';
    if (reduce) return;
    clips.forEach(function (el) {
      var r = el.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.75)));
      el.style.setProperty('--ci', (12 * (1 - p)).toFixed(2) + '%');
      el.style.setProperty('--cx', (10 * (1 - p)).toFixed(2) + '%');
      el.style.setProperty('--cs', (1 + 0.12 * (1 - p)).toFixed(3));
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onProgress); } }, { passive: true });
  window.addEventListener('resize', onProgress);
  onProgress();

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
