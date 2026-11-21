// Facades for Costa Palma: warm varied buildings with lit windows, roof
// clutter, shop awnings and glowing original signs — the detail that makes
// the city read as a place instead of a row of brown boxes.
import * as THREE from 'three';
import { SHOP_SIGNS } from './config.js';

const FACADE_COLORS = [0xe8a05c, 0xe07856, 0xf2c14e, 0xe8d8a8, 0xd96a8a, 0xc98a5a, 0x7fb8a8, 0x9a7fb5, 0xe8b48a, 0xcf8a6a];
const AWNING_COLORS = [0xd8382c, 0x39c2d7, 0x3fae6a, 0xff5da2, 0xf2c14e];

function windowTexture(rng, warm, base) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  // The wall itself is the facade colour; windows are cut into it.
  g.fillStyle = base;
  g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      const lit = rng.chance(warm ? 0.55 : 0.3);
      g.fillStyle = lit ? (rng.chance(0.5) ? '#ffd98a' : '#9ad7ff') : '#241f1c';
      g.fillRect(8 + x * 30, 8 + y * 30, 20, 20);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function signTexture(text, color) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = '#14101c';
  g.fillRect(0, 0, 256, 64);
  g.fillStyle = color;
  g.font = 'bold 30px system-ui, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 34);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildBuildings(scene, blocks, rng) {
  const group = new THREE.Group();
  group.name = 'buildings';
  scene.add(group);
  const roofMat = new THREE.MeshLambertMaterial({ color: 0x6a6258 });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x3a3f46 });
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x7a5230 });
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x3fae5a, side: THREE.DoubleSide });
  let signIndex = 0;
  const palms = [];

  for (const block of blocks) {
    const count = rng.int(2, 4);
    for (let k = 0; k < count; k++) {
      const w = rng.range(9, 15);
      const d = rng.range(9, 15);
      const h = rng.range(9, block.district.id === 'neon' ? 42 : 26);
      const x = block.cx + rng.range(-block.size / 2 + w / 2 + 2, block.size / 2 - w / 2 - 2);
      const z = block.cz + rng.range(-block.size / 2 + d / 2 + 2, block.size / 2 - d / 2 - 2);
      const color = FACADE_COLORS[rng.int(0, FACADE_COLORS.length - 1)];
      const baseHex = '#' + color.toString(16).padStart(6, '0');
      const tex = windowTexture(rng, block.district.id === 'neon', baseHex);
      const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.28, map: tex });
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      b.position.set(x, h / 2 + 0.4, z);
      b.castShadow = true;
      b.receiveShadow = true;
      group.add(b);
      // Roof clutter: AC box, antenna, water tank.
      const ac = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.6), roofMat);
      ac.position.set(x - w / 4, h + 0.9, z);
      group.add(ac);
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, rng.range(3, 6), 5), darkMat);
      ant.position.set(x + w / 4, h + 2.4, z - d / 4);
      group.add(ant);
      if (rng.chance(0.4)) {
        const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 2.4, 8), new THREE.MeshLambertMaterial({ color: 0x8a6a4a }));
        tank.position.set(x + w / 4, h + 1.6, z + d / 4);
        group.add(tank);
      }
      // Shopfront on the ground floor: awning + glowing sign.
      if (rng.chance(0.75)) {
        const awn = new THREE.Mesh(new THREE.BoxGeometry(w * 0.8, 0.4, 3), new THREE.MeshLambertMaterial({ color: AWNING_COLORS[rng.int(0, AWNING_COLORS.length - 1)] }));
        awn.position.set(x, 3.6, z + d / 2 + 1.2);
        awn.rotation.x = 0.25;
        group.add(awn);
        const label = SHOP_SIGNS[signIndex % SHOP_SIGNS.length];
        signIndex += 1;
        const sign = new THREE.Mesh(
          new THREE.PlaneGeometry(Math.min(11, w * 0.9), 2.2),
          new THREE.MeshBasicMaterial({ map: signTexture(label, ['#ff5da2', '#ffd98a', '#39c2d7', '#7dffb0'][signIndex % 4]) }),
        );
        sign.position.set(x, 5.6, z + d / 2 + 0.15);
        group.add(sign);
      }
    }
    // Palms lining the block: layered fronds, varied heights.
    const palmsHere = rng.int(2, 4);
    for (let p = 0; p < palmsHere; p++) {
      const px = block.cx + rng.range(-block.size / 2, block.size / 2);
      const pz = block.cz + rng.range(-block.size / 2, block.size / 2);
      const palm = new THREE.Group();
      const height = rng.range(7, 12);
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.45, height, 6), trunkMat);
      trunk.position.y = height / 2;
      trunk.rotation.z = rng.range(-0.08, 0.08);
      palm.add(trunk);
      for (let f = 0; f < 7; f++) {
        const frond = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.6), frondMat);
        const a = (f / 7) * Math.PI * 2;
        frond.position.set(Math.cos(a) * 1.7, height + 0.4, Math.sin(a) * 1.7);
        frond.rotation.set(Math.sin(a) * 1.1, a, Math.cos(a) * -1.1);
        palm.add(frond);
      }
      palm.position.set(px, 0.4, pz);
      group.add(palm);
      palms.push(palm);
    }
  }

  // Plaza fountain: stone ring and a bright water disc.
  const fountain = new THREE.Group();
  fountain.position.set(-60, 0.4, -60);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(7, 1.1, 8, 24), new THREE.MeshLambertMaterial({ color: 0xcfc4a8 }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.8;
  fountain.add(ring);
  const water = new THREE.Mesh(new THREE.CircleGeometry(6.6, 24), new THREE.MeshLambertMaterial({ color: 0x39c2d7 }));
  water.rotation.x = -Math.PI / 2;
  water.position.y = 1.0;
  fountain.add(water);
  const spout = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 3.4, 8), new THREE.MeshLambertMaterial({ color: 0xcfc4a8 }));
  spout.position.y = 1.8;
  fountain.add(spout);
  group.add(fountain);

  // Harbour containers, stacked in bright rows, plus a dock crane.
  const containerColors = [0xd8382c, 0x39c2d7, 0xf2c14e, 0x3fae6a, 0xff7a4a];
  for (let i = 0; i < 12; i++) {
    const cont = new THREE.Mesh(
      new THREE.BoxGeometry(9, 3.2, 3),
      new THREE.MeshLambertMaterial({ color: containerColors[i % containerColors.length] }),
    );
    cont.position.set(128 + (i % 4) * 11, 2 + Math.floor(i / 4) * 3.4, -30 + Math.floor(i / 4) * 8);
    cont.castShadow = true;
    group.add(cont);
  }
  const crane = new THREE.Group();
  crane.position.set(150, 0, 20);
  const mast = new THREE.Mesh(new THREE.BoxGeometry(2, 26, 2), new THREE.MeshLambertMaterial({ color: 0xf2c14e }));
  mast.position.y = 13;
  crane.add(mast);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(26, 1.4, 1.4), new THREE.MeshLambertMaterial({ color: 0xf2c14e }));
  arm.position.set(8, 25, 0);
  crane.add(arm);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), darkMat);
  hook.position.set(16, 18, 0);
  crane.add(hook);
  group.add(crane);

  return {
    group,
    palms,
    update(dt, t) {
      for (let i = 0; i < palms.length; i++) {
        palms[i].rotation.z = Math.sin(t * 0.8 + i) * 0.02;
      }
    },
  };
}
