/* Landlord Properties homepage: entrance, header, menu, reveals, service photo swap, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance starts on the first frame (no waiting for fonts or images) */
  requestAnimationFrame(function () { root.classList.add('is-ready'); });

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Disabled language link does nothing */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') return;
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height + 12 : 0;
      var y = id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
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
  var media = d.querySelector('[data-swap-media]');
  var svcs = d.querySelectorAll('[data-swap-list] .svc');
  function pick(key) {
    svcs.forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-key') === key); });
    if (media) media.querySelectorAll('img').forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
  }
  svcs.forEach(function (s) {
    var key = s.getAttribute('data-key');
    s.addEventListener('mouseenter', function () { pick(key); });
    s.addEventListener('focusin', function () { pick(key); });
    s.addEventListener('click', function () { pick(key); });
  });

  /* Service links preselect the form choice */
  var want = d.getElementById('f-want');
  d.querySelectorAll('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () { if (want) want.value = a.getAttribute('data-pick'); });
  });

  /* Homes: drag to scroll, plus buttons */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, moved = false, startX = 0, startL = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) { moved = true; strip.classList.add('is-dragging'); }
      if (moved) strip.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; strip.classList.remove('is-dragging');
    });
    function step(dir) {
      var card = strip.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
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

  /* How it works: progress line draws with scroll */
  var prog = d.querySelector('[data-progress]');
  var fill = d.querySelector('[data-progress-fill]');
  var steps = prog ? prog.querySelectorAll('.step') : [];
  var ticking = false;
  function drawLine() {
    ticking = false;
    if (!prog || !fill) return;
    var r = prog.getBoundingClientRect();
    var mid = window.innerHeight * 0.6;
    var p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    if (reduce) p = 1;
    fill.style.setProperty('--p', p.toFixed(3));
    steps.forEach(function (s) {
      s.classList.toggle('is-lit', reduce || s.getBoundingClientRect().top < mid);
    });
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(drawLine); }
  }, { passive: true });
  window.addEventListener('resize', drawLine);
  drawLine();

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-landlord-properties"]');
  if (form) {
    var rules = {
      want: function (v) { return v ? '' : 'Choose what you want to do.'; },
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email.'; }
    };
    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      var field = input.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      if (field) field.classList.toggle('is-bad', !!msg);
      if (err) err.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var input = form.elements[n];
      if (!input) return;
      input.addEventListener('blur', function () { check(input); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-bad')) check(input); });
      input.addEventListener('change', function () { check(input); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var input = form.elements[n];
        if (input && !check(input) && !firstBad) firstBad = input;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  }

  /* Footer year */
  var y = d.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
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
  /* clip-path image reveals */
  (function () {
    var els = [].slice.call(d.querySelectorAll(".about__ph"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* buttons pull toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".btn--accent, .btn--primary").forEach(function (b) {
      b.classList.add('px-mag');
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();
  /* filter chips on the homes strip */
  (function () {
    var strip = d.querySelector('.homes__strip'), side = d.querySelector('.homes__side'); if (!strip || !side) return;
    var cards = [].slice.call(strip.querySelectorAll('.card'));
    var map = { 'Living room': 'Living', 'Open plan living': 'Living', 'Kitchen': 'Kitchens', 'Bedroom': 'Bedrooms', 'Bathroom': 'Bathrooms', 'Nicosia': 'Nicosia' };
    cards.forEach(function (c) { var t = c.querySelector('strong'); c.setAttribute('data-cat', map[t ? t.textContent.trim() : ''] || 'Other'); });
    var cats = ['All', 'Living', 'Kitchens', 'Bedrooms', 'Bathrooms', 'Nicosia'];
    var wrap = d.createElement('div'); wrap.className = 'px-chips'; wrap.setAttribute('role', 'group'); wrap.setAttribute('aria-label', 'Filter the photos');
    cats.forEach(function (c, i) { var b = d.createElement('button'); b.type = 'button'; b.className = 'px-chip'; b.textContent = c; b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); wrap.appendChild(b); });
    side.appendChild(wrap);
    wrap.addEventListener('click', function (e) {
      var b = e.target.closest('.px-chip'); if (!b) return; var cat = b.textContent;
      wrap.querySelectorAll('.px-chip').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      cards.forEach(function (c) {
        var on = cat === 'All' || c.getAttribute('data-cat') === cat;
        if (on) { c.hidden = false; if (!RM) { c.classList.remove('px-show'); void c.offsetWidth; c.classList.add('px-show'); } }
        else c.hidden = true;
      });
      strip.scrollTo({ left: 0, behavior: RM ? 'auto' : 'smooth' });
    });
  })();
})();
