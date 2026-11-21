// The city of Costa Palma itself: ground, roads, beach, sea, sky, sun,
// clouds and the block layout every other system builds on. Seeded, so
// the same seed always lays out the same streets.
import * as THREE from 'three';
import { CONFIG, DISTRICTS } from './config.js';

function skyTexture(hour) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  if (hour >= 19.5 || hour < 5) {
    grad.addColorStop(0, '#1b1440');
    grad.addColorStop(0.55, '#5b2a63');
    grad.addColorStop(0.8, '#c65b7c');
    grad.addColorStop(1, '#ff9a5c');
  } else if (hour >= 16) {
    grad.addColorStop(0, '#3f6fb5');
    grad.addColorStop(0.45, '#e08a5c');
    grad.addColorStop(0.75, '#ff9e57');
    grad.addColorStop(1, '#ffc46b');
  } else {
    grad.addColorStop(0, '#2f7fd0');
    grad.addColorStop(0.6, '#7fb8e8');
    grad.addColorStop(1, '#fde9b8');
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, 16, 256);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function buildWorld(scene, rng, hour) {
  const group = new THREE.Group();
  group.name = 'world';
  scene.add(group);

  // Sky dome: a big sphere painted with the hour's gradient, plus the sun.
  let lastBand = hour >= 19.5 || hour < 5 ? 'night' : hour >= 16 ? 'golden' : 'day';
  const skyMat = new THREE.MeshBasicMaterial({ map: skyTexture(hour), side: THREE.BackSide, fog: false });
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(900, 24, 16),
    skyMat,
  );
  sky.name = 'skyDome';
  group.add(sky);

  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(34, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe9a8, fog: false, transparent: true, opacity: 0.98 }),
  );
  sun.position.set(10, 200, 620);
  sun.lookAt(0, 40, 0);
  group.add(sun);
  const sunGlow = new THREE.Mesh(
    new THREE.CircleGeometry(58, 32),
    new THREE.MeshBasicMaterial({ color: 0xffb45c, fog: false, transparent: true, opacity: 0.35 }),
  );
  sunGlow.position.set(12, 200, 622);
  sunGlow.lookAt(0, 40, 0);
  group.add(sunGlow);

  // Clouds: flat white puffs drifting slowly over the city.
  const clouds = [];
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfff2dd, transparent: true, opacity: 0.85, fog: false });
  for (let i = 0; i < 14; i++) {
    const cloud = new THREE.Group();
    const puffs = 3 + rng.int(0, 3);
    for (let p = 0; p < puffs; p++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(rng.range(9, 18), 10, 8), cloudMat);
      s.position.set(p * rng.range(8, 14) - puffs * 6, rng.range(-2, 3), rng.range(-6, 6));
      s.scale.y = 0.45;
      cloud.add(s);
    }
    cloud.position.set(rng.range(-320, 320), rng.range(85, 125), rng.range(-320, 320));
    group.add(cloud);
    clouds.push(cloud);
  }

  // Ground: warm sand base for the whole island, city slab on top.
  const ground = new THREE.Mesh(
    new THREE.BoxGeometry(720, 1, 720),
    new THREE.MeshLambertMaterial({ color: 0xd9b380 }),
  );
  ground.position.y = -0.55;
  ground.receiveShadow = true;
  group.add(ground);

  const citySlab = new THREE.Mesh(
    new THREE.BoxGeometry(400, 1.2, 400),
    new THREE.MeshLambertMaterial({ color: 0x9c8a70 }),
  );
  citySlab.position.y = -0.1;
  citySlab.receiveShadow = true;
  group.add(citySlab);

  // Sea: a wide blue plane west and south of the city, with a pale shore line.
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(900, 420),
    new THREE.MeshLambertMaterial({ color: 0x2e7f9e, transparent: true, opacity: 0.96 }),
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.set(-360, 0.4, 120);
  group.add(sea);
  const shore = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 420),
    new THREE.MeshLambertMaterial({ color: 0xefe0b8 }),
  );
  shore.rotation.x = -Math.PI / 2;
  shore.position.set(-205, 0.5, 120);
  group.add(shore);

  // Roads: dark asphalt strips on a grid, with pale centre dashes and
  // raised sidewalk ribbons alongside. The layout is the city's skeleton.
  const roadMat = new THREE.MeshLambertMaterial({ color: 0x3a3742 });
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xf2f0e8 });
  const walkMat = new THREE.MeshLambertMaterial({ color: 0xb8a888 });
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xe8d84a });
  const roads = [];
  const gap = CONFIG.roadGap;
  for (let i = -3; i <= 3; i++) {
    const c = i * gap;
    const roadV = new THREE.Mesh(new THREE.BoxGeometry(11, 0.3, 400), roadMat);
    roadV.position.set(c, 0.55, 0);
    roadV.receiveShadow = true;
    group.add(roadV);
    const roadH = new THREE.Mesh(new THREE.BoxGeometry(400, 0.3, 11), roadMat);
    roadH.position.set(0, 0.55, c);
    roadH.receiveShadow = true;
    group.add(roadH);
    // Solid white edge lines so each road reads at a glance.
    for (const e of [-4.9, 4.9]) {
      const edgeV = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 400), edgeMat);
      edgeV.position.set(c + e, 0.76, 0);
      group.add(edgeV);
      const edgeH = new THREE.Mesh(new THREE.BoxGeometry(400, 0.14, 0.5), edgeMat);
      edgeH.position.set(0, 0.76, c + e);
      group.add(edgeH);
    }
    roads.push({ x: c, vertical: true });
    roads.push({ x: c, vertical: false });
    for (let j = -3; j <= 3; j++) {
      const dash = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 4), dashMat);
      dash.position.set(c, 0.75, j * gap + gap / 2);
      group.add(dash);
      const dash2 = new THREE.Mesh(new THREE.BoxGeometry(4, 0.15, 0.7), dashMat);
      dash2.position.set(j * gap + gap / 2, 0.75, c);
      group.add(dash2);
    }
    for (const s of [-1, 1]) {
      const walkV = new THREE.Mesh(new THREE.BoxGeometry(3, 0.6, 400), walkMat);
      walkV.position.set(c + s * 7.5, 0.7, 0);
      walkV.receiveShadow = true;
      group.add(walkV);
      const walkH = new THREE.Mesh(new THREE.BoxGeometry(400, 0.6, 3), walkMat);
      walkH.position.set(0, 0.7, c + s * 7.5);
      walkH.receiveShadow = true;
      group.add(walkH);
    }
  }

  // Zebra crossings at the central junctions.
  const zebraMat = new THREE.MeshBasicMaterial({ color: 0xf2f0e8 });
  for (const [jx, jz] of [[0, 0], [46, 0], [0, 46], [-46, -46]]) {
    for (let k = -2; k <= 2; k++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 5), zebraMat);
      stripe.position.set(jx + k * 2.1, 0.78, jz - 7.5);
      group.add(stripe);
    }
  }

  // Block layout: the centres between roads, tagged with their district,
  // so buildings, palms and props all agree where each quarter of town is.
  const blocks = [];
  for (let i = -3; i < 3; i++) {
    for (let j = -3; j < 3; j++) {
      const cx = i * gap + gap / 2;
      const cz = j * gap + gap / 2;
      let district = DISTRICTS[0];
      let bd = Infinity;
      for (const d of DISTRICTS) {
        const dd = (cx - d.cx) * (cx - d.cx) + (cz - d.cz) * (cz - d.cz);
        if (dd < bd) { bd = dd; district = d; }
      }
      blocks.push({ cx, cz, district, size: gap - 16 });
    }
  }

  // Street props: lamps, benches, hydrants and beach umbrellas.
  const lampMat = new THREE.MeshLambertMaterial({ color: 0x3a3f46 });
  const lampGlowMat = new THREE.MeshBasicMaterial({ color: 0xffe9a8 });
  const benchMat = new THREE.MeshLambertMaterial({ color: 0x8a5a34 });
  for (let i = -3; i <= 3; i++) {
    for (let j = -3; j <= 3; j++) {
      const x = i * gap + 9;
      const z = j * gap + 9;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7, 6), lampMat);
      pole.position.set(x, 3.5, z);
      group.add(pole);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 6), lampGlowMat);
      lamp.position.set(x, 7.1, z);
      group.add(lamp);
      if ((i + j) % 2 === 0) {
        const bench = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 1.2), benchMat);
        bench.position.set(x - 2, 1.0, z + 3);
        group.add(bench);
      }
    }
  }
  const umbrellaColors = [0xff5da2, 0x39c2d7, 0xf2c14e, 0xff7a4a];
  for (let i = 0; i < 10; i++) {
    const ux = -215 + rng.range(-8, 8);
    const uz = -140 + i * 34 + rng.range(-6, 6);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.4, 6), lampMat);
    pole.position.set(ux, 1.7, uz);
    group.add(pole);
    const top = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.4, 8), new THREE.MeshLambertMaterial({ color: umbrellaColors[i % 4] }));
    top.position.set(ux, 3.8, uz);
    group.add(top);
  }

  // Ferris wheel on the pier: the landmark you can see from anywhere.
  const wheel = new THREE.Group();
  wheel.position.set(-196, 26, -90);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(15, 0.9, 8, 28), new THREE.MeshLambertMaterial({ color: 0xff5da2 }));
  wheel.add(rim);
  for (let k = 0; k < 8; k++) {
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), new THREE.MeshLambertMaterial({ color: [0x39c2d7, 0xf2c14e, 0xff7a4a, 0x3fae6a][k % 4] }));
    const a = (k / 8) * Math.PI * 2;
    cab.position.set(Math.cos(a) * 15, Math.sin(a) * 15, 0);
    wheel.add(cab);
  }
  const legA = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 30, 6), lampMat);
  legA.position.set(-196, 13, -90);
  legA.rotation.z = 0.35;
  group.add(legA);
  const legB = legA.clone();
  legB.rotation.z = -0.35;
  group.add(legB);
  group.add(wheel);

  // Lighthouse at the harbour mouth.
  const light = new THREE.Group();
  light.position.set(168, 0, -140);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(3, 4.4, 26, 10), new THREE.MeshLambertMaterial({ color: 0xf2efe4 }));
  tower.position.y = 13;
  light.add(tower);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 4, 10), new THREE.MeshLambertMaterial({ color: 0xd8382c }));
  band.position.y = 18;
  light.add(band);
  const lampTop = new THREE.Mesh(new THREE.SphereGeometry(2.2, 10, 8), lampGlowMat);
  lampTop.position.y = 27;
  light.add(lampTop);
  group.add(light);

  // Night-market stalls around the plaza fountain: striped canopies and
  // counters in bright colours, so the plaza reads as a market after dark.
  const stallColors = [0xff5da2, 0x39c2d7, 0xf2c14e, 0x3fae6a, 0xff7a4a, 0x9a7fb5];
  for (let s = 0; s < 6; s++) {
    const stall = new THREE.Group();
    const a = (s / 6) * Math.PI * 2 + 0.4;
    stall.position.set(-60 + Math.cos(a) * 16, 0.4, -60 + Math.sin(a) * 16);
    stall.rotation.y = -a + Math.PI / 2;
    const counter = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.4, 2.2), new THREE.MeshLambertMaterial({ color: 0x8a5a34 }));
    counter.position.y = 0.7;
    stall.add(counter);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(5, 0.3, 3), new THREE.MeshLambertMaterial({ color: stallColors[s] }));
    canopy.position.y = 3.1;
    canopy.rotation.x = 0.12;
    stall.add(canopy);
    const poleL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3, 5), lampMat);
    poleL.position.set(-2.1, 1.6, 0);
    stall.add(poleL);
    const poleR = poleL.clone();
    poleR.position.x = 2.1;
    stall.add(poleR);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), lampGlowMat);
    glow.position.set(0, 2.8, 0);
    stall.add(glow);
    group.add(stall);
  }

  return {
    group, blocks, roads, clouds, wheel, sun, sea,
    setHour(h) {
      // Rebuild the sky gradient only when the time of day changes band —
      // never every frame.
      const band = h >= 19.5 || h < 5 ? 'night' : h >= 16 ? 'golden' : 'day';
      if (band === lastBand) return;
      lastBand = band;
      const old = skyMat.map;
      skyMat.map = skyTexture(h);
      skyMat.needsUpdate = true;
      if (old) old.dispose();
    },
    update(dt, t) {
      for (const c of clouds) {
        c.position.x += dt * 1.4;
        if (c.position.x > 340) c.position.x = -340;
      }
      wheel.rotation.z += dt * 0.12;
      sea.position.y = 0.4 + Math.sin(t * 0.7) * 0.12;
    },
  };
}
