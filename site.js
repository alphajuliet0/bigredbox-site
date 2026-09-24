(function(){
  var root=document.documentElement;
  var tb=document.getElementById('theme-toggle');
  if(tb)tb.addEventListener('click',function(){
    var next=root.getAttribute('data-theme')==='light'?'dark':'light';
    root.setAttribute('data-theme',next);
    try{localStorage.setItem('brb-theme',next);}catch(e){}
  });
  var mb=document.getElementById('menu-btn'),sheet=document.getElementById('sheet');
  if(mb&&sheet)mb.addEventListener('click',function(){
    var open=sheet.classList.toggle('open');
    document.body.classList.toggle('menu-open',open);
    mb.setAttribute('aria-expanded',open?'true':'false');
  });
  var h=document.querySelector('.header');
  function onScroll(){if(h)h.classList.toggle('scrolled',window.scrollY>8);}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  var els=document.querySelectorAll('.rv');
  if('IntersectionObserver' in window){
    root.classList.add('js-rv');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px'});
    els.forEach(function(el){io.observe(el);});
  }else{els.forEach(function(el){el.classList.add('in');});}
  // services mega menu
  var mmb=document.getElementById('mm-btn'),mm=document.getElementById('mm'),mmw=mmb&&mmb.parentNode,mmT;
  function mmSet(o){if(!mm)return;mm.classList.toggle('open',o);mmb.setAttribute('aria-expanded',o?'true':'false');}
  if(mmb&&mm){
    mmb.addEventListener('click',function(e){e.stopPropagation();mmSet(!mm.classList.contains('open'));});
    if(window.matchMedia('(hover:hover)').matches){
      mmw.addEventListener('mouseenter',function(){clearTimeout(mmT);mmSet(true);});
      mmw.addEventListener('mouseleave',function(){mmT=setTimeout(function(){mmSet(false);},160);});
    }
    document.addEventListener('click',function(e){if(!mmw.contains(e.target))mmSet(false);});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&mm.classList.contains('open')){mmSet(false);mmb.focus();}});
    mm.addEventListener('focusout',function(e){if(!mmw.contains(e.relatedTarget))mmSet(false);});
  }
  // enquiry form: live only on bigredbox.co.uk (posts to our own hosting)
  var f=document.getElementById('enquiry');
  if(f){
    var live=/(^|\.)bigredbox\.co\.uk$/i.test(location.hostname);
    var st=document.getElementById('form-status'),ts=document.getElementById('ts');
    if(ts)ts.value=String(Date.now());
    if(!live){var n=document.createElement('p');n.className='staging-note';n.textContent='Preview: this form goes live on bigredbox.co.uk. Until then, email hello@bigredbox.co.uk.';f.insertBefore(n,f.firstChild);}
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=null;
      ['fullname','email','message'].forEach(function(k){var el=f.elements[k];var ok=el.value.trim()!==''&&(k!=='email'||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()));el.setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!bad)bad=el;});
      if(bad){st.className='form-status err';st.textContent='Please add your name, a valid email and a short message.';bad.focus();return;}
      if(!live){st.className='form-status';st.textContent='This is the preview site, so nothing was sent. On bigredbox.co.uk this goes straight to our inbox.';return;}
      var btn=f.querySelector('button[type=submit]');btn.disabled=true;st.className='form-status';st.textContent='Sending…';
      fetch(f.getAttribute('action'),{method:'POST',body:new FormData(f),headers:{'Accept':'application/json'},credentials:'same-origin'})
        .then(function(r){return r.json().catch(function(){return {ok:false};}).then(function(j){if(!r.ok||!j.ok)throw 0;});})
        .then(function(){f.reset();st.className='form-status ok';st.textContent='Thank you. We’ll be in touch within one working day.';})
        .catch(function(){st.className='form-status err';st.textContent='Something went wrong. Please email hello@bigredbox.co.uk instead.';})
        .then(function(){btn.disabled=false;});
    });
  }
})();
