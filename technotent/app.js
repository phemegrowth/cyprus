/* Technotent homepage: curtain, header, menu, reveals, swap, strip, marquee, timeline, accordion, form. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Curtain (hero mechanic H): the striped panel lifts, then the headline reveals line by line */
  var curtain = d.querySelector('.curtain');
  function heroGo() { d.documentElement.classList.add('hero-go'); }
  if (curtain && !reduce) {
    var done = false;
    function finish() { if (done) return; done = true; heroGo(); setTimeout(function () { if (curtain.parentNode) curtain.parentNode.removeChild(curtain); }, 1100); }
    curtain.addEventListener('animationstart', function (e) { if (e.animationName === 'curtain-up') setTimeout(heroGo, 250); });
    curtain.addEventListener('animationend', function (e) { if (e.animationName === 'curtain-up') finish(); });
    setTimeout(function () { curtain.style.visibility = 'hidden'; finish(); }, 2300);
  } else {
    if (curtain && curtain.parentNode) curtain.parentNode.removeChild(curtain);
    heroGo();
  }

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
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
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); } else { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Scroll reveals, with the above-the-fold guard */
  var items = d.querySelectorAll('.r');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('is-in'); else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Services: hover or focus swaps the photo */
  var swap = d.querySelector('[data-swap]');
  if (swap) {
    var imgs = swap.querySelectorAll('.swap__img');
    var rows = d.querySelectorAll('[data-swap-target]');
    function show(key) {
      imgs.forEach(function (im) { im.classList.toggle('is-on', im.getAttribute('data-swap-key') === key); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.getAttribute('data-swap-target') === key); });
    }
    rows.forEach(function (r) {
      var key = r.getAttribute('data-swap-target');
      r.addEventListener('mouseenter', function () { show(key); });
      r.addEventListener('focusin', function () { show(key); });
      r.addEventListener('click', function () { show(key); });
    });
    /* On scroll (phones have no hover): the row nearest the middle of the screen wins */
    if ('IntersectionObserver' in window) {
      var rio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) show(en.target.getAttribute('data-swap-target')); });
      }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
      rows.forEach(function (r) { rio.observe(r); });
    }
  }

  /* Work strip: buttons and drag */
  d.querySelectorAll('[data-strip]').forEach(function (strip) {
    var track = strip.querySelector('.strip__track');
    var prev = strip.querySelector('[data-prev]');
    var next = strip.querySelector('[data-next]');
    if (!track) return;
    function step(dir) {
      var card = track.querySelector('.card');
      var w = card ? card.getBoundingClientRect().width + 16 : 400;
      track.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
      track.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { if (!down) return; down = false; track.classList.remove('is-dragging'); });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
    });
  });

  /* Timeline line draws as it scrolls through the viewport */
  var tl = d.querySelector('[data-timeline]');
  if (tl && !reduce) {
    var line = tl.querySelector('.timeline__line');
    function draw() {
      var r = tl.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.1);
      p = Math.max(0, Math.min(1, p));
      if (line) line.style.setProperty('--draw', p.toFixed(3));
    }
    window.addEventListener('scroll', draw, { passive: true });
    window.addEventListener('resize', draw);
    draw();
  } else if (tl) {
    var l2 = tl.querySelector('.timeline__line'); if (l2) l2.style.setProperty('--draw', '1');
  }

  /* Accordion with height animation (grid-template-rows) */
  var acc = d.querySelector('[data-accordion]');
  if (acc) {
    var btns = acc.querySelectorAll('.acc__btn');
    function setOpen(btn, open) {
      var panel = d.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (panel) panel.classList.toggle('is-open', open);
    }
    btns.forEach(function (b) {
      setOpen(b, b.getAttribute('aria-expanded') === 'true');
      b.addEventListener('click', function () {
        var isOpen = b.getAttribute('aria-expanded') === 'true';
        btns.forEach(function (x) { if (x !== b) setOpen(x, false); });
        setOpen(b, !isOpen);
      });
    });
  }

  /* Form validation with inline messages */
  d.querySelectorAll('form[data-validate]').forEach(function (form) {
    function check(field) {
      var wrap = field.closest('.field');
      if (!wrap) return true;
      var ok = field.checkValidity();
      if (field.name === 'phone' && field.value && !/^[+\d][\d\s()-]{6,}$/.test(field.value)) ok = false;
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }
    form.querySelectorAll('input, select, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.closest('.field.is-invalid')) check(f); });
      f.addEventListener('change', function () { if (f.closest('.field.is-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var allOk = true, firstBad = null;
      form.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(function (f) {
        if (f.name === 'bot-field') return;
        if (!check(f)) { allOk = false; if (!firstBad) firstBad = f; }
      });
      if (!allOk) { e.preventDefault(); if (firstBad) firstBad.focus(); }
    });
  });

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (a.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
      var id = a.getAttribute('href').slice(1);
      if (!id) { e.preventDefault(); return; }
      var t = d.getElementById(id);
      if (!t) return;
      e.preventDefault();
      var y = t.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      t.setAttribute('tabindex', '-1');
      t.focus({ preventScroll: true });
    });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();

/* == polish 2 Nov == */
/* Polish pass: scroll progress, clip-path reveals, tilt, magnetic pull, spotlight, section index.
   Everything here is decoration: with reduced motion (or no JS) none of it runs and the page stays as built. */
(function () {
  'use strict';
  var C = {"progress": true, "clip": [[".card__img", "down", 90], [".about__media img", "down"], [".swap", "down"]], "magnet": [".btn--lift"]};
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
