/* ANKAR Construction: header, menu, hero parallax, reveals, swap list, drag strip, count-up, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keepFocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (!keepFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { if (a.getAttribute('aria-disabled') === 'true') e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Hero parallax: the photo moves slower than the page */
  var para = d.querySelector('[data-parallax]');
  var hero = d.querySelector('.hero');
  function onParallax() {
    if (!para || !hero || reduce) return;
    var r = hero.getBoundingClientRect();
    if (r.bottom < 0) return;
    var y = Math.max(-r.top, 0) * 0.22;
    para.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';
  }

  /* Process line draws on scroll */
  var steps = d.querySelector('[data-progress]');
  var fill = steps ? steps.querySelector('.steps__fill') : null;
  function onProgress() {
    if (!steps || !fill || reduce) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    p = Math.min(Math.max(p, 0), 1);
    var vertical = window.matchMedia('(max-width: 760px)').matches;
    fill.style.transform = vertical ? 'scaleY(' + p.toFixed(3) + ')' : 'scaleX(' + p.toFixed(3) + ')';
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () { onHeader(); onParallax(); onProgress(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onHeader(); onParallax(); onProgress();

  /* Scroll reveals, staggered within each parent; anything in view at load shows at once */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  items.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('r'); });
    el.style.setProperty('--d', (sibs.indexOf(el) * 80) + 'ms');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Count-up (years registered only) */
  var counts = d.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !end) { el.textContent = end; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf(step);
    }
    el.textContent = '0';
    raf(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counts.forEach(function (el) { cio.observe(el); });
  }

  /* Services: photo swap on hover, focus and tap; on touch screens the row nearest the middle wins */
  var swapList = d.querySelector('[data-swap]');
  if (swapList) {
    var rows = Array.prototype.slice.call(swapList.querySelectorAll('.svc__item'));
    var imgs = d.querySelectorAll('.swap__img');
    var current = 0;
    function activate(i) {
      if (i === current) return;
      current = i;
      rows.forEach(function (row, n) {
        row.classList.toggle('is-active', n === i);
        var b = row.querySelector('.svc__btn');
        if (b) b.setAttribute('aria-pressed', n === i ? 'true' : 'false');
      });
      imgs.forEach(function (img, n) { img.classList.toggle('is-on', n === i); });
    }
    rows.forEach(function (row, n) {
      row.addEventListener('mouseenter', function () { activate(n); });
      var b = row.querySelector('.svc__btn');
      if (b) { b.addEventListener('focus', function () { activate(n); }); b.addEventListener('click', function () { activate(n); }); }
    });
    if (!window.matchMedia('(hover: hover)').matches && 'IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(rows.indexOf(en.target)); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      rows.forEach(function (row) { sio.observe(row); });
    }
  }

  /* Drag strip with buttons and arrow keys */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    function stepBy(dir) {
      var card = strip.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(-1); }
    });
    var down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-ankar-construction"]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A line or two about the project, please.'; }
    };
    function check(el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var field = el.closest('.field');
      if (field) {
        field.classList.toggle('is-bad', !!msg);
        var err = field.querySelector('.field__err');
        if (err) err.textContent = msg;
      }
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
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

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveals, work cards tilt, magnetic hero buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__media, .build__main","tilt":".strip__track .card","magnet":".hero .btn"};
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
