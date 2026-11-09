/* AST Apseros Constructions homepage: header, menu, hero reveal and parallax, reveals,
   service photo swap, step line, form validation, footer year. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero: line by line reveal once fonts are ready */
  function ready() { d.documentElement.classList.add('is-ready'); }
  if (d.fonts && d.fonts.ready) { d.fonts.ready.then(ready, ready); setTimeout(ready, 900); } else { setTimeout(ready, 120); }

  /* Header shrink */
  var header = d.querySelector('.header');
  function headerState() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', headerState, { passive: true });
  headerState();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  /* Smooth anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) { e.preventDefault(); return; }
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var top = el.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Hero photo parallax: moves slower than the page (transform only) */
  var par = d.querySelector('[data-parallax]');
  if (par && !reduce) {
    var ticking = false;
    function parallax() {
      ticking = false;
      var y = window.scrollY;
      if (y > window.innerHeight * 1.2) return;
      par.style.transform = 'translate3d(0,' + (y * 0.18).toFixed(1) + 'px,0)';
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });
    parallax();
  }

  /* Scroll reveals: anything already in view shows at once */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: the photo swaps with the item under the pointer (or in focus) */
  var swapBox = d.querySelector('[data-swap-target]');
  if (swapBox) {
    var pics = swapBox.querySelectorAll('[data-swap]');
    var rows = d.querySelectorAll('[data-swap-key]');
    function show(key) {
      pics.forEach(function (p) { p.classList.toggle('is-on', p.getAttribute('data-swap') === key); });
      rows.forEach(function (r) { r.classList.toggle('is-hot', r.getAttribute('data-swap-key') === key); });
    }
    rows.forEach(function (r) {
      var key = r.getAttribute('data-swap-key');
      r.addEventListener('mouseenter', function () { show(key); });
      r.addEventListener('focusin', function () { show(key); });
    });
    /* On phones, where there is no hover, swap as the rows scroll by */
    if ('IntersectionObserver' in window && !window.matchMedia('(hover: hover)').matches) {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) show(en.target.getAttribute('data-swap-key')); });
      }, { rootMargin: '-40% 0px -40% 0px' });
      rows.forEach(function (r) { rio.observe(r); });
    }
  }

  /* Steps: the line draws when the section arrives */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if (reduce || !('IntersectionObserver' in window)) { steps.classList.add('is-drawn'); }
    else {
      var sio = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { steps.classList.add('is-drawn'); sio.disconnect(); }
      }, { threshold: 0.2 });
      sio.observe(steps);
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-ast-apseros-constructions"]');
  if (form) {
    var msgs = {
      name: 'Please tell us your name.',
      phone: 'A phone number we can call.',
      email: 'An email address that works.',
      interest: 'Choose what you are interested in.',
      message: 'A few words about what you need.'
    };
    function check(field) {
      var input = field.querySelector('input, select, textarea');
      var msg = field.querySelector('.field__msg');
      if (!input || !msg) return true;
      var v = input.value.trim();
      var bad = false;
      if (input.required && !v) bad = true;
      else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) bad = true;
      else if (input.type === 'tel' && v.replace(/\D/g, '').length < 8) bad = true;
      field.classList.toggle('is-bad', bad);
      msg.textContent = bad ? (msgs[input.name] || 'Please check this.') : '';
      return !bad;
    }
    var fields = form.querySelectorAll('.field');
    fields.forEach(function (f) {
      var input = f.querySelector('input, select, textarea');
      if (input) { input.addEventListener('blur', function () { check(f); }); input.addEventListener('input', function () { if (f.classList.contains('is-bad')) check(f); }); }
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f; } });
      if (!ok) { e.preventDefault(); var inp = first.querySelector('input, select, textarea'); if (inp) inp.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
