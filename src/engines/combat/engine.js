export function createCombatRun({ mapId = "training_ground", mode = "waves", playerStats }) {
  return { engine: "combat", mapId, mode, wave: 1, score: 0, kills: 0, elapsed: 0, player: { x: 0, y: 0, hp: playerStats.maxHp, maxHp: playerStats.maxHp }, enemies: [], status: "ready" };
}
export function finishCombatRun(run, won = false) {
  run.status = won ? "won" : "lost";
  return { coins: Math.max(0, run.kills * 3 + (won ? run.wave * 10 : 0)), energy: won ? Math.max(1, Math.floor(run.wave / 2)) : 0, exp: run.kills * 5 + (won ? 25 : 0), kills: run.kills, won };
}
