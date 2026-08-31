// Riftbound Arena input controller
// Keyboard and joystick handling live here so controls can later be assigned per-player.
window.RB_INPUT = (() => {

  function create({joystick,stick,onCheat}){
    const keys={};
    const joy={x:0,y:0,active:false};
    let joyId=null;
    let cheatBuffer='';

    function keyDown(e){
      keys[e.key]=true;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault();
    }

    function keyUp(e){
      keys[e.key]=false;
    }

    function cheatKeyDown(e){
      const active=document.activeElement;
      if(active&&(active.tagName==='INPUT'||active.tagName==='TEXTAREA'||active.isContentEditable))return;

      if(/^[a-zA-Z]$/.test(e.key)){
        cheatBuffer=(cheatBuffer+e.key.toLowerCase()).slice(-16);

        if(cheatBuffer.endsWith('heal')){
          cheatBuffer='';
          if(onCheat)onCheat('heal');
        }else if(cheatBuffer.endsWith('damage')){
          cheatBuffer='';
          if(onCheat)onCheat('damage');
        }
      }
    }

    function joyMove(clientX,clientY){
      const r=joystick.getBoundingClientRect();
      const cx=r.left+r.width/2;
      const cy=r.top+r.height/2;
      let dx=clientX-cx;
      let dy=clientY-cy;
      const d=Math.hypot(dx,dy);
      const max=38;

      if(d>max){
        dx=dx/d*max;
        dy=dy/d*max;
      }

      stick.style.transform=`translate(${dx}px,${dy}px)`;
      joy.x=dx/max;
      joy.y=dy/max;
      joy.active=true;
    }

    function joyEnd(){
      joyId=null;
      joy.x=0;
      joy.y=0;
      joy.active=false;
      stick.style.transform='translate(0,0)';
    }

    function pointerDown(e){
      joyId=e.pointerId;
      joystick.setPointerCapture(e.pointerId);
      joyMove(e.clientX,e.clientY);
    }

    function pointerMove(e){
      if(e.pointerId===joyId)joyMove(e.clientX,e.clientY);
    }

    addEventListener('keydown',cheatKeyDown);
    addEventListener('keydown',keyDown);
    addEventListener('keyup',keyUp);

    joystick.addEventListener('pointerdown',pointerDown);
    joystick.addEventListener('pointermove',pointerMove);
    joystick.addEventListener('pointerup',joyEnd);
    joystick.addEventListener('pointercancel',joyEnd);

    function getVector(){
      let dx=0,dy=0;
      if(keys.ArrowLeft||keys.a)dx-=1;
      if(keys.ArrowRight||keys.d)dx+=1;
      if(keys.ArrowUp||keys.w)dy-=1;
      if(keys.ArrowDown||keys.s)dy+=1;

      if(joy.active){
        dx=joy.x;
        dy=joy.y;
      }

      return {dx,dy};
    }

    return {
      keys,
      joy,
      getVector
    };
  }

  return {create};
})();
