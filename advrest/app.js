/* Advrest homepage: hero entrance and parallax, header, menu, reveals, image swap, drag strip,
   progress line, magnetic buttons, form validation, anchor scroll. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  root.classList.remove('no-js');
  root.classList.add('js');

  /* Hero entrance: start on the first frame, do not wait for fonts or images */
  var hero = d.querySelector('[data-hero]');
  if (hero) {
    if (reduce) hero.classList.add('is-ready');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('is-ready'); }); });
  }

  /* Header shrink + hero parallax (photo moves slower than the page) */
  var header = d.querySelector('[data-header]');
  var para = d.querySelector('[data-parallax]');
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-small', y > 40);
    if (para && !reduce && y < window.innerHeight * 1.4) {
      para.style.transform = 'translate3d(0,' + (y * 0.22).toFixed(1) + 'px,0)';
    }
    updateProgress();
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* Progress line that draws as the steps scroll by */
  var prog = d.querySelector('[data-progress]');
  var fill = d.querySelector('[data-progress-fill]');
  var vertical = window.matchMedia('(max-width: 860px)');
  function updateProgress() {
    if (!prog || !fill || reduce) return;
    var r = prog.getBoundingClientRect();
    var vh = window.innerHeight;
    var p = (vh * 0.85 - r.top) / (r.height * 0.85);
    p = Math.max(0, Math.min(1, p));
    fill.style.transform = vertical.matches ? 'scaleY(' + p.toFixed(3) + ')' : 'scaleX(' + p.toFixed(3) + ')';
  }
  onScroll();
  window.addEventListener('resize', updateProgress);

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, refocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (refocus) burger.focus();
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Scroll reveals with stagger; anything already on screen shows at once */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var parent = el.parentElement;
    var n = groups.get(parent) || 0;
    el.style.setProperty('--d', (n * 0.08).toFixed(2) + 's');
    groups.set(parent, n + 1);
  });
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

  /* Hover image swap in "What you can do" */
  var swapImgs = d.querySelectorAll('[data-swap]');
  var swapLabel = d.querySelector('[data-swap-label]');
  var labels = ['01 Sell', '02 Let', '03 Buy or rent', '04 Invest'];
  var swapItems = d.querySelectorAll('[data-swap-to]');
  function swapTo(i) {
    swapImgs.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === String(i)); });
    swapItems.forEach(function (li) { li.classList.toggle('is-active', li.getAttribute('data-swap-to') === String(i)); });
    if (swapLabel) swapLabel.textContent = labels[i] || '';
  }
  swapItems.forEach(function (li) {
    var i = parseInt(li.getAttribute('data-swap-to'), 10);
    li.addEventListener('mouseenter', function () { swapTo(i); });
    li.addEventListener('focus', function () { swapTo(i); });
    li.addEventListener('click', function () { swapTo(i); });
  });
  if (swapItems.length) {
    swapTo(0);
    /* On touch screens, swap as each item crosses the middle of the screen */
    if (!finePointer && 'IntersectionObserver' in window) {
      var mid = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) swapTo(parseInt(en.target.getAttribute('data-swap-to'), 10)); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      swapItems.forEach(function (li) { mid.observe(li); });
    }
  }

  /* Drag strip: mouse drag, arrows, native swipe on touch */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var section = strip.closest('section');
    var prev = section && section.querySelector('[data-prev]');
    var next = section && section.querySelector('[data-next]');
    function step(dir) {
      var card = strip.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 24 : 360;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, startX = 0, startLeft = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      setTimeout(function () { strip.classList.remove('is-drag'); }, 0);
    });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
  });

  /* Magnetic buttons (fine pointers only) */
  if (finePointer && !reduce) {
    d.querySelectorAll('.magnet').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.28;
        b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity() && field.value.trim() !== '';
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value.trim())) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    var fields = form.querySelectorAll('.field input, .field select, .field textarea');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
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
      var off = header ? header.getBoundingClientRect().height : 64;
      var y = id === 'top' ? 0 : t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (id !== 'top') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* POLISH */
  /* Polish pass, 2 Nov 2026: scroll progress line, photo wipe reveals, property type cards tilt. Transform, opacity and clip-path only; off for reduced motion */
  (function () {
    var cfg = {"progress":true,"clip":".about__img, .what__media","tilt":".strip .card","magnet":""};
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
    var $$ = function (s) { return s ? Array.prototype.slice.call(document.querySelectorAll(s)) : []; };

    /* Scroll progress line under the header */
    if (cfg.progress) {
      var bar = document.createElement('div');
      bar.className = 'pg-progress'; bar.setAttribute('aria-hidden', 'true');
      document.body.appendChild(bar);
      var tick = false;
      var paint = function () {
        var max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, scrollY / max) : 0) + ')';
        tick = false;
      };
      addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(paint); } }, { passive: true });
      paint();
    }

    if (reduce) return;

    /* Image reveals: a clip-path wipe as each photo enters the screen */
    var clips = $$(cfg.clip);
    if (clips.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('pg-in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
      clips.forEach(function (el) {
        if (el.getBoundingClientRect().top < innerHeight) return;
        el.classList.add('pg-clip'); io.observe(el);
      });
    }

    if (!fine) return;

    /* Cards tilt a little toward the cursor */
    $$(cfg.tilt).forEach(function (el) {
      el.addEventListener('pointerenter', function () { el.style.transition = 'transform .3s cubic-bezier(.2,.7,.2,1)'; });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });

    /* Buttons pull toward the cursor */
    $$(cfg.magnet).forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.transition = 'transform .2s ease-out';
        el.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  })();
