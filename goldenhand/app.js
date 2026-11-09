/* Goldenhand: header, menu, reveals, hero strip drift, service image swap, drag reel, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.remove('no-js');
  d.documentElement.classList.add('js');

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    else if (refocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Disabled language link does nothing */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) + 1;
      window.scrollTo({ top: id === '#top' ? 0 : top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Scroll reveals, staggered within each parent */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--d', n);
    groups.set(p, n + 1);
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

  /* Scroll-linked work: header, hero strip drift, process line */
  var drift = d.querySelector('[data-drift]');
  var steps = d.querySelector('[data-steps]');
  var line = steps ? steps.querySelector('.steps__line span') : null;
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (reduce) { if (line) line.style.setProperty('--p', 1); return; }
    if (drift && y < window.innerHeight * 1.5) {
      drift.style.transform = 'translate3d(' + (-y * 0.35).toFixed(1) + 'px,0,0)';
    }
    if (steps && line) {
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.7 - r.top) / r.height;
      line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Services: hover or focus swaps the photo */
  var svcItems = d.querySelectorAll('[data-svc]');
  var swapImgs = d.querySelectorAll('[data-swap]');
  var cap = d.querySelector('[data-swap-cap]');
  function activate(i) {
    svcItems.forEach(function (el) { el.classList.toggle('is-active', el.getAttribute('data-svc') === String(i)); });
    swapImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === String(i)); });
    var item = d.querySelector('[data-svc="' + i + '"] h3');
    if (cap && item) cap.textContent = item.textContent;
  }
  svcItems.forEach(function (el) {
    var i = el.getAttribute('data-svc');
    el.addEventListener('mouseenter', function () { activate(i); });
    el.addEventListener('focus', function () { activate(i); });
    el.addEventListener('click', function () { activate(i); });
  });

  /* Work reel: arrows and mouse drag */
  var reel = d.querySelector('[data-reel]');
  if (reel) {
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    function step(dir) {
      var card = reel.querySelector('.reel__card');
      var w = card ? card.getBoundingClientRect().width + 16 : 360;
      reel.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    reel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, startX = 0, startLeft = 0, moved = false;
    reel.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = reel.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; reel.classList.add('is-drag'); }
      reel.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { reel.classList.remove('is-drag'); }, 0);
    });
    reel.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  /* Form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can reach you on.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'work-type': function (v) { return v ? '' : 'Please choose the type of work.'; },
      message: function (v) { return v.trim().length > 5 ? '' : 'Please tell us a little about the job.'; }
    };
    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      var field = input.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      if (field) field.classList.toggle('is-bad', !!msg);
      if (err) err.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var input = form.elements[n];
      if (!input) return;
      input.addEventListener('blur', function () { if (input.value) check(input); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-bad')) check(input); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var input = form.elements[n];
        if (input && !check(input)) { ok = false; if (!first) first = input; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* Polish pass (2 Nov 2026): first-impression upgrades. Transform, opacity and clip-path only.
   Reduced motion: none of this runs, everything stays as built. No JS: nothing here applies. */
(function (cfg) {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var $$ = function (s, c) { return s ? Array.prototype.slice.call((c || document).querySelectorAll(s)) : []; };
  var inView = function (el) { var r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
  function watch(els, fn, margin) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { rootMargin: margin || '0px 0px -12% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }
  if (RM) return;
  root.classList.add('pz');

  /* Scroll progress line under the header */
  if (cfg.progress) {
    var bar = document.createElement('div'); bar.className = 'pz-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var tick = false;
    var upd = function () { tick = false; var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0).toFixed(4) + ')'; };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Hero image: clip-path entrance on load */
  $$(cfg.heroClip).forEach(function (el) {
    el.classList.add('pz-hero-clip');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('pz-on'); }); });
  });

  /* Image clip-path reveals on scroll */
  var clips = $$(cfg.clip).filter(function (el) { return !inView(el); });
  clips.forEach(function (el, i) { el.classList.add('pz-clip'); el.style.setProperty('--pz-d', ((i % 4) * 90) + 'ms'); });
  watch(clips, function (el) { el.classList.add('pz-on'); setTimeout(function () { el.classList.remove('pz-clip', 'pz-on'); }, 2000); });

  /* Scale-in reveals (whole blocks) */
  var scales = $$(cfg.scale).filter(function (el) { return !inView(el); });
  scales.forEach(function (el) { el.classList.add('pz-scale'); });
  watch(scales, function (el) { el.classList.add('pz-on'); setTimeout(function () { el.classList.remove('pz-scale', 'pz-on'); }, 1600); });

  /* Line that draws across a row of steps when it comes into view */
  $$(cfg.draw).forEach(function (el) {
    var line = document.createElement('span'); line.className = 'pz-draw'; line.setAttribute('aria-hidden', 'true');
    el.classList.add('pz-draw-host'); el.appendChild(line);
    watch([el], function () { el.classList.add('pz-on'); }, '0px 0px -20% 0px');
  });

  /* Count up numbers that are already on the page (final text is the original text) */
  $$(cfg.count).forEach(function (el) {
    var txt = el.textContent, m = txt.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var end = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length;
    if (end < 2 || (end > 1900 && end < 2100 && !dec)) return;  /* skip years and tiny numbers */
    var run = function () {
      var t0 = null, dur = 1300;
      var step = function (t) {
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + (end * e).toFixed(dec) + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      };
      requestAnimationFrame(step);
    };
    if (inView(el)) { run(); } else { el.textContent = m[1] + (0).toFixed(dec) + m[3]; watch([el], run); }
  });

  if (!FINE) return;

  /* Cards that tilt slightly toward the cursor */
  $$(cfg.tilt).forEach(function (el) {
    el.classList.add('pz-tilt');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* Buttons that pull a little toward the cursor */
  $$(cfg.magnet).forEach(function (el) {
    el.classList.add('pz-magnet');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* Soft light that follows the cursor across the work grid */
  $$(cfg.spot).forEach(function (el) {
    var s = document.createElement('span'); s.className = 'pz-spot'; s.setAttribute('aria-hidden', 'true');
    el.classList.add('pz-spot-host'); el.appendChild(s);
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left - 220) + 'px,' + (e.clientY - r.top - 220) + 'px)';
    });
    el.addEventListener('pointerenter', function () { s.style.opacity = '1'; });
    el.addEventListener('pointerleave', function () { s.style.opacity = '0'; });
  });
})({"progress": true, "clip": ".about__photo", "magnet": ".hero .btn", "spot": ""});

/* Before and after slider */
(function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), function (st) {
    var r = st.querySelector('.ba__range'); if (!r) return;
    var set = function (v) { st.style.setProperty('--pos', v + '%'); };
    r.addEventListener('input', function () { set(r.value); });
    set(r.value);
    var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (RM || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = null; var f = function (t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1600);
        var v = 50 - 22 * Math.sin(p * Math.PI); set(v.toFixed(1)); if (p < 1) requestAnimationFrame(f); else set(r.value); };
      requestAnimationFrame(f);
    }, { threshold: 0.6 });
    io.observe(st);
  });
})();
