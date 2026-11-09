/* P & M Charalambous: header, menu, hero entrance and parallax, reveals, service image swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Hero entrance: starts on the first frame, line by line, 80ms apart */
  var hero = d.querySelector('.hero');
  if (hero) {
    hero.querySelectorAll('.line').forEach(function (l, i) { l.style.setProperty('--i', i); });
    if (reduce) { hero.classList.add('is-in'); }
    else { raf(function () { raf(function () { hero.classList.add('is-in'); }); }); }
  }

  /* Header shrink + hero parallax + process line, one scroll handler */
  var header = d.querySelector('.header');
  var heroImg = d.querySelector('.hero__img');
  var heroMedia = d.querySelector('.hero__media');
  var steps = d.querySelector('[data-progress]');
  var stepItems = steps ? steps.querySelectorAll('.step') : [];
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (!reduce && heroImg && heroMedia) {
      var r = heroMedia.getBoundingClientRect();
      if (r.bottom > 0) heroImg.style.transform = 'translate3d(0,' + Math.min(r.height * 0.07, Math.max(0, -r.top) * 0.18 + y * 0.04).toFixed(1) + 'px,0)';
    }
    if (steps) {
      var s = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.8 - s.top) / (s.height + vh * 0.2)));
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach(function (it, i) { it.classList.toggle('is-lit', p >= (i + 0.5) / stepItems.length || reduce); });
    }
  }
  function onScroll() { if (!ticking) { ticking = true; raf(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keepFocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    else if (!keepFocus) { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { if (menu.classList.contains('is-open')) setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* EN / EL switch: Greek comes later, the EL link does nothing */
  d.querySelectorAll('.lang a[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Scroll reveals with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty('--d', n);
    groups.set(parent, n + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var svc = d.querySelectorAll('[data-swap-to]');
  var imgs = d.querySelectorAll('.swap__img');
  function activate(item) {
    var k = item.getAttribute('data-swap-to');
    svc.forEach(function (x) { x.classList.toggle('is-active', x === item); });
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap') === k); });
  }
  svc.forEach(function (item) {
    item.addEventListener('mouseenter', function () { activate(item); });
    item.addEventListener('focus', function () { activate(item); });
  });
  if (svc[0]) activate(svc[0]);

  /* Work strip: drag, arrows, progress */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var fill = strip.querySelector('.strip__fill');
    if (!track) return;
    function progress() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? (track.scrollLeft + track.clientWidth) / track.scrollWidth : 1;
      if (fill) fill.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    }
    track.addEventListener('scroll', function () { raf(progress); }, { passive: true });
    window.addEventListener('resize', progress);
    progress();
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      if (moved) track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-drag');
    });
  });

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value.trim())) ok = false;
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
      var bad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f) && !bad) bad = f;
      });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') return;
      var id = a.getAttribute('href').slice(1);
      var t = id ? d.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height + 12 : 72;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* Polish: cards rise out of a clip as they come into view; back-to-top level meter */
  var cards = d.querySelectorAll('.cardr');
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); cio.unobserve(en.target); } }); }, { threshold: 0.1 });
    cards.forEach(function (c) { cio.observe(c); });
  } else { cards.forEach(function (c) { c.classList.add('is-in'); }); }
  var top = d.querySelector('.totop'), fill = d.querySelector('[data-totop-fill]'), tk = false;
  function onTop() {
    tk = false; if (!top) return;
    var max = d.documentElement.scrollHeight - window.innerHeight, p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    top.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.8);
    if (fill) fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  window.addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(onTop); } }, { passive: true });
  onTop();
})();
