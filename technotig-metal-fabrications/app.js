/* Technotig Metal Fabrications: header, menu, reveals, photo swap, gallery spotlight, step line, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    d.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { if (a.getAttribute('aria-disabled') !== 'true') setMenu(false); });
    });
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); }
    });
  }

  /* Disabled language switch */
  d.querySelectorAll('[aria-disabled="true"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
  });

  /* Smooth anchors with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var h = header ? header.getBoundingClientRect().height : 0;
      var top = target.getBoundingClientRect().top + window.scrollY - h - 8;
      window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
      if (history.pushState) history.pushState(null, '', id);
    });
  });

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  /* Siblings inside one parent get an 80ms stagger, capped at 400ms */
  items.forEach(function (el) {
    var p = el.parentElement;
    if (!p.__k) p.__k = 0;
    el.style.setProperty('--rd', Math.min(p.__k * 0.08, 0.4) + 's');
    p.__k += 1;
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

  /* What we make: hover swaps the photo */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var imgs = d.querySelectorAll('.make__img');
    var lis = swap.querySelectorAll('.make__item');
    function show(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-key') === key); });
      lis.forEach(function (li) { li.classList.toggle('is-on', li.getAttribute('data-img') === key); });
    }
    lis.forEach(function (li) {
      var key = li.getAttribute('data-img');
      li.addEventListener('mouseenter', function () { show(key); });
      li.addEventListener('focusin', function () { show(key); });
    });
    show(lis[0].getAttribute('data-img'));
  }

  /* Gallery: cursor-following highlight */
  var spot = d.querySelector('[data-spot]');
  if (spot && !reduce && window.matchMedia('(hover: hover)').matches) {
    spot.addEventListener('pointermove', function (e) {
      var tile = e.target.closest('.tile');
      if (!tile) return;
      var r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      tile.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* Process line draws on scroll */
  var steps = d.querySelector('[data-steps]');
  if (steps) {
    if (reduce || !('IntersectionObserver' in window) || steps.getBoundingClientRect().top < window.innerHeight) {
      steps.classList.add('is-in');
    } else {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { steps.classList.add('is-in'); so.unobserve(steps); } });
      }, { threshold: 0.2 });
      so.observe(steps);
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-technotig-metal-fabrications"]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please add your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please add a valid email.'; },
      type: function (v) { return v ? '' : 'Please choose one.'; },
      message: function (v) { return v.trim().length >= 10 ? '' : 'A few words on what you need, please.'; }
    };
    function check(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var msg = rule(input.value);
      var field = input.closest('.field');
      if (field) {
        field.classList.toggle('is-bad', !!msg);
        var m = field.querySelector('.field__msg');
        if (m) m.textContent = msg;
      }
      return !msg;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (i) {
      i.addEventListener('blur', function () { check(i); });
      i.addEventListener('input', function () { if (i.closest('.field') && i.closest('.field').classList.contains('is-bad')) check(i); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      form.querySelectorAll('input, select, textarea').forEach(function (i) {
        if (!check(i)) { ok = false; if (!first) first = i; }
      });
      if (!ok) { e.preventDefault(); if (first) first.focus(); }
    });
  }

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".about__photo img", "left"], [".about__sign img", "iris"], [".make__media", "up"], [".tile img", "up", 70]], "magnet": [".btn--fill"]};
  var d = document, R = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.innerHeight > 1600;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function all(s) { return Array.prototype.slice.call(d.querySelectorAll(s)); }
  if (reduce) return;
  R.classList.add('pz');

  if (C.progress) {
    var bar = d.createElement('div');
    bar.className = 'pz-progress' + (C.progress === 'v' ? ' pz-progress--v' : '');
    bar.setAttribute('aria-hidden', 'true');
    d.body.appendChild(bar);
    var tk = 0;
    var upd = function () {
      tk = 0;
      var h = R.scrollHeight - window.innerHeight;
      var v = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.transform = (C.progress === 'v' ? 'scaleY(' : 'scaleX(') + v.toFixed(4) + ')';
    };
    window.addEventListener('scroll', function () { if (!tk) tk = requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* A fully clipped element never reports as intersecting, so we watch its parent instead */
  var watch = [];
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      watch.forEach(function (w) { if (w[0] === e.target) w[1].classList.add('pz-in'); });
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 }) : null;
  /* Lazy images inside a clipped box never load on their own (the browser sees them as hidden): start them early */
  var pre = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll('img[loading="lazy"]').forEach(function (im) { im.loading = 'eager'; });
      pre.unobserve(e.target);
    });
  }, { rootMargin: '900px 0px 900px 0px' }) : null;
  (C.clip || []).forEach(function (c) {
    all(c[0]).forEach(function (el, i) {
      el.classList.add('pz-clip', 'pz-clip--' + (c[1] || 'up'));
      if (c[2]) el.style.transitionDelay = (i * c[2]) + 'ms';
      if (!io || el.getBoundingClientRect().top < window.innerHeight * 0.9) {
        requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('pz-in'); }); });
      } else { var p = el.parentElement || el; watch.push([p, el]); io.observe(p); if (pre) pre.observe(p); }
    });
  });

  function follow(el, cls, fn) {
    var raf = 0, ev = null;
    el.classList.add(cls);
    el.addEventListener('pointermove', function (e) {
      ev = e; el.classList.add('pz-on');
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = 0; var b = el.getBoundingClientRect(); fn((ev.clientX - b.left) / b.width - 0.5, (ev.clientY - b.top) / b.height - 0.5, ev.clientX - b.left, ev.clientY - b.top); });
    });
    el.addEventListener('pointerleave', function () { el.classList.remove('pz-on'); if (raf) { cancelAnimationFrame(raf); raf = 0; } fn(null); });
  }
  if (fine) {
    (C.tilt || []).forEach(function (s) {
      all(s).forEach(function (el) {
        follow(el, 'pz-tilt', function (x, y) {
          el.style.transform = x === null ? '' : 'perspective(1000px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-6px)';
        });
      });
    });
    (C.magnet || []).forEach(function (s) {
      all(s).forEach(function (el) {
        follow(el, 'pz-mag', function (x, y) {
          el.style.transform = x === null ? '' : 'translate(' + (x * 14).toFixed(1) + 'px, ' + (y * 10).toFixed(1) + 'px)';
        });
      });
    });
    (C.spot || []).forEach(function (s) {
      all(s).forEach(function (el) {
        var g = d.createElement('span'); g.className = 'pz-glow'; g.setAttribute('aria-hidden', 'true'); el.appendChild(g);
        follow(el, 'pz-spot', function (x, y, px, py) { if (x !== null) g.style.transform = 'translate(' + px.toFixed(0) + 'px, ' + py.toFixed(0) + 'px)'; });
      });
    });
  }

  if (C.index && io) {
    var secs = all(C.index);
    if (secs.length > 2) {
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      var ix = d.createElement('div'); ix.className = 'pz-index'; ix.setAttribute('aria-hidden', 'true');
      ix.innerHTML = '<span class="pz-index__n">01</span><span class="pz-index__bar"><i></i></span><span>' + pad(secs.length) + '</span>';
      d.body.appendChild(ix);
      var num = ix.querySelector('.pz-index__n'), fill = ix.querySelector('i');
      var sio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = secs.indexOf(e.target) + 1;
          num.textContent = pad(k);
          fill.style.transform = 'scaleX(' + (k / secs.length).toFixed(3) + ')';
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(function (s) { sio.observe(s); });
    }
  }
})();

/* == /polish == */
