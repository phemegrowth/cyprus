/* Enigma Construction (Cyprus): header, menu, hero reveal and parallax, reveals, service swap,
   progress line, form validation, anchors, year. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduce = mq.matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onHeader() {
    if (header) header.classList.toggle('is-small', window.scrollY > 32);
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
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (menu.classList.contains('is-open')) setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* Hero: line reveal on load, then slow parallax of the tall photo */
  var hero = d.querySelector('.hero') || d.querySelector('.thanks');
  if (hero) {
    var arm = function () { hero.classList.add('is-loaded'); };
    if (reduce) { arm(); }
    else { window.requestAnimationFrame(function () { window.requestAnimationFrame(arm); }); }
  }
  var heroImg = d.querySelector('.hero__img');
  var heroFrame = d.querySelector('.hero__frame');
  if (heroImg && !reduce) {
    var ticking = false;
    function parallax() {
      ticking = false;
      var y = window.scrollY;
      var h = window.innerHeight;
      if (y > h * 1.3) return;
      /* The photo moves at a quarter of the page speed, so it lags behind the text. */
      heroImg.style.transform = 'translate3d(0,' + (y * 0.22) + 'px,0) scale(1.12)';
      if (heroFrame) heroFrame.style.transform = 'translate3d(0,' + (y * -0.06) + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(parallax); }
    }, { passive: true });
    parallax();
  }

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el, i) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.querySelectorAll(':scope > .r'), el) : 0;
      el.style.transitionDelay = (Math.max(sib, 0) % 8) * 70 + 'ms';
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the large photo */
  var swap = d.querySelector('[data-swap]');
  var photos = d.querySelectorAll('.svc__photos img');
  if (swap && photos.length) {
    var rows = swap.querySelectorAll('.svc__item');
    function show(i) {
      rows.forEach(function (r, k) { r.classList.toggle('is-active', k === i); });
      photos.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
    }
    rows.forEach(function (r, i) {
      r.setAttribute('tabindex', '0');
      r.addEventListener('mouseenter', function () { show(i); });
      r.addEventListener('focus', function () { show(i); });
      r.addEventListener('click', function () { show(i); });
    });
    /* On phones, where there is no hover, the active row follows the scroll. */
    if ('IntersectionObserver' in window && !window.matchMedia('(hover: hover)').matches) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) show(Array.prototype.indexOf.call(rows, en.target));
        });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      rows.forEach(function (r) { sio.observe(r); });
    }
  }

  /* Process: the line draws as the steps scroll through the viewport */
  var steps = d.querySelector('[data-steps]');
  var fill = d.querySelector('[data-fill]');
  if (steps && fill) {
    if (reduce) { fill.style.transform = 'none'; }
    else {
      var pt = false;
      function draw() {
        pt = false;
        var rect = steps.getBoundingClientRect();
        var h = window.innerHeight;
        var p = (h * 0.8 - rect.top) / (rect.height);
        p = Math.max(0, Math.min(1, p));
        fill.style.transform = 'scaleX(' + p + ')';
        fill.style.setProperty('--p', p);
      }
      window.addEventListener('scroll', function () {
        if (!pt) { pt = true; window.requestAnimationFrame(draw); }
      }, { passive: true });
      window.addEventListener('resize', draw);
      draw();
    }
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
      f.addEventListener('change', function () { check(f); });
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
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });

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
  watch(clips, function (el) { el.classList.add('pz-on'); });

  /* Scale-in reveals (whole blocks) */
  var scales = $$(cfg.scale).filter(function (el) { return !inView(el); });
  scales.forEach(function (el) { el.classList.add('pz-scale'); });
  watch(scales, function (el) { el.classList.add('pz-on'); });

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
})({"progress": true, "heroClip": ".hero__photo", "clip": ".gallery .tile", "magnet": ".hero__actions .btn", "tilt": "", "count": ""});

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
