/* Sevasco Metalworks: hero entrance and parallax, header, menu, reveals, count-up, accordion,
   drag strip, process line, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Hero entrance runs as CSS keyframes from the first frame (styles.css), no JS wait */
  var hero = d.querySelector('.hero');

  /* Header shrink, hero parallax, process line, strip bar: one scroll loop */
  var header = d.querySelector('[data-header]');
  var par = d.querySelector('[data-par]');
  var steps = d.querySelector('[data-steps]');
  var fill = d.querySelector('[data-steps-fill]');
  var stepItems = steps ? steps.querySelectorAll('.step') : [];
  var ticking = false;

  function update() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    if (header) header.classList.toggle('is-small', y > 40);

    if (par && !reduce && hero) {
      var hb = hero.getBoundingClientRect();
      if (hb.bottom > 0) {
        /* photo travels slower than the page: moves down at 22% of the scroll */
        par.style.transform = 'translate3d(0,' + (Math.max(0, -hb.top) * 0.22).toFixed(1) + 'px,0)';
      }
    }

    if (steps && fill) {
      var sb = steps.getBoundingClientRect();
      var vertical = window.matchMedia('(max-width: 860px)').matches;
      var p = (vh * 0.75 - sb.top) / (sb.height || 1);
      p = Math.min(1, Math.max(0, p));
      if (reduce) p = 1;
      fill.style.transform = vertical ? 'scaleY(' + p.toFixed(3) + ')' : 'scaleX(' + p.toFixed(3) + ')';
      for (var i = 0; i < stepItems.length; i++) {
        var at = vertical ? (stepItems[i].offsetTop / (sb.height || 1)) : (i / stepItems.length);
        stepItems[i].classList.toggle('is-on', p > at + 0.02 || p === 1);
      }
    }
  }
  function onScroll() { if (!ticking) { ticking = true; raf(update); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* Mobile menu: opens, closes on link click and on Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.hasAttribute('data-noop')) { e.preventDefault(); return; }
      var id = a.getAttribute('href');
      if (id === '#' ) { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Scroll reveals, staggered; anything already on screen shows at once */
  var items = d.querySelectorAll('.r');
  items.forEach(function (el) {
    var n = 0, s = el.previousElementSibling;
    while (s) { if (s.classList.contains('r')) n++; s = s.previousElementSibling; }
    el.style.setProperty('--d', (Math.min(n, 6) * 0.08) + 's');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Count-up: sourced figure only (24 years since registration, May 2002) */
  var counters = d.querySelectorAll('[data-count]');
  function runCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !end) { el.textContent = end; return; }
    var t0 = null, dur = 1200;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) raf(step);
    }
    el.textContent = '0';
    raf(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Accordion with height animation */
  var acc = d.querySelector('[data-acc]');
  if (acc) {
    var btns = acc.querySelectorAll('.acc__btn');
    btns.forEach(function (b) {
      var panel = d.getElementById(b.getAttribute('aria-controls'));
      if (b.getAttribute('aria-expanded') !== 'true' && panel) panel.classList.add('is-closed');
      b.addEventListener('click', function () {
        var open = b.getAttribute('aria-expanded') === 'true';
        btns.forEach(function (o) {
          o.setAttribute('aria-expanded', 'false');
          var p = d.getElementById(o.getAttribute('aria-controls'));
          if (p) p.classList.add('is-closed');
        });
        if (!open) {
          b.setAttribute('aria-expanded', 'true');
          if (panel) panel.classList.remove('is-closed');
        }
      });
    });
  }

  /* Drag strip: pointer drag, arrow buttons, progress bar */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var bar = strip.querySelector('[data-strip-bar]');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (!track) return;
    function setBar() {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var vis = track.clientWidth / (track.scrollWidth || 1);
      var p = max > 0 ? track.scrollLeft / max : 0;
      bar.style.transform = 'translateX(' + (p * (1 / vis - 1) * 100).toFixed(2) + '%) scaleX(1)';
      bar.style.width = (vis * 100).toFixed(2) + '%';
    }
    track.addEventListener('scroll', function () { raf(setBar); }, { passive: true });
    window.addEventListener('resize', setBar);
    setBar();
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, sx = 0, sl = 0, moved = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      moved = Math.abs(dx);
      if (moved > 4) track.classList.add('is-drag');
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      track.classList.remove('is-drag');
    });
  });

  /* Form validation with inline messages */
  var form = d.querySelector('[data-form]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email address.'; },
      'work-type': function (v) { return v ? '' : 'Please choose the type of work.'; },
      message: function (v) { return v.trim().length >= 5 ? '' : 'Please tell us a little about the job.'; }
    };
    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      var field = input.closest('.field');
      if (field) {
        field.classList.toggle('has-error', !!msg);
        var err = field.querySelector('.field__err');
        if (err) err.textContent = msg;
      }
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field.has-error')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!check(el)) { ok = false; if (!firstBad) firstBad = el; }
      });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
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
  var C = {"progress": true, "clip": [[".about__fig img", "left"], [".card__img", "up", 80]], "spot": [".card__img"]};
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
