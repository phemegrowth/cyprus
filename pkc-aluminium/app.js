/* PKC Aluminium: entrance, header, menu, reel drift, reveals, door swap, drag strip, process rail, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* Hero entrance: starts on the first frame, does not wait for fonts or images */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  });

  /* Footer year */
  var y = d.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());

  /* Header shrink */
  var header = d.getElementById('header');
  function onHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (focusBack) burger.focus();
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
      if (id.length < 2) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Reel drifts left as the page scrolls (transform only) */
  var reel = d.querySelector('[data-reel]');
  var hero = d.querySelector('.hero');

  /* Process rail draws as the section scrolls past */
  var steps = d.querySelector('[data-steps]');
  var fill = d.querySelector('[data-fill]');
  var mqPhone = window.matchMedia('(max-width: 720px)');

  var ticking = false;
  function frame() {
    ticking = false;
    onHeader();
    var vh = window.innerHeight;
    if (reel && hero && !reduce) {
      var hb = hero.getBoundingClientRect();
      if (hb.bottom > 0) {
        var shift = Math.min(Math.max(-hb.top, 0), hb.height) * (mqPhone.matches ? 0.5 : 0.4);
        reel.style.transform = 'translate3d(' + (-shift).toFixed(1) + 'px,0,0)';
      }
    }
    if (steps && fill && !reduce) {
      var sb = steps.getBoundingClientRect();
      var p = (vh * 0.85 - sb.top) / (sb.height + vh * 0.35);
      p = Math.min(Math.max(p, 0), 1);
      fill.style.transform = mqPhone.matches ? 'scaleY(' + p.toFixed(3) + ')' : 'scaleX(' + p.toFixed(3) + ')';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Scroll reveals, staggered; anything already on screen shows at once */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  items.forEach(function (el) {
    var sib = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('r'); }) : [];
    var i = sib.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Door list: hover or focus swaps the photo */
  var doors = d.querySelector('.doors');
  if (doors) {
    var imgs = doors.querySelectorAll('[data-swap]');
    var rows = doors.querySelectorAll('.dlist__item');
    function activate(i) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap') === String(i)); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-index') === String(i)); });
      doors.setAttribute('data-active', String(i));
    }
    rows.forEach(function (r) {
      var i = r.getAttribute('data-index');
      r.addEventListener('mouseenter', function () { activate(i); });
      r.addEventListener('focus', function () { activate(i); });
      r.addEventListener('click', function () { activate(i); });
    });
    activate(0);
  }

  /* Work strip: drag with the mouse, arrows step one tile */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, startX = 0, startL = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    function step(dir) {
      var t = strip.querySelector('.tile');
      var w = t ? t.getBoundingClientRect().width + 16 : 360;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-pkc-aluminium"]');
  if (form) {
    var rules = {
      'project-type': function (v) { return v ? '' : 'Choose what you need.'; },
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()]{6,}$/.test(v.trim()) ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about the door, please.'; }
    };
    function check(el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var field = el.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      if (field) field.classList.toggle('has-err', !!msg);
      if (err) err.textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-err')) check(el); });
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

  /* Polish: warm LED light follows the cursor over the work row (desktop mouse only) */
  var work = document.querySelector('.work'), glow = document.querySelector('.work__glow');
  if (work && glow && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var gx = 0, gy = 0, raf = 0;
    work.addEventListener('pointermove', function (e) {
      var r = work.getBoundingClientRect(); gx = e.clientX - r.left; gy = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(function () { raf = 0; glow.style.transform = 'translate(' + gx + 'px,' + gy + 'px)'; });
      work.classList.add('is-glow');
    });
    work.addEventListener('pointerleave', function () { work.classList.remove('is-glow'); });
  }
})();
