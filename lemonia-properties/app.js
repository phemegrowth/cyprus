/* Lemonia Properties: header, menu, hero reveal, reveals, marquee, hover swap, drag strip, progress line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

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

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var h = header ? header.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - h - 8;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Hero: line reveal, disc. The licence figure is static: it is an ID, not a quantity. */
  var hero = d.querySelector('.hero');
  if (hero) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });
  }

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Marquee: duplicate the items once so the loop is seamless; pause on hover */
  var mq = d.querySelector('[data-marquee]');
  if (mq) {
    var track = mq.querySelector('.marquee__track');
    if (track && !reduce) {
      track.innerHTML += track.innerHTML;
      mq.addEventListener('mouseenter', function () { mq.classList.add('is-paused'); });
      mq.addEventListener('mouseleave', function () { mq.classList.remove('is-paused'); });
    }
  }

  /* Services: photo swaps on hover, focus or tap */
  var swapList = d.querySelector('[data-swap]');
  if (swapList) {
    var swapImgs = d.querySelectorAll('.swap__img');
    var svcItems = swapList.querySelectorAll('.svc__item');
    function activate(item) {
      var key = item.getAttribute('data-img');
      svcItems.forEach(function (x) { x.classList.toggle('is-active', x === item); });
      swapImgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
    }
    svcItems.forEach(function (item) {
      item.setAttribute('tabindex', '0');
      item.addEventListener('mouseenter', function () { activate(item); });
      item.addEventListener('focus', function () { activate(item); });
      item.addEventListener('click', function () { activate(item); });
    });
  }

  /* Gallery strip: arrows and drag to scroll */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var tr = strip.querySelector('.gal__track');
    var sect = strip.closest('section') || d;
    var prev = sect.querySelector('[data-prev]');
    var next = sect.querySelector('[data-next]');
    if (!tr) return;
    function step(dir) {
      var card = tr.querySelector('.gal__card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      tr.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    var down = false, startX = 0, startLeft = 0, moved = false;
    tr.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = tr.scrollLeft; strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      tr.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    tr.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* Process: the line draws as the steps scroll into view */
  var steps = d.querySelector('[data-steps]');
  if (steps && !reduce) {
    function drawLine() {
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.2);
      p = Math.max(0, Math.min(1, p));
      steps.style.setProperty('--p', p.toFixed(3));
    }
    window.addEventListener('scroll', drawLine, { passive: true });
    window.addEventListener('resize', drawLine);
    drawLine();
  } else if (steps) {
    steps.style.setProperty('--p', '1');
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var msgs = { name: 'Please tell us your name.', phone: 'A phone number we can call.', email: 'An email address that works.', interest: 'Choose one option.', message: 'A line or two about what you need.' };
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var err = wrap.querySelector('.err');
      var ok = field.checkValidity();
      if (field.type === 'tel' && ok) ok = /[0-9]{6,}/.test(field.value.replace(/\D/g, ''));
      wrap.classList.toggle('is-bad', !ok);
      if (err) err.textContent = ok ? '' : (msgs[field.name] || 'Please check this.');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      if (f.name === 'bot-field' || f.type === 'hidden') return;
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field') && f.closest('.field').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true, firstBad = null;
      form.querySelectorAll('input, select, textarea').forEach(function (f) {
        if (f.name === 'bot-field' || f.type === 'hidden') return;
        if (!check(f)) { allOk = false; if (!firstBad) firstBad = f; }
      });
      if (!allOk) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* ===== Polish pass, 2 Nov 2026 ===== */
(function () {
  var d = document, RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function inView(el) { var r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; }
  function onEnter(els, fn, opts) {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } }); }, opts || { threshold: 0.15 });
    els.forEach(function (el) { if (inView(el)) fn(el); else io.observe(el); });
  }
  /* scroll progress line */
  (function () {
    var bar = d.createElement('div'); bar.className = 'px-progress'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
    var t = false;
    function u() { t = false; var h = d.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')'; }
    addEventListener('scroll', function () { if (!t) { t = true; requestAnimationFrame(u); } }, { passive: true }); u();
  })();
  /* clip-path image reveals */
  (function () {
    var els = [].slice.call(d.querySelectorAll(".about__media img"));
    if (RM) return;
    els.forEach(function (el) { if (!inView(el)) el.classList.add('px-clip'); });
    /* observe the parent: a clipped element reports no intersection */
    els.filter(function (el) { return el.classList.contains('px-clip'); }).forEach(function (el) { onEnter([el.parentElement], function () { el.classList.add('px-in'); }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); });
  })();
  /* buttons pull toward the cursor */
  (function () {
    if (RM || !FINE) return;
    d.querySelectorAll(".btn--solid").forEach(function (b) {
      b.classList.add('px-mag');
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  })();
  /* listing cards become small photo carousels */
  (function () {
    var sets = [
      [['./assets/img/nicosia-aerial.jpg', 'Nicosia rooftops from above, placeholder photo'], ['./assets/img/street-nicosia.jpg', 'A quiet Nicosia street, placeholder photo']],
      [['./assets/img/kitchen.jpg', 'Kitchen with an island, placeholder photo'], ['./assets/img/bedroom.jpg', 'Bedroom, placeholder photo']]
    ];
    d.querySelectorAll('.listing').forEach(function (card, k) {
      var a = card.querySelector('.listing__img'); if (!a || !sets[k]) return;
      var box = d.createElement('div'); box.className = 'px-car'; a.parentNode.insertBefore(box, a); box.appendChild(a);
      var first = a.querySelector('img'); first.classList.add('px-car__img', 'is-on');
      var imgs = [first];
      sets[k].forEach(function (s) { var im = d.createElement('img'); im.src = s[0]; im.alt = s[1]; im.loading = 'lazy'; im.width = 1400; im.height = 933; im.className = 'px-car__img'; a.insertBefore(im, a.querySelector('.listing__tag')); imgs.push(im); });
      var dots = d.createElement('div'); dots.className = 'px-car__dots'; var i = 0;
      function go(n) { i = (n + imgs.length) % imgs.length; imgs.forEach(function (im, j) { im.classList.toggle('is-on', j === i); }); [].forEach.call(dots.children, function (b, j) { b.setAttribute('aria-current', j === i ? 'true' : 'false'); }); }
      imgs.forEach(function (_, j) { var b = d.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Photo ' + (j + 1) + ' of ' + imgs.length); b.addEventListener('click', function () { go(j); }); dots.appendChild(b); });
      ['prev', 'next'].forEach(function (dir) { var b = d.createElement('button'); b.type = 'button'; b.className = 'px-car__arw px-car__arw--' + dir; b.setAttribute('aria-label', dir === 'prev' ? 'Previous photo' : 'Next photo'); b.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="' + (dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '" fill="none" stroke="currentColor" stroke-width="2"/></svg>'; b.addEventListener('click', function () { go(i + (dir === 'prev' ? -1 : 1)); }); box.appendChild(b); });
      box.appendChild(dots); go(0);
      var sx = null; box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); sx = null; });
      if (!RM && FINE) { var t = null; card.addEventListener('mouseenter', function () { t = setInterval(function () { go(i + 1); }, 1600); }); card.addEventListener('mouseleave', function () { clearInterval(t); }); }
    });
  })();
})();
