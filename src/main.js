import "./style.css";
import "./ui.css";
import * as catalog from "./data/catalog.js";
import { loadSave, writeSave, resetSave } from "./core/save-manager.js";
import { addExperience, expRequired, getPlayerStats, getUpgradeCost } from "./systems/progression.js";
import { grantReward, buyShopItem } from "./systems/economy.js";
import { updateObjectives, claimQuest, claimAchievement } from "./systems/objectives.js";
import { purchaseJob, equipJob, purchaseEquipment, equipItem } from "./systems/loadout.js";
import { createCombatRun } from "./engines/combat/engine.js";
import { createTowerRun } from "./engines/roguelike/tower.js";
import { createShooterRun } from "./engines/shooter/engine.js";

let save = loadSave();
let activePanel = null;
let selectedMode = null;
let activeRun = null;
const app = document.querySelector("#app");

const money = value => Number(value ?? 0).toLocaleString("ko-KR");
const safe = value => String(value).replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[char]));
const persist = () => { writeSave(save); updateLobby(); };
function updateLobby() {
  document.querySelector("#coin-count").textContent = money(save.player.coins);
  document.querySelector("#energy-count").textContent = money(save.player.energy);
  document.querySelector("#player-level").textContent = save.player.level;
  const required = expRequired(save.player.level);
  document.querySelector("#exp-label").textContent = `${money(save.player.exp)} / ${money(required)}`;
  document.querySelector("#exp-fill").style.width = `${Math.min(100, save.player.exp / required * 100)}%`;
  const volume = document.querySelector("#bgm-volume");
  if (volume) volume.value = save.settings.bgmEnabled ? save.settings.bgmVolume : 0;
}
function status(message) {
  const el = document.querySelector("#status-message");
  el.textContent = message;
  el.classList.add("is-visible");
  clearTimeout(status.timer);
  status.timer = setTimeout(() => el.classList.remove("is-visible"), 2400);
}
function closePanel() {
  document.querySelector(".screen-layer")?.remove();
  activePanel = null;
}
function showPanel(title, body) {
  closePanel();
  activePanel = title;
  const layer = document.createElement("section");
  layer.className = "screen-layer";
  layer.innerHTML = `<div class="game-panel" role="dialog" aria-modal="true" aria-label="${safe(title)}"><header class="panel-head"><h2>${safe(title)}</h2><button class="panel-close" type="button" data-action="close">닫기 ✕</button></header><div class="panel-body">${body}</div></div>`;
  layer.addEventListener("click", event => { if (event.target === layer) closePanel(); });
  app.append(layer);
}
function card(title, description, meta = "", button = "", disabled = false) {
  return `<article class="system-card"><h3>${safe(title)}</h3><p>${safe(description)}</p>${meta ? `<div class="meta">${meta}</div>` : ""}${button ? button.replace("{{disabled}}", disabled ? "disabled" : "") : ""}</article>`;
}
function button(label, action, id = "", secondary = false, disabled = false) {
  return `<button class="action-button ${secondary ? "secondary" : ""}" type="button" data-action="${action}" ${id ? `data-id="${safe(id)}"` : ""} {{disabled}}>${safe(label)}</button>`.replace("{{disabled}}", disabled ? "disabled" : "");
}
function row(title, description, right) {
  return `<div class="system-row"><div><strong>${safe(title)}</strong><small>${safe(description)}</small></div>${right}</div>`;
}
function openPlay() {
  const modes = catalog.GAME_MODES.map(mode => card(mode.name, mode.description, `엔진: ${mode.engine}`, button("모드 선택", "select-mode", mode.id))).join("");
  showPanel("플레이", `<div class="panel-stats"><span>월드 1 · 진행 시작</span><span>최고 탑 층수: ${save.records.towerBest}</span></div><div class="panel-grid">${modes}</div><p class="panel-note" style="margin-top:14px">모드와 엔진의 기본 구조를 연결했어. 맵·보스·무기·적 패턴은 새 콘텐츠 설계가 확정되는 대로 이 시스템에 추가할 거야.</p>`);
}
function openMode(modeId) {
  selectedMode = catalog.GAME_MODES.find(item => item.id === modeId);
  if (!selectedMode) return;
  const run = modeId === "combat" ? createCombatRun({ playerStats: getPlayerStats(save, catalog) })
    : modeId === "tower" ? createTowerRun(save) : createShooterRun(save);
  activeRun = run;
  const details = modeId === "combat"
    ? "일반 웨이브·보스·도전 전투를 처리하는 기본 전투 엔진입니다. 실제 맵과 적 데이터는 별도 콘텐츠 단계에서 연결합니다."
    : modeId === "tower"
      ? `현재 저장된 진행 층수는 ${run.floor}층입니다. 3층 단위 선택 이벤트와 유물·정수 보상 규칙을 이 엔진에 연결할 수 있습니다.`
      : "좌우 이동과 위쪽 발사를 사용하는 우주 슈팅 전용 엔진입니다. 월드 3 맵 데이터와 적 편성은 별도 콘텐츠 단계에서 연결합니다.";
  showPanel(selectedMode.name, `<div class="panel-stats"><span>엔진: ${selectedMode.engine}</span><span>상태: 준비</span></div><p class="panel-note">${safe(details)}</p><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">${button("모드 목록", "play", "", true)}${button("준비 상태 확인", "engine-check", modeId)}</div>`);
}
function openShop() {
  const html = catalog.SHOP_ITEMS.map(item => row(item.name, `${item.description} · ${item.price} 코인`, button("구매", "buy-shop", item.id, false, save.player.coins < item.price))).join("");
  showPanel("상점", `<div class="panel-stats"><span>보유 코인: ${money(save.player.coins)}</span><span>에너지: ${money(save.player.energy)}</span></div><div class="system-list">${html}</div>`);
}
function openJobs() {
  const html = catalog.JOBS.map(job => {
    const owned = save.progression.ownedJobs.includes(job.id);
    const active = save.progression.activeJob === job.id;
    const action = active ? button("사용 중", "noop", job.id, true, true) : owned ? button("장착", "equip-job", job.id) : button(`구매 · ${job.price} 코인`, "buy-job", job.id, false, save.player.coins < job.price);
    return card(job.name, job.description, `공격 +${job.bonus.damage} · 최대 HP +${job.bonus.maxHp}`, action);
  }).join("");
  showPanel("직업", `<div class="panel-stats"><span>현재 직업: ${safe(save.progression.activeJob)}</span><span>보유 코인: ${money(save.player.coins)}</span></div><div class="panel-grid">${html}</div>`);
}
function openUpgrades() {
  const stats = getPlayerStats(save, catalog);
  const html = catalog.PERMANENT_UPGRADES.map(item => {
    const level = save.progression.upgrades[item.id] ?? 0;
    const cost = getUpgradeCost(item, level);
    return row(item.name, `${item.description} · Lv.${level}/${item.max} · 다음 비용 ${cost} 에너지`, button("강화", "upgrade", item.id, false, level >= item.max || save.player.energy < cost));
  }).join("");
  showPanel("영구 업그레이드", `<div class="panel-stats"><span>에너지: ${money(save.player.energy)}</span><span>공격력: ${stats.damage}</span><span>최대 HP: ${stats.maxHp}</span><span>방어력: ${stats.defense}</span></div><div class="system-list">${html}</div>`);
}
function openEquipment() {
  const html = catalog.EQUIPMENT.map(item => {
    const owned = !!save.progression.inventory[item.id];
    const equipped = save.progression.equipment[item.slot] === item.id;
    const action = equipped ? button("장착 중", "noop", item.id, true, true) : owned ? button("장착", "equip-item", item.id) : button(`구매 · ${item.price} 코인`, "buy-equipment", item.id, false, save.player.coins < item.price);
    return card(item.name, `장비 슬롯: ${item.slot}`, Object.entries(item.bonus).map(([key,value])=>`${key} +${value}`).join(" · "), action);
  }).join("");
  showPanel("장비", `<div class="panel-stats"><span>코인: ${money(save.player.coins)}</span></div><div class="panel-grid">${html}</div>`);
}
function openInventory() {
  const items = Object.entries(save.progression.inventory).filter(([,count])=>count>0);
  showPanel("인벤토리", items.length ? `<div class="system-list">${items.map(([id,count])=>row(id,`보유 수량: ${count}`, "")).join("")}</div>` : '<p class="panel-note">아직 보유한 아이템이 없습니다.</p>');
}
function openQuests() {
  const html = catalog.QUEST_DEFS.map(item => {
    const state = save.quests[item.id] ?? {progress:0,claimed:false};
    const done = !!state.completed;
    const action = state.claimed ? button("보상 수령 완료","noop",item.id,true,true) : button(done ? "보상 받기" : "진행 중", "claim-quest", item.id, !done, !done);
    return row(item.name, `${item.description} · ${Math.min(state.progress,item.target)}/${item.target}`, action);
  }).join("");
  showPanel("퀘스트", `<p class="panel-note">현재는 기본 퀘스트 목록이야. 일일·주간 갱신 규칙은 다음 단계에서 추가할게.</p><div class="system-list" style="margin-top:12px">${html}</div>`);
}
function openAchievements() {
  const html = catalog.ACHIEVEMENT_DEFS.map(item => {
    const state = save.achievements[item.id] ?? {};
    const action = state.claimed ? button("수령 완료","noop",item.id,true,true) : button(state.completed ? "보상 받기" : "미달성","claim-achievement",item.id,!state.completed,!state.completed);
    return row(item.name,item.description,action);
  }).join("");
  showPanel("업적", `<div class="system-list">${html}</div>`);
}
function openSettings() {
  showPanel("설정", `<div class="system-list">
    ${row("배경음악","음량 조절",`<input class="field" style="width:110px" type="range" min="0" max="1" step="0.05" value="${save.settings.bgmVolume}" data-setting="bgmVolume">`)}
    ${row("효과음","현재 설정",button(save.settings.soundEnabled ? "ON" : "OFF","toggle-setting","soundEnabled",true))}
    ${row("화면 흔들림","현재 설정",button(save.settings.screenShake ? "ON" : "OFF","toggle-setting","screenShake",true))}
    ${row("저장 데이터","초기화하면 진행 상황이 사라집니다.",button("데이터 초기화","reset-save","",false))}
  </div><p class="panel-note" style="margin-top:12px">배경음악 파일과 실제 효과음은 아직 연결하지 않았어. 음량·설정 값은 저장돼.</p>`);
}
function openPets() { showPanel("펫",'<p class="panel-note">펫 시스템은 해금 조건과 펫 목록을 확정한 뒤 연결할 예정이야. 현재는 잠금 상태야.</p>'); }
function openRelics() { showPanel("유물",'<p class="panel-note">유물 시스템은 무한의 탑 보상 규칙과 함께 구현할 예정이야.</p>'); }
function openSimple(title, message) { showPanel(title,`<p class="panel-note">${safe(message)}</p>`); }

function handleAction(action, id, target) {
  switch (action) {
    case "close": closePanel(); break;
    case "play": openPlay(); break;
    case "select-mode": openMode(id); break;
    case "engine-check": status(`${id} 엔진 기본 객체 생성 성공`); break;
    case "shop": openShop(); break;
    case "buy-shop": { const item=catalog.SHOP_ITEMS.find(x=>x.id===id); const result=buyShopItem(save,item); status(result.message); persist(); openShop(); break; }
    case "jobs": openJobs(); break;
    case "buy-job": { const item=catalog.JOBS.find(x=>x.id===id); const result=purchaseJob(save,item); status(result.message); persist(); openJobs(); break; }
    case "equip-job": { equipJob(save,catalog.JOBS.find(x=>x.id===id)); persist(); openJobs(); status("직업을 변경했습니다."); break; }
    case "upgrades": openUpgrades(); break;
    case "upgrade": { const item=catalog.PERMANENT_UPGRADES.find(x=>x.id===id); const level=save.progression.upgrades[id]??0; const cost=getUpgradeCost(item,level); if(level<item.max&&save.player.energy>=cost){save.player.energy-=cost;save.progression.upgrades[id]=level+1;persist();openUpgrades();status("영구 업그레이드 완료!");} break; }
    case "equipment": openEquipment(); break;
    case "buy-equipment": { const result=purchaseEquipment(save,catalog.EQUIPMENT.find(x=>x.id===id)); status(result.message); persist(); openEquipment(); break; }
    case "equip-item": { equipItem(save,catalog.EQUIPMENT.find(x=>x.id===id)); persist(); openEquipment(); status("장비를 장착했습니다."); break; }
    case "inventory": openInventory(); break;
    case "quests": openQuests(); break;
    case "claim-quest": { const item=catalog.QUEST_DEFS.find(x=>x.id===id); if(claimQuest(save,item,catalog)){persist();openQuests();status("퀘스트 보상을 받았습니다.");} break; }
    case "achievements": openAchievements(); break;
    case "claim-achievement": { const item=catalog.ACHIEVEMENT_DEFS.find(x=>x.id===id); if(claimAchievement(save,item)){persist();openAchievements();status("업적 보상을 받았습니다.");} break; }
    case "pets": openPets(); break;
    case "relics": openRelics(); break;
    case "events": openSimple("이벤트","이벤트 콘텐츠와 일정은 추후 추가할게."); break;
    case "season": openSimple("시즌 패스","시즌 보상 트랙과 경험치 규칙은 추후 추가할게."); break;
    case "enchant": openSimple("인챈트","장비 강화·인챈트 규칙은 장비 밸런스 설계 후 추가할게."); break;
    case "notice": openSimple("공지사항","현재 등록된 공지사항이 없습니다."); break;
    case "level": { const req=expRequired(save.player.level); openSimple("플레이어 레벨",`레벨 ${save.player.level} · 경험치 ${save.player.exp}/${req} · 다음 레벨까지 ${req-save.player.exp} EXP`); break; }
    case "star": openSimple("차원의 별","별 재화와 획득 확률을 정한 뒤 구현할게."); break;
    case "code": showPanel("쿠폰 코드",'<p class="panel-note">아직 등록된 쿠폰 코드가 없습니다.</p><input class="field" id="coupon-input" placeholder="쿠폰 코드"><button class="action-button" style="margin-top:9px" data-action="redeem-code">등록</button>'); break;
    case "redeem-code": status("사용 가능한 쿠폰 코드가 없습니다."); break;
    case "settings": openSettings(); break;
    case "toggle-setting": save.settings[id]=!save.settings[id];persist();openSettings();break;
    case "reset-save": if(confirm("정말 저장 데이터를 초기화할까? 복구할 수 없어.")){save=resetSave();closePanel();updateLobby();status("저장 데이터를 초기화했습니다.");} break;
    case "audio": save.settings.bgmEnabled=!save.settings.bgmEnabled;persist();status(save.settings.bgmEnabled?"BGM 설정 ON":"BGM 설정 OFF");break;
    case "noop": break;
    default: status("아직 준비 중인 기능입니다.");
  }
}
app.addEventListener("click", event => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  handleAction(target.dataset.action,target.dataset.id,target);
});
document.querySelector("#bgm-volume")?.addEventListener("input",event=>{save.settings.bgmVolume=Number(event.target.value);save.settings.bgmEnabled=save.settings.bgmVolume>0;persist();});
document.documentElement.classList.add("app-ready");
updateLobby();
console.info("[Hodumaroo] System foundation initialized.", { saveVersion: save.version });
