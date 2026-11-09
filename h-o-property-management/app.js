/* H&O Property Management: header, menu, hero entrance, parallax, reveals, count-up, hover image swap, drag strip, steps line, form. No dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) root.classList.add('js-anim');

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger'), menu = d.getElementById('menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    d.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });
  }

  /* Smooth anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Hero entrance: start on the first frame, never wait for fonts or images */
  var hero = d.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });

  /* Parallax: hero photo moves slower than the page */
  var par = d.querySelectorAll('[data-parallax]');
  if (par.length && !reduce) {
    var ticking = false;
    var update = function () {
      ticking = false;
      par.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
        img.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)';
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* Count-up (sourced numbers only) */
  function countUp(el) {
    var end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-dec') || '0', 10);
    if (reduce || isNaN(end)) { el.textContent = end.toFixed(dec); return; }
    var t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (end * e).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    }
    el.textContent = (0).toFixed(dec);
    requestAnimationFrame(step);
  }

  /* Reveals; anything already in view shows at once */
  var items = d.querySelectorAll('.reveal, .reveal-clip, [data-steps], [data-count]');
  var io = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      if (en.target.hasAttribute('data-count')) countUp(en.target); else en.target.classList.add('is-in');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }) : null;
  var lead = 0;
  items.forEach(function (el) {
    if (!io) { el.classList.add('is-in'); return; }
    if (el.getBoundingClientRect().top < window.innerHeight) {
      if (el.hasAttribute('data-count')) { countUp(el); return; }
      el.style.transitionDelay = (lead++ * 70) + 'ms';
      el.classList.add('is-in');
      return;
    }
    var prev = el.previousElementSibling, k = 0;
    while (prev && prev.classList && prev.classList.contains('reveal') && k < 5) { k++; prev = prev.previousElementSibling; }
    if (el.classList.contains('reveal')) el.style.transitionDelay = (k * 80) + 'ms';
    io.observe(el);
  });

  /* Services: hover or focus swaps the photo */
  var swapImg = d.querySelector('[data-swap-img]'), swapCap = d.querySelector('[data-swap-cap]'), swapBox = d.querySelector('[data-swap-box]'), swapTimer;
  function swapTo(li) {
    if (!swapImg) return;
    var src = li.getAttribute('data-img'), cap = li.getAttribute('data-cap');
    if (!src || swapImg.getAttribute('src') === src) return;
    clearTimeout(swapTimer);
    if (reduce) { swapImg.src = src; swapCap.textContent = cap; return; }
    swapBox.classList.add('is-fading');
    swapTimer = setTimeout(function () { swapImg.src = src; swapCap.textContent = cap; swapBox.classList.remove('is-fading'); }, 260);
  }
  d.querySelectorAll('[data-swap] .svc__item').forEach(function (li) {
    li.setAttribute('tabindex', '0');
    li.addEventListener('mouseenter', function () { swapTo(li); });
    li.addEventListener('focus', function () { swapTo(li); });
  });

  /* Drag strip with the mouse; touch scrolls natively */
  d.querySelectorAll('[data-drag]').forEach(function (strip) {
    var down = false, x0 = 0, l0 = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; x0 = e.clientX; l0 = strip.scrollLeft; strip.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - x0; if (Math.abs(dx) > 3) moved = true;
      strip.scrollLeft = l0 - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-dragging'); });
    strip.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Form validation */
  var form = d.querySelector('form.form');
  if (form) {
    var msgFor = function (f) {
      var v = f.value.trim();
      if (!v) return 'Please fill this in.';
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'That email does not look right.';
      if (f.type === 'tel' && v.replace(/\D/g, '').length < 8) return 'Please add a number we can call.';
      return '';
    };
    var check = function (f) {
      var field = f.closest('.field'), m = field.querySelector('.field__msg'), err = msgFor(f);
      field.classList.toggle('is-error', !!err);
      if (m) m.textContent = err;
      f.setAttribute('aria-invalid', err ? 'true' : 'false');
      return !err;
    };
    var fields = form.querySelectorAll('[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('is-error')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      fields.forEach(function (f) { if (!check(f)) { ok = false; if (!first) first = f; } });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
