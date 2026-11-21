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
