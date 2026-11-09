/* Houseology Construction: small vanilla JS. Everything works without it. */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink on scroll */
  var header = doc.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var btn = doc.querySelector('.menu-btn');
  var menu = doc.getElementById('menu');
  function setMenu(open) {
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    doc.body.classList.toggle('menu-open', open);
    btn.querySelector('.menu-txt').textContent = open ? 'Close' : 'Menu';
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else { btn.focus(); }
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Scroll reveals */
  var reveals = doc.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } });
  }

  /* Services filter */
  var filter = doc.querySelector('[data-filter]');
  if (filter) {
    var cards = doc.querySelectorAll('[data-type]');
    var empty = doc.querySelector('.empty');
    var count = doc.querySelector('[data-count]');
    filter.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      filter.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var want = b.getAttribute('data-value'); var shown = 0;
      cards.forEach(function (c) {
        var ok = want === 'all' || c.getAttribute('data-type') === want;
        c.classList.toggle('is-hidden', !ok); if (ok) shown++;
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (count) count.textContent = shown + (shown === 1 ? ' example' : ' examples');
    });
  }

  /* Lightbox */
  var gallery = doc.querySelector('.gallery');
  var lb = doc.querySelector('.lightbox');
  if (gallery && lb) {
    var imgs = Array.prototype.map.call(gallery.querySelectorAll('img'), function (i) { return { src: i.getAttribute('data-full') || i.src, alt: i.alt }; });
    var lbImg = lb.querySelector('img'), lbCount = lb.querySelector('.lb-count'), idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      lbImg.src = imgs[idx].src; lbImg.alt = imgs[idx].alt;
      if (lbCount) lbCount.textContent = (idx + 1) + ' / ' + imgs.length;
    }
    function openLb(i) { lastFocus = doc.activeElement; show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); doc.body.classList.add('menu-open'); lb.querySelector('.lb-close').focus(); }
    function closeLb() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); doc.body.classList.remove('menu-open'); if (lastFocus) lastFocus.focus(); }
    gallery.querySelectorAll('button').forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    doc.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation */
  doc.querySelectorAll('form[data-netlify]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field'); if (!wrap) return true;
      var msg = wrap.querySelector('.field-msg'); var bad = '';
      var v = field.value.trim();
      if (field.required && !v) bad = 'Please fill this in.';
      else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad = 'That email does not look right.';
      else if (field.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) bad = 'Please add a full phone number.';
      wrap.classList.toggle('is-invalid', !!bad);
      if (msg) msg.textContent = bad;
      return !bad;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field') && f.closest('.field').classList.contains('is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (f) { if (f.name === 'bot-field') return; if (!check(f)) { ok = false; if (!firstBad) firstBad = f; } });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  doc.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1); if (!id) return;
      var t = doc.getElementById(id); if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true });
    });
  });
})();

/* Polish pass, 2 Nov 2026: hero frame opens on load. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hero = document.querySelector('.hero');
  if (!hero || !hero.querySelector('.hero-media')) return;
  document.documentElement.classList.add('js-anim');
  requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-go'); }); });
})();
