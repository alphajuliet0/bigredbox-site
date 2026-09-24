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
  // enquiry form: live only on bigredbox.co.uk. Posts JSON to the site's existing /contact.php (same route and recipient as the previous site).
  var live=/(^|\.)bigredbox\.co\.uk$/i.test(location.hostname);
  var f=document.getElementById('enquiry');
  if(f){
    var st=document.getElementById('form-status');
    if(!live){var n=document.createElement('p');n.className='staging-note';n.textContent='Preview: this form goes live on bigredbox.co.uk. Until then, email hello@bigredbox.co.uk.';f.insertBefore(n,f.firstChild);}
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=null;
      ['first_name','last_name','email','message'].forEach(function(k){var el=f.elements[k];var v=el.value.trim();var ok=v!==''&&(k!=='email'||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))&&(k!=='message'||v.length>=3);el.setAttribute('aria-invalid',ok?'false':'true');if(!ok&&!bad)bad=el;});
      if(bad){st.className='form-status err';st.textContent='Please add your name, a valid email and a short message.';bad.focus();return;}
      if(!live){st.className='form-status';st.textContent='This is the preview site, so nothing was sent. On bigredbox.co.uk this goes straight to our inbox.';return;}
      var data={};new FormData(f).forEach(function(v,k){data[k]=String(v).trim();});
      var btn=f.querySelector('button[type=submit]');btn.disabled=true;st.className='form-status';st.textContent='Sending…';
      fetch('/contact.php',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data),credentials:'same-origin'})
        .then(function(r){return r.json().catch(function(){return {ok:false};}).then(function(j){if(!r.ok||!j.ok)throw new Error(j.msg||'');});})
        .then(function(){f.reset();st.className='form-status ok';st.textContent='Thank you. Your enquiry has been sent to bigredbox.';})
        .catch(function(err){st.className='form-status err';st.textContent=((err&&err.message)?err.message+' ':'Something went wrong. ')+'You can also email hello@bigredbox.co.uk.';})
        .then(function(){btn.disabled=false;});
    });
  }
  // insights: on bigredbox.co.uk, add posts published on the blog engine since this build (read from the site's existing /insights-feed.php)
  var cards=document.querySelector('.cards[data-feed]');
  if(live&&cards){
    var known={};[].forEach.call(document.querySelectorAll('a[data-slug]'),function(a){known[a.getAttribute('data-slug')]=1;});
    fetch('/insights-feed.php?page=1',{headers:{'Accept':'application/json'},credentials:'same-origin'})
      .then(function(r){if(!r.ok)throw 0;return r.json();})
      .then(function(d){
        if(!d||!Array.isArray(d.posts))return;
        var fresh=d.posts.filter(function(p){var s=String(p.url||'').replace(/\/+$/,'').split('/').pop();return p.title&&p.url&&/^https:\/\/(blog\.)?bigredbox\.co\.uk\//.test(p.url)&&!known[s];});
        if(!fresh.length)return;
        var t=function(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
        var els=fresh.map(function(p){
          var a=t('a','card');a.href=p.url;
          if(p.image&&/^\/[^\/]/.test(p.image)){var w=t('div','img'),im=document.createElement('img');im.src=p.image;im.alt='';im.loading='lazy';im.width=1200;im.height=675;w.appendChild(im);a.appendChild(w);}
          var m=t('div','meta');m.appendChild(t('span','t',p.category||'Insight'));m.appendChild(t('span','',p.date||''));a.appendChild(m);
          a.appendChild(t('h3','',p.title));if(p.excerpt)a.appendChild(t('p','',p.excerpt));return a;});
        var max=parseInt(cards.getAttribute('data-feed'),10)||0;
        els.reverse().forEach(function(el){cards.insertBefore(el,cards.firstChild);});
        if(max)while(cards.children.length>max)cards.removeChild(cards.lastChild);
        var lt=document.querySelector('.feature .t');if(lt)lt.textContent=lt.textContent.replace(/^Latest · /,'');
      }).catch(function(){});
  }
})();
