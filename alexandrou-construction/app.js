/* Spyros Alexandrou Construction: hero deck, reveals, count-up, service swap, drag strip,
   process rail, header, menu, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* A window taller than any real screen (full-page captures) shows the settled page at once */
  if (window.innerHeight > 1600) { reduce = true; root.classList.add('is-static'); }
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Hero: headline lines and deck fan, started on the first frame */
  var hero = d.querySelector('.hero');
  var deck = d.querySelector('[data-deck]');
  function stackDeck() {
    if (!deck) return;
    var box = deck.getBoundingClientRect();
    var cx = box.left + box.width / 2;
    var cy = box.top + box.height / 2;
    deck.querySelectorAll('.card').forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var dx = cx - (r.left + r.width / 2) + (i - 1.5) * 10;
      var dy = cy - (r.top + r.height / 2) + (i - 1.5) * 8;
      c.style.transition = 'none';
      c.style.setProperty('--dx', dx.toFixed(1) + 'px');
      c.style.setProperty('--dy', dy.toFixed(1) + 'px');
    });
    void deck.offsetWidth;
    deck.querySelectorAll('.card').forEach(function (c) { c.style.transition = ''; });
  }
  if (reduce) {
    if (hero) hero.classList.add('is-in');
    if (deck) deck.classList.add('is-stacked', 'is-fanned', 'is-settled');
  } else {
    raf(function () {
      if (hero) hero.classList.add('is-in');
      if (!deck) return;
      stackDeck();
      deck.classList.add('is-stacked');
      setTimeout(function () { deck.classList.add('is-fanned'); }, 180);
      setTimeout(function () { deck.classList.add('is-settled'); }, 1700);
    });
  }

  /* Header shrink, hero parallax, process rail: one scroll handler */
  var header = d.querySelector('[data-header]');
  var stage = d.querySelector('[data-parallax]');
  var steps = d.querySelector('[data-steps]');
  var rail = d.querySelector('[data-rail]');
  var stepItems = steps ? steps.querySelectorAll('.step') : [];
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    var vh = window.innerHeight;
    if (stage && !reduce && y < vh * 1.2) {
      stage.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
    }
    if (steps && rail && !reduce) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.6 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      rail.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }
    stepItems.forEach(function (s) {
      s.classList.toggle('is-on', reduce || s.getBoundingClientRect().top < vh * 0.6);
    });
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

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

  /* Scroll reveals with stagger and the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  items.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (x) { return x.classList.contains('r'); });
    var i = sibs.indexOf(el);
    el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's');
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

  /* Count-up (sourced figure: years since registration in 2002) */
  var num = d.querySelector('[data-count]');
  if (num && 'IntersectionObserver' in window && !reduce) {
    var target = parseInt(num.getAttribute('data-count'), 10);
    num.textContent = '0';
    var cio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      cio.disconnect();
      var t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / 1300);
        var e = 1 - Math.pow(1 - k, 3);
        num.textContent = String(Math.round(target * e));
        if (k < 1) raf(step);
      }
      raf(step);
    }, { threshold: 0.4 });
    cio.observe(num);
  }

  /* Services: hover or focus swaps the image */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var imgs = d.querySelectorAll('.svc__media img');
    var tag = d.querySelector('[data-swap-tag]');
    var svcItems = swap.querySelectorAll('.svc__item');
    function activate(item) {
      var n = parseInt(item.getAttribute('data-img'), 10);
      svcItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
      imgs.forEach(function (im, i) { im.classList.toggle('is-on', i === n); });
      if (tag) {
        var name = item.querySelector('.svc__name').textContent.replace(/[\[\]]/g, '');
        tag.textContent = item.querySelector('.svc__no').textContent + ' ' + name;
      }
    }
    svcItems.forEach(function (item) {
      item.addEventListener('mouseenter', function () { activate(item); });
      item.addEventListener('focus', function () { activate(item); });
      item.addEventListener('click', function () { activate(item); });
    });
  }

  /* Work strip: drag with the mouse, buttons step one photo */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, startX = 0, startL = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startL = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    function stepStrip(dir) {
      var shot = strip.querySelector('.shot');
      var w = shot ? shot.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { stepStrip(-1); });
    if (next) next.addEventListener('click', function () { stepStrip(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); stepStrip(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); stepStrip(-1); }
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 64;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()]{6,}$/.test(field.value.trim())) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
      if (f.name === 'bot-field') return;
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f) && !firstBad) firstBad = f;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveals, work photos tilt, magnetic hero buttons. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__photo, .process__img","tilt":".strip__track .shot","magnet":".hero .btn"};
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
