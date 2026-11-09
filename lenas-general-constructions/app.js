/* Lenas General Constructions: hero entrance, header, menu, reveals, count-up, service image swap,
   drag strip, process line, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: starts on the first animation frame, no waiting for fonts or images */
  requestAnimationFrame(function () { root.classList.add('is-in'); });

  /* Footer year */
  d.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keepFocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (!keepFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') { if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) - (id === '#top' ? 0 : 8);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Count-up (only sourced quantities) */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || isNaN(to)) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* Scroll reveals with above-the-fold guard */
  var revs = d.querySelectorAll('.reveal');
  var groups = new Map();
  revs.forEach(function (el) {
    var p = el.parentElement, i = groups.get(p) || 0;
    el.style.setProperty('--d', (i * 0.08) + 's');
    groups.set(p, i + 1);
  });
  function show(el) {
    el.classList.add('is-visible');
    el.querySelectorAll('.count').forEach(countUp);
  }
  if (reduce || !('IntersectionObserver' in window)) {
    revs.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revs.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el);
    });
  }

  /* Service list: hover or focus swaps the photo */
  var items = d.querySelectorAll('.svc__item');
  var imgs = d.querySelectorAll('.swap__img');
  function activate(key) {
    items.forEach(function (i) { i.classList.toggle('is-on', i.getAttribute('data-key') === key); });
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
  }
  items.forEach(function (it) {
    var k = it.getAttribute('data-key');
    it.addEventListener('mouseenter', function () { activate(k); });
    it.addEventListener('focus', function () { activate(k); });
    it.addEventListener('click', function () { activate(k); });
  });
  if (items.length) activate(items[0].getAttribute('data-key'));

  /* Drag strip (mouse); touch uses native scroll */
  var strip = d.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* Process line draws with scroll */
  var steps = d.querySelector('.steps');
  if (steps) {
    if (reduce) { steps.style.setProperty('--p', 1); }
    else {
      var ticking = false;
      var upd = function () {
        ticking = false;
        var r = steps.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        steps.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
      window.addEventListener('resize', upd);
      upd();
    }
  }

  /* Form validation */
  var form = d.querySelector('form.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose a project type.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about the project, please.'; }
    };
    function check(field) {
      var fn = rules[field.name]; if (!fn) return true;
      var msg = fn(field.value), wrap = field.closest('.field'), err = wrap && wrap.querySelector('.err');
      if (wrap) wrap.classList.toggle('has-err', !!msg);
      if (err) err.textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener('blur', function () { check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f)) { ok = false; if (!first) first = f; }
      });
      if (!ok) { e.preventDefault(); if (first) first.focus(); }
    });
  }
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
