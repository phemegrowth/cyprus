/* A.E.P Construction and Renovation: header, menu, hero count-up, reveals, hover swap, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero in: one class, CSS does the choreography */
  function ready() { d.documentElement.classList.add('is-ready'); }
  requestAnimationFrame(function () { requestAnimationFrame(ready); });
  setTimeout(ready, 400);

  /* Count-up on the hero figure (sourced: company registered 2020) */
  var num = d.querySelector('[data-count]');
  if (num) {
    var target = parseInt(num.getAttribute('data-count'), 10);
    var from = parseInt(num.getAttribute('data-from'), 10) || 0;
    if (reduce || isNaN(target)) {
      num.textContent = String(target);
    } else {
      num.textContent = String(from);
      var start = null, dur = 1900, delay = 350;
      function ease(t) { return 1 - Math.pow(1 - t, 4); }
      function tick(ts) {
        if (start === null) start = ts;
        var t = Math.min(1, Math.max(0, (ts - start - delay) / dur));
        num.textContent = String(Math.round(from + (target - from) * ease(t)));
        if (t < 1) requestAnimationFrame(tick); else num.textContent = String(target);
      }
      requestAnimationFrame(tick);
    }
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
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
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (menu.classList.contains('is-open')) setMenu(false); });
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Language switch is a visible no-op for now */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var off = (header ? header.getBoundingClientRect().height : 0) + 8;
      var top = el.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover swaps the big photo */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var imgs = swap.querySelectorAll('img[data-for]');
    var services = d.querySelectorAll('.service[data-index]');
    function show(i) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-for') === String(i)); });
      services.forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-index') === String(i)); });
    }
    services.forEach(function (s) {
      var i = s.getAttribute('data-index');
      s.addEventListener('mouseenter', function () { show(i); });
      s.addEventListener('focusin', function () { show(i); });
      s.addEventListener('click', function () { show(i); });
    });
    /* on phones, the photo follows the item nearest the middle of the screen */
    if ('IntersectionObserver' in window && window.matchMedia('(max-width: 899px)').matches) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) show(en.target.getAttribute('data-index')); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      services.forEach(function (s) { so.observe(s); });
    }
  }

  /* Work strip: arrows and drag to scroll */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (!track) return;
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    function up() { if (!down) return; down = false; track.classList.remove('is-drag'); }
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });
  });

  /* Process line draws when the steps come into view */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if (reduce || !('IntersectionObserver' in window)) {
      steps.classList.add('is-drawn');
    } else {
      var po = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { steps.classList.add('is-drawn'); po.disconnect(); } });
      }, { threshold: 0.25 });
      po.observe(steps);
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-aep-construction"]');
  if (form) {
    var fields = form.querySelectorAll('[required]');
    function msg(el) {
      var v = el.value.trim();
      if (!v) return 'Please fill this in.';
      if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'That email does not look right.';
      if (el.type === 'tel' && v.replace(/\D/g, '').length < 8) return 'Please add a phone number we can call.';
      return '';
    }
    function check(el) {
      var wrap = el.closest('.field');
      var err = wrap ? wrap.querySelector('.err') : null;
      var m = msg(el);
      if (wrap) wrap.classList.toggle('is-bad', !!m);
      if (err) err.textContent = m;
      el.setAttribute('aria-invalid', m ? 'true' : 'false');
      return !m;
    }
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      fields.forEach(function (el) { if (!check(el)) { ok = false; if (!firstBad) firstBad = el; } });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: before and after slider, scroll progress line, photo wipe reveal, work cards tilt. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__media","tilt":".strip .card","magnet":""};
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


/* Before and after slider: range input drives a clip-path; a one-time hint sweep when it scrolls into view */
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), function (f) {
    var r = f.querySelector('.ba__range');
    var set = function (v) { f.style.setProperty('--ba', v + '%'); };
    r.addEventListener('input', function () { f.classList.remove('is-hint'); set(r.value); });
    if (reduce || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      f.classList.add('is-hint'); set(78);
      setTimeout(function () { set(28); }, 1300);
      setTimeout(function () { set(50); r.value = 50; }, 2600);
      setTimeout(function () { f.classList.remove('is-hint'); }, 3900);
    }, { threshold: 0.5 });
    io.observe(f);
  });
})();
