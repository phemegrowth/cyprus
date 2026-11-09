/* Deherco Metal Constructions: header, menu, reveals, photo swap, drag strip, count-up, form. No dependencies. */
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
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (menu.classList.contains('is-open')) setMenu(false); });
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Scroll reveals: anything already in view shows at once */
  var items = d.querySelectorAll('.r, [data-steps]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Stagger siblings inside a revealed group */
  d.querySelectorAll('.facts, .clist').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 70) + 'ms'; });
  });

  /* Services: hover or focus swaps the photo */
  var swapList = d.querySelector('[data-swap]');
  var swap = d.querySelector('.swap');
  if (swapList && swap) {
    var imgs = swap.querySelectorAll('.swap__img');
    var rows = swapList.querySelectorAll('.slist__item');
    function pick(row) {
      var i = parseInt(row.getAttribute('data-img'), 10) || 0;
      rows.forEach(function (r) { r.classList.toggle('is-active', r === row); });
      imgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
    }
    rows.forEach(function (row) {
      row.addEventListener('mouseenter', function () { pick(row); });
      row.addEventListener('focusin', function () { pick(row); });
    });
    /* On phones there is no hover: light the row nearest the middle of the screen */
    var fine = window.matchMedia('(hover: hover)').matches;
    if (!fine && 'IntersectionObserver' in window) {
      var mid = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) pick(en.target); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      rows.forEach(function (row) { mid.observe(row); });
    }
  }

  /* Work strip: buttons, drag to scroll, progress thumb */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    var thumb = strip.querySelector('.strip__thumb');
    if (!track) return;
    function step(dir) {
      var card = track.querySelector('.strip__item');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    function progress() {
      if (!thumb) return;
      var max = track.scrollWidth - track.clientWidth;
      var frac = max > 0 ? track.scrollLeft / max : 0;
      var visible = Math.max(0.1, track.clientWidth / track.scrollWidth);
      thumb.style.transform = 'scaleX(' + (visible / 0.2) + ') translateX(' + (frac * (1 - visible) / visible * 100) + '%)';
    }
    track.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);
    progress();
    /* Drag with a mouse */
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; track.classList.remove('is-drag'); });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  });

  /* Count-up on sourced figures only */
  var counters = d.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    var start = parseInt(el.getAttribute('data-start'), 10) || 0;
    var t0 = null, dur = 1400;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (end - start) * e);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = end;
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  }

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value)) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true, firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f)) { allOk = false; if (!firstBad) firstBad = f; }
      });
      if (!allOk) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    if (a.getAttribute('aria-disabled') === 'true') { a.addEventListener('click', function (e) { e.preventDefault(); }); return; }
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* Polish pass, 2 Nov 2026: extra motion. Only transform, opacity and clip-path.
   Everything is visible without JS, and reduced motion switches it all off. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in w;
  function onView(els, fn, th) {
    if (!els.length) return;
    if (reduce || !io) { els.forEach(fn); return; }
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } });
    }, { threshold: th || 0.2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { o.observe(el); });
  }
  var $$ = function (s) { return Array.prototype.slice.call(d.querySelectorAll(s)); };

  /* Scroll progress line */
  var bar = d.querySelector('[data-scrollbar]');
  if (bar && !reduce) {
    var tick = false;
    var upd = function () {
      var h = d.documentElement.scrollHeight - w.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, w.scrollY / h) : 0) + ')';
      tick = false;
    };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Clip-path image reveals and line draws */
  /* (observe the parent: a fully clipped element can read as not visible) */
  $$('[data-clip], [data-draw]').forEach(function (el) {
    var host = el.parentElement || el;
    onView([host], function () { el.classList.add('is-shown'); }, 0.1);
  });

  /* Count up (only numbers already printed on the page) */
  onView($$('[data-countup]'), function (el) {
    var to = parseFloat(el.getAttribute('data-countup'));
    var from = parseFloat(el.getAttribute('data-countup-from') || '0');
    if (reduce || isNaN(to)) { el.textContent = el.getAttribute('data-countup-text') || to; return; }
    var t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute('data-countup-text') || to;
    };
    requestAnimationFrame(step);
  }, 0.5);

  if (reduce || !fine) return;

  /* Buttons that pull toward the cursor */
  $$('[data-magnet]').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });

  /* Cards that tilt on hover */
  $$('[data-tilt]').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  /* Highlight that follows the cursor over a grid */
  $$('[data-spot]').forEach(function (g) {
    var s = d.createElement('span'); s.className = 'cursor-spot'; s.setAttribute('aria-hidden', 'true'); g.appendChild(s);
    g.addEventListener('mousemove', function (e) {
      var r = g.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px) translate(-50%,-50%)';
      s.style.opacity = '1';
    });
    g.addEventListener('mouseleave', function () { s.style.opacity = '0'; });
  });
})();
