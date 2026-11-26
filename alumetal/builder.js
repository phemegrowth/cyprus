/* Alumetal frame builder: pick a piece, set the sizes, see it drawn to scale, collect a list and send it.
   Needs draw.js. The list stays in this browser (localStorage) until it is cleared. */
(function () {
  'use strict';
  var d = document, A = window.AluDraw;
  var stage = d.getElementById('b-stage');
  if (!stage || !A) return;
  var S = JSON.parse(d.getElementById('strings').textContent);
  var T = A.TYPES;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }

  var st = { type: 'sliding', w: 2400, h: 2200, n: 2, rows: 3, finish: 'anthracite', glass: 'clear', qty: 1, label: '' };
  var list = [], editing = -1;
  try { list = JSON.parse(localStorage.getItem('alu-list')) || []; } catch (e) { list = []; }
  var want = (location.search.match(/[?&]type=([a-z]+)/) || [])[1];
  if (want && T[want]) st.type = want;

  function clamp(v, lim) { return Math.max(lim[0], Math.min(lim[1], v)); }
  function glassOk(type, g) {
    if (type === 'pergola') return g === 'none';
    if (g === 'none') return false;
    if (g === 'bars') return type === 'railing';
    return true;
  }
  function fit() {
    var t = T[st.type];
    st.w = clamp(st.w, t.w); st.h = clamp(st.h, t.h); st.n = clamp(st.n, t.n);
    if (t.rows) st.rows = clamp(st.rows, t.rows);
    if (!glassOk(st.type, st.glass)) st.glass = st.type === 'pergola' ? 'none' : 'clear';
    st.qty = clamp(st.qty, [1, 99]);
  }
  function setType(type) {
    var t = T[type];
    st.type = type; st.w = t.w[2]; st.h = t.h[2]; st.n = t.n[2]; if (t.rows) st.rows = t.rows[2];
    fit();
  }
  if (want && T[want]) setType(want);

  function area(it) { return it.w * it.h / 1e6 * it.qty; }
  function num(v, dp) { return v.toLocaleString(S.locale, { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  function describe(it) {
    var parts = [S.types[it.type], it.w + ' x ' + it.h + ' mm', it.n + ' ' + S.div[it.type]];
    if (it.type === 'facade') parts.push(it.rows + ' ' + S.rowsWord);
    parts.push(S.finishes[it.finish]);
    if (it.glass !== 'none') parts.push(S.glass[it.glass]);
    return parts;
  }

  var wR = d.getElementById('b-w'), wN = d.getElementById('b-w-n'), hR = d.getElementById('b-h'), hN = d.getElementById('b-h-n');
  var addBtn = d.getElementById('b-add'), labelIn = d.getElementById('b-label');

  function paint() {
    fit();
    var t = T[st.type];
    stage.innerHTML = A({ type: st.type, w: st.w, h: st.h, n: st.n, rows: st.rows, finish: st.finish, glass: st.glass, label: S.types[st.type] + ' ' + st.w + ' x ' + st.h + ' mm' });
    $$('[data-type]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-type') === st.type ? 'true' : 'false'); });
    $$('[data-finish]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-finish') === st.finish ? 'true' : 'false'); });
    $$('[data-glass]').forEach(function (b) {
      var g = b.getAttribute('data-glass');
      b.hidden = !glassOk(st.type, g);
      b.setAttribute('aria-pressed', g === st.glass ? 'true' : 'false');
    });
    $('[data-group="glass"]').hidden = st.type === 'pergola';
    $('[data-group="rows"]').hidden = st.type !== 'facade';
    $('[data-glass-title]').textContent = st.type === 'railing' ? S.infill : S.glassTitle;
    wR.min = wN.min = t.w[0]; wR.max = wN.max = t.w[1]; hR.min = hN.min = t.h[0]; hR.max = hN.max = t.h[1];
    wR.value = st.w; hR.value = st.h;
    if (d.activeElement !== wN) wN.value = st.w;
    if (d.activeElement !== hN) hN.value = st.h;
    $('[data-w-title]').textContent = st.type === 'railing' ? S.length : S.width;
    $('[data-n-title]').textContent = S.divTitle[st.type];
    $('[data-val="n"]').textContent = st.n; $('[data-val="rows"]').textContent = st.rows; $('[data-val="qty"]').textContent = st.qty;
    $('[data-m="type"]').textContent = S.types[st.type];
    $('[data-m="size"]').textContent = st.w + ' x ' + st.h + ' mm';
    var m3 = $('[data-m="third"]'), m3l = $('[data-m="third-l"]');
    if (st.type === 'railing') { m3l.textContent = S.runMetres; m3.textContent = num(st.w / 1000 * st.qty, 2) + ' m'; }
    else { m3l.textContent = S.areaWord; m3.textContent = num(area(st), 2) + ' m²'; }
    var each = st.type === 'facade' ? Math.round(st.w / st.n) + ' x ' + Math.round(st.h / st.rows) : Math.round(st.w / st.n);
    $('[data-m="each-l"]').textContent = S.eachTitle[st.type];
    $('[data-m="each"]').textContent = each + ' mm';
    addBtn.textContent = editing >= 0 ? S.update : S.add;
  }

  function save() { try { localStorage.setItem('alu-list', JSON.stringify(list)); } catch (e) {} }
  function listText() {
    if (!list.length) return '';
    var lines = [S.listHead], glazed = 0, rail = 0, pcs = 0;
    list.forEach(function (it, i) {
      lines.push((i + 1) + '. ' + (it.label ? it.label + ': ' : '') + describe(it).join(', ') + ', x' + it.qty);
      pcs += it.qty;
      if (it.type === 'railing') rail += it.w / 1000 * it.qty; else if (it.type !== 'pergola') glazed += area(it);
    });
    lines.push(S.total + ': ' + pcs + ' ' + S.pieces + (glazed ? ', ' + num(glazed, 2) + ' m²' : '') + (rail ? ', ' + num(rail, 2) + ' m ' + S.ofRailing : ''));
    return lines.join('\n');
  }
  function renderList() {
    var body = d.getElementById('b-list'), box = d.getElementById('b-sheet');
    body.innerHTML = '';
    var glazed = 0, rail = 0, pcs = 0;
    list.forEach(function (it, i) {
      var tr = d.createElement('tr');
      if (i === editing) tr.className = 'is-editing';
      var parts = describe(it);
      var cells = [
        '<td class="sheet__n">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</td>',
        '<td class="sheet__thumb">' + A({ type: it.type, w: it.w, h: it.h, n: it.n, rows: it.rows, finish: it.finish, glass: it.glass, fig: false, dims: false }) + '</td>',
        '<td><b></b><span>' + parts[0] + '</span></td>',
        '<td class="sheet__size">' + it.w + ' x ' + it.h + '<small> mm</small></td>',
        '<td>' + parts.slice(2).join('<br>') + '</td>',
        '<td class="sheet__q">x' + it.qty + '</td>',
        '<td class="sheet__act"><button type="button" data-edit="' + i + '">' + S.edit + '</button><button type="button" data-del="' + i + '">' + S.remove + '</button></td>'
      ];
      tr.innerHTML = cells.join('');
      $('b', tr).textContent = it.label || S.noLabel;
      body.appendChild(tr);
      pcs += it.qty;
      if (it.type === 'railing') rail += it.w / 1000 * it.qty; else if (it.type !== 'pergola') glazed += area(it);
    });
    box.classList.toggle('is-empty', !list.length);
    $('[data-t="pieces"]').textContent = pcs;
    $('[data-t="area"]').textContent = num(glazed, 2) + ' m²';
    $('[data-t="rail"]').textContent = num(rail, 2) + ' m';
    $('[data-t-rail]').hidden = !rail;
    var txt = listText();
    d.getElementById('b-wa').href = 'https://wa.me/35722329947?text=' + encodeURIComponent(txt);
    try { if (txt) sessionStorage.setItem('alu-list-text', txt); else sessionStorage.removeItem('alu-list-text'); } catch (e) {}
    var c = $('[data-list-count]'); if (c) c.textContent = list.length;
  }

  /* Controls */
  $$('[data-type]').forEach(function (b) { b.addEventListener('click', function () { setType(b.getAttribute('data-type')); paint(); }); });
  $$('[data-finish]').forEach(function (b) { b.addEventListener('click', function () { st.finish = b.getAttribute('data-finish'); paint(); }); });
  $$('[data-glass]').forEach(function (b) { b.addEventListener('click', function () { st.glass = b.getAttribute('data-glass'); paint(); }); });
  $$('[data-step]').forEach(function (b) {
    b.addEventListener('click', function () { var k = b.getAttribute('data-step'); st[k] += parseInt(b.getAttribute('data-d'), 10); paint(); });
  });
  wR.addEventListener('input', function () { st.w = parseInt(wR.value, 10); paint(); });
  hR.addEventListener('input', function () { st.h = parseInt(hR.value, 10); paint(); });
  [[wN, 'w'], [hN, 'h']].forEach(function (p) {
    p[0].addEventListener('input', function () { var v = parseInt(p[0].value, 10); if (v >= T[st.type][p[1]][0] && v <= T[st.type][p[1]][1]) { st[p[1]] = v; paint(); } });
    p[0].addEventListener('blur', function () { var v = parseInt(p[0].value, 10); if (!isNaN(v)) st[p[1]] = v; paint(); p[0].value = st[p[1]]; });
  });
  labelIn.addEventListener('input', function () { st.label = labelIn.value.slice(0, 40); });

  addBtn.addEventListener('click', function () {
    fit();
    var it = { type: st.type, w: st.w, h: st.h, n: st.n, rows: st.rows, finish: st.finish, glass: st.glass, qty: st.qty, label: st.label.trim() };
    if (editing >= 0) { list[editing] = it; editing = -1; } else list.push(it);
    st.label = ''; labelIn.value = ''; st.qty = 1;
    save(); paint(); renderList();
    var sheet = d.getElementById('b-sheet');
    sheet.classList.remove('is-flash'); void sheet.offsetWidth; sheet.classList.add('is-flash');
    $('[data-live]').textContent = S.added;
  });
  d.getElementById('b-list').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-del')) {
      list.splice(parseInt(b.getAttribute('data-del'), 10), 1); editing = -1;
      save(); paint(); renderList();
    } else if (b.hasAttribute('data-edit')) {
      editing = parseInt(b.getAttribute('data-edit'), 10);
      var it = list[editing];
      Object.keys(it).forEach(function (k) { st[k] = it[k]; });
      labelIn.value = st.label;
      paint(); renderList();
      d.getElementById('builder').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  d.getElementById('b-clear').addEventListener('click', function () { list = []; editing = -1; save(); paint(); renderList(); });
  d.getElementById('b-print').addEventListener('click', function () { window.print(); });

  paint(); renderList();
})();
