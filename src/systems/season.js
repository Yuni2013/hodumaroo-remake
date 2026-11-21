import { grantReward } from "./economy.js";
export function addSeasonPoints(save, amount) {
  save.season ??= { points:0, claimed:[] };
  save.season.points += Math.max(0,amount);
}
export function seasonLevel(save) { return Math.floor((save.season?.points ?? 0) / 100) + 1; }
export function claimSeasonReward(save, reward) {
  save.season ??= {points:0,claimed:[]};
  if (seasonLevel(save) < reward.level || save.season.claimed.includes(reward.level)) return false;
  grantReward(save,reward.reward);
  save.season.claimed.push(reward.level);
  return true;
}
export function addEventProgress(save, eventId, amount) {
  save.events ??= {};
  const state = save.events[eventId] ?? {progress:0,claimed:false};
  state.progress += amount;
  save.events[eventId] = state;
}
export function claimEventReward(save, event) {
  const state = save.events?.[event.id];
  if (!state || state.progress < event.target || state.claimed) return false;
  grantReward(save,event.reward);
  state.claimed = true;
  return true;
}
