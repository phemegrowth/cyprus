/* G. Ch. Loizou Developments: header, menu, reveals, service image swap, drag strip, process line, form, anchors.
   The hero load sequence is pure CSS so it starts on first paint. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu */
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
  d.querySelectorAll('.lang a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Scroll reveals with above-the-fold guard and stagger */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', (Math.min(i, 5) * 0.08) + 's');
    groups.set(p, i + 1);
  });
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

  /* Services: hover or focus swaps the photo */
  var sItems = d.querySelectorAll('.slist__item');
  var sImgs = d.querySelectorAll('.swap img');
  function activate(item) {
    var n = parseInt(item.getAttribute('data-img'), 10) || 0;
    sItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
    sImgs.forEach(function (img, i) { img.classList.toggle('is-on', i === n); });
  }
  sItems.forEach(function (item) {
    item.setAttribute('tabindex', '0');
    item.addEventListener('mouseenter', function () { activate(item); });
    item.addEventListener('focus', function () { activate(item); });
    item.addEventListener('click', function () { activate(item); });
  });

  /* Work strip: drag, buttons, progress bar */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var track = strip.querySelector('.strip__track');
    var bar = strip.querySelector('.strip__bar i');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    var step = function (dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    };
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var updateBar = function () {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      bar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
    };
    track.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-drag');
    });
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  /* Process line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var stepEls = steps ? steps.querySelectorAll('.step') : [];
  function onSteps() {
    if (!steps) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = reduce ? 1 : Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    steps.style.setProperty('--p', p.toFixed(3));
    stepEls.forEach(function (s, i) { s.classList.toggle('is-lit', p >= (i + 0.2) / stepEls.length); });
  }

  /* One scroll loop */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onHeader(); onSteps(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onHeader(); onSteps();

  /* Form validation */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value.trim())) ok = false;
      if (field.value.trim() === '' && field.required) ok = false;
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
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });
})();

/* ===== Polish pass, 2 Nov 2026 ===== */
(function () {
  var d = document, RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function inView(el) { var r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }
  function onEnter(els, fn, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }); }, opts || { threshold: 0.15 });
    els.forEach(function (el) { if (inView(el)) fn(el); else io.observe(el); });
  }
  /* scroll progress line */
  (function () {
    var bar = d.createElement('div'); bar.className = 'px-progress'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
    var t = false;
    function u() { t = false; var h = d.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(u); } }, { passive: true }); u();
  })();
  /* clip-path image reveals */
  (function () {
    var els = [].slice.call(d.querySelectorAll(".about__photo"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* cards tilt toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".strip .card").forEach(function (c) {
      c.classList.add('px-tilt');
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.classList.add('is-tilting'); c.style.transform = 'perspective(900px) rotateX(' + (-y * 3).toFixed(2) + 'deg) rotateY(' + (x * 3).toFixed(2) + 'deg) translateY(-4px)'; });
      c.addEventListener('pointerleave', function () { c.classList.remove('is-tilting'); c.style.transform = ''; });
    });
  })();
  /* highlight that follows the cursor over the work grid */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".strip").forEach(function (g) {
      g.classList.add('px-spot');
      g.addEventListener('pointermove', function (e) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (e.clientX - r.left + g.scrollLeft) + 'px'); g.style.setProperty('--my', (e.clientY - r.top + g.scrollTop) + 'px'); g.classList.add('is-spot'); });
      g.addEventListener('pointerleave', function () { g.classList.remove('is-spot'); });
    });
  })();
})();
