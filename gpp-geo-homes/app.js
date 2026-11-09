/* G.P.P Geo Homes: header, menu, reveals, hero reel drift, drag strip, steps line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.getElementById('header');
  function onHeader() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
  }
  window.addEventListener('scroll', onHeader, { passive: true });
  onHeader();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* EN / EL switch is a visible no-op for now */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  function headerH() { return header ? header.getBoundingClientRect().height : 0; }
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var el = d.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - headerH() - 8;
      if (id === 'top') top = 0;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', '#' + id);
    });
  });

  /* Scroll reveals: anything already in view shows at once, the rest is observed */
  var items = d.querySelectorAll('.r');
  function stagger() {
    /* siblings that reveal together get 70ms steps */
    var groups = new Map();
    items.forEach(function (el) {
      var key = el.parentNode || d.body;
      var n = groups.get(key) || 0;
      el.style.setProperty('--d', (Math.min(n, 6) * 70) + 'ms');
      groups.set(key, n + 1);
    });
  }
  if ('IntersectionObserver' in window && !reduce) {
    stagger();
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

  /* Steps line draws when the list enters */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if ('IntersectionObserver' in window && !reduce) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { steps.classList.add('is-in'); so.disconnect(); }
        });
      }, { threshold: 0.2 });
      so.observe(steps);
    } else {
      steps.classList.add('is-in');
    }
  }

  /* Hero reel: drifts left as the page scrolls (transform only) */
  var reel = d.querySelector('[data-reel]');
  var track = reel ? reel.querySelector('.reel__track') : null;
  if (reel && track && !reduce) {
    var ticking = false;
    function moveReel() {
      ticking = false;
      var y = window.scrollY;
      var max = Math.max(0, track.scrollWidth - reel.clientWidth + 32);
      var limit = reel.getBoundingClientRect().height + window.innerHeight;
      var x = Math.min(max, (y / limit) * max * 1.4);
      track.style.transform = 'translate3d(' + (-x) + 'px, 0, 0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(moveReel); }
    }, { passive: true });
    window.addEventListener('resize', moveReel);
    moveReel();
  }

  /* Houses strip: buttons and drag to scroll */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var sec = strip.closest('section') || d;
    var prev = sec.querySelector('[data-prev]');
    var next = sec.querySelector('[data-next]');
    function step(dir) {
      var card = strip.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    var down = false, startX = 0, startL = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = strip.scrollLeft;
      strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; strip.classList.remove('is-drag');
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-gpp-geo-homes"]');
  if (form) {
    function msgFor(input) {
      var field = input.closest('.field');
      return field ? field.querySelector('.field__msg') : null;
    }
    function check(input) {
      var field = input.closest('.field');
      var msg = msgFor(input);
      var v = input.value.trim();
      var text = '';
      if (!v) text = 'Please fill this in.';
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) text = 'That email does not look right.';
      else if (input.type === 'tel' && v.replace(/\D/g, '').length < 8) text = 'Please add a phone number we can call.';
      if (field) field.classList.toggle('is-bad', !!text);
      if (msg) msg.textContent = text;
      return !text;
    }
    var inputs = form.querySelectorAll('[required]');
    inputs.forEach(function (i) {
      i.addEventListener('blur', function () { check(i); });
      i.addEventListener('input', function () { if (i.closest('.field') && i.closest('.field').classList.contains('is-bad')) check(i); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      inputs.forEach(function (i) { if (!check(i)) { ok = false; if (!first) first = i; } });
      if (!ok) { e.preventDefault(); if (first) first.focus(); }
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
})({"progress": true, "clip": ".about__photo", "tilt": ".strip .card", "magnet": ".hero .btn"});
