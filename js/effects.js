// Riftbound Arena visual effects helpers
// Loaded before game.js.
window.RB_EFFECTS = {
  create({wrap, flashLayer}){
    const state = { shake: 0 };

    state.addShake = function(n){
      state.shake=Math.min(20,state.shake+n);
    };

    state.flashDamage = function(){
      flashLayer.style.background='radial-gradient(circle,transparent 40%,rgba(255,60,60,.5) 100%)';
      flashLayer.style.opacity='1';
      clearTimeout(state.flashDamage.t);
      state.flashDamage.t=setTimeout(()=>flashLayer.style.opacity='0',130);
    };

    state.floatText = function(x,y,text,color){
      const el=document.createElement('div');
      el.className='floatText';
      el.style.left=x+'px';
      el.style.top=y+'px';
      el.style.color=color||'#fff';
      el.style.fontSize='14px';
      el.textContent=text;
      wrap.appendChild(el);
      let t=0;
      function step(){
        t+=16;
        el.style.top=(y-t*0.045)+'px';
        el.style.opacity=Math.max(0,1-t/650);
        if(t<650)requestAnimationFrame(step);
        else el.remove();
      }
      requestAnimationFrame(step);
    };

    return state;
  }
};
