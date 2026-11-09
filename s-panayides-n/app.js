/* S&N Construction, homepage behaviour. Vanilla JS, no libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__reduce = reduce;

  /* Hero entrance starts on the first frame; fonts and images are not awaited */
  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  /* Header shrinks on scroll, thin scroll progress bar */
  var header = document.querySelector('.header');
  var bar = document.querySelector('.progress span');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-small', y > 40);
    if (bar) {
      var h = root.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu: closes on link click and on Escape */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    if (!burger) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      document.body.classList.toggle('menu-open', !open);
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* Smooth anchor scroll with header offset */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var off = header ? header.offsetHeight : 0;
    scrollTo({ top: t.getBoundingClientRect().top + scrollY - off + 1, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Stagger children of a group */
  [].forEach.call(document.querySelectorAll('[data-stagger]'), function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 80) + 'ms'; });
  });

  /* Scroll reveals: anything already in view shows at once */
  var items = [].slice.call(document.querySelectorAll('.reveal, .reveal-clip, [data-count]'));
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')); var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    if (reduce) { el.textContent = end.toFixed(dec); return; }
    var t0 = null, dur = 1400;
    function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur); var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  function show(el) { el.classList.add('in'); if (el.hasAttribute('data-count') && !el.__c) { el.__c = 1; countUp(el); } }
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) show(el); else io.observe(el);
    });
  }

  /* Hover or focus swaps the photo in a service list */
  [].forEach.call(document.querySelectorAll('[data-swap]'), function (swap) {
    var figs = swap.querySelectorAll('[data-for]');
    var rows = swap.querySelectorAll('[data-img]');
    [].forEach.call(rows, function (row) {
      function on() {
        var n = row.getAttribute('data-img');
        [].forEach.call(rows, function (r) { r.classList.toggle('is-on', r === row); });
        [].forEach.call(figs, function (f) { f.classList.toggle('is-on', f.getAttribute('data-for') === n); });
      }
      row.addEventListener('mouseenter', on); row.addEventListener('focusin', on); row.addEventListener('click', on);
    });
  });

  /* Accordion with height animation */
  [].forEach.call(document.querySelectorAll('[data-acc] button[aria-controls]'), function (b) {
    b.addEventListener('click', function () {
      var p = document.getElementById(b.getAttribute('aria-controls'));
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', String(!open));
      p.style.height = open ? '0px' : p.scrollHeight + 'px';
      p.classList.toggle('is-open', !open);
    });
  });

  /* Drag strip (mouse), buttons for touch and keyboard */
  [].forEach.call(document.querySelectorAll('[data-drag]'), function (s) {
    var down = false, sx = 0, sl = 0, moved = false;
    s.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; s.classList.add('is-drag');
    });
    addEventListener('pointermove', function (e) {
      if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    var wrap = s.parentNode;
    var prev = wrap.querySelector('[data-prev]'), next = wrap.querySelector('[data-next]');
    function step(d) { s.scrollBy({ left: d * s.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  });

  /* Process line draws with scroll */
  [].forEach.call(document.querySelectorAll('[data-steps]'), function (steps) {
    var fill = steps.querySelector('.steps__fill');
    var lis = steps.querySelectorAll('.step');
    function prog() {
      var r = steps.getBoundingClientRect();
      var p = (innerHeight * 0.75 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      if (fill) fill.style.transform = (innerWidth >= 900 ? 'scaleX(' : 'scaleY(') + (reduce ? 1 : p) + ')';
      [].forEach.call(lis, function (li, i) { li.classList.toggle('is-on', reduce || p >= (i + 0.25) / lis.length); });
    }
    addEventListener('scroll', prog, { passive: true }); addEventListener('resize', prog); prog();
  });

  /* Magnetic buttons (fine pointers only) */
  if (!reduce && matchMedia('(pointer: fine)').matches) {
    [].forEach.call(document.querySelectorAll('[data-magnet]'), function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.25;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    /* Cursor-following highlight on grids */
    [].forEach.call(document.querySelectorAll('[data-glow]'), function (g) {
      g.addEventListener('pointermove', function (e) {
        var r = g.getBoundingClientRect();
        g.style.setProperty('--gx', (e.clientX - r.left) + 'px'); g.style.setProperty('--gy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* Form validation with inline messages */
  var form = document.querySelector('form[data-validate]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 || 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) || 'Please write a phone number we can call.'; },
      email: function (v) { return v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'This email does not look right.'; },
      message: function (v) { return v.trim().length > 4 || 'Tell us a little about the job.'; }
    };
    function check(f) {
      var rule = rules[f.name]; if (!rule) return true;
      var ok = rule(f.value);
      var msg = form.querySelector('[data-err="' + f.name + '"]');
      f.setAttribute('aria-invalid', ok === true ? 'false' : 'true');
      if (msg) msg.textContent = ok === true ? '' : ok;
      return ok === true;
    }
    [].forEach.call(form.elements, function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      [].forEach.call(form.elements, function (f) { if (!check(f) && !bad) bad = f; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  /* Footer year */
  [].forEach.call(document.querySelectorAll('[data-year]'), function (el) { el.textContent = new Date().getFullYear(); });
})();
