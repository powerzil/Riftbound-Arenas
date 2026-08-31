window.RB_DATA = (() => {
const OUTFITS=[
 {id:'default',name:'Default',cost:0,color:null},
 {id:'crimson',name:'Crimson Plate',cost:40,color:'#c23b3b'},
 {id:'azure',name:'Azure Silk',cost:40,color:'#3b7fc2'},
 {id:'emerald',name:'Emerald Cloak',cost:60,color:'#2f9e63'},
 {id:'golden',name:'Golden Regalia',cost:120,color:'#d4a72c'},
 {id:'void',name:'Void Wraps',cost:160,color:'#241a33'}
];

const HATS=[
 {id:'none',name:'None',cost:0},
 {id:'bandana',name:'Bandana',cost:35},
 {id:'horns',name:'Demon Horns',cost:90},
 {id:'crown',name:'Gilded Crown',cost:80},
 {id:'halo',name:'Halo',cost:100}
];

const TRAILS=[
 {id:'none',name:'None',cost:0},
 {id:'sparkle',name:'Sparkle Trail',cost:70,color:'#ffe38a'},
 {id:'ember',name:'Ember Trail',cost:70,color:'#ff8a5b'},
 {id:'frost',name:'Frost Trail',cost:70,color:'#8adfff'}
];

const PETS=[
 {id:'none',name:'None',cost:0},
 {id:'slime',name:'Slime Buddy',cost:90,color:'#6fd17a'},
 {id:'bat',name:'Shadow Bat',cost:110,color:'#7a6b9c'},
 {id:'wisp',name:'Wandering Wisp',cost:130,color:'#8adfff'},
 {id:'drake',name:'Baby Drake',cost:220,color:'#e0703f'}
];

const BESTIARY=[
 {key:'chaser',name:'Ghoul',desc:'A relentless shambler that beelines straight for you.'},
 {key:'shooter',name:'Cultist',desc:'Keeps its distance and hurls dark bolts.'},
 {key:'splitter',name:'Ooze',desc:'Splits into two Ooze Spawn when killed.'},
 {key:'mini',name:'Ooze Spawn',desc:'A fast, fragile remnant left behind by an Ooze.'},
 {key:'sniper',name:'Marksman Wraith',desc:'Telegraphs a red beam before firing a heavy shot — dodge the line.'},
 {key:'bomber',name:'Powder Imp',desc:'Rushes in close and detonates. Explodes on death too.'},
 {key:'boss_warlock',name:'The Warlock',desc:'Boss. Fires wide bullet spreads from range.'},
 {key:'boss_brute',name:'The Brute',desc:'Boss. Charges across the room for heavy melee damage.'},
 {key:'boss_reaper',name:'The Reaper',desc:'Boss. Summons waves of Ooze Spawn while sniping.'},
 {key:'emberling',name:'Emberling',desc:'Fast fire creature that hurls burning shots.'},
 {key:'charger',name:'Horned Charger',desc:'Lines up a charge, then rushes across the room.'},
 {key:'shield',name:'Bulwark',desc:'Carries a frontal shield and must be flanked.'},
 {key:'teleporter',name:'Blink Stalker',desc:'Teleports around the arena before striking.'},
 {key:'stalker',name:'Vine Stalker',desc:'Fast predator that circles before lunging.'},
 {key:'spore',name:'Spore Caster',desc:'Throws large toxic projectiles.'},
 {key:'orbiter',name:'Astral Orbiter',desc:'Moves sideways while firing rotating projectile patterns.'},
 {key:'summoner',name:'Rift Summoner',desc:'Creates temporary minions until defeated.'},
 {key:'boss_wyrm',name:'Magma Wyrm',desc:'Boss. Sweeps fire lanes and rushes the player.'},
 {key:'boss_forge',name:'Forge Titan',desc:'Boss. Slams the arena and launches radial molten shards.'},
 {key:'boss_pyromancer',name:'Ash Pyromancer',desc:'Boss. Teleports and fires dense flame spreads.'},
 {key:'boss_basilisk',name:'Verdant Basilisk',desc:'Boss. Charges and spits poison volleys.'},
 {key:'boss_warden',name:'Root Warden',desc:'Boss. Summons stalkers and fires from range.'},
 {key:'boss_hivequeen',name:'Hive Queen',desc:'Boss. Floods the arena with spores and hatchlings.'},
 {key:'boss_oracle',name:'Astral Oracle',desc:'Boss. Teleports and fires rotating projectile patterns.'},
 {key:'boss_colossus',name:'Star Colossus',desc:'Boss. Slow, massive shockwave attacks.'},
 {key:'boss_voidlord',name:'Void Lord',desc:'Boss. Teleports and unleashes heavy projectile storms.'}
];

const DUNGEONS=[
 {id:1,name:'The Fallen Keep',theme:'keep',desc:'Cold stone halls, cultists, ghouls and siege beasts.',enemies:['chaser','shooter','bomber','splitter','sniper'],bosses:['warlock','brute','reaper']},
 {id:2,name:'Ember Depths',theme:'ember',desc:'A volcanic prison filled with fireborn predators and molten machinery.',enemies:['emberling','charger','shooter','bomber','shield'],bosses:['wyrm','forge','pyromancer']},
 {id:3,name:'Verdant Ruins',theme:'verdant',desc:'Overgrown temples where poison, spores and ancient beasts rule.',enemies:['stalker','spore','teleporter','splitter','sniper'],bosses:['basilisk','warden','hivequeen']},
 {id:4,name:'Astral Vault',theme:'astral',desc:'A broken star-temple full of arcane constructs and gravity anomalies.',enemies:['orbiter','teleporter','shield','summoner','sniper'],bosses:['oracle','colossus','voidlord']}
];

const CHARACTERS={
 Ranger:{desc:'Balanced ranged fighter. Danger boosts attack speed.',weapon:'bow',hp:110,speed:205,damage:18,fireRate:.58,passive:'ranger'},
 Assassin:{desc:'Fast melee blades. Danger boosts dash-strike damage.',weapon:'blades',hp:95,speed:245,damage:24,fireRate:.48,passive:'assassin'},
 Mage:{desc:'Slower caster. Danger makes projectiles larger and stronger.',weapon:'staff',hp:90,speed:195,damage:25,fireRate:.72,passive:'mage'},
 Engineer:{desc:'Rapid blaster. High Danger overclocks attack speed but builds heat.',weapon:'blaster',hp:120,speed:190,damage:14,fireRate:.40,passive:'engineer'},
 Necromancer:{desc:'Kills at high Danger can summon temporary wraiths.',weapon:'orb',hp:100,speed:200,damage:17,fireRate:.62,passive:'necro'}
};

return { OUTFITS, HATS, TRAILS, PETS, BESTIARY, DUNGEONS, CHARACTERS };
})();
