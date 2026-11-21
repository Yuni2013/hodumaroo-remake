export function expRequired(level) { return Math.floor(100 * Math.pow(1.18, Math.max(0, level - 1))); }
export function addExperience(save, amount) {
  save.player.exp += Math.max(0, Math.floor(amount));
  let levels = 0;
  while (save.player.exp >= expRequired(save.player.level)) {
    save.player.exp -= expRequired(save.player.level);
    save.player.level += 1;
    save.player.maxHp += 5;
    save.player.damage += 1;
    levels += 1;
  }
  return { levels, required: expRequired(save.player.level), current: save.player.exp };
}
export function getUpgradeCost(definition, currentLevel = 0) { return Math.floor(definition.baseCost * Math.pow(1.45, currentLevel)); }
export function getPlayerStats(save, catalog) {
  const upgrades = save.progression.upgrades;
  const job = catalog.JOBS.find(item => item.id === save.progression.activeJob) ?? catalog.JOBS[0];
  const equipment = Object.values(save.progression.equipment).map(id => [...catalog.EQUIPMENT, ...catalog.STARTER_WEAPONS].find(item => item?.id === id)).filter(Boolean);
  const bonus = equipment.reduce((acc, item) => {
    for (const [key, value] of Object.entries(item.bonus ?? {})) acc[key] = (acc[key] ?? 0) + value;
    return acc;
  }, {});
  return {
    maxHp: save.player.maxHp + (upgrades.health ?? 0) * 10 + (job.bonus.maxHp ?? 0) + (bonus.maxHp ?? 0),
    damage: save.player.damage + (upgrades.damage ?? 0) + (job.bonus.damage ?? 0),
    defense: save.player.defense + (upgrades.defense ?? 0) + (bonus.defense ?? 0),
    speed: save.player.speed + (upgrades.speed ?? 0) * 0.08 + (bonus.speed ?? 0),
  };
}
