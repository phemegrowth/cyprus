/* K & K Steelworks: hero fan, header, menu, reveals, service swap, drag strip, process rail, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: cards fan out from a stack, headline lines rise. Starts on the first frame. */
  var hero = d.querySelector('[data-hero]');
  if (hero) {
    if (reduce) { hero.classList.add('is-go'); }
    else {
      var go = function () { hero.classList.add('is-go'); };
      requestAnimationFrame(function () { requestAnimationFrame(go); });
      setTimeout(go, 80); /* fallback if frames are throttled */
    }
  }

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (refocus) { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Language switch: Greek comes later */
  d.querySelectorAll('.lang [aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Scroll reveals with above-the-fold guard and stagger among siblings */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0;
    el.style.setProperty('--rd', Math.min(n, 5) * 80 + 'ms');
    groups.set(p, n + 1);
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
  var svc = d.querySelectorAll('[data-svc]');
  var swaps = d.querySelectorAll('[data-swap]');
  var num = d.querySelector('[data-swap-num]');
  function pick(i) {
    svc.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-svc') === String(i)); });
    swaps.forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-swap') === String(i)); });
    if (num) num.textContent = '0' + (Number(i) + 1);
  }
  svc.forEach(function (s) {
    var i = s.getAttribute('data-svc');
    s.addEventListener('mouseenter', function () { pick(i); });
    s.addEventListener('focus', function () { pick(i); });
    s.addEventListener('click', function () { pick(i); });
  });
  if (svc.length) pick(0);
  /* On scroll, the item nearest the middle of the screen leads */
  if ('IntersectionObserver' in window && svc.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) pick(en.target.getAttribute('data-svc')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    svc.forEach(function (s) { so.observe(s); });
  }

  /* Work strip: drag with the mouse (touch scrolls natively) */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, startX = 0, startL = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startL = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  /* Process rail draws with scroll */
  var box = d.querySelector('[data-steps]');
  var rail = d.querySelector('[data-rail]');
  if (box && rail && !reduce) {
    var vertical = function () { return window.matchMedia('(max-width: 640px)').matches; };
    var ticking = false;
    var draw = function () {
      ticking = false;
      var r = box.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      rail.style.transform = vertical() ? 'scaleY(' + p + ')' : 'scaleX(' + p + ')';
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  }

  /* Form validation */
  var form = d.querySelector('[data-form]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose a project type.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about the job, please.'; }
    };
    var check = function (field) {
      var fn = rules[field.name]; if (!fn) return true;
      var msg = fn(field.value), wrap = field.closest('.field'), err = wrap && wrap.querySelector('.err');
      if (wrap) wrap.classList.toggle('is-bad', !!msg);
      if (err) err.textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener('blur', function () { check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f) && !first) first = f;
      });
      if (first) { e.preventDefault(); first.focus(); }
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
    var els = [].slice.call(d.querySelectorAll(".about__photo"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
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
  /* line drawings draw on when seen */
  (function () {
    if (RM) return;
    var ps = [].slice.call(d.querySelectorAll(".truss path"));
    ps.forEach(function (p, i) { var L = 0; try { L = p.getTotalLength(); } catch (e) {} if (!L) return; p.style.setProperty('--len', Math.ceil(L)); p.style.setProperty('--dl', (i % 8) * 0.12 + 's'); p.classList.add('px-draw'); });
    var groups = []; ps.forEach(function (p) { var s = p.ownerSVGElement || p; if (groups.indexOf(s) < 0) groups.push(s); });
    onEnter(groups, function (s) { requestAnimationFrame(function () { requestAnimationFrame(function () { s.querySelectorAll('.px-draw').forEach(function (p) { p.classList.add('px-in'); }); }); }); }, { threshold: 0.3 });
  })();
})();
