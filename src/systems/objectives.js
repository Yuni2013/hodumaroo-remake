import { grantReward } from "./economy.js";
export function updateObjectives(save, metric, amount, catalog) {
  const completed = [];
  for (const quest of catalog.QUEST_DEFS) {
    if (quest.metric !== metric || save.quests[quest.id]?.claimed) continue;
    const state = save.quests[quest.id] ?? { progress: 0, claimed: false };
    state.progress = Math.min(quest.target, state.progress + amount);
    if (state.progress >= quest.target) state.completed = true;
    save.quests[quest.id] = state;
  }
  for (const achievement of catalog.ACHIEVEMENT_DEFS) {
    if (save.achievements[achievement.id]?.claimed) continue;
    const reached = achievement.id === "first_run" ? save.records.runs >= 1
      : achievement.id === "first_victory" ? save.records.wins >= 1
      : achievement.id === "ten_kills" ? save.records.kills >= 10
      : achievement.id === "tower_floor_10" ? save.records.towerBest >= 10 : false;
    if (reached) save.achievements[achievement.id] = { completed: true, claimed: false };
  }
  return completed;
}
export function claimQuest(save, quest, catalog) {
  const state = save.quests[quest.id];
  if (!state?.completed || state.claimed) return false;
  state.claimed = true;
  grantReward(save, quest.reward);
  return true;
}
export function claimAchievement(save, achievement) {
  const state = save.achievements[achievement.id];
  if (!state?.completed || state.claimed) return false;
  state.claimed = true;
  grantReward(save, achievement.reward);
  return true;
}
