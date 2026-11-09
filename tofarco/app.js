/* Tofarco: header, menu, hero entrance, reveals, marquee, count-up, scroll lines, parallax and drift, hover image, drag strip, form. No dependencies. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = w.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrinks on scroll */
  var header = d.querySelector('.header');
  function onHeader() { if (header) header.classList.toggle('is-small', w.scrollY > 40); }
  w.addEventListener('scroll', onHeader, { passive: true });
  onHeader();

  /* Mobile menu: closes on link click and Escape */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.documentElement.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  /* Smooth anchor scroll with header offset; disabled links do nothing */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var h = header ? header.offsetHeight : 0;
      w.scrollTo({ top: t.getBoundingClientRect().top + w.scrollY - h + 1, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Hero entrance starts on the first frames, never waits for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) hero.classList.add('is-ready');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });
  }

  /* Count-up numbers (sourced quantities only) */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), suf = el.getAttribute('data-suffix') || '';
    if (reduce || isNaN(end)) { el.textContent = (isNaN(end) ? el.textContent : end) + (isNaN(end) ? '' : suf); return; }
    var t0 = null, dur = Math.min(1800, 900 + end * 4);
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* Scroll reveals; anything already in view shows at once */
  var items = d.querySelectorAll('.reveal, .reveal-clip, [data-count]');
  var io = ('IntersectionObserver' in w && !reduce) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      el.classList.add('is-in');
      if (el.hasAttribute('data-count')) countUp(el);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }) : null;
  var stagger = 0;
  items.forEach(function (el) {
    if (!io) { el.classList.add('is-in'); return; }
    if (el.getBoundingClientRect().top < w.innerHeight && !el.hasAttribute('data-count')) {
      el.style.transitionDelay = (stagger++ * 70) + 'ms';
      el.classList.add('is-in');
      return;
    }
    var prev = el.previousElementSibling, k = 0;
    while (prev && prev.classList && prev.classList.contains('reveal') && k < 6) { k++; prev = prev.previousElementSibling; }
    if (el.classList.contains('reveal')) el.style.transitionDelay = (k * 80) + 'ms';
    io.observe(el);
  });

  /* Marquee: duplicate the list once for a seamless loop */
  d.querySelectorAll('[data-marquee]').forEach(function (m) {
    var list = m.querySelector('.marquee__list');
    if (!list || reduce) return;
    var track = d.createElement('div');
    track.className = 'marquee__track';
    var clone = list.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    list.parentNode.insertBefore(track, list);
    track.appendChild(list);
    track.appendChild(clone);
  });

  /* Scroll-linked effects: progress lines, parallax, horizontal drift */
  var lines = d.querySelectorAll('[data-tl]');
  var para = d.querySelectorAll('[data-parallax]');
  var drift = d.querySelectorAll('[data-drift]');
  var ticking = false;
  function onScrollFx() {
    ticking = false;
    var vh = w.innerHeight;
    lines.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = (vh * 0.75 - r.top) / (r.height || 1);
      el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
    para.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      var f = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -f).toFixed(1) + 'px,0)';
    });
    drift.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var f = parseFloat(el.getAttribute('data-drift')) || 0.25;
      var max = Math.max(0, el.scrollWidth - el.parentElement.clientWidth);
      var x = Math.min(max, Math.max(0, (vh - r.top) * f));
      el.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
    });
  }
  if (!reduce && (lines.length || para.length || drift.length)) {
    w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
    w.addEventListener('resize', onScrollFx);
    onScrollFx();
  } else {
    lines.forEach(function (el) { el.style.setProperty('--p', '1'); });
  }

  /* Project list: image follows the cursor on desktop */
  d.querySelectorAll('[data-plist]').forEach(function (list) {
    var float = list.parentElement.querySelector('.plist__float');
    if (!float || !finePointer || reduce) return;
    var img = float.querySelector('img'), x = 0, y = 0, tx = 0, ty = 0, raf = null;
    function loop() {
      x += (tx - x) * 0.18; y += (ty - y) * 0.18;
      float.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(loop) : null;
    }
    list.addEventListener('mousemove', function (e) {
      tx = e.clientX + 24; ty = e.clientY - 110;
      if (!raf) raf = requestAnimationFrame(loop);
    });
    list.querySelectorAll('[data-img]').forEach(function (row) {
      row.addEventListener('mouseenter', function () { img.src = row.getAttribute('data-img'); float.classList.add('is-on'); });
    });
    list.addEventListener('mouseleave', function () { float.classList.remove('is-on'); });
  });

  /* Hover or tap swaps a side image */
  d.querySelectorAll('[data-swap]').forEach(function (box) {
    var target = d.querySelector(box.getAttribute('data-swap'));
    if (!target) return;
    box.querySelectorAll('[data-img]').forEach(function (it) {
      function go() {
        box.querySelectorAll('[data-img]').forEach(function (o) { o.classList.toggle('is-active', o === it); });
        if (target.getAttribute('src') === it.getAttribute('data-img')) return;
        target.classList.add('is-fading');
        setTimeout(function () { target.src = it.getAttribute('data-img'); target.alt = it.getAttribute('data-alt') || ''; target.classList.remove('is-fading'); }, reduce ? 0 : 220);
      }
      it.addEventListener('mouseenter', go); it.addEventListener('focus', go); it.addEventListener('click', go);
    });
  });

  /* Drag to scroll a strip with the mouse */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-dragging'); });
    w.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 3) moved = true; strip.scrollLeft = sl - dx; });
    w.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-dragging'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
  });

  /* Magnetic buttons on desktop */
  if (finePointer && !reduce) {
    d.querySelectorAll('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form.form');
  if (form) {
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    function msgFor(f) {
      var v = (f.value || '').trim();
      if (!v) return f.tagName === 'SELECT' ? 'Please choose one.' : 'Please fill this in.';
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email does not look right.';
      if (f.type === 'tel' && v.replace(/\D/g, '').length < 8) return 'Please add a phone number we can call.';
      return '';
    }
    function check(f) {
      var field = f.closest('.field'), m = field ? field.querySelector('.field__msg') : null, err = msgFor(f);
      if (field) field.classList.toggle('is-error', !!err);
      f.setAttribute('aria-invalid', err ? 'true' : 'false');
      if (m) m.textContent = err;
      return !err;
    }
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-error')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f; } });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* Hero figure: counts up to the sourced number of years from the first frame (1.3 s) */
(function () {
  var el = document.querySelector('[data-hero-count]');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var end = parseInt(el.getAttribute('data-hero-count'), 10), t0 = null;
  el.textContent = '0';
  function step(t) {
    if (!t0) t0 = t;
    var p = Math.min(1, (t - t0) / 1300), e = 1 - Math.pow(1 - p, 4);
    el.textContent = String(Math.round(end * e));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();
