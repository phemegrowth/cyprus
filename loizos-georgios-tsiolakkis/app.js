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
      var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.7 - r.top) / (r.height)));
      if (line) line.style.transform = 'scaleY(' + p + ')';
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

/* Tsiolakkis: hero entrance, accordion, drag strip, magnetic buttons */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('is-loaded'); }); });

  document.querySelectorAll('.acc-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.acc-item');
      var open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', String(open));
    });
  });

  var strip = document.querySelector('.strip');
  if (strip) {
    var down = false, sx = 0, sl = 0, moved = 0;
    strip.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;
      down = true; moved = 0; sx = e.clientX; sl = strip.scrollLeft;
      strip.classList.add('is-dragging');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx; moved = Math.abs(dx);
      strip.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () { down = false; strip.classList.remove('is-dragging'); });
    strip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') strip.scrollBy({ left: 300, behavior: reduce ? 'auto' : 'smooth' });
      if (e.key === 'ArrowLeft') strip.scrollBy({ left: -300, behavior: reduce ? 'auto' : 'smooth' });
    });
  }

  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.hero .btn, .contact .btn').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }
})();
