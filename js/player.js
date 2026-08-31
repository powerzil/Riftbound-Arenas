// Riftbound Arena player foundation
// This module contains player-specific state construction, body hitboxes,
// and movement. It is intentionally written to accept a hero object so
// future local multiplayer can reuse the same functions for players[0], players[1], etc.
window.RB_PLAYER = (() => {

  function createHero({className,characters,W,H}){
    const c=characters[className];
    return {
      name:className,
      weapon:c.weapon,
      passive:c.passive,
      x:W/2,
      y:H*.78,
      r:15,
      hp:c.hp,
      maxHp:c.hp,
      speed:c.speed,
      damage:c.damage,
      fireRate:c.fireRate,
      bulletSpeed:500,
      multishot:1,
      spread:.14,
      pierce:0,
      crit:.08,
      critMul:2,
      shield:0,
      dangerAmp:1,
      poisonVulnerability:1,
      projectileScale:1,
      lifesteal:0,
      chainChance:0,
      adrenaline:0,
      berserker:0,
      healingPenalty:1,
      dangerAddict:false,
      facing:1,
      attackAnim:0,
      hitFlash:0,
      walkCycle:0
    };
  }

  function hitCircles(hero){
    // Visible BODY only. Weapons, staff, bow, blades, and shoulder width do not count.
    return [
      {x:hero.x, y:hero.y-17, r:6.5},
      {x:hero.x, y:hero.y-3,  r:9.0},
      {x:hero.x, y:hero.y+10, r:7.5}
    ];
  }

  function projectileHits(hero,p){
    for(const h of hitCircles(hero)){
      const rr=(p.r||0)+h.r;
      if((p.x-h.x)*(p.x-h.x)+(p.y-h.y)*(p.y-h.y)<rr*rr)return true;
    }
    return false;
  }

  function enemyTouches(hero,e){
    for(const h of hitCircles(hero)){
      const rr=e.r+h.r;
      if((e.x-h.x)*(e.x-h.x)+(e.y-h.y)*(e.y-h.y)<rr*rr)return true;
    }
    return false;
  }

  function movementRadius(){
    return 9;
  }

  function move(hero,dx,dy,dt,{W,H,walls,circleRectCollide}){
    const mag=Math.hypot(dx,dy);
    if(mag<=.05)return;

    dx/=Math.max(1,mag);
    dy/=Math.max(1,mag);

    hero.facing=dx>=0?1:(dx<0?-1:hero.facing);
    hero.walkCycle+=dt*7*mag;

    const totalX=dx*hero.speed*dt;
    const totalY=dy*hero.speed*dt;
    const steps=Math.max(1,Math.ceil(Math.hypot(totalX,totalY)/4));

    for(let i=0;i<steps;i++){
      const sx=totalX/steps;
      const sy=totalY/steps;
      const nx=Math.max(hero.r+16,Math.min(W-hero.r-16,hero.x+sx));
      const ny=Math.max(hero.r+58,Math.min(H-hero.r-22,hero.y+sy));

      let bx=false,by=false;
      for(const w of walls){
        if(circleRectCollide(nx,hero.y,movementRadius(),w))bx=true;
        if(circleRectCollide(hero.x,ny,movementRadius(),w))by=true;
      }

      if(!bx)hero.x=nx;
      if(!by)hero.y=ny;
    }
  }

  function createRuntimePlayer({id=1,className,characters,W,H,controlScheme='combined'}){
    return {
      id,
      className,
      controlScheme,
      hero:createHero({className,characters,W,H}),
      danger:0,
      peakDanger:0,
      damageTakenRoom:0,
      xp:0,
      level:1,
      xpNeed:11,
      manualTarget:null,
      fireClock:0,
      moveMagnitude:0,
      engineerHeat:0,
      revived:false
    };
  }

  function resetRuntimePlayer(player,{className,characters,W,H}){
    const fresh=createRuntimePlayer({
      id:player.id,
      className,
      characters,
      W,H,
      controlScheme:player.controlScheme
    });
    Object.keys(player).forEach(k=>delete player[k]);
    Object.assign(player,fresh);
    return player;
  }

  return {
    createHero,
    createRuntimePlayer,
    resetRuntimePlayer,
    hitCircles,
    projectileHits,
    enemyTouches,
    movementRadius,
    move
  };
})();
