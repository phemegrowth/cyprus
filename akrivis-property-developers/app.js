/* Akrivis Property Developers: hero entrance, header, menu, reveals, image swap, gallery, count-up,
   process line, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.remove('no-js');
  root.classList.add('js');

  /* Hero entrance: start on the first animation frame, never wait for fonts or images */
  requestAnimationFrame(function () { root.classList.add('is-ready'); });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  var ticking = false;
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
    updateLine();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (focusBack) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
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

  /* What we do: hover, focus or tap swaps the image */
  var swap = d.querySelector('[data-swap]');
  var media = d.querySelectorAll('.offer__media img');
  if (swap && media.length) {
    var offerItems = swap.querySelectorAll('.offer__item');
    function show(item) {
      var i = +item.getAttribute('data-img');
      offerItems.forEach(function (it) {
        var on = it === item;
        it.classList.toggle('is-active', on);
        it.querySelector('.offer__btn').setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      media.forEach(function (img, k) { img.classList.toggle('is-on', k === i); });
    }
    offerItems.forEach(function (it) {
      var b = it.querySelector('.offer__btn');
      b.addEventListener('mouseenter', function () { show(it); });
      b.addEventListener('focus', function () { show(it); });
      b.addEventListener('click', function () { show(it); });
    });
  }

  /* Gallery thumbnails */
  var gal = d.querySelector('[data-gallery]');
  if (gal) {
    var main = gal.querySelector('[data-main]');
    var cap = gal.querySelector('[data-cap]');
    var thumbs = gal.querySelectorAll('.thumb');
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () {
        if (t.classList.contains('is-on')) return;
        thumbs.forEach(function (x) { x.classList.toggle('is-on', x === t); x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
        function swapSrc() {
          main.src = t.getAttribute('data-src');
          main.alt = t.getAttribute('data-alt');
          main.width = +t.getAttribute('data-w');
          main.height = +t.getAttribute('data-h');
          cap.textContent = t.getAttribute('data-label');
          main.classList.remove('is-fading');
        }
        if (reduce) { swapSrc(); return; }
        main.classList.add('is-fading');
        setTimeout(swapSrc, 300);
      });
    });
  }

  /* Count-up for sourced numbers only (3 villas, 2 bedrooms, 5 and 20 minutes) */
  var counters = d.querySelectorAll('[data-count]');
  function count(el) {
    var end = +el.getAttribute('data-count'), t0 = null, dur = 1100;
    if (reduce) { el.textContent = end; return; }
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { count(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Process: the line draws as you scroll through the steps */
  var steps = d.querySelector('[data-steps]');
  var line = d.querySelector('[data-line]');
  function updateLine() {
    if (!steps || !line) return;
    if (reduce) { line.style.setProperty('--p', 1); return; }
    var r = steps.getBoundingClientRect(), vh = window.innerHeight;
    var p = (vh * 0.65 - r.top) / r.height;
    line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
  }
  onScroll();
  window.addEventListener('resize', updateLine);

  /* Form validation with inline messages */
  var form = d.querySelector('[data-form]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email address.'; },
      interest: function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'Please write a short message.'; }
    };
    function check(field) {
      var fn = rules[field.name];
      if (!fn) return true;
      var msg = fn(field.value);
      var wrap = field.closest('.field');
      wrap.classList.toggle('has-err', !!msg);
      wrap.querySelector('.err').textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (!f) return;
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-err')) check(f); });
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
  /* Polish pass, 2 Nov 2026: scroll progress line in the logo teal, photo wipe reveals, magnetic solid buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".gallery__stage, .about__media, .offer__media","tilt":"","magnet":".btn--solid"};
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
