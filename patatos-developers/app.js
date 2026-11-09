/* Pantelis Patatos Developers: hero entrance, header, menu, reveals, service swap, drag strip, progress line, count-up, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js-on');

  /* Hero entrance: starts on the first frame, no waiting for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) { hero.classList.add('is-go'); }
    else { requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-go'); }); }); }
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
    root.classList.toggle('is-past', window.scrollY > window.innerHeight * 0.5);
  }
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
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href').slice(1);
      var target = id ? d.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = id === 'top' ? 0 : target.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals with stagger; anything already on screen shows at once */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', (i * 0.08).toFixed(2) + 's');
    groups.set(p, i + 1);
  });
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

  /* Service list: hover or focus swaps the photo */
  var swapImgs = d.querySelectorAll('[data-swap]');
  var swapItems = d.querySelectorAll('[data-swap-to]');
  function swapTo(n) {
    swapImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === n); });
    swapItems.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-swap-to') === n); });
  }
  swapItems.forEach(function (li) {
    var n = li.getAttribute('data-swap-to');
    li.addEventListener('mouseenter', function () { swapTo(n); });
    li.addEventListener('focus', function () { swapTo(n); });
    li.addEventListener('click', function () { swapTo(n); });
  });
  if (swapItems.length) swapTo('0');

  /* Drag strip with buttons */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var section = strip.closest('section');
    var prev = section.querySelector('[data-prev]');
    var next = section.querySelector('[data-next]');
    function step(dir) {
      var card = strip.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 380;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { strip.classList.remove('is-drag'); }, moved ? 40 : 0);
    });
  });

  /* Progress line draws with scroll */
  var steps = d.querySelector('[data-progress]');
  var line = steps ? steps.querySelector('.steps__line span') : null;
  if (steps && line && !reduce) {
    var ticking = false;
    function draw() {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      line.style.setProperty('--p', p.toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  }

  /* Count-up (years in business only) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = end; return; }
    el.textContent = '0';
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      o.disconnect();
      var t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var k = Math.min(1, (t - t0) / dur);
        k = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(end * k);
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = {
      name: 'Please write your name.',
      phone: 'Please add a phone number we can call.',
      email: 'Please add a valid email address.',
      interest: 'Please choose one option.',
      message: 'Please write a short message.'
    };
    function check(f) {
      var wrap = f.closest('.field');
      if (!wrap) return true;
      var v = (f.value || '').trim();
      var ok = v.length > 0;
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.type === 'tel') ok = v.replace(/[^\d]/g, '').length >= 8;
      wrap.classList.toggle('is-bad', !ok);
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      var err = wrap.querySelector('.err');
      if (err) err.textContent = ok ? '' : (msgs[f.name] || 'Please fill this in.');
      return ok;
    }
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
