/* Peris Metal Worx: hero entrance, header, menu, reveals, service swap, drag strip, process rail, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: starts on the first animation frame, does not wait for fonts or images.
     Name lines done by about 0.9 s, lead by 1 s, buttons by 0.8 s. */
  var hero = d.querySelector('.hero');
  if (hero) {
    if (reduce) {
      hero.classList.add('is-in');
    } else {
      var started = false;
      var go = function () { if (!started) { started = true; hero.classList.add('is-in'); } };
      requestAnimationFrame(function () { requestAnimationFrame(go); });
      setTimeout(go, 120);
    }
  }

  /* Header shrinks on scroll */
  var header = d.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu: closes on link click and Escape */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, focusBack) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    d.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      var first = menu.querySelector('a');
      if (first) first.focus();
    } else if (focusBack) {
      burger.focus();
    }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open'), true); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false, false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false, true);
    });
  }

  /* Language switch is a visible no-op until the Greek version exists */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href');
    if (id.length < 2) return;
    a.addEventListener('click', function (e) {
      var t = d.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height : 0;
      var y = t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Scroll reveals with above-the-fold guard and a 70 ms stagger per group */
  var items = Array.prototype.slice.call(d.querySelectorAll('.r'));
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i, 5) * 70 + 'ms');
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover, focus or scroll swaps the photo */
  var svc = d.querySelectorAll('.svc__item');
  var pics = d.querySelectorAll('.sp');
  function setSvc(n) {
    svc.forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-for') === String(n)); });
    pics.forEach(function (el) { el.classList.toggle('is-on', el.getAttribute('data-sp') === String(n)); });
  }
  if (svc.length) {
    setSvc(0);
    svc.forEach(function (el) {
      var n = el.getAttribute('data-for');
      el.addEventListener('mouseenter', function () { setSvc(n); });
      el.addEventListener('focus', function () { setSvc(n); });
    });
    if ('IntersectionObserver' in window) {
      var sio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) setSvc(en.target.getAttribute('data-for')); });
      }, { rootMargin: '-45% 0px -45% 0px' });
      svc.forEach(function (el) { sio.observe(el); });
    }
  }

  /* Work strip: mouse drag, arrow buttons, keyboard */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var section = strip.closest('section');
    var prev = section && section.querySelector('[data-prev]');
    var next = section && section.querySelector('[data-next]');
    function step(dir) {
      var card = strip.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      strip.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    var down = false, startX = 0, startL = 0, moved = false;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startL = strip.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) { moved = true; strip.classList.add('is-drag'); }
      if (moved) strip.scrollLeft = startL - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      strip.classList.remove('is-drag');
    });
  });

  /* Process rail draws with scroll progress */
  var rail = d.querySelector('[data-rail]');
  if (rail) {
    if (reduce) {
      rail.style.setProperty('--p', 1);
    } else {
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = rail.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
        p = Math.max(0, Math.min(1, p));
        rail.style.setProperty('--p', p.toFixed(3));
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
      }, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('.form');
  if (form) {
    var msgs = {
      name: 'Please write your name.',
      phone: 'Please add a phone number we can call.',
      email: 'Please add a valid email address.',
      'project-type': 'Please choose what you need.',
      message: 'Please tell us a little about the job.'
    };
    var check = function (field) {
      var wrap = field.closest('.f');
      if (!wrap) return true;
      var err = wrap.querySelector('.f__err');
      var v = field.value.trim();
      var ok = v.length > 0;
      if (ok && field.type === 'email') ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (ok && field.type === 'tel') ok = v.replace(/\D/g, '').length >= 8;
      wrap.classList.toggle('is-bad', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.textContent = ok ? '' : (msgs[field.name] || 'Please fill this in.');
      return ok;
    };
    var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value.trim()) check(f); });
      f.addEventListener('input', function () { if (f.closest('.f').classList.contains('is-bad')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var first = null;
      fields.forEach(function (f) { if (!check(f) && !first) first = f; });
      if (first) { e.preventDefault(); first.focus(); }
    });
  }

  /* Polish: seam width for the cutting reveal, tilting work cards, magnetic buttons */
  d.querySelectorAll('.cut').forEach(function (el) { el.style.setProperty('--cut-w', el.offsetWidth + 'px'); });
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine) {
    d.querySelectorAll('.strip .card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        if (!c.classList.contains('is-in')) return;
        var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        c.classList.remove('is-untilt'); c.classList.add('is-tilt');
        c.style.transform = 'rotateY(' + (x * 7).toFixed(2) + 'deg) rotateX(' + (-y * 7).toFixed(2) + 'deg)';
      });
      c.addEventListener('pointerleave', function () {
        c.classList.remove('is-tilt'); c.classList.add('is-untilt'); c.style.transform = '';
      });
    });
    d.querySelectorAll('.btn--accent, .hero__cta .btn').forEach(function (b) {
      b.classList.add('mag');
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
