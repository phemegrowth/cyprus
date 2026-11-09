/* Prospect homepage behaviour. Vanilla JS, no libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('reduce');

  /* Hero entrance starts on the first frame, never waits for fonts or images */
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); });

  /* Footer year */
  var y = document.querySelectorAll('[data-year]');
  for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();

  /* Header shrink and scroll progress */
  var header = document.querySelector('.header');
  var bar = document.querySelector('.progress span');
  var ticking = false;
  function onScroll() {
    var s = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-small', s > 40);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, s / h) : 0) + ')';
    }
    var par = document.querySelectorAll('[data-parallax]');
    if (!reduce) for (var p = 0; p < par.length; p++) {
      var el = par[p], r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      el.style.transform = 'translate3d(0,' + (r.top * -k).toFixed(1) + 'px,0)';
    }
    var drift = document.querySelectorAll('[data-drift]');
    if (!reduce) for (var d = 0; d < drift.length; d++) {
      var de = drift[d], dr = de.parentElement.getBoundingClientRect();
      var kk = parseFloat(de.getAttribute('data-drift')) || 0.2;
      de.style.transform = 'translate3d(' + (Math.min(0, dr.top) * kk).toFixed(1) + 'px,0,0)';
    }
    var lines = document.querySelectorAll('[data-draw]');
    for (var l = 0; l < lines.length; l++) {
      var le = lines[l], lr = le.parentElement.getBoundingClientRect();
      var prog = (window.innerHeight * 0.75 - lr.top) / lr.height;
      prog = Math.max(0, Math.min(1, prog));
      le.style.transform = le.getAttribute('data-draw') === 'x' ? 'scaleX(' + prog + ')' : 'scaleY(' + prog + ')';
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var nav = document.getElementById('menu');
  function closeMenu() {
    if (!burger) return;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      document.body.classList.toggle('menu-open', !open);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
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
    var off = header ? header.offsetHeight + 8 : 0;
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - off, behavior: reduce ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });

  /* Count-up (sourced quantities only) */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    var sep = el.hasAttribute('data-sep');
    function fmt(v) {
      var s = v.toFixed(dec);
      return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s;
    }
    if (reduce) { el.textContent = fmt(to); return; }
    var dur = parseInt(el.getAttribute('data-dur') || '1400', 10), t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Scroll reveals, with the above-the-fold guard */
  var items = document.querySelectorAll('.reveal, [data-count]');
  if (!reduce) { var hz = document.querySelectorAll('.hero [data-count]'); for (var z = 0; z < hz.length; z++) hz[z].textContent = '0'; }
  function show(el) {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
    var inner = el.querySelectorAll('[data-count]');
    for (var c = 0; c < inner.length; c++) countUp(inner[c]);
  }
  if (!('IntersectionObserver' in window) || reduce) {
    for (var r = 0; r < items.length; r++) show(items[r]);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    for (var q = 0; q < items.length; q++) {
      var it = items[q];
      if (it.getBoundingClientRect().top < window.innerHeight && !it.closest('.hero')) show(it);
      else if (it.closest('.hero')) setTimeout(show.bind(null, it), 300);
      else io.observe(it);
    }
  }

  /* Magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var mags = document.querySelectorAll('.magnet');
    for (var m = 0; m < mags.length; m++) (function (b) {
      b.addEventListener('mousemove', function (e) {
        var rr = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - rr.left - rr.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - rr.top - rr.height / 2) * 0.28).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    })(mags[m]);
  }

  /* Cursor-following highlight */
  var spots = document.querySelectorAll('[data-spot]');
  for (var sp = 0; sp < spots.length; sp++) (function (g) {
    g.addEventListener('mousemove', function (e) {
      var rr = g.getBoundingClientRect();
      g.style.setProperty('--mx', (e.clientX - rr.left) + 'px');
      g.style.setProperty('--my', (e.clientY - rr.top) + 'px');
    });
  })(spots[sp]);

  /* Drag strip */
  var strips = document.querySelectorAll('[data-drag]');
  for (var ds = 0; ds < strips.length; ds++) (function (s) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; x0 = e.clientX; l0 = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - x0; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = l0 - dx; });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  })(strips[ds]);

  /* Accordion with height animation */
  var accs = document.querySelectorAll('.acc__btn');
  for (var ac = 0; ac < accs.length; ac++) (function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', String(!open));
      if (panel) panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
    });
  })(accs[ac]);

  /* Hover image swap */
  var swaps = document.querySelectorAll('[data-swap]');
  for (var sw = 0; sw < swaps.length; sw++) (function (it) {
    function act() {
      var group = it.closest('[data-swap-group]');
      if (!group) return;
      var imgs = group.querySelectorAll('[data-swap-img]');
      for (var k = 0; k < imgs.length; k++) imgs[k].classList.toggle('is-on', imgs[k].getAttribute('data-swap-img') === it.getAttribute('data-swap'));
      var its = group.querySelectorAll('[data-swap]');
      for (var k2 = 0; k2 < its.length; k2++) its[k2].classList.toggle('is-on', its[k2] === it);
    }
    it.addEventListener('mouseenter', act);
    it.addEventListener('focusin', act);
    it.addEventListener('click', act);
  })(swaps[sw]);

  /* Form validation with inline messages */
  var form = document.querySelector('form.form');
  if (form) {
    form.setAttribute('novalidate', '');
    function check(f) {
      var msg = '';
      var v = (f.value || '').trim();
      if (f.hasAttribute('required') && !v) msg = f.getAttribute('data-msg') || 'Please fill this in.';
      else if (f.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Please check the email address.';
      else if (f.type === 'tel' && v && v.replace(/\D/g, '').length < 8) msg = 'Please check the phone number.';
      var err = document.getElementById(f.id + '-err');
      if (err) err.textContent = msg;
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    var fields = form.querySelectorAll('input:not([type=hidden]):not([name=bot-field]), textarea, select');
    for (var ff = 0; ff < fields.length; ff++) fields[ff].addEventListener('blur', function () { check(this); });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      for (var k = 0; k < fields.length; k++) { if (!check(fields[k])) { ok = false; if (!first) first = fields[k]; } }
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }
})();
