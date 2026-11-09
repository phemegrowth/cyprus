/* Riginos Georgiou & Sons Construction: site behaviour. Vanilla JS, no dependencies.
   Everything below is an enhancement; the pages read fully without it. */
(function () {
  'use strict';
  document.documentElement.classList.remove('no-js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink on scroll */
  var header = document.querySelector('.header');
  function onScroll() {
    if (!header) return;
    header.classList.toggle('is-small', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.querySelector('.menu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    if (menuBtn) menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (menu) menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open && menu) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else if (menuBtn && document.activeElement && menu && menu.contains(document.activeElement)) {
      menuBtn.focus();
    }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      setMenu(!document.body.classList.contains('menu-open'));
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setMenu(false);
    });
  }

  /* Scroll reveals */
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) { el.classList.add('in'); } else { io.observe(el); }
    });
  }

  /* Services filter */
  var filterBar = document.querySelector('[data-filter-bar]');
  if (filterBar) {
    var chips = filterBar.querySelectorAll('.chip');
    var items = document.querySelectorAll('[data-type]');
    var empties = document.querySelectorAll('[data-empty]');
    function applyFilter(type) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.type === type ? 'true' : 'false'); });
      var groups = {};
      items.forEach(function (it) {
        var show = type === 'all' || it.dataset.type.split(' ').indexOf(type) !== -1;
        it.classList.toggle('hidden', !show);
        var g = it.dataset.group || 'default';
        groups[g] = (groups[g] || 0) + (show ? 1 : 0);
      });
      empties.forEach(function (em) {
        var g = em.dataset.empty || 'default';
        em.classList.toggle('show', (groups[g] || 0) === 0);
      });
      try { history.replaceState(null, '', type === 'all' ? location.pathname : '#' + type); } catch (err) { /* ignore */ }
    }
    chips.forEach(function (c) {
      c.addEventListener('click', function () { applyFilter(c.dataset.type); });
    });
    var initial = location.hash.replace('#', '');
    var valid = Array.prototype.some.call(chips, function (c) { return c.dataset.type === initial; });
    applyFilter(valid ? initial : 'all');
  }

  /* Lightbox */
  var gallery = document.querySelector('.gallery');
  var lightbox = document.querySelector('.lightbox');
  if (gallery && lightbox) {
    var links = Array.prototype.slice.call(gallery.querySelectorAll('a'));
    var lbImg = lightbox.querySelector('img');
    var lbCap = lightbox.querySelector('.lb-cap');
    var idx = 0;
    var lastFocus = null;
    function showAt(i) {
      idx = (i + links.length) % links.length;
      var a = links[idx];
      lbImg.src = a.getAttribute('href');
      lbImg.alt = a.querySelector('img').alt;
      if (lbCap) lbCap.textContent = a.dataset.caption || '';
    }
    function openLb(i) {
      lastFocus = document.activeElement;
      showAt(i);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lb-close').focus();
    }
    function closeLb() {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    links.forEach(function (a, i) {
      a.addEventListener('click', function (e) { e.preventDefault(); openLb(i); });
    });
    lightbox.querySelector('.lb-close').addEventListener('click', closeLb);
    lightbox.querySelector('.lb-prev').addEventListener('click', function () { showAt(idx - 1); });
    lightbox.querySelector('.lb-next').addEventListener('click', function () { showAt(idx + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showAt(idx - 1);
      if (e.key === 'ArrowRight') showAt(idx + 1);
    });
  }

  /* Form validation */
  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var input = field.querySelector('input, textarea, select');
      var msg = field.querySelector('.msg');
      if (!input || !msg) return true;
      var v = input.value.trim();
      var error = '';
      if (input.required && !v) error = 'Please fill this in.';
      else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) error = 'That email does not look right.';
      else if (input.type === 'tel' && v && v.replace(/[^\d]/g, '').length < 8) error = 'Please add a full phone number.';
      field.classList.toggle('invalid', !!error);
      msg.textContent = error;
      input.setAttribute('aria-invalid', error ? 'true' : 'false');
      return !error;
    }
    form.querySelectorAll('.field').forEach(function (field) {
      var input = field.querySelector('input, textarea, select');
      if (input) input.addEventListener('blur', function () { check(field); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true;
      var firstBad = null;
      form.querySelectorAll('.field').forEach(function (field) {
        if (!check(field)) { ok = false; if (!firstBad) firstBad = field; }
      });
      if (!ok) {
        e.preventDefault();
        var inp = firstBad.querySelector('input, textarea, select');
        if (inp) inp.focus();
      }
    });
  });

  /* Smooth anchor scroll with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      try { history.pushState(null, '', '#' + id); } catch (err) { /* ignore */ }
    });
  });

  /* Year in footer */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Polish pass, 2 Nov 2026: scroll progress line, hero wipe, before and after slider, process line. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    document.documentElement.classList.add('js-anim');
    /* replay the hero entrance now that the animated start state exists */
    var hm = document.querySelector('.hero-media.in');
    if (hm) { hm.classList.remove('in'); void hm.offsetWidth; requestAnimationFrame(function () { requestAnimationFrame(function () { hm.classList.add('in'); }); }); }
  }

  /* Before and after slider: works with mouse, touch and keyboard through a native range input */
  document.querySelectorAll('[data-ba]').forEach(function (ba) {
    var r = ba.querySelector('.ba-range');
    if (!r) return;
    function set() { ba.style.setProperty('--pos', r.value + '%'); }
    r.addEventListener('input', set);
    set();
  });

  if (reduce) return;
  var bar = document.createElement('div');
  bar.className = 'progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var steps = document.querySelector('.steps[data-progress]');
  var ticking = false;
  function update() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
    if (steps) {
      var rc = steps.getBoundingClientRect();
      var p = (window.innerHeight * 0.7 - rc.top) / rc.height;
      steps.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
