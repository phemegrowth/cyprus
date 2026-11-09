/* Mylordos Industries: entrance, header, menu, reveals, swap list, drag strip, steps line, count-up, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, never wait for fonts or images */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('is-ready'); });
  });

  /* Drift distance for the hero strip: how far the track overflows the screen */
  var track = d.querySelector('.hero__track');
  function setDrift() {
    if (!track) return;
    var over = track.scrollWidth - window.innerWidth;
    track.style.setProperty('--drift', Math.max(0, Math.min(over, 600)) + 'px');
  }
  setDrift();
  window.addEventListener('load', setDrift);
  window.addEventListener('resize', setDrift);

  /* Header shrink */
  var header = d.querySelector('.header');
  var hazard = d.querySelector('.hazard');
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
    if (hazard) {
      var max = d.documentElement.scrollHeight - window.innerHeight;
      hazard.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
    }
    steps();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keepFocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (!keepFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id === '#') return;
      var el = id === '#top' ? d.body : d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var h = header ? header.getBoundingClientRect().height : 0;
      var y = id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - h - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, staggered within each parent; anything on screen at load shows at once */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement, n = groups.get(p) || 0;
    el.style.setProperty('--d', (n * 0.08) + 's');
    groups.set(p, n + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.left < window.innerWidth) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* What we do: hover or focus swaps the photo */
  var list = d.querySelector('[data-swap]');
  if (list) {
    var rows = list.querySelectorAll('.list__row');
    var imgs = d.querySelectorAll('.swap img');
    var cap = d.querySelector('[data-cap]');
    function pick(row) {
      var i = +row.getAttribute('data-img');
      rows.forEach(function (r) { r.classList.toggle('is-on', r === row); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      if (cap) cap.textContent = row.querySelector('.list__t').textContent;
    }
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () { pick(row); });
      row.addEventListener('focus', function () { pick(row); });
      row.addEventListener('click', function () { pick(row); });
    });
  }

  /* Drag strip: mouse drag to scroll sideways (touch and trackpad scroll natively) */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('mousedown', function (e) {
      down = true; moved = false; startX = e.pageX; startLeft = strip.scrollLeft; strip.classList.add('is-down');
    });
    window.addEventListener('mouseup', function () { down = false; strip.classList.remove('is-down'); });
    strip.addEventListener('mousemove', function (e) {
      if (!down) return;
      e.preventDefault();
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = startLeft - dx;
    });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* Steps: the accent line draws across each step as the section scrolls through */
  var stepEls = d.querySelectorAll('.step');
  var stepsBox = d.querySelector('[data-steps]');
  function steps() {
    if (!stepsBox || reduce) return;
    var r = stepsBox.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    p = Math.max(0, Math.min(1, p));
    var n = stepEls.length;
    stepEls.forEach(function (el, i) {
      var local = Math.max(0, Math.min(1, p * n - i));
      el.style.setProperty('--p', local.toFixed(3));
    });
  }
  if (reduce) stepEls.forEach(function (el) { el.style.setProperty('--p', 1); });

  /* Count-up (years registered only) */
  var counters = d.querySelectorAll('[data-count]');
  function countUp(el) {
    var end = +el.getAttribute('data-count');
    if (reduce) { el.textContent = end; return; }
    var t0 = null, dur = 1400;
    function tick(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0';
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      'work-type': function (v) { return v !== ''; },
      message: function (v) { return v.trim().length > 4; }
    };
    function check(field) {
      var ok = rules[field.name](field.value);
      field.closest('.field').classList.toggle('is-bad', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (!f) return;
      var err = form.querySelector('[data-err="' + n + '"]');
      if (err) { err.id = 'err-' + n; f.setAttribute('aria-describedby', err.id); }
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
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
  var y = d.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  onScroll();
})();
