/* The Heritage, Limassol: header, menu, hero reveal, marquee, reveals, image swap, drag strip,
   count-up, progress line, form validation, anchors, year. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (/[?&]shot=1/.test(location.search)) { d.documentElement.classList.add('is-shot'); reduce = true; }

  /* Header shrink */
  var header = d.querySelector('[data-header]');
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
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Hero: line-by-line reveal once the hero image is ready (or straight away) */
  var hero = d.querySelector('.hero');
  if (hero) {
    var heroImg = hero.querySelector('.hero__img');
    var shown = false;
    function ready() { if (shown) return; shown = true; requestAnimationFrame(function () { hero.classList.add('is-ready'); }); }
    if (reduce || !heroImg) ready();
    else {
      if (heroImg.complete) ready(); else heroImg.addEventListener('load', ready);
      setTimeout(ready, 900);
    }
  }

  /* Marquee: duplicate the items so the loop is seamless */
  d.querySelectorAll('[data-marquee]').forEach(function (m) {
    var track = m.querySelector('.marquee__track');
    if (!track || reduce) return;
    track.innerHTML += track.innerHTML;
    track.querySelectorAll('li').forEach(function (li, i, all) { if (i >= all.length / 2) li.setAttribute('aria-hidden', 'true'); });
  });

  /* Scroll reveals, above-the-fold guard */
  var items = d.querySelectorAll('.r, [data-steps]');
  function showNow(el) { el.classList.add('is-in'); }
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { showNow(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) showNow(el); else io.observe(el);
    });
  } else {
    items.forEach(showNow);
  }

  /* Services: image swaps on hover or focus of a list item */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var imgs = swap.querySelectorAll('[data-swap-img]');
    var rows = d.querySelectorAll('[data-swap-key]');
    function pick(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap-img') === key); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-swap-key') === key); });
    }
    rows.forEach(function (r) {
      var key = r.getAttribute('data-swap-key');
      r.addEventListener('mouseenter', function () { pick(key); });
      r.addEventListener('focusin', function () { pick(key); });
      r.addEventListener('click', function () { pick(key); });
    });
    pick('sales');
  }

  /* Properties: drag to scroll plus arrows */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('[data-strip-track]');
    if (!track) return;
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    function step(dir) {
      var card = track.querySelector('.pcard');
      var w = card ? card.getBoundingClientRect().width + 16 : 320;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });

    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4 && !moved) { moved = true; track.classList.add('is-dragging'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { track.classList.remove('is-dragging'); }, 0);
    });
  });

  /* Count-up on sourced figures */
  d.querySelectorAll('[data-count]').forEach(function (el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduce || !('IntersectionObserver' in window)) { el.textContent = target; return; }
    var done = false;
    function run() {
      if (done) return; done = true;
      var t0 = null, dur = 1600;
      function tick(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * e);
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (el.getBoundingClientRect().top < window.innerHeight) { run(); return; }
    var cio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { run(); cio.disconnect(); } }, { threshold: 0.4 });
    cio.observe(el);
  });

  /* Form validation */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value)) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true, firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f)) { allOk = false; if (!firstBad) firstBad = f; }
      });
      if (!allOk) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".about__media > img", "up"], [".services__media .swap", "iris"]], "tilt": [".pcard"], "magnet": [".btn--primary"]};
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

/* Listing filter: works without motion too (cards just swap) */
(function () {
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.pcard'));
  if (!chips.length || !cards.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var track = document.querySelector('[data-strip-track]');
  function kind(c) { var k = c.querySelector('.pcard__kind'); return k ? k.textContent.trim() : ''; }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.getAttribute('data-filter');
      chips.forEach(function (c) { var on = c === chip; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      var show = cards.filter(function (c) { return f === 'all' || kind(c) === f; });
      var hide = cards.filter(function (c) { return show.indexOf(c) < 0; });
      function swap() {
        hide.forEach(function (c) { c.hidden = true; c.classList.remove('is-out', 'is-in-f'); });
        show.forEach(function (c, i) {
          var was = c.hidden; c.hidden = false; c.classList.remove('is-out');
          if (!reduce && was !== undefined) { c.classList.remove('is-in-f'); void c.offsetWidth; c.style.animationDelay = (i * 60) + 'ms'; c.classList.add('is-in-f'); }
        });
        if (track) track.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' });
      }
      if (reduce) { swap(); return; }
      hide.forEach(function (c) { if (!c.hidden) c.classList.add('is-out'); });
      setTimeout(swap, 280);
    });
  });
})();

/* == /polish == */
