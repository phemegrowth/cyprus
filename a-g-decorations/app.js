/* Prospect homepage script: header, menu, hero entrance, scroll motion, reveals, count-up,
   drag strip, progress line, magnetic buttons, form validation, anchors, year. No dependencies. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrinks on scroll */
  var header = d.querySelector('[data-header]');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', w.scrollY > 40); }
  w.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobile menu: opens, closes on link click and on Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Hero entrance starts on the first frame (no waiting for fonts or images) */
  var hero = d.querySelector('[data-hero]');
  if (hero) requestAnimationFrame(function () { hero.classList.add('is-ready'); });

  /* Scroll-linked motion: elements with data-speed move against the scroll (parallax / drift) */
  var movers = [].slice.call(d.querySelectorAll('[data-speed]'));
  var progress = [].slice.call(d.querySelectorAll('[data-progress]'));
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = w.innerHeight;
    movers.forEach(function (el) {
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var s = parseFloat(el.getAttribute('data-speed')) || 0;
      var axis = el.getAttribute('data-axis') || 'y';
      var v = axis === 'x' ? -w.scrollY * s : (r.top + r.height / 2 - vh / 2) * s;
      el.style.transform = axis === 'x' ? 'translate3d(' + v.toFixed(1) + 'px,0,0)' : 'translate3d(0,' + v.toFixed(1) + 'px,0)';
    });
    progress.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      var p = (vh * 0.75 - box.top) / box.height;
      var horiz = box.width > box.height * 2;
      if (horiz) p = (vh * 0.85 - box.top) / (vh * 0.5);
      el.style.transform = (horiz ? 'scaleX(' : 'scaleY(') + Math.max(0, Math.min(1, p)).toFixed(3) + ')';
    });
  }
  if (!reduce && (movers.length || progress.length)) {
    w.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    w.addEventListener('resize', frame);
    frame();
  } else {
    progress.forEach(function (el) { el.style.transform = 'none'; });
  }

  /* Marquee: duplicate items for a seamless loop */
  d.querySelectorAll('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee__track');
    if (!track || reduce) return;
    var html = track.innerHTML;
    track.innerHTML = html + html;
    var all = track.children;
    for (var i = all.length / 2; i < all.length; i++) all[i].setAttribute('aria-hidden', 'true');
  });

  /* Scroll reveals with an above-the-fold guard */
  var items = d.querySelectorAll('.r');
  function showNow(el) { el.classList.add('is-in'); }
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { showNow(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < w.innerHeight) showNow(el); else io.observe(el); });
  } else {
    items.forEach(showNow);
  }

  /* Count-up on sourced quantities only */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    function fmt(v) { return dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US"); }
    if (reduce || !('IntersectionObserver' in w)) { el.textContent = fmt(target); return; }
    var done = false;
    function run() {
      if (done) return; done = true;
      var t0 = null, dur = 1400;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(target * e);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (el.getBoundingClientRect().top < w.innerHeight) { run(); return; }
    var cio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); cio.disconnect(); } }, { threshold: 0.4 });
    cio.observe(el);
  });

  /* Drag-to-scroll strips with arrow buttons */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('[data-strip-track]');
    if (!track) return;
    var prev = strip.querySelector('[data-prev]'), next = strip.querySelector('[data-next]');
    function step(dir) {
      var card = track.firstElementChild;
      var wd = card ? card.getBoundingClientRect().width + 16 : 320;
      track.scrollBy({ left: dir * wd, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    w.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4 && !moved) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = sl - dx;
    });
    w.addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { track.classList.remove('is-dragging'); }, 0); });
  });

  /* Hover image swap (services list with one big photo) */
  d.querySelectorAll('[data-swap]').forEach(function (box) {
    var imgs = box.querySelectorAll('[data-swap-img]'), rows = box.querySelectorAll('[data-swap-key]');
    function pick(k) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap-img') === k); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-swap-key') === k); });
    }
    rows.forEach(function (r) {
      var k = r.getAttribute('data-swap-key');
      r.addEventListener('mouseenter', function () { pick(k); });
      r.addEventListener('focusin', function () { pick(k); });
      r.addEventListener('click', function () { pick(k); });
    });
    if (rows[0]) pick(rows[0].getAttribute('data-swap-key'));
  });

  /* Cursor-following highlight on grids */
  d.querySelectorAll('[data-glow]').forEach(function (g) {
    g.addEventListener('pointermove', function (e) {
      var r = g.getBoundingClientRect();
      g.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      g.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  });

  /* Magnetic buttons (fine pointers only) */
  if (!reduce && w.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(f) {
      var wrap = f.closest('.field');
      if (!wrap) return true;
      var ok = f.checkValidity();
      if (f.name === 'phone' && f.value && !/^[+\d][\d\s()-]{6,}$/.test(f.value)) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, bad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f)) { ok = false; if (!bad) bad = f; }
      });
      if (!ok) { e.preventDefault(); if (bad) bad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      w.scrollTo({ top: t.getBoundingClientRect().top + w.scrollY - 72, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* A.G. Decoration: partition drawing draws on scroll (observe the wrapper, which keeps its own reveal) */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dr = document.querySelector('[data-draw]');
  if (dr) {
    if (reduce || !('IntersectionObserver' in window)) dr.classList.add('is-drawn');
    else {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { dr.classList.add('is-drawn'); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(dr);
    }
  }
  /* Work viewer: thumbnails swap the large photo */
  var v = document.querySelector('[data-viewer]'); if (!v) return;
  var main = v.querySelector('[data-viewer-main]'), cap = v.querySelector('[data-viewer-cap]');
  v.querySelectorAll('[data-src]').forEach(function (b) {
    b.addEventListener('click', function () {
      v.querySelectorAll('[data-src]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      function swap() { main.src = b.getAttribute('data-src'); main.width = +b.getAttribute('data-w'); main.height = +b.getAttribute('data-h'); main.alt = b.getAttribute('data-alt'); cap.textContent = b.getAttribute('data-cap'); main.classList.remove('is-out'); }
      if (reduce) { swap(); return; }
      main.classList.add('is-out'); setTimeout(swap, 220);
    });
  });
})();
