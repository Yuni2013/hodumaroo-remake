import { spend } from "./economy.js";
export function unlockCollection(save, kind, item) {
  const bucket = kind === "pet" ? "pets" : "relics";
  save.collections ??= { pets:[], relics:[] };
  if (save.collections[bucket].includes(item.id)) return false;
  save.collections[bucket].push(item.id);
  return true;
}
export function equipCollection(save, kind, id) {
  save.collections ??= { pets:[], relics:[] };
  if (!save.collections[kind === "pet" ? "pets" : "relics"].includes(id)) return false;
  if (kind === "pet") save.progression.activePet = id;
  else save.progression.activeRelic = id;
  return true;
}
export function enchantEquipment(save, itemId) {
  const count = save.progression.inventory[itemId] ?? 0;
  if (!count) return {ok:false,message:"먼저 장비를 보유해야 합니다."};
  save.enchant ??= {};
  const level = save.enchant[itemId] ?? 0;
  const cost = 50 + level * 75;
  if (!spend(save,"energy",cost)) return {ok:false,message:`에너지가 부족합니다. 필요 에너지: ${cost}`};
  save.enchant[itemId] = level + 1;
  return {ok:true,level:level+1,message:"장비 강화 완료!"};
}
export function redeemCoupon(save, code, coupons) {
  const normalized = code.trim().toUpperCase();
  if (!coupons[normalized]) return {ok:false,message:"유효하지 않은 쿠폰 코드입니다."};
  save.redeemedCoupons ??= [];
  if (save.redeemedCoupons.includes(normalized)) return {ok:false,message:"이미 사용한 쿠폰입니다."};
  const reward = coupons[normalized];
  if (reward.coins) save.player.coins += reward.coins;
  if (reward.energy) save.player.energy += reward.energy;
  save.redeemedCoupons.push(normalized);
  return {ok:true,message:"쿠폰 보상을 받았습니다.",reward};
}
