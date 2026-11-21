import { createMovementGimmick, modifyMovementInput } from "./movement-gimmicks.js";
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function startArena({stats,weapon,wave=1,gimmick=null,mode="waves"}) {
  return {status:"playing",mode,wave,kills:0,bossKills:0,score:0,elapsed:0,lastSpawn:0,lastShot:0,player:{x:0.5,y:0.5,hp:stats.maxHp,maxHp:stats.maxHp,stats},weapon,enemies:[],projectiles:[],nextId:1,spawned:0,waveGoal:mode==="boss"?1:mode==="challenge"?9999:5+wave*2,invulnerable:0};
}
export function moveArenaPlayer(run,dx,dy,dt) {
  if(run.status!=="playing")return;
  const input=modifyMovementInput(run.gimmick,run.player,dx,dy,dt);
  dx=input.dx;dy=input.dy;
  const length=Math.hypot(dx,dy)||1;
  const speed=0.48*run.player.stats.speed;
  run.player.x=clamp(run.player.x+(dx/length*speed+input.extraX)*dt,0.035,0.965);
  run.player.y=clamp(run.player.y+(dy/length*speed+input.extraY)*dt,0.06,0.94);
}
export function fireArena(run,now=performance.now()) {
  if(run.status!=="playing"||now-run.lastShot<run.weapon.cooldown)return false;
  run.lastShot=now;
  const target=run.enemies.reduce((best,e)=>!best||Math.hypot(e.x-run.player.x,e.y-run.player.y)<Math.hypot(best.x-run.player.x,best.y-run.player.y)?e:best,null);
  if(!target)return false;
  const dx=target.x-run.player.x,dy=target.y-run.player.y,len=Math.hypot(dx,dy)||1;
  run.projectiles.push({x:run.player.x,y:run.player.y,vx:dx/len*1.4,vy:dy/len*1.4,damage:run.weapon.damage+run.player.stats.damage});
  return true;
}
export function stepArena(run,dt,now=performance.now()) {
  if(run.status!=="playing")return;
  run.elapsed+=dt;
  run.invulnerable=Math.max(0,run.invulnerable-dt);
  if(run.spawned<run.waveGoal&&now-run.lastSpawn>Math.max(350,1300-run.wave*35)){
    const side=Math.floor(Math.random()*4),pos=Math.random()*0.8+0.1;
    const point=side===0?{x:0.04,y:pos}:side===1?{x:0.96,y:pos}:side===2?{x:pos,y:0.07}:{x:pos,y:0.93};
    run.enemies.push({id:run.nextId++,...point,hp:run.mode==="boss"?220:18+run.wave*5,maxHp:run.mode==="boss"?220:18+run.wave*5,speed:0.10+Math.min(.09,run.wave*.004),boss:run.mode==="boss"||(run.spawned===run.waveGoal-1&&run.wave%5===0)});
    run.spawned++;run.lastSpawn=now;
  }
  for(const enemy of run.enemies){
    const dx=run.player.x-enemy.x,dy=run.player.y-enemy.y,len=Math.hypot(dx,dy)||1;
    enemy.x+=dx/len*enemy.speed*dt;enemy.y+=dy/len*enemy.speed*dt;
    if(len<0.045&&run.invulnerable<=0){run.player.hp-=Math.max(1,5-run.player.stats.defense);run.invulnerable=.7;}
  }
  for(const shot of run.projectiles){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;}
  for(const shot of run.projectiles){
    const hit=run.enemies.find(enemy=>Math.hypot(enemy.x-shot.x,enemy.y-shot.y)<.035);
    if(hit){hit.hp-=shot.damage;shot.dead=true;if(hit.hp<=0){hit.dead=true;run.kills++;if(hit.boss)run.bossKills++;run.score+=hit.boss?100:10;}}
    if(shot.x<0||shot.x>1||shot.y<0||shot.y>1)shot.dead=true;
  }
  run.projectiles=run.projectiles.filter(s=>!s.dead);
  run.enemies=run.enemies.filter(e=>!e.dead);
  if(run.player.hp<=0)run.status="lost";
  else if(run.mode==="challenge"&&run.elapsed>=90)run.status="won";
  else if(run.spawned>=run.waveGoal&&run.enemies.length===0)run.status=run.mode==="boss"?"won":"wave-clear";
}
export function nextArenaWave(run) {
  if(run.status!=="wave-clear")return false;
  run.wave++;run.spawned=0;run.waveGoal=5+run.wave*2;run.status="playing";run.player.hp=Math.min(run.player.maxHp,run.player.hp+Math.ceil(run.player.maxHp*.12));return true;
}
