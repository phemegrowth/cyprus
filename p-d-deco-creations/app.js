(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* footer year */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();

  /* hero entrance: starts on the first frame, no wait for fonts or images */
  var hero = document.querySelector('.hero');
  if (hero) {
    var lines = hero.querySelectorAll('.rv-line > span');
    lines.forEach(function (s, i) { s.style.transitionDelay = (i * 80) + 'ms'; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-in'); }); });
  }

  /* header shrink */
  var header = document.querySelector('.header');
  function onHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 24); }

  /* hero reel drifts left as the page scrolls (transform only) */
  var reel = document.querySelector('[data-reel]');
  function onReel() {
    if (!reel || reduce) return;
    var h = hero.offsetHeight;
    if (window.scrollY > h * 1.2) return;
    reel.style.transform = 'translate3d(' + (-window.scrollY * 0.45).toFixed(1) + 'px,0,0)';
  }

  /* process line draws with scroll */
  var prog = document.querySelector('[data-progress]');
  function onProgress() {
    if (!prog || reduce) return;
    var r = prog.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.65 - r.top) / r.height;
    p = Math.max(0, Math.min(1, p));
    prog.style.setProperty('--p', p.toFixed(3));
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { onHeader(); onReel(); onProgress(); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onHeader(); onReel(); onProgress();

  /* scroll reveals, with the above-the-fold guard */
  var items = [].slice.call(document.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.style.transitionDelay = (n++ * 80) + 'ms';
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  }

  /* polish 2 Nov: before and after slider, with one short demo sweep when it comes into view */
  var ba = document.querySelector('[data-ba]');
  if (ba) {
    var range = ba.querySelector('.ba__range');
    var setX = function (v) { ba.style.setProperty('--x', v + '%'); };
    var touched = false;
    range.addEventListener('input', function () { touched = true; setX(range.value); });
    if (!reduce && 'IntersectionObserver' in window) {
      var bio = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        bio.disconnect();
        var t0 = null;
        var sweep = function (t) {
          if (touched) return;
          if (t0 === null) t0 = t;
          var k = Math.min(1, (t - t0) / 1800);
          var v = 50 + Math.sin(k * Math.PI * 2) * 22 * (1 - k * 0.3);
          setX(k < 1 ? v.toFixed(2) : 50);
          if (k < 1) requestAnimationFrame(sweep); else range.value = 50;
        };
        setTimeout(function () { requestAnimationFrame(sweep); }, 500);
      }, { threshold: 0.5 });
      bio.observe(ba);
    }
  }

  /* what we build: hover or focus swaps the photo */
  var buildItems = document.querySelectorAll('.build__item');
  var buildImgs = document.querySelectorAll('.build__media img');
  function setBuild(i) {
    buildItems.forEach(function (el, k) { el.classList.toggle('is-on', k === i); });
    buildImgs.forEach(function (img, k) { img.classList.toggle('is-on', k === i); });
  }
  buildItems.forEach(function (el, i) {
    el.setAttribute('tabindex', '0');
    el.addEventListener('mouseenter', function () { setBuild(i); });
    el.addEventListener('focus', function () { setBuild(i); });
    el.addEventListener('click', function () { setBuild(i); });
  });
  /* on touch screens, the item in the middle of the screen takes the photo */
  if ('IntersectionObserver' in window && window.matchMedia('(hover: none)').matches) {
    var bio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) setBuild([].indexOf.call(buildItems, e.target));
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    buildItems.forEach(function (el) { bio.observe(el); });
  }

  /* horizontal drag strip */
  var strip = document.querySelector('[data-strip]');
  if (strip) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
      strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; strip.classList.remove('is-drag');
    });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); e.preventDefault(); }
    });
  }

  /* mobile menu: closes on link click and Escape */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function closeMenu() {
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.hidden;
      menu.hidden = !open;
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeMenu(); burger.focus(); } });
  }

  /* smooth anchors with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' ) { e.preventDefault(); return; }
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var top = id === '#top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off - 8;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== '#top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* form validation with inline messages */
  var form = document.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return !v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'This email does not look right.'; },
      'project-type': function (v) { return v ? '' : 'Please choose what you want to build.'; }
    };
    function check(el) {
      var fn = rules[el.name]; if (!fn) return true;
      var msg = fn(el.value);
      var f = el.closest('.field');
      f.classList.toggle('is-bad', !!msg);
      f.querySelector('.field__err').textContent = msg;
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el)) { ok = false; first = first || el; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('blur', function (e) {
      if (e.target.name && rules[e.target.name] && e.target.value) check(e.target);
    }, true);
  }
})();
