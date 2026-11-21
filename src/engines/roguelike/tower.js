export function createTowerRun(save) { return { engine: "roguelike", floor: Math.max(1, save.tower.floor), choice: null, relicChoices: [], status: "active" }; }
export function resolveTowerFloor(save, run, result) {
  if (result === "victory") {
    run.floor += 1;
    save.tower.floor = Math.max(save.tower.floor, run.floor);
    save.records.towerBest = Math.max(save.records.towerBest, run.floor);
    save.tower.essence += 1 + Math.floor(run.floor / 10);
    return { type: (run.floor - 1) % 3 === 0 ? "choice" : "next", floor: run.floor };
  }
  run.status = "ended";
  return { type: "ended", best: save.records.towerBest };
}

export const TOWER_UPGRADES = [
  { id:"vitality", name:"탑의 생명력", description:"최대 체력 +5", baseCost:5, max:20 },
  { id:"power", name:"탑의 힘", description:"공격력 +1", baseCost:6, max:20 },
  { id:"guard", name:"탑의 수호", description:"방어력 +1", baseCost:7, max:10 },
];
export function towerUpgradeCost(item, level) { return item.baseCost + level * 4; }
export function buyTowerUpgrade(save, item) {
  save.tower.permanent ??= {};
  const level=save.tower.permanent[item.id] ?? 0;
  const cost=towerUpgradeCost(item,level);
  if(level>=item.max) return {ok:false,message:"최대 단계입니다."};
  if(save.tower.essence<cost) return {ok:false,message:"탑의 정수가 부족합니다."};
  save.tower.essence-=cost;
  save.tower.permanent[item.id]=level+1;
  return {ok:true,message:"탑 영구 강화 완료!"};
}
