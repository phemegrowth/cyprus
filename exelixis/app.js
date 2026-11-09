/* Exelixis General Constructions: header, menu, reveals, strip, filters, gallery, forms. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-small', window.scrollY > 40);
  }
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
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(!menu.classList.contains('is-open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* Scroll reveals */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Horizontal strip buttons */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (!track) return;
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
  });

  /* Filters on the projects page */
  var list = d.querySelector('[data-list]');
  if (list) {
    var groups = d.querySelectorAll('.filters[data-filter]');
    var empty = d.querySelector('[data-empty]');
    var count = d.querySelector('[data-count]');
    var state = {};
    groups.forEach(function (g) { state[g.getAttribute('data-filter')] = 'all'; });
    function apply() {
      var shown = 0;
      list.querySelectorAll('.plist__item').forEach(function (item) {
        var ok = true;
        Object.keys(state).forEach(function (k) {
          if (state[k] !== 'all' && item.getAttribute('data-' + k) !== state[k]) ok = false;
        });
        item.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (count) count.textContent = shown;
    }
    groups.forEach(function (g) {
      var key = g.getAttribute('data-filter');
      g.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () {
          state[key] = b.getAttribute('data-value');
          g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
          apply();
        });
      });
    });
    var reset = d.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () {
      groups.forEach(function (g) {
        state[g.getAttribute('data-filter')] = 'all';
        g.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-value') === 'all' ? 'true' : 'false'); });
      });
      apply();
    });
    apply();
  }

  /* Gallery lightbox */
  var gallery = d.querySelector('[data-gallery]');
  var lb = d.querySelector('.lb');
  if (gallery && lb) {
    var btns = Array.prototype.slice.call(gallery.querySelectorAll('button'));
    var img = lb.querySelector('img');
    var cap = lb.querySelector('.lb__cap');
    var idx = 0;
    var lastFocus = null;
    function show(i) {
      idx = (i + btns.length) % btns.length;
      var src = btns[idx].getAttribute('data-full') || btns[idx].querySelector('img').src;
      img.src = src;
      img.alt = btns[idx].querySelector('img').alt;
      if (cap) cap.textContent = (idx + 1) + ' / ' + btns.length + '  ' + img.alt;
    }
    function open(i) {
      lastFocus = d.activeElement;
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      d.body.classList.add('menu-open');
      lb.querySelector('.lb__close').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      d.body.classList.remove('menu-open');
      if (lastFocus) lastFocus.focus();
    }
    btns.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lb__close').addEventListener('click', close);
    lb.querySelector('.lb__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lb__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    d.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

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
    });
    form.addEventListener('submit', function (e) {
      var allOk = true;
      var firstBad = null;
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
      if (!id) return;
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });
})();

/* Polish pass, 2 Nov 2026: headline word rise, hero wipe, mouse drag on the residence strip. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var root = document.documentElement;
  root.classList.add('js-anim');
  var title = document.querySelector('.hero__title');
  var fig = document.querySelector('.hero__fig');
  if (title && !title.children.length) {
    var words = title.textContent.trim().split(/\s+/);
    title.setAttribute('aria-label', title.textContent.trim());
    title.innerHTML = words.map(function (w, i) {
      return '<span class="w" aria-hidden="true"><span class="wi" style="--i:' + i + '">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
    }).join(' ');
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    if (title) title.classList.add('is-go');
    if (fig) fig.classList.add('is-go');
  }); });

  /* Drag the residence strip with a mouse; touch keeps native scrolling */
  document.querySelectorAll('.strip__track').forEach(function (track) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('is-drag'); }
      if (moved) { track.scrollLeft = startLeft - dx; e.preventDefault(); }
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { track.classList.remove('is-drag'); }, 0);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });
})();
