/* JCL Properties: hero entrance, header, menu, anchors, reveals, count-up, scroll motion, swaps, accordion, drag strip, magnetic buttons, spotlight, form. No dependencies. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduce) d.documentElement.classList.add('rm');

  /* Hero entrance starts on the first frame; it never waits for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { hero.classList.add('is-ready'); });

  var header = d.querySelector('.header');
  var reels = d.querySelectorAll('[data-reel]');
  var plx = d.querySelectorAll('[data-plx]');
  var steps = d.querySelector('[data-steps]');
  var prog = d.querySelector('[data-progress]');
  var ticking = false;

  function motion() {
    ticking = false;
    var y = w.scrollY, vh = w.innerHeight;
    if (header) header.classList.toggle('is-small', y > 40);
    if (prog) {
      var max = d.documentElement.scrollHeight - vh;
      prog.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0).toFixed(4) + ')';
    }
    if (steps) {
      var p = 1;
      if (!reduce) {
        var r = steps.getBoundingClientRect();
        p = Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (r.height + vh * 0.1)));
      }
      steps.style.setProperty('--p', p.toFixed(3));
      var all = steps.querySelectorAll('.step');
      all.forEach(function (s, i) { s.classList.toggle('is-on', reduce || p >= (i + 0.3) / all.length); });
    }
    if (reduce) return;
    reels.forEach(function (reel) {
      var f = parseFloat(reel.getAttribute('data-reel')) || 0.3;
      var box = reel.parentNode.getBoundingClientRect();
      var start = box.top + y - vh;
      var lim = Math.max(0, Math.min(y - Math.max(0, start), vh * 1.6));
      var maxShift = Math.max(0, reel.scrollWidth - reel.parentNode.clientWidth);
      var shift = Math.min(lim * f, maxShift);
      reel.style.transform = 'translate3d(' + (-shift).toFixed(1) + 'px,0,0)';
    });
    plx.forEach(function (el) {
      var f = parseFloat(el.getAttribute('data-plx')) || 0.15;
      var r = el.parentNode.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var c = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (-c * f).toFixed(1) + 'px,0)';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(motion); } }
  w.addEventListener('scroll', onScroll, { passive: true });
  w.addEventListener('resize', onScroll);
  motion();

  /* Mobile menu: closes on link click and Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keep) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var f = menu.querySelector('a'); if (f) f.focus(); }
    else if (!keep) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchors with header offset; the EL switch is a visible no-op */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id === '#') return;
      var el = d.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var top = id === '#top' ? 0 : el.getBoundingClientRect().top + w.scrollY - off - 8;
      w.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Count-up for sourced figures only */
  function count(el) {
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    var dur = parseInt(el.getAttribute('data-dur') || '1400', 10);
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    var t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec);
      if (k < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Scroll reveals with the above-the-fold guard and a sibling stagger */
  var items = d.querySelectorAll('.r, [data-count]');
  d.querySelectorAll('.r').forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('r'); });
    el.style.setProperty('--d', (sibs.indexOf(el) * 80) + 'ms');
  });
  function show(el) { if (el.hasAttribute('data-count')) count(el); el.classList.add('is-in'); }
  if ('IntersectionObserver' in w && !reduce) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { if (x.isIntersecting) { show(x.target); io.unobserve(x.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < w.innerHeight) show(el); else io.observe(el);
    });
  } else items.forEach(show);

  /* Hover or focus swaps the photo beside a list */
  d.querySelectorAll('[data-swap-list]').forEach(function (box) {
    var rows = box.querySelectorAll('[data-target]');
    var imgs = box.querySelectorAll('[data-swap]');
    function on(i) {
      imgs.forEach(function (m) { m.classList.toggle('is-on', m.getAttribute('data-swap') === i); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-target') === i); });
    }
    rows.forEach(function (r) {
      var i = r.getAttribute('data-target');
      r.addEventListener('mouseenter', function () { on(i); });
      r.addEventListener('focusin', function () { on(i); });
      r.addEventListener('click', function () { on(i); });
    });
    if (rows.length) on(rows[0].getAttribute('data-target'));
  });

  /* Accordion with height animation */
  d.querySelectorAll('[data-acc] .acc__btn').forEach(function (btn) {
    var panel = d.getElementById(btn.getAttribute('aria-controls'));
    if (panel && btn.getAttribute('aria-expanded') === 'true') panel.style.maxHeight = panel.scrollHeight + 'px';
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      if (panel) panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
      var item = btn.closest('.acc__item');
      if (item) item.classList.toggle('is-open', !open);
    });
  });

  /* Drag strip: buttons, arrow keys and mouse drag */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var wrap = strip.closest('section') || d;
    function step(dir) {
      var card = strip.firstElementChild;
      var cw = card ? card.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * cw, behavior: reduce ? 'auto' : 'smooth' });
    }
    var pv = wrap.querySelector('[data-prev]'), nx = wrap.querySelector('[data-next]');
    if (pv) pv.addEventListener('click', function () { step(-1); });
    if (nx) nx.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, sx = 0, sl = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = strip.scrollLeft; });
    w.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); } strip.scrollLeft = sl - dx; });
    w.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  if (fine && !reduce) {
    /* Cursor-following highlight on grids */
    d.querySelectorAll('[data-spot]').forEach(function (g) {
      g.addEventListener('pointermove', function (e) {
        var r = g.getBoundingClientRect();
        g.style.setProperty('--x', (e.clientX - r.left) + 'px');
        g.style.setProperty('--y', (e.clientY - r.top) + 'px');
      });
    });
    /* Magnetic buttons */
    d.querySelectorAll('.mag').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    /* Tilt cards */
    d.querySelectorAll('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      kind: function (v) { return v ? '' : 'Please choose one option.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words, please.'; }
    };
    var check = function (el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value), f = el.closest('.field'), err = f ? f.querySelector('.err') : null;
      if (f) f.classList.toggle('is-bad', !!msg);
      if (err) err.textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    };
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { var f = el.closest('.field'); if (f && f.classList.contains('is-bad')) check(el); });
      el.addEventListener('change', function () { var f = el.closest('.field'); if (f && f.classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var bad = null;
      Object.keys(rules).forEach(function (n) { var el = form.elements[n]; if (el && !check(el) && !bad) bad = el; });
      if (bad) { e.preventDefault(); bad.focus(); }
    });
  }

  var yr = d.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();
})();
