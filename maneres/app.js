/* Maneres Group site: header, drawer, reveals, filter, lightbox, form validation. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink on scroll */
  var header = document.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-shrunk', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Scroll progress line and parallax photo band */
  var bar = null;
  if (header && !reduce) { bar = document.createElement('span'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true'); header.appendChild(bar); }
  var px = reduce ? [] : Array.prototype.slice.call(document.querySelectorAll('.band-photo img'));
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight, h = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(window.scrollY / h, 1) : 0) + ')';
    px.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / (vh + r.height);
      img.style.transform = 'translate3d(0,' + (p * -18).toFixed(2) + '%,0)';
    });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  frame();

  /* Mobile drawer */
  var burger = document.querySelector('.burger');
  var drawer = document.querySelector('.drawer');
  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = drawer.querySelector('a');
      if (first) first.focus();
    } else {
      burger.focus();
    }
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () {
      setDrawer(burger.getAttribute('aria-expanded') !== 'true');
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setDrawer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) setDrawer(false);
    });
  }

  /* Scroll reveals, staggered */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
        var i = siblings.indexOf(el);
        el.style.transitionDelay = (Math.min(i, 6) * 90) + 'ms';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('is-in'); } else { io.observe(el); } });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Smooth anchor scroll with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* Project filter: type and status, combined */
  var filter = document.querySelector('[data-filter]');
  if (filter) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-type]'));
    var empty = document.querySelector('.empty');
    var count = document.querySelector('[data-count]');
    var state = { type: 'all', status: 'all' };
    function apply() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (state.type === 'all' || c.dataset.type === state.type) &&
                 (state.status === 'all' || c.dataset.status === state.status);
        c.hidden = !ok;
        if (ok) shown++;
      });
      if (empty) empty.classList.toggle('is-visible', shown === 0);
      if (count) count.textContent = shown + (shown === 1 ? ' project' : ' projects');
    }
    filter.querySelectorAll('.chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.dataset.group;
        state[group] = btn.dataset.value;
        filter.querySelectorAll('.chip[data-group="' + group + '"]').forEach(function (b) {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        apply();
      });
    });
    var reset = document.querySelector('[data-reset]');
    if (reset) reset.addEventListener('click', function () {
      state = { type: 'all', status: 'all' };
      filter.querySelectorAll('.chip').forEach(function (b) {
        b.setAttribute('aria-pressed', b.dataset.value === 'all' ? 'true' : 'false');
      });
      apply();
    });
    apply();
  }

  /* Lightbox with keyboard arrows */
  var gallery = document.querySelector('.gallery');
  var lightbox = document.querySelector('.lightbox');
  if (gallery && lightbox) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('button'));
    var img = lightbox.querySelector('img');
    var cap = lightbox.querySelector('.lightbox__cap');
    var idx = 0;
    var lastFocus = null;
    function show(i) {
      idx = (i + items.length) % items.length;
      var src = items[idx].dataset.full || items[idx].querySelector('img').src;
      var alt = items[idx].querySelector('img').alt;
      img.src = src; img.alt = alt;
      if (cap) cap.textContent = (idx + 1) + ' / ' + items.length + '  ' + alt;
    }
    function open(i) {
      lastFocus = document.activeElement;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      show(i);
      lightbox.querySelector('.lightbox__close').focus();
    }
    function close() {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    items.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lightbox.querySelector('.lightbox__close').addEventListener('click', close);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', function () { show(idx - 1); });
    lightbox.querySelector('.lightbox__next').addEventListener('click', function () { show(idx + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Form validation with inline messages */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    function fieldOf(input) { return input.closest('.field'); }
    function setMsg(input, text) {
      var f = fieldOf(input); if (!f) return;
      var m = f.querySelector('.msg');
      if (m) m.textContent = text;
      f.classList.toggle('is-invalid', !!text);
      input.setAttribute('aria-invalid', text ? 'true' : 'false');
    }
    function check(input) {
      var v = input.value.trim();
      if (input.required && !v) { setMsg(input, 'Please fill this in.'); return false; }
      if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { setMsg(input, 'That email does not look right.'); return false; }
      if (input.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) { setMsg(input, 'Please add a full phone number.'); return false; }
      setMsg(input, ''); return true;
    }
    var inputs = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
    inputs.forEach(function (i) {
      i.addEventListener('blur', function () { check(i); });
      i.addEventListener('input', function () { if (fieldOf(i) && fieldOf(i).classList.contains('is-invalid')) check(i); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, firstBad = null;
      inputs.forEach(function (i) {
        if (i.name === 'bot-field') return;
        if (!check(i)) { ok = false; if (!firstBad) firstBad = i; }
      });
      if (!ok) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });
})();
