/* Fisaco Ltd: header, mobile menu, reveals, count-up, filters, lightbox, form validation.
   Everything on the page reads without this file. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = document.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-shrunk', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scroll progress line and the process line that draws as you scroll */
  var bar = null;
  if (header && !reduce) { bar = document.createElement('span'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); header.appendChild(bar); }
  var steps = document.querySelector('.steps');
  var stepItems = steps ? steps.querySelectorAll('li') : [];
  var ticking = false;
  function onFrame() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
    if (steps && !reduce) {
      var r = steps.getBoundingClientRect();
      var mid = window.innerHeight * 0.6;
      var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      steps.style.setProperty('--p', p.toFixed(3));
      stepItems.forEach(function (li) { li.classList.toggle('is-on', li.getBoundingClientRect().top + 30 < mid); });
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onFrame();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Scroll reveals */
  var items = document.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Count-up numbers: only elements with data-count */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start = parseInt(el.getAttribute('data-from') || '0', 10);
    var dur = 1400, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window && !reduce) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* Smooth anchor scroll with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') { if (id === '#') e.preventDefault(); return; }
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* Project filters: by type and by district */
  var list = document.querySelector('[data-list]');
  if (list) {
    var state = { type: 'all', district: 'all' };
    var cards = list.querySelectorAll('[data-type]');
    var empty = document.querySelector('[data-empty]');
    var count = document.querySelector('[data-count-shown]');
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var okT = state.type === 'all' || c.getAttribute('data-type') === state.type;
        var okD = state.district === 'all' || c.getAttribute('data-district') === state.district;
        var ok = okT && okD;
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      if (count) count.textContent = shown + ' / ' + cards.length;
    }
    document.querySelectorAll('[data-filter]').forEach(function (group) {
      var key = group.getAttribute('data-filter');
      group.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          state[key] = b.getAttribute('data-value');
          group.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          apply();
        });
      });
    });
    var reset = document.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () {
      state = { type: 'all', district: 'all' };
      document.querySelectorAll('[data-filter] button').forEach(function (x) {
        x.setAttribute('aria-pressed', x.getAttribute('data-value') === 'all' ? 'true' : 'false');
      });
      apply();
    });
    apply();
  }

  /* Lightbox */
  var gallery = document.querySelector('[data-gallery]');
  var lb = document.querySelector('.lightbox');
  if (gallery && lb) {
    var imgs = Array.prototype.map.call(gallery.querySelectorAll('img'), function (im) {
      return { src: im.getAttribute('data-full') || im.src, alt: im.alt };
    });
    var idx = 0, lastFocus = null;
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('.lightbox__cap');
    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      lbImg.src = imgs[idx].src; lbImg.alt = imgs[idx].alt;
      if (lbCap) lbCap.textContent = (idx + 1) + ' / ' + imgs.length + '  ' + imgs[idx].alt;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i); lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    }
    function close() {
      lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    gallery.querySelectorAll('button').forEach(function (b, i) {
      b.addEventListener('click', function () { open(i); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation with inline messages */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    function fieldOf(input) { return input.closest('.field'); }
    function setErr(input, msg) {
      var f = fieldOf(input); if (!f) return;
      var e = f.querySelector('.err');
      f.classList.toggle('is-invalid', !!msg);
      if (e) e.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function check(input) {
      var v = input.value.trim();
      if (input.required && !v) return 'Please fill this in.';
      if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email does not look right.';
      if (input.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) return 'Please enter a phone number with at least 8 digits.';
      return '';
    }
    var inputs = form.querySelectorAll('input:not([type="hidden"]):not([name="bot-field"]), select, textarea');
    inputs.forEach(function (i) {
      i.addEventListener('blur', function () { setErr(i, check(i)); });
      i.addEventListener('input', function () { if (fieldOf(i) && fieldOf(i).classList.contains('is-invalid')) setErr(i, check(i)); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      inputs.forEach(function (i) {
        var m = check(i); setErr(i, m);
        if (m && !firstBad) firstBad = i;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  });
})();
