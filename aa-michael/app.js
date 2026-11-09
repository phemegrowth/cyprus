/* A.A. Michael Property Consultants: header shrink, mobile menu, reveals, listing filters, lightbox, form validation.
   Every page reads fully without this file. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = document.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-shrunk', window.scrollY > 48); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Scroll reveals */
  var items = document.querySelectorAll('.r');
  /* Anything already on screen at load shows at once; only content below the fold rises in. */
  var vh = window.innerHeight || 900;
  items.forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) { el.classList.add('no-anim', 'is-in'); }
  });
  items = Array.prototype.filter.call(items, function (el) { return !el.classList.contains('is-in'); });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Listing filters: type and area, chips with aria-pressed */
  var table = document.querySelector('[data-filterable]');
  if (table) {
    var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr[data-type]'));
    var empty = document.getElementById('tbl-empty');
    var count = document.getElementById('filter-count');
    var state = { type: 'all', area: 'all' };
    function apply() {
      var shown = 0;
      rows.forEach(function (tr) {
        var ok = (state.type === 'all' || tr.getAttribute('data-type') === state.type) &&
                 (state.area === 'all' || tr.getAttribute('data-area') === state.area);
        tr.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (count) count.textContent = shown === 1 ? '1 entry shown' : shown + ' entries shown';
    }
    document.querySelectorAll('.chips').forEach(function (group) {
      var key = group.getAttribute('data-key');
      group.querySelectorAll('.chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          group.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
          chip.setAttribute('aria-pressed', 'true');
          state[key] = chip.getAttribute('data-value');
          apply();
        });
      });
    });
    var reset = document.getElementById('filter-reset');
    if (reset) reset.addEventListener('click', function () {
      state = { type: 'all', area: 'all' };
      document.querySelectorAll('.chips .chip').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-value') === 'all' ? 'true' : 'false'); });
      apply();
    });
    apply();
  }

  /* Lightbox for the gallery */
  var gallery = document.querySelector('.gallery');
  if (gallery) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll('a'));
    var lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Photo viewer');
    lb.innerHTML = '<button type="button" class="lb__close" aria-label="Close">Esc</button>' +
      '<button type="button" class="lb__prev" aria-label="Previous photo">&larr;</button>' +
      '<img alt="">' +
      '<button type="button" class="lb__next" aria-label="Next photo">&rarr;</button>' +
      '<p class="lb__cap"></p>';
    document.body.appendChild(lb);
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lb__cap');
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + links.length) % links.length;
      var a = links[idx], im = a.querySelector('img');
      lbImg.src = a.getAttribute('href');
      lbImg.alt = im ? im.alt : '';
      lbCap.textContent = (idx + 1) + ' / ' + links.length + (im && im.alt ? '. ' + im.alt : '');
    }
    function open(i) { lastFocus = document.activeElement; show(i); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; lb.querySelector('.lb__close').focus(); }
    function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation with inline messages; the browser still submits without JS */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    function check(field) {
      var wrap = field.closest('.field'); if (!wrap) return true;
      var err = wrap.querySelector('.err');
      var v = field.value.trim(), msg = '';
      if (field.required && !v) msg = 'Please fill this in.';
      else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'That email address does not look right.';
      else if (field.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) msg = 'Please give a phone number we can call.';
      wrap.classList.toggle('is-invalid', !!msg);
      if (err) err.textContent = msg;
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field') && f.closest('.field').classList.contains('is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (f.name === 'bot-field' || f.type === 'hidden') return;
        if (!check(f)) { ok = false; if (!firstBad) firstBad = f; }
      });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });
})();

/* Polish pass, 2 Nov 2026: hero inking, letterbox band, listing rows re-enter on filter. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var root = document.documentElement;
  root.classList.add('js-anim');
  var hero = document.querySelector('.hero');
  var band = document.querySelector('.band');
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    if (hero) hero.classList.add('is-go');
    if (band) band.classList.add('is-go');
  }); });

  var table = document.querySelector('[data-filterable]');
  if (table) {
    document.querySelectorAll('.chips .chip, #filter-reset').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.classList.contains('chip')) { btn.classList.remove('stamp'); void btn.offsetWidth; btn.classList.add('stamp'); }
        var n = 0;
        table.querySelectorAll('tbody tr').forEach(function (tr) {
          tr.classList.remove('row-in');
          if (tr.classList.contains('is-hidden')) return;
          void tr.offsetWidth;
          tr.style.setProperty('--rd', (n++ * 60) + 'ms');
          tr.classList.add('row-in');
        });
      });
    });
  }
})();
