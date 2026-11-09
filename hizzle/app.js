/* Hizzle home: curtain entrance, header, menu, reveals, accordion with photo swap, drag strip,
   progress line, parallax, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance (mechanic H: curtain). Starts on the first frame, no wait for fonts or images. */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  });
  var curtain = d.querySelector('.curtain');
  if (curtain) {
    var removeCurtain = function () { if (curtain.parentNode) curtain.parentNode.removeChild(curtain); };
    curtain.addEventListener('transitionend', function (e) { if (e.target === curtain) removeCurtain(); });
    setTimeout(removeCurtain, reduce ? 0 : 1400);
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBurger) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (focusBurger) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        return;
      }
      var target = id.length > 1 ? d.querySelector(id) : null;
      if (!target) return;
      e.preventDefault();
      var h = header ? header.getBoundingClientRect().height : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - h - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, with a stagger inside each parent */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentNode;
    var i = groups.get(p) || 0;
    el.style.setProperty('--rd', (Math.min(i, 5) * 0.08) + 's');
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Accordion with height animation and photo swap */
  var accs = d.querySelectorAll('.acc');
  var photo = d.querySelector('.services__img');
  var swapT;
  function swapTo(src) {
    if (!photo || !src || photo.getAttribute('src') === src) return;
    if (reduce) { photo.src = src; return; }
    photo.classList.add('is-swapping');
    clearTimeout(swapT);
    swapT = setTimeout(function () {
      photo.src = src;
      photo.classList.remove('is-swapping');
    }, 300);
  }
  accs.forEach(function (acc, i) {
    var btn = acc.querySelector('.acc__btn');
    if (!btn) return;
    if (btn.getAttribute('aria-expanded') === 'true') acc.classList.add('is-open');
    btn.addEventListener('click', function () {
      var open = !acc.classList.contains('is-open');
      accs.forEach(function (o) {
        o.classList.remove('is-open');
        var b = o.querySelector('.acc__btn'); if (b) b.setAttribute('aria-expanded', 'false');
      });
      if (open) { acc.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); swapTo(acc.getAttribute('data-img')); }
    });
    acc.addEventListener('mouseenter', function () { swapTo(acc.getAttribute('data-img')); });
    btn.addEventListener('focus', function () { swapTo(acc.getAttribute('data-img')); });
  });

  /* Horizontal strip: drag, arrows, progress */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var fill = strip.querySelector('.strip__fill');
    if (!track) return;
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 24 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    function progress() {
      if (!fill) return;
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      fill.style.transform = 'scaleX(' + (0.15 + p * 0.85) + ')';
    }
    track.addEventListener('scroll', progress, { passive: true });
    progress();
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* Scroll-linked: progress line on the steps, slow parallax on the about photo */
  var steps = d.querySelector('[data-progress]');
  var stepsFill = steps ? steps.querySelector('.steps__fill') : null;
  var para = d.querySelector('.about__mask img');
  var ticking = false;
  function onScrollFx() {
    ticking = false;
    var vh = window.innerHeight;
    if (stepsFill && !reduce) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.6 - r.top) / r.height;
      stepsFill.style.transform = 'scaleY(' + Math.max(0, Math.min(1, p)) + ')';
    }
    if (para && !reduce) {
      var pr = para.parentNode.getBoundingClientRect();
      if (pr.bottom > 0 && pr.top < vh) {
        var q = (pr.top + pr.height / 2 - vh / 2) / vh;
        para.style.transform = 'translateY(' + (-6.5 + q * -8) + '%)';
      }
    }
  }
  window.addEventListener('scroll', function () {
    onScrollHeader();
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); }
  }, { passive: true });
  onScrollHeader();
  onScrollFx();

  /* Form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email address.'; },
      'looking-to': function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length >= 5 ? '' : 'A few words about what you need, please.'; }
    };
    function check(input) {
      var fn = rules[input.name];
      if (!fn) return true;
      var msg = fn(input.value);
      var field = input.closest('.field');
      var err = field ? field.querySelector('.field__err') : null;
      if (field) field.classList.toggle('is-bad', !!msg);
      if (err) err.textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field.is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el)) { ok = false; if (!firstBad) firstBad = el; }
      });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
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
})({"progress": true, "heroClip": ".hero__frame", "clip": ".about__photo, .how__photo", "spot": "", "tilt": ".homes .card"});
