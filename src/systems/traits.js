export const TRAIT_DEFS = [
  {id:"power",name:"강화 탄환",description:"공격력 +2",stat:"damage",value:2},
  {id:"vitality",name:"튼튼한 몸",description:"최대 체력 +15 및 즉시 회복",stat:"maxHp",value:15},
  {id:"armor",name:"보호막",description:"방어력 +1",stat:"defense",value:1},
  {id:"agility",name:"민첩",description:"이동 속도 +6%",stat:"speed",value:.06},
  {id:"fortune",name:"행운",description:"이번 전투 코인 보상 +10%",stat:"coinRate",value:.1},
  {id:"rapid",name:"연사 장치",description:"무기 발사 간격 8% 감소",stat:"cooldown",value:.08},
];
export function chooseTraitOptions(run,count=3){
  const shuffled=[...TRAIT_DEFS].sort(()=>Math.random()-.5);
  return shuffled.slice(0,count);
}
export function applyTrait(run,trait){
  run.traits??={};
  const level=(run.traits[trait.id]??0)+1;
  run.traits[trait.id]=level;
  switch(trait.stat){
    case "damage":run.player.stats.damage+=trait.value;break;
    case "maxHp":run.player.maxHp+=trait.value;run.player.hp=Math.min(run.player.maxHp,run.player.hp+trait.value);break;
    case "defense":run.player.stats.defense+=trait.value;break;
    case "speed":run.player.stats.speed+=trait.value;break;
    case "coinRate":run.coinRate=(run.coinRate??1)+trait.value;break;
    case "cooldown":run.weapon.cooldown=Math.max(90,Math.floor(run.weapon.cooldown*(1-trait.value)));break;
  }
  return level;
}
