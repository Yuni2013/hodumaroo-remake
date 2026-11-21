import "./style.css";
import "./ui.css";
import "./game.css";
import * as catalog from "./data/catalog.js";
import * as content from "./data/content.js";
import { loadSave, writeSave, resetSave } from "./core/save-manager.js";
import { addExperience, expRequired, getPlayerStats, getUpgradeCost } from "./systems/progression.js";
import { grantReward, buyShopItem } from "./systems/economy.js";
import { claimQuest, claimAchievement } from "./systems/objectives.js";
import { purchaseJob, equipJob, purchaseEquipment, equipItem } from "./systems/loadout.js";
import { claimDailyReward, dailyRemaining } from "./systems/daily.js";
import { equipCollection, enchantEquipment, redeemCoupon } from "./systems/collections.js";
import { addSeasonPoints, seasonLevel, claimSeasonReward, addEventProgress, claimEventReward } from "./systems/season.js";
import { createTowerRun, resolveTowerFloor } from "./engines/roguelike/tower.js";
import { startArena, moveArenaPlayer, fireArena, stepArena, nextArenaWave } from "./engines/combat/simulation.js";
import { startShooter, stepShooter } from "./engines/shooter/simulation.js";

let save=loadSave(), activeRun=null, gameFrame=0, lastFrame=0, hold={x:0,y:0,fire:false}, currentMode="combat";
const app=document.querySelector("#app");
const money=n=>Number(n??0).toLocaleString("ko-KR");
const safe=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const persist=()=>{writeSave(save);updateLobby();};
function updateLobby(){
 document.querySelector("#coin-count").textContent=money(save.player.coins);
 document.querySelector("#energy-count").textContent=money(save.player.energy);
 document.querySelector("#player-level").textContent=save.player.level;
 const need=expRequired(save.player.level);
 document.querySelector("#exp-label").textContent=`${money(save.player.exp)} / ${money(need)}`;
 document.querySelector("#exp-fill").style.width=`${Math.min(100,save.player.exp/need*100)}%`;
 const vol=document.querySelector("#bgm-volume");if(vol)vol.value=save.settings.bgmEnabled?save.settings.bgmVolume:0;
}
function status(msg){const el=document.querySelector("#status-message");el.textContent=msg;el.classList.add("is-visible");clearTimeout(status.timer);status.timer=setTimeout(()=>el.classList.remove("is-visible"),2400);}
function closePanel(){document.querySelector(".screen-layer")?.remove();}
function panel(title,body){
 closePanel();const layer=document.createElement("section");layer.className="screen-layer";
 layer.innerHTML=`<div class="game-panel" role="dialog" aria-modal="true" aria-label="${safe(title)}"><header class="panel-head"><h2>${safe(title)}</h2><button class="panel-close" data-action="close">닫기 ✕</button></header><div class="panel-body">${body}</div></div>`;
 layer.addEventListener("click",e=>{if(e.target===layer)closePanel();});app.append(layer);
}
function btn(label,action,id="",disabled=false,secondary=false){return `<button class="action-button ${secondary?"secondary":""}" data-action="${action}" ${id?`data-id="${safe(id)}"`:""} ${disabled?"disabled":""}>${safe(label)}</button>`;}
function row(title,desc,right){return `<div class="system-row"><div><strong>${safe(title)}</strong><small>${safe(desc)}</small></div>${right}</div>`;}
function card(title,desc,meta,action){return `<article class="system-card"><h3>${safe(title)}</h3><p>${safe(desc)}</p><div class="meta">${safe(meta||"")}</div>${action}</article>`;}
function openPlay(){
 const worlds=content.WORLD_DEFS.map(w=>row(w.name,w.description,btn("선택","world",w.id,!save.progression.unlockedWorlds.includes(w.id)))).join("");
 const modes=catalog.GAME_MODES.map(m=>card(m.name,m.description,"독립 엔진",btn("시작","mode",m.id))).join("");
 panel("플레이",`<h3 class="section-title">월드</h3><div class="system-list">${worlds}</div><h3 class="section-title">게임 모드</h3><div class="panel-grid">${modes}</div>`);
}
function openWorld(id){
 const maps=content.MAP_DEFS.filter(m=>m.world===id);
 const weapons=content.WEAPON_DEFS.map(w=>{const owned=(save.progression.ownedWeapons??["starter_blaster"]).includes(w.id);return card(w.name,w.description,`공격 ${w.damage} · 가격 ${w.price} 코인`,owned?btn("무기 선택","choose-weapon",w.id):btn("구매","buy-weapon",w.id,save.player.coins<w.price));}).join("");
 const mapCards=maps.map(m=>card(m.name,m.description,"임시 테스트 맵",btn("맵 선택","choose-map",m.id))).join("")||'<p class="panel-note">이 월드의 맵은 아직 설계 중입니다. 확정되지 않은 맵 이름을 임의로 추가하지 않았습니다.</p>';
 panel(content.WORLD_DEFS.find(w=>w.id===id)?.name??"월드",`<h3 class="section-title">맵 선택</h3><div class="panel-grid">${mapCards}</div><h3 class="section-title">무기 선택</h3><div class="panel-grid">${weapons}</div>`);
}
function openMode(id){
 currentMode=id;
 if(id==="combat"){openWorld("world1");return;}
 if(id==="tower"){startTower();return;}
 startShooterRun();
}
function getWeapon(){const id=save.progression.equipment.weapon??"starter_blaster";return content.WEAPON_DEFS.find(w=>w.id===id)||content.WEAPON_DEFS[0];}
function startCombat(mapId="training_ground"){
 closePanel();currentMode="combat";
 const stats=getPlayerStats(save,{...catalog,PET_DEFS:content.PET_DEFS,RELIC_DEFS:content.RELIC_DEFS});
 activeRun={...startArena({stats,weapon:getWeapon()}),mapId};
 save.records.runs++;save.records.modeRuns=(save.records.modeRuns??0)+1;
 persist();startGameLoop();renderCombat();
}
function startTower(){
 closePanel();currentMode="tower";
 const tower=createTowerRun(save);
 activeRun={...startArena({stats:getPlayerStats(save,{...catalog,PET_DEFS:content.PET_DEFS,RELIC_DEFS:content.RELIC_DEFS}),weapon:getWeapon(),wave:tower.floor}),tower};
 save.records.runs++;persist();startGameLoop();renderCombat();
}
function startShooterRun(){
 closePanel();currentMode="shooter";
 activeRun=startShooter(getPlayerStats(save,{...catalog,PET_DEFS:content.PET_DEFS,RELIC_DEFS:content.RELIC_DEFS}));
 save.records.runs++;persist();startGameLoop();renderShooter();
}
function stopGameLoop(){cancelAnimationFrame(gameFrame);gameFrame=0;hold={x:0,y:0,fire:false};}
function startGameLoop(){stopGameLoop();lastFrame=0;gameFrame=requestAnimationFrame(loop);}
function loop(now){
 if(!activeRun)return;
 const dt=Math.min(.04,(now-(lastFrame||now))/1000);lastFrame=now;
 if(currentMode==="shooter"){
  if(hold.x)activeRun.player.x=Math.max(.06,Math.min(.94,activeRun.player.x+hold.x*.65*dt));
  stepShooter(activeRun,dt,now);renderShooter();
 }else{
  if(hold.x||hold.y)moveArenaPlayer(activeRun,hold.x,hold.y,dt);
  if(hold.fire)fireArena(activeRun,now);
  stepArena(activeRun,dt,now);renderCombat();
 }
 if(activeRun.status==="lost"){finishRun(false);return;}
 if(activeRun.status==="wave-clear"){if(currentMode==="tower")towerFloorClear();else renderWaveClear();return;}
 gameFrame=requestAnimationFrame(loop);
}
function renderCombat(){
 const r=activeRun;if(!r)return;
 let stage=app.querySelector(".gameplay-screen");
 if(!stage){
  stage=document.createElement("section");stage.className="gameplay-screen";
  stage.innerHTML=`<header class="game-hud"><button data-action="leave-game">나가기</button><b class="hud-title"></b><span class="hud-hp"></span><span class="hud-kills"></span><span class="hud-score"></span></header><div class="arena"><div class="arena-grid"></div></div><div class="game-controls"><div class="move-pad"><button data-hold="up">▲</button><div><button data-hold="left">◀</button><button data-hold="down">▼</button><button data-hold="right">▶</button></div></div><button class="fire-button" data-hold="fire">공격</button></div>`;
  app.append(stage);
 }
 stage.querySelector(".hud-title").textContent=currentMode==="tower"?"무한의 탑 "+r.wave+"층":"웨이브 "+r.wave;
 stage.querySelector(".hud-hp").textContent="HP "+Math.max(0,Math.ceil(r.player.hp))+"/"+r.player.maxHp;
 stage.querySelector(".hud-kills").textContent="처치 "+r.kills;
 stage.querySelector(".hud-score").textContent="점수 "+r.score;
 const arena=stage.querySelector(".arena");
 arena.innerHTML='<div class="arena-grid"></div>'+r.enemies.map(e=>`<div class="arena-enemy ${e.boss?"boss":""}" style="left:${e.x*100}%;top:${e.y*100}%"><i style="width:${Math.max(0,e.hp/e.maxHp*100)}%"></i></div>`).join("")+r.projectiles.map(s=>`<div class="arena-shot" style="left:${s.x*100}%;top:${s.y*100}%"></div>`).join("")+`<div class="arena-player ${r.invulnerable>0?"hit":""}" style="left:${r.player.x*100}%;top:${r.player.y*100}%"></div>`;
}
function renderShooter(){
 const r=activeRun;if(!r)return;
 let stage=app.querySelector(".gameplay-screen");
 if(!stage){
  stage=document.createElement("section");stage.className="gameplay-screen";
  stage.innerHTML=`<header class="game-hud"><button data-action="leave-game">나가기</button><b>우주 전투</b><span class="hud-hp"></span><span class="hud-kills"></span><span class="hud-score"></span></header><div class="shooter-stage"></div><div class="game-controls shooter-controls"><button data-hold="left">◀</button><button data-hold="right">▶</button></div>`;
  app.append(stage);
 }
 stage.querySelector(".hud-hp").textContent="HP "+r.player.hp;
 stage.querySelector(".hud-kills").textContent="처치 "+r.kills;
 stage.querySelector(".hud-score").textContent="점수 "+r.score;
 stage.querySelector(".shooter-stage").innerHTML=r.enemies.map(e=>`<div class="shooter-enemy" style="left:${e.x*100}%;top:${e.y*100}%"></div>`).join("")+r.shots.map(s=>`<div class="shooter-shot" style="left:${s.x*100}%;top:${s.y*100}%"></div>`).join("")+`<div class="shooter-player" style="left:${r.player.x*100}%"></div>`;
}
function finishRun(won){
 stopGameLoop();
 const r=activeRun;if(!r)return;
 const coins=won?Math.max(20,r.kills*3+r.wave*8):r.kills*2;
 const energy=won?Math.max(2,Math.floor(r.wave/2)):0;
 const exp=r.kills*5+(won?25:0);
 grantReward(save,{coins,energy});
 const level=addExperience(save,exp);
 save.records.kills+=r.kills;\n save.records.bossKills=(save.records.bossKills??0)+(r.bossKills??0);\n if(save.records.bossKills>=3&&!save.collections.pets.includes("spark"))save.collections.pets.push("spark");\n if(save.records.bossKills>=6&&!save.collections.pets.includes("moss"))save.collections.pets.push("moss");\n if(save.records.towerBest>=5&&!save.collections.relics.includes("steady_core"))save.collections.relics.push("steady_core");\n if(save.records.towerBest>=10&&!save.collections.relics.includes("guard_emblem"))save.collections.relics.push("guard_emblem");
 if(won)save.records.wins++;
 addSeasonPoints(save,Math.max(1,r.kills*2));\n const questDefs=[...catalog.QUEST_DEFS,{id:"daily_wave",target:2,metric:"runs",period:"daily",reward:{coins:100}},{id:"daily_kills",target:15,metric:"kills",period:"daily",reward:{energy:15}},{id:"daily_score",target:200,metric:"coinsEarned",period:"daily",reward:{coins:150}},{id:"weekly_runs",target:10,metric:"runs",period:"weekly",reward:{coins:500}},{id:"weekly_kills",target:100,metric:"kills",period:"weekly",reward:{energy:80}}];\n for(const [metric,amount] of [["runs",1],["kills",r.kills],["coinsEarned",coins]]) for(const q of questDefs.filter(q=>q.metric===metric)){const state=save.quests[q.id]??{progress:0,completed:false,claimed:false};state.progress=Math.min(q.target,state.progress+amount);state.period=q.period??"basic";state.completed=state.progress>=q.target;save.quests[q.id]=state;}\n save.records.coinsEarned=(save.records.coinsEarned??0)+coins;
 addEventProgress(save,"welcome_week",1);
 if(r.kills)save.quests.kill_10={...(save.quests.kill_10??{progress:0}),progress:Math.min(10,(save.quests.kill_10?.progress??0)+r.kills),completed:(save.quests.kill_10?.progress??0)+r.kills>=10};
 if(save.records.kills>=10)save.achievements.ten_kills={completed:true,claimed:false};
 save.achievements.first_run={completed:true,claimed:false};
 if(won)save.achievements.first_victory={completed:true,claimed:false};
 persist();activeRun=null;
 panel(won?"전투 승리":"전투 종료",`<div class="panel-stats"><span>처치 ${r.kills}</span><span>코인 +${coins}</span><span>에너지 +${energy}</span><span>EXP +${exp}</span></div><p class="panel-note">${level.levels? "레벨 업! "+level.levels+"회 상승했습니다.": "전투 기록을 저장했습니다."}</p>${btn("로비로","home")}`);
}
function renderWaveClear(){
 stopGameLoop();const r=activeRun;
 panel("웨이브 클리어",`<div class="panel-stats"><span>웨이브 ${r.wave}</span><span>처치 ${r.kills}</span><span>체력 ${Math.ceil(r.player.hp)}/${r.player.maxHp}</span></div><p class="panel-note">다음 웨이브로 진행할 수 있습니다.</p>${btn("다음 웨이브","next-wave")}${btn("이번 전투 종료","end-run")}`);
}
function towerFloorClear(){
 stopGameLoop();const r=activeRun;
 const outcome=resolveTowerFloor(save,r.tower,"victory");
 save.tower.essence=save.tower.essence??0;
 save.records.towerBest=Math.max(save.records.towerBest,outcome.floor);
 save.player.coins+=15+outcome.floor*3;save.player.energy+=1+Math.floor(outcome.floor/5);
 persist();
 if(outcome.type==="choice"){
  const choices=content.TOWER_CHOICES.map(c=>card(c.name,c.description,"탑 선택",btn("선택","tower-choice",c.id))).join("");
  panel("탑의 갈림길",`<p class="panel-note">${outcome.floor}층 도달! 다음 보상을 선택해.</p><div class="panel-grid">${choices}</div>`);
 }else panel("층 클리어",`<p class="panel-note">${outcome.floor}층으로 이동합니다.</p>${btn("다음 층","tower-next")}${btn("탑 종료","end-run")}`);
}
function openShop(){
 const list=catalog.SHOP_ITEMS.map(i=>row(i.name,i.description+` · ${i.price} 코인`,btn("구매","buy-shop",i.id,save.player.coins<i.price))).join("");
 panel("상점",`<div class="panel-stats"><span>코인 ${money(save.player.coins)}</span><span>에너지 ${money(save.player.energy)}</span></div><div class="system-list">${list}</div>`);
}
function openJobs(){
 const list=catalog.JOBS.map(j=>{const own=save.progression.ownedJobs.includes(j.id),active=save.progression.activeJob===j.id;return card(j.name,j.description,`공격 +${j.bonus.damage} · HP +${j.bonus.maxHp}`,active?btn("사용 중","noop","",true):own?btn("장착","equip-job",j.id):btn("구매 · "+j.price,"buy-job",j.id,save.player.coins<j.price));}).join("");
 panel("직업",`<div class="panel-grid">${list}</div>`);
}
function openUpgrades(){
 const stats=getPlayerStats(save,{...catalog,PET_DEFS:content.PET_DEFS,RELIC_DEFS:content.RELIC_DEFS});
 const list=catalog.PERMANENT_UPGRADES.map(i=>{const lv=save.progression.upgrades[i.id]??0,cost=getUpgradeCost(i,lv);return row(i.name,`${i.description} · Lv.${lv}/${i.max} · ${cost} 에너지`,btn("강화","upgrade",i.id,lv>=i.max||save.player.energy<cost));}).join("");
 panel("영구 업그레이드",`<div class="panel-stats"><span>HP ${stats.maxHp}</span><span>공격 ${stats.damage}</span><span>방어 ${stats.defense}</span><span>에너지 ${save.player.energy}</span></div><div class="system-list">${list}</div>`);
}
function openEquipment(){
 const list=catalog.EQUIPMENT.map(i=>{const own=!!save.progression.inventory[i.id],equipped=save.progression.equipment[i.slot]===i.id;return card(i.name,"슬롯 "+i.slot,Object.entries(i.bonus).map(([k,v])=>k+" +"+v).join(" · "),equipped?btn("장착 중","noop","",true):own?btn("장착","equip-item",i.id):btn("구매 · "+i.price,"buy-equipment",i.id,save.player.coins<i.price));}).join("");
 panel("장비",`<div class="panel-grid">${list}</div>`);
}
function openWeapons(){
 const list=content.WEAPON_DEFS.map(w=>{const owned=(save.progression.ownedWeapons??["starter_blaster"]).includes(w.id),active=save.progression.equipment.weapon===w.id;return card(w.name,w.description,`공격 ${w.damage} · 연사 ${w.cooldown}ms`,active?btn("장착 중","noop","",true):owned?btn("장착","equip-weapon",w.id):btn("구매 · "+w.price,"buy-weapon",w.id,save.player.coins<w.price));}).join("");
 panel("무기고",`<div class="panel-grid">${list}</div>`);
}
function openQuests(){
 const defs=[...catalog.QUEST_DEFS,{id:"daily_wave",name:"오늘의 전투",description:"전투 2회 완료",target:2,metric:"runs",period:"daily",reward:{coins:100}},{id:"daily_kills",name:"오늘의 사냥",description:"적 15명 처치",target:15,metric:"kills",period:"daily",reward:{energy:15}},{id:"daily_score",name:"오늘의 수집",description:"코인 200 획득",target:200,metric:"coinsEarned",period:"daily",reward:{coins:150}},{id:"weekly_runs",name:"주간 출전",description:"전투 10회 완료",target:10,metric:"runs",period:"weekly",reward:{coins:500}},{id:"weekly_kills",name:"주간 토벌",description:"적 100명 처치",target:100,metric:"kills",period:"weekly",reward:{energy:80}}];
 const list=defs.map(q=>{const s=save.quests[q.id]??{progress:0,completed:false,claimed:false};return row(q.name,`${q.period==="weekly"?"주간":q.period==="daily"?"일일":"기본"} · ${q.description} · ${s.progress??0}/${q.target}`,s.claimed?btn("완료","noop","",true):btn(s.completed?"보상 받기":"진행 중","claim-quest",q.id,!s.completed));}).join("");
 panel("퀘스트",`<div class="system-list">${list}</div>`);
}
function openAchievements(){
 const list=catalog.ACHIEVEMENT_DEFS.map(a=>{const s=save.achievements[a.id]??{};return row(a.name,a.description,s.claimed?btn("수령 완료","noop","",true):btn(s.completed?"보상 받기":"미달성","claim-achievement",a.id,!s.completed));}).join("");
 panel("업적",`<div class="system-list">${list}</div>`);
}
function openInventory(){
 const entries=Object.entries(save.progression.inventory).filter(([,n])=>n>0);
 panel("인벤토리",entries.length?`<div class="system-list">${entries.map(([id,n])=>row(id,"보유 수량 "+n,"")).join("")}</div>`:'<p class="panel-note">보유 아이템이 없습니다.</p>');
}
function openPets(){
 const list=content.PET_DEFS.map(p=>{const owned=(save.collections?.pets??[]).includes(p.id),active=save.progression.activePet===p.id;return card(p.name,p.description,"해금 조건: "+p.unlock,owned?(active?btn("장착 중","noop","",true):btn("장착","equip-pet",p.id)):btn("잠김","noop","",true));}).join("");
 panel("펫",`<p class="panel-note">보스 클리어 기록으로 해금되는 수집형 동료입니다. 해금 조건과 보너스는 표시된 기준을 따릅니다.</p><div class="panel-grid">${list}</div>`);
}
function openRelics(){
 const list=content.RELIC_DEFS.map(p=>{const owned=(save.collections?.relics??[]).includes(p.id),active=save.progression.activeRelic===p.id;return card(p.name,p.description,"해금 조건: "+p.unlock,owned?(active?btn("장착 중","noop","",true):btn("장착","equip-relic",p.id)):btn("잠김","noop","",true));}).join("");
 panel("유물",`<p class="panel-note">무한의 탑 진행으로 획득하는 영구 수집품입니다.</p><div class="panel-grid">${list}</div>`);
}
function openDaily(){
 const remaining=dailyRemaining(save),time=remaining?Math.ceil(remaining/3600000)+"시간 후 수령 가능":"지금 수령 가능";
 panel("일일 보상",`<p class="panel-note">연속 출석 ${save.daily?.streak??0}일 · ${time}</p>${btn(remaining?"아직 받을 수 없음":"오늘의 보상 받기","daily-claim","",!!remaining)}`);
}
function openSeason(){
 const lv=seasonLevel(save),list=content.SEASON_REWARDS.map(r=>row("시즌 "+r.level+"단계",r.label,save.season?.claimed?.includes(r.level)?btn("수령 완료","noop","",true):btn(lv>=r.level?"받기":"잠김","season-claim",String(r.level),lv<r.level))).join("");
 panel("시즌 패스",`<div class="panel-stats"><span>시즌 포인트 ${save.season?.points??0}</span><span>현재 단계 ${lv}</span></div><div class="system-list">${list}</div><p class="panel-note">전투를 완료하면 시즌 포인트를 획득합니다. 현재는 기본 보상 트랙이며 시즌 기간제 서버 동기화는 아직 없습니다.</p>`);
}
function openEvents(){
 const list=content.EVENT_DEFS.map(e=>{const s=save.events?.[e.id]??{progress:0,claimed:false};return row(e.name,e.description+` · ${Math.min(e.target,s.progress)}/${e.target}`,s.claimed?btn("수령 완료","noop","",true):btn(s.progress>=e.target?"보상 받기":"진행 중","event-claim",e.id,s.progress<e.target));}).join("");
 panel("이벤트",`<div class="system-list">${list}</div>`);
}
function openEnchant(){
 const list=catalog.EQUIPMENT.filter(i=>(save.progression.inventory[i.id]??0)>0).map(i=>{const lv=save.enchant?.[i.id]??0,cost=50+lv*75;return row(i.name,`강화 +${lv} · 비용 ${cost} 에너지`,btn("강화","enchant",i.id,save.player.energy<cost));}).join("");
 panel("인챈트",list?`<div class="system-list">${list}</div>`:'<p class="panel-note">강화할 장비가 없습니다. 상점에서 장비를 구매하세요.</p>');
}
function openSettings(){
 panel("설정",`<div class="system-list">${row("BGM 음량",`현재 ${Math.round(save.settings.bgmVolume*100)}%`,`<input class="field" style="width:110px" type="range" min="0" max="1" step=".05" value="${save.settings.bgmVolume}" data-setting="bgmVolume">`)}${row("효과음","",btn(save.settings.soundEnabled?"ON":"OFF","toggle-setting","soundEnabled"))}${row("화면 흔들림","",btn(save.settings.screenShake?"ON":"OFF","toggle-setting","screenShake"))}${row("저장 데이터","초기화는 되돌릴 수 없습니다.",btn("초기화","reset-save"))}</div>`);
}
function openSimple(title,msg){panel(title,`<p class="panel-note">${safe(msg)}</p>`);}
function handle(action,id){
 switch(action){
 case "close":closePanel();break;case "play":openPlay();break;case "mode":openMode(id);break;case "world":openWorld(id);break;
 case "choose-map":startCombat(id);break;case "choose-weapon":save.progression.equipment.weapon=id;persist();status("무기를 선택했습니다.");openWorld("world1");break;
 case "buy-weapon":{const w=content.WEAPON_DEFS.find(x=>x.id===id);if(save.player.coins>=w.price){save.player.coins-=w.price;save.progression.ownedWeapons??=["starter_blaster"];save.progression.ownedWeapons.push(id);persist();openWeapons();}else status("코인이 부족합니다.");break;}
 case "shop":openShop();break;case "buy-shop":{const i=catalog.SHOP_ITEMS.find(x=>x.id===id);const res=buyShopItem(save,i);status(res.message);persist();openShop();break;}
 case "jobs":openJobs();break;case "buy-job":{const res=purchaseJob(save,catalog.JOBS.find(x=>x.id===id));status(res.message);persist();openJobs();break;}case "equip-job":equipJob(save,catalog.JOBS.find(x=>x.id===id));persist();openJobs();break;
 case "upgrades":openUpgrades();break;case "upgrade":{const i=catalog.PERMANENT_UPGRADES.find(x=>x.id===id),lv=save.progression.upgrades[id]??0,cost=getUpgradeCost(i,lv);if(lv<i.max&&save.player.energy>=cost){save.player.energy-=cost;save.progression.upgrades[id]=lv+1;persist();openUpgrades();}break;}
 case "equipment":openEquipment();break;case "buy-equipment":{const res=purchaseEquipment(save,catalog.EQUIPMENT.find(x=>x.id===id));status(res.message);persist();openEquipment();break;}case "equip-item":equipItem(save,catalog.EQUIPMENT.find(x=>x.id===id));persist();openEquipment();break;
 case "weapons":openWeapons();break;case "inventory":openInventory();break;case "quests":openQuests();break;case "achievements":openAchievements();break;case "pets":openPets();break;case "relics":openRelics();break;
 case "daily":openDaily();break;case "daily-claim":{const r=claimDailyReward(save);status(r.ok?"일일 보상을 받았습니다.":"아직 보상 수령 시간이 아닙니다.");persist();openDaily();break;}
 case "season":openSeason();break;case "season-claim":{const r=content.SEASON_REWARDS.find(x=>x.level===Number(id));if(claimSeasonReward(save,r)){persist();openSeason();status("시즌 보상을 받았습니다.");}break;}
 case "events":openEvents();break;case "event-claim":{const e=content.EVENT_DEFS.find(x=>x.id===id);if(claimEventReward(save,e)){persist();openEvents();}break;}
 case "enchant":{const r=enchantEquipment(save,id);status(r.message);persist();openEnchant();break;}
 case "claim-quest":{const q=[...catalog.QUEST_DEFS,{id:"daily_wave",target:2,reward:{coins:100}},{id:"daily_kills",target:15,reward:{energy:15}},{id:"daily_score",target:200,reward:{coins:150}},{id:"weekly_runs",target:10,reward:{coins:500}},{id:"weekly_kills",target:100,reward:{energy:80}}].find(x=>x.id===id);const s=save.quests[id];if(s?.completed&&!s.claimed){s.claimed=true;grantReward(save,q.reward);persist();openQuests();}break;}
 case "claim-achievement":{const a=catalog.ACHIEVEMENT_DEFS.find(x=>x.id===id),s=save.achievements[id];if(s?.completed&&!s.claimed){s.claimed=true;grantReward(save,a.reward);persist();openAchievements();}break;}
 case "equip-pet":save.progression.activePet=id;persist();openPets();break;case "equip-relic":save.progression.activeRelic=id;persist();openRelics();break;
 case "daily-box":openDaily();break;case "notice":openSimple("공지사항","현재 등록된 공지사항이 없습니다.");break;case "enchant-menu":openEnchant();break;
 case "code":panel("쿠폰 코드",'<p class="panel-note">쿠폰 코드를 입력하세요.</p><input id="coupon-input" class="field" placeholder="예: HODU-START"><button class="action-button" data-action="redeem-code">등록</button>');break;
 case "redeem-code":{const input=document.querySelector("#coupon-input")?.value??"",r=redeemCoupon(save,input,content.COUPONS);status(r.message);persist();if(r.ok)closePanel();break;}
 case "settings":openSettings();break;case "toggle-setting":save.settings[id]=!save.settings[id];persist();openSettings();break;
 case "reset-save":if(confirm("저장 데이터를 초기화할까요?")){save=resetSave();closePanel();updateLobby();status("초기화했습니다.");}break;
 case "level":openSimple("플레이어 레벨",`Lv.${save.player.level} · EXP ${save.player.exp}/${expRequired(save.player.level)}`);break;
 case "star":openSimple("차원의 별","별 시스템은 별도 콘텐츠 규칙을 정한 뒤 추가합니다.");break;
 case "audio":save.settings.bgmEnabled=!save.settings.bgmEnabled;persist();break;
 case "weapons-menu":openWeapons();break;
 case "leave-game":stopGameLoop();activeRun=null;closePanel();updateLobby();break;
 case "next-wave":if(nextArenaWave(activeRun)){closePanel();startGameLoop();renderCombat();}break;
 case "end-run":finishRun(true);break;
 case "home":stopGameLoop();activeRun=null;closePanel();break;
 case "tower-choice":{const r=activeRun;if(id==="treasure"){save.player.coins+=100;save.player.energy+=15;}if(id==="rest")r.player.hp=Math.min(r.player.maxHp,r.player.hp+Math.ceil(r.player.maxHp*.4));persist();closePanel();r.wave=r.tower.floor;activeRun=startArena({stats:getPlayerStats(save,{...catalog,PET_DEFS:content.PET_DEFS,RELIC_DEFS:content.RELIC_DEFS}),weapon:getWeapon(),wave:r.tower.floor});activeRun.tower=r.tower;startGameLoop();renderCombat();break;}
 case "tower-next":{const r=activeRun;activeRun=startArena({stats:getPlayerStats(save,{...catalog,PET_DEFS:content.PET_DEFS,RELIC_DEFS:content.RELIC_DEFS}),weapon:getWeapon(),wave:r.tower.floor});activeRun.tower=r.tower;closePanel();startGameLoop();renderCombat();break;}
 case "noop":break;
 }
}
app.addEventListener("click",e=>{
 const a=e.target.closest("[data-action]");if(a){handle(a.dataset.action,a.dataset.id);return;}
 const h=e.target.closest("[data-hold]");if(h){const v=h.dataset.hold;if(v==="fire"){hold.fire=true;fireArena(activeRun);}else if(v==="left")hold.x=-1;else if(v==="right")hold.x=1;else if(v==="up")hold.y=-1;else if(v==="down")hold.y=1;}
});
app.addEventListener("pointerdown",e=>{const h=e.target.closest("[data-hold]");if(!h)return;const v=h.dataset.hold;if(v==="fire")hold.fire=true;else if(v==="left")hold.x=-1;else if(v==="right")hold.x=1;else if(v==="up")hold.y=-1;else if(v==="down")hold.y=1;});
window.addEventListener("pointerup",()=>{hold={x:0,y:0,fire:false};});
window.addEventListener("keydown",e=>{if(!activeRun)return;const k=e.key.toLowerCase();if(k==="arrowleft"||k==="a")hold.x=-1;if(k==="arrowright"||k==="d")hold.x=1;if(k==="arrowup"||k==="w")hold.y=-1;if(k==="arrowdown"||k==="s")hold.y=1;if(k===" "){e.preventDefault();hold.fire=true;}});
window.addEventListener("keyup",e=>{const k=e.key.toLowerCase();if(k==="arrowleft"||k==="a"||k==="arrowright"||k==="d")hold.x=0;if(k==="arrowup"||k==="w"||k==="arrowdown"||k==="s")hold.y=0;if(k===" ")hold.fire=false;});
document.querySelector("#bgm-volume")?.addEventListener("input",e=>{save.settings.bgmVolume=Number(e.target.value);save.settings.bgmEnabled=save.settings.bgmVolume>0;persist();});
app.addEventListener("input",e=>{if(e.target.dataset.setting==="bgmVolume"){save.settings.bgmVolume=Number(e.target.value);save.settings.bgmEnabled=save.settings.bgmVolume>0;persist();}});
app.querySelectorAll("[data-action]").forEach(()=>{});
document.documentElement.classList.add("app-ready");
updateLobby();
console.info("[Hodumaroo] Core systems loaded.");
