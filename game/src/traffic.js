// Traffic for Costa Palma: AI cars in varied colours and shapes that run
// rectangular loops around the blocks, slow for junctions and keep the
// streets feeling alive behind the player.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { buildCarMesh, randomCarDef } from './vehicles.js';

export function createTraffic(scene, rng, count) {
  const cars = [];
  const gap = CONFIG.roadGap;
  const group = new THREE.Group();
  group.name = 'traffic';
  scene.add(group);

  function loopFor(i) {
    const bx = (rng.int(-3, 2)) * gap + gap / 2;
    const bz = (rng.int(-3, 2)) * gap + gap / 2;
    const w = gap;
    return [
      new THREE.Vector3(bx - w / 2 + 5, 0.4, bz - w / 2 + 5),
      new THREE.Vector3(bx + w / 2 - 5, 0.4, bz - w / 2 + 5),
      new THREE.Vector3(bx + w / 2 - 5, 0.4, bz + w / 2 - 5),
      new THREE.Vector3(bx - w / 2 + 5, 0.4, bz + w / 2 - 5),
    ];
  }

  for (let i = 0; i < (count || 9); i++) {
    const def = randomCarDef(rng);
    const mesh = buildCarMesh(def.color, def.type, false);
    group.add(mesh);
    const loop = loopFor(i);
    cars.push({
      mesh, def, loop, wp: rng.int(0, 3),
      speed: rng.range(7, 12),
      pos: loop[0].clone(),
    });
    cars[i].pos.copy(loop[cars[i].wp]);
  }

  return {
    cars,
    group,
    update(dt, playerPos) {
      for (const car of cars) {
        const target = car.loop[(car.wp + 1) % 4];
        const dx = target.x - car.pos.x;
        const dz = target.z - car.pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 1.2) {
          car.wp = (car.wp + 1) % 4;
          continue;
        }
        // Ease off when the player is right ahead, so traffic feels aware.
        let speed = car.speed;
        if (playerPos) {
          const pd = Math.hypot(playerPos.x - car.pos.x, playerPos.z - car.pos.z);
          if (pd < 7) speed *= 0.25;
        }
        car.pos.x += (dx / dist) * speed * dt;
        car.pos.z += (dz / dist) * speed * dt;
        car.mesh.position.copy(car.pos);
        car.mesh.rotation.y = Math.atan2(dx, dz);
      }
    },
    nearest(pos, maxDist) {
      let best = null;
      let bd = maxDist;
      for (const car of cars) {
        const d = Math.hypot(car.mesh.position.x - pos.x, car.mesh.position.z - pos.z);
        if (d < bd) { bd = d; best = car; }
      }
      return best;
    },
  };
}
