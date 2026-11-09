/* Alumetal home: entrance, header, menu, reel drift, reveals, accordion, grid glow,
   process line, count-up, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: starts on the first frame, no waiting for fonts or images */
  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  /* Footer year */
  var y = d.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  /* Reel drift: the photo row moves left as the page scrolls past the hero */
  var reel = d.querySelector('[data-reel]');
  var hero = d.querySelector('[data-hero]');
  var ticking = false;
  function frame() {
    ticking = false;
    var sy = window.scrollY;
    if (header) header.classList.toggle('is-small', sy > 40);
    if (reel && hero && !reduce) {
      var h = hero.offsetHeight;
      if (sy < h * 1.2) {
        var k = window.innerWidth < 760 ? 0.5 : 0.42;
        reel.style.transform = 'translate3d(' + (-sy * k).toFixed(1) + 'px,0,0)';
      }
    }
    lineProgress();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  /* Process line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var line = d.querySelector('[data-line]');
  function lineProgress() {
    if (!steps || !line) return;
    if (reduce) { line.style.transform = 'none'; return; }
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.3);
    p = Math.max(0, Math.min(1, p));
    var vertical = window.innerWidth <= 760;
    line.style.transform = (vertical ? 'scaleY(' : 'scaleX(') + p.toFixed(3) + ')';
  }
  frame();

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
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Language switch is a visible no-op until the Greek version exists */
  d.querySelectorAll('.lang a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Scroll reveals, staggered among siblings, with the above-the-fold guard */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  items.forEach(function (el) {
    var sib = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('r'); });
    var i = sib.indexOf(el);
    el.style.setProperty('--d', (Math.min(i, 6) * 0.08).toFixed(2) + 's');
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

  /* Accordion with height animation */
  d.querySelectorAll('[data-acc] .acc__btn').forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    if (btn.getAttribute('aria-expanded') !== 'true') panel.hidden = true;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (reduce) { panel.hidden = open; return; }
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        panel.addEventListener('transitionend', function te() { panel.hidden = true; panel.style.height = ''; panel.removeEventListener('transitionend', te); });
      } else {
        panel.hidden = false;
        panel.style.height = '0px';
        requestAnimationFrame(function () { panel.style.height = panel.scrollHeight + 'px'; });
        panel.addEventListener('transitionend', function te() { panel.style.height = ''; panel.removeEventListener('transitionend', te); });
      }
    });
  });

  /* Cursor-following highlight on the work grid */
  var grid = d.querySelector('[data-grid]');
  var glow = grid && grid.querySelector('.grid__glow');
  if (grid && glow && !reduce && window.matchMedia('(hover: hover)').matches) {
    grid.addEventListener('pointerenter', function () { grid.classList.add('is-hover'); });
    grid.addEventListener('pointerleave', function () { grid.classList.remove('is-hover'); });
    grid.addEventListener('pointermove', function (e) {
      var r = grid.getBoundingClientRect();
      glow.style.transform = 'translate3d(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px,0)';
    });
  }

  /* Count-up of the registry year */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var to = parseInt(el.getAttribute('data-count'), 10);
    var from = parseInt(el.getAttribute('data-from') || '0', 10);
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = to; return; }
    var done = false;
    var o = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting || done) return;
      done = true; o.disconnect();
      var t0 = performance.now(), dur = 1400;
      el.textContent = from;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* Form validation with inline messages */
  var form = d.querySelector('[data-form]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose the kind of job.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A few words about the job, please.'; }
    };
    var errIds = { name: 'e-name', phone: 'e-phone', email: 'e-email', 'project-type': 'e-type', message: 'e-message' };
    function check(field) {
      var msg = rules[field.name](field.value);
      var box = d.getElementById(errIds[field.name]);
      if (box) box.textContent = msg;
      field.closest('.field').classList.toggle('is-bad', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (box) field.setAttribute('aria-describedby', box.id);
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (!f) return;
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f) && !first) first = f;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveals on the work grid and about photo, magnetic accent buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__photo, .work .tile","tilt":"","magnet":".btn--accent"};
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
