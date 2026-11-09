/* Afxentiou Aluminium: hero entrance, header, menu, reveals, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, no waiting for fonts or images */
  var hero = d.querySelector('.hero');
  requestAnimationFrame(function () {
    if (hero) hero.classList.add('is-ready');
  });

  /* Header shrink, hero photo drift, process line */
  var header = d.querySelector('[data-header]');
  var drift = d.querySelector('[data-drift]');
  var steps = d.querySelector('[data-steps]');
  var bar = d.querySelector('[data-progress]');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (!reduce) {
      if (drift && y < window.innerHeight * 1.2) drift.style.transform = 'translate3d(0,' + (y * -0.06).toFixed(1) + 'px,0)';
      if (steps && bar) {
        var r = steps.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.7 - r.top) / r.height;
        bar.parentNode.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Disabled language switch */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') return;
    a.addEventListener('click', function (e) {
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals with above-the-fold guard and stagger */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.transitionDelay = (n++ * 80) + 'ms';
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var svc = d.querySelector('[data-svc]');
  var imgs = d.querySelectorAll('[data-swap]');
  if (svc) {
    var rows = svc.querySelectorAll('.svc__item');
    function show(i) {
      rows.forEach(function (r) { r.classList.toggle('is-on', r.getAttribute('data-i') === i); });
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap') === i); });
    }
    rows.forEach(function (r) {
      r.addEventListener('mouseenter', function () { show(r.getAttribute('data-i')); });
      r.addEventListener('focus', function () { show(r.getAttribute('data-i')); });
    });
    show('0');
  }

  /* Work strip: drag with the mouse, buttons, keyboard via native scroll */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
    function step(dir) {
      var shot = strip.querySelector('.shot');
      var w = shot ? shot.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('[data-form]');
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function check(name) {
      var f = form.elements[name];
      if (!f) return true;
      var v = (f.value || '').trim();
      var ok = true;
      if (name === 'name') ok = v.length > 1;
      if (name === 'phone') ok = v.replace(/[^\d]/g, '').length >= 8;
      if (name === 'email') ok = v === '' || emailRe.test(v);
      if (name === 'project-type') ok = v !== '';
      var wrap = f.closest('.field');
      if (wrap) wrap.classList.toggle('is-bad', !ok);
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    var names = ['name', 'phone', 'email', 'project-type'];
    names.forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener('blur', function () { if (f.value) check(n); });
      if (f) f.addEventListener('change', function () { check(n); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      names.forEach(function (n) { if (!check(n) && !bad) bad = form.elements[n]; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveal, work photos tilt, magnetic accent buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__media","tilt":".strip__track .shot","magnet":".btn--accent"};
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
