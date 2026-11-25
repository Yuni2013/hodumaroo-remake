export const WORLD_DEFS = [
  { id:"world1", name:"월드 1", description:"새로운 자연 지형에서 펼쳐지는 기본 전투 콘텐츠" },
  { id:"world2", name:"월드 2", description:"월드 1의 서로 다른 보스 11종을 모두 클리어하면 해금" },
  { id:"world3", name:"월드 3", description:"우주 슈팅 콘텐츠" },
];

export const MAP_DEFS = [
  { id:"training_ground", world:"world1", name:"훈련장", kind:"waves", description:"전투 조작을 익히는 기본 연습 구역", unlock:0, gimmick:null, bossIds:[] },
  { id:"upturned_grove", world:"world1", name:"거꾸로 자란 숲", kind:"waves", description:"기울어진 나무와 갈라진 길이 이어지는 숲. 기본 이동 규칙을 익히는 구역.", unlock:0, gimmick:null, bossIds:["root_guardian","ancient_sentinel"] },
  { id:"spore_colony", world:"world1", name:"버섯 군락지", kind:"waves", description:"포자 구름이 중심부로 끌어당기는 습한 군락지.", unlock:0, gimmick:{type:"attraction",center:{x:.5,y:.5},radius:.3,strength:.18}, bossIds:["giant_spore"] },
  { id:"glass_crystal", world:"world1", name:"유리 결정 지대", kind:"waves", description:"결정 구역 안에서는 방향 입력이 반대로 바뀌는 반사 지대.", unlock:0, gimmick:{type:"direction-reverse",center:{x:.5,y:.5},radius:.24}, bossIds:["crystal_golem"] },
  { id:"floating_isles", world:"world1", name:"부유섬", kind:"waves", description:"발판 사이를 이동해야 하는 미끄러운 공중 섬.", unlock:0, gimmick:{type:"ice",center:{x:.5,y:.5},radius:.32}, bossIds:["wandering_islekeeper"] },
  { id:"twisted_garden", world:"world1", name:"뒤틀린 정원", kind:"waves", description:"길이 휘어진 정원. 중앙의 회전 구역이 움직임을 방해한다.", unlock:0, gimmick:{type:"direction-reverse",center:{x:.5,y:.5},radius:.2}, bossIds:["garden_warden","mutated_spirit"] },
  { id:"echo_canyon", world:"world1", name:"메아리 협곡", kind:"waves", description:"좁은 통로와 넓은 전투 공간이 번갈아 나타나는 협곡.", unlock:0, gimmick:null, bossIds:["canyon_devourer"] },
  { id:"giant_footprints", world:"world1", name:"거인의 발자국", kind:"waves", description:"중앙의 발자국 구역으로 플레이어를 끌어당기는 넓은 평원.", unlock:0, gimmick:{type:"attraction",center:{x:.5,y:.5},radius:.26,strength:.22}, bossIds:["footstep_giant"] },
  { id:"sleeping_heartwood", world:"world1", name:"잠든 고목", kind:"waves", description:"빙판처럼 미끄러운 뿌리 지대와 오래된 나무의 전당.", unlock:0, gimmick:{type:"ice",center:{x:.5,y:.5},radius:.28}, bossIds:["sleeping_heartwood","overgrown_guardian"] },
];

export const BOSS_DEFS = [
  { id:"root_guardian", mapId:"upturned_grove", name:"뿌리 수호자", description:"느리지만 단단하다. 일정 간격으로 주변을 휩쓰는 뿌리 파동을 일으킨다.", pattern:"pulse", hp:330, speed:.075, damage:9 },
  { id:"ancient_sentinel", mapId:"upturned_grove", name:"자연의 파수꾼", description:"추격과 원거리 공격을 번갈아 사용한다.", pattern:"mixed", hp:390, speed:.105, damage:10 },
  { id:"giant_spore", mapId:"spore_colony", name:"거대 포자체", description:"거리를 유지하며 포자 탄환을 발사한다.", pattern:"shooter", hp:300, speed:.07, damage:8 },
  { id:"crystal_golem", mapId:"glass_crystal", name:"수정 골렘", description:"방어 자세를 취한 뒤 짧고 강한 돌진을 한다.", pattern:"guard", hp:420, speed:.08, damage:12 },
  { id:"wandering_islekeeper", mapId:"floating_isles", name:"떠돌이 섬지기", description:"플레이어 주위를 크게 선회하며 위치를 바꾼다.", pattern:"orbit", hp:340, speed:.12, damage:9 },
  { id:"garden_warden", mapId:"twisted_garden", name:"정원의 관리자", description:"주기적으로 작은 수호체를 불러 전장을 복잡하게 만든다.", pattern:"summoner", hp:360, speed:.085, damage:9 },
  { id:"mutated_spirit", mapId:"twisted_garden", name:"변이된 정령", description:"짧은 간격으로 위치를 바꾸며 빠르게 접근한다.", pattern:"teleport", hp:310, speed:.13, damage:10 },
  { id:"canyon_devourer", mapId:"echo_canyon", name:"협곡의 포식자", description:"거리를 좁힌 뒤 직선으로 돌진한다.", pattern:"charger", hp:370, speed:.095, damage:13 },
  { id:"footstep_giant", mapId:"giant_footprints", name:"발자국 거인", description:"느리게 다가오며 주기적으로 넓은 범위에 충격파를 만든다.", pattern:"stomp", hp:470, speed:.065, damage:14 },
  { id:"sleeping_heartwood", mapId:"sleeping_heartwood", name:"고목의 심장", description:"중앙을 지키며 반복적으로 생명 파동을 내보낸다.", pattern:"pulse", hp:440, speed:.055, damage:11 },
  { id:"overgrown_guardian", mapId:"sleeping_heartwood", name:"잠식된 수호수", description:"체력이 절반 이하가 되면 더욱 빠르게 움직인다.", pattern:"split", hp:410, speed:.09, damage:12 },
];

export const WEAPON_DEFS = [
  { id:"starter_blaster", name:"기본 블래스터", price:0, damage:10, cooldown:420, range:360, description:"균형 잡힌 기본 원거리 무기" },
  { id:"rapid_blaster", name:"연사 블래스터", price:180, damage:6, cooldown:180, range:300, description:"위력은 낮지만 빠르게 발사" },
  { id:"heavy_blaster", name:"중량 블래스터", price:260, damage:22, cooldown:800, range:420, description:"느리지만 강한 탄환" },
];
export const PET_DEFS = [
  { id:"spark", name:"스파크", description:"전투 종료 시 코인 보너스 +5%", bonus:{coinRate:0.05}, unlock:"월드 1 보스 3종 클리어" },
  { id:"moss", name:"모스", description:"최대 체력 +10", bonus:{maxHp:10}, unlock:"월드 1 보스 6종 클리어" },
];
export const RELIC_DEFS = [
  { id:"steady_core", name:"안정 코어", description:"공격력 +2", bonus:{damage:2}, unlock:"무한의 탑 5층 도달" },
  { id:"guard_emblem", name:"수호 문장", description:"방어력 +1", bonus:{defense:1}, unlock:"무한의 탑 10층 도달" },
];
export const TOWER_CHOICES = [
  { id:"battle", name:"전투", description:"다음 층으로 진행하고 전투 보상을 획득" },
  { id:"treasure", name:"보물", description:"코인과 에너지를 획득" },
  { id:"rest", name:"휴식", description:"체력을 회복" },
];
export const SEASON_REWARDS = [
  { level:1, reward:{coins:100}, label:"코인 100" },
  { level:2, reward:{energy:10}, label:"에너지 10" },
  { level:3, reward:{coins:200}, label:"코인 200" },
  { level:4, reward:{items:{small_medkit:2}}, label:"회복 키트 2개" },
  { level:5, reward:{energy:30,coins:300}, label:"에너지 30 + 코인 300" },
];
export const EVENT_DEFS = [
  { id:"welcome_week", name:"첫걸음 이벤트", description:"전투를 시작하고 이벤트 포인트를 모아 보상을 받아보세요.", target:3, reward:{coins:250,energy:20} },
];
export const COUPONS = {
  "HODU-START": { coins:250, energy:25 },
};
