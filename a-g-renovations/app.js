/* Homepage script: hero entrance, header, menu, anchors, reveals, count-up, parallax, drift, progress line, accordion, marquee, drag strip, before/after, magnetic buttons, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame;

  /* Hero entrance starts on the first frame; never waits for fonts or images */
  if (reduce) html.classList.add('is-ready');
  else raf(function () { raf(function () { html.classList.add('is-ready'); }); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scroll-linked motion: parallax (data-parallax), horizontal drift (data-drift), progress line (data-progress) */
  var par = d.querySelectorAll('[data-parallax]');
  var drift = d.querySelectorAll('[data-drift]');
  var prog = d.querySelectorAll('[data-progress]');
  var ticking = false;
  function runScroll() {
    var vh = window.innerHeight;
    if (!reduce) {
      par.forEach(function (el) {
        var k = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - vh / 2) * -k).toFixed(1) + 'px,0)';
      });
      drift.forEach(function (el) {
        var k = parseFloat(el.getAttribute('data-drift')) || 0.2;
        var r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var max = Math.max(0, el.scrollWidth - el.parentElement.clientWidth);
        var x = Math.min(max, Math.max(0, window.scrollY * k));
        el.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      });
    }
    prog.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var p = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height || 1)));
      el.style.setProperty('--p', reduce ? 1 : p.toFixed(3));
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(runScroll); } }, { passive: true });
  window.addEventListener('resize', runScroll);
  runScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Smooth anchor scroll with header offset; no-op links stay put */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? 72 : 0;
      window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Reveals: anything already in view shows at once, the rest when it arrives (80ms stagger) */
  function reveal(els, cb) {
    if ('IntersectionObserver' in window && !reduce) {
      var io = new IntersectionObserver(function (entries) {
        var k = 0;
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          setTimeout(function () { cb(el); }, (k++) * 80);
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      els.forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight) cb(el);
        else io.observe(el);
      });
    } else {
      els.forEach(cb);
    }
  }
  reveal(d.querySelectorAll('.r, [data-in]'), function (el) { el.classList.add('is-in'); });

  /* Count-up (sourced quantities only) */
  reveal(d.querySelectorAll('.count'), function (el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || !to) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf(tick);
    }
    el.textContent = '0';
    raf(tick);
  });

  /* Accordion with height animation */
  d.querySelectorAll('.acc__item').forEach(function (item, i, all) {
    var btn = item.querySelector('.acc__btn');
    var panel = item.querySelector('.acc__panel');
    if (!btn || !panel) return;
    function set(open) {
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.style.height = open ? panel.scrollHeight + 'px' : '0px';
    }
    set(item.classList.contains('is-open'));
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      all.forEach(function (o) {
        if (o !== item && o.classList.contains('is-open')) {
          o.classList.remove('is-open');
          o.querySelector('.acc__btn').setAttribute('aria-expanded', 'false');
          o.querySelector('.acc__panel').style.height = '0px';
        }
      });
      set(open);
      var sw = item.getAttribute('data-swap-to');
      if (open && sw) swapTo(sw);
    });
    window.addEventListener('resize', function () { if (item.classList.contains('is-open')) panel.style.height = panel.scrollHeight + 'px'; });
  });

  /* Image swap (data-swap on images, data-swap-to on triggers) */
  function swapTo(n) {
    d.querySelectorAll('[data-swap]').forEach(function (m) { m.classList.toggle('is-on', m.getAttribute('data-swap') === n); });
  }
  d.querySelectorAll('[data-swap-to]:not(.acc__item)').forEach(function (item) {
    ['mouseenter', 'focusin', 'click'].forEach(function (ev) {
      item.addEventListener(ev, function () {
        swapTo(item.getAttribute('data-swap-to'));
        d.querySelectorAll('[data-swap-to]').forEach(function (x) { x.classList.toggle('is-active', x === item); });
      });
    });
  });

  /* Marquee: duplicate once for a seamless loop */
  d.querySelectorAll('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee__track');
    if (!track || reduce) return;
    track.innerHTML += track.innerHTML;
    track.querySelectorAll('li').forEach(function (li, i, all) { if (i >= all.length / 2) li.setAttribute('aria-hidden', 'true'); });
    m.classList.add('is-on');
  });

  /* Drag strip: mouse drag plus arrow buttons; touch uses native scroll */
  d.querySelectorAll('[data-drag]').forEach(function (track) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft; track.classList.add('is-down');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; track.classList.remove('is-down'); });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    var sec = track.closest('section');
    if (sec) sec.querySelectorAll('[data-dir]').forEach(function (b) {
      b.addEventListener('click', function () {
        var item = track.firstElementChild;
        var w = item ? item.getBoundingClientRect().width + 16 : 400;
        track.scrollBy({ left: w * parseInt(b.getAttribute('data-dir'), 10), behavior: reduce ? 'auto' : 'smooth' });
      });
    });
  });

  /* Before / after slider (range input drives a clip) */
  d.querySelectorAll('[data-ba]').forEach(function (ba) {
    var input = ba.querySelector('input[type="range"]');
    if (!input) return;
    function set() { ba.style.setProperty('--ba', input.value + '%'); }
    input.addEventListener('input', set);
    set();
  });

  /* Magnetic buttons (pointer devices only) */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    d.querySelectorAll('[data-magnetic]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    d.querySelectorAll('[data-glow]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--gx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2; },
      phone: function (v) { return v.replace(/\D/g, '').length >= 8; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); },
      topic: function (v) { return v !== ''; },
      message: function (v) { return v.trim().length >= 10; }
    };
    var check = function (el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var ok = fn(el.value);
      var field = el.closest('.field');
      if (field) field.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    };
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { if (el.value !== '') check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
      el.addEventListener('change', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el) && !firstBad) firstBad = el;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
