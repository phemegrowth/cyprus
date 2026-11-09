/* Interland Estate: hero entrance and parallax, header, menu, reveals, photo swap, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Very tall windows (full-page captures) get the static page: no entrance, everything visible */
  if (w.innerHeight > 1600) { reduce = true; d.documentElement.classList.remove('js'); d.documentElement.classList.add('is-static'); }

  /* Hero entrance: start on the first frame, never wait for fonts or images */
  w.requestAnimationFrame(function () { d.documentElement.classList.add('is-ready'); });

  /* Header shrink + hero parallax (photo moves slower than the page) */
  var header = d.querySelector('.header');
  var par = d.querySelector('[data-par]');
  var parOn = par && !reduce;
  var ticking = false;
  function onScroll() {
    var y = w.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (parOn && y < w.innerHeight * 1.4) {
      par.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }
    progress();
    ticking = false;
  }
  w.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); }
  }, { passive: true });

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
    else if (focusBack) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Language switch: visible no-op until the Greek version exists */
  d.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Scroll reveals with stagger and above-the-fold guard */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement; var i = groups.get(p) || 0;
    el.style.setProperty('--d', (Math.min(i, 5) * 0.08) + 's'); groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < w.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var swaps = d.querySelectorAll('[data-swap]');
  var helpItems = d.querySelectorAll('[data-swap-to]');
  function setSwap(i) {
    swaps.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === i); });
    helpItems.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-swap-to') === i); });
  }
  helpItems.forEach(function (li) {
    var i = li.getAttribute('data-swap-to');
    li.addEventListener('mouseenter', function () { setSwap(i); });
    li.addEventListener('focus', function () { setSwap(i); });
    li.addEventListener('click', function () { setSwap(i); });
  });
  if (helpItems.length) setSwap('0');

  /* Homes strip: drag with the mouse, arrows, keyboard scroll is native */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var section = strip.closest('section');
    var step = function () { var c = strip.querySelector('.card'); return c ? c.getBoundingClientRect().width + 20 : 300; };
    var prev = section.querySelector('[data-prev]'), next = section.querySelector('[data-next]');
    var behave = reduce ? 'auto' : 'smooth';
    if (prev) prev.addEventListener('click', function () { strip.scrollBy({ left: -step(), behavior: behave }); });
    if (next) next.addEventListener('click', function () { strip.scrollBy({ left: step(), behavior: behave }); });
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
    });
    w.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = sl - dx;
    });
    w.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved > 4) e.preventDefault(); }, true);
  });

  /* How it works: line draws with scroll */
  var prog = d.querySelector('[data-progress]');
  function progress() {
    if (!prog) return;
    if (reduce) { prog.style.setProperty('--p', 1); return; }
    var r = prog.getBoundingClientRect();
    var p = (w.innerHeight * 0.85 - r.top) / (r.height + w.innerHeight * 0.35);
    prog.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }
  onScroll();

  /* Form validation */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      'looking-to': function (v) { return v ? '' : 'Please choose one.'; },
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email.'; }
    };
    function check(el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value); var f = el.closest('.field');
      f.classList.toggle('is-bad', !!msg); f.querySelector('.err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n]; if (el && !check(el) && !first) first = el;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
})({"progress": true, "clip": ".help__photo, .about__photo", "spot": ".strip__track", "scale": ".map", "magnet": ".hero .btn"});
