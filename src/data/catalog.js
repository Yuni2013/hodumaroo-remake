export const GAME_MODES = [
  { id: "combat", name: "일반 전투", description: "웨이브, 보스, 도전 모드", engine: "combat" },
  { id: "tower", name: "무한의 탑", description: "층을 오르며 전투·보상·휴식을 선택", engine: "roguelike" },
  { id: "shooter", name: "우주 전투", description: "위에서 내려오는 적을 상대하는 슈팅 모드", engine: "shooter" },
];

export const MAPS = {
  world1: [],
  world2: [],
  world3: [],
};

export const STARTER_WEAPONS = [
  { id: "starter_blaster", name: "기본 블래스터", type: "ranged", damage: 10, cooldown: 450, description: "기본 원거리 무기" },
];
export const JOBS = [
  { id: "rookie", name: "초보자", price: 0, bonus: { damage: 0, maxHp: 0 }, description: "기본 능력치로 시작합니다." },
  { id: "ranger", name: "레인저", price: 250, bonus: { damage: 2, maxHp: 0 }, description: "공격력이 증가합니다." },
  { id: "guardian", name: "수호자", price: 250, bonus: { damage: 0, maxHp: 25 }, description: "최대 체력이 증가합니다." },
];
export const EQUIPMENT = [
  { id: "cloth_vest", name: "천 조끼", slot: "armor", price: 100, bonus: { maxHp: 10, defense: 1 } },
  { id: "light_boots", name: "가벼운 신발", slot: "boots", price: 120, bonus: { speed: 0.08 } },
];
export const PERMANENT_UPGRADES = [
  { id: "health", name: "체력 강화", max: 10, baseCost: 100, description: "최대 체력 +10" },
  { id: "damage", name: "공격 강화", max: 10, baseCost: 120, description: "공격력 +1" },
  { id: "defense", name: "방어 강화", max: 10, baseCost: 100, description: "방어력 +1" },
  { id: "speed", name: "이동 속도", max: 5, baseCost: 150, description: "이동 속도 증가" },
  { id: "coinGain", name: "재화 획득", max: 5, baseCost: 180, description: "코인 획득량 증가" },
];
export const SHOP_ITEMS = [
  { id: "small_medkit", name: "소형 회복 키트", price: 50, description: "전투 중 체력 회복 아이템", kind: "consumable" },
  { id: "energy_cell", name: "에너지 셀", price: 80, description: "에너지 +10", kind: "resource", energy: 10 },
  { id: "starship", name: "소형 우주선", price: 1500, description: "월드 3 우주 전투를 해금합니다.", kind: "unlock", unlock: "world3" },
];
export const ACHIEVEMENT_DEFS = [
  { id: "first_run", name: "첫 출전", description: "전투를 처음 시작하기", reward: { coins: 50 } },
  { id: "first_victory", name: "첫 승리", description: "전투에서 첫 승리 달성", reward: { coins: 100, energy: 10 } },
  { id: "ten_kills", name: "정리 정돈", description: "적 10명 처치", reward: { coins: 100 } },
  { id: "tower_floor_10", name: "탑의 도전자", description: "무한의 탑 10층 도달", reward: { energy: 30 } },
];
export const QUEST_DEFS = [
  { id: "play_once", name: "전투 준비", description: "전투 1회 시작", target: 1, metric: "runs", reward: { coins: 50 } },
  { id: "kill_10", name: "적 처치", description: "적 10명 처치", target: 10, metric: "kills", reward: { coins: 80 } },
  { id: "collect_100", name: "재화 수집", description: "코인 100개 획득", target: 100, metric: "coinsEarned", reward: { energy: 10 } },
];
export const DEFAULT_SETTINGS = { bgmVolume: 0.18, bgmEnabled: true, soundEnabled: true, screenShake: true };
