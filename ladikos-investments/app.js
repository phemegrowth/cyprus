/* Ladikos Investments: hero sequence, header, menu, reveals, service image swap, drag strip, process rail, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: start the blueprint frame sequence (CSS keyframes keyed on .is-loaded) */
  function startHero() { root.classList.add('is-loaded'); }
  if (reduce) { startHero(); }
  else { requestAnimationFrame(function () { requestAnimationFrame(startHero); }); }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

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
  d.querySelectorAll('.lang a[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Scroll reveals with an above-the-fold guard and a stagger per group */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--rd', Math.min(i, 6) * 80 + 'ms');
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

  /* Services: hover or focus swaps the image */
  var swapImgs = d.querySelectorAll('.swap__img');
  var sItems = d.querySelectorAll('[data-swap]');
  function activate(item) {
    var key = item.getAttribute('data-swap');
    sItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
    swapImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-key') === key); });
  }
  sItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () { activate(item); });
    item.addEventListener('focus', function () { activate(item); });
    item.addEventListener('click', function () { activate(item); });
  });
  if (sItems[0]) activate(sItems[0]);

  /* Work strip: mouse drag, keyboard arrows, progress bar */
  var strip = d.querySelector('[data-drag]');
  var bar = d.querySelector('[data-drag-bar]');
  function stripProgress() {
    if (!strip || !bar) return;
    var max = strip.scrollWidth - strip.clientWidth;
    var view = strip.clientWidth / strip.scrollWidth;
    var p = max > 0 ? strip.scrollLeft / max : 1;
    bar.style.transform = 'scaleX(' + Math.max(view, Math.min(1, view + p * (1 - view))).toFixed(3) + ')';
  }
  if (strip) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
      strip.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; strip.classList.remove('is-dragging');
    });
    strip.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        strip.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * strip.clientWidth * 0.6, behavior: reduce ? 'auto' : 'smooth' });
      }
    });
    strip.addEventListener('scroll', stripProgress, { passive: true });
    window.addEventListener('resize', stripProgress);
    stripProgress();
  }

  /* Process: rail draws as the steps scroll past */
  var steps = d.querySelector('[data-steps]');
  var rail = d.querySelector('[data-rail]');
  function railProgress() {
    if (!steps || !rail) return;
    if (reduce) { rail.style.setProperty('--p', 1); return; }
    var r = steps.getBoundingClientRect();
    var mid = window.innerHeight * 0.6;
    var p = (mid - r.top) / r.height;
    rail.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScrollHeader(); railProgress(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScrollHeader(); railProgress();

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id || a.getAttribute('aria-disabled') === 'true') return;
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 64;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Form validation with inline messages */
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
      f.addEventListener('blur', function () { if (f.value) check(f); });
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
  /* buttons pull toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".btn--accent").forEach(function (b) {
      b.classList.add('px-mag');
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();
  /* before and after slider */
  (function () {
    d.querySelectorAll('.px-ba').forEach(function (w) {
      var r = w.querySelector('input'); function s() { w.style.setProperty('--p', r.value + '%'); } r.addEventListener('input', s); s();
      if (RM) return;
      onEnter([w], function () { var v = 50, t0 = null; function k(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1400); var x = 50 + Math.sin(p * Math.PI * 2) * 18 * (1 - p); r.value = x; s(); if (p < 1) requestAnimationFrame(k); } requestAnimationFrame(k); }, { threshold: 0.5 });
    });
  })();
})();
