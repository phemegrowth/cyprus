/* Oikosteel homepage. Vanilla JS, no libraries. Motion uses transform, opacity and clip-path only. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* ---------- hero: cards stack, fan out, settle into a collage; headline line by line ---------- */
  var hero = document.querySelector('.hero');
  var fan = hero && hero.querySelector('.fan');
  if (hero) {
    var cards = fan ? Array.prototype.slice.call(fan.querySelectorAll('.card')) : [];
    if (reduce) {
      hero.classList.add('lines', 'ready', 'fanning', 'settled');
    } else {
      var fanAngles = [-15, -5, 5, 15];
      var stackAngles = [-2, 1.5, -1, 2.5];
      var fw = fan ? fan.offsetWidth : 0;
      var fh = fan ? fan.offsetHeight : 0;
      cards.forEach(function (c, i) {
        var cx = c.offsetLeft + c.offsetWidth / 2;
        var cy = c.offsetTop + c.offsetHeight;
        c.style.setProperty('--dx', Math.round(fw / 2 - cx) + 'px');
        c.style.setProperty('--dy', Math.round(fh * 0.78 - cy) + 'px');
        c.style.setProperty('--r0', stackAngles[i % 4] + 'deg');
        c.style.setProperty('--fr', fanAngles[i % 4] + 'deg');
        c.style.setProperty('--d', (i * 70) + 'ms');
      });
      /* start on the first frame: no waiting for fonts or images */
      raf(function () {
        hero.classList.add('lines', 'ready');
        setTimeout(function () {
          hero.classList.add('fanning');
          setTimeout(function () { hero.classList.add('settled'); }, 480);
        }, 40);
      });
    }
  }

  /* ---------- header shrink ---------- */
  var header = document.querySelector('.site-header');
  function onScrollHeader() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('nav');
  function closeMenu() {
    if (!nav || !menuBtn) return;
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Open menu');
  }
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menuBtn.focus(); }
    });
  }

  /* ---------- scroll reveals, with the above-the-fold guard ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  reveals.forEach(function (el) {
    var sibs = Array.prototype.filter.call(el.parentNode.children, function (n) { return n.classList.contains('reveal'); });
    el.style.setProperty('--rd', (sibs.indexOf(el) % 5) * 80 + 'ms');
  });
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* ---------- what we build: image swap on hover, focus, tap, or scroll on touch ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.build-item'));
  var swaps = Array.prototype.slice.call(document.querySelectorAll('.swap-img'));
  function activate(key) {
    items.forEach(function (it) { it.classList.toggle('is-on', it.getAttribute('data-key') === key); });
    swaps.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
  }
  if (items.length) {
    activate('1');
    items.forEach(function (it) {
      var k = it.getAttribute('data-key');
      it.addEventListener('mouseenter', function () { activate(k); });
      it.addEventListener('focus', function () { activate(k); });
      it.addEventListener('click', function () { activate(k); });
    });
    if (window.matchMedia('(hover: none)').matches && 'IntersectionObserver' in window) {
      var mid = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(en.target.getAttribute('data-key')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      items.forEach(function (it) { mid.observe(it); });
    }
  }

  /* ---------- work strip: drag with the mouse, progress bar ---------- */
  var strip = document.querySelector('.strip');
  var fill = document.querySelector('.strip-bar-fill');
  function stripProgress() {
    if (!strip || !fill) return;
    var max = strip.scrollWidth;
    var p = max > 0 ? (strip.scrollLeft + strip.clientWidth) / max : 1;
    fill.style.transform = 'scaleX(' + Math.min(1, Math.max(0.05, p)).toFixed(3) + ')';
  }
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
    window.addEventListener('pointerup', function () {
      down = false;
      strip.classList.remove('is-dragging');
    });
    strip.addEventListener('click', function (e) { if (moved > 4) { e.preventDefault(); e.stopPropagation(); } }, true);
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
    strip.addEventListener('scroll', stripProgress, { passive: true });
    window.addEventListener('resize', stripProgress);
    stripProgress();
  }

  /* ---------- process: the line draws as you scroll ---------- */
  var steps = document.querySelector('.steps');
  function stepsProgress() {
    if (!steps || reduce) return;
    var r = steps.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
    steps.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(3));
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () { onScrollHeader(); stepsProgress(); scrollBar(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScrollHeader();
  stepsProgress();

  /* ---------- form validation ---------- */
  var form = document.querySelector('form.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'project-type': function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length >= 5 ? '' : 'A few words about the house, please.'; }
    };
    function check(el) {
      var rule = rules[el.name];
      if (!rule) return true;
      var msg = rule(el.value);
      var field = el.closest('.field');
      var err = field && field.querySelector('.err');
      if (field) field.classList.toggle('has-error', !!msg);
      if (err) err.textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    Array.prototype.forEach.call(form.elements, function (el) {
      if (rules[el.name]) {
        el.addEventListener('blur', function () { check(el); });
        el.addEventListener('input', function () { if (el.closest('.field').classList.contains('has-error')) check(el); });
      }
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Array.prototype.forEach.call(form.elements, function (el) {
        if (rules[el.name] && !check(el) && !first) first = el;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- polish 2 Nov: scroll progress line ---------- */
  var bar = document.querySelector('.scrollbar');
  function scrollBar() {
    if (!bar || reduce) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--sp', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
  }
  scrollBar();

  /* ---------- polish 2 Nov: the steel frame assembles when it comes into view ---------- */
  var frame = document.querySelector('.frame');
  if (frame) {
    if (reduce || !('IntersectionObserver' in window) || frame.getBoundingClientRect().top < window.innerHeight * 0.9) frame.classList.add('is-in');
    else {
      var fio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { frame.classList.add('is-in'); fio.disconnect(); } }, { threshold: 0.4 });
      fio.observe(frame);
    }
  }

  /* ---------- polish 2 Nov: orange buttons pull toward the cursor ---------- */
  if (!reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    Array.prototype.forEach.call(document.querySelectorAll('.btn-accent'), function (b) {
      b.classList.add('magnet');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = 'translate(' + Math.max(-12, Math.min(12, x)).toFixed(1) + 'px,' + Math.max(-8, Math.min(8, y)).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- footer year ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.year'), function (y) { y.textContent = String(new Date().getFullYear()); });
})();
