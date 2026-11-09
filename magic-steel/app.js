/* Magic Steel Ltd: header, menu, hero reveal, reveals, marquee, hover image swap, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var h = header ? header.offsetHeight : 0;
      var y = t.getBoundingClientRect().top + window.scrollY - h + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Hero: headline lines, then the strip slides in */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) hero.classList.add('is-ready');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });
  }

  /* Scroll reveals; anything already in view shows at once */
  var items = d.querySelectorAll('.reveal, .reveal-lines, [data-steps]');
  var io = 'IntersectionObserver' in window && !reduce ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }) : null;
  var stagger = 0;
  items.forEach(function (el, i) {
    if (!io) { el.classList.add('is-in'); return; }
    if (el.getBoundingClientRect().top < window.innerHeight) {
      el.style.transitionDelay = (stagger++ * 70) + 'ms';
      el.classList.add('is-in');
    } else {
      var prev = el.previousElementSibling;
      var k = 0;
      while (prev && prev.classList && prev.classList.contains('reveal') && k < 6) { k++; prev = prev.previousElementSibling; }
      el.style.transitionDelay = (k * 70) + 'ms';
      io.observe(el);
    }
  });

  /* Marquee: duplicate once so the loop is seamless */
  d.querySelectorAll('[data-marquee]').forEach(function (m) {
    var list = m.querySelector('.marquee__list');
    if (!list || reduce) return;
    var clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    list.style.animation = 'none';
    var wrap = d.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.width = 'max-content';
    wrap.style.animation = 'marquee 38s linear infinite';
    list.parentNode.insertBefore(wrap, list);
    wrap.appendChild(list);
    wrap.appendChild(clone);
  });

  /* Services: hover or focus swaps the side image */
  var swapImg = d.querySelector('[data-swap-img]');
  var swapCap = d.querySelector('[data-swap-cap]');
  var swapBox = swapImg ? swapImg.parentNode : null;
  var swapTimer;
  function swapTo(li) {
    if (!swapImg || !li) return;
    var src = li.getAttribute('data-img');
    var cap = li.getAttribute('data-cap');
    if (!src || swapImg.getAttribute('src') === src) return;
    clearTimeout(swapTimer);
    if (reduce) { swapImg.setAttribute('src', src); swapCap.textContent = cap; return; }
    swapBox.classList.add('is-fading');
    swapTimer = setTimeout(function () {
      swapImg.setAttribute('src', src);
      swapCap.textContent = cap;
      swapBox.classList.remove('is-fading');
    }, 260);
  }
  d.querySelectorAll('[data-swap] .svc__item').forEach(function (li) {
    li.setAttribute('tabindex', '0');
    li.addEventListener('mouseenter', function () { swapTo(li); });
    li.addEventListener('focus', function () { swapTo(li); });
    li.addEventListener('touchstart', function () { swapTo(li); }, { passive: true });
  });

  /* Work strip: drag to scroll with the mouse */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
      strip.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-dragging'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* Form validation */
  var form = d.querySelector('form.form');
  if (form) {
    function msgFor(f) {
      var v = f.value.trim();
      if (!v) return 'Please fill this in.';
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email does not look right.';
      if (f.type === 'tel' && v.replace(/\D/g, '').length < 8) return 'Please add a phone number we can call.';
      return '';
    }
    function check(f) {
      var field = f.closest('.field');
      var m = field ? field.querySelector('.field__msg') : null;
      var err = msgFor(f);
      if (field) field.classList.toggle('is-error', !!err);
      if (m) m.textContent = err;
      return !err;
    }
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-error')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f; } });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
    var els = [].slice.call(d.querySelectorAll(".about__img"));
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
  /* line drawings draw on when seen */
  (function () {
    if (RM) return;
    var ps = [].slice.call(d.querySelectorAll(".px-mesh path"));
    ps.forEach(function (p, i) { var L = 0; try { L = p.getTotalLength(); } catch (e) {} if (!L) return; p.style.setProperty('--len', Math.ceil(L)); p.style.setProperty('--dl', (i % 8) * 0.12 + 's'); p.classList.add('px-draw'); });
    var groups = []; ps.forEach(function (p) { var s = p.ownerSVGElement || p; if (groups.indexOf(s) < 0) groups.push(s); });
    onEnter(groups, function (s) { requestAnimationFrame(function () { requestAnimationFrame(function () { s.querySelectorAll('.px-draw').forEach(function (p) { p.classList.add('px-in'); }); }); }); }, { threshold: 0.3 });
  })();
})();
