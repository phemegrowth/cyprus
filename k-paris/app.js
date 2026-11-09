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

  /* count-up of years since 2006 */
  var cnt=document.querySelector('[data-count]');
  if(cnt){ var target=new Date().getFullYear()-2006; cnt.textContent=target;
    if(!reduce && 'IntersectionObserver' in window){ cnt.textContent='0';
      var io4=new IntersectionObserver(function(e){ if(e[0].isIntersecting){ io4.disconnect(); var t0=performance.now();
        var step=function(t){ var k=Math.min(1,(t-t0)/1400); k=1-Math.pow(1-k,3); cnt.textContent=Math.round(target*k); if(k<1) requestAnimationFrame(step); };
        requestAnimationFrame(step); } }, {threshold:.5});
      io4.observe(cnt); } }

  /* housekeeping timeline: line draws with the scroll, dots light up */
  var tl=document.querySelector('.timeline'), tli=[].slice.call(document.querySelectorAll('.timeline li'));
  if(tl){
    if(reduce){ tli.forEach(function(l){ l.classList.add('lit'); }); }
    else { var td=function(){ var r=tl.getBoundingClientRect(), vh=window.innerHeight; var p=Math.max(0,Math.min(1,(vh*0.6-r.top)/r.height));
      tl.style.setProperty('--p',p.toFixed(3)); tli.forEach(function(l){ l.classList.toggle('lit', l.getBoundingClientRect().top<vh*0.6); }); };
      window.addEventListener('scroll', td, {passive:true}); td(); }
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
    var msgs={name:'Please write your name.',phone:'Please add a phone number.',email:'Please write a valid email.',property:'Please choose the property type.',message:'Please tell us a little about the property.'};
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
