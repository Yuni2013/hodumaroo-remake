export function canAfford(save, currency, amount) { return Number(save.player[currency] ?? 0) >= amount; }
export function spend(save, currency, amount) {
  if (!canAfford(save, currency, amount)) return false;
  save.player[currency] -= amount;
  return true;
}
export function grantReward(save, reward = {}) {
  if (reward.coins) { save.player.coins += reward.coins; save.records.coinsEarned += reward.coins; }
  if (reward.energy) save.player.energy += reward.energy;
  if (reward.items) for (const [id, count] of Object.entries(reward.items)) save.progression.inventory[id] = (save.progression.inventory[id] ?? 0) + count;
}
export function buyShopItem(save, item) {
  if (!spend(save, "coins", item.price)) return { ok: false, message: "코인이 부족합니다." };
  if (item.kind === "resource") save.player.energy += item.energy ?? 0;
  else if (item.kind === "unlock") { save.progression.hasStarship = true; if (!save.progression.unlockedWorlds.includes(item.unlock)) save.progression.unlockedWorlds.push(item.unlock); save.progression.inventory[item.id] = 1; }
  else save.progression.inventory[item.id] = (save.progression.inventory[item.id] ?? 0) + 1;
  return { ok: true, message: `${item.name} 구매 완료!` };
}
