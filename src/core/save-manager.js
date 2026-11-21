const SAVE_KEY = "hodumaroo-remake-save-v1";
export const createDefaultSave = () => ({
  version: 1,
  player: { level: 1, exp: 0, coins: 0, energy: 0, maxHp: 100, damage: 10, defense: 0, speed: 1 },
  progression: { ownedJobs: ["rookie"], activeJob: "rookie", upgrades: {}, equipment: { armor: null, boots: null, weapon: "starter_blaster" }, inventory: {}, unlockedWorlds: ["world1"], clearedMaps: [], unlockedPets: false, unlockedRelics: false },
  records: { runs: 0, wins: 0, kills: 0, coinsEarned: 0, towerBest: 0, shooterBest: 0 },
  achievements: {},
  quests: {},
  tower: { floor: 1, essence: 0, permanent: {} },
  settings: { bgmVolume: 0.18, bgmEnabled: true, soundEnabled: true, screenShake: true },
});
function mergeDefaults(defaults, saved) {
  if (!saved || typeof saved !== "object") return structuredClone(defaults);
  const result = { ...defaults };
  for (const [key, value] of Object.entries(saved)) {
    if (value && typeof value === "object" && !Array.isArray(value) && defaults[key] && typeof defaults[key] === "object" && !Array.isArray(defaults[key])) result[key] = mergeDefaults(defaults[key], value);
    else result[key] = value;
  }
  return result;
}
export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return mergeDefaults(createDefaultSave(), raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn("[Save] 저장 데이터를 읽지 못해 새 데이터를 사용합니다.", error);
    return createDefaultSave();
  }
}
export function writeSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); return true; }
  catch (error) { console.error("[Save] 저장 실패", error); return false; }
}
export function resetSave() {
  const fresh = createDefaultSave();
  writeSave(fresh);
  return fresh;
}
