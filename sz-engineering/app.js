/* S-Z Engineering home: hero draw-in, header, menu, reveals, count-up, service swap, drag strip,
   process line, anchors, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, do not wait for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) hero.classList.add('is-in');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (focusBack) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true); });
  }

  /* Disabled language link */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); }); });

  /* Smooth anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.offsetHeight - 8 : 0;
      var y = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : off);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Count-up (quantities only) */
  function countUp(el) {
    var to = parseInt(el.getAttribute('data-to'), 10);
    if (reduce || isNaN(to)) { el.textContent = to; return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* Scroll reveals with above-the-fold guard */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--rd', Math.min(n, 5) * 80 + 'ms');
    groups.set(p, n + 1);
  });
  function show(el) {
    el.classList.add('is-in');
    el.querySelectorAll('.count').forEach(countUp);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el);
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover / focus / tap swaps the photo */
  var svc = d.querySelectorAll('.svc__item');
  var imgs = d.querySelectorAll('.swap img');
  var num = d.querySelector('.swap__num');
  function activate(key) {
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
    svc.forEach(function (it) { it.classList.toggle('is-active', it.getAttribute('data-key') === key); });
    if (num) num.textContent = '0' + key;
  }
  svc.forEach(function (it) {
    var k = it.getAttribute('data-key');
    it.addEventListener('mouseenter', function () { activate(k); });
    it.addEventListener('focus', function () { activate(k); });
    it.addEventListener('click', function () { activate(k); });
  });
  if (svc.length) activate('1');

  /* Drag strip with buttons */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var section = strip.closest('section');
    var prev = section && section.querySelector('[data-prev]');
    var next = section && section.querySelector('[data-next]');
    function by(dir) {
      var shot = strip.querySelector('.shot');
      var w = shot ? shot.getBoundingClientRect().width + 16 : 320;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { by(-1); });
    if (next) next.addEventListener('click', function () { by(1); });
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
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { strip.classList.remove('is-drag'); }, 0);
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* Process line draws with scroll (transform only) */
  var steps = d.querySelector('[data-steps]');
  var fill = d.querySelector('.steps__fill');
  var ticking = false;
  function drawLine() {
    ticking = false;
    if (!steps || !fill || reduce) return;
    var r = steps.getBoundingClientRect();
    var start = window.innerHeight * 0.75;
    var p = (start - r.top) / r.height;
    p = Math.max(0, Math.min(1, p));
    fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
  }
  function onScroll() {
    onScrollHeader();
    if (!ticking) { ticking = true; requestAnimationFrame(drawLine); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Form validation */
  var form = d.querySelector('form.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'work-type': function (v) { return v ? '' : 'Please choose the type of work.'; },
      message: function (v) { return v.trim().length >= 5 ? '' : 'A few words about the job, please.'; }
    };
    function check(el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var field = el.closest('.field');
      var err = field && field.querySelector('.err');
      if (field) field.classList.toggle('is-bad', !!msg);
      if (err) err.textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el)) { ok = false; if (!first) first = el; }
      });
      if (!ok) { e.preventDefault(); if (first) first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".about__fig img", "iris"], [".services__media .swap", "left"], [".shot figure", "up", 90]], "spot": [".shot figure"], "magnet": [".btn--accent"]};
  var d = document, R = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerHeight > 1600;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function all(s) { return Array.prototype.slice.call(d.querySelectorAll(s)); }
  if (reduce) return;
  R.classList.add('pz');

  if (C.progress) {
    var bar = d.createElement('div');
    bar.className = 'pz-progress' + (C.progress === 'v' ? ' pz-progress--v' : '');
    bar.setAttribute('aria-hidden', 'true');
    d.body.appendChild(bar);
    var tk = 0;
    var upd = function () {
      tk = 0;
      var h = R.scrollHeight - window.innerHeight;
      var v = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.transform = (C.progress === 'v' ? 'scaleY(' : 'scaleX(') + v.toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () { if (!tk) tk = requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* A fully clipped element never reports as intersecting, so we watch its parent instead */
  var watch = [];
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      watch.forEach(function (w) { if (w[0] === e.target) w[1].classList.add('pz-in'); });
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 }) : null;
  /* Lazy images inside a clipped box never load on their own (the browser sees them as hidden): start them early */
  var pre = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; });
      pre.unobserve(e.target);
    });
  }, { rootMargin: '900px 0px 900px 0px' }) : null;
  (C.clip || []).forEach(function (c) {
    all(c[0]).forEach(function (el, i) {
      el.classList.add('pz-clip', 'pz-clip--' + (c[1] || 'up'));
      if (c[2]) el.style.transitionDelay = (i * c[2]) + 'ms';
      if (!io || el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('pz-in'); }); });
      } else { var p = el.parentElement || el; watch.push([p, el]); io.observe(p); if (pre) pre.observe(p); }
    });
  });

  function follow(el, cls, fn) {
    var raf = 0, ev = null;
    el.classList.add(cls);
    el.addEventListener('pointermove', function (e) {
      ev = e; el.classList.add('pz-on');
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; var b = el.getBoundingClientRect(); fn((ev.clientX - b.left) / b.width - 0.5, (ev.clientY - b.top) / b.height - 0.5, ev.clientX - b.left, ev.clientY - b.top); });
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('pz-on'); if (raf) { cancelAnimationFrame(raf); raf = 0; } fn(null); });
  }
  if (fine) {
    (C.tilt || []).forEach(function (s) {
      all(s).forEach(function (el) {
        follow(el, 'pz-tilt', function (x, y) {
          el.style.transform = x === null ? '' : 'perspective(1000px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-6px)';
        });
      });
    });
    (C.magnet || []).forEach(function (s) {
      all(s).forEach(function (el) {
        follow(el, 'pz-mag', function (x, y) {
          el.style.transform = x === null ? '' : 'translate(' + (x * 14).toFixed(1) + 'px, ' + (y * 10).toFixed(1) + 'px)';
        });
      });
    });
    (C.spot || []).forEach(function (s) {
      all(s).forEach(function (el) {
        var g = d.createElement('span'); g.className = 'pz-glow'; g.setAttribute('aria-hidden', 'true'); el.appendChild(g);
        follow(el, 'pz-spot', function (x, y, px, py) { if (x !== null) g.style.transform = 'translate(' + px.toFixed(0) + 'px, ' + py.toFixed(0) + 'px)'; });
      });
    });
  }

  if (C.index && io) {
    var secs = all(C.index);
    if (secs.length > 2) {
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var ix = d.createElement('div'); ix.className = 'pz-index'; ix.setAttribute('aria-hidden', 'true');
      ix.innerHTML = '<span class="pz-index__n">01</span><span class="pz-index__bar"><i></i></span><span>' + pad(secs.length) + '</span>';
      d.body.appendChild(ix);
      var num = ix.querySelector('.pz-index__n'), fill = ix.querySelector('i');
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = secs.indexOf(e.target) + 1;
          num.textContent = pad(k);
          fill.style.transform = 'scaleX(' + (k / secs.length).toFixed(3) + ')';
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(function (s) { sio.observe(s); });
    }
  }
})();

/* == /polish == */
