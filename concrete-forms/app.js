(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero entrance: start on the first frame, never wait for fonts or images.
  requestAnimationFrame(function () { requestAnimationFrame(function () { doc.classList.add('is-ready'); }); });

  // Footer year
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());

  // Header shrinks on scroll
  var header = document.querySelector('.site-header');
  var onScrollHeader = function () { header.classList.toggle('is-small', window.scrollY > 24); };
  onScrollHeader();

  // Mobile menu: opens, closes on link click and Escape
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr').textContent = open ? 'Close menu' : 'Open menu';
    menu.hidden = !open;
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  // Disabled language switch is a visible no-op
  document.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  // Smooth anchor scroll with header offset
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('aria-disabled') === 'true') return;
    var id = a.getAttribute('href');
    if (id === '#') return;
    var target = id === '#top' ? document.body : document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    var top = id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY - header.offsetHeight - 8;
    window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    if (id !== '#top') history.replaceState(null, '', id);
  });

  // Scroll reveals, with the above-the-fold guard
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var groups = new Map();
  reveals.forEach(function (el) {
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty('--d', String(n));
    groups.set(p, n + 1);
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

  // Services: hover or focus swaps the photo
  var services = document.querySelectorAll('.service');
  var swaps = document.querySelectorAll('.swap-img');
  function activate(key) {
    services.forEach(function (s) { s.classList.toggle('is-on', s.dataset.key === key); });
    swaps.forEach(function (i) { i.classList.toggle('is-on', i.dataset.key === key); });
  }
  services.forEach(function (s) {
    s.addEventListener('mouseenter', function () { activate(s.dataset.key); });
    s.addEventListener('focus', function () { activate(s.dataset.key); });
  });
  activate('1');

  // Work strip: drag with the mouse (touch scrolls natively)
  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX; moved = Math.abs(dx);
      if (moved > 4) strip.classList.add('is-drag');
      strip.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-drag'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { strip.scrollBy({ left: 320, behavior: reduce ? 'auto' : 'smooth' }); }
      if (e.key === 'ArrowLeft') { strip.scrollBy({ left: -320, behavior: reduce ? 'auto' : 'smooth' }); }
    });
  }

  // Scroll-linked: process line draws, about photo drifts (transform only)
  var fill = document.querySelector('.steps-fill');
  var steps = document.querySelector('.steps');
  var aboutImg = document.querySelector('.about-photo img');
  var ticking = false;
  function onFrame() {
    ticking = false;
    onScrollHeader();
    if (reduce) return;
    var vh = window.innerHeight;
    if (fill && steps) {
      var r = steps.getBoundingClientRect();
      var p = (vh * 0.7 - r.top) / r.height;
      p = Math.max(0, Math.min(1, p));
      fill.style.transform = 'scaleY(' + p.toFixed(3) + ')';
    }
    if (aboutImg) {
      var ar = aboutImg.parentElement.getBoundingClientRect();
      if (ar.bottom > 0 && ar.top < vh) {
        var t = (ar.top + ar.height / 2 - vh / 2) / vh;
        aboutImg.style.transform = 'scale(1.08) translate3d(0,' + (t * -24).toFixed(1) + 'px,0)';
      }
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }
  }, { passive: true });
  onFrame();

  // Form validation with inline messages
  var form = document.querySelector('.form');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length > 1 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^\d]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      area: function (v) { return v ? '' : 'Please choose where the site is.'; },
      message: function (v) { return v.trim().length > 4 ? '' : 'A few words about the project, please.'; }
    };
    function check(field) {
      var fn = rules[field.name];
      if (!fn) return true;
      var msg = fn(field.value);
      var box = field.closest('.field');
      var err = document.getElementById('e-' + field.name);
      box.classList.toggle('has-err', !!msg);
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return !msg;
    }
    form.addEventListener('submit', function (e) {
      var first = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f) && !first) first = f;
      });
      if (first) { e.preventDefault(); first.focus(); }
    });
    form.addEventListener('blur', function (e) {
      if (e.target.name && rules[e.target.name] && e.target.value) check(e.target);
    }, true);
  }
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
