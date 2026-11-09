/* The Bernoulli Trading Co: header, menu, reveals, image swap, drag strip, count-up, process line, parallax, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Remove the curtain from the tree once it has lifted */
  var curtain = d.querySelector('.curtain');
  if (curtain) {
    if (reduce) { curtain.remove(); }
    else {
      curtain.addEventListener('animationend', function (e) { if (e.target === curtain) curtain.remove(); });
      setTimeout(function () { if (curtain.parentNode) curtain.remove(); }, 1600);
    }
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }

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

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = t.getBoundingClientRect().top + window.scrollY - (id === '#top' ? 0 : off - 1);
      window.scrollTo({ top: id === '#top' ? 0 : y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals with above-the-fold guard and stagger */
  var groups = {};
  d.querySelectorAll('.r').forEach(function (el) {
    var p = el.parentElement;
    var k = p ? (p.__rk || (p.__rk = Math.random())) : 0;
    groups[k] = (groups[k] || 0);
    el.style.setProperty('--d', Math.min(groups[k], 6));
    groups[k]++;
  });
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Service list: hover or focus swaps the sticky image */
  var imgs = d.querySelectorAll('[data-swap]');
  var num = d.querySelector('[data-swap-num]');
  var svc = d.querySelectorAll('[data-swap-to]');
  function swap(i) {
    imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap') === String(i)); });
    svc.forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-swap-to') === String(i)); });
    if (num) num.textContent = ('0' + (Number(i) + 1)).slice(-2);
  }
  svc.forEach(function (s) {
    var i = s.getAttribute('data-swap-to');
    s.addEventListener('mouseenter', function () { swap(i); });
    s.addEventListener('focus', function () { swap(i); });
    s.addEventListener('click', function () { swap(i); });
  });
  if (svc.length) swap(0);
  /* On scroll, the item nearest the middle of the screen takes over (desktop and phone) */
  if ('IntersectionObserver' in window && svc.length) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) swap(en.target.getAttribute('data-swap-to')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    svc.forEach(function (s) { so.observe(s); });
  }

  /* Drag strip with buttons */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var sec = strip.closest('section');
    var prev = sec && sec.querySelector('[data-prev]');
    var next = sec && sec.querySelector('[data-next]');
    function step(dir) {
      var t = strip.querySelector('.tile');
      var w = t ? t.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
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
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  });

  /* Count-up: years in business only */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var end = Number(el.getAttribute('data-count'));
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = end; return; }
    el.textContent = '0';
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        co.disconnect();
        var t0 = null, dur = 1400;
        function tick(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / dur, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    co.observe(el);
  });

  /* Process line draws with scroll; hero photo parallax */
  var steps = d.querySelector('[data-steps]');
  var bar = steps && steps.querySelector('.steps__line span');
  var frame = d.querySelector('[data-parallax]');
  var ticking = false;
  function frameUpdate() {
    ticking = false;
    onScroll();
    if (reduce) return;
    var vh = window.innerHeight;
    if (bar) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      var vertical = window.matchMedia('(max-width: 640px)').matches;
      bar.style.transform = vertical ? 'scaleY(' + p + ')' : 'scaleX(' + p + ')';
    }
    if (frame && window.scrollY < vh * 1.2) {
      frame.style.transform = 'translate3d(0,' + (window.scrollY * 0.12).toFixed(1) + 'px,0)';
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frameUpdate); } }, { passive: true });
  window.addEventListener('resize', frameUpdate);
  frameUpdate();

  /* Form validation */
  var form = d.querySelector('form[name="enquiry-the-bernoulli-trading-co"]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      need: function (v) { return v ? '' : 'Please choose what you need.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about the pool, please.'; }
    };
    function check(field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var msg = rule(field.value);
      var box = field.closest('.field');
      if (box) {
        box.classList.toggle('is-bad', !!msg);
        var err = box.querySelector('.field__err');
        if (err) err.textContent = msg;
      }
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (f) f.addEventListener('blur', function () { if (f.value) check(f); });
      if (f) f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f)) { ok = false; if (!first) first = f; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  var y = d.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".tile img", "up", 90], [".years__media", "up"], [".about__media img", "up"], [".pools__media", "up"]], "spot": [".tile"], "magnet": [".btn--lift"]};
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
