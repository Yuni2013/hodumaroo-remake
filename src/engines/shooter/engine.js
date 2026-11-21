export function createShooterRun(save) {
  return { engine: "shooter", score: 0, kills: 0, elapsed: 0, player: { lane: 0, hp: 3 }, enemies: [], shots: [], status: "active", best: save.records.shooterBest };
}
export function endShooterRun(save, run) {
  run.status = "ended";
  save.records.shooterBest = Math.max(save.records.shooterBest, run.score);
  return { score: run.score, kills: run.kills };
}
