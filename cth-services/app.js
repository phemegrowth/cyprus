/* CTH Services: header, menu, reveals, service photo swap, drag strip, process line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
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

  /* No-op language switch */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2 || a.getAttribute('aria-disabled') === 'true') return;
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0) + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Scroll reveals, staggered; anything already on screen shows at once */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.style.setProperty('--d', (n++ * 80) + 'ms');
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var swaps = d.querySelectorAll('.swap__img');
  d.querySelectorAll('[data-swap-to]').forEach(function (item, i, all) {
    function show() {
      var k = item.getAttribute('data-swap-to');
      swaps.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === k); });
      all.forEach(function (o) { o.classList.toggle('is-active', o === item); });
    }
    item.addEventListener('mouseenter', show);
    item.addEventListener('focus', show);
  });

  /* Work strip: drag with the mouse, arrows, keyboard */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var section = strip.closest('section');
    var prev = section.querySelector('[data-prev]');
    var next = section.querySelector('[data-next]');
    function step(dir) {
      strip.scrollBy({ left: dir * Math.max(300, strip.clientWidth * 0.6), behavior: reduce ? 'auto' : 'smooth' });
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
      strip.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  });

  /* Process: the line fills as the steps scroll past */
  var steps = d.querySelector('.steps');
  var fill = d.querySelector('.steps__fill');
  if (steps && fill) {
    if (reduce) {
      fill.style.setProperty('--p', 1);
    } else {
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = steps.getBoundingClientRect();
        var mid = window.innerHeight * 0.6;
        var p = (mid - r.top) / r.height;
        fill.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[data-netlify]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      'work-type': function (v) { return v ? '' : 'Please choose the type of work.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A line about the job helps us reply.'; }
    };
    function check(el) {
      var fn = rules[el.name];
      if (!fn) return true;
      var msg = fn(el.value);
      var field = el.closest('.field');
      field.classList.toggle('is-bad', !!msg);
      el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      field.querySelector('.err').textContent = msg;
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var el = form.elements[n];
      if (!el) return;
      el.addEventListener('blur', function () { check(el); });
      el.addEventListener('input', function () { if (el.closest('.field').classList.contains('is-bad')) check(el); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var el = form.elements[n];
        if (el && !check(el) && !first) first = el;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* Polish pass, 2 Nov 2026: extra motion. Only transform, opacity and clip-path.
   Everything is visible without JS, and reduced motion switches it all off. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = w.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var io = 'IntersectionObserver' in w;
  function onView(els, fn, th) {
    if (!els.length) return;
    if (reduce || !io) { els.forEach(fn); return; }
    var o = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { fn(e.target); o.unobserve(e.target); } });
    }, { threshold: th || 0.2, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { o.observe(el); });
  }
  var $$ = function (s) { return Array.prototype.slice.call(d.querySelectorAll(s)); };

  /* Scroll progress line */
  var bar = d.querySelector('[data-scrollbar]');
  if (bar && !reduce) {
    var tick = false;
    var upd = function () {
      var h = d.documentElement.scrollHeight - w.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, w.scrollY / h) : 0) + ')';
      tick = false;
    };
    w.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Clip-path image reveals and line draws */
  /* (observe the parent: a fully clipped element can read as not visible) */
  $$('[data-clip], [data-draw]').forEach(function (el) {
    var host = el.parentElement || el;
    onView([host], function () { el.classList.add('is-shown'); }, 0.1);
  });

  /* Count up (only numbers already printed on the page) */
  onView($$('[data-countup]'), function (el) {
    var to = parseFloat(el.getAttribute('data-countup'));
    var from = parseFloat(el.getAttribute('data-countup-from') || '0');
    if (reduce || isNaN(to)) { el.textContent = el.getAttribute('data-countup-text') || to; return; }
    var t0 = null, dur = 1400;
    var step = function (t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(step); else el.textContent = el.getAttribute('data-countup-text') || to;
    };
    requestAnimationFrame(step);
  }, 0.5);

  if (reduce || !fine) return;

  /* Buttons that pull toward the cursor */
  $$('[data-magnet]').forEach(function (b) {
    b.addEventListener('mousemove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * 0.25, y = (e.clientY - r.top - r.height / 2) * 0.35;
      b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
    });
    b.addEventListener('mouseleave', function () { b.style.transform = ''; });
  });

  /* Cards that tilt on hover */
  $$('[data-tilt]').forEach(function (c) {
    c.addEventListener('mousemove', function (e) {
      var r = c.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      c.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    c.addEventListener('mouseleave', function () { c.style.transform = ''; });
  });

  /* Highlight that follows the cursor over a grid */
  $$('[data-spot]').forEach(function (g) {
    var s = d.createElement('span'); s.className = 'cursor-spot'; s.setAttribute('aria-hidden', 'true'); g.appendChild(s);
    g.addEventListener('mousemove', function (e) {
      var r = g.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left) + 'px,' + (e.clientY - r.top) + 'px) translate(-50%,-50%)';
      s.style.opacity = '1';
    });
    g.addEventListener('mouseleave', function () { s.style.opacity = '0'; });
  });
})();

/* Before and after slider (polish pass, 2 Nov 2026) */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-ba]'), function (b) {
    var f = b.querySelector('.ba__frame'), r = b.querySelector('.ba__range');
    if (!f || !r) return;
    var set = function () { f.style.setProperty('--x', r.value); };
    r.addEventListener('input', set); set();
  });
})();
