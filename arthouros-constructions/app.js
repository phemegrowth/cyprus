/* Arthouros Renovations: header, menu, hero reel, reveals, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero load sequence (classes set here so no-JS and reduced motion show everything) */
  if (!reduce) {
    root.classList.add('js-anim');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { root.classList.add('is-loaded'); });
    });
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onHeader() { header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu: opens, closes on link click and on Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (open) { menu.removeAttribute('hidden'); } else { menu.setAttribute('hidden', ''); }
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(menu.hasAttribute('hidden')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hasAttribute('hidden')) { setMenu(false); burger.focus(); }
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 200 : header.offsetHeight + 8);
      window.scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* Hero reel drifts left as the page scrolls (transform only, the page scrolls normally) */
  var reel = d.querySelector('[data-reel]');
  var hero = d.querySelector('.hero');

  /* Process line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var line = d.querySelector('[data-steps-line]');

  var ticking = false;
  function frame() {
    ticking = false;
    onHeader();
    if (reduce) return;
    var vh = window.innerHeight;
    if (reel && hero) {
      var hb = hero.getBoundingClientRect();
      if (hb.bottom > 0) {
        var shift = Math.min(window.scrollY, hb.height) * 0.45;
        reel.style.transform = 'translate3d(' + (-shift).toFixed(1) + 'px,0,0)';
      }
    }
    if (steps && line) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      line.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Scroll reveals, staggered; anything already on screen shows at once */
  var items = d.querySelectorAll('.reveal');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i, 5) * 80 + 'ms');
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); }
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: accordion with height animation, and the large photo swaps on hover or open */
  var swap = d.querySelector('[data-swap]');
  var swapImg = d.querySelector('[data-swap-img]');
  if (swap) {
    var svcItems = swap.querySelectorAll('.svc__item');
    var current = swapImg ? swapImg.getAttribute('src') : '';
    function showImg(src) {
      if (!swapImg || !src || src === current) return;
      current = src;
      if (reduce) { swapImg.src = src; return; }
      swapImg.classList.add('is-swapping');
      setTimeout(function () {
        swapImg.src = src;
        var done = function () { swapImg.classList.remove('is-swapping'); };
        if (swapImg.complete) { requestAnimationFrame(done); } else { swapImg.onload = done; }
      }, 220);
    }
    function open(item) {
      svcItems.forEach(function (it) {
        var on = it === item;
        it.classList.toggle('is-active', on);
        it.querySelector('.svc__btn').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      showImg(item.getAttribute('data-img'));
    }
    svcItems.forEach(function (it) {
      it.querySelector('.svc__btn').addEventListener('click', function () { open(it); });
      it.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) open(it); });
    });
  }

  /* Work strip: drag with the mouse, arrows, progress bar */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var bar = strip.querySelector('[data-strip-progress]');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    function progress() {
      var max = track.scrollWidth - track.clientWidth;
      var vis = track.clientWidth / track.scrollWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      if (bar) bar.style.transform = 'translateX(' + (p * (1 - vis) * 100 / vis).toFixed(2) + '%) scaleX(' + vis.toFixed(3) + ')';
    }
    if (bar) bar.style.transformOrigin = 'left';
    function step(dir) {
      var tile = track.querySelector('.tile');
      var w = tile ? tile.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', progress, { passive: true });
    window.addEventListener('resize', progress);
    progress();

    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { track.classList.remove('is-drag'); }, 0);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  });

  /* Form validation with inline messages */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'work-type': function (v) { return v ? '' : 'Please choose what needs work.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A line about the job helps us reply.'; }
    };
    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      var field = input.closest('.field');
      field.classList.toggle('is-bad', !!msg);
      field.querySelector('.field__err').textContent = msg;
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field') && el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el)) { ok = false; if (!first) first = el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: before and after slider, scroll progress line, photo wipe reveal, work tiles tilt. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__photo","tilt":".strip__track .tile","magnet":""};
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
