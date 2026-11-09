/* MARR Group homepage: header, menu, count-up, reveals, accordion with image swap, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Count-up (quantities only: floors, metres, apartments, villas) */
  function countUp(el, dur) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (!end || reduce) { el.textContent = end; return; }
    var start = null;
    el.textContent = '0';
    function tick(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(end * e);
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  /* Hero figure starts on the first frame */
  var heroNum = d.querySelector('.figure__num');
  if (heroNum) countUp(heroNum, 1100);

  /* Scroll reveals with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms');
    groups.set(p, i + 1);
  });
  function show(el) {
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(function (c) { countUp(c, 1200); });
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (refocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Accordion with image swap */
  var accItems = d.querySelectorAll('.acc__item');
  var swapImgs = d.querySelectorAll('.swap img');
  function swapTo(key) {
    swapImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-key') === key); });
  }
  accItems.forEach(function (item) {
    var btn = item.querySelector('.acc__btn');
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      accItems.forEach(function (o) {
        o.classList.remove('is-open');
        o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false');
      });
      if (open) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        swapTo(item.getAttribute('data-key'));
      }
    });
    item.addEventListener('mouseenter', function () { swapTo(item.getAttribute('data-key')); });
  });

  /* Progress line that draws on scroll */
  var steps = d.querySelector('[data-progress]');
  function progress() {
    if (!steps || reduce) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    steps.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onScroll(); progress(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', progress);
  onScroll(); progress();
  if (reduce && steps) steps.style.setProperty('--p', '1');

  /* Form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Please add your name.', phone: 'Please add a phone number.', email: 'Please add a valid email.', interest: 'Please choose one.', message: 'Please write a short message.' };
    function check(f) {
      var field = f.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/[^0-9]/g, '').length >= 8;
      if (field) field.classList.toggle('has-error', !ok);
      if (err) err.textContent = ok ? '' : (msgs[f.name] || 'Please fill this in.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-error')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
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
  /* back-to-top ring with scroll progress */
  (function () {
    var b = d.createElement('button'); b.type = 'button'; b.className = 'px-top'; b.setAttribute('aria-label', 'Back to top');
    b.innerHTML = '<svg viewBox="0 0 52 52" width="52" height="52" aria-hidden="true"><circle class="px-top__bg" cx="26" cy="26" r="23"/><circle class="px-top__fg" cx="26" cy="26" r="23" stroke-dasharray="144.5" stroke-dashoffset="144.5"/></svg><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" style="position:static;transform:none"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    d.body.appendChild(b); var fg = b.querySelector('.px-top__fg'), t = false;
    function u() { t = false; var h = d.documentElement.scrollHeight - innerHeight, p = h > 0 ? scrollY / h : 0; fg.setAttribute('stroke-dashoffset', (144.5 * (1 - p)).toFixed(1)); b.classList.toggle('is-on', scrollY > innerHeight * 0.8); }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(u); } }, { passive: true }); u();
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' }); });
  })();
  /* clip-path image reveals */
  (function () {
    var els = [].slice.call(d.querySelectorAll(".villas__main, .about__media"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* buttons pull toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".hero .btn, .btn--wa").forEach(function (b) {
      b.classList.add('px-mag');
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();
})();
