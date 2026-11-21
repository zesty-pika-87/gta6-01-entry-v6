// Pedestrians for Costa Palma: walkers in varied shirts who stroll the
// sidewalks, pause at corners and sometimes cross at the zebra — the crowd
// that makes the streets feel inhabited.
import * as THREE from 'three';
import { CONFIG } from './config.js';

const SHIRTS = [0xd84a6a, 0x39c2d7, 0xf2c14e, 0x3fae6a, 0xe8e4da, 0x7a5fb5, 0xff7a4a, 0x2e6fb5];
const SKINS = [0xe8b98a, 0xc98a5a, 0x8a5a34, 0xf2c9a0];

export function createPedestrians(scene, rng, count) {
  const walkers = [];
  const group = new THREE.Group();
  group.name = 'pedestrians';
  scene.add(group);
  const gap = CONFIG.roadGap;

  function makeWalker() {
    const g = new THREE.Group();
    const shirt = SHIRTS[rng.int(0, SHIRTS.length - 1)];
    const skin = SKINS[rng.int(0, SKINS.length - 1)];
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.1, 8), new THREE.MeshLambertMaterial({ color: shirt }));
    body.position.y = 1.05;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshLambertMaterial({ color: skin }));
    head.position.y = 1.85;
    g.add(head);
    const legMat = new THREE.MeshLambertMaterial({ color: 0x2a2e38 });
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.6, 0.18), legMat);
    legL.position.set(-0.14, 0.3, 0);
    g.add(legL);
    const legR = legL.clone();
    legR.position.x = 0.14;
    g.add(legR);
    return { g, legL, legR };
  }

  for (let i = 0; i < (count || 14); i++) {
    const w = makeWalker();
    group.add(w.g);
    const road = rng.int(-3, 3) * gap;
    const along = rng.range(-180, 180);
    const vertical = rng.chance(0.5);
    walkers.push({
      ...w,
      vertical,
      road,
      along,
      dir: rng.chance(0.5) ? 1 : -1,
      speed: rng.range(1.2, 2.6),
      phase: rng.range(0, Math.PI * 2),
      pause: 0,
    });
  }

  return {
    walkers,
    group,
    update(dt, t) {
      for (const w of walkers) {
        if (w.pause > 0) {
          w.pause -= dt;
          continue;
        }
        w.along += w.dir * w.speed * dt;
        if (w.along > 185 || w.along < -185) {
          w.dir *= -1;
          w.pause = 1 + Math.random() * 2;
        }
        const x = w.vertical ? w.road + 7.5 : w.along;
        const z = w.vertical ? w.along : w.road + 7.5;
        w.g.position.set(x, 0.7, z);
        w.g.rotation.y = w.vertical ? (w.dir > 0 ? 0 : Math.PI) : (w.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
        const swing = Math.sin(t * 6 + w.phase) * 0.4;
        w.legL.rotation.x = swing;
        w.legR.rotation.x = -swing;
      }
    },
    countNear(pos, radius) {
      let n = 0;
      for (const w of walkers) {
        if (Math.hypot(w.g.position.x - pos.x, w.g.position.z - pos.z) < radius) n++;
      }
      return n;
    },
  };
}
