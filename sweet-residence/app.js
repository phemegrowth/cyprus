/* Sweet Residence homepage: header, menu, reveals, service image swap, drag strip, count-up,
   progress line, marquee duplication, form validation, footer year. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var h = header ? header.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - h + 1;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
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

  /* Marquee: duplicate the list once so the loop is continuous */
  var mq = d.querySelector('[data-marquee] .marquee__track');
  if (mq && !reduce) {
    var clones = Array.prototype.slice.call(mq.children);
    clones.forEach(function (li) { var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); mq.appendChild(c); });
  }

  /* Service list: hover, focus or tap swaps the sticky image */
  var swap = d.querySelector('[data-swap]');
  var swapList = d.querySelector('[data-swap-list]');
  if (swap && swapList) {
    var imgs = swap.querySelectorAll('.swap__img');
    var rows = swapList.querySelectorAll('.svc__item');
    function activate(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-active', im.getAttribute('data-key') === key); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-key') === key); });
    }
    rows.forEach(function (r) {
      var key = r.getAttribute('data-key');
      r.addEventListener('mouseenter', function () { activate(key); });
      r.addEventListener('focus', function () { activate(key); });
      r.addEventListener('click', function () { activate(key); });
    });
  }

  /* Buildings strip: arrows and drag to scroll */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('[data-track]');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (!track) return;
    function step(dir) {
      var card = track.querySelector('.pcard');
      var w = card ? card.getBoundingClientRect().width + 20 : 360;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-dragging'); }
      track.scrollLeft = startLeft - dx;
    });
    function up(e) {
      if (!down) return;
      down = false;
      track.classList.remove('is-dragging');
      if (moved) { track.addEventListener('click', function stop(ev) { ev.preventDefault(); track.removeEventListener('click', stop, true); }, true); }
    }
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('pointerleave', up);
  });

  /* Count-up (sourced number only) */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var end = parseInt(el.getAttribute('data-count'), 10);
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = end; return; }
    var done = false;
    var o = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || done) return;
      done = true; o.disconnect();
      var t0 = null;
      function tick(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1600);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* Progress line on the steps */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if (reduce || !('IntersectionObserver' in window)) { steps.classList.add('is-drawn'); }
    else {
      var so = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { steps.classList.add('is-drawn'); so.disconnect(); }
      }, { threshold: 0.25 });
      so.observe(steps);
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form.enquiry, form[name="enquiry-sweet-residence"]');
  if (form) {
    var errBox = form.querySelector('[data-form-error]');
    function check(field) {
      var box = field.closest('.field');
      var ok = true;
      var v = (field.value || '').trim();
      if (field.required && !v) ok = false;
      if (ok && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) ok = false;
      if (ok && field.type === 'tel' && v.replace(/\D/g, '').length < 7) ok = false;
      if (box) box.classList.toggle('is-bad', !ok);
      return ok;
    }
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field') && f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var all = true, firstBad = null;
      fields.forEach(function (f) { var ok = check(f); if (!ok) { all = false; if (!firstBad) firstBad = f; } });
      if (!all) {
        e.preventDefault();
        if (errBox) errBox.hidden = false;
        if (firstBad) firstBad.focus();
      } else if (errBox) { errBox.hidden = true; }
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
  var C = {"clip": [[".feat__media", "iris"], [".about__media img", "left"], [".pcard__media", "up", 80]], "tilt": [".pcard"], "magnet": [".btn--primary"], "index": "main > section, body > section"};
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
