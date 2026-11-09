/* Pourikkos Homes: header, menu, hero entrance, reveals, service photo swap, project viewer,
   drag strip, step line, count-up, form validation. No dependencies. */
(function () {
  'use strict';
  window.__pk = true;
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* Very tall windows are full-page captures: show the final state at once */
  if (window.innerHeight > 1600) { reduce = true; root.classList.add('is-static'); }

  /* Hero entrance: start on the first frame, do not wait for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) hero.classList.add('is-in');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keepFocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var a = menu.querySelector('a'); if (a) a.focus(); }
    else if (!keepFocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals with stagger; anything already on screen shows at once */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(n * 0.08, 0.4) + 's');
    groups.set(p, n + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var swap = d.querySelector('[data-swap]');
  var photos = d.querySelectorAll('.build__photo img');
  if (swap && photos.length) {
    swap.querySelectorAll('.svc__item').forEach(function (li) {
      function on() {
        var i = +li.getAttribute('data-img');
        swap.querySelectorAll('.svc__item').forEach(function (x) { x.classList.toggle('is-active', x === li); });
        photos.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
      }
      li.addEventListener('mouseenter', on);
      li.addEventListener('focusin', on);
    });
  }

  /* Project viewer thumbnails */
  var main = d.querySelector('[data-viewer]');
  var thumbs = d.querySelectorAll('.thumb');
  thumbs.forEach(function (b) {
    b.addEventListener('click', function () {
      if (!main || b.classList.contains('is-on')) return;
      thumbs.forEach(function (x) { x.classList.toggle('is-on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      function set() { main.src = b.getAttribute('data-src'); main.alt = b.getAttribute('data-alt'); }
      if (reduce) { set(); return; }
      main.classList.add('is-fading');
      setTimeout(function () {
        set();
        var done = function () { main.classList.remove('is-fading'); };
        if (main.complete) requestAnimationFrame(done); else main.onload = done;
      }, 300);
    });
  });

  /* Drag strip (mouse); touch and trackpad scroll natively */
  var strip = d.querySelector('[data-drag]');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
      strip.classList.add('is-dragging');
      strip.setPointerCapture(e.pointerId);
    });
    strip.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      strip.scrollLeft = sl - dx;
    });
    function up() { down = false; strip.classList.remove('is-dragging'); }
    strip.addEventListener('pointerup', up);
    strip.addEventListener('pointercancel', up);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* Step line draws with scroll */
  var steps = d.querySelector('[data-progress]');
  var line = steps ? steps.querySelector('.steps__line') : null;
  if (steps && line && !reduce) {
    var ticking = false;
    function draw() {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var start = window.innerHeight * 0.75;
      var p = (start - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      line.style.setProperty('--p', p.toFixed(3));
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(draw); } }, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  } else if (line) {
    line.style.setProperty('--p', '1');
  }

  /* Count-up of years since founding (1992, from the registry) */
  var yearNow = new Date().getFullYear();
  d.querySelectorAll('[data-count-from]').forEach(function (el) {
    var target = yearNow - (+el.getAttribute('data-count-from'));
    el.textContent = target;
    if (reduce || !('IntersectionObserver' in window)) return;
    var started = false;
    var co = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting || started) return;
      started = true; co.disconnect();
      var t0 = null, dur = 1400;
      function step(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(step);
      }
      el.textContent = '0';
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    co.observe(el);
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = yearNow; });

  /* Form validation */
  var form = d.querySelector('[data-form]');
  if (form) {
    var msgs = { name: 'Please write your name.', phone: 'Please add a phone number we can call.', email: 'Please add a valid email.', topic: 'Please choose one.', message: 'Please write a short message.' };
    function check(f) {
      var field = f.closest('.field');
      var err = field ? field.querySelector('.err') : null;
      var v = (f.value || '').trim();
      var bad = !v;
      if (!bad && f.type === 'email') bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!bad && f.type === 'tel') bad = v.replace(/\D/g, '').length < 8;
      if (field) field.classList.toggle('is-bad', bad);
      if (err) err.textContent = bad ? (msgs[f.name] || 'Please fill this in.') : '';
      f.setAttribute('aria-invalid', bad ? 'true' : 'false');
      return !bad;
    }
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".build__photo", "up"], [".viewer__frame", "iris"], [".about__photo > img", "left"], [".map__route", "left"], [".strip__card img", "up", 90]], "tilt": [".strip__card"]};
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
