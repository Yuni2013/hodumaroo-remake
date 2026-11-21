import { grantReward } from "./economy.js";
const DAY = 86400000;
export function claimDailyReward(save, now = Date.now()) {
  const last = Number(save.daily?.lastClaim ?? 0);
  if (now - last < DAY) return { ok:false, remaining:DAY-(now-last) };
  const day = Number(save.daily?.streak ?? 0) % 7;
  const reward = day === 6 ? { coins:300, energy:30 } : { coins:75 + day*15, energy:5 + day };
  grantReward(save,reward);
  save.daily = { lastClaim:now, streak:(save.daily?.streak ?? 0)+1 };
  return { ok:true,reward,streak:save.daily.streak };
}
export function dailyRemaining(save, now = Date.now()) {
  return Math.max(0,DAY-(now-Number(save.daily?.lastClaim ?? 0)));
}
export function rotateQuestPeriod(save, now = new Date()) {
  const dayKey = now.toISOString().slice(0,10);
  if (save.questRotation?.day !== dayKey) {
    save.questRotation = { ...(save.questRotation ?? {}), day:dayKey };
    for (const [id,state] of Object.entries(save.quests ?? {})) if (state.period === "daily") delete save.quests[id];
  }
  const week = `${now.getUTCFullYear()}-W${Math.ceil((((now - new Date(Date.UTC(now.getUTCFullYear(),0,1))) / DAY) + new Date(Date.UTC(now.getUTCFullYear(),0,1)).getUTCDay()+1)/7)}`;
  if (save.questRotation?.week !== week) {
    save.questRotation.week = week;
    for (const [id,state] of Object.entries(save.quests ?? {})) if (state.period === "weekly") delete save.quests[id];
  }
}
