(()=>{
const cvs=document.getElementById('game'),ctx=cvs.getContext('2d'),wrap=document.getElementById('gameWrap');
const $=id=>document.getElementById(id);
const roomLabel=$('roomLabel'),coinLabel=$('coinLabel'),levelLabel=$('levelLabel'),
 hpFill=$('hpFill'),hpText=$('hpText'),dangerFill=$('dangerFill'),dangerText=$('dangerText'),
 xpFill=$('xpFill'),xpText=$('xpText'),timerFill=$('timerFill'),timerText=$('timerText'),
 timerName=$('timerName'),timerCard=$('timerCard'),msg=$('msg'),
 doorHint=$('doorHint'),arenaTimer=$('arenaTimer'),arenaTimerBox=$('arenaTimerBox'),arenaHpFill=$('arenaHpFill'),arenaHpText=$('arenaHpText'),startOverlay=$('startOverlay'),skillOverlay=$('skillOverlay'),
 contractOverlay=$('contractOverlay'),
 deadOverlay=$('deadOverlay'),skillList=$('skillList'),contractList=$('contractList'),
 charGrid=$('charGrid'),joystick=$('joystick'),stick=$('stick'),
 pauseOverlay=$('pauseOverlay'),pauseBtn=$('pauseBtn'),muteBtn=$('muteBtn'),flashLayer=$('flashLayer'),
 hubOverlay=$('hubOverlay'),hubTabs=$('hubTabs'),hubPanel=$('hubPanel'),hubBank=$('hubBank'),dungeonSelect=$('dungeonSelect'),dungeonBanner=$('dungeonBanner'),
 pathOverlay=$('pathOverlay'),pathList=$('pathList'),
 profileOverlay=$('profileOverlay'),createProfileOverlay=$('createProfileOverlay'),profileList=$('profileList'),profileNameInput=$('profileNameInput'),
 dungeonOverlay=$('dungeonOverlay'),dungeonProfileTitle=$('dungeonProfileTitle'),settingsOverlay=$('settingsOverlay'),
 mobileLayoutChoice=$('mobileLayoutChoice'),desktopLayoutChoice=$('desktopLayoutChoice'),
 settingsMobileLayout=$('settingsMobileLayout'),settingsDesktopLayout=$('settingsDesktopLayout'),
 currentLayoutText=$('currentLayoutText'),mainProfileBadge=$('mainProfileBadge');

const audio=window.RB_AUDIO;
const effects=window.RB_EFFECTS.create({wrap,flashLayer});
const addShake=effects.addShake;
const flashDamage=effects.flashDamage;
const floatText=effects.floatText;



let W=0,H=0,ratio=1;
function resize(){const r=wrap.getBoundingClientRect();W=r.width;H=r.height;ratio=Math.min(2,devicePixelRatio||1);cvs.width=W*ratio;cvs.height=H*ratio;ctx.setTransform(ratio,0,0,ratio,0,0)}
addEventListener('resize',resize);resize();

const storage=window.RB_STORAGE;
const freshProfile=storage.freshProfile;
const normalizeProfile=storage.normalizeProfile;
let {rootSave,activeProfileIndex,save}=storage.load();

function persist(){
 storage.persist(rootSave,activeProfileIndex,save);
}

function applyLayoutMode(mode){
 const desktop=mode==='desktop';
 document.body.classList.toggle('layout-desktop',desktop);
 document.body.classList.toggle('layout-mobile',!desktop);
 requestAnimationFrame(()=>resize());
}
function updateLayoutChoiceUI(mode){
 const desktop=mode==='desktop';
 mobileLayoutChoice?.classList.toggle('selected',!desktop);
 desktopLayoutChoice?.classList.toggle('selected',desktop);
 settingsMobileLayout?.classList.toggle('selected',!desktop);
 settingsDesktopLayout?.classList.toggle('selected',desktop);
 if(currentLayoutText)currentLayoutText.textContent=desktop?'Current: Computer / widescreen':'Current: Mobile / portrait';
}
function setCurrentProfileLayout(mode){
 if(activeProfileIndex<0)return;
 save.displayMode=mode==='desktop'?'desktop':'mobile';
 persist();applyLayoutMode(save.displayMode);updateLayoutChoiceUI(save.displayMode);
}

function switchProfile(index){
 if(!rootSave.profiles[index])return false;
 activeProfileIndex=index;
 save=normalizeProfile(rootSave.profiles[index]);
 selected=save.selected||'Ranger';
 dungeon=save.selectedDungeon||1;
 if(players[0])players[0].className=selected;
 persist();
 applyLayoutMode(save.displayMode);updateLayoutChoiceUI(save.displayMode);
 renderChars();
 renderDungeonSelect();updateMainProfileBadge();
 return true;
}
persist();

const { OUTFITS, HATS, TRAILS, PETS, BESTIARY, DUNGEONS, CHARACTERS } = window.RB_DATA;

// ---------- cosmetics catalog ----------







let dungeon=save.selectedDungeon||1;
function dungeonById(id){return DUNGEONS.find(d=>d.id===id)||DUNGEONS[0]}
function renderDungeonSelect(){
 dungeonSelect.innerHTML='';
 DUNGEONS.forEach(d=>{
  const unlocked=d.id<=save.unlockedDungeon,done=save.completedDungeons.includes(d.id);
  const b=document.createElement('button');b.className='dungeonBtn'+(d.id===save.selectedDungeon?' selected':'')+(unlocked?'':' locked');b.disabled=!unlocked;
  b.innerHTML=`<strong>${done?'✓ ':''}${d.name}</strong><span>${d.desc}</span><span>${unlocked?(done?'Completed — replay anytime':'Unlocked'):'Locked'}</span>`;
  b.addEventListener('click',()=>{if(!unlocked)return;save.selectedDungeon=d.id;dungeon=d.id;persist();renderDungeonSelect()});
  dungeonSelect.appendChild(b)
 })
}
renderDungeonSelect();


let selected=save.selected in CHARACTERS?save.selected:'Ranger';
let creatingProfileIndex=null,creatingDisplayMode='mobile';

function updateMainProfileBadge(){
 if(!mainProfileBadge)return;
 if(activeProfileIndex<0||!rootSave.profiles[activeProfileIndex]){
  mainProfileBadge.textContent='No character selected';
  return;
 }
 mainProfileBadge.innerHTML=`${fighterIcon(save.selected)} <strong>${save.name}</strong> · ${Math.floor(save.bank)} coins · Dungeon ${save.unlockedDungeon}`;
}

function fighterIcon(name){
 return name==='Ranger'?'🏹':name==='Assassin'?'🗡️':name==='Mage'?'🔮':name==='Engineer'?'⚙️':'☠️';
}
function renderChars(){
 charGrid.innerHTML='';
 Object.entries(CHARACTERS).forEach(([name,c])=>{
  const b=document.createElement('button');b.className='char'+(name===selected?' selected':'');
  b.innerHTML=`<strong>${fighterIcon(name)} ${name}</strong><span>${c.desc}</span>`;
  b.addEventListener('click',()=>{selected=name;renderChars()});
  charGrid.appendChild(b)
 })
}
function renderProfiles(){
 updateMainProfileBadge();profileList.innerHTML='';
 rootSave.profiles.forEach((p,i)=>{
  if(p){
   p=normalizeProfile(p);
   const d=document.createElement('div');d.className='profileSlot';
   const portrait=document.createElement('div');portrait.className='profilePortrait';portrait.textContent=fighterIcon(p.selected);
   const info=document.createElement('div');info.className='profileInfo';
   info.innerHTML=`<strong>${p.name}</strong><span>${p.selected} • ${p.displayMode==='desktop'?'🖥️ Computer':'📱 Mobile'} • Dungeon ${p.unlockedDungeon}/${DUNGEONS.length}</span><span>${Math.floor(p.bank)} coins • ${p.completedDungeons.length} dungeon${p.completedDungeons.length===1?'':'s'} completed</span>`;
   const actions=document.createElement('div');actions.className='profileActions';
   const play=document.createElement('button');play.className='miniBtn';play.textContent='SELECT';
   play.addEventListener('click',()=>{switchProfile(i);profileOverlay.classList.remove('show');openDungeonMenu()});
   const del=document.createElement('button');del.className='miniBtn delete';del.textContent='DELETE';
   del.addEventListener('click',()=>{
    if(del.dataset.confirming!=='yes'){
      del.dataset.confirming='yes';del.textContent='CONFIRM?';
      setTimeout(()=>{if(del.isConnected){del.dataset.confirming='';del.textContent='DELETE'}},2200);
      return
    }
    rootSave.profiles[i]=null;
    rootSave.legacyMigrated=true;
    storage.clearLegacy();
    if(i===activeProfileIndex){
      const next=rootSave.profiles.findIndex(Boolean);
      activeProfileIndex=next;
      if(next>=0){
        save=normalizeProfile(rootSave.profiles[next]);selected=save.selected;dungeon=save.selectedDungeon||1;
        applyLayoutMode(save.displayMode);
      }else{
        save=freshProfile('Wanderer','Ranger');selected='Ranger';dungeon=1;
        applyLayoutMode(window.innerWidth>=850?'desktop':'mobile');
      }
    }
    persist();renderProfiles()
   });
   actions.append(play,del);d.append(portrait,info,actions);profileList.appendChild(d)
  }else{
   const b=document.createElement('button');b.className='choice';b.innerHTML='<strong>＋ Create Character</strong><span>Empty character slot</span>';
   b.addEventListener('click',()=>openCreateProfile(i));profileList.appendChild(b)
  }
 });
}
function openProfiles(){
 renderProfiles();startOverlay.classList.remove('show');profileOverlay.classList.add('show')
}
function openCreateProfile(i){
 creatingProfileIndex=i;profileNameInput.value='';selected='Ranger';
 creatingDisplayMode=window.innerWidth>=850?'desktop':'mobile';
 updateLayoutChoiceUI(creatingDisplayMode);renderChars();
 profileOverlay.classList.remove('show');createProfileOverlay.classList.add('show');setTimeout(()=>profileNameInput.focus(),50)
}
function openDungeonMenu(){
 renderDungeonSelect();
 const pill=dungeonOverlay.querySelector('.pill');
 if(coopTestMode){
  if(pill)pill.textContent='LOCAL CO-OP • MP3 TEST';
  dungeonProfileTitle.textContent=`${save.name} + P2 ${coopP2Class} — Choose Dungeon`;
 }else{
  if(pill)pill.textContent='SINGLEPLAYER';
  dungeonProfileTitle.textContent=`${save.name} — Choose Dungeon`;
 }
 profileOverlay.classList.remove('show');startOverlay.classList.remove('show');dungeonOverlay.classList.add('show')
}
renderChars();

// ---------- hub (menu): cosmetics, pets, bestiary ----------
let hubTab='outfits',hubReturnTo='start';
function drawPreview(canvas,kind,item){
 const c=canvas.getContext('2d'),w=canvas.width=156,h=canvas.height=156;
 const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#18283b');g.addColorStop(1,'#09111a');c.fillStyle=g;c.fillRect(0,0,w,h);
 c.save();c.translate(w/2,h/2+16);
 if(kind==='bestiary'){
  drawBeastPreview(c,item.key);
 } else {
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,30,26,8,0,0,Math.PI*2);c.fill();
  let col='#3f6fb5';if(kind==='outfits'&&item.color)col=item.color;
  c.fillStyle='#283849';c.fillRect(-14,8,10,24);c.fillRect(4,8,10,24);c.fillStyle=col;c.beginPath();c.moveTo(-20,12);c.lineTo(-14,-22);c.lineTo(14,-22);c.lineTo(20,12);c.closePath();c.fill();
  c.fillStyle='#d8b18d';c.beginPath();c.arc(0,-37,14,0,Math.PI*2);c.fill();
  if(kind==='hats'){
   if(item.id==='crown'){c.fillStyle='#ffd166';c.beginPath();c.moveTo(-14,-48);c.lineTo(-14,-63);c.lineTo(-6,-55);c.lineTo(0,-67);c.lineTo(6,-55);c.lineTo(14,-63);c.lineTo(14,-48);c.closePath();c.fill()}
   else if(item.id==='halo'){c.strokeStyle='#fff3b0';c.lineWidth=5;c.beginPath();c.ellipse(0,-62,16,6,0,0,Math.PI*2);c.stroke()}
   else if(item.id==='horns'){c.fillStyle='#8a2f2f';c.beginPath();c.moveTo(-10,-47);c.lineTo(-22,-70);c.lineTo(-3,-50);c.fill();c.beginPath();c.moveTo(10,-47);c.lineTo(22,-70);c.lineTo(3,-50);c.fill()}
   else if(item.id==='bandana'){c.fillStyle='#c23b3b';c.fillRect(-15,-50,30,7)}
  }
  if(kind==='trails'&&item.id!=='none'){c.fillStyle=item.color||'#fff';for(let i=0;i<7;i++){c.globalAlpha=1-i/8;c.beginPath();c.arc(-28+i*9,28+i*2,5-i*.35,0,Math.PI*2);c.fill()}c.globalAlpha=1}
  if(kind==='pets'&&item.id!=='none'){c.fillStyle=item.color||'#fff';c.beginPath();c.arc(38,8,13,0,Math.PI*2);c.fill();c.fillStyle='#0009';c.beginPath();c.arc(34,5,2,0,Math.PI*2);c.fill();c.beginPath();c.arc(42,5,2,0,Math.PI*2);c.fill()}
 }
 c.restore()
}
function renderHub(){
 hubBank.textContent=Math.floor(save.bank);
 const tabs=[['outfits','Outfits'],['hats','Hats'],['trails','Trails'],['pets','Pets'],['bestiary','Bestiary']];
 hubTabs.innerHTML='';tabs.forEach(([id,label])=>{const b=document.createElement('button');b.className='tabBtn'+(id===hubTab?' active':'');b.textContent=label;b.addEventListener('click',()=>{hubTab=id;renderHub()});hubTabs.appendChild(b)});
 hubPanel.innerHTML='';
 if(hubTab==='bestiary'){
  BESTIARY.forEach(m=>{const seen=!!save.seen[m.key],d=document.createElement('div');d.className='choice previewCard';d.style.cursor='default';const cv=document.createElement('canvas');cv.className='previewCanvas';const info=document.createElement('div');info.innerHTML=seen?`<strong>${m.name}</strong><span>${m.desc}</span>`:`<strong>???</strong><span>Not yet encountered.</span>`;d.appendChild(cv);d.appendChild(info);hubPanel.appendChild(d);drawPreview(cv,'bestiary',seen?m:{key:'unknown'})});return
 }
 const catalogMap={outfits:OUTFITS,hats:HATS,trails:TRAILS,pets:PETS},slotMap={outfits:'outfit',hats:'hat',trails:'trail',pets:'pet'},cat=catalogMap[hubTab],slot=slotMap[hubTab];
 cat.forEach(item=>{const owned=save.unlocked[hubTab].includes(item.id),equipped=save.equipped[slot]===item.id,b=document.createElement('button');b.className='choice previewCard'+(equipped?' equipped':'');const cv=document.createElement('canvas');cv.className='previewCanvas';const info=document.createElement('div');const status=owned?(equipped?'Equipped':'Owned — tap to equip'):('Cost: '+item.cost+' coins'+(save.bank<item.cost?' (not enough)':''));info.innerHTML=`<strong>${item.name}</strong><span>${status}</span>`;b.appendChild(cv);b.appendChild(info);b.addEventListener('click',()=>{if(owned){save.equipped[slot]=item.id;persist();renderHub()}else if(save.bank>=item.cost){save.bank-=item.cost;save.unlocked[hubTab].push(item.id);save.equipped[slot]=item.id;persist();renderHub()}});hubPanel.appendChild(b);drawPreview(cv,hubTab,item)})
}
// Main-menu Bestiary/Cosmetics buttons open the collection hub below.
$('pauseHubBtn').addEventListener('click',()=>{hubReturnTo='pause';renderHub();pauseOverlay.classList.remove('show');hubOverlay.classList.add('show')});
$('hubCloseBtn').addEventListener('click',()=>{hubOverlay.classList.remove('show');(hubReturnTo==='pause'?pauseOverlay:startOverlay).classList.add('show')});


let running=false,paused=false,dead=false,last=performance.now(),room=1,coins=0,runCoinsBanked=0;
let roomTimerMax=40,roomTimer=40,smoke=false,smokeClock=0,smokeOpacity=0;
let roomStartAt=0,roomRewardMult=1,currentContract=window.RB_ROOMS.CONTRACTS[0],noHealNext=false;
let enemies=[],shots=[],enemyShots=[],particles=[],walls=[],gate=null,wraiths=[],chainFx=[],potions=[],chest=null,treasureRoomActive=false,hazards=[],eliteRoomActive=false,forcedRoomKind=null;
let roomCleared=false;
let players=[];
let devGodMode=false,devInfiniteDamage=false;
const input=window.RB_INPUT.create({
 joystick,
 stick,
 onCheat(word){
  if(word==='heal'){
   devGodMode=!devGodMode;
   announce(devGodMode?'DEV: INVULNERABLE ON':'DEV: INVULNERABLE OFF');
  }else if(word==='damage'){
   devInfiniteDamage=!devInfiniteDamage;
   announce(devInfiniteDamage?'DEV: INFINITE DAMAGE ON':'DEV: INFINITE DAMAGE OFF');
  }
 }
});

const playerSystem=window.RB_PLAYER;

// Multiplayer foundation: runtime player state now lives in players[].
// During MP1, the existing singleplayer code is kept stable through a temporary
// compatibility bridge that maps old singleplayer identifiers to players[0].
players=[
 playerSystem.createRuntimePlayer({
  id:1,
  className:selected,
  characters:CHARACTERS,
  W,H,
  controlScheme:'combined',
  enabled:true
 }),
 playerSystem.createRuntimePlayer({
  id:2,
  className:'Mage',
  characters:CHARACTERS,
  W,H,
  controlScheme:'arrows',
  enabled:false
 })
];

let compatPlayerIndex=0;
let coopTestMode=false;
let coopP2Class='Mage';
function activePlayerState(){return players[compatPlayerIndex]||players[0]}
function withPlayerState(index,fn){
 const prev=compatPlayerIndex;compatPlayerIndex=index;
 try{return fn()}finally{compatPlayerIndex=prev}
}
function installSinglePlayerCompatibilityBindings(){
 const keys=[
  'hero','danger','peakDanger','damageTakenRoom','xp','level','xpNeed',
  'manualTarget','fireClock','moveMagnitude','engineerHeat','revived'
 ];
 for(const key of keys){
  const existing=Object.getOwnPropertyDescriptor(globalThis,key);
  if(existing&&!existing.configurable){
   throw new Error('Cannot install player-state compatibility binding for '+key);
  }
  Object.defineProperty(globalThis,key,{
   configurable:true,
   enumerable:false,
   get(){return activePlayerState()[key]},
   set(value){activePlayerState()[key]=value}
  });
 }
}
installSinglePlayerCompatibilityBindings();

window.RB_RUNTIME={
 get version(){return 'MP4C'},
 get players(){return players},
 get activePlayer(){return activePlayerState()},
 get coopTestMode(){return coopTestMode},
 snapshot(){
  return players.map(p=>({
   id:p.id,label:p.label,enabled:p.enabled,
   className:p.className,controlScheme:p.controlScheme,
   hp:p.hero.hp,maxHp:p.hero.maxHp,danger:p.danger,xp:p.xp,
   level:p.level,xpNeed:p.xpNeed,engineerHeat:p.engineerHeat,
   x:Math.round(p.hero.x),y:Math.round(p.hero.y)
  }));
 },
 controls(){
  return {
   assignments:input.getAssignments(),
   p1:input.getVectorFor('wasd'),
   p2:input.getVectorFor('arrows'),
   singleplayer:input.getVectorFor('combined')
  };
 },
 setPlayer2Class(name){
  if(!(name in CHARACTERS))return false;
  coopP2Class=name;players[1].className=name;return true;
 },
 enemyTargets(){
  return enemies.map((e,i)=>({index:i,type:e.type,bossKind:e.bossKind||null,targetPlayerId:e.targetPlayerId||null}));
 }
};

const enemySystem=window.RB_ENEMIES;
const roomSystem=window.RB_ROOMS;
const CONTRACTS=roomSystem.CONTRACTS;
const ELITE_MODIFIERS=roomSystem.ELITE_MODIFIERS;
const upgradeSystem=window.RB_UPGRADES;
const {skills,curses}=upgradeSystem.create(()=>hero);
const RARITY_COLOR=upgradeSystem.RARITY_COLOR;
function makeHero(){
 return playerSystem.createHero({className:selected,characters:CHARACTERS,W,H});
}
function syncRunCoinsToBank(){
 if(activeProfileIndex<0)return;
 const whole=Math.floor(coins);
 const delta=whole-runCoinsBanked;
 if(delta>0){
  save.bank+=delta;
  runCoinsBanked=whole;
  persist();updateMainProfileBadge();
 }
}

function announce(t){msg.textContent=t;msg.style.opacity=1;clearTimeout(announce.t);announce.t=setTimeout(()=>msg.style.opacity=0,1050)}
function ui(){
 roomLabel.textContent=room;coinLabel.textContent=Math.floor(coins);levelLabel.textContent=level;dungeonBanner.textContent=dungeonById(dungeon).name+' • Boss '+Math.min(3,Math.floor((room-1)/5)+1)+'/3';
 const hpPct=Math.max(0,hero.hp/hero.maxHp*100);
 hpFill.style.width=hpPct+'%';hpText.textContent=`${Math.ceil(Math.max(0,hero.hp))} / ${hero.maxHp}`;
 arenaHpFill.style.width=hpPct+'%';arenaHpText.textContent=`${Math.ceil(Math.max(0,hero.hp))} / ${hero.maxHp}`;
 dangerFill.style.width=danger+'%';dangerText.textContent=Math.floor(danger)+'%';
 xpFill.style.width=Math.min(100,xp/xpNeed*100)+'%';xpText.textContent=`${xp} / ${xpNeed}`;
 const tp=Math.max(0,roomTimer/roomTimerMax*100);timerFill.style.width=tp+'%';
 timerText.textContent=smoke?'POISON':Math.max(0,roomTimer).toFixed(1);
 timerName.textContent=smoke?'POISON GAS':'ROOM TIMER';timerCard.classList.toggle('smoke',smoke);
 arenaTimer.textContent=smoke?'POISON':Math.max(0,roomTimer).toFixed(1);
 arenaTimerBox.classList.toggle('poison',smoke);
}
function resetRun(){
 running=true;paused=false;dead=false;dungeon=save.selectedDungeon||1;room=1;coins=0;runCoinsBanked=0;noHealNext=false;
 compatPlayerIndex=0;
 if(coopTestMode){
  players[0].controlScheme='wasd';players[0].enabled=true;
  players[1].controlScheme='arrows';players[1].enabled=true;
  playerSystem.resetRuntimePlayer(players[0],{className:selected,characters:CHARACTERS,W,H});
  playerSystem.resetRuntimePlayer(players[1],{className:coopP2Class,characters:CHARACTERS,W,H});
 }else{
  players[0].controlScheme='combined';players[0].enabled=true;
  players[1].controlScheme='arrows';players[1].enabled=false;
  playerSystem.resetRuntimePlayer(players[0],{className:selected,characters:CHARACTERS,W,H});
  playerSystem.resetRuntimePlayer(players[1],{className:coopP2Class,characters:CHARACTERS,W,H});
 }
 save.selected=selected;persist();startOverlay.classList.remove('show');dungeonOverlay.classList.remove('show');deadOverlay.classList.remove('show');skillOverlay.classList.remove('show');contractOverlay.classList.remove('show');pathOverlay.classList.remove('show');
 currentContract=CONTRACTS[0];buildRoom();ui();
 announce(coopTestMode?'CO-OP TEST • P1 WASD • P2 ARROWS':selected.toUpperCase())
}
function buildWalls(){
 walls=[];
 if(room%5!==0){
   const variants=[
    [{x:W*.18,y:H*.38,w:W*.20,h:18},{x:W*.63,y:H*.55,w:W*.20,h:18}],
    [{x:W*.37,y:H*.33,w:W*.26,h:18},{x:W*.15,y:H*.58,w:W*.18,h:18}],
    [{x:W*.22,y:H*.48,w:W*.20,h:18},{x:W*.59,y:H*.34,w:W*.18,h:18}]
   ];
   walls=variants[(room-1)%variants.length]
 }
}
function spawnHazardsForRoom(){
 hazards=[];
 if(treasureRoomActive)return;
 hazards=roomSystem.createHazards(dungeonById(dungeon).theme,W,H,2);
}
function applyEliteModifier(e,modId){enemySystem.applyEliteModifier(e,modId)}
function buildRoom(){
 roomCleared=false;gate=null;shots=[];enemyShots=[];particles=[];wraiths=[];enemies=[];potions=[];chest=null;manualTarget=null;hazards=[];buildWalls();
 compatPlayerIndex=0;
 const enabledPlayers=players.filter(p=>p.enabled);
 enabledPlayers.forEach((p,i)=>{
  const offset=enabledPlayers.length>1?(i===0?-28:28):0;
  p.hero.x=W/2+offset;p.hero.y=H*.78;
  p.danger=0;p.peakDanger=0;p.damageTakenRoom=0;
  p.moveMagnitude=0;p.fireClock=0;p.manualTarget=null;
 });
 smoke=false;smokeOpacity=0;smokeClock=0;
 roomTimerMax=room%5===0?75:42;roomTimer=roomTimerMax;roomStartAt=performance.now();roomRewardMult=currentContract.mult||1;
 const boss=room%5===0;
 eliteRoomActive=false;
 if(forcedRoomKind==='treasure'){treasureRoomActive=true}
 else if(forcedRoomKind==='elite'&&!boss){treasureRoomActive=false;eliteRoomActive=true}
 else{treasureRoomActive=!boss&&room>1&&Math.random()<.14}
 forcedRoomKind=null;
 if(treasureRoomActive){
   walls=[];
   chest={x:W/2,y:H*.5,r:20,opened:false};
   announce('TREASURE ROOM')
 }
 else if(boss){
   const kind=dungeonById(dungeon).bosses[Math.min(2,Math.floor(room/5)-1)];
   spawnEnemy('boss',W/2,H*.25,kind);
   announce(kind.toUpperCase()+' BOSS ROOM')
 }
 else{
   let count=Math.min(9,2+Math.floor(room*.75));
   if(currentContract.id==='swarm')count=Math.ceil(count*1.7);
   if(eliteRoomActive){count=Math.min(11,count+2);roomRewardMult*=1.6}
   for(let i=0;i<count;i++){
     const pool=dungeonById(dungeon).enemies;
     const unlockCount=Math.min(pool.length,2+Math.floor(room/3));
     const type=pool[i%unlockCount];
     spawnEnemy(type,70+Math.random()*(W-140),100+Math.random()*H*.42);
     if(eliteRoomActive&&Math.random()<.55){
      const mod=ELITE_MODIFIERS[Math.floor(Math.random()*ELITE_MODIFIERS.length)];
      applyEliteModifier(enemies[enemies.length-1],mod.id)
     }
   }
   if(eliteRoomActive)announce('ELITE ROOM')
 }
 spawnHazardsForRoom();
 ui()
}
function spawnEnemy(type,x,y,kind){
 const seenKey=type==='boss'?`boss_${kind||'warlock'}`:type;
 if(!save.seen[seenKey]){save.seen[seenKey]=true;persist()}
 const e=enemySystem.createEnemy({
  type,x,y,kind,room,dungeon,
  bloodContract:currentContract.id==='blood'
 });
 // Never begin a room sitting on top of a wall.
 for(let tries=0;tries<8&&obstacleCircle(e.x,e.y,e.r+18);tries++){
  e.x=48+Math.random()*(W-96);
  e.y=92+Math.random()*(Math.max(120,H*.56-92));
 }
 enforceEnemyWallClearance(e);
 enemies.push(e)
}
function obstacleCircle(x,y,r){
 for(const w of walls){
  const cx=Math.max(w.x,Math.min(x,w.x+w.w)),cy=Math.max(w.y,Math.min(y,w.y+w.h));
  if((x-cx)**2+(y-cy)**2<r*r)return true
 }return false
}
function nearestEnemy(fromX=hero.x,fromY=hero.y){
 let best=null,bd=1e12;
 for(const e of enemies){const d=(e.x-fromX)**2+(e.y-fromY)**2;if(d<bd){bd=d;best=e}}
 return best
}
function dangerBonus(){
 const d=danger/100*hero.dangerAmp;
 if(hero.passive==='ranger')return {rate:1-.38*Math.min(1,d),damage:1+.14*d,size:1};
 if(hero.passive==='mage')return {rate:1-.10*d,damage:1+.55*d,size:1+.55*d};
 if(hero.passive==='engineer')return {rate:1-.46*Math.min(1,d),damage:1+.08*d,size:1};
 if(hero.passive==='assassin')return {rate:1-.18*d,damage:1+.45*d,size:1};
 if(hero.passive==='necro')return {rate:1-.18*d,damage:1+.20*d,size:1};
 return {rate:1,damage:1,size:1}
}
function currentTarget(){
 if(manualTarget&&enemies.includes(manualTarget))return manualTarget;
 if(manualTarget)manualTarget=null;
 return nearestEnemy()
}
function weaponFireSound(){
 if(hero.weapon==='bow'){audio.bowRelease()}
 else if(hero.weapon==='blades'){audio.bladeSwing()}
 else if(hero.weapon==='staff'){audio.staffRelease()}
 else if(hero.weapon==='blaster'){audio.blasterShot();if(engineerHeat>85)audio.overheat()}
 else if(hero.weapon==='orb'){audio.necroCast()}
 else audio.shoot();
}
function fireHero(){
 const target=currentTarget();if(!target)return;
 const bon=dangerBonus(),a=Math.atan2(target.y-hero.y,target.x-hero.x),n=hero.multishot;
 hero.facing=Math.cos(a)>=0?1:-1;
 hero.attackAnim=hero.weapon==='blades'?.16:hero.weapon==='staff'?.22:.14;
 if(hero.passive==='engineer'){engineerHeat=Math.min(100,engineerHeat+8)}
 let berserkMul=1;
 if(hero.berserker){const missing=1-Math.max(0,hero.hp)/hero.maxHp;berserkMul=1-Math.min(.55,missing*.6*hero.berserker)}
 for(let i=0;i<n;i++){
  const off=(i-(n-1)/2)*hero.spread,ang=a+off,crit=Math.random()<hero.crit;
  const melee=hero.passive==='assassin';
  shots.push({x:hero.x,y:hero.y,vx:Math.cos(ang)*(melee?620:hero.bulletSpeed),vy:Math.sin(ang)*(melee?620:hero.bulletSpeed),
   r:(melee?8:5)*bon.size*(hero.projectileScale||1),damage:hero.damage*bon.damage*(crit?hero.critMul:1),pierce:hero.pierce+(melee?1:0),crit,life:melee?.18:2,type:hero.weapon,ang})
 }
 weaponFireSound();
 if(hero.echoChance&&Math.random()<hero.echoChance){
  shots.push({x:hero.x,y:hero.y,vx:Math.cos(a)*hero.bulletSpeed,vy:Math.sin(a)*hero.bulletSpeed,r:5*bon.size*(hero.projectileScale||1),damage:hero.damage*bon.damage,pierce:hero.pierce,crit:false,life:2,type:hero.weapon,ang:a});
 }
 const adrenalineMul=(hero.adrenaline&&danger>=50)?(1-hero.adrenaline):1;
 fireClock=hero.fireRate*bon.rate*(hero.passive==='engineer'&&engineerHeat>85?1.75:1)*adrenalineMul*berserkMul
}
function gainXP(n=1){
 xp+=n;
 if(xp>=xpNeed){
   xp-=xpNeed;
   level++;
   xpNeed=Math.ceil(xpNeed*1.62+2);
   audio.levelup();
   showSkills();
 }
 ui()
}
function weightedSkillPick(pool,n){return upgradeSystem.weightedPick(pool,n)}
function showSkills(){
 paused=true;skillList.innerHTML='';
 const pool=smoke ? curses : skills;
 const picks=smoke?[...pool].sort(()=>Math.random()-.5).slice(0,3):weightedSkillPick(pool,3);
 picks.forEach(s=>{
  const b=document.createElement('button');b.className='choice';
  const tagColor=RARITY_COLOR[s.rarity]||'#9fb0c7';
  const tag=s.rarity?`<span class="pill" style="margin-bottom:6px;color:${tagColor};border:1px solid ${tagColor}66">${s.rarity.toUpperCase()}</span>`:'';
  b.innerHTML=`${tag}<strong>${s.n}</strong><span>${s.d}</span>`;
  b.addEventListener('click',()=>{
    s.apply();
    skillOverlay.classList.remove('show');
    paused=false;
    announce((smoke?'CURSE: ':'')+s.n.toUpperCase());
    ui()
  });
  skillList.appendChild(b)
 });
 skillOverlay.querySelector('h2').textContent=smoke?'Choose a Curse':'Choose a Power';
 const pill=skillOverlay.querySelector('.pill');
 if(pill)pill.textContent=smoke?'POISON PENALTY':'LEVEL UP';
 skillOverlay.classList.add('show')
}
function showContracts(){
 paused=true;contractList.innerHTML='';
 const picks=[CONTRACTS[0],...[...CONTRACTS.slice(1)].sort(()=>Math.random()-.5).slice(0,2)];
 picks.forEach(c=>{
  const b=document.createElement('button');b.className='choice';
  b.innerHTML=`<strong>${c.name}</strong><span class="contractRisk">${c.risk}</span><span class="contractReward">${c.reward}</span>`;
  b.addEventListener('click',()=>{currentContract=c;contractOverlay.classList.remove('show');paused=false;buildRoom();announce(c.name.toUpperCase())});
  contractList.appendChild(b)
 });
 contractOverlay.classList.add('show')
}
function spawnExplosion(x,y,radius=70){
 for(let i=0;i<18;i++){const a=Math.random()*Math.PI*2,sp=60+Math.random()*160;particles.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:.5,color:'#ffab5e'})}
 addShake(10);audio.explosion()
}
function killEnemy(e){
 const base=(e.type==='boss'?13:1)*(e.elite?1.8:1);
 coins+=base*roomRewardMult*(1+danger/250);syncRunCoinsToBank();
 gainXP(e.type==='boss'?6:1);
 if(e.type==='splitter'){spawnEnemy('mini',e.x-12,e.y);spawnEnemy('mini',e.x+12,e.y)}
 if(e.type==='bomber'){
  spawnExplosion(e.x,e.y);
  if(Math.hypot(hero.x-e.x,hero.y-e.y)<75)damageHero(24,'explosion')
 }
 if(e.explosive){
  spawnExplosion(e.x,e.y,90);
  if(Math.hypot(hero.x-e.x,hero.y-e.y)<90)damageHero(26,'explosion')
 }
 if(hero.passive==='necro'&&danger>=(hero.deathArmy?30:65)&&Math.random()<(hero.deathArmy?.65:.34))wraiths.push({x:e.x,y:e.y,life:hero.deathArmy?13:7,cd:.2});
 if(e.type==='boss'){audio.bosskill();addShake(14);floatText(e.x,e.y-40,'BOSS DEFEATED','#ffd166')}
 else{audio.kill();addShake(1.5)}
 const potionChance=e.type==='boss'?.6:.035;
 if(Math.random()<potionChance)potions.push({x:e.x,y:e.y,r:11,bob:Math.random()*10});
 for(let i=0;i<10;i++)particles.push({x:e.x,y:e.y,vx:(Math.random()-.5)*130,vy:(Math.random()-.5)*130,life:.45})
}
function damagePlayer(player,n,source='hit'){
 if(!player||!player.enabled||!player.hero||player.hero.hp<=0)return;
 const h=player.hero;
 const isP1=player===players[0];

 if(devGodMode){
  if(source!=='smoke')floatText(h.x,h.y-32,'IMMUNE','#c9baff');
  return
 }

 if(h.shield>0&&source!=='smoke'){
  h.shield--;
  if(isP1)announce('BLOCKED');
  else floatText(h.x,h.y-32,'BLOCKED','#c9baff');
  audio.crit();
  return
 }

 if(currentContract.id==='glass'&&source!=='smoke')n*=2;

 if(h.dangerAddict&&source!=='smoke')player.danger=0;

 h.hp-=n;
 player.damageTakenRoom+=n;
 if(!h.dangerAddict)player.danger=Math.min(100,player.danger+18);
 player.peakDanger=Math.max(player.peakDanger,player.danger);
 h.hitFlash=.16;

 if(isP1)ui();
 else floatText(h.x,h.y-31,'-'+Math.ceil(n),'#ff8b93');

 if(source==='smoke')audio.poison();
 else{
  flashDamage();
  addShake(source==='explosion'?6:3);
  audio.hurt();
 }

 if(h.hp<=0){
  h.hp=0;
  if(isP1){
   endRun();
  }else{
   player.enabled=false;
   announce(player.label+' DOWN');
  }
 }
}
function damageHero(n,source='hit'){return damagePlayer(players[0],n,source)}
function endRun(){
 if(dead)return;running=false;dead=true;paused=true;save.best=Math.max(save.best,room);syncRunCoinsToBank();persist();
 $('deadTitle').textContent=`${dungeonById(dungeon).name} — ROOM ${room}`;
 $('deadInfo').innerHTML=`Character: <strong>${selected}</strong><br>Run coins: <strong>${Math.floor(coins)}</strong><br>Restart point: <strong>${dungeonById(dungeon).name}</strong><br>Best room: <strong>${save.best}</strong><br>Total bank: <strong>${save.bank}</strong>`;
 const rb=$('reviveBtn');rb.disabled=revived;rb.textContent=revived?'REVIVE USED':'WATCH AD (MOCK) — REVIVE';deadOverlay.classList.add('show')
}
function roomGrade(){
 const elapsed=(performance.now()-roomStartAt)/1000;
 let score=0;
 if(elapsed<=roomTimerMax*.45)score+=3;else if(elapsed<=roomTimerMax*.70)score+=2;else if(elapsed<=roomTimerMax)score+=1;
 if(peakDanger>=80)score+=3;else if(peakDanger>=55)score+=2;else if(peakDanger>=30)score+=1;
 if(damageTakenRoom<=0)score+=3;else if(damageTakenRoom<=hero.maxHp*.15)score+=2;else if(damageTakenRoom<=hero.maxHp*.35)score+=1;
 if(smoke)score-=2;
 let rank='C',bonus=1;
 if(score>=8){rank='S';bonus=1.35}else if(score>=6){rank='A';bonus=1.20}else if(score>=4){rank='B';bonus=1.10}
 return {rank,bonus,elapsed}
}
function completeRoom(){
 if(roomCleared)return;
 roomCleared=true;
 enemyShots=[];
 gate={x:W/2,y:72,r:25};
 doorHint.style.opacity=1;

 // Keep the performance-based reward bonus, but do NOT interrupt play with a rank screen.
 const g=roomGrade();
 roomRewardMult*=g.bonus;
 coins+=Math.max(1,Math.floor(room*g.bonus*currentContract.mult));syncRunCoinsToBank();

 announce('ROOM CLEAR');
 audio.clear();
 ui();
}
function nextRoom(){
 if(room>=15){
  if(!save.completedDungeons.includes(dungeon))save.completedDungeons.push(dungeon);
  syncRunCoinsToBank();

  if(dungeon<DUNGEONS.length){
   save.unlockedDungeon=Math.max(save.unlockedDungeon,dungeon+1);
   dungeon++;
   save.selectedDungeon=dungeon;
   persist();

   room=1;roomCleared=false;gate=null;doorHint.style.opacity=0;
   currentContract=CONTRACTS[0];noHealNext=false;
   hero.hp=Math.min(hero.maxHp,hero.hp+Math.ceil(hero.maxHp*.35));
   announce('DUNGEON COMPLETE — '+dungeonById(dungeon).name.toUpperCase());
   buildRoom();ui();
   return;
  }

  // Final dungeon: stay in the game flow, but show completion and allow the final gate loop to end cleanly.
  persist();running=false;paused=false;roomCleared=false;gate=null;doorHint.style.opacity=0;
  announce('ALL DUNGEONS COMPLETE');
  renderDungeonSelect();renderProfiles();
  dungeonOverlay.classList.add('show');
  return;
 }
 room++;roomCleared=false;gate=null;doorHint.style.opacity=0;
 if(!noHealNext&&currentContract.id!=='noheal')hero.hp=Math.min(hero.maxHp,hero.hp+Math.ceil(hero.maxHp*.08*hero.healingPenalty));
 noHealNext=currentContract.id==='noheal';currentContract=CONTRACTS[0];
 if(room%4===0&&room%5!==0)showPathChoice();
 else if(room%3===0)showContracts();
 else buildRoom();
 announce('ROOM '+room);ui()
}
function showPathChoice(){
 paused=true;pathList.innerHTML='';
 const options=roomSystem.PATH_OPTIONS;
 options.forEach(o=>{
  const b=document.createElement('button');b.className='choice';
  b.innerHTML=`<strong>${o.name}</strong><span>${o.desc}</span>`;
  b.addEventListener('click',()=>{
   forcedRoomKind=o.kind;
   pathOverlay.classList.remove('show');
   paused=false;
   buildRoom();
   announce((o.kind||'NORMAL').toUpperCase()+' ROOM')
  });
  pathList.appendChild(b)
 });
 pathOverlay.classList.add('show')
}
function circleRectCollide(x,y,r,w){const cx=Math.max(w.x,Math.min(x,w.x+w.w)),cy=Math.max(w.y,Math.min(y,w.y+w.h));return(x-cx)**2+(y-cy)**2<r*r}
function projectileHitsWall(p){
 for(const w of walls){
   if(circleRectCollide(p.x,p.y,p.r||4,w))return true;
 }
 return false;
}
function projectilePathHitsWall(p,x0,y0,x1,y1){
 const dx=x1-x0,dy=y1-y0,dist=Math.hypot(dx,dy);
 const stepSize=Math.max(2,Math.min(5,(p.r||4)*.7));
 const steps=Math.max(1,Math.ceil(dist/stepSize));
 for(let i=1;i<=steps;i++){
   const t=i/steps,px=x0+dx*t,py=y0+dy*t;
   for(const w of walls){
     if(circleRectCollide(px,py,p.r||4,w))return true;
   }
 }
 return false;
}
function moveEnemyCollisionSafe(e,oldX,oldY,didTeleport=false){
 const targetX=e.x,targetY=e.y;
 // True teleporters may pass THROUGH walls, but may never finish inside one.
 if(didTeleport){
   if(obstacleCircle(targetX,targetY,e.r)){e.x=oldX;e.y=oldY}
   return;
 }
 e.x=oldX;e.y=oldY;
 const dx=targetX-oldX,dy=targetY-oldY;
 const dist=Math.hypot(dx,dy);
 const stepSize=Math.max(2.5,Math.min(6,e.r*.35));
 const steps=Math.max(1,Math.ceil(dist/stepSize));
 const sx=dx/steps,sy=dy/steps;
 for(let i=0;i<steps;i++){
   const nx=e.x+sx;
   if(!obstacleCircle(nx,e.y,e.r))e.x=nx;
   const ny=e.y+sy;
   if(!obstacleCircle(e.x,ny,e.r))e.y=ny;
 }
}

function pushEnemyAwayFromWalls(e,dt){
 const clearance=e.r+24;
 let pushX=0,pushY=0;

 for(const w of walls){
  const cx=Math.max(w.x,Math.min(e.x,w.x+w.w));
  const cy=Math.max(w.y,Math.min(e.y,w.y+w.h));
  let dx=e.x-cx,dy=e.y-cy;
  let dist=Math.hypot(dx,dy);

  // If the center is aligned inside the rectangle on one axis, choose the nearest outward side.
  if(dist<0.001){
   const left=Math.abs(e.x-w.x),right=Math.abs((w.x+w.w)-e.x);
   const top=Math.abs(e.y-w.y),bottom=Math.abs((w.y+w.h)-e.y);
   const min=Math.min(left,right,top,bottom);
   if(min===left){dx=-1;dy=0}
   else if(min===right){dx=1;dy=0}
   else if(min===top){dx=0;dy=-1}
   else{dx=0;dy=1}
   dist=1;
  }

  if(dist<clearance){
   const strength=(clearance-dist)/clearance;
   pushX+=(dx/dist)*strength;
   pushY+=(dy/dist)*strength;
  }
 }

 const mag=Math.hypot(pushX,pushY);
 if(mag>0.001){
  // Wall avoidance intentionally wins over chase AI when an enemy gets close.
  const force=e.speed*2.4*dt;
  e.x+=(pushX/mag)*force;
  e.y+=(pushY/mag)*force;
 }
}

function enforceEnemyWallClearance(e){
 const pad=10;
 for(const w of walls){
  const left=w.x-e.r-pad,right=w.x+w.w+e.r+pad;
  const top=w.y-e.r-pad,bottom=w.y+w.h+e.r+pad;
  if(e.x>left&&e.x<right&&e.y>top&&e.y<bottom){
   const dl=e.x-left,dr=right-e.x,dtp=e.y-top,db=bottom-e.y;
   const m=Math.min(dl,dr,dtp,db);
   if(m===dl)e.x=left;
   else if(m===dr)e.x=right;
   else if(m===dtp)e.y=top;
   else e.y=bottom;
  }
 }
}

function heroHitCircles(){return playerSystem.hitCircles(hero)}
function projectileHitsHero(p){return playerSystem.projectileHits(hero,p)}
function enemyTouchesHero(e){return playerSystem.enemyTouches(hero,e)}
function heroMovementRadius(){return playerSystem.movementRadius()}

// MP4B: enemy targeting + player-specific enemy damage.
function combatPlayers(){
 return players.filter(p=>p.enabled&&p.hero&&p.hero.hp>0);
}
function getEnemyTargetPlayer(e){
 let best=null,bestD=Infinity;
 for(const p of combatPlayers()){
  const dx=p.hero.x-e.x,dy=p.hero.y-e.y,d=dx*dx+dy*dy;
  if(d<bestD){bestD=d;best=p}
 }
 if(best)e.targetPlayerId=best.id;
 return best;
}
function projectileHitsPlayer(player,projectile){
 return !!(player&&player.enabled&&player.hero&&player.hero.hp>0&&playerSystem.projectileHits(player.hero,projectile));
}
function enemyTouchesPlayer(player,e){
 return !!(player&&player.enabled&&player.hero&&player.hero.hp>0&&playerSystem.enemyTouches(player.hero,e));
}
function updateDanger(dt){
 let proximity=0;
 for(const e of enemies){
  const d=Math.hypot(e.x-hero.x,e.y-hero.y);
  if(d<110)proximity+=((110-d)/110)*24*dt;
 }
 danger+=proximity;
 if(moveMagnitude<.08)danger-=1.6*dt;
 else danger-=.6*dt;
 danger=Math.max(0,Math.min(100,danger));peakDanger=Math.max(peakDanger,danger)
}
function update(dt){
 if(!running||paused||dead)return;
 roomTimer-=dt;
 if(roomTimer<=0&&!smoke&&!treasureRoomActive){smoke=true;announce('POISON GAS!');timerCard.classList.add('smoke')}
 if(smoke){
  smokeOpacity=Math.min(.72,smokeOpacity+dt*.055);
  smokeClock-=dt;
  if(smokeClock<=0){damageHero(Math.max(2,hero.maxHp*.035)*(hero.poisonVulnerability||1),'smoke');smokeClock=.8}
 }
 compatPlayerIndex=0;
 const {dx,dy}=input.getVectorFor(players[0].controlScheme);
 const mag=Math.hypot(dx,dy);players[0].moveMagnitude=mag;
 if(mag>.05){
  playerSystem.move(players[0].hero,dx,dy,dt,{W,H,walls,circleRectCollide});
 }
 players[0].hero.attackAnim=Math.max(0,players[0].hero.attackAnim-dt);
 players[0].hero.hitFlash=Math.max(0,players[0].hero.hitFlash-dt);

 // MP4B: Player 2 keeps independent movement/render state.
 // Enemy targeting and enemy damage are now player-specific; P2 attacks/XP remain disabled.
 if(players[1].enabled){
  const v2=input.getVectorFor(players[1].controlScheme);
  const mag2=Math.hypot(v2.dx,v2.dy);players[1].moveMagnitude=mag2;
  if(mag2>.05){
   playerSystem.move(players[1].hero,v2.dx,v2.dy,dt,{W,H,walls,circleRectCollide});
  }
  players[1].hero.attackAnim=Math.max(0,players[1].hero.attackAnim-dt);
  players[1].hero.hitFlash=Math.max(0,players[1].hero.hitFlash-dt);
 }
 updateDanger(dt);
 if(moveMagnitude>.1){
  const trailDef=TRAILS.find(t=>t.id===save.equipped.trail);
  if(trailDef&&trailDef.id!=='none'&&Math.random()<.4)particles.push({x:hero.x+(Math.random()-.5)*6,y:hero.y+8+(Math.random()-.5)*6,vx:(Math.random()-.5)*10,vy:20+Math.random()*10,life:.4,color:trailDef.color});
 }
 if(hero.passive==='engineer')engineerHeat=Math.max(0,engineerHeat-18*dt);
 fireClock-=dt;if(mag<.08&&fireClock<=0&&enemies.length)fireHero();

 for(const s of shots){
  const ox=s.x,oy=s.y;
  s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;
  if(projectilePathHitsWall(s,ox,oy,s.x,s.y))s.life=-1;
 }
 for(const b of enemyShots){
  const ox=b.x,oy=b.y;
  b.x+=b.vx*dt;b.y+=b.vy*dt;
  if(!b.wallPierce&&projectilePathHitsWall(b,ox,oy,b.x,b.y)){b.dead=true;continue;}
  const d=Math.hypot(b.x-hero.x,b.y-hero.y);
  if(!b.near&&d<34+b.r&&d>16+b.r){b.near=true;danger=Math.min(100,danger+7);peakDanger=Math.max(peakDanger,danger)}
 }
 enemySystem.updateAll({
  enemies,players,hero,dt,room,dungeon,W,H,enemyShots,
  audio,announce,addShake,spawnEnemy,spawnExplosion,
  obstacleCircle,pushEnemyAwayFromWalls,moveEnemyCollisionSafe,
  enforceEnemyWallClearance,
  getTargetPlayer:getEnemyTargetPlayer,
  enemyTouchesPlayer,
  damagePlayer
 });
 roomSystem.updateHazards(hazards,hero,dt,{W,H,damageHero});
 for(const w of wraiths){
  w.life-=dt;w.cd-=dt;const t=nearestEnemy(w.x,w.y);if(t){const a=Math.atan2(t.y-w.y,t.x-w.x);w.x+=Math.cos(a)*100*dt;w.y+=Math.sin(a)*100*dt;if(w.cd<=0){shots.push({x:w.x,y:w.y,vx:Math.cos(a)*430,vy:Math.sin(a)*430,r:4,damage:hero.damage*.45,pierce:0,crit:false,life:1.4,type:'wraith'});w.cd=.7}}
 }
 wraiths=wraiths.filter(w=>w.life>0);

 for(const s of shots){
  if(s.life<=0)continue;
  for(const e of enemies){
   if(Math.hypot(s.x-e.x,s.y-e.y)<s.r+e.r){
    const dealt=devInfiniteDamage?1e12:s.damage*(1-(e.armor||0));
    e.hp-=dealt;e.hurt=.08;e.knockX=(e.knockX||0)+Math.cos(s.ang||0)*3;e.knockY=(e.knockY||0)+Math.sin(s.ang||0)*3;s.life=-1;if(s.pierce>0){s.pierce--;s.life=.7}
    if(hero.lifesteal)hero.hp=Math.min(hero.maxHp,hero.hp+dealt*hero.lifesteal*hero.healingPenalty);
    if(s.crit){audio.crit();floatText(e.x,e.y-24,devInfiniteDamage?'∞':Math.round(dealt),'#ffd166')}else audio.hit();
    if(hero.arrowStorm&&Math.random()<hero.arrowStorm){
     for(let k=0;k<4;k++){const ang=Math.random()*Math.PI*2;shots.push({x:e.x,y:e.y,vx:Math.cos(ang)*hero.bulletSpeed*.8,vy:Math.sin(ang)*hero.bulletSpeed*.8,r:4,damage:hero.damage*.5,pierce:0,crit:false,life:.6,type:hero.weapon})}
     floatText(e.x,e.y-36,'ARROW STORM','#ffd166')
    }
    if(hero.chainChance&&Math.random()<hero.chainChance){
     let chainTarget=null,bd=1e12;
     for(const o of enemies){if(o===e)continue;const d=(o.x-e.x)**2+(o.y-e.y)**2;if(d<220*220&&d<bd){bd=d;chainTarget=o}}
     if(chainTarget){const cd=devInfiniteDamage?1e12:s.damage*.5;chainTarget.hp-=cd;chainTarget.hurt=.08;if(chainTarget.hp<=0)chainTarget.dead=true;
      chainFx.push({x1:e.x,y1:e.y,x2:chainTarget.x,y2:chainTarget.y,life:.15})}
    }
    if(e.hp<=0)e.dead=true;break
   }
  }
 }
 const killed=enemies.filter(e=>e.dead);enemies=enemies.filter(e=>!e.dead);killed.forEach(killEnemy);
 for(const b of enemyShots){
  if(b.dead)continue;
  for(const player of combatPlayers()){
   if(projectileHitsPlayer(player,b)){
    b.dead=true;
    damagePlayer(player,b.damage,'projectile');
    break;
   }
  }
 }
 enemyShots=enemyShots.filter(b=>!b.dead&&b.x>-30&&b.x<W+30&&b.y>30&&b.y<H+30);
 shots=shots.filter(s=>s.life>0&&s.x>-30&&s.x<W+30&&s.y>30&&s.y<H+30);
 particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt});particles=particles.filter(p=>p.life>0);
 chainFx.forEach(c=>c.life-=dt);chainFx=chainFx.filter(c=>c.life>0);
 effects.shake=Math.max(0,effects.shake-dt*44);
 for(const p of potions){
  if(!p.taken&&Math.hypot(p.x-hero.x,p.y-hero.y)<p.r+12){
   p.taken=true;
   const heal=Math.ceil(hero.maxHp*.35*hero.healingPenalty);
   hero.hp=Math.min(hero.maxHp,hero.hp+heal);
   floatText(hero.x,hero.y-30,'+'+heal+' HP','#59d88b');
   audio.levelup();ui()
  }
 }
 potions=potions.filter(p=>!p.taken);
 if(chest&&!chest.opened&&Math.hypot(hero.x-chest.x,hero.y-chest.y)<chest.r+14){
  chest.opened=true;
  const bonus=18+room*3;
  coins+=bonus;
  potions.push({x:chest.x,y:chest.y-30,r:11,bob:0});
  for(let i=0;i<16;i++)particles.push({x:chest.x,y:chest.y,vx:(Math.random()-.5)*160,vy:(Math.random()-.5)*160,life:.6,color:'#ffd166'});
  addShake(5);audio.clear();
  floatText(chest.x,chest.y-40,'+'+bonus+' COINS','#ffd166');
  ui()
 }
 if(!enemies.length&&!roomCleared)completeRoom();

 // MP4C: either living player can trigger the room exit gate.
 if(roomCleared && gate){
   let entered=false;
   for(const player of combatPlayers()){
     const body=playerSystem.hitCircles(player.hero);
     for(const h of body){
       const rr=h.r+gate.r+10;
       if((h.x-gate.x)*(h.x-gate.x)+(h.y-gate.y)*(h.y-gate.y) < rr*rr){
         entered=true;
         break;
       }
     }
     if(entered)break;
   }
   if(entered){
     doorHint.style.opacity=0;
     gate=null; // prevent double-trigger before the next room initializes
     audio.gate();
     nextRoom();
     return;
   }
 }

 ui()
}

function seededNoise(i){
 // Stable per-room pseudo-random value so decoration does not flicker.
 const x=Math.sin((i+1)*12.9898 + room*78.233)*43758.5453;
 return x-Math.floor(x);
}
function drawDungeonBackdrop(){
 // Deep outer void
 const bg=ctx.createLinearGradient(0,0,0,H);
 bg.addColorStop(0,'#101b29');
 bg.addColorStop(.55,'#0b1420');
 bg.addColorStop(1,'#060a10');
 ctx.fillStyle=bg;
 ctx.fillRect(0,0,W,H);
 // Global Rift ambience: dark purple light underneath every dungeon theme.
 const purpleWash=ctx.createRadialGradient(W*.48,H*.42,25,W*.48,H*.42,Math.max(W,H)*.72);
 purpleWash.addColorStop(0,'rgba(105,62,160,.16)');
 purpleWash.addColorStop(.55,'rgba(58,28,91,.10)');
 purpleWash.addColorStop(1,'rgba(19,8,31,.16)');
 ctx.fillStyle=purpleWash;ctx.fillRect(0,0,W,H);
 const theme=dungeonById(dungeon).theme;
 if(theme==='ember'){const rg=ctx.createRadialGradient(W*.5,H*.25,20,W*.5,H*.25,H*.8);rg.addColorStop(0,'rgba(208,80,35,.30)');rg.addColorStop(1,'rgba(45,8,5,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H)}
 else if(theme==='verdant'){ctx.fillStyle='rgba(35,91,52,.22)';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(94,160,96,.28)';ctx.lineWidth=5;for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(i*97%W,0);ctx.bezierCurveTo(i*73%W,H*.3,(i*131)%W,H*.55,(i*59)%W,H);ctx.stroke()}}
 else if(theme==='astral'){const rg=ctx.createRadialGradient(W*.5,H*.35,10,W*.5,H*.35,H*.75);rg.addColorStop(0,'rgba(116,92,191,.28)');rg.addColorStop(1,'rgba(16,8,38,0)');ctx.fillStyle=rg;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(210,215,255,.45)';for(let i=0;i<34;i++){ctx.fillRect(seededNoise(i+300)*W,seededNoise(i+400)*H*.8,1.5,1.5)}}

 // Outer stone walls / side ledges
 ctx.fillStyle='#0b121b';
 ctx.fillRect(0,0,20,H);
 ctx.fillRect(W-20,0,20,H);
 ctx.fillStyle='#1b2938';
 ctx.fillRect(5,52,13,H-60);
 ctx.fillRect(W-18,52,13,H-60);

 // Main room floor
 const floorGrad=ctx.createLinearGradient(0,52,0,H);
 floorGrad.addColorStop(0,'#263a50');
 floorGrad.addColorStop(.55,'#182a3c');
 floorGrad.addColorStop(1,'#101b28');
 ctx.fillStyle=floorGrad;
 ctx.beginPath();
 ctx.moveTo(22,52);
 ctx.lineTo(W-22,52);
 ctx.lineTo(W-8,H-8);
 ctx.lineTo(8,H-8);
 ctx.closePath();
 ctx.fill();

 // Stone tile grid with alternating shading
 const tileH=54;
 for(let row=0,y=70;y<H-22;y+=tileH,row++){
   const alpha=.045 + (row%2)*.018;
   ctx.fillStyle=`rgba(190,215,235,${alpha})`;
   ctx.fillRect(16,y,W-32,tileH-2);

   ctx.strokeStyle='rgba(125,158,190,.16)';
   ctx.lineWidth=1;
   ctx.beginPath();
   ctx.moveTo(14,y);
   ctx.lineTo(W-14,y);
   ctx.stroke();

   const offset=(row%2)*34;
   for(let x=offset+30;x<W;x+=68){
     ctx.beginPath();
     ctx.moveTo(x,y);
     ctx.lineTo(x,y+tileH-2);
     ctx.stroke();
   }
 }

 // Floor cracks and debris — deterministic per room
 ctx.strokeStyle='rgba(8,13,18,.42)';
 ctx.lineWidth=2;
 for(let i=0;i<7;i++){
   const x=36+seededNoise(i)*Math.max(20,W-72);
   const y=120+seededNoise(i+20)*Math.max(80,H-250);
   ctx.beginPath();
   ctx.moveTo(x,y);
   ctx.lineTo(x+8+seededNoise(i+40)*18,y+7);
   ctx.lineTo(x+2+seededNoise(i+60)*24,y+18);
   ctx.stroke();
 }
 ctx.fillStyle='rgba(5,10,14,.32)';
 for(let i=0;i<14;i++){
   const x=28+seededNoise(i+80)*(W-56);
   const y=95+seededNoise(i+110)*(H-150);
   const r=1.5+seededNoise(i+140)*3;
   ctx.beginPath();
   ctx.arc(x,y,r,0,Math.PI*2);
   ctx.fill();
 }

 // Back wall / arch
 ctx.fillStyle='#152333';
 ctx.fillRect(28,28,W-56,29);
 ctx.fillStyle='#2e4257';
 ctx.fillRect(28,48,W-56,7);
 ctx.fillStyle='#0b121a';
 ctx.beginPath();
 ctx.arc(W/2,52,48,Math.PI,0);
 ctx.lineTo(W/2+48,54);
 ctx.lineTo(W/2-48,54);
 ctx.closePath();
 ctx.fill();
 ctx.strokeStyle='#3a526c';
 ctx.lineWidth=4;
 ctx.beginPath();
 ctx.arc(W/2,52,48,Math.PI,0);
 ctx.stroke();

 // Four pillars
 const pillars=[
   {x:34,y:102},{x:W-34,y:102},{x:45,y:H*.57},{x:W-45,y:H*.57}
 ];
 for(const p of pillars){
   ctx.fillStyle='rgba(0,0,0,.34)';
   ctx.fillRect(p.x-9,p.y+9,20,44);
   ctx.fillStyle='#2b3d50';
   ctx.fillRect(p.x-10,p.y,20,44);
   ctx.fillStyle='#435c75';
   ctx.fillRect(p.x-13,p.y-4,26,7);
   ctx.fillRect(p.x-13,p.y+40,26,7);
   ctx.fillStyle='rgba(180,205,225,.10)';
   ctx.fillRect(p.x-6,p.y+3,4,34);
 }

 // Torches with soft glow — denser, purple-tinted ambience
 const torchPoints=[
   {x:58,y:108},{x:W-58,y:108},
   {x:36,y:H*.40},{x:W-36,y:H*.40},
   {x:42,y:H*.69},{x:W-42,y:H*.69}
 ];
 for(let ti=0;ti<torchPoints.length;ti++){
   const tx=torchPoints[ti].x,ty=torchPoints[ti].y;
   const glow=ctx.createRadialGradient(tx,ty,2,tx,ty,72);
   glow.addColorStop(0,'rgba(255,181,82,.34)');
   glow.addColorStop(.42,'rgba(185,86,170,.14)');
   glow.addColorStop(1,'rgba(105,54,170,0)');
   ctx.fillStyle=glow;ctx.beginPath();ctx.arc(tx,ty,72,0,Math.PI*2);ctx.fill();

   ctx.strokeStyle='#6d4930';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(tx,ty+7);ctx.lineTo(tx,ty+28);ctx.stroke();
   const flicker=2+Math.sin(performance.now()*.013+ti*1.7)*2.2;
   ctx.fillStyle='#ffca62';ctx.beginPath();ctx.ellipse(tx,ty-flicker,5.5,10+flicker,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#ff7044';ctx.beginPath();ctx.ellipse(tx,ty+1,3.4,6.8,0,0,Math.PI*2);ctx.fill();
 }
 // Vignette
 const vg=ctx.createRadialGradient(W/2,H*.48,Math.min(W,H)*.18,W/2,H*.5,Math.max(W,H)*.72);
 vg.addColorStop(.35,'rgba(0,0,0,0)');
 vg.addColorStop(1,'rgba(0,0,0,.52)');
 ctx.fillStyle=vg;
 ctx.fillRect(0,0,W,H);
}

function drawArena(){
 ctx.clearRect(0,0,W,H);
 drawDungeonBackdrop();

 // Gameplay walls with heavier dimensional treatment
 for(const w of walls){
   ctx.fillStyle='rgba(0,0,0,.42)';
   ctx.fillRect(w.x+7,w.y+10,w.w,w.h+10);

   const wg=ctx.createLinearGradient(w.x,w.y,w.x,w.y+w.h);
   wg.addColorStop(0,'#59738e');
   wg.addColorStop(.28,'#405870');
   wg.addColorStop(1,'#293b50');
   ctx.fillStyle=wg;
   ctx.fillRect(w.x,w.y,w.w,w.h);

   ctx.fillStyle='#7189a0';
   ctx.fillRect(w.x,w.y,w.w,4);

   // Stone seams
   ctx.strokeStyle='rgba(10,18,25,.42)';
   ctx.lineWidth=1;
   for(let x=w.x+30;x<w.x+w.w;x+=34){
     ctx.beginPath();
     ctx.moveTo(x,w.y+3);
     ctx.lineTo(x,w.y+w.h-1);
     ctx.stroke();
   }
 }
}
function modelShadow(x,y,s=1,squash=1){ctx.fillStyle='rgba(0,0,0,.38)';ctx.beginPath();ctx.ellipse(x,y+16*s,18*s*squash,7*s*squash,0,0,Math.PI*2);ctx.fill()}
function drawHat(s){
 const hat=save.equipped.hat;
 if(hat==='crown'){ctx.fillStyle='#ffd166';ctx.beginPath();ctx.moveTo(-7*s,-27*s);ctx.lineTo(-7*s,-33*s);ctx.lineTo(-3*s,-29*s);ctx.lineTo(0,-34*s);ctx.lineTo(3*s,-29*s);ctx.lineTo(7*s,-33*s);ctx.lineTo(7*s,-27*s);ctx.closePath();ctx.fill()}
 else if(hat==='halo'){ctx.strokeStyle='#fff3b0';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,-33*s,7*s,2.6*s,0,0,Math.PI*2);ctx.stroke()}
 else if(hat==='horns'){ctx.fillStyle='#8a2f2f';ctx.beginPath();ctx.moveTo(-6*s,-26*s);ctx.lineTo(-10*s,-35*s);ctx.lineTo(-3*s,-27*s);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(6*s,-26*s);ctx.lineTo(10*s,-35*s);ctx.lineTo(3*s,-27*s);ctx.closePath();ctx.fill()}
 else if(hat==='bandana'){ctx.fillStyle='#c23b3b';ctx.fillRect(-8*s,-24*s,16*s,4*s)}
}
function drawPet(){
 const pet=PETS.find(p=>p.id===save.equipped.pet);
 if(!pet||pet.id==='none')return;
 const t=performance.now()*.0022;
 const px=hero.x+Math.cos(t)*28,py=hero.y+Math.sin(t)*14-8;
 ctx.save();ctx.translate(px,py);
 ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,9,6,2.4,0,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=pet.color;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#0009';ctx.beginPath();ctx.arc(-2.2,-1,1.2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(2.2,-1,1.2,0,Math.PI*2);ctx.fill();
 ctx.restore()
}
function drawHeroModel(){
 const moving=moveMagnitude>.08,t=performance.now()*.008;
 const walkBob=moving?Math.abs(Math.sin(hero.walkCycle))*3.2:Math.sin(t)*.8;
 const bob=-walkBob;
 const x=hero.x,y=hero.y+bob,s=hero.passive==='assassin'?.92:1,fx=hero.facing||1;
 modelShadow(x,hero.y,s,moving?1-Math.abs(Math.sin(hero.walkCycle))*.12:1);
 ctx.save();ctx.translate(x,y);ctx.scale(fx,1);
 // legs — alternate stride while moving
 const strideL=moving?Math.sin(hero.walkCycle)*5:0,strideR=moving?Math.sin(hero.walkCycle+Math.PI)*5:0;
 ctx.fillStyle='#283849';ctx.fillRect(-9*s,7*s+strideL*.3,7*s,13*s);ctx.fillRect(2*s,7*s+strideR*.3,7*s,13*s);
 // torso
 const outfit=OUTFITS.find(o=>o.id===save.equipped.outfit);
 let body=(outfit&&outfit.color)||(hero.passive==='mage'?'#6e52b8':hero.passive==='assassin'?'#293448':hero.passive==='engineer'?'#47606f':hero.passive==='necro'?'#3a3155':'#3f6fb5');
 if(hero.hitFlash>0)body='#ff5c5c';
 const lean=hero.attackAnim>0?(hero.weapon==='blades'?3:1.5):0;
 ctx.save();ctx.translate(lean,0);
 ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-12*s,8*s);ctx.lineTo(-9*s,-10*s);ctx.lineTo(9*s,-10*s);ctx.lineTo(12*s,8*s);ctx.closePath();ctx.fill();
 // shoulders / arms
 ctx.fillStyle='#243344';ctx.fillRect(-17*s,-7*s,7*s,16*s);ctx.fillRect(10*s,-7*s,7*s,16*s);
 // head
 ctx.fillStyle='#d8b18d';ctx.beginPath();ctx.arc(0,-18*s,8*s,0,Math.PI*2);ctx.fill();
 // hair/hood
 ctx.fillStyle=hero.passive==='assassin'?'#151a21':hero.passive==='mage'?'#281f3f':'#252b34';ctx.beginPath();ctx.arc(0,-21*s,8.5*s,Math.PI,0);ctx.fill();
 // hat
 drawHat(s);
 // ---- weapon + attack animation per class ----
 const A=hero.attackAnim,weap=hero.weapon;
 if(weap==='bow'){
  const draw_=A>0?Math.min(1,A/.14):0;
  ctx.strokeStyle='#d4a75c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(15*s,-3*s,9*s,-1.2,1.2);ctx.stroke();
  ctx.strokeStyle='#e8dcc0';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(15*s+Math.cos(-1.2)*9*s,-3*s+Math.sin(-1.2)*9*s);
  ctx.lineTo(15*s-draw_*7*s,-3*s);ctx.lineTo(15*s+Math.cos(1.2)*9*s,-3*s+Math.sin(1.2)*9*s);ctx.stroke();
 }
 if(weap==='staff'){
  const charge=A>0?Math.min(1,A/.22):0;
  ctx.strokeStyle='#9c7bff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(15*s,-13*s);ctx.lineTo(15*s,13*s);ctx.stroke();
  if(charge>0){ctx.strokeStyle=`rgba(203,170,255,${.3+.5*charge})`;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(15*s,-15*s,5*s+charge*4*s,0,Math.PI*2);ctx.stroke()}
  ctx.fillStyle='#cbaaff';ctx.beginPath();ctx.arc(15*s,-15*s,4*s,0,Math.PI*2);ctx.fill();
 }
 if(weap==='blaster'){
  ctx.fillStyle=engineerHeat>85?'#ff9d6b':'#9bd2ef';ctx.fillRect(10*s,-6*s,14*s,7*s);
  if(A>.08){ctx.fillStyle='#fff3b0';ctx.beginPath();ctx.arc(24*s,-2.5*s,4*s,0,Math.PI*2);ctx.fill()}
 }
 if(weap==='blades'){
  const swing=A>0?Math.min(1,A/.16):0;
  ctx.strokeStyle='#dbe7f7';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(-18*s,-2*s-swing*10);ctx.lineTo(-26*s-swing*6,7*s);ctx.moveTo(18*s,-2*s+swing*10);ctx.lineTo(26*s+swing*6,7*s);ctx.stroke();
 }
 if(weap==='orb'){
  ctx.fillStyle='#b97dff';ctx.beginPath();ctx.arc(17*s,-6*s,6*s,0,Math.PI*2);ctx.fill();
  if(A>0){ctx.strokeStyle='rgba(185,125,255,.6)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,4*s,16*s,0,Math.PI*2);ctx.stroke()}
 }
 if(hero.shield>0){ctx.strokeStyle='#77e4ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,27*s,0,Math.PI*2);ctx.stroke()}
 ctx.restore();
 ctx.restore()
}
function drawPlayerMarker(player,index,phase='before'){
 if(!player.enabled)return;
 const h=player.hero;
 const col=index===0?'#c9baff':'#ffd166';
 if(phase==='before'){
  ctx.save();ctx.strokeStyle=col;ctx.globalAlpha=.82;ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(h.x,h.y+13,22,8,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }else{
  ctx.save();ctx.font='700 11px system-ui, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='rgba(8,12,18,.78)';ctx.fillRect(h.x-14,h.y-43,28,15);
  ctx.fillStyle=col;ctx.fillText(player.label,h.x,h.y-35.5);ctx.restore();
 }
}
function drawEnemyModel(e){
 const cat=enemyMoveCat(e.type);
 e.bounceClock=e.bounceClock||0;
 const moving=e.type!=='shield'&&e.type!=='summoner';
 let bob=0,squash=1;
 if(cat==='hover'){bob=Math.sin(e.bounceClock*3)*3}
 else if(cat==='slime'){const c=(Math.sin(e.bounceClock*6)+1)/2;squash=1+c*.22;bob=-c*4}
 else if(cat==='heavy'){const c=Math.abs(Math.sin(e.bounceClock*3.2));bob=-c*3;squash=1-c*.08}
 else if(cat==='fast'){const c=Math.abs(Math.sin(e.bounceClock*11));bob=-c*4.5}
 else if(cat==='light'){const c=Math.abs(Math.sin(e.bounceClock*7.5));bob=-c*2.6}
 const x=e.x,y=e.y+bob,s=e.type==='boss'?1.55:e.type==='mini'?.72:1;
 modelShadow(e.x,e.y,s,squash);
 ctx.save();ctx.translate(x,y);
 let body=e.type==='shooter'?'#8b55c5':e.type==='splitter'?'#b65f39':e.type==='bomber'?'#d3652f':e.type==='emberling'?'#d76a3e':e.type==='charger'?'#a64e36':e.type==='shield'?'#6d7b8e':e.type==='teleporter'?'#6656a0':e.type==='stalker'?'#4d8a55':e.type==='spore'?'#709d4f':e.type==='orbiter'?'#6e68b5':e.type==='summoner'?'#795aa3':e.type==='sniper'?'#4f6f8f':
  e.type==='boss'?(e.bossKind==='brute'?'#c2452f':e.bossKind==='reaper'?'#5b3b8c':'#9c3349'):e.type==='mini'?'#b89435':'#3d8f63';
 if(e.hurt>0)body='#ffffff';
 ctx.scale(1,squash);
 if(e.type==='splitter'||e.type==='mini'){
  // slime: gelatinous blob silhouette, no legs
  ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,0,13*s,15*s,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(-4*s,-6*s,4*s,3*s,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1c1420';ctx.beginPath();ctx.arc(-4*s,-2*s,1.6*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4*s,-2*s,1.6*s,0,Math.PI*2);ctx.fill();
 } else if(e.type==='sniper'||e.type==='teleporter'){
  // floating ghost/wraith: no legs, tattered robe base
  ctx.globalAlpha=.92;
  ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-11*s,10*s);ctx.quadraticCurveTo(-14*s,-6*s,0,-20*s);ctx.quadraticCurveTo(14*s,-6*s,11*s,10*s);
  ctx.quadraticCurveTo(6*s,4*s,3*s,10*s);ctx.quadraticCurveTo(0,4*s,-3*s,10*s);ctx.quadraticCurveTo(-6*s,4*s,-11*s,10*s);ctx.closePath();ctx.fill();
  ctx.globalAlpha=1;
  ctx.fillStyle='#ffde73';ctx.beginPath();ctx.arc(-4*s,-10*s,2.4*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4*s,-10*s,2.4*s,0,Math.PI*2);ctx.fill();
  if(e.type==='sniper'){ctx.strokeStyle='#cfe3ff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(9*s,-4*s);ctx.lineTo(24*s,-4*s);ctx.stroke()}
 } else if(e.type==='bomber'){
  // small round demon with a fuse
  ctx.fillStyle=body;ctx.beginPath();ctx.arc(0,0,13*s,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a1810';ctx.beginPath();ctx.moveTo(-5*s,-9*s);ctx.lineTo(-9*s,-16*s);ctx.lineTo(-2*s,-11*s);ctx.fill();ctx.beginPath();ctx.moveTo(5*s,-9*s);ctx.lineTo(9*s,-16*s);ctx.lineTo(2*s,-11*s);ctx.fill();
  ctx.fillStyle='#ffde73';ctx.beginPath();ctx.arc(-4*s,-1*s,2*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4*s,-1*s,2*s,0,Math.PI*2);ctx.fill();
  if(e.fuseCd<.6&&Math.sin(performance.now()*.03)>0){ctx.globalAlpha=.6;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-4*s,15*s,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 } else if(e.type==='shooter'){
  // robed cultist: hood + staff
  ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-13*s,14*s);ctx.lineTo(-9*s,-14*s);ctx.lineTo(9*s,-14*s);ctx.lineTo(13*s,14*s);ctx.closePath();ctx.fill();
  ctx.fillStyle='#241a33';ctx.beginPath();ctx.arc(0,-19*s,8*s,Math.PI,0);ctx.fill();ctx.fillRect(-8*s,-19*s,16*s,7*s);
  ctx.fillStyle='#cfa3ff';ctx.fillRect(13*s,-16*s,3*s,26*s);
 } else if(e.type==='charger'){
  // horned beast, low wide stance
  ctx.fillStyle='#1b252c';ctx.fillRect(-11*s,4*s,8*s,11*s);ctx.fillRect(3*s,4*s,8*s,11*s);
  ctx.fillStyle=body;ctx.fillRect(-14*s,-8*s,28*s,16*s);
  ctx.fillStyle='#efe3c8';ctx.beginPath();ctx.moveTo(-10*s,-8*s);ctx.lineTo(-16*s,-18*s);ctx.lineTo(-6*s,-10*s);ctx.fill();
  ctx.beginPath();ctx.moveTo(10*s,-8*s);ctx.lineTo(16*s,-18*s);ctx.lineTo(6*s,-10*s);ctx.fill();
 } else if(e.type==='shield'){
  ctx.fillStyle='#1b252c';ctx.fillRect(-9*s,6*s,7*s,12*s);ctx.fillRect(2*s,6*s,7*s,12*s);
  ctx.fillStyle=body;ctx.fillRect(-12*s,-9*s,24*s,21*s);
  ctx.fillStyle='#aeb9c8';ctx.fillRect(-19*s,-13*s,9*s,26*s);ctx.strokeStyle='#5b6577';ctx.lineWidth=1.4;ctx.strokeRect(-19*s,-13*s,9*s,26*s);
  ctx.fillStyle='#ffde73';ctx.fillRect(4*s,-18*s,4*s,3*s);ctx.fillRect(9*s,-18*s,4*s,3*s);
 } else if(e.type==='stalker'){
  ctx.fillStyle='#1b252c';ctx.fillRect(-9*s,6*s,6*s,11*s);ctx.fillRect(-1*s,7*s,6*s,10*s);ctx.fillRect(4*s,6*s,6*s,11*s);
  ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(0,-2*s,13*s,9*s,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffde73';ctx.beginPath();ctx.arc(9*s,-3*s,2*s,0,Math.PI*2);ctx.fill();
 } else if(e.type==='spore'){
  ctx.fillStyle=body;ctx.beginPath();ctx.arc(0,-2*s,14*s,Math.PI,0);ctx.fill();ctx.fillRect(-8*s,-2*s,16*s,12*s);
  ctx.fillStyle='#c8e6a0';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(-8*s+i*5.5*s,-8*s+(i%2)*3*s,2*s,0,Math.PI*2);ctx.fill()}
 } else if(e.type==='orbiter'){
  ctx.strokeStyle=body;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,14*s,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(0,-13*s);ctx.lineTo(11*s,0);ctx.lineTo(0,13*s);ctx.lineTo(-11*s,0);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffde73';ctx.beginPath();ctx.arc(0,0,3*s,0,Math.PI*2);ctx.fill();
 } else if(e.type==='summoner'){
  ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-13*s,15*s);ctx.lineTo(-7*s,-18*s);ctx.lineTo(7*s,-18*s);ctx.lineTo(13*s,15*s);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(216,206,255,.6)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,4*s,17*s+Math.sin(performance.now()*.004)*2,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#ffde73';ctx.beginPath();ctx.arc(-4*s,-14*s,2*s,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4*s,-14*s,2*s,0,Math.PI*2);ctx.fill();
 } else if(e.type==='boss'){
  ctx.fillStyle='#1b252c';ctx.fillRect(-13*s,8*s,10*s,16*s);ctx.fillRect(3*s,8*s,10*s,16*s);
  ctx.fillStyle=body;ctx.fillRect(-17*s,-13*s,34*s,29*s);
  ctx.fillStyle='#5a1824';ctx.fillRect(-12*s,-30*s,24*s,17*s);
  ctx.fillStyle='#ffde73';ctx.fillRect(-8*s,-24*s,5*s,4*s);ctx.fillRect(3*s,-24*s,5*s,4*s);
  ctx.strokeStyle='#ff8aa0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-17*s,-27*s);ctx.lineTo(-27*s,-42*s);ctx.moveTo(17*s,-27*s);ctx.lineTo(27*s,-42*s);ctx.stroke();
  if(e.bossKind==='brute'&&e.charging){ctx.strokeStyle='rgba(255,150,90,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-6*s,26*s,0,Math.PI*2);ctx.stroke()}
  if(['pyromancer','oracle','voidlord'].includes(e.bossKind)){ctx.globalAlpha=.4+.3*Math.sin(performance.now()*.01);ctx.strokeStyle='#c9baff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,24*s,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1}
 } else {
  // ghoul (chaser) — hunched undead, uneven long limbs
  ctx.fillStyle='#1b252c';ctx.fillRect(-10*s,6*s,6*s,14*s);ctx.fillRect(3*s,6*s,6*s,11*s);
  ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-11*s,9*s);ctx.lineTo(-8*s,-6*s);ctx.lineTo(6*s,-11*s);ctx.lineTo(10*s,9*s);ctx.closePath();ctx.fill();
  ctx.fillStyle=body;ctx.fillRect(-16*s,-4*s,6*s,15*s);ctx.fillRect(9*s,-8*s,6*s,13*s);
  ctx.fillStyle='#273746';ctx.beginPath();ctx.ellipse(-1*s,-16*s,7*s,6.5*s,-.15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffde73';ctx.fillRect(-6*s,-17*s,3.5*s,3*s);ctx.fillRect(0,-17*s,3.5*s,3*s);
 }
 ctx.restore();
 // hp
 ctx.fillStyle='#081018';ctx.fillRect(e.x-22*s,e.y-34*s,44*s,5);ctx.fillStyle=e.type==='boss'?'#ff5c75':'#ff7373';ctx.fillRect(e.x-22*s,e.y-34*s,44*s*(e.hp/e.maxHp),5);
 if(e.elite){
  const mod=ELITE_MODIFIERS.find(m=>m.id===e.elite);
  ctx.save();ctx.strokeStyle=mod?mod.color:'#ffd166';ctx.lineWidth=2.2;ctx.globalAlpha=.55+.3*Math.sin(performance.now()*.006+e.x);
  ctx.beginPath();ctx.arc(e.x,e.y-2,e.r*1.65,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.restore()
 }
}
function enemyMoveCat(type){return enemySystem.movementCategory(type)}
function drawBeastPreview(c,key){
 let body='#4d8d67',r=24;
 if(key&&key.includes('boss_')){body='#9c3d52';r=34}
 if(['sniper','teleporter','orbiter'].includes(key))body='#6079a8';
 if(['bomber','emberling','charger'].includes(key)||(key&&/wyrm|forge|pyromancer/.test(key)))body='#c96039';
 if(['stalker','spore'].includes(key)||(key&&/basilisk|warden|hivequeen/.test(key)))body='#5e9a61';
 if(key==='shield')body='#66778c';if(key==='summoner'||(key&&/oracle|voidlord/.test(key)))body='#7559a7';
 if(key==='splitter'||key==='mini'){
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,r*.75,r*.7,8,0,0,Math.PI*2);c.fill();
  c.fillStyle='#b65f39';c.beginPath();c.ellipse(0,0,r*.75,r*.85,0,0,Math.PI*2);c.fill();
  c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.ellipse(-r*.25,-r*.35,r*.22,r*.16,0,0,Math.PI*2);c.fill();
  return;
 }
 if(key==='sniper'||key==='teleporter'){
  c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(0,r*.7,r*.6,7,0,0,Math.PI*2);c.fill();
  c.globalAlpha=.9;c.fillStyle=body;c.beginPath();c.moveTo(-r*.6,r*.55);c.quadraticCurveTo(-r*.75,-r*.35,0,-r*1.1);c.quadraticCurveTo(r*.75,-r*.35,r*.6,r*.55);c.closePath();c.fill();c.globalAlpha=1;
  c.fillStyle='#ffde73';c.beginPath();c.arc(-r*.2,-r*.5,4,0,Math.PI*2);c.fill();c.beginPath();c.arc(r*.2,-r*.5,4,0,Math.PI*2);c.fill();
  return;
 }
 if(key==='shooter'){
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,r*.85,r*.7,8,0,0,Math.PI*2);c.fill();
  c.fillStyle=body;c.beginPath();c.moveTo(-r*.7,r*.75);c.lineTo(-r*.5,-r*.75);c.lineTo(r*.5,-r*.75);c.lineTo(r*.7,r*.75);c.closePath();c.fill();
  c.fillStyle='#241a33';c.beginPath();c.arc(0,-r*1.05,r*.42,Math.PI,0);c.fill();
  return;
 }
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,28,r*.8,8,0,0,Math.PI*2);c.fill();
 c.fillStyle=body;c.fillRect(-r*.65,-r*.35,r*1.3,r*1.15);c.fillStyle='#283746';c.fillRect(-r*.45,-r*.95,r*.9,r*.55);
 c.fillStyle='#ffdf78';c.fillRect(-r*.26,-r*.75,6,4);c.fillRect(r*.08,-r*.75,6,4);
 if(key==='shield'){c.fillStyle='#aeb9c8';c.fillRect(-r-12,-r*.45,16,r*1.4)}
}
function drawGate(){
 if(!gate)return;ctx.save();ctx.translate(gate.x,gate.y);ctx.shadowBlur=18;ctx.shadowColor='#7da8ff';ctx.strokeStyle='#7da8ff';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,gate.r,Math.PI,0);ctx.lineTo(gate.r,18);ctx.lineTo(-gate.r,18);ctx.closePath();ctx.stroke();ctx.restore()
}
function drawPotions(){
 for(const p of potions){
  const bobY=Math.sin(performance.now()*.004+p.bob)*3;
  ctx.save();ctx.translate(p.x,p.y+bobY);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,10,7,2.4,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3a4a5c';ctx.fillRect(-5,-2,10,8);
  ctx.fillStyle='#ff5c6a';ctx.beginPath();ctx.moveTo(-5,-2);ctx.lineTo(5,-2);ctx.lineTo(4,6);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#8fa6bd';ctx.fillRect(-2,-7,4,5);
  ctx.strokeStyle='rgba(255,255,255,.4)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-2,1);ctx.lineTo(2,1);ctx.stroke();
  ctx.restore()
 }
}
function drawChest(){
 if(!chest)return;
 ctx.save();ctx.translate(chest.x,chest.y);
 if(!chest.opened){
  ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(0,17,20,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#5a3c22';ctx.fillRect(-18,-6,36,20);
  ctx.fillStyle='#7a5330';ctx.beginPath();ctx.moveTo(-18,-6);ctx.quadraticCurveTo(0,-22,18,-6);ctx.fill();
  ctx.fillStyle='#e8c04a';ctx.fillRect(-3,-4,6,10);
  ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=2;ctx.strokeRect(-18,-6,36,20);
 } else {
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,15,20,6,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a3018';ctx.fillRect(-18,-2,36,16);
  ctx.fillStyle='#6a4726';ctx.beginPath();ctx.moveTo(-18,-2);ctx.quadraticCurveTo(0,-28,18,-2);ctx.lineTo(14,-14);ctx.quadraticCurveTo(0,-22,-14,-14);ctx.closePath();ctx.fill();
  const glow=ctx.createRadialGradient(0,-8,2,0,-8,26);glow.addColorStop(0,'rgba(255,214,102,.5)');glow.addColorStop(1,'rgba(255,214,102,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-8,26,0,Math.PI*2);ctx.fill()
 }
 ctx.restore()
}
function drawTargetReticle(){
 if(!manualTarget||!enemies.includes(manualTarget))return;
 const t=manualTarget;
 ctx.save();ctx.strokeStyle='#ff5c5c';ctx.lineWidth=2;
 ctx.beginPath();ctx.arc(t.x,t.y,t.r+10,0,Math.PI*2);ctx.stroke();
 ctx.beginPath();ctx.moveTo(t.x-t.r-17,t.y);ctx.lineTo(t.x-t.r-9,t.y);ctx.moveTo(t.x+t.r+9,t.y);ctx.lineTo(t.x+t.r+17,t.y);
 ctx.moveTo(t.x,t.y-t.r-17);ctx.lineTo(t.x,t.y-t.r-9);ctx.moveTo(t.x,t.y+t.r+9);ctx.lineTo(t.x,t.y+t.r+17);ctx.stroke();
 ctx.restore()
}
function drawTelegraphs(){
 for(const e of enemies){
  if(e.type==='sniper'&&e.telegraph){
   const len=1400,ex=e.x+Math.cos(e.aimAngle)*len,ey=e.y+Math.sin(e.aimAngle)*len;
   const alpha=.22+.35*Math.abs(Math.sin(performance.now()*.02));
   ctx.strokeStyle=`rgba(255,90,90,${alpha})`;ctx.lineWidth=2;
   ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(ex,ey);ctx.stroke()
  }
 }
}
function drawArrow(s){
 // Real arrow: shaft, triangular head, fletching, oriented along travel direction.
 const ang=Math.atan2(s.vy,s.vx),len=Math.max(16,(s.r||5)*3.4);
 ctx.save();ctx.translate(s.x,s.y);ctx.rotate(ang);
 ctx.strokeStyle=s.crit?'#ffd166':'#c79a5c';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(-len*.55,0);ctx.lineTo(len*.32,0);ctx.stroke();
 ctx.fillStyle=s.crit?'#ffe38a':'#dfe7f2';
 ctx.beginPath();ctx.moveTo(len*.55,0);ctx.lineTo(len*.22,-4);ctx.lineTo(len*.22,4);ctx.closePath();ctx.fill();
 ctx.fillStyle=s.crit?'#ffb347':'#8a6a3c';
 ctx.beginPath();ctx.moveTo(-len*.55,0);ctx.lineTo(-len*.38,-4.5);ctx.lineTo(-len*.3,0);ctx.lineTo(-len*.38,4.5);ctx.closePath();ctx.fill();
 if(s.crit){ctx.strokeStyle='rgba(255,214,102,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,len*.7,0,Math.PI*2);ctx.stroke()}
 ctx.restore()
}
function drawHazards(){
 roomSystem.drawHazards(ctx,hazards,performance.now());
}
function draw(){
 ctx.save();
 if(effects.shake>.15){ctx.translate((Math.random()-.5)*effects.shake,(Math.random()-.5)*effects.shake)}
 drawArena();drawGate();
 drawChest();drawPotions();
 drawHazards();
 if(eliteRoomActive){ctx.fillStyle='rgba(150,20,30,.09)';ctx.fillRect(0,0,W,H)}
 drawTelegraphs();
 drawTargetReticle();
 for(const s of shots){
  if(s.type==='bow'){
   ctx.save();ctx.globalAlpha=.4;ctx.strokeStyle=s.crit?'#ffd166':'#c79a5c';ctx.lineWidth=1.6;
   ctx.beginPath();ctx.moveTo(s.x-s.vx*.02,s.y-s.vy*.02);ctx.lineTo(s.x,s.y);ctx.stroke();ctx.globalAlpha=1;ctx.restore();
   drawArrow(s);
   continue;
  }
  ctx.save();ctx.globalAlpha=.34;ctx.strokeStyle=s.crit?'#ffd166':'#a7d6ff';ctx.lineWidth=Math.max(2,s.r*.7);ctx.beginPath();ctx.moveTo(s.x-s.vx*.018,s.y-s.vy*.018);ctx.lineTo(s.x,s.y);ctx.stroke();ctx.globalAlpha=1;ctx.shadowBlur=8;ctx.shadowColor=s.crit?'#ffd166':'#a7d6ff';ctx.fillStyle=s.crit?'#ffd166':s.type==='staff'?'#bc83ff':s.type==='wraith'?'#8ce5d0':'#b8ddff';ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();ctx.restore()
 }
 for(const b of enemyShots){ctx.fillStyle='#ff6e78';ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill()}
 enemies.forEach(drawEnemyModel);
 for(const w of wraiths){ctx.globalAlpha=Math.max(.25,w.life/7);ctx.fillStyle='#8ce5d0';ctx.beginPath();ctx.arc(w.x,w.y,10,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 players.forEach((p,i)=>{if(p.enabled)drawPlayerMarker(p,i,'before')});
 players.forEach((p,i)=>{
  if(!p.enabled)return;
  withPlayerState(i,()=>drawHeroModel());
  drawPlayerMarker(p,i,'after');
 });
 withPlayerState(0,()=>drawPet());
 compatPlayerIndex=0;
 for(const c of chainFx){ctx.globalAlpha=Math.max(0,c.life/.15);ctx.strokeStyle='#ffd666';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(c.x1,c.y1);ctx.lineTo(c.x2,c.y2);ctx.stroke()}ctx.globalAlpha=1;
 for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/.45);ctx.fillStyle=p.color||'#ffd56e';ctx.fillRect(p.x,p.y,3,3)}ctx.globalAlpha=1;
 // danger aura
 const p1=players[0];
 if(p1.danger>2){
  const glowR=38+p1.danger*.9,alpha=Math.min(.5,p1.danger/100*.5),h=p1.hero;
  const glow=ctx.createRadialGradient(h.x,h.y,4,h.x,h.y,glowR);
  glow.addColorStop(0,`rgba(255,150,60,${alpha})`);glow.addColorStop(1,'rgba(255,150,60,0)');
  ctx.fillStyle=glow;ctx.beginPath();ctx.arc(h.x,h.y,glowR,0,Math.PI*2);ctx.fill();
 }
 // poison gas
 if(smoke){
   const grd=ctx.createRadialGradient(W/2,H/2,40,W/2,H/2,Math.max(W,H)*.7);
   grd.addColorStop(0,`rgba(104,150,72,${smokeOpacity*.40})`);grd.addColorStop(1,`rgba(24,55,24,${smokeOpacity})`);
   ctx.fillStyle=grd;ctx.fillRect(0,0,W,H);
   ctx.fillStyle=`rgba(181,255,145,${smokeOpacity*.11})`;
   for(let i=0;i<10;i++){const x=(i*73+performance.now()*.018)%W,y=(i*113+performance.now()*.011)%H;ctx.beginPath();ctx.arc(x,y,26+(i%3)*10,0,Math.PI*2);ctx.fill()}
 }
 ctx.restore();
 requestAnimationFrame(loop)
}
function loop(now){const dt=Math.min(.033,(now-last)/1000||0);last=now;update(dt);draw()}

cvs.addEventListener('pointerdown',e=>{
 if(!running||paused||dead)return;
 const rect=cvs.getBoundingClientRect();
 const x=e.clientX-rect.left,y=e.clientY-rect.top;
 let best=null,bd=1e12;
 for(const en of enemies){
  const d=(en.x-x)*(en.x-x)+(en.y-y)*(en.y-y),rr=(en.r+20)*(en.r+20);
  if(d<rr&&d<bd){bd=d;best=en}
 }
 manualTarget=best;
 if(best)announce('TARGET LOCKED')
});

let manualPause=false;

mobileLayoutChoice.addEventListener('click',()=>{creatingDisplayMode='mobile';updateLayoutChoiceUI('mobile')});
desktopLayoutChoice.addEventListener('click',()=>{creatingDisplayMode='desktop';updateLayoutChoiceUI('desktop')});
settingsMobileLayout.addEventListener('click',()=>setCurrentProfileLayout('mobile'));
settingsDesktopLayout.addEventListener('click',()=>setCurrentProfileLayout('desktop'));

const multiBtn=$('multiBtn');
if(multiBtn){
 multiBtn.disabled=false;multiBtn.classList.remove('disabled');
 multiBtn.innerHTML='MULTIPLAYER <small>MP3 TEST</small>';
 multiBtn.addEventListener('click',()=>{coopTestMode=true;openProfiles()});
}
$('singleBtn').addEventListener('click',()=>{coopTestMode=false;openProfiles()});
$('charactersBtn').addEventListener('click',()=>{coopTestMode=false;openProfiles()});
$('bestiaryBtn').addEventListener('click',()=>{hubTab='bestiary';hubReturnTo='start';renderHub();startOverlay.classList.remove('show');hubOverlay.classList.add('show')});
$('cosmeticsBtn').addEventListener('click',()=>{hubTab='outfits';hubReturnTo='start';renderHub();startOverlay.classList.remove('show');hubOverlay.classList.add('show')});
$('settingsBtn').addEventListener('click',()=>{updateLayoutChoiceUI(activeProfileIndex>=0?save.displayMode:(window.innerWidth>=850?'desktop':'mobile'));startOverlay.classList.remove('show');settingsOverlay.classList.add('show')});
$('settingsBackBtn').addEventListener('click',()=>{settingsOverlay.classList.remove('show');startOverlay.classList.add('show')});

$('profileBackBtn').addEventListener('click',()=>{profileOverlay.classList.remove('show');startOverlay.classList.add('show')});
$('createProfileCancelBtn').addEventListener('click',()=>{createProfileOverlay.classList.remove('show');renderProfiles();profileOverlay.classList.add('show')});
$('createProfileBtn').addEventListener('click',()=>{
 const name=(profileNameInput.value||'Wanderer').trim().slice(0,16)||'Wanderer';
 const p=freshProfile(name,selected);p.displayMode=creatingDisplayMode;
 rootSave.profiles[creatingProfileIndex]=p;
 activeProfileIndex=creatingProfileIndex;save=p;dungeon=1;persist();applyLayoutMode(save.displayMode);updateLayoutChoiceUI(save.displayMode);
 createProfileOverlay.classList.remove('show');renderProfiles();profileOverlay.classList.add('show')
});
$('dungeonBackBtn').addEventListener('click',()=>{dungeonOverlay.classList.remove('show');renderProfiles();profileOverlay.classList.add('show')});
$('playBtn').addEventListener('click',()=>{audio.unlock();dungeon=save.selectedDungeon||1;resetRun()});
$('againBtn').addEventListener('click',resetRun);
$('homeBtn').addEventListener('click',()=>{running=false;deadOverlay.classList.remove('show');renderProfiles();startOverlay.classList.add('show')});
$('reviveBtn').addEventListener('click',()=>{if(revived)return;revived=true;hero.hp=Math.ceil(hero.maxHp*.55);dead=false;running=true;paused=false;smoke=false;smokeOpacity=0;roomTimer=Math.max(10,roomTimerMax*.24);enemyShots=[];deadOverlay.classList.remove('show');announce('REVIVED');ui()});

pauseBtn.addEventListener('click',()=>{
 if(!running||dead)return;
 if(skillOverlay.classList.contains('show')||contractOverlay.classList.contains('show')||pathOverlay.classList.contains('show'))return;
 manualPause=true;paused=true;pauseOverlay.classList.add('show')
});
$('resumeBtn').addEventListener('click',()=>{manualPause=false;paused=false;pauseOverlay.classList.remove('show')});
$('pauseHomeBtn').addEventListener('click',()=>{manualPause=false;paused=false;running=false;pauseOverlay.classList.remove('show');renderProfiles();startOverlay.classList.add('show')});
muteBtn.addEventListener('click',()=>{const on=!audio.isEnabled();audio.setEnabled(on);muteBtn.textContent=on?'🔊':'🔇'});

dungeon=save.selectedDungeon||1;
applyLayoutMode(activeProfileIndex>=0?save.displayMode:(window.innerWidth>=850?'desktop':'mobile'));
updateLayoutChoiceUI(activeProfileIndex>=0?save.displayMode:(window.innerWidth>=850?'desktop':'mobile'));
renderProfiles();renderDungeonSelect();ui();requestAnimationFrame(loop)
})();
