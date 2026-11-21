export const WORLD_DEFS = [
  { id:"world1", name:"월드 1", description:"기본 전투 콘텐츠" },
  { id:"world2", name:"월드 2", description:"월드 1 보스 진행 후 해금" },
  { id:"world3", name:"월드 3", description:"우주 슈팅 콘텐츠" },
];
export const MAP_DEFS = [
  { id:"training_ground", world:"world1", name:"훈련장", kind:"waves", description:"전투 조작을 익히는 기본 연습 구역", unlock:0 },
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
