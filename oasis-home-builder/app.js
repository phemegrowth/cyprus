/* Oasis Home Builder: hero entrance, reel drift, header, menu, reveals, count-up, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: starts on the first frame, does not wait for fonts or images */
  if (reduce) {
    root.classList.add('is-go', 'is-settled');
  } else {
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-go'); });
    });
    setTimeout(function () { root.classList.add('is-settled'); }, 1700);
  }

  /* Reel drifts left as the page scrolls (transform only) */
  var reel = d.querySelector('[data-drift]');
  var header = d.querySelector('.header');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (reel && !reduce) {
      var max = Math.max(0, reel.scrollWidth - window.innerWidth + 48);
      var x = Math.min(max, y * 0.45);
      reel.style.setProperty('--drift', (-x) + 'px');
    }
    progress();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (focusBack) { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (header ? header.offsetHeight : 64) + 8;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Count-up (quantities only) */
  function countUp(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !end) { el.textContent = end; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* Scroll reveals, staggered per group; anything already in view shows at once */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', (Math.min(i, 6) * 0.08) + 's');
    groups.set(p, i + 1);
  });
  function show(el) {
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(countUp);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var swaps = d.querySelectorAll('.swap__img');
  d.querySelectorAll('[data-swap-to]').forEach(function (li) {
    function on() {
      var n = li.getAttribute('data-swap-to');
      swaps.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === n); });
      d.querySelectorAll('[data-swap-to]').forEach(function (o) { o.classList.toggle('is-active', o === li); });
    }
    li.addEventListener('mouseenter', on);
    li.addEventListener('focus', on);
  });

  /* Drag to scroll the work strip (mouse); touch and trackpad scroll natively */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  /* Process line draws as the section scrolls past */
  var steps = d.querySelector('[data-progress]');
  function progress() {
    if (!steps) return;
    if (reduce) { steps.style.setProperty('--p', 1); return; }
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (vh * 0.5);
    steps.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }
  frame();

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-oasis-home-builder"]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+0-9 ()]{8,}$/.test(v.trim()) ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A line or two about the plot or the house helps.'; }
    };
    function check(el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var box = el.closest('.field');
      if (box) {
        box.classList.toggle('is-bad', !!msg);
        var out = box.querySelector('.field__err');
        if (out) out.textContent = msg;
      }
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el) && !first) first = el;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
  /* Polish 2 Nov: house cards tilt gently toward the pointer (fine pointers only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.card').forEach(function (c) {
      var img = c.querySelector('.card__img');
      if (!img) return;
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = 'perspective(900px) rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg)';
      });
      c.addEventListener('pointerleave', function () { img.style.transform = ''; });
    });
  }
})();
