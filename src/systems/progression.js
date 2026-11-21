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
    const enchantLevel = save.enchant?.[item.id] ?? 0;
    if (item.slot === "armor") acc.defense = (acc.defense ?? 0) + enchantLevel;
    if (item.slot === "boots") acc.speed = (acc.speed ?? 0) + enchantLevel * 0.02;
    return acc;
  }, {});
  const pet = catalog.PET_DEFS?.find(item => item.id === save.progression.activePet);
  const relic = catalog.RELIC_DEFS?.find(item => item.id === save.progression.activeRelic);
  for (const item of [pet, relic]) {
    for (const [key, value] of Object.entries(item?.bonus ?? {})) bonus[key] = (bonus[key] ?? 0) + value;
  }
  return {
    maxHp: save.player.maxHp + (upgrades.health ?? 0) * 10 + (job.bonus.maxHp ?? 0) + (bonus.maxHp ?? 0) + (save.tower?.permanent?.vitality ?? 0) * 5,
    damage: save.player.damage + (upgrades.damage ?? 0) + (job.bonus.damage ?? 0) + (save.tower?.permanent?.power ?? 0),
    defense: save.player.defense + (upgrades.defense ?? 0) + (bonus.defense ?? 0) + (save.tower?.permanent?.guard ?? 0),
    speed: save.player.speed + (upgrades.speed ?? 0) * 0.08 + (bonus.speed ?? 0),
    coinRate: 1 + (upgrades.coinGain ?? 0) * 0.05 + (bonus.coinRate ?? 0),
  };
}
