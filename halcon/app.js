/* Halcon Estate Agent: header, menu, hero reel, reveals, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var wide = window.matchMedia('(min-width: 761px)');

  /* Load state: starts the headline lines and the reel cards */
  function loaded() { d.documentElement.classList.add('is-loaded'); }
  requestAnimationFrame(function () { requestAnimationFrame(loaded); });

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  function onHead() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onHead, { passive: true });
  onHead();

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
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero reel: drifts left as the page scrolls through the hero (transform only, no scroll-jacking) */
  var hero = d.querySelector('[data-hero]');
  var reel = d.querySelector('[data-reel]');
  var track = d.querySelector('[data-track]');
  var heroTicking = false;
  function heroFrame() {
    heroTicking = false;
    if (!hero || !reel || !track) return;
    if (!wide.matches || reduce) { track.style.setProperty('--x', '0px'); return; }
    var rect = hero.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    if (total <= 0) return;
    var p = Math.min(1, Math.max(0, -rect.top / total));
    var eased = 1 - Math.pow(1 - p, 2);
    var room = track.scrollWidth - reel.clientWidth + 24;
    if (room < 0) room = 0;
    track.style.setProperty('--x', (-eased * room).toFixed(1) + 'px');
  }
  function onHeroScroll() { if (!heroTicking) { heroTicking = true; requestAnimationFrame(heroFrame); } }
  if (hero && track) {
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    window.addEventListener('resize', onHeroScroll);
    heroFrame();
  }

  /* What we do: the photo swaps with the item under the pointer or focus */
  var swapList = d.querySelector('[data-swap]');
  var swapImgs = d.querySelectorAll('.swap__img');
  if (swapList && swapImgs.length) {
    var sItems = swapList.querySelectorAll('.slist__item');
    function activate(item) {
      var i = parseInt(item.getAttribute('data-img'), 10) || 0;
      sItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
      swapImgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
    }
    sItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () { activate(item); });
      item.addEventListener('focusin', function () { activate(item); });
      item.addEventListener('touchstart', function () { activate(item); }, { passive: true });
    });
  }

  /* Homes strip: drag with the pointer, arrows step one card */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var dtrack = strip.querySelector('[data-drag]');
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    var down = false, startX = 0, startLeft = 0, moved = false;
    function cardW() { var c = dtrack.querySelector('.pcard'); return c ? c.getBoundingClientRect().width + 20 : 360; }
    function step(dir) { dtrack.scrollBy({ left: dir * cardW(), behavior: reduce ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    dtrack.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = false; startX = e.clientX; startLeft = dtrack.scrollLeft;
      dtrack.setPointerCapture(e.pointerId);
    });
    dtrack.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) { moved = true; dtrack.classList.add('is-dragging'); }
      if (moved) dtrack.scrollLeft = startLeft - dx;
    });
    function up() {
      if (!down) return;
      down = false;
      setTimeout(function () { dtrack.classList.remove('is-dragging'); }, 30);
    }
    dtrack.addEventListener('pointerup', up);
    dtrack.addEventListener('pointercancel', up);
    dtrack.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  }

  /* Process: the line draws as the steps scroll through, each step lights when the line reaches it */
  var steps = d.querySelector('[data-steps]');
  var line = d.querySelector('[data-line]');
  var stepTicking = false;
  function stepFrame() {
    stepTicking = false;
    if (!steps || !line) return;
    var rect = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var start = vh * 0.85;
    var end = Math.max(1, rect.height + vh * 0.35);
    var p = Math.min(1, Math.max(0, (start - rect.top) / end));
    if (reduce) p = 1;
    line.style.setProperty('--p', p.toFixed(3));
    var list = steps.querySelectorAll('.step');
    list.forEach(function (s, i) { s.classList.toggle('is-lit', p >= (i + 0.5) / list.length || p >= 0.98); });
  }
  function onStepScroll() { if (!stepTicking) { stepTicking = true; requestAnimationFrame(stepFrame); } }
  if (steps && line) {
    window.addEventListener('scroll', onStepScroll, { passive: true });
    window.addEventListener('resize', onStepScroll);
    stepFrame();
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
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
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
})({"progress": true, "clip": ".about__photo", "tilt": ".pcard", "magnet": ".hero .btn"});
