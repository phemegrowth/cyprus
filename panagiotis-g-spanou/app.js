/* Core: header, menu, anchors, reveals, count-up, progress line, magnetic buttons, drag strip, accordion, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__reduce = reduce;

  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Count-up: quantities only */
  function countUp(el, dur) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    if (isNaN(end) || reduce) { el.textContent = end.toFixed(dec); return; }
    var start = null;
    function tick(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      el.textContent = (end * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(tick);
    }
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(tick);
  }
  window.__countUp = countUp;

  /* Reveals with the above-the-fold guard. Observe the element itself (never clipped); children may clip. */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i, 6) * 80 + 'ms');
    groups.set(p, i + 1);
  });
  function show(el) {
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(function (c) { countUp(c, 1300); });
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (refocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Language switch is a visible no-op for now */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Progress line that draws on scroll */
  var steps = d.querySelectorAll('[data-progress]');
  function progress() {
    steps.forEach(function (s) {
      if (reduce) { s.style.setProperty('--p', '1'); return; }
      var r = s.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.8 - r.top) / (r.height + vh * 0.2);
      s.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
  }

  /* Per-site scroll hooks */
  window.__scrollHooks = window.__scrollHooks || [];
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      onScroll(); progress();
      window.__scrollHooks.forEach(function (f) { f(); });
      ticking = false;
    });
  }, { passive: true });
  window.addEventListener('resize', progress);
  onScroll(); progress();

  /* Magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.mag').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* Horizontal drag strip */
  d.querySelectorAll('.drag').forEach(function (strip) {
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Accordion with height animation */
  d.querySelectorAll('.acc__item').forEach(function (item, i, all) {
    var btn = item.querySelector('.acc__btn');
    var panel = item.querySelector('.acc__panel');
    if (!btn || !panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      all.forEach(function (o) {
        var b = o.querySelector('.acc__btn'), p = o.querySelector('.acc__panel');
        b.setAttribute('aria-expanded', 'false'); o.classList.remove('is-open'); p.style.maxHeight = '0px';
      });
      if (open) {
        btn.setAttribute('aria-expanded', 'true'); item.classList.add('is-open');
        panel.style.maxHeight = panel.scrollHeight + 'px';
        if (window.__onAcc) window.__onAcc(item);
      }
    });
    if (item.classList.contains('is-open')) panel.style.maxHeight = 'none';
  });

  /* Form validation */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Please add your name.', phone: 'Please add a phone number we can call.', email: 'Please add a valid email.', message: 'Please write a short message.' };
    function check(f) {
      var field = f.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      var ok = f.value.trim() !== '';
      if (ok && f.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
      if (ok && f.type === 'tel') ok = f.value.replace(/[^0-9]/g, '').length >= 8;
      if (field) field.classList.toggle('has-error', !ok);
      if (err) err.textContent = ok ? '' : (msgs[f.name] || 'Please choose one.');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    var req = form.querySelectorAll('[required]');
    req.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-error')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      req.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* Spanou: curtain hero on the first frame, list hover image swap. */
(function () {
  'use strict';
  var d = document;
  if (!window.__reduce) requestAnimationFrame(function () { d.documentElement.classList.add('js-ready'); });
  else d.documentElement.classList.add('js-ready');

  var imgs = d.querySelectorAll('.work__swap img');
  var items = d.querySelectorAll('.list__item');
  function swap(key) {
    imgs.forEach(function (i) { i.classList.toggle('is-on', i.getAttribute('data-key') === key); });
    items.forEach(function (i) { i.classList.toggle('is-hot', i.getAttribute('data-key') === key); });
  }
  items.forEach(function (it) {
    it.addEventListener('mouseenter', function () { swap(it.getAttribute('data-key')); });
    it.addEventListener('focus', function () { swap(it.getAttribute('data-key')); });
  });
})();
