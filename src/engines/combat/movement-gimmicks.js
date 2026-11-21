export function createMovementGimmick(type, options = {}) {
  if (!type || type === "none") return null;
  return { type, center: options.center ?? { x: .5, y: .5 }, radius: options.radius ?? .22, strength: options.strength ?? .24, velocity: { x: 0, y: 0 } };
}
export function modifyMovementInput(gimmick, player, dx, dy, dt) {
  if (!gimmick) return { dx, dy, extraX: 0, extraY: 0 };
  const distance = Math.hypot(player.x - gimmick.center.x, player.y - gimmick.center.y);
  const inside = distance <= gimmick.radius;
  if (gimmick.type === "direction-reverse" && inside) return { dx: -dx, dy: -dy, extraX: 0, extraY: 0 };
  if (gimmick.type === "ice") {
    const blend = Math.min(1, dt * 2.8);
    gimmick.velocity.x += (dx - gimmick.velocity.x) * blend;
    gimmick.velocity.y += (dy - gimmick.velocity.y) * blend;
    return { dx: gimmick.velocity.x, dy: gimmick.velocity.y, extraX: 0, extraY: 0 };
  }
  if (gimmick.type === "attraction" && inside && distance > .001) {
    return { dx, dy, extraX: (gimmick.center.x-player.x)/distance*gimmick.strength, extraY: (gimmick.center.y-player.y)/distance*gimmick.strength };
  }
  return { dx, dy, extraX: 0, extraY: 0 };
}
