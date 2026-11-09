/* GIO Properties & Valuers: hero entrance, header, menu, reveals, accordion with image swap,
   drag strip, valuation progress line, form validation. No dependencies. */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance: start on the first animation frame, never wait for fonts or images */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
  });

  /* Footer year */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Header shrink */
  var header = d.querySelector('.header');
  function onScrollHeader() { if (header) header.classList.toggle('is-small', window.scrollY > 40); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobile menu */
  var burger = d.querySelector('.burger');
  var menu = d.getElementById('menu');
  function setMenu(open, keepFocus) {
    if (!burger || !menu) return;
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = menu.querySelector('a'); if (first) first.focus(); }
    else if (!keepFocus) { burger.focus(); }
  }
  if (burger && menu) {
    burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false, true); }); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false); });
  }

  /* Smooth anchor scroll with header offset */
  d.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = d.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var off = header ? header.getBoundingClientRect().height + 8 : 0;
      var y = target.getBoundingClientRect().top + window.scrollY - off;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* Scroll reveals, with stagger inside each parent and an above-the-fold guard */
  var items = d.querySelectorAll('.r');
  var groups = new Map();
  items.forEach(function (el) {
    var p = el.parentElement;
    var i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i, 6) * 0.08 + 's');
    groups.set(p, i + 1);
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-in');
      else io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Accordion with height animation, and the image that swaps with it */
  var acc = d.querySelector('[data-acc]');
  var swaps = d.querySelectorAll('[data-swap]');
  var swapLabel = d.querySelector('[data-swap-label]');
  var labels = ['Valuations', 'Selling', 'Buying'];
  function showImage(i) {
    swaps.forEach(function (img) { img.classList.toggle('is-on', img.getAttribute('data-swap') === String(i)); });
    if (swapLabel) swapLabel.textContent = labels[i] || '';
  }
  if (acc) {
    var accItems = acc.querySelectorAll('.acc__item');
    function setPanel(item, open, instant) {
      var btn = item.querySelector('.acc__btn');
      var panel = item.querySelector('.acc__panel');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      item.classList.toggle('is-open', open);
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (instant || reduce) { panel.style.height = open ? 'auto' : '0px'; return; }
      var h = panel.scrollHeight;
      if (open) {
        panel.style.height = '0px';
        requestAnimationFrame(function () { panel.style.height = h + 'px'; });
        var done = function (e) {
          if (e.propertyName !== 'height') return;
          if (item.classList.contains('is-open')) panel.style.height = 'auto';
          panel.removeEventListener('transitionend', done);
        };
        panel.addEventListener('transitionend', done);
      } else {
        panel.style.height = h + 'px';
        requestAnimationFrame(function () { requestAnimationFrame(function () { panel.style.height = '0px'; }); });
      }
    }
    accItems.forEach(function (item) { setPanel(item, item.classList.contains('is-open'), true); });
    accItems.forEach(function (item) {
      var btn = item.querySelector('.acc__btn');
      var idx = Number(item.getAttribute('data-index'));
      btn.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        accItems.forEach(function (other) { if (other !== item && other.classList.contains('is-open')) setPanel(other, false); });
        setPanel(item, willOpen);
        if (willOpen) showImage(idx);
      });
      item.addEventListener('mouseenter', function () { showImage(idx); });
      btn.addEventListener('focus', function () { showImage(idx); });
    });
    acc.addEventListener('mouseleave', function () {
      var open = acc.querySelector('.acc__item.is-open');
      showImage(open ? Number(open.getAttribute('data-index')) : 0);
    });
  }

  /* Drag strip with buttons */
  var drag = d.querySelector('[data-drag]');
  if (drag) {
    var down = false, startX = 0, startLeft = 0, moved = 0;
    drag.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; startX = e.clientX; startLeft = drag.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      if (moved > 4) drag.classList.add('is-dragging');
      drag.scrollLeft = startLeft - dx;
    });
    window.addEventListener('pointerup', function () { down = false; drag.classList.remove('is-dragging'); });
    function step(dir) {
      var card = drag.querySelector('.home');
      var w = card ? card.getBoundingClientRect().width + 24 : 380;
      drag.scrollBy({ left: dir * w, behavior: reduce ? 'auto' : 'smooth' });
    }
    var prev = d.querySelector('[data-prev]');
    var next = d.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    drag.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
  }

  /* Valuation steps: the line draws as you scroll */
  var steps = d.querySelector('[data-steps]');
  var fill = steps ? steps.querySelector('.steps__fill') : null;
  if (steps && fill) {
    if (reduce) { fill.style.setProperty('--p', 1); }
    else {
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = steps.getBoundingClientRect();
        var vh = window.innerHeight;
        var p = (vh * 0.65 - r.top) / r.height;
        fill.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
      };
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* Form validation with inline messages */
  var form = d.querySelector('form[name="enquiry-gio-properties"]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please write your name.'; },
      phone: function (v) { return v.replace(/[^0-9]/g, '').length >= 8 ? '' : 'Please add a phone number we can call.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please check the email address.'; },
      need: function (v) { return v ? '' : 'Please choose what you need.'; },
      message: function (v) { return v.trim().length >= 5 ? '' : 'A few words about the property help us.'; }
    };
    function check(field) {
      var fn = rules[field.name];
      if (!fn) return true;
      var msg = fn(field.value);
      var wrap = field.closest('.field');
      var err = wrap ? wrap.querySelector('.field__err') : null;
      if (wrap) wrap.classList.toggle('has-err', !!msg);
      if (err) err.textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) field.setAttribute('aria-describedby', err.id);
      return !msg;
    }
    Object.keys(rules).forEach(function (n) {
      var f = form.elements[n];
      if (!f) return;
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.closest('.field').classList.contains('has-err')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var firstBad = null;
      Object.keys(rules).forEach(function (n) {
        var f = form.elements[n];
        if (f && !check(f) && !firstBad) firstBad = f;
      });
      if (firstBad) { e.preventDefault(); firstBad.focus(); }
    });
  }
})();

/* Polish pass (2 Nov 2026): first-impression upgrades. Transform, opacity and clip-path only.
   Reduced motion: none of this runs, everything stays as built. No JS: nothing here applies. */
(function (cfg) {
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var root = document.documentElement;
  var $$ = function (s, c) { return s ? Array.prototype.slice.call((c || document).querySelectorAll(s)) : []; };
  var inView = function (el) { var r = el.getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; };
  function watch(els, fn, margin) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { rootMargin: margin || '0px 0px -12% 0px', threshold: 0.01 });
    els.forEach(function (el) { io.observe(el); });
  }
  if (RM) return;
  root.classList.add('pz');

  /* Scroll progress line under the header */
  if (cfg.progress) {
    var bar = document.createElement('div'); bar.className = 'pz-progress'; bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var tick = false;
    var upd = function () { tick = false; var h = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0).toFixed(4) + ')'; };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* Hero image: clip-path entrance on load */
  $$(cfg.heroClip).forEach(function (el) {
    el.classList.add('pz-hero-clip');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('pz-on'); }); });
  });

  /* Image clip-path reveals on scroll */
  var clips = $$(cfg.clip).filter(function (el) { return !inView(el); });
  clips.forEach(function (el, i) { el.classList.add('pz-clip'); el.style.setProperty('--pz-d', ((i % 4) * 90) + 'ms'); });
  watch(clips, function (el) { el.classList.add('pz-on'); setTimeout(function () { el.classList.remove('pz-clip', 'pz-on'); }, 2000); });

  /* Scale-in reveals (whole blocks) */
  var scales = $$(cfg.scale).filter(function (el) { return !inView(el); });
  scales.forEach(function (el) { el.classList.add('pz-scale'); });
  watch(scales, function (el) { el.classList.add('pz-on'); setTimeout(function () { el.classList.remove('pz-scale', 'pz-on'); }, 1600); });

  /* Line that draws across a row of steps when it comes into view */
  $$(cfg.draw).forEach(function (el) {
    var line = document.createElement('span'); line.className = 'pz-draw'; line.setAttribute('aria-hidden', 'true');
    el.classList.add('pz-draw-host'); el.appendChild(line);
    watch([el], function () { el.classList.add('pz-on'); }, '0px 0px -20% 0px');
  });

  /* Count up numbers that are already on the page (final text is the original text) */
  $$(cfg.count).forEach(function (el) {
    var txt = el.textContent, m = txt.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var end = parseFloat(m[2]), dec = (m[2].split('.')[1] || '').length;
    if (end < 2 || (end > 1900 && end < 2100 && !dec)) return;  /* skip years and tiny numbers */
    var run = function () {
      var t0 = null, dur = 1300;
      var step = function (t) {
        if (!t0) t0 = t; var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = m[1] + (end * e).toFixed(dec) + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = txt;
      };
      requestAnimationFrame(step);
    };
    if (inView(el)) { run(); } else { el.textContent = m[1] + (0).toFixed(dec) + m[3]; watch([el], run); }
  });

  if (!FINE) return;

  /* Cards that tilt slightly toward the cursor */
  $$(cfg.tilt).forEach(function (el) {
    el.classList.add('pz-tilt');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = 'perspective(900px) rotateX(' + (-y * 5).toFixed(2) + 'deg) rotateY(' + (x * 6).toFixed(2) + 'deg) translateY(-4px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* Buttons that pull a little toward the cursor */
  $$(cfg.magnet).forEach(function (el) {
    el.classList.add('pz-magnet');
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = 'translate(' + (x * 0.18).toFixed(1) + 'px,' + (y * 0.28).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () { el.style.transform = ''; });
  });

  /* Soft light that follows the cursor across the work grid */
  $$(cfg.spot).forEach(function (el) {
    var s = document.createElement('span'); s.className = 'pz-spot'; s.setAttribute('aria-hidden', 'true');
    el.classList.add('pz-spot-host'); el.appendChild(s);
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      s.style.transform = 'translate(' + (e.clientX - r.left - 220) + 'px,' + (e.clientY - r.top - 220) + 'px)';
    });
    el.addEventListener('pointerenter', function () { s.style.opacity = '1'; });
    el.addEventListener('pointerleave', function () { s.style.opacity = '0'; });
  });
})({"progress": true, "clip": ".about__photo, .services__media", "tilt": ".home", "magnet": ".hero__cta .btn", "scale": ".map"});
