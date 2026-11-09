/* C.M. Projects homepage. Vanilla JS, no libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: stagger index per line, start on the first animation frame */
  var lines = document.querySelectorAll('.hero .rv-line > span');
  lines.forEach(function (el, i) { el.style.setProperty('--i', i); });
  requestAnimationFrame(function () { root.classList.add('ready'); });
  setTimeout(function () { root.classList.add('ready'); }, 300);

  /* Footer year */
  document.querySelectorAll('.year').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrinks on scroll */
  var header = document.querySelector('.header');
  var onScroll = function () { header.classList.toggle('is-small', window.scrollY > 24); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu: opens, closes on link click and Escape */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
  }
  burger.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); burger.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 1020 && !menu.hidden) setMenu(false); });

  /* Language switch is a visible no-op for now */
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - (header.offsetHeight + 8);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, with stagger among siblings and the above-the-fold guard */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var groups = new Map();
  reveals.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(n, 5) * 80 + 'ms');
    groups.set(p, n + 1);
  });
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* Count-up (years since registration, a quantity) */
  var counters = document.querySelectorAll('.count[data-to]');
  function runCount(el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce) { el.textContent = to; return; }
    var start = null, dur = 1400;
    el.textContent = '0';
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Services: accordion with height animation and image swap */
  var items = document.querySelectorAll('.svc__item');
  var imgs = document.querySelectorAll('.svc__media img');
  function activate(item) {
    items.forEach(function (it) {
      var on = it === item;
      it.classList.toggle('is-active', on);
      it.querySelector('.svc__btn').setAttribute('aria-expanded', String(on));
    });
    var idx = parseInt(item.getAttribute('data-img'), 10);
    imgs.forEach(function (im, i) { im.classList.toggle('is-on', i === idx); });
  }
  items.forEach(function (it) {
    it.querySelector('.svc__btn').addEventListener('click', function () { activate(it); });
    it.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) activate(it); });
  });

  /* Work strip: drag to scroll, progress bar */
  var strip = document.querySelector('.strip');
  var prog = document.querySelector('.strip__prog i');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      prog.style.transform = 'scaleX(' + (0.2 + p * 0.8) + ')';
    };
    strip.addEventListener('scroll', upd, { passive: true });
    upd();
  }

  /* Process: line draws with scroll */
  var steps = document.querySelector('.steps');
  var line = document.querySelector('.steps__line');
  if (steps && line) {
    if (reduce) { line.style.setProperty('--p', 1); }
    else {
      var ticking = false;
      var draw = function () {
        ticking = false;
        var r = steps.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        line.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
      draw();
    }
  }

  /* Form: inline client-side validation */
  var form = document.querySelector('.form');
  if (form) {
    var msgs = {
      'project-type': 'Choose a project type.',
      name: 'Please write your name.',
      phone: 'Please add a phone number we can call.',
      email: 'Please add a valid email address.',
      message: 'A few words about the project, please.'
    };
    var check = function (f) {
      var wrap = f.closest('.field'); var err = wrap.querySelector('.err');
      var v = f.value.trim(); var ok = v.length > 0;
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && f.name === 'phone') ok = v.replace(/\D/g, '').length >= 8;
      wrap.classList.toggle('has-err', !ok);
      f.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : msgs[f.name];
      return ok;
    };
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value.trim()) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-err')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* Polish pass, 2 Nov 2026: extra motion. Only transform, opacity and clip-path.
   Everything is visible without JS, and reduced motion switches it all off. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in w;
  function onView(els, fn, th) {
    if (!els.length) return;
    if (reduce || !io) { els.forEach(fn); return; }
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } });
    }, { threshold: th || 0.2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { o.observe(el); });
  }
  var $$ = function (s) { return Array.prototype.slice.call(d.querySelectorAll(s)); };

  /* Scroll progress line */
  var bar = d.querySelector('[data-scrollbar]');
  if (bar && !reduce) {
    var tick = false;
    var upd = function () {
      var h = d.documentElement.scrollHeight - w.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, w.scrollY / h) : 0) + ')';
      tick = false;
    };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Clip-path image reveals and line draws */
  /* (observe the parent: a fully clipped element can read as not visible) */
  $$('[data-clip], [data-draw]').forEach(function (el) {
    var host = el.parentElement || el;
    onView([host], function () { el.classList.add('is-shown'); }, 0.1);
  });

  /* Count up (only numbers already printed on the page) */
  onView($$('[data-countup]'), function (el) {
    var to = parseFloat(el.getAttribute('data-countup'));
    var from = parseFloat(el.getAttribute('data-countup-from') || '0');
    if (reduce || isNaN(to)) { el.textContent = el.getAttribute('data-countup-text') || to; return; }
    var t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute('data-countup-text') || to;
    };
    requestAnimationFrame(step);
  }, 0.5);

  if (reduce || !fine) return;

  /* Buttons that pull toward the cursor */
  $$('[data-magnet]').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });

  /* Cards that tilt on hover */
  $$('[data-tilt]').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  /* Highlight that follows the cursor over a grid */
  $$('[data-spot]').forEach(function (g) {
    var s = d.createElement('span'); s.className = 'cursor-spot'; s.setAttribute('aria-hidden', 'true'); g.appendChild(s);
    g.addEventListener('mousemove', function (e) {
      var r = g.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px) translate(-50%,-50%)';
      s.style.opacity = '1';
    });
    g.addEventListener('mouseleave', function () { s.style.opacity = '0'; });
  });
})();
