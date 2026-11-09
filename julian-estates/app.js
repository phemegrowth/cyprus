/* Julian Estates: header, menu, reveals, filters, lightbox, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.getElementById('header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile drawer */
  var btn = d.querySelector('.menu-btn');
  var drawer = d.getElementById('drawer');
  function setMenu(open) {
    if (!btn || !drawer) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = drawer.querySelector('a'); if (first) first.focus(); } else { btn.focus(); }
  }
  if (btn && drawer) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  /* Current page in nav */
  var here = location.pathname.split('/').pop() || 'index.html';
  d.querySelectorAll('.nav a').forEach(function (a) {
    var raw = a.getAttribute('href');
    if (raw.indexOf('#') !== -1) return;
    var href = raw.replace('./', '').split('?')[0];
    if (href === here) a.setAttribute('aria-current', 'page');
  });

  /* Scroll reveals */
  var reveals = d.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } });
  }

  /* Villages: draw the route line when the row comes into view */
  d.querySelectorAll('.villages__grid').forEach(function (g) {
    if (reduce || !('IntersectionObserver' in window)) { g.classList.add('is-drawn'); return; }
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { g.classList.add('is-drawn'); vio.disconnect(); } });
    }, { threshold: 0.3 });
    vio.observe(g);
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id || a.getAttribute('aria-disabled') === 'true') { if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    });
  });

  /* Listings filter */
  var grid = d.getElementById('listing-grid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    var state = { type: 'all', area: 'all', mode: 'all' };
    var params = new URLSearchParams(location.search);
    if (params.get('mode')) state.mode = params.get('mode');
    if (params.get('type')) state.type = params.get('type');
    if (params.get('area')) state.area = params.get('area');
    var empty = d.getElementById('listing-empty');
    var count = d.getElementById('listing-count');
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (state.type === 'all' || c.dataset.type === state.type) &&
                 (state.area === 'all' || c.dataset.area === state.area) &&
                 (state.mode === 'all' || c.dataset.mode === state.mode);
        c.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (count) count.textContent = shown + (shown === 1 ? ' listing' : ' listings');
    }
    d.querySelectorAll('.chip[data-filter]').forEach(function (ch) {
      var key = ch.dataset.filter, val = ch.dataset.value;
      if (state[key] === val) { ch.setAttribute('aria-pressed', 'true'); }
      ch.addEventListener('click', function () {
        state[key] = val;
        d.querySelectorAll('.chip[data-filter="' + key + '"]').forEach(function (o) { o.setAttribute('aria-pressed', o === ch ? 'true' : 'false'); });
        apply();
      });
    });
    var areaSel = d.getElementById('filter-area');
    if (areaSel) {
      areaSel.value = state.area;
      areaSel.addEventListener('change', function () { state.area = areaSel.value; apply(); });
    }
    var reset = d.getElementById('filter-reset');
    if (reset) reset.addEventListener('click', function () {
      state = { type: 'all', area: 'all', mode: 'all' };
      d.querySelectorAll('.chip[data-filter]').forEach(function (o) { o.setAttribute('aria-pressed', o.dataset.value === 'all' ? 'true' : 'false'); });
      if (areaSel) areaSel.value = 'all';
      apply();
    });
    apply();
  }

  /* Lightbox */
  var gallery = d.querySelector('.gallery');
  var lb = d.getElementById('lightbox');
  if (gallery && lb) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll('a'));
    var img = lb.querySelector('img');
    var counter = lb.querySelector('.lightbox__count');
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + links.length) % links.length;
      img.src = links[idx].getAttribute('href');
      img.alt = links[idx].querySelector('img').alt;
      if (counter) counter.textContent = (idx + 1) + ' / ' + links.length;
    }
    function open(i) { lastFocus = d.activeElement; show(i); lb.setAttribute('aria-hidden', 'false'); d.body.style.overflow = 'hidden'; lb.querySelector('.lightbox__close').focus(); }
    function close() { lb.setAttribute('aria-hidden', 'true'); d.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (lb.getAttribute('aria-hidden') !== 'false') return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function setErr(input, msg) {
      var field = input.closest('.field');
      if (!field) return;
      var err = field.querySelector('.error');
      field.classList.toggle('is-invalid', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
    }
    function check(input) {
      var v = input.value.trim();
      if (input.required && !v) return 'Please fill this in.';
      if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email address does not look right.';
      if (input.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 7) return 'Please add a phone number we can call.';
      return '';
    }
    var inputs = form.querySelectorAll('input:not([type=hidden]), select, textarea');
    inputs.forEach(function (i) {
      i.addEventListener('blur', function () { setErr(i, check(i)); });
      i.addEventListener('input', function () { if (i.closest('.field') && i.closest('.field').classList.contains('is-invalid')) setErr(i, check(i)); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      inputs.forEach(function (i) { var m = check(i); setErr(i, m); if (m && !bad) bad = i; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  });

  /* Year in footer */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
