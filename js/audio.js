// Riftbound Arena audio system
// Loaded before game.js
window.RB_AUDIO = (()=>{
 let ctxA=null,enabled=true;
 function ac(){if(!ctxA)ctxA=new (window.AudioContext||window.webkitAudioContext)();if(ctxA.state==='suspended')ctxA.resume();return ctxA}
 function tone(freq,dur,type='sine',vol=.18,slide=0){
   if(!enabled)return;
   try{
     const c=ac(),o=c.createOscillator(),g=c.createGain();
     o.type=type;o.frequency.setValueAtTime(freq,c.currentTime);
     if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),c.currentTime+dur);
     g.gain.setValueAtTime(vol,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);
     o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+dur)
   }catch(e){}
 }
 function noise(dur,vol=.15){
   if(!enabled)return;
   try{
     const c=ac(),bufferSize=Math.floor(c.sampleRate*dur),buffer=c.createBuffer(1,bufferSize,c.sampleRate),data=buffer.getChannelData(0);
     for(let i=0;i<bufferSize;i++)data[i]=(Math.random()*2-1)*(1-i/bufferSize);
     const src=c.createBufferSource();src.buffer=buffer;
     const g=c.createGain();g.gain.value=vol;
     src.connect(g);g.connect(c.destination);src.start()
   }catch(e){}
 }
 return {
  unlock(){ac()},
  setEnabled(v){enabled=v},
  isEnabled(){return enabled},
  shoot(){tone(520,.05,'square',.045)},
  hit(){tone(220,.05,'square',.06)},
  crit(){tone(760,.09,'square',.09,220)},
  kill(){tone(340,.11,'sawtooth',.09,-140)},
  bosskill(){tone(180,.4,'sawtooth',.16,-90);setTimeout(()=>tone(260,.3,'square',.12),120)},
  hurt(){noise(.12,.16)},
  levelup(){tone(440,.09,'sine',.12);setTimeout(()=>tone(660,.14,'sine',.12),90)},
  clear(){tone(520,.1,'sine',.1);setTimeout(()=>tone(780,.18,'sine',.1),100)},
  gate(){tone(300,.08,'sine',.08)},
  poison(){tone(140,.09,'sawtooth',.05)},
  explosion(){noise(.25,.22);tone(90,.25,'sawtooth',.14,-40)},
  bowDraw(){tone(180,.08,'triangle',.05,40)},
  bowRelease(){tone(620,.06,'triangle',.07,180);noise(.03,.03)},
  bladeSwing(){tone(300,.045,'sawtooth',.06,-90)},
  staffCharge(){tone(260,.14,'sine',.05,120)},
  staffRelease(){tone(700,.09,'sine',.09,-160)},
  blasterShot(){tone(180,.035,'square',.06);noise(.02,.03)},
  overheat(){tone(120,.16,'sawtooth',.09,-30)},
  necroCast(){tone(150,.13,'sawtooth',.06,-40)}
 }
})();
