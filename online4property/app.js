/* Prospect homepage core: header, menu, anchors, reveals, count-up, process line, form, year. */
(function () {
  var doc = document.documentElement;
  doc.classList.remove('no-js');
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) doc.classList.add('reduce');

  /* Header shrink */
  var header = document.querySelector('.site-header');
  var onScroll = function () {
    if (header) header.classList.toggle('is-small', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  function closeMenu() {
    if (!menu) return;
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* Smooth anchors with header offset */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      var off = header ? header.offsetHeight : 0;
      var y = t.getBoundingClientRect().top + window.scrollY - off + 1;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* Reveals: anything already in view shows at once, the rest on scroll */
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  function show(el) { el.classList.add('is-in'); }
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) show(el); else io.observe(el);
    });
  }

  /* Count-up for sourced quantities only */
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  function runCount(el) {
    var end = parseFloat(el.getAttribute('data-count'));
    var dec = (el.getAttribute('data-count').split('.')[1] || '').length;
    if (reduce) { el.textContent = end.toFixed(dec); return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length) {
    if (!('IntersectionObserver' in window)) counters.forEach(runCount);
    else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) { runCount(en.target); cio.unobserve(en.target); } });
      }, { threshold: 0.4 });
      counters.forEach(function (c) { cio.observe(c); });
    }
  }

  /* Process line draws with scroll */
  var proc = document.querySelector('[data-progress]');
  if (proc) {
    var line = proc.querySelector('.progress-fill');
    var steps = [].slice.call(proc.querySelectorAll('.step'));
    var tick = function () {
      var r = proc.getBoundingClientRect();
      var vh = window.innerHeight;
      var horiz = proc.getAttribute('data-progress') === 'x' && window.innerWidth > 860;
      var p = reduce ? 1 : horiz ? Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.45))) : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / (r.height)));
      if (line) line.style.transform = (horiz ? 'scaleX(' : 'scaleY(') + p + ')';
      steps.forEach(function (s, i) {
        s.classList.toggle('is-on', reduce || p >= (i + 0.3) / steps.length);
      });
    };
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);
    tick();
  }

  /* Form validation */
  var form = document.querySelector('form[data-netlify]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 || 'Please add your name.'; },
      phone: function (v) { return /^[+\d][\d\s()-]{6,}$/.test(v.trim()) || 'Please add a phone number we can call.'; },
      email: function (v) { return v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'This email does not look right.'; },
      message: function (v) { return v.trim().length >= 5 || 'A few words about the job, please.'; }
    };
    function check(field) {
      var fn = rules[field.name];
      if (!fn) return true;
      var res = fn(field.value);
      var box = field.closest('.field');
      var msg = box ? box.querySelector('.err') : null;
      if (res === true) {
        field.removeAttribute('aria-invalid');
        if (box) box.classList.remove('has-error');
        if (msg) msg.textContent = '';
        return true;
      }
      field.setAttribute('aria-invalid', 'true');
      if (box) box.classList.add('has-error');
      if (msg) msg.textContent = res;
      return false;
    }
    form.querySelectorAll('input, textarea').forEach(function (f) {
      f.addEventListener('blur', function () { check(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) check(f); });
    });
    form.addEventListener('submit', function (e) {
      var ok = true, first = null;
      form.querySelectorAll('input, textarea').forEach(function (f) {
        if (!check(f)) { ok = false; if (!first) first = f; }
      });
      if (!ok) { e.preventDefault(); first.focus(); }
    });
  }

  /* Footer year */
  document.querySelectorAll('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
})();

/* Shared extras: load flag, accordion, spotlight, magnetic buttons */
(function () {
  var root = document.documentElement;
  var reduce = root.classList.contains('reduce');
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); });

  document.querySelectorAll('.acc-head').forEach(function (h) {
    h.addEventListener('click', function () {
      var item = h.parentElement;
      var open = !item.classList.contains('is-open');
      item.parentElement.querySelectorAll('.acc-item').forEach(function (it) {
        it.classList.remove('is-open');
        it.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
      });
      if (open) { item.classList.add('is-open'); h.setAttribute('aria-expanded', 'true'); }
    });
  });

  document.querySelectorAll('[data-spot]').forEach(function (g) {
    if (reduce) return;
    g.addEventListener('pointermove', function (e) {
      var r = g.getBoundingClientRect();
      g.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      g.style.setProperty('--my', (e.clientY - r.top) + 'px');
      g.classList.add('is-hover');
    });
    g.addEventListener('pointerleave', function () { g.classList.remove('is-hover'); });
  });

  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.22;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }
})();

/* online4property: listing filter chips, card photo carousels */
(function () {
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.l-card');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-filter');
      chips.forEach(function (x) { var on = x === c; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
      cards.forEach(function (card) {
        var types = card.getAttribute('data-type').split(' ');
        var show = f === 'all' || types.indexOf(f) > -1;
        card.classList.toggle('is-out', !show);
        card.classList.remove('is-pop');
        if (show) { void card.offsetWidth; card.classList.add('is-pop'); card.classList.add('is-in'); }
      });
    });
  });

  document.querySelectorAll('[data-carousel]').forEach(function (car) {
    var track = car.querySelector('.c-track');
    var dots = car.querySelectorAll('.c-dots i');
    var n = track.children.length, i = 0;
    function go(k) {
      i = (k + n) % n;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      dots.forEach(function (d, j) { d.classList.toggle('is-on', j === i); });
    }
    car.querySelector('.c-prev').addEventListener('click', function () { go(i - 1); });
    car.querySelector('.c-next').addEventListener('click', function () { go(i + 1); });
    var x0 = null;
    car.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  });
})();
