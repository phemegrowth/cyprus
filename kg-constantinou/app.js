/* K&G Constantinou Developers: header, menu, reveals, hero parallax, filter, lightbox, form validation. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = document.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Current page in nav */
  var here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav a, .menu__list a').forEach(function (a) {
    var target = (a.getAttribute('href') || '').split('#')[0].replace('./', '').toLowerCase();
    if (target && target === here) a.setAttribute('aria-current', 'page');
    if (here === 'project.html' && target === 'projects.html') a.setAttribute('aria-current', 'page');
  });

  /* Scroll reveals */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Slow hero parallax */
  var heroImg = document.querySelector('.hero__photo img');
  var heroBox = document.querySelector('.hero__photo');
  if (heroImg && heroBox && !reduce) {
    var ticking = false;
    var isPhone = window.matchMedia('(max-width: 719px)');
    function parallax() {
      ticking = false;
      if (isPhone.matches) { heroImg.style.transform = ''; return; }
      var rect = heroBox.getBoundingClientRect();
      var vh = window.innerHeight || 1;
      var progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      var shift = (progress - 0.5) * rect.height * 0.18;
      heroImg.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(parallax); }
    }, { passive: true });
    window.addEventListener('resize', parallax);
    parallax();
  }

  /* "View" tag that follows the mouse over project photos (fine pointers only) */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var targets = document.querySelectorAll('.plist__media, .trio figure');
  if (fine && !reduce && targets.length) {
    var tag = document.createElement('span');
    tag.className = 'cursor-tag'; tag.setAttribute('aria-hidden', 'true'); tag.textContent = 'View';
    document.body.appendChild(tag);
    var tx = 0, ty = 0, raf = 0;
    function moveTag() { raf = 0; tag.style.transform = 'translate3d(' + (tx + 18) + 'px,' + (ty + 18) + 'px,0)'; }
    targets.forEach(function (t) {
      t.addEventListener('pointerenter', function () { tag.classList.add('is-on'); });
      t.addEventListener('pointerleave', function () { tag.classList.remove('is-on'); });
      t.addEventListener('pointermove', function (e) { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(moveTag); });
    });
  }

  /* Smooth anchor scroll with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') {
      if (a.getAttribute('aria-disabled') === 'true') a.addEventListener('click', function (e) { e.preventDefault(); });
      return;
    }
    a.addEventListener('click', function (e) {
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Project filter */
  var list = document.querySelector('.plist');
  if (list) {
    var items = Array.prototype.slice.call(list.querySelectorAll('.plist__item'));
    var areaSel = document.getElementById('filter-area');
    var chips = document.querySelectorAll('.chip[data-status]');
    var count = document.getElementById('filter-count');
    var empty = document.getElementById('filter-empty');
    var status = 'all';
    function apply() {
      var area = areaSel ? areaSel.value : 'all';
      var shown = 0;
      items.forEach(function (it) {
        var ok = (area === 'all' || it.dataset.area === area) && (status === 'all' || it.dataset.status === status);
        it.classList.toggle('is-hidden', !ok);
        if (ok) shown++;
      });
      if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
      if (empty) empty.classList.toggle('is-visible', shown === 0);
    }
    if (areaSel) areaSel.addEventListener('change', apply);
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        status = c.dataset.status;
        apply();
      });
    });
    var reset = document.getElementById('filter-reset');
    if (reset) reset.addEventListener('click', function () {
      if (areaSel) areaSel.value = 'all';
      status = 'all';
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x.dataset.status === 'all' ? 'true' : 'false'); });
      apply();
    });
    var q = new URLSearchParams(location.search).get('area');
    if (q && areaSel) {
      var opt = Array.prototype.some.call(areaSel.options, function (o) { return o.value === q; });
      if (opt) areaSel.value = q;
    }
    apply();
  }

  /* Lightbox */
  var gallery = document.querySelector('.gallery');
  var lb = document.getElementById('lightbox');
  if (gallery && lb) {
    var buttons = Array.prototype.slice.call(gallery.querySelectorAll('button[data-full]'));
    var lbImg = lb.querySelector('img');
    var lbCount = lb.querySelector('.lightbox__count');
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + buttons.length) % buttons.length;
      var b = buttons[idx];
      lbImg.src = b.dataset.full;
      lbImg.alt = b.querySelector('img').alt;
      if (lbCount) lbCount.textContent = (idx + 1) + ' / ' + buttons.length;
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    }
    function close() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    buttons.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lb.querySelector('.lightbox__close').addEventListener('click', close);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var statusEl = form.querySelector('.form__status');
    function check(field) {
      var input = field.querySelector('input, select, textarea');
      if (!input) return true;
      var v = input.value.trim();
      var ok = true;
      if (input.required && !v) ok = false;
      if (ok && input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) ok = false;
      if (ok && input.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) ok = false;
      field.classList.toggle('is-invalid', !ok);
      return ok;
    }
    form.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('input, select, textarea');
      if (input) input.addEventListener('input', function () { if (field.classList.contains('is-invalid')) check(field); });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true, first = null;
      form.querySelectorAll('.field').forEach(function (field) {
        var ok = check(field);
        if (!ok) { allOk = false; if (!first) first = field; }
      });
      if (!allOk) {
        e.preventDefault();
        if (statusEl) statusEl.classList.add('is-visible');
        var input = first.querySelector('input, select, textarea');
        if (input) input.focus();
      } else if (statusEl) {
        statusEl.classList.remove('is-visible');
      }
    });
  });
})();
