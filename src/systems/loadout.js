import { spend } from "./economy.js";
export function purchaseJob(save, job) {
  if (save.progression.ownedJobs.includes(job.id)) return { ok: false, message: "이미 보유한 직업입니다." };
  if (!spend(save, "coins", job.price)) return { ok: false, message: "코인이 부족합니다." };
  save.progression.ownedJobs.push(job.id);
  return { ok: true, message: `${job.name} 직업을 획득했습니다.` };
}
export function equipJob(save, job) {
  if (!save.progression.ownedJobs.includes(job.id)) return false;
  save.progression.activeJob = job.id;
  return true;
}
export function purchaseEquipment(save, item) {
  if (save.progression.inventory[item.id]) return { ok: false, message: "이미 보유한 장비입니다." };
  if (!spend(save, "coins", item.price)) return { ok: false, message: "코인이 부족합니다." };
  save.progression.inventory[item.id] = 1;
  return { ok: true, message: `${item.name} 구매 완료!` };
}
export function equipItem(save, item) {
  if (!save.progression.inventory[item.id]) return false;
  save.progression.equipment[item.slot] = item.id;
  return true;
}
