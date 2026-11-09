/* Neocoat homepage: header, menu, hero deal, reveals, service swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };

  /* Hero: stacked chips fan out, then settle. Starts on the first frame, no font or image wait. */
  var hero = d.querySelector('.hero');
  var stage = d.querySelector('[data-stage]');
  if (hero) {
    hero.querySelectorAll('.line').forEach(function (l, i) { l.style.setProperty('--i', i); });
    if (reduce) {
      hero.classList.add('is-in');
    } else {
      raf(function () {
        if (stage) {
          var sb = stage.getBoundingClientRect();
          var cxs = sb.left + sb.width / 2, cys = sb.top + sb.height / 2;
          stage.querySelectorAll('.chip').forEach(function (c, i) {
            var b = c.getBoundingClientRect();
            /* offset from the chip's final place to the stage centre (rotation is small, so the box centre is close enough) */
            c.style.setProperty('--cx', Math.round(cxs - (b.left + b.width / 2)) + 'px');
            c.style.setProperty('--cy', Math.round(cys - (b.top + b.height / 2)) + 'px');
            c.style.setProperty('--d', i);
          });
        }
        hero.classList.add('is-in');
      });
    }
  }

  /* Swatch chips tilt a little toward the cursor (mouse only) */
  if (stage && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var imgs = stage.querySelectorAll('.chip__img');
    stage.style.perspective = '1200px';
    stage.addEventListener('pointermove', function (e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      imgs.forEach(function (im, i) {
        var k = 1 + i * 0.25;
        im.style.transform = 'rotateY(' + (x * 8 * k).toFixed(2) + 'deg) rotateX(' + (-y * 8 * k).toFixed(2) + 'deg) translate(' + (x * 6 * k).toFixed(1) + 'px,' + (y * 6 * k).toFixed(1) + 'px)';
      });
    });
    stage.addEventListener('pointerleave', function () { imgs.forEach(function (im) { im.style.transform = ''; }); });
  }

  /* Header shrink */
  var header = d.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu: closes on link click and Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Scroll reveals with the above-the-fold guard and a small stagger per group */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--i', Math.min(n, 5));
    groups.set(p, n + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* What we do: hover, focus or tap swaps the photo */
  var swaps = d.querySelectorAll('[data-swap]');
  var swapLabel = d.querySelector('[data-swap-label]');
  var sItems = d.querySelectorAll('[data-item]');
  function activate(idx) {
    sItems.forEach(function (it) { it.classList.toggle('is-on', it.getAttribute('data-item') === idx); });
    swaps.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap') === idx); });
    var it = d.querySelector('[data-item="' + idx + '"]');
    if (swapLabel && it) swapLabel.textContent = it.querySelector('.slist__n').textContent + ' ' + it.querySelector('h3').textContent.split(' and ')[0].split(',')[0];
  }
  sItems.forEach(function (it) {
    var idx = it.getAttribute('data-item');
    it.addEventListener('mouseenter', function () { activate(idx); });
    it.addEventListener('focus', function () { activate(idx); });
    it.addEventListener('click', function () { activate(idx); });
  });

  /* Work strip: buttons, mouse drag, progress bar */
  var strip = d.querySelector('[data-strip]');
  if (strip) {
    var track = strip.querySelector('[data-track]');
    var bar = strip.querySelector('[data-bar]');
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 360;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    function setBar() {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var pct = max > 0 ? track.scrollLeft / max : 1;
      bar.style.transform = 'scaleX(' + (0.2 + pct * 0.8).toFixed(3) + ')';
    }
    track.addEventListener('scroll', setBar, { passive: true });
    window.addEventListener('resize', setBar);
    setBar();
    var down = false, startX = 0, startL = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = track.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; track.classList.add('is-drag'); }
      track.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false; track.classList.remove('is-drag');
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  /* How it runs: line draws as the section scrolls through */
  var proc = d.querySelector('[data-process]');
  var line = d.querySelector('[data-line]');
  if (proc && line) {
    if (reduce) {
      line.style.transform = 'none';
    } else {
      var ticking = false;
      var drawLine = function () {
        ticking = false;
        var b = proc.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.85 - b.top) / (b.height * 0.75);
        p = Math.max(0, Math.min(1, p));
        var vertical = window.matchMedia('(max-width: 960px)').matches;
        line.style.transform = (vertical ? 'scaleY(' : 'scaleX(') + p.toFixed(3) + ')';
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; raf(drawLine); } }, { passive: true });
      window.addEventListener('resize', drawLine);
      drawLine();
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('[data-form]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please write a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please write a valid email address.'; },
      surface: function (v) { return v ? '' : 'Please choose what needs coating.'; },
      message: function (v) { return v.trim().length >= 5 ? '' : 'A few words about the job, please.'; }
    };
    function check(name) {
      var el = form.elements[name];
      var msg = rules[name](el.value);
      var err = form.querySelector('[data-err="' + name + '"]');
      el.closest('.field').classList.toggle('is-bad', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      el.addEventListener('blur', function () { if (el.value) check(n); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(n); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) { if (!check(n) && !first) first = form.elements[n]; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();
