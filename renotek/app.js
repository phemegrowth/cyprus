/* Renotek home: hero entrance and reel drift, header, menu, reveals, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var body = d.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first frame, never wait for fonts or images */
  requestAnimationFrame(function () { body.classList.add('is-loaded'); });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink, reel drift, process line: one rAF-throttled scroll handler */
  var header = d.querySelector('.header');
  var reel = d.querySelector('[data-reel]');
  var steps = d.querySelector('[data-steps]');
  var fill = d.querySelector('[data-steps-fill]');
  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (reduce) return;
    if (reel) {
      var max = Math.max(0, reel.scrollWidth - reel.parentNode.clientWidth * 0.6);
      var x = Math.min(max, y * 0.45);
      reel.style.setProperty('--rx', (-x).toFixed(1) + 'px');
    }
    if (steps && fill) {
      var r = steps.getBoundingClientRect();
      var start = window.innerHeight * 0.75;
      var p = (start - r.top) / (r.height);
      p = Math.max(0, Math.min(1, p));
      fill.parentNode.style.setProperty('--fill', p.toFixed(3));
      fill.style.setProperty('--fill', p.toFixed(3));
    }
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    body.style.overflow = open ? 'hidden' : '';
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
      var id = a.getAttribute('href');
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      if (id.length < 2) return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var top = t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, staggered among siblings; anything already on screen shows at once */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  items.forEach(function (el) {
    var sib = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('r'); });
    var i = sib.indexOf(el);
    if (i > 0) el.style.transitionDelay = Math.min(i, 5) * 80 + 'ms';
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

  /* Services: accordion plus hover image swap */
  var swap = d.querySelector('[data-swap]');
  var media = d.querySelectorAll('.svc__media img');
  if (swap) {
    var svcItems = swap.querySelectorAll('.svc__item');
    function activate(li) {
      svcItems.forEach(function (x) {
        var on = x === li;
        x.classList.toggle('is-active', on);
        x.querySelector('.svc__btn').setAttribute('aria-expanded', on ? 'true' : 'false');
      });
      var n = +li.getAttribute('data-img');
      media.forEach(function (img, i) { img.classList.toggle('is-on', i === n); });
    }
    svcItems.forEach(function (li) {
      li.querySelector('.svc__btn').addEventListener('click', function () { activate(li); });
      li.addEventListener('mouseenter', function () { if (window.matchMedia('(hover: hover)').matches) activate(li); });
    });
  }

  /* Work strip: drag with the mouse, progress bar follows */
  var strip = d.querySelector('[data-drag]');
  var bar = d.querySelector('[data-strip-progress]');
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
      if (moved > 4) strip.classList.add('is-dragging');
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-dragging'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
    function progress() {
      if (!bar) return;
      var m = strip.scrollWidth - strip.clientWidth;
      var p = m > 0 ? strip.scrollLeft / m : 1;
      bar.style.transform = 'scaleX(' + (0.2 + p * 0.8).toFixed(3) + ')';
    }
    strip.addEventListener('scroll', progress, { passive: true });
    progress();
  }

  /* Magnetic buttons (fine pointers only) */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.querySelectorAll('.magnet').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.3 - 2;
        el.style.setProperty('--mx', x.toFixed(1) + 'px');
        el.style.setProperty('--my', y.toFixed(1) + 'px');
      });
      el.addEventListener('pointerleave', function () {
        el.style.setProperty('--mx', '0px');
        el.style.setProperty('--my', '0px');
      });
    });
  }

  /* Form validation with inline messages */
  var form = d.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8; },
      email: function (v) { return v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()); },
      'job-type': function (v) { return v !== ''; },
      message: function (v) { return v.trim().length > 4; }
    };
    function check(input) {
      var ok = rules[input.name] ? rules[input.name](input.value) : true;
      var field = input.closest('.field');
      if (field) field.classList.toggle('is-bad', !ok);
      input.setAttribute('aria-invalid', ok ? 'false' : 'true');
      var err = field && field.querySelector('.field__err');
      if (err) { if (!err.id) err.id = 'err-' + input.name; input.setAttribute('aria-describedby', err.id); }
      return ok;
    }
    Object.keys(rules).forEach(function (n) {
      var input = form.elements[n];
      if (!input) return;
      input.addEventListener('blur', function () { if (input.value) check(input); });
      input.addEventListener('input', function () { if (input.closest('.field').classList.contains('is-bad')) check(input); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var input = form.elements[n];
        if (input && !check(input) && !first) first = input;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"clip": [[".about__photo > img", "iris"], [".svc__media", "up"]], "tilt": [".shot"], "index": "main > section, body > section"};
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

/* Before and after slider: works with or without motion; the intro sweep only runs when motion is allowed */
(function () {
  var ba = document.querySelector('[data-ba]');
  if (!ba) return;
  var range = ba.querySelector('.ba__range');
  function set(v) { ba.style.setProperty('--x', v + '%'); }
  range.addEventListener('input', function () { ba.classList.remove('is-sweep'); set(range.value); });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerHeight > 1600;
  if (reduce || !('IntersectionObserver' in window)) return;
  var o = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting) return;
    o.disconnect();
    ba.classList.add('is-sweep');
    setTimeout(function () { set(22); }, 250);
    setTimeout(function () { set(64); }, 1400);
    setTimeout(function () { set(50); range.value = 50; }, 2500);
    setTimeout(function () { ba.classList.remove('is-sweep'); }, 3700);
  }, { threshold: 0.5 });
  o.observe(ba);
})();

/* == /polish == */
