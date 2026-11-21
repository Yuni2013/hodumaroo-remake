export function startShooter(stats) { return {status:"playing",score:0,kills:0,time:0,spawn:0,shot:0,player:{x:.5,hp:3},enemies:[],shots:[],id:1,stats}; }
export function stepShooter(run,dt,now=performance.now()) {
 if(run.status!=="playing")return;
 run.time+=dt;
 if(now-run.spawn>800){run.enemies.push({id:run.id++,x:.08+Math.random()*.84,y:-.05,hp:1+Math.floor(run.time/45),speed:.12+Math.min(.1,run.time/300)});run.spawn=now;}
 if(now-run.shot>280){run.shots.push({x:run.player.x,y:.88,vy:-.8});run.shot=now;}
 for(const e of run.enemies)e.y+=e.speed*dt;
 for(const s of run.shots)s.y+=s.vy*dt;
 for(const s of run.shots){const hit=run.enemies.find(e=>Math.hypot(e.x-s.x,e.y-s.y)<.035);if(hit){hit.hp--;s.dead=true;if(hit.hp<=0){hit.dead=true;run.kills++;run.score+=10;}}}
 for(const e of run.enemies)if(e.y>.91){e.dead=true;run.player.hp--;}
 run.enemies=run.enemies.filter(e=>!e.dead);run.shots=run.shots.filter(s=>!s.dead&&s.y>-.1);
 if(run.player.hp<=0)run.status="lost";
}
