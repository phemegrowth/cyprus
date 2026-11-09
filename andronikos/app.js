/* Andronikos Constructions: header, menu, anchors, reveals, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
  }
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
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* Smooth anchors with header offset */
  function headerH() { return header ? header.getBoundingClientRect().height : 0; }
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var el = d.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - headerH() + 1;
      if (id === 'top') top = 0;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', '#' + id);
    });
  });

  /* Scroll reveals, staggered inside each batch */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var i = 0;
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.transitionDelay = (i * 70) + 'ms';
        en.target.classList.add('is-in');
        io.unobserve(en.target);
        i++;
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); }
      else { io.observe(el); }
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Progress line in the process section */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if ('IntersectionObserver' in window && !reduce) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { steps.classList.add('is-drawn'); sio.disconnect(); }
        });
      }, { threshold: 0.25 });
      sio.observe(steps);
    } else {
      steps.classList.add('is-drawn');
    }
  }

  /* Work strip: buttons and pointer drag */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var work = strip.closest('section') || d;
    var prev = work.querySelector('[data-prev]');
    var next = work.querySelector('[data-next]');
    if (!track) return;
    function step(dir) {
      var tile = track.querySelector('.tile');
      var w = tile ? tile.getBoundingClientRect().width + 12 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      strip.classList.add('is-dragging');
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    function up() { down = false; strip.classList.remove('is-dragging'); }
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* Marquee: duplicate once more if the viewport is wider than one track */
  var mq = d.querySelector('[data-marquee]');
  if (mq) {
    var tr = mq.querySelector('.marquee__track');
    if (tr && tr.getBoundingClientRect().width < window.innerWidth) {
      var c1 = tr.cloneNode(true), c2 = tr.cloneNode(true);
      c1.setAttribute('aria-hidden', 'true'); c2.setAttribute('aria-hidden', 'true');
      mq.appendChild(c1); mq.appendChild(c2);
    }
  }

  /* Form validation */
  var form = d.querySelector('form.form');
  if (form) {
    var fields = form.querySelectorAll('[required]');
    function msgFor(el) {
      var v = el.value.trim();
      if (!v) return 'Please fill this in.';
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email does not look right.';
      if (el.type === 'tel' && v.replace(/\D/g, '').length < 8) return 'Please give a full phone number.';
      return '';
    }
    function check(el) {
      var wrap = el.closest('.field');
      var out = wrap ? wrap.querySelector('.field__msg') : null;
      var m = msgFor(el);
      if (wrap) wrap.classList.toggle('is-bad', !!m);
      if (out) out.textContent = m;
      el.setAttribute('aria-invalid', m ? 'true' : 'false');
      return !m;
    }
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      fields.forEach(function (el) { if (!check(el)) { ok = false; if (!firstBad) firstBad = el; } });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  }

  /* Footer year */
  var y = d.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveals, work tiles tilt, magnetic hero buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__photo","tilt":".strip__track .tile","magnet":".hero .btn"};
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
