/* D.H. Constructions, homepage behaviour. Vanilla JS, no libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, never wait for fonts or images */
  requestAnimationFrame(function () { root.classList.add('is-loaded'); });

  /* Header shrinks on scroll, scroll progress */
  var header = document.querySelector('.header');
  var bar = document.querySelector('.progress span');
  function onScroll() {
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-small', y > 40);
    if (bar) {
      var h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
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

  /* Scroll reveals: things already in view show at once */
  var items = [].slice.call(document.querySelectorAll('.reveal, .reveal-clip, [data-draw]'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add('in');
      else io.observe(el);
    });
  }
  /* stagger children of a group */
  [].forEach.call(document.querySelectorAll('[data-stagger]'), function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.transitionDelay = (i * 80) + 'ms'; });
  });

  /* Services list: hover or focus swaps the photo */
  var swap = document.querySelector('[data-swap]');
  if (swap) {
    var figs = swap.querySelectorAll('.swap__fig img');
    var rows = swap.querySelectorAll('[data-img]');
    [].forEach.call(rows, function (row) {
      function show() {
        var n = row.getAttribute('data-img');
        [].forEach.call(rows, function (r) { r.classList.toggle('is-on', r === row); });
        [].forEach.call(figs, function (f) { f.classList.toggle('is-on', f.getAttribute('data-for') === n); });
      }
      row.addEventListener('mouseenter', show);
      row.addEventListener('focusin', show);
      row.addEventListener('click', show);
    });
  }

  /* Drag strip for the work photos */
  [].forEach.call(document.querySelectorAll('[data-drag]'), function (s) {
    var down = false, sx = 0, sl = 0, moved = false;
    s.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; s.classList.add('is-drag');
    });
    addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true;
      s.scrollLeft = sl - dx;
    });
    addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    var prev = s.parentNode.querySelector('[data-prev]');
    var next = s.parentNode.querySelector('[data-next]');
    function step(d) { s.scrollBy({ left: d * s.clientWidth * 0.7, behavior: reduce ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  });

  /* Process line draws with scroll */
  var steps = document.querySelector('[data-steps]');
  if (steps) {
    var fill = steps.querySelector('.steps__fill');
    var lis = steps.querySelectorAll('.step');
    function prog() {
      var r = steps.getBoundingClientRect();
      var p = (innerHeight * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      if (fill) fill.style.transform = (innerWidth >= 900 ? 'scaleX(' : 'scaleY(') + (reduce ? 1 : p) + ')';
      [].forEach.call(lis, function (li, i) { li.classList.toggle('is-on', reduce || p >= (i + 0.3) / lis.length); });
    }
    addEventListener('scroll', prog, { passive: true });
    addEventListener('resize', prog);
    prog();
  }

  /* Slow drift on the hero photo with scroll (transform only) */
  var drift = document.querySelector('[data-drift]');
  if (drift && !reduce) {
    addEventListener('scroll', function () {
      var extra = drift.offsetHeight - drift.parentNode.offsetHeight;
      var y = Math.min(scrollY * 0.12, Math.max(0, extra));
      drift.style.transform = 'translate3d(0,' + (-y).toFixed(1) + 'px,0)';
    }, { passive: true });
  }

  /* Accordion with height animation */
  [].forEach.call(document.querySelectorAll('[data-acc] .acc__btn'), function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc__item');
      var open = btn.getAttribute('aria-expanded') === 'true';
      [].forEach.call(item.parentNode.querySelectorAll('.acc__item'), function (it) {
        it.classList.remove('is-open');
        it.querySelector('.acc__btn').setAttribute('aria-expanded', 'false');
      });
      if (!open) { item.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
    });
  });

  /* Before and after slider */
  [].forEach.call(document.querySelectorAll('[data-ba]'), function (ba) {
    var range = ba.querySelector('input[type=range]');
    function set(v) { ba.style.setProperty('--pos', v + '%'); }
    if (range) { range.addEventListener('input', function () { set(range.value); }); set(range.value); }
  });

  /* Form validation with inline messages */
  var form = document.querySelector('form[data-validate]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 || 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()]{6,}$/.test(v.trim()) || 'Please write a phone number we can call.'; },
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
