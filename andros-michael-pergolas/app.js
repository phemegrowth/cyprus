/* Andros Michael, Pergolas: header, menu, count-up, reveals, image swap, drag strip, step line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ?shot=1 shows the settled state, for review screenshots only */
  if (/[?&]shot=1/.test(location.search)) { d.documentElement.classList.add('is-shot'); reduce = true; }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Hero count-up: 0.0 to 5.0 (the Google rating), starts on the first frame */
  var num = d.querySelector('[data-count]');
  if (num && !reduce) {
    var target = parseFloat(num.getAttribute('data-count'));
    var dur = 1300, t0 = null;
    num.textContent = '0.0';
    var tick = function (t) {
      if (t0 === null) t0 = t;
      var p = Math.max(0, Math.min(1, (t - t0) / dur));
      var e = 1 - Math.pow(1 - p, 3);
      num.textContent = (target * e).toFixed(1);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(function (t) { t0 = t + 150; requestAnimationFrame(tick); });
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (refocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var y = id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Scroll reveals, with above-the-fold guard */
  var items = d.querySelectorAll('.r');
  d.querySelectorAll('.make__list li').forEach(function (li, i) { li.style.setProperty('--i', i % 4); });
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

  /* What he makes: hover or scroll swaps the photo */
  var frame = d.querySelector('.make__frame');
  var rows = d.querySelectorAll('.make__list li');
  function show(li) {
    rows.forEach(function (r) { r.classList.toggle('is-active', r === li); });
    if (!frame) return;
    var key = li.getAttribute('data-show');
    frame.querySelectorAll('img').forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-key') === key); });
  }
  rows.forEach(function (li) {
    li.addEventListener('mouseenter', function () { show(li); });
  });
  if ('IntersectionObserver' in window && rows.length) {
    var mid = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) show(en.target); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    rows.forEach(function (li) { mid.observe(li); });
  }

  /* Work strip: drag with the mouse, buttons */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var step = function () { var s = track.querySelector('.shot'); return s ? s.getBoundingClientRect().width + 16 : 400; };
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      moved = Math.abs(e.clientX - sx);
      track.scrollLeft = sl - (e.clientX - sx);
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; track.classList.remove('is-drag');
    });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); }
    });
  });

  /* How it runs: the line draws with scroll */
  var line = d.querySelector('.steps__line span');
  var how = d.querySelector('.how');
  if (line && how) {
    if (reduce) { line.style.transform = 'scaleX(1)'; }
    else {
      var ticking = false;
      var draw = function () {
        ticking = false;
        var r = how.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh - r.top) / (vh * 0.4 + r.height * 0.6);
        p = Math.max(0, Math.min(1, p));
        line.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
      draw();
    }
  }

  /* Form validation */
  var form = d.querySelector('form.form');
  if (form) {
    var msgs = {
      name: 'Please write your name.',
      phone: 'Please add a phone number so Andros can call you back.',
      email: 'Please add a valid email address.',
      'project-type': 'Please choose what you need.',
      message: 'A few words about the job, please.'
    };
    var check = function (el) {
      var f = el.closest('.field'); if (!f) return true;
      var err = f.querySelector('.err');
      var v = el.value.trim();
      var bad = !v;
      if (!bad && el.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!bad && el.type === 'tel') bad = v.replace(/\D/g, '').length < 8;
      f.classList.toggle('is-bad', bad);
      el.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (err) err.textContent = bad ? (msgs[el.name] || 'Please fill this in.') : '';
      return !bad;
    };
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      fields.forEach(function (el) { if (!check(el)) { ok = false; if (!firstBad) firstBad = el; } });
      if (!ok) { e.preventDefault(); firstBad.focus(); }
    });
  }
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveals, work photos tilt, magnetic hero button. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__photo, .make__media","tilt":".strip__track .shot","magnet":".hero .btn"};
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
    var $$ = function (s) { return s ? Array.prototype.slice.call(document.querySelectorAll(s)) : []; };

    /* Scroll progress line under the header */
    if (cfg.progress) {
      var bar = document.createElement('div');
      bar.className = 'pg-progress'; bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      var tick = false;
      var paint = function () {
        var max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
        tick = false;
      };
      addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true });
      paint();
    }

    if (reduce) return;

    /* Image reveals: a clip-path wipe as each photo enters the screen */
    var clips = $$(cfg.clip);
    if (clips.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pg-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      clips.forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight) return;
        el.classList.add('pg-clip'); io.observe(el);
      });
    }

    if (!fine) return;

    /* Cards tilt a little toward the cursor */
    $$(cfg.tilt).forEach(function (el) {
      el.addEventListener('pointerenter', function () { el.style.transition = 'transform .3s cubic-bezier(.2,.7,.2,1)'; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    /* Buttons pull toward the cursor */
    $$(cfg.magnet).forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transition = 'transform .2s ease-out';
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  })();
