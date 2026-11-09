/* Finishing Touch Cyprus: curtain hero, line reveals, scroll progress, service photo swap, before and after, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('rm');

  /* Hero entrance starts on the first frame; fonts and images are not awaited */
  requestAnimationFrame(function () { requestAnimationFrame(function () { d.body.classList.add('is-in'); }); });

  /* Header shrink, scroll progress, parallax, drift, process line */
  var header = d.querySelector('.hdr');
  var bar = d.querySelector('.progress span');
  var par = [].slice.call(d.querySelectorAll('[data-parallax]'));
  var drift = [].slice.call(d.querySelectorAll('[data-drift]'));
  var lines = [].slice.call(d.querySelectorAll('[data-line]'));
  var ring = d.querySelector('.totop');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    if (header) header.classList.toggle('is-small', y > 40);
    var max = d.documentElement.scrollHeight - vh;
    var p = max > 0 ? Math.min(1, y / max) : 0;
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    if (ring) { ring.style.setProperty('--p', p.toFixed(4)); ring.classList.toggle('is-on', y > vh * 0.8); }
    lines.forEach(function (el) {
      if (reduce) { el.style.setProperty('--p', 1); return; }
      var r = el.getBoundingClientRect();
      var q = (vh * 0.8 - r.top) / (r.height + vh * 0.2);
      el.style.setProperty('--p', Math.max(0, Math.min(1, q)).toFixed(3));
    });
    if (reduce) return;
    par.forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-parallax')) || 0.15;
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      el.style.transform = 'translate3d(0,' + ((r.top) * -k).toFixed(1) + 'px,0)';
    });
    drift.forEach(function (el) {
      var k = parseFloat(el.getAttribute('data-drift')) || 0.3;
      var r = el.getBoundingClientRect();
      var lim = Math.max(0, el.scrollWidth - el.parentElement.clientWidth);
      var t = Math.min(lim, Math.max(0, (vh - r.top) - vh * 0.6) * k);
      el.style.transform = 'translate3d(' + (-t).toFixed(1) + 'px,0,0)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Mobile menu: closes on link click and on Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keep) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); } else if (!keep) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    [].forEach.call(menu.querySelectorAll('a'), function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchors with header offset; the language switch is a visible no-op */
  [].forEach.call(d.querySelectorAll('a[href^="#"]'), function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id === '#') { e.preventDefault(); return; }
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var top = id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Reveals: anything already on screen shows at once, the rest on scroll */
  var rev = [].slice.call(d.querySelectorAll('[data-reveal]'));
  [].forEach.call(d.querySelectorAll('[data-stagger]'), function (g) {
    [].forEach.call(g.children, function (c, i) { c.style.setProperty('--d', (i * 80) + 'ms'); });
  });
  function show(el) { el.classList.add('is-shown'); countIn(el); }
  if (reduce || !('IntersectionObserver' in window)) { rev.forEach(show); }
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rev.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el); else io.observe(el);
    });
  }

  /* Count-up for sourced quantities only */
  function countIn(scope) {
    var els = scope.matches && scope.matches('[data-count]') ? [scope] : [].slice.call(scope.querySelectorAll('[data-count]'));
    els.forEach(function (el) {
      if (el.dataset.done) return; el.dataset.done = '1';
      var to = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      if (reduce) { el.textContent = to.toFixed(dec); return; }
      var t0 = null, dur = parseInt(el.getAttribute('data-dur') || '1200', 10);
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toFixed(dec);
        if (k < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  [].forEach.call(d.querySelectorAll('[data-count-now]'), function (el) { countIn(el); });

  /* Magnetic buttons (pointer devices only) */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    [].forEach.call(d.querySelectorAll('.mag'), function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25).toFixed(1) + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* Drag strip */
  [].forEach.call(d.querySelectorAll('[data-drag]'), function (s) {
    var down = false, sx = 0, sl = 0, moved = false;
    s.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = s.scrollLeft; s.classList.add('is-drag'); });
    window.addEventListener('pointerup', function () { down = false; s.classList.remove('is-drag'); });
    s.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) moved = true; s.scrollLeft = sl - dx; });
    s.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* Before and after slider */
  [].forEach.call(d.querySelectorAll('[data-ba]'), function (w) {
    var inp = w.querySelector('input[type=range]');
    if (!inp) return;
    function set() { w.style.setProperty('--pos', inp.value + '%'); }
    inp.addEventListener('input', set); set();
  });

  /* Accordion with height animation */
  [].forEach.call(d.querySelectorAll('[data-acc] button[aria-controls]'), function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') === 'true';
      var p = d.getElementById(b.getAttribute('aria-controls'));
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (p) p.style.setProperty('--h', open ? '0px' : p.scrollHeight + 'px');
      if (p) p.classList.toggle('is-open', !open);
    });
  });

  /* Cursor-following highlight on grids */
  [].forEach.call(d.querySelectorAll('[data-glow]'), function (g) {
    g.addEventListener('pointermove', function (e) {
      var r = g.getBoundingClientRect();
      g.style.setProperty('--mx', (e.clientX - r.left) + 'px'); g.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Please write your name.', phone: 'Please add a phone number we can call.', email: 'Please check the email address.', message: 'A line or two about the job helps.' };
    function check(f) {
      var ok = true, v = (f.value || '').trim();
      if (f.name === 'name') ok = v.length > 1;
      if (f.name === 'phone') ok = /^[+0-9 ()-]{8,}$/.test(v);
      if (f.name === 'email') ok = v === '' ? !f.required : /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);
      if (f.name === 'message') ok = v.length > 3;
      var m = d.getElementById(f.id + '-err');
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (m) m.textContent = ok ? '' : (msgs[f.name] || 'Please check this field.');
      return ok;
    }
    var fields = [].slice.call(form.querySelectorAll('[data-check]'));
    fields.forEach(function (f) { f.addEventListener('blur', function () { check(f); }); f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); }); });
    form.addEventListener('submit', function (e) {
      var bad = fields.filter(function (f) { return !check(f); });
      if (bad.length) { e.preventDefault(); bad[0].focus(); }
    });
  }

  /* Footer year */
  [].forEach.call(d.querySelectorAll('[data-year]'), function (el) { el.textContent = new Date().getFullYear(); });

  /* Services: hover or focus swaps the large photo */
  var svimg = d.querySelector('.svimg');
  var items = [].slice.call(d.querySelectorAll('.svlist li'));
  function act(li) {
    items.forEach(function (x) { x.classList.toggle('is-act', x === li); });
    if (!svimg) return;
    var k = li.getAttribute('data-img');
    [].forEach.call(svimg.querySelectorAll('img'), function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === k); });
  }
  items.forEach(function (li) {
    li.addEventListener('mouseenter', function () { act(li); });
    var b = li.querySelector('button'); if (b) { b.addEventListener('focus', function () { act(li); }); b.addEventListener('click', function () { act(li); }); }
  });
  if (items[0]) act(items[0]);
})();
