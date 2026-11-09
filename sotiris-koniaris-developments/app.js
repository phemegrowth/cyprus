(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  doc.classList.remove('no-js');
  doc.classList.add('js');

  // Hero entrance starts on the first frame (no wait for fonts or images).
  requestAnimationFrame(function () { document.body.classList.add('go'); });

  // Footer year
  var y = document.querySelectorAll('.year');
  for (var i = 0; i < y.length; i++) y[i].textContent = new Date().getFullYear();

  // Header shrink
  var header = document.querySelector('.site-header');
  function onHeader() { header.classList.toggle('is-small', window.scrollY > 40); }
  onHeader();

  // Mobile menu
  var btn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function closeMenu() {
    nav.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  }
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // Smooth anchor scroll with header offset
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    if (id === '#') { e.preventDefault(); return; }
    var t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  });

  // Scroll reveals with above-the-fold guard and stagger
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function show(el) { el.classList.add('is-in'); }
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(show);
  } else {
    var groups = new Map();
    reveals.forEach(function (el) {
      var parent = el.parentElement;
      var n = groups.get(parent) || 0;
      el.style.setProperty('--d', Math.min(n * 80, 320) + 'ms');
      groups.set(parent, n + 1);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) show(el);
      else io.observe(el);
    });
  }

  // Hover / focus image swap in "What we do"
  var items = document.querySelectorAll('.build-item');
  var imgs = document.querySelectorAll('.swap-img');
  function activate(key) {
    for (var j = 0; j < imgs.length; j++) imgs[j].classList.toggle('is-on', imgs[j].getAttribute('data-key') === key);
    for (var k = 0; k < items.length; k++) items[k].classList.toggle('is-active', items[k].getAttribute('data-key') === key);
  }
  for (var m = 0; m < items.length; m++) {
    (function (it) {
      var key = it.getAttribute('data-key');
      it.addEventListener('mouseenter', function () { activate(key); });
      it.addEventListener('focus', function () { activate(key); });
    })(items[m]);
  }

  // Drag strip with progress bar
  var strip = document.querySelector('.strip');
  var bar = document.querySelector('.strip-bar i');
  if (strip) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    var onStrip = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? strip.scrollLeft / max : 1;
      bar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
    };
    strip.addEventListener('scroll', onStrip, { passive: true });
    onStrip();
  }

  // Magnetic buttons (pointer devices only)
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.18;
        var dy = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  // Scroll-linked: hero parallax and the process line drawing
  var heroPhoto = document.querySelector('.hero-photo');
  var steps = document.querySelector('.steps');
  var line = document.querySelector('.steps-line');
  var ticking = false;
  function onScroll() {
    onHeader();
    if (!reduce) {
      var sy = window.scrollY;
      if (heroPhoto && sy < window.innerHeight * 1.2) heroPhoto.style.transform = 'translate3d(0,' + (sy * 0.12).toFixed(1) + 'px,0)';
      if (steps && line) {
        var r = steps.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        p = Math.max(0, Math.min(1, p));
        line.style.setProperty('--p', p.toFixed(3));
      }
    }
    ticking = false;
  }
  if (!reduce && line) line.style.setProperty('--p', '0');
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Form validation with inline messages
  var form = document.querySelector('form.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please add a valid email address.'; },
      'property-type': function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about what you need, please.'; }
    };
    function check(el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var field = el.closest('.field');
      field.classList.toggle('has-err', !!msg);
      field.querySelector('.err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el)) { ok = false; if (!first) first = el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('blur', function (e) {
      if (e.target.name && rules[e.target.name] && e.target.value) check(e.target);
    }, true);
  }
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".about-photo img", "up"], [".card-img", "up", 90], [".map-route", "left"]], "tilt": [".card"], "magnet": [".btn-ghost"]};
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
