/* Skill Hands homepage: vanilla JS, no libraries. */
(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.remove('no-js');
  root.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, no waiting for fonts or images. */
  var hero = document.querySelector('.hero');
  if (hero) {
    if (reduce) {
      hero.classList.add('is-in');
    } else {
      requestAnimationFrame(function () { hero.classList.add('is-in'); });
      setTimeout(function () { hero.classList.add('is-in'); }, 300); // safety if frames are throttled
    }
  }

  /* Slow hero drift on scroll (photo moves slower than the page). */
  var drift = document.querySelector('.capsule__drift');
  if (drift && !reduce) {
    var ticking = false;
    var onDrift = function () {
      var y = window.scrollY;
      if (y < window.innerHeight * 1.2) drift.style.transform = 'translate3d(0,' + (y * 0.12).toFixed(1) + 'px,0)';
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onDrift); } }, { passive: true });
  }

  /* Header shrinks on scroll. */
  var header = document.querySelector('.site-header');
  var onHeader = function () { if (header) header.classList.toggle('is-small', window.scrollY > 24); };
  onHeader();
  window.addEventListener('scroll', onHeader, { passive: true });

  /* Mobile menu: closes on link click and Escape. */
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.hidden = !open;
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    var id = a.getAttribute('href');
    if (id === '#') return; // Privacy / Cookies placeholders
    var target = id === '#top' ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var offset = header ? header.offsetHeight + 12 : 0;
    var top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* Scroll reveals, with the above-the-fold guard and a stagger per group. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var groups = new Map();
  reveals.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', (Math.min(i, 5) * 0.08) + 's');
    groups.set(p, i + 1);
  });
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-visible');
      else io.observe(el);
    });
  }

  /* Services: accordion with height animation, image swaps on hover and open. */
  var items = Array.prototype.slice.call(document.querySelectorAll('.svc__item'));
  var swaps = Array.prototype.slice.call(document.querySelectorAll('.swap__img'));
  function showImg(key) { swaps.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-key') === key); }); }
  items.forEach(function (item, idx) {
    var b = item.querySelector('.svc__btn');
    if (idx === 0) item.classList.add('is-open');
    b.addEventListener('click', function () {
      var open = !item.classList.contains('is-open');
      items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.svc__btn').setAttribute('aria-expanded', 'false'); });
      if (open) { item.classList.add('is-open'); b.setAttribute('aria-expanded', 'true'); showImg(item.getAttribute('data-key')); }
    });
    item.addEventListener('mouseenter', function () { showImg(item.getAttribute('data-key')); });
    b.addEventListener('focus', function () { showImg(item.getAttribute('data-key')); });
  });

  /* Work strip: drag to scroll with the mouse; touch and keys scroll natively. */
  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-dragging');
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-dragging'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* Process: progress line draws with scroll. */
  var steps = document.querySelector('.steps');
  var fill = document.querySelector('.steps__fill');
  if (steps && fill) {
    if (reduce) { fill.style.setProperty('--p', 1); }
    else {
      var onSteps = function () {
        var r = steps.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.7 - r.top) / r.height;
        fill.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      onSteps();
      window.addEventListener('scroll', function () { requestAnimationFrame(onSteps); }, { passive: true });
      window.addEventListener('resize', onSteps);
    }
  }

  /* Form validation with inline messages. */
  var form = document.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()]{6,}$/.test(v.trim()) ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'This email does not look right.'; },
      'job-type': function (v) { return v ? '' : 'Please choose the type of job.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A line or two about the job, please.'; }
    };
    function check(el) {
      var rule = rules[el.name];
      if (!rule) return true;
      var msg = rule(el.value);
      var field = el.closest('.field');
      field.classList.toggle('has-error', !!msg);
      field.querySelector('.field__err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el) && !first) first = el;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { if (el.value) check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-error')) check(el); });
    });
  }

  /* Footer year. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) { el.textContent = new Date().getFullYear(); });
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".about__photo img", "up"], [".card__img", "up", 80], [".services .swap", "iris"]], "tilt": [".card"], "index": "main > section, body > section"};
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
