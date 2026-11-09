(function(){
  var root=document.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body=document.body;

  /* hero entrance: starts on the first frame, never waits for fonts or images */
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ body.classList.add('loaded'); }); });

  /* header shrink */
  var header=document.querySelector('.site-header');
  function onScroll(){ header.classList.toggle('scrolled', window.scrollY>24); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* mobile menu: closes on link click and on Escape */
  var btn=document.querySelector('.menu-btn'), nav=document.getElementById('nav');
  function setMenu(open){ root.classList.toggle('menu-open',open); btn.setAttribute('aria-expanded',open?'true':'false'); }
  btn.addEventListener('click', function(){ setMenu(!root.classList.contains('menu-open')); });
  nav.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setMenu(false); });

  /* language switch placeholder */
  document.querySelectorAll('[aria-disabled="true"]').forEach(function(a){ a.addEventListener('click', function(e){ e.preventDefault(); }); });

  /* scroll reveals with the above-the-fold guard */
  var items=[].slice.call(document.querySelectorAll('.reveal, .reveal-wrap'));
  if(reduce || !('IntersectionObserver' in window)){ items.forEach(function(el){ el.classList.add('in'); }); }
  else {
    var io=new IntersectionObserver(function(entries){ entries.forEach(function(en){ if(en.isIntersecting){ var el=en.target; setTimeout(function(){ el.classList.add('in'); }, +(el.dataset.d||0)); io.unobserve(el); } }); }, {rootMargin:'0px 0px -8% 0px'});
    var groups=new Map();
    items.forEach(function(el){ var p=el.parentElement; var i=groups.get(p)||0; el.dataset.d=Math.min(i,5)*80; groups.set(p,i+1);
      if(el.getBoundingClientRect().top<window.innerHeight) el.classList.add('in'); else io.observe(el); });
  }

  /* the name fills the width of the page exactly */
  var nm=document.querySelector('.hero-title .name'), nms=nm?nm.querySelector('span'):null;
  function fitName(){ if(!nm) return; nm.style.fontSize=''; var avail=nm.parentElement.clientWidth, w=nms.getBoundingClientRect().width; if(w>0){ var fs=parseFloat(getComputedStyle(nm).fontSize); nm.style.fontSize=Math.min(fs*avail/w*0.995, 330)+'px'; } }
  fitName(); if(document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  window.addEventListener('resize', fitName);

  /* product panels: hover, focus or tap opens one */
  var panels=[].slice.call(document.querySelectorAll('.panel'));
  function openP(p){ panels.forEach(function(x){ x.classList.toggle('open',x===p); x.setAttribute('aria-expanded',x===p?'true':'false'); }); }
  panels.forEach(function(p){ p.setAttribute('role','button'); p.setAttribute('aria-expanded',p.classList.contains('open')?'true':'false');
    p.addEventListener('click', function(){ openP(p); });
    p.addEventListener('focus', function(){ openP(p); });
    p.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openP(p); } });
    p.addEventListener('mouseenter', function(){ if(window.matchMedia('(hover:hover) and (min-width:761px)').matches) openP(p); }); });

  /* references filter: other rows dim and slide */
  var chips=[].slice.call(document.querySelectorAll('.chip')), rows=[].slice.call(document.querySelectorAll('.ref-list li'));
  chips.forEach(function(c){ c.addEventListener('click', function(){ var f=c.dataset.f;
    chips.forEach(function(x){ x.classList.toggle('on',x===c); x.setAttribute('aria-pressed',x===c?'true':'false'); });
    rows.forEach(function(r){ r.classList.toggle('dim', f!=='all' && r.dataset.c!==f); }); }); });

  /* count-up of the countries figure */
  var cnt=document.querySelector('[data-count]');
  if(cnt && !reduce && 'IntersectionObserver' in window){ var target=+cnt.dataset.count; cnt.textContent='0';
    var io4=new IntersectionObserver(function(e){ if(e[0].isIntersecting){ io4.disconnect(); var t0=performance.now();
      var step=function(t){ var k=Math.min(1,(t-t0)/1300); k=1-Math.pow(1-k,3); cnt.textContent=Math.round(target*k); if(k<1) requestAnimationFrame(step); };
      requestAnimationFrame(step); } }, {threshold:.5});
    io4.observe(cnt); }

  /* process line draws with the scroll, steps light up */
  var steps=document.querySelector('.steps'), sl=[].slice.call(document.querySelectorAll('.steps li'));
  if(steps){
    if(reduce){ sl.forEach(function(l){ l.classList.add('lit'); }); }
    else { var sd=function(){ var r=steps.getBoundingClientRect(), vh=window.innerHeight; var p=Math.max(0,Math.min(1,(vh*0.85-r.top)/(vh*0.5)));
      steps.style.setProperty('--p',p.toFixed(3)); sl.forEach(function(l,i){ l.classList.toggle('lit', window.innerWidth>1100 ? p>=i/sl.length+0.05 : l.getBoundingClientRect().top<vh*0.7); }); };
      window.addEventListener('scroll', sd, {passive:true}); sd(); }
  }

  /* magnetic buttons */
  if(!reduce && window.matchMedia('(hover:hover)').matches){
    document.querySelectorAll('.magnetic').forEach(function(b){
      b.addEventListener('mousemove', function(e){ var r=b.getBoundingClientRect(); var x=(e.clientX-r.left-r.width/2)*.18, y=(e.clientY-r.top-r.height/2)*.28; b.style.transform='translate('+x+'px,'+y+'px)'; });
      b.addEventListener('mouseleave', function(){ b.style.transform=''; });
    });
  }

  /* form validation with inline messages */
  var form=document.querySelector('form.form');
  if(form){
    var msgs={name:'Please write your name and company.',phone:'Please add a phone number.',email:'Please write a valid email.',project:'Please choose a project type.',message:'Please tell us about the project.'};
    var check=function(f){ var ok=true, v=(f.value||'').trim();
      if(f.required && !v) ok=false;
      if(ok && f.type==='email') ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if(ok && f.type==='tel') ok=v.replace(/\D/g,'').length>=8;
      var wrap=f.closest('.field'); if(wrap){ wrap.classList.toggle('bad',!ok); wrap.querySelector('.err').textContent=ok?'':(msgs[f.name]||'Please fill in this field.'); }
      return ok; };
    var fields=[].slice.call(form.querySelectorAll('[required]'));
    fields.forEach(function(f){ f.addEventListener('blur', function(){ check(f); }); });
    form.addEventListener('submit', function(e){ var bad=fields.filter(function(f){ return !check(f); }); if(bad.length){ e.preventDefault(); bad[0].focus(); } });
  }

  var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
})();
