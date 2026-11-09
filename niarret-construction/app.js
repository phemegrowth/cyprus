/* Niarret Construction homepage: header, menu, hero fan, reveals, marquee, image swap, drag strip,
   steps line, form validation, anchors. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
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
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Hero: headline lines, then the card fan */
  var hero = d.querySelector('.hero');
  var heroTitle = d.querySelector('.hero__title');
  var heroText = d.querySelector('.hero__text');
  function startHero() {
    if (heroTitle) heroTitle.classList.add('is-in');
    if (heroText) heroText.classList.add('is-in');
    if (hero) hero.classList.add('is-live');
  }
  if (reduce) { startHero(); }
  else { window.requestAnimationFrame(function () { window.setTimeout(startHero, 60); }); }

  /* Scroll reveals, above-the-fold guard */
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

  /* Marquee: duplicate the list once, then run */
  var mq = d.querySelector('[data-marquee]');
  if (mq && !reduce) {
    var track = mq.querySelector('.marquee__track');
    if (track) {
      track.innerHTML += track.innerHTML;
      track.querySelectorAll('li').forEach(function (li, i, all) { if (i >= all.length / 2) li.setAttribute('aria-hidden', 'true'); });
      mq.classList.add('is-live');
    }
  }

  /* Services: hover or focus swaps the sticky photo */
  var swapList = d.querySelector('[data-swap]');
  if (swapList) {
    var imgs = d.querySelectorAll('[data-swap-img]');
    var rows = swapList.querySelectorAll('.slist__item');
    function swapTo(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap-img') === key); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-img') === key); });
    }
    rows.forEach(function (r) {
      var key = r.getAttribute('data-img');
      r.addEventListener('mouseenter', function () { swapTo(key); });
      r.addEventListener('focusin', function () { swapTo(key); });
    });
  }

  /* Photo strip: drag to scroll */
  d.querySelectorAll('[data-strip] .strip__track').forEach(function (track) {
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = startLeft - dx;
    });
    function up() { down = false; track.classList.remove('is-drag'); }
    track.addEventListener('pointerup', up);
    track.addEventListener('pointercancel', up);
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { track.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { track.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  });

  /* Odometer: the year 2010 rolls into place when the About section is seen */
  var year = d.querySelector('.about__year');
  if (year && 'IntersectionObserver' in window && !reduce && year.getBoundingClientRect().top > window.innerHeight) {
    year.classList.add('odo-wait');
    var yio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        yio.disconnect();
        year.classList.add('odo-go');
        requestAnimationFrame(function () { requestAnimationFrame(function () { year.classList.remove('odo-wait'); }); });
      }
    }, { threshold: 0.4 });
    yio.observe(year);
  }

  /* Steps line draws when the section is seen */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if ('IntersectionObserver' in window && !reduce) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { steps.classList.add('is-drawn'); sio.disconnect(); } });
      }, { threshold: 0.2 });
      if (steps.getBoundingClientRect().top < window.innerHeight) steps.classList.add('is-drawn'); else sio.observe(steps);
    } else {
      steps.classList.add('is-drawn');
    }
  }

  /* Form validation with inline messages */
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
      f.addEventListener('change', function () { check(f); });
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
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();
