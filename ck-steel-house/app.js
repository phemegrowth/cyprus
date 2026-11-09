/* C.K. Steel House Constructions: header, menu, reveals, image swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink + scroll-linked bits, one rAF per frame */
  var header = d.querySelector('.header');
  var stepsWrap = d.querySelector('[data-steps]');
  var ticking = false;
  function onFrame() {
    ticking = false;
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
    if (stepsWrap && !reduce) {
      var r = stepsWrap.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      stepsWrap.style.setProperty('--p', p.toFixed(3));
    }
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  onFrame();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else if (focusBack) {
      burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Language switch is a visible no-op for now */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Scroll reveals with above-the-fold guard and stagger */
  var groups = {};
  d.querySelectorAll('.r').forEach(function (el) {
    var parent = el.parentElement;
    var key = parent ? (parent.__rid || (parent.__rid = Math.random().toString(36).slice(2))) : 'x';
    groups[key] = (groups[key] || 0);
    el.style.setProperty('--d', Math.min(groups[key], 5) * 80 + 'ms');
    groups[key]++;
  });
  var items = d.querySelectorAll('.r');
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

  /* Services: hover / focus image swap */
  var swapImgs = d.querySelectorAll('[data-swap]');
  var swapCap = d.querySelector('[data-swap-cap]');
  var svcItems = d.querySelectorAll('[data-swap-to]');
  function activate(item) {
    var i = item.getAttribute('data-swap-to');
    swapImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === i); });
    svcItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
    if (swapCap) swapCap.textContent = item.getAttribute('data-cap');
  }
  svcItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () { activate(item); });
    item.addEventListener('focus', function () { activate(item); });
    item.addEventListener('click', function () { activate(item); });
  });
  if (svcItems[0]) svcItems[0].classList.add('is-active');
  /* On touch screens, swap as each item scrolls to the middle */
  if ('IntersectionObserver' in window && window.matchMedia('(hover: none)').matches) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    svcItems.forEach(function (x) { sio.observe(x); });
  }

  /* Horizontal drag strip */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var bar = strip.querySelector('[data-progress]');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (!track) return;
    function progress() {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      bar.style.transform = 'scaleX(' + (0.15 + p * 0.85).toFixed(3) + ')';
    }
    function step(dir) {
      var tile = track.querySelector('.tile');
      var w = tile ? tile.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', progress, { passive: true });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-drag');
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    progress();
    window.addEventListener('resize', progress);
  });

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()]{6,}$/.test(field.value.trim())) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.type === 'hidden' || f.name === 'bot-field') return;
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f) && !firstBad) firstBad = f;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') return;
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });
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
