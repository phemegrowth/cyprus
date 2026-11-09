/* G. Spyropoulos Developers: header, menu, reveals, count-up, filter, lightbox, form validation. No dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky header shrinks on scroll */
  var header = document.getElementById('header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-small', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile drawer */
  var menuBtn = document.querySelector('.menu-btn');
  var drawer = document.getElementById('drawer');
  function setMenu(open) {
    if (!menuBtn || !drawer) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    Array.prototype.forEach.call(drawer.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
  }

  /* Scroll reveals */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-in'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      Array.prototype.forEach.call(reveals, function (el) { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } });
    }
  }

  /* Count-up: only the "40" */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || reduce) { el.textContent = target; return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.4 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    } else {
      Array.prototype.forEach.call(counters, runCount);
    }
  }

  /* Project filter: area chips + status select */
  var list = document.querySelector('[data-plist]');
  if (list) {
    var cards = list.querySelectorAll('.pcard');
    var chips = document.querySelectorAll('.chips [data-area]');
    var statusSel = document.getElementById('f-status');
    var empty = document.querySelector('.empty');
    var count = document.querySelector('.filters__count');
    var area = 'all';
    function apply() {
      var status = statusSel ? statusSel.value : 'all';
      var shown = 0;
      Array.prototype.forEach.call(cards, function (c) {
        var ok = (area === 'all' || c.getAttribute('data-area') === area) &&
                 (status === 'all' || c.getAttribute('data-status') === status);
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (count) count.textContent = shown === 1 ? '1 project' : shown + ' projects';
    }
    Array.prototype.forEach.call(chips, function (ch) {
      ch.addEventListener('click', function () {
        area = ch.getAttribute('data-area');
        Array.prototype.forEach.call(chips, function (o) { o.setAttribute('aria-pressed', o === ch ? 'true' : 'false'); });
        apply();
      });
    });
    if (statusSel) statusSel.addEventListener('change', apply);
    var resetBtn = document.querySelector('[data-reset]');
    if (resetBtn) resetBtn.addEventListener('click', function () {
      area = 'all';
      Array.prototype.forEach.call(chips, function (o) { o.setAttribute('aria-pressed', o.getAttribute('data-area') === 'all' ? 'true' : 'false'); });
      if (statusSel) statusSel.value = 'all';
      apply();
    });
    var qs = new URLSearchParams(location.search);
    if (qs.get('status') && statusSel) statusSel.value = qs.get('status');
    apply();
  }

  /* Lightbox */
  var gallery = document.querySelector('.gallery');
  var lb = document.getElementById('lightbox');
  if (gallery && lb) {
    var thumbs = gallery.querySelectorAll('button');
    var lbImg = lb.querySelector('img');
    var lbCount = lb.querySelector('.lightbox__count');
    var idx = 0, lastFocus = null;
    function show(i) {
      idx = (i + thumbs.length) % thumbs.length;
      var img = thumbs[idx].querySelector('img');
      lbImg.src = thumbs[idx].getAttribute('data-full') || img.src;
      lbImg.alt = img.alt;
      if (lbCount) lbCount.textContent = (idx + 1) + ' / ' + thumbs.length;
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      show(i);
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lightbox__close').focus();
    }
    function closeLb() {
      lb.classList.remove('is-open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    Array.prototype.forEach.call(thumbs, function (b, i) {
      b.addEventListener('click', function () { openLb(i); });
    });
    lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
    lb.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lb.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation with inline messages */
  Array.prototype.forEach.call(document.querySelectorAll('form[data-validate]'), function (form) {
    var status = form.querySelector('.form__status');
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var err = wrap.querySelector('.err');
      var msg = '';
      var v = field.value.trim();
      if (field.required && !v) msg = 'Please fill this in.';
      else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Please check the email address.';
      else if (field.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) msg = 'Please check the phone number.';
      wrap.classList.toggle('is-invalid', !!msg);
      if (err) err.textContent = msg;
      return !msg;
    }
    Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field') && f.closest('.field').classList.contains('is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Array.prototype.forEach.call(form.querySelectorAll('input, select, textarea'), function (f) {
        if (f.type === 'hidden' || f.name === 'bot-field') return;
        if (!check(f)) { ok = false; if (!first) first = f; }
      });
      if (!ok) {
        e.preventDefault();
        if (status) status.textContent = 'Please check the fields marked above.';
        if (first) first.focus();
      } else if (status) {
        status.textContent = '';
      }
    });
  });

  /* Footer year */
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = new Date().getFullYear();
  });
})();

/* Polish pass, 2 Nov 2026: hero curtain lifts on load. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-anim');
  var hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-go'); }); });
})();
