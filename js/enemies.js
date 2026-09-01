// Riftbound Arena enemy + boss logic
// Enemy construction and AI are isolated here so future co-op can pass
// whichever player target should be used without rewriting the entire game.
window.RB_ENEMIES = (() => {

  function createEnemy({type,x,y,kind,room,dungeon,bloodContract=false}){
    let e={type,x,y,r:16,hp:44+room*10,maxHp:44+room*10,speed:63+room*2,cd:.5+Math.random(),hurt:0};

    if(type==='shooter'){e.r=15;e.hp=e.maxHp=36+room*9;e.speed=43;e.cd=.7+Math.random()*.5}
    if(type==='splitter'){e.r=18;e.hp=e.maxHp=60+room*11;e.speed=52}
    if(type==='mini'){e.r=10;e.hp=e.maxHp=18+room*5;e.speed=98}
    if(type==='sniper'){e.r=15;e.hp=e.maxHp=32+room*8;e.speed=30;e.cd=1.5+Math.random();e.telegraph=false}
    if(type==='bomber'){e.r=17;e.hp=e.maxHp=28+room*7;e.speed=90;e.fuseCd=.6}
    if(type==='emberling'){e.r=13;e.hp=e.maxHp=30+room*8;e.speed=112;e.cd=.8}
    if(type==='charger'){e.r=19;e.hp=e.maxHp=58+room*11;e.speed=60;e.chargeCd=1.8;e.charging=false}
    if(type==='shield'){e.r=19;e.hp=e.maxHp=72+room*12;e.speed=44;e.shielded=true}
    if(type==='teleporter'){e.r=14;e.hp=e.maxHp=34+room*8;e.speed=40;e.blinkCd=1.7}
    if(type==='stalker'){e.r=15;e.hp=e.maxHp=42+room*9;e.speed=105;e.lungeCd=1.3}
    if(type==='spore'){e.r=16;e.hp=e.maxHp=40+room*9;e.speed=34;e.cd=1.4}
    if(type==='orbiter'){e.r=16;e.hp=e.maxHp=46+room*9;e.speed=50;e.orbitDir=Math.random()<.5?-1:1;e.cd=.9}
    if(type==='summoner'){e.r=16;e.hp=e.maxHp=52+room*10;e.speed=30;e.summonCd=3.5}

    if(type==='boss'){
      e.bossKind=kind||'warlock';
      if(e.bossKind==='brute'){e.r=36;e.hp=e.maxHp=560+dungeon*150+room*85;e.speed=58;e.chargeCd=2.2}
      else if(e.bossKind==='reaper'){e.r=32;e.hp=e.maxHp=450+dungeon*140+room*72;e.speed=42;e.summonCd=4}
      else if(['wyrm','basilisk'].includes(e.bossKind)){e.r=38;e.hp=e.maxHp=620+dungeon*160+room*88;e.speed=68;e.chargeCd=2;e.cd=.7}
      else if(['forge','colossus'].includes(e.bossKind)){e.r=42;e.hp=e.maxHp=760+dungeon*170+room*100;e.speed=32;e.cd=1.25}
      else if(['pyromancer','oracle','voidlord'].includes(e.bossKind)){e.r=32;e.hp=e.maxHp=540+dungeon*160+room*82;e.speed=55;e.blinkCd=1.8;e.cd=.55}
      else if(['warden','hivequeen'].includes(e.bossKind)){e.r=35;e.hp=e.maxHp=650+dungeon*150+room*90;e.speed=40;e.summonCd=3.3;e.cd=.9}
      else{e.r=34;e.hp=e.maxHp=500+dungeon*140+room*80;e.speed=48}
      e.cd=e.cd||.5;
    }

    if(bloodContract)e.speed*=1.35;
    return e;
  }

  function applyEliteModifier(e,modId){
    e.elite=modId;
    if(modId==='giant'){e.r*=1.5;e.hp=e.maxHp=Math.floor(e.hp*2.4);e.speed*=.85}
    else if(modId==='frenzied'){e.speed*=1.5;if(e.cd!==undefined)e.cd*=.6}
    else if(modId==='vampiric'){e.vampiric=true}
    else if(modId==='explosive'){e.explosive=true}
    else if(modId==='armored'){e.armor=.35}
  }

  function fireEnemy(e,{hero,room,enemyShots}){
    const a=Math.atan2(hero.y-e.y,hero.x-e.x);
    if(e.type==='boss'){
      const count=7;
      for(let i=0;i<count;i++){
        const ang=a+(i-(count-1)/2)*.19;
        enemyShots.push({
          x:e.x,y:e.y,
          vx:Math.cos(ang)*220,
          vy:Math.sin(ang)*220,
          r:7,damage:18,near:false
        });
      }
    }else{
      enemyShots.push({
        x:e.x,y:e.y,
        vx:Math.cos(a)*190,
        vy:Math.sin(a)*190,
        r:6,damage:12+room*.8,near:false
      });
    }
  }

  function updateAll({
    enemies,players,dt,room,dungeon,W,H,enemyShots,
    audio,announce,addShake,spawnEnemy,spawnExplosion,
    obstacleCircle,pushEnemyAwayFromWalls,moveEnemyCollisionSafe,
    enforceEnemyWallClearance,getTargetPlayer,enemyTouchesPlayer,damagePlayer
  }){
    for(const e of enemies){
      const targetPlayer=getTargetPlayer(e);
      if(!targetPlayer)continue;
      const hero=targetPlayer.hero;
      const oldEX=e.x,oldEY=e.y;
      e.didTeleport=false;
      e.hurt=Math.max(0,e.hurt-dt);
      e.cd-=dt;
      e.bounceClock=(e.bounceClock||0)+dt;

      const a=Math.atan2(hero.y-e.y,hero.x-e.x);

      if(['chaser','mini','splitter'].includes(e.type)){
        const nx=e.x+Math.cos(a)*e.speed*dt;
        const ny=e.y+Math.sin(a)*e.speed*dt;
        const bx=obstacleCircle(nx,e.y,e.r);
        const by=obstacleCircle(e.x,ny,e.r);
        if(!bx)e.x=nx;
        if(!by)e.y=ny;
        if(bx&&by){
          const pa=a+Math.PI/2;
          const nx2=e.x+Math.cos(pa)*e.speed*dt;
          const ny2=e.y+Math.sin(pa)*e.speed*dt;
          if(!obstacleCircle(nx2,ny2,e.r)){e.x=nx2;e.y=ny2}
        }
      }

      else if(e.type==='shooter'){
        const d=Math.hypot(hero.x-e.x,hero.y-e.y);
        if(d<190){e.x-=Math.cos(a)*e.speed*dt;e.y-=Math.sin(a)*e.speed*dt}
        else if(d>300){e.x+=Math.cos(a)*e.speed*.5*dt;e.y+=Math.sin(a)*e.speed*.5*dt}
        if(e.cd<=0){fireEnemy(e,{hero,room,enemyShots});e.cd=1.35+Math.random()*.55}
      }

      else if(e.type==='sniper'){
        const d=Math.hypot(hero.x-e.x,hero.y-e.y);
        if(d<260){e.x-=Math.cos(a)*e.speed*dt;e.y-=Math.sin(a)*e.speed*dt}
        if(!e.telegraph){
          if(e.cd<=0){e.telegraph=true;e.telegraphTime=.85;e.aimAngle=a;audio.poison()}
        }else{
          e.telegraphTime-=dt;
          if(e.telegraphTime<=0){
            enemyShots.push({
              x:e.x,y:e.y,
              vx:Math.cos(e.aimAngle)*640,
              vy:Math.sin(e.aimAngle)*640,
              r:6,damage:26+room*1.1,near:false,wallPierce:true
            });
            e.telegraph=false;
            e.cd=1.9+Math.random()*.7;
          }
        }
      }

      else if(e.type==='bomber'){
        const nx=e.x+Math.cos(a)*e.speed*dt;
        const ny=e.y+Math.sin(a)*e.speed*dt;
        if(!obstacleCircle(nx,ny,e.r)){e.x=nx;e.y=ny}
        const d=Math.hypot(hero.x-e.x,hero.y-e.y);
        if(d<62){e.fuseCd-=dt;if(e.fuseCd<=0)e.dead=true}
        else e.fuseCd=.6;
      }

      else if(e.type==='emberling'){
        const nx=e.x+Math.cos(a)*e.speed*dt;
        const ny=e.y+Math.sin(a)*e.speed*dt;
        if(!obstacleCircle(nx,ny,e.r)){e.x=nx;e.y=ny}
        if(e.cd<=0){
          enemyShots.push({
            x:e.x,y:e.y,
            vx:Math.cos(a)*245,
            vy:Math.sin(a)*245,
            r:6,damage:14+room*.5,near:false
          });
          e.cd=1.15;
        }
      }

      else if(e.type==='charger'){
        e.chargeCd-=dt;
        if(e.charging){
          e.chargeTime-=dt;
          e.x+=Math.cos(e.chargeAngle)*e.speed*3.4*dt;
          e.y+=Math.sin(e.chargeAngle)*e.speed*3.4*dt;
          if(e.chargeTime<=0){e.charging=false;e.chargeCd=2}
        }else if(e.chargeCd<=0){
          e.charging=true;e.chargeTime=.55;e.chargeAngle=a;
        }
      }

      else if(e.type==='shield'){
        const nx=e.x+Math.cos(a)*e.speed*dt;
        const ny=e.y+Math.sin(a)*e.speed*dt;
        if(!obstacleCircle(nx,ny,e.r)){e.x=nx;e.y=ny}
      }

      else if(e.type==='teleporter'){
        e.blinkCd-=dt;
        if(e.blinkCd<=0){
          const aa=Math.random()*Math.PI*2;
          const dist=110+Math.random()*100;
          e.x=Math.max(30,Math.min(W-30,hero.x+Math.cos(aa)*dist));
          e.y=Math.max(80,Math.min(H-40,hero.y+Math.sin(aa)*dist));
          e.blinkCd=1.8;
        }
        if(e.cd<=0){fireEnemy(e,{hero,room,enemyShots});e.cd=1.4}
      }

      else if(e.type==='stalker'){
        e.lungeCd-=dt;
        const side=a+Math.PI/2;
        e.x+=Math.cos(side)*e.speed*.45*dt;
        e.y+=Math.sin(side)*e.speed*.45*dt;
        if(e.lungeCd<=0){
          e.x+=Math.cos(a)*e.speed*2.7*dt;
          e.y+=Math.sin(a)*e.speed*2.7*dt;
          e.lungeCd=1.25;
        }
      }

      else if(e.type==='spore'){
        if(e.cd<=0){
          enemyShots.push({
            x:e.x,y:e.y,
            vx:Math.cos(a)*150,
            vy:Math.sin(a)*150,
            r:10,damage:16+room*.6,near:false
          });
          e.cd=1.45;
        }
      }

      else if(e.type==='orbiter'){
        const side=a+Math.PI/2*e.orbitDir;
        e.x+=Math.cos(side)*e.speed*dt;
        e.y+=Math.sin(side)*e.speed*dt;
        if(e.cd<=0){
          for(let k=0;k<4;k++){
            const aa=performance.now()*.002+k*Math.PI/2;
            enemyShots.push({
              x:e.x,y:e.y,
              vx:Math.cos(aa)*180,
              vy:Math.sin(aa)*180,
              r:5,damage:13+room*.5,near:false
            });
          }
          e.cd=1.1;
        }
      }

      else if(e.type==='summoner'){
        e.summonCd-=dt;
        if(e.summonCd<=0&&enemies.length<14){
          spawnEnemy('mini',e.x-18,e.y+12);
          spawnEnemy('mini',e.x+18,e.y+12);
          e.summonCd=4;
        }
        if(e.cd<=0){fireEnemy(e,{hero,room,enemyShots});e.cd=1.6}
      }

      else if(e.type==='boss'){
        const kind=e.bossKind||'warlock';

        if(kind==='brute'){
          e.chargeCd-=dt;
          if(e.charging){
            e.chargeTime-=dt;
            e.x+=Math.cos(e.chargeAngle)*e.speed*3.1*dt;
            e.y+=Math.sin(e.chargeAngle)*e.speed*3.1*dt;
            if(e.chargeTime<=0){e.charging=false;e.chargeCd=2.3+Math.random()*.6}
          }else{
            e.x+=Math.cos(a)*e.speed*dt;
            e.y+=Math.sin(a)*e.speed*dt;
            if(e.chargeCd<=0){
              e.charging=true;e.chargeTime=.5;e.chargeAngle=a;
              announce('BRUTE CHARGES');
              addShake(4);
            }
          }
        }

        else if(kind==='reaper'){
          e.x+=Math.cos(a)*e.speed*.6*dt;
          e.y+=Math.sin(a)*e.speed*.6*dt;
          if(e.cd<=0){fireEnemy(e,{hero,room,enemyShots});e.cd=1.15}
          e.summonCd-=dt;
          if(e.summonCd<=0&&enemies.length<14){
            spawnEnemy('mini',e.x-20,e.y+10);
            spawnEnemy('mini',e.x+20,e.y+10);
            e.summonCd=5.5;
            announce('REAPER SUMMONS');
          }
        }

        else if(['wyrm','basilisk'].includes(kind)){
          e.chargeCd-=dt;
          e.x+=Math.cos(a)*e.speed*.75*dt;
          e.y+=Math.sin(a)*e.speed*.75*dt;
          if(e.cd<=0){
            for(let k=-2;k<=2;k++){
              const aa=a+k*.17;
              enemyShots.push({
                x:e.x,y:e.y,
                vx:Math.cos(aa)*245,
                vy:Math.sin(aa)*245,
                r:7,damage:20+dungeon*2,near:false
              });
            }
            e.cd=1.05;
          }
          if(e.chargeCd<=0){
            e.x+=Math.cos(a)*e.speed*3*dt;
            e.y+=Math.sin(a)*e.speed*3*dt;
            e.chargeCd=2.4;
          }
        }

        else if(['forge','colossus'].includes(kind)){
          if(e.cd<=0){
            for(let k=0;k<10;k++){
              const aa=k*Math.PI*2/10;
              enemyShots.push({
                x:e.x,y:e.y,
                vx:Math.cos(aa)*210,
                vy:Math.sin(aa)*210,
                r:7,damage:18+dungeon*2,near:false
              });
            }
            spawnExplosion(e.x,e.y,95);
            e.cd=1.65;
          }
        }

        else if(['pyromancer','oracle','voidlord'].includes(kind)){
          e.blinkCd-=dt;
          if(e.blinkCd<=0){
            e.x=60+Math.random()*(W-120);
            e.y=100+Math.random()*(H*.55);
            e.didTeleport=true;
            e.blinkCd=1.8;
          }
          if(e.cd<=0){
            const n=kind==='voidlord'?12:8;
            for(let k=0;k<n;k++){
              const aa=a+(k-(n-1)/2)*.18;
              enemyShots.push({
                x:e.x,y:e.y,
                vx:Math.cos(aa)*250,
                vy:Math.sin(aa)*250,
                r:6,damage:18+dungeon*2,near:false
              });
            }
            e.cd=.9;
          }
        }

        else if(['warden','hivequeen'].includes(kind)){
          e.summonCd-=dt;
          if(e.summonCd<=0&&enemies.length<14){
            for(let k=0;k<3;k++){
              spawnEnemy(kind==='warden'?'stalker':'spore',e.x+(k-1)*24,e.y+18);
            }
            e.summonCd=4.2;
          }
          if(e.cd<=0){fireEnemy(e,{hero,room,enemyShots});e.cd=1.2}
        }

        else{
          e.x+=Math.cos(a)*e.speed*dt;
          e.y+=Math.sin(a)*e.speed*dt;
          if(e.cd<=0){fireEnemy(e,{hero,room,enemyShots});e.cd=1.55}
        }
      }

      pushEnemyAwayFromWalls(e,dt);
      moveEnemyCollisionSafe(e,oldEX,oldEY,e.didTeleport);
      enforceEnemyWallClearance(e);

      e.x=Math.max(e.r+14,Math.min(W-e.r-14,e.x));
      e.y=Math.max(e.r+60,Math.min(H-e.r-24,e.y));

      if(enemyTouchesPlayer(targetPlayer,e)){
        let dmg=10;
        if(e.type==='boss')dmg=e.bossKind==='brute'?(e.charging?36:20):24;
        if(e.elite==='frenzied')dmg*=1.3;
        damagePlayer(targetPlayer,dmg,'contact');
        if(e.vampiric)e.hp=Math.min(e.maxHp,e.hp+dmg*.4);
        e.x-=Math.cos(a)*24;
        e.y-=Math.sin(a)*24;
      }
    }
  }

  function movementCategory(type){
    if(['sniper','teleporter'].includes(type))return 'hover';
    if(['splitter','mini'].includes(type))return 'slime';
    if(['boss','charger','shield'].includes(type))return 'heavy';
    if(['mini','emberling','stalker'].includes(type))return 'fast';
    return 'light';
  }

  return {
    createEnemy,
    applyEliteModifier,
    updateAll,
    movementCategory
  };
})();
