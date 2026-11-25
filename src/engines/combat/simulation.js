import { modifyMovementInput } from "./movement-gimmicks.js";
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function startArena({stats,weapon,wave=1,gimmick=null,mode="waves",boss=null}) {
  return {status:"playing",mode,wave,kills:0,bossKills:0,score:0,coinRate:stats.coinRate??1,elapsed:0,lastSpawn:0,lastShot:0,player:{x:0.5,y:0.5,hp:stats.maxHp,maxHp:stats.maxHp,stats},weapon,enemies:[],projectiles:[],enemyShots:[],nextId:1,spawned:0,waveGoal:mode==="boss"?1:mode==="challenge"?9999:5+wave*2,invulnerable:0,gimmick,boss};
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
function spawnBossShot(run,enemy,speed=.34){
  const dx=run.player.x-enemy.x,dy=run.player.y-enemy.y,len=Math.hypot(dx,dy)||1;
  run.enemyShots.push({x:enemy.x,y:enemy.y,vx:dx/len*speed,vy:dy/len*speed,damage:enemy.damage??8});
}
function moveBoss(run,enemy,dt){
  const dx=run.player.x-enemy.x,dy=run.player.y-enemy.y,len=Math.hypot(dx,dy)||1;
  enemy.attackTimer=(enemy.attackTimer??0)+dt;
  enemy.patternTimer=(enemy.patternTimer??0)+dt;
  const speed=enemy.speed;
  const chase=()=>{enemy.x+=dx/len*speed*dt;enemy.y+=dy/len*speed*dt;};
  switch(enemy.pattern){
    case "shooter":
      if(len>.34)chase();else if(len<.25){enemy.x-=dx/len*speed*dt;enemy.y-=dy/len*speed*dt;}
      if(enemy.attackTimer>1.7){spawnBossShot(run,enemy,.32);enemy.attackTimer=0;}
      break;
    case "orbit":{
      const angle=Math.atan2(dy,dx)+Math.PI/2;
      enemy.x+=Math.cos(angle)*speed*dt+dx/len*speed*.25*dt;
      enemy.y+=Math.sin(angle)*speed*dt+dy/len*speed*.25*dt;
      if(enemy.attackTimer>2.2){spawnBossShot(run,enemy,.28);enemy.attackTimer=0;}
      break;
    }
    case "charger":
      if(enemy.dashTime>0){enemy.x+=enemy.dashX*speed*4*dt;enemy.y+=enemy.dashY*speed*4*dt;enemy.dashTime-=dt;}
      else {chase();if(enemy.attackTimer>2.5){enemy.dashX=dx/len;enemy.dashY=dy/len;enemy.dashTime=.55;enemy.attackTimer=0;}}
      break;
    case "summoner":
      chase();
      if(enemy.attackTimer>4&&run.enemies.length<7){const a=Math.random()*Math.PI*2;run.enemies.push({id:run.nextId++,x:clamp(enemy.x+Math.cos(a)*.12,.05,.95),y:clamp(enemy.y+Math.sin(a)*.12,.07,.93),hp:24+run.wave*2,maxHp:24+run.wave*2,speed:.13,boss:false,damage:5});enemy.attackTimer=0;}
      break;
    case "teleport":
      chase();
      if(enemy.attackTimer>3){const a=Math.random()*Math.PI*2;enemy.x=clamp(run.player.x+Math.cos(a)*.34,.06,.94);enemy.y=clamp(run.player.y+Math.sin(a)*.34,.08,.92);enemy.attackTimer=0;}
      break;
    case "stomp":
      if(len>.2)chase();
      if(enemy.attackTimer>2.8){if(len<.24&&run.invulnerable<=0){run.player.hp-=enemy.damage;run.invulnerable=.8;}enemy.attackTimer=0;}
      break;
    case "pulse":
      if(len>.23)chase();
      if(enemy.attackTimer>2.4){if(len<.3&&run.invulnerable<=0){run.player.hp-=enemy.damage;run.invulnerable=.8;}enemy.attackTimer=0;}
      break;
    case "guard":
      chase();
      enemy.guarding=enemy.attackTimer%3.6>2.5;
      if(enemy.attackTimer>3.6)enemy.attackTimer=0;
      break;
    case "split":
      chase();
      if(enemy.hp<enemy.maxHp*.5)enemy.speed=Math.min(.23,enemy.baseSpeed*1.8);
      break;
    case "mixed":
      if(Math.floor(enemy.patternTimer/3)%2===0)chase();
      else if(enemy.attackTimer>1.4){spawnBossShot(run,enemy,.3);enemy.attackTimer=0;}
      break;
    default: chase();
  }
}
export function stepArena(run,dt,now=performance.now()) {
  if(run.status!=="playing")return;
  run.elapsed+=dt;
  run.invulnerable=Math.max(0,run.invulnerable-dt);
  if(run.spawned<run.waveGoal&&now-run.lastSpawn>Math.max(350,1300-run.wave*35)){
    const side=Math.floor(Math.random()*4),pos=Math.random()*0.8+0.1;
    const point=side===0?{x:0.04,y:pos}:side===1?{x:0.96,y:pos}:side===2?{x:pos,y:0.07}:{x:pos,y:0.93};
    const isBoss=run.mode==="boss"||(run.spawned===run.waveGoal-1&&run.wave%5===0);
    const def=isBoss?run.boss:null;
    const enemyHp=def?.hp??(isBoss?220+run.wave*10:18+run.wave*5);
    const enemySpeed=def?.speed??(0.10+Math.min(.09,run.wave*.004));
    run.enemies.push({id:run.nextId++,...point,hp:enemyHp,maxHp:enemyHp,speed:enemySpeed,baseSpeed:enemySpeed,boss:isBoss,bossId:def?.id??null,pattern:def?.pattern??"chase",damage:def?.damage??7,attackTimer:0,patternTimer:0,dashTime:0});
    run.spawned++;run.lastSpawn=now;
  }
  for(const enemy of run.enemies){
    if(enemy.boss)moveBoss(run,enemy,dt);
    else {
      const dx=run.player.x-enemy.x,dy=run.player.y-enemy.y,len=Math.hypot(dx,dy)||1;
      enemy.x+=dx/len*enemy.speed*dt;enemy.y+=dy/len*enemy.speed*dt;
    }
    const distance=Math.hypot(run.player.x-enemy.x,run.player.y-enemy.y);
    if(distance<.045&&run.invulnerable<=0){run.player.hp-=Math.max(1,(enemy.damage??5)-run.player.stats.defense);run.invulnerable=.7;}
  }
  for(const shot of run.projectiles){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;}
  for(const shot of run.enemyShots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;if(Math.hypot(shot.x-run.player.x,shot.y-run.player.y)<.035&&run.invulnerable<=0){run.player.hp-=Math.max(1,shot.damage-run.player.stats.defense);run.invulnerable=.65;shot.dead=true;}}
  for(const shot of run.projectiles){
    const hit=run.enemies.find(enemy=>Math.hypot(enemy.x-shot.x,enemy.y-shot.y)<.035);
    if(hit){hit.hp-=hit.guarding?shot.damage*.6:shot.damage;shot.dead=true;if(hit.hp<=0){hit.dead=true;run.kills++;if(hit.boss)run.bossKills++;run.score+=hit.boss?100:10;}}
    if(shot.x<0||shot.x>1||shot.y<0||shot.y>1)shot.dead=true;
  }
  run.projectiles=run.projectiles.filter(s=>!s.dead);
  run.enemyShots=run.enemyShots.filter(s=>!s.dead&&s.x>=0&&s.x<=1&&s.y>=0&&s.y<=1);
  run.enemies=run.enemies.filter(e=>!e.dead);
  if(run.player.hp<=0)run.status="lost";
  else if(run.mode==="challenge"&&run.elapsed>=90)run.status="won";
  else if(run.spawned>=run.waveGoal&&run.enemies.length===0)run.status=run.mode==="boss"?"won":"wave-clear";
}
export function nextArenaWave(run) {
  if(run.status!=="wave-clear")return false;
  run.wave++;run.spawned=0;run.waveGoal=5+run.wave*2;run.status="playing";run.player.hp=Math.min(run.player.maxHp,run.player.hp+Math.ceil(run.player.maxHp*.12));return true;
}
