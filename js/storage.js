// Riftbound Arena save/profile storage
// Loaded before game.js.
window.RB_STORAGE = (() => {
  const LEGACY_SAVE='riftbound_v3';
  const SAVE='riftbound_character_profiles_v1';

  function freshProfile(name='Wanderer',fighter='Ranger'){
    return {
      name, best:0, bank:0, selected:fighter, displayMode:'mobile',
      unlockedDungeon:1, completedDungeons:[], selectedDungeon:1,
      unlocked:{outfits:['default'],hats:['none'],trails:['none'],pets:['none']},
      equipped:{outfit:'default',hat:'none',trail:'none',pet:'none'},
      seen:{}
    };
  }

  function normalizeProfile(p){
    p=p||freshProfile();
    p.name=p.name||'Wanderer';
    p.best=p.best||0;
    p.bank=p.bank||0;
    p.selected=p.selected||'Ranger';
    p.displayMode=(p.displayMode==='desktop'?'desktop':'mobile');
    p.unlockedDungeon=p.unlockedDungeon||1;
    p.completedDungeons=p.completedDungeons||[];
    p.selectedDungeon=p.selectedDungeon||1;
    p.unlocked=p.unlocked||{outfits:['default'],hats:['none'],trails:['none'],pets:['none']};
    p.equipped=p.equipped||{outfit:'default',hat:'none',trail:'none',pet:'none'};
    p.seen=p.seen||{};
    return p;
  }

  function load(){
    let rootSave={};
    try{rootSave=JSON.parse(localStorage.getItem(SAVE)||'{}')||{}}catch(e){rootSave={}}

    if(!Array.isArray(rootSave.profiles)){
      let legacy=null;
      try{legacy=JSON.parse(localStorage.getItem(LEGACY_SAVE)||'null')}catch(e){}
      rootSave={
        activeProfile:0,
        legacyMigrated:true,
        profiles:[
          legacy?normalizeProfile({...legacy,name:legacy.name||'Legacy Hero'}):freshProfile('Wanderer','Ranger'),
          null,null,null
        ]
      };
    }

    if(!rootSave.legacyMigrated)rootSave.legacyMigrated=true;
    clearLegacy();
    while(rootSave.profiles.length<4)rootSave.profiles.push(null);

    let activeProfileIndex=Number.isInteger(rootSave.activeProfile)?rootSave.activeProfile:0;
    if(
      activeProfileIndex<0 ||
      activeProfileIndex>3 ||
      !rootSave.profiles[activeProfileIndex]
    ){
      activeProfileIndex=rootSave.profiles.findIndex(Boolean);
    }

    let save=activeProfileIndex>=0
      ? normalizeProfile(rootSave.profiles[activeProfileIndex])
      : freshProfile('Wanderer','Ranger');

    if(activeProfileIndex>=0)rootSave.profiles[activeProfileIndex]=save;

    return {rootSave,activeProfileIndex,save};
  }

  function persist(rootSave,activeProfileIndex,save){
    rootSave.activeProfile=activeProfileIndex;
    if(activeProfileIndex>=0 && rootSave.profiles[activeProfileIndex]){
      rootSave.profiles[activeProfileIndex]=save;
    }
    localStorage.setItem(SAVE,JSON.stringify(rootSave));
  }

  function clearLegacy(){
    try{localStorage.removeItem(LEGACY_SAVE)}catch(e){}
  }

  return {
    LEGACY_SAVE,
    SAVE,
    freshProfile,
    normalizeProfile,
    load,
    persist,
    clearLegacy
  };
})();
