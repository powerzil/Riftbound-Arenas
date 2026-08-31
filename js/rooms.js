// Riftbound Arena rooms / contracts / hazards
window.RB_ROOMS = (() => {
  const CONTRACTS=[
    {name:'Normal Room',risk:'Standard enemies.',reward:'1.00× rewards',id:'normal',mult:1},
    {name:'Blood Contract',risk:'Enemies move +35% faster.',reward:'1.65× rewards',id:'blood',mult:1.65},
    {name:'Glass Contract',risk:'You take 2× damage.',reward:'2.00× rewards',id:'glass',mult:2},
    {name:'Swarm Contract',risk:'Enemy count +70%.',reward:'1.80× rewards',id:'swarm',mult:1.8},
    {name:'No-Heal Contract',risk:'No healing after this room.',reward:'2.15× rewards',id:'noheal',mult:2.15}
  ];

  const ELITE_MODIFIERS=[
    {id:'giant',name:'Giant',desc:'Huge and far tankier.',color:'#ffd166'},
    {id:'frenzied',name:'Frenzied',desc:'Much faster and attacks quicker.',color:'#ff6767'},
    {id:'vampiric',name:'Vampiric',desc:'Heals itself when it hits you.',color:'#c23b8a'},
    {id:'explosive',name:'Explosive',desc:'Explodes violently on death.',color:'#ff8a5b'},
    {id:'armored',name:'Armored',desc:'Takes reduced damage.',color:'#9fb0c7'}
  ];

  const PATH_OPTIONS=[
    {kind:null,name:'Normal Door',desc:'A standard room.'},
    {kind:'elite',name:'Elite Door',desc:'Tougher, modified enemies. +60% room rewards.'},
    {kind:'treasure',name:'Treasure Door',desc:'No combat — grab a chest and a bonus potion.'}
  ];

  function createHazards(theme,W,H,count=2){
    const hazards=[];
    for(let i=0;i<count;i++){
      const x=90+Math.random()*(W-180);
      const y=140+Math.random()*(H*.42);

      if(theme==='ember'){
        hazards.push({type:'lava',x,y,r:30,state:'idle',timer:1.2+Math.random()});
      }else if(theme==='verdant'){
        hazards.push({type:'spore',x,y,r:34,vx:(Math.random()-.5)*20,vy:(Math.random()-.5)*14,tick:0});
      }else if(theme==='astral'){
        hazards.push({type:'gravity',x,y,r:60,tick:0});
      }else{
        hazards.push({type:'spike',x,y,r:22,state:'idle',timer:1+Math.random()});
      }
    }
    return hazards;
  }

  function updateHazards(hazards,hero,dt,{W,H,damageHero}){
    for(const hz of hazards){
      if(hz.type==='spike'||hz.type==='lava'){
        hz.timer-=dt;

        if(hz.state==='idle'&&hz.timer<=0){
          hz.state='telegraph';
          hz.timer=.7;
        }else if(hz.state==='telegraph'&&hz.timer<=0){
          hz.state='active';
          hz.timer=.35;
        }else if(hz.state==='active'&&hz.timer<=0){
          hz.state='idle';
          hz.timer=1.6+Math.random()*1.2;
        }

        if(hz.state==='active'){
          const d=Math.hypot(hero.x-hz.x,hero.y-hz.y);
          if(d<hz.r){
            hz.dmgTick=(hz.dmgTick===undefined?0:hz.dmgTick)-dt;
            if(hz.dmgTick<=0){
              damageHero(hz.type==='spike'?14:18,'hazard');
              hz.dmgTick=.45;
            }
          }
        }
      }else if(hz.type==='spore'){
        hz.x+=hz.vx*dt;
        hz.y+=hz.vy*dt;
        if(hz.x<60||hz.x>W-60)hz.vx*=-1;
        if(hz.y<100||hz.y>H*.65)hz.vy*=-1;

        const d=Math.hypot(hero.x-hz.x,hero.y-hz.y);
        if(d<hz.r){
          hz.tick=(hz.tick||0)-dt;
          if(hz.tick<=0){
            damageHero(5,'hazard');
            hz.tick=.6;
          }
        }else hz.tick=0;
      }else if(hz.type==='gravity'){
        const d=Math.hypot(hero.x-hz.x,hero.y-hz.y);
        if(d<hz.r&&d>4){
          const pull=40*dt*(1-d/hz.r);
          hero.x+=(hz.x-hero.x)/d*pull;
          hero.y+=(hz.y-hero.y)/d*pull;
          hz.tick=(hz.tick||0)-dt;
          if(hz.tick<=0){
            damageHero(4,'hazard');
            hz.tick=.7;
          }
        }else hz.tick=0;
      }
    }
  }

  function drawHazards(ctx,hazards,now){
    for(const hz of hazards){
      ctx.save();

      if(hz.type==='spike'){
        const alpha=hz.state==='telegraph'?.5+.3*Math.sin(now*.02):hz.state==='active'?.9:.25;
        ctx.strokeStyle=`rgba(255,90,90,${alpha})`;
        ctx.fillStyle=`rgba(120,20,20,${hz.state==='active'?.35:.1})`;
        ctx.lineWidth=2;
        ctx.beginPath();
        ctx.arc(hz.x,hz.y,hz.r,0,Math.PI*2);
        ctx.fill();
        ctx.stroke();

        if(hz.state==='active'){
          ctx.fillStyle='#dfe7f2';
          for(let k=0;k<5;k++){
            const ang=k/5*Math.PI*2;
            ctx.beginPath();
            ctx.moveTo(hz.x+Math.cos(ang)*4,hz.y+Math.sin(ang)*4);
            ctx.lineTo(hz.x+Math.cos(ang)*hz.r*.8,hz.y+Math.sin(ang)*hz.r*.8);
            ctx.lineTo(hz.x+Math.cos(ang+.15)*hz.r*.5,hz.y+Math.sin(ang+.15)*hz.r*.5);
            ctx.closePath();
            ctx.fill();
          }
        }
      }else if(hz.type==='lava'){
        const alpha=hz.state==='telegraph'?.4+.3*Math.sin(now*.02):hz.state==='active'?.85:.2;
        const g=ctx.createRadialGradient(hz.x,hz.y,2,hz.x,hz.y,hz.r);
        g.addColorStop(0,`rgba(255,150,40,${alpha})`);
        g.addColorStop(1,`rgba(120,20,5,${alpha*.3})`);
        ctx.fillStyle=g;
        ctx.beginPath();
        ctx.arc(hz.x,hz.y,hz.r,0,Math.PI*2);
        ctx.fill();
      }else if(hz.type==='spore'){
        ctx.fillStyle='rgba(140,220,110,.22)';
        ctx.beginPath();
        ctx.arc(hz.x,hz.y,hz.r,0,Math.PI*2);
        ctx.fill();
        ctx.strokeStyle='rgba(180,255,150,.35)';
        ctx.lineWidth=1.5;
        ctx.beginPath();
        ctx.arc(hz.x,hz.y,hz.r,0,Math.PI*2);
        ctx.stroke();
      }else if(hz.type==='gravity'){
        ctx.strokeStyle='rgba(180,150,255,.4)';
        ctx.lineWidth=1.4;
        for(let ring=0;ring<3;ring++){
          ctx.globalAlpha=.5-ring*.14;
          ctx.beginPath();
          ctx.arc(
            hz.x,hz.y,
            Math.max(2,hz.r*(.4+ring*.3)-((now*.02+ring*20)%(hz.r*.3))),
            0,Math.PI*2
          );
          ctx.stroke();
        }
        ctx.globalAlpha=1;
      }

      ctx.restore();
    }
  }

  return {
    CONTRACTS,
    ELITE_MODIFIERS,
    PATH_OPTIONS,
    createHazards,
    updateHazards,
    drawHazards
  };
})();
