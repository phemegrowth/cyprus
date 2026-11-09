/* GND Developers: header, menu, reveals, image swap, count-up, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Curtain: remove from the DOM once it has left the screen */
  var curtain = d.querySelector('.curtain');
  if (curtain) {
    if (reduce) { curtain.remove(); }
    else {
      curtain.addEventListener('animationend', function (e) { if (e.animationName === 'curtain-up') curtain.remove(); });
      setTimeout(function () { if (curtain.parentNode) curtain.remove(); }, 1600);
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
  function setMenu(open, focusBack) {
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (focusBack) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { if (menu.classList.contains('is-open')) setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Language switch is a visible no-op until the Greek version exists */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Scroll reveals with above-the-fold guard */
  var parents = [], seen = [];
  d.querySelectorAll('.r').forEach(function (el) {
    var k = parents.indexOf(el.parentNode);
    if (k < 0) { parents.push(el.parentNode); seen.push(0); k = parents.length - 1; }
    el.style.setProperty('--d', Math.min(seen[k], 5) * 80 + 'ms');
    seen[k]++;
  });
  var items = d.querySelectorAll('.r');
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

  /* Homes: hover, focus or tap swaps the photo */
  var frame = d.querySelector('.homes__frame');
  var homeItems = d.querySelectorAll('.homes__item');
  function show(n) {
    if (!frame) return;
    frame.querySelectorAll('img').forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === n); });
    homeItems.forEach(function (it) { it.classList.toggle('is-on', it.getAttribute('data-target') === n); });
  }
  homeItems.forEach(function (it) {
    var n = it.getAttribute('data-target');
    it.addEventListener('mouseenter', function () { show(n); });
    it.addEventListener('focus', function () { show(n); });
    it.addEventListener('click', function () { show(n); });
    it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(n); } });
  });

  /* Count-up on the project specs (sourced figures only) */
  var counts = d.querySelectorAll('[data-count]');
  function run(el) {
    var end = parseInt(el.getAttribute('data-count'), 10), t0 = null, dur = 1100;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { run(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counts.forEach(function (el) { co.observe(el); });
  }

  /* Drag strip (mouse drag; touch uses native scroll) */
  d.querySelectorAll('[data-drag]').forEach(function (track) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { if (down) { down = false; track.classList.remove('is-drag'); } });
    track.addEventListener('click', function (e) { if (moved > 6) e.preventDefault(); }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { track.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  });

  /* Process: progress line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var fill = d.querySelector('[data-fill]');
  if (steps && fill && !reduce) {
    var ticking = false;
    function draw() {
      var r = steps.getBoundingClientRect();
      var mid = window.innerHeight * 0.6;
      var p = (mid - r.top) / r.height;
      fill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  } else if (fill) { fill.style.transform = 'none'; }

  /* Form validation */
  var form = d.querySelector('[data-form]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about what you need, please.'; }
    };
    function check(field) {
      var rule = rules[field.name]; if (!rule) return true;
      var msg = rule(field.value);
      var wrap = field.closest('.field');
      wrap.classList.toggle('is-bad', !!msg);
      wrap.querySelector('.err').textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener('blur', function () { check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f)) { ok = false; if (!firstBad) firstBad = f; }
      });
      if (!ok) { e.preventDefault(); firstBad.focus(); }
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
    var els = [].slice.call(d.querySelectorAll(".panel__media, .about__photo"));
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
    var ps = [].slice.call(d.querySelectorAll(".map__grid path"));
    ps.forEach(function (p, i) { var L = 0; try { L = p.getTotalLength(); } catch (e) {} if (!L) return; p.style.setProperty('--len', Math.ceil(L)); p.style.setProperty('--dl', (i % 8) * 0.12 + 's'); p.classList.add('px-draw'); });
    var groups = []; ps.forEach(function (p) { var s = p.ownerSVGElement || p; if (groups.indexOf(s) < 0) groups.push(s); });
    onEnter(groups, function (s) { requestAnimationFrame(function () { requestAnimationFrame(function () { s.querySelectorAll('.px-draw').forEach(function (p) { p.classList.add('px-in'); }); }); }); }, { threshold: 0.3 });
  })();
  (function () { var m = d.querySelector(".map"); if (!m) return; if (RM) { m.classList.add("px-pinned"); return; } onEnter([m], function () { setTimeout(function () { m.classList.add("px-pinned"); }, 1500); }, { threshold: 0.4 }); })();
})();
