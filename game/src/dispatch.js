// Dispatch panel data for Costa Palma: the named police units, their roles
// and their live distance to the player — the panel the HUD draws each frame.
import { DISPATCH_NAMES, DISPATCH_ROLES } from './config.js';

export function buildDispatch(units, playerPos) {
  const rows = [];
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    const dist = Math.round(Math.hypot(u.x - playerPos.x, u.z - playerPos.z));
    rows.push({
      name: DISPATCH_NAMES[i % DISPATCH_NAMES.length],
      role: u.role || DISPATCH_ROLES[i % DISPATCH_ROLES.length],
      dist,
      status: dist < 20 ? 'IN SIGHT' : dist < 60 ? 'CLOSING IN' : 'EN ROUTE',
    });
  }
  return rows;
}

export function dispatchUnitsFor(wanted, police, playerPos) {
  const units = [];
  const roles = ['PURSUIT', 'RAMMING', 'FLANKING', 'SPOTLIGHT', 'ROADBLOCK', 'FOOT CHASE'];
  for (let i = 0; i < police.cruisers.length; i++) {
    const c = police.cruisers[i];
    units.push({ x: c.mesh.position.x, z: c.mesh.position.z, role: roles[i % roles.length] });
  }
  for (let i = 0; i < police.footCops.length; i++) {
    const f = police.footCops[i];
    units.push({ x: f.g.position.x, z: f.g.position.z, role: 'FOOT CHASE' });
  }
  if (police.heli) {
    units.push({ x: police.heli.g.position.x, z: police.heli.g.position.z, role: 'SPOTLIGHT' });
  }
  if (units.length === 0 && wanted === 0) {
    units.push({ x: playerPos.x + 90, z: playerPos.z + 40, role: 'SHORE WATCH' });
  }
  return units;
}
