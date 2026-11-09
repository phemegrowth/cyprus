/* Multiman: header, menu, hero count, reveals, trade swap, before and after, strip drag, steps line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.remove('js-motion');

  var TRADES = ['Painting', 'Plastering', 'Tiling', 'Carpentry', 'Lighting', 'Masonry', 'Steelwork', 'Bathrooms and kitchens'];
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    else if (refocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Language switch is a visible no-op for now */
  d.querySelectorAll('.lang a').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* HERO: line reveal, count up 01 to 08 with the trade names, then a slow cycle */
  var hero = d.querySelector('.hero');
  var num = d.querySelector('[data-count]');
  var idx = d.querySelector('.figure__idx');
  var word = d.querySelector('.figure__word');
  function setTick(i) {
    if (idx) idx.textContent = pad(i + 1);
    if (word) word.textContent = TRADES[i];
  }
  if (hero) {
    if (reduce) {
      hero.classList.add('is-ready');
    } else {
      requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });
      if (num) {
        var target = parseInt(num.getAttribute('data-count'), 10) || 8;
        num.textContent = '00';
        var step = 0;
        var startDelay = 450;
        setTimeout(function tick() {
          step++;
          num.textContent = pad(step);
          setTick(step - 1);
          if (step < target) setTimeout(tick, 120 + step * 22);
          else startCycle();
        }, startDelay);
      }
    }
  }
  function startCycle() {
    if (!word) return;
    var i = TRADES.length - 1;
    setInterval(function () {
      if (d.hidden) return;
      word.classList.add('is-out');
      setTimeout(function () {
        i = (i + 1) % TRADES.length;
        setTick(i);
        word.classList.remove('is-out');
      }, 380);
    }, 2400);
  }

  /* Scroll reveals, with above the fold guard and stagger per group */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--i', Math.min(n, 6));
    groups.set(p, n + 1);
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

  /* TRADES: hover, focus or tap swaps the photo */
  var swap = d.querySelector('.swap');
  var swapNum = d.querySelector('[data-swapnum]');
  var tItems = d.querySelectorAll('.tlist__item');
  function activate(item) {
    var key = item.getAttribute('data-key');
    tItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
    if (swap) swap.querySelectorAll('img').forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-key') === key); });
    if (swapNum) swapNum.textContent = pad(parseInt(key, 10));
  }
  tItems.forEach(function (item) {
    item.addEventListener('mouseenter', function () { activate(item); });
    item.addEventListener('focus', function () { activate(item); });
    item.addEventListener('click', function () { activate(item); });
  });

  /* BEFORE AND AFTER slider */
  d.querySelectorAll('[data-ba]').forEach(function (ba) {
    var frame = ba.querySelector('.ba__frame');
    var range = ba.querySelector('[data-ba-range]');
    if (!frame || !range) return;
    var touched = false;
    function set(v) { frame.style.setProperty('--pos', v + '%'); }
    range.addEventListener('input', function () { touched = true; set(range.value); });
    set(range.value);
    if (reduce || !('IntersectionObserver' in window)) return;
    var bio = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      bio.disconnect();
      var keys = [[0, 50], [900, 22], [1900, 78], [2800, 50]];
      var t0 = null;
      function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
      function frameFn(ts) {
        if (touched) return;
        if (t0 === null) t0 = ts;
        var t = ts - t0;
        for (var k = 1; k < keys.length; k++) {
          if (t <= keys[k][0]) {
            var a = keys[k - 1], b = keys[k];
            var v = a[1] + (b[1] - a[1]) * ease((t - a[0]) / (b[0] - a[0]));
            set(v.toFixed(2)); range.value = Math.round(v);
            requestAnimationFrame(frameFn);
            return;
          }
        }
        set(50); range.value = 50;
      }
      setTimeout(function () { requestAnimationFrame(frameFn); }, 300);
    }, { threshold: 0.5 });
    bio.observe(frame);
  });

  /* STRIP: buttons and mouse drag */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    if (!track) return;
    function stepBy(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 360;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { stepBy(-1); });
    if (next) next.addEventListener('click', function () { stepBy(1); });
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; track.classList.remove('is-drag');
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stepBy(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepBy(-1); }
    });
  });

  /* PROCESS: line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var line = d.querySelector('[data-line]');
  if (steps && line && !reduce) {
    var ticking = false;
    function draw() {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      line.style.setProperty('--p', p.toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  }

  /* Magnetic buttons: the main actions pull a little toward the cursor (mouse only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.hero__cta .btn, .contact .btn--wide').forEach(function (b) {
      b.classList.add('mag');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + (y - 3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value.trim())) ok = false;
      if (field.value.trim() === '' && field.required) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.type === 'hidden' || f.name === 'bot-field') return;
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
    if (a.closest('.lang')) return;
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      var t = id ? d.getElementById(id) : null;
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height + 8 : 72;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });
})();
