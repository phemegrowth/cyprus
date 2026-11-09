/* A&R Cyprus-Greece Fine Properties: header, menu, reveals, hero reel, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu: closes on link click and Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Language switch is a visible no-op until the Greek version exists */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', function (e) {
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = (header ? header.getBoundingClientRect().height : 64) + 8;
      var y = t.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Scroll reveals with stagger and an above-the-fold guard */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(n, 5) * 80 + 'ms');
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

  /* Hero reel drifts left as the page scrolls (transform only) */
  var reel = d.querySelector('[data-reel]');
  var hero = d.querySelector('.hero');

  /* Process line draws with scroll */
  var steps = d.querySelector('[data-steps]');
  var progress = d.querySelector('[data-progress]');

  var ticking = false;
  function frame() {
    ticking = false;
    onHeader();
    if (reduce) return;
    if (reel && hero) {
      var h = hero.offsetHeight;
      var y = Math.min(window.scrollY, h);
      reel.style.transform = 'translate3d(' + (-y * 0.45).toFixed(1) + 'px,0,0)';
    }
    if (steps && progress) {
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      progress.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Services: hover or focus swaps the photo; on phones the item in view takes over */
  var svcItems = d.querySelectorAll('[data-svc]');
  var swaps = d.querySelectorAll('[data-swap]');
  function activate(i) {
    swaps.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === String(i)); });
    svcItems.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-svc') === String(i)); });
  }
  if (svcItems.length) {
    activate(0);
    svcItems.forEach(function (li) {
      var i = li.getAttribute('data-svc');
      li.addEventListener('mouseenter', function () { activate(i); });
      li.addEventListener('focus', function () { activate(i); });
      li.addEventListener('click', function () { activate(i); });
    });
    if ('IntersectionObserver' in window && window.matchMedia('(max-width: 900px)').matches) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(en.target.getAttribute('data-svc')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      svcItems.forEach(function (li) { sio.observe(li); });
    }
  }

  /* Drag strip with buttons */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var down = false, moved = false, sx = 0, sl = 0;
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
    strip.addEventListener('dragstart', function (e) { e.preventDefault(); });
    function step(dir) {
      var c = strip.querySelector('.card');
      var w = c ? c.getBoundingClientRect().width + 16 : 360;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function check(el) {
      var v = (el.value || '').trim();
      var ok = v.length > 0;
      if (ok && el.type === 'email') ok = emailRe.test(v);
      if (ok && el.type === 'tel') ok = v.replace(/[^\d]/g, '').length >= 8;
      if (ok && el.tagName === 'TEXTAREA') ok = v.length >= 5;
      var f = el.closest('.field');
      if (f) f.classList.toggle('is-bad', !ok);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { var f = el.closest('.field'); if (f && f.classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (el) { if (!check(el) && !first) first = el; });
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
