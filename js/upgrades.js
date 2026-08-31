// Riftbound Arena upgrades / curses
// Uses a hero getter so the module always modifies the currently-active hero.
window.RB_UPGRADES = (() => {
  const RARITY_COLOR={
    common:'#9fb0c7',
    rare:'#7da8ff',
    epic:'#bc83ff',
    legendary:'#ffd166'
  };

  function create(getHero){
    const H=()=>getHero();

    const skills=[
      {n:'Multishot',d:'+1 projectile per volley',rarity:'rare',apply:()=>H().multishot=Math.min(5,H().multishot+1)},
      {n:'Rapid Fire',d:'16% faster attacks',rarity:'common',apply:()=>H().fireRate*=.84},
      {n:'Power Core',d:'+25% damage',rarity:'common',apply:()=>H().damage*=1.25},
      {n:'Piercing Rune',d:'Projectiles pierce +1 enemy',rarity:'common',apply:()=>H().pierce++},
      {n:'Swift Boots',d:'+13% movement speed',rarity:'common',apply:()=>H().speed*=1.13},
      {n:'Vitality',d:'+25 max HP and heal 25',rarity:'common',apply:()=>{const h=H();h.maxHp+=25;h.hp=Math.min(h.maxHp,h.hp+25)}},
      {n:'Barrier',d:'Block the next hit',rarity:'rare',apply:()=>H().shield++},
      {n:'Critical Eye',d:'+12% crit chance',rarity:'common',apply:()=>H().crit=Math.min(.60,H().crit+.12)},
      {n:'Dangerous Edge',d:'Danger bonuses are 25% stronger',rarity:'rare',apply:()=>H().dangerAmp*=1.25},
      {n:'Lifesteal',d:'Heal for 6% of damage dealt',rarity:'rare',apply:()=>H().lifesteal=(H().lifesteal||0)+.06},
      {n:'Chain Bolt',d:'25% chance a hit arcs to a nearby enemy',rarity:'rare',apply:()=>H().chainChance=Math.min(.75,(H().chainChance||0)+.25)},
      {n:'Adrenaline',d:'+18% attack speed while Danger is 50%+',rarity:'rare',apply:()=>H().adrenaline=(H().adrenaline||0)+.18},
      {n:'Glass Cannon',d:'+75% damage, but -40% max HP immediately.',rarity:'epic',apply:()=>{const h=H();h.damage*=1.75;h.maxHp=Math.max(30,Math.floor(h.maxHp*.6));h.hp=Math.min(h.hp,h.maxHp)}},
      {n:'Berserker',d:'Attack speed rises the lower your HP is; healing effects are 30% weaker.',rarity:'epic',apply:()=>{const h=H();h.berserker=(h.berserker||0)+1;h.healingPenalty=(h.healingPenalty||1)*.7}},
      {n:'Titan Armor',d:'+40 max HP, but -10% movement speed.',rarity:'rare',apply:()=>{const h=H();h.maxHp+=40;h.hp=Math.min(h.maxHp,h.hp+40);h.speed*=.9}},
      {n:'One Shot',d:'+120% critical damage, but attacks are 25% slower.',rarity:'epic',apply:()=>{const h=H();h.critMul+=1.2;h.fireRate*=1.25}},
      {n:'Danger Addict',d:'Danger bonuses are 50% stronger, but getting hit fully resets Danger.',rarity:'epic',apply:()=>{const h=H();h.dangerAmp*=1.5;h.dangerAddict=true}},
      {n:'Arrow Storm',d:'LEGENDARY. 20% chance on hit to rain 4 extra shots onto your target.',rarity:'legendary',apply:()=>H().arrowStorm=Math.min(.5,(H().arrowStorm||0)+.2)},
      {n:'Archmage Echo',d:'LEGENDARY. 30% chance each volley fires a free echo shot.',rarity:'legendary',apply:()=>H().echoChance=Math.min(.6,(H().echoChance||0)+.3)},
      {n:'Death Army',d:'LEGENDARY. Wraith summon chance and lifespan greatly increased.',rarity:'legendary',apply:()=>H().deathArmy=true}
    ];

    const curses=[
      {n:'Weak Lungs',d:'-18% max HP immediately.',apply:()=>{const h=H();h.maxHp=Math.max(35,Math.floor(h.maxHp*.82));h.hp=Math.min(h.hp,h.maxHp)}},
      {n:'Heavy Hands',d:'Attacks become 20% slower.',apply:()=>H().fireRate*=1.20},
      {n:'Dulled Weapon',d:'-18% damage.',apply:()=>H().damage*=.82},
      {n:'Cracked Boots',d:'-15% movement speed.',apply:()=>H().speed*=.85},
      {n:'Brittle Focus',d:'Critical chance is cut in half.',apply:()=>H().crit*=.5},
      {n:'Danger Collapse',d:'Danger bonuses become 25% weaker.',apply:()=>H().dangerAmp*=.75},
      {n:'Toxic Blood',d:'Poison suffocation damage increases by 30%.',apply:()=>H().poisonVulnerability=(H().poisonVulnerability||1)*1.30},
      {n:'Fractured Shot',d:'Projectile size shrinks and bullet speed drops 15%.',apply:()=>{const h=H();h.bulletSpeed*=.85;h.projectileScale=(h.projectileScale||1)*.82}},
      {n:'Withering Curse',d:'Any Lifesteal you have is halved.',apply:()=>H().lifesteal=(H().lifesteal||0)*.5},
      {n:'Static Interference',d:'Chain Bolt chance is disabled this run.',apply:()=>H().chainChance=0}
    ];

    return {skills,curses};
  }

  function weightedPick(pool,n){
    const weight={common:10,rare:6,epic:3,legendary:1};
    const bag=[];
    pool.forEach(s=>{
      const w=weight[s.rarity]||8;
      for(let i=0;i<w;i++)bag.push(s);
    });

    const picked=[],usedNames=new Set();
    let guard=0;
    while(picked.length<n&&guard<400){
      guard++;
      const s=bag[Math.floor(Math.random()*bag.length)];
      if(!usedNames.has(s.n)){
        picked.push(s);
        usedNames.add(s.n);
      }
    }
    return picked;
  }

  return {create,weightedPick,RARITY_COLOR};
})();
