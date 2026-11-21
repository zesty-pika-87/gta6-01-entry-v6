// Police for Costa Palma: the wanted ladder, pursuing cruisers with
// flashing light bars, foot cops, roadblocks and the helicopter with its
// searchlight cone and pool of light on the ground.
import * as THREE from 'three';
import { CONFIG } from './config.js';
import { buildCarMesh } from './vehicles.js';

export function createPolice(scene, rng) {
  const group = new THREE.Group();
  group.name = 'police';
  scene.add(group);
  const cruisers = [];
  const footCops = [];
  let heli = null;
  let heliLight = null;
  let heliPool = null;
  let roadblock = null;
  let flash = 0;

  function makeCruiser() {
    const mesh = buildCarMesh(0xf2f2f2, 'sedan', true);
    group.add(mesh);
    return { mesh, speed: 0, heading: 0, role: 'PURSUIT' };
  }

  function makeFootCop() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.44, 1.15, 8), new THREE.MeshLambertMaterial({ color: 0x1a2a4a }));
    body.position.y = 1.05;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshLambertMaterial({ color: 0xe8b98a }));
    head.position.y = 1.9;
    g.add(head);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 8), new THREE.MeshLambertMaterial({ color: 0x101828 }));
    cap.position.y = 2.12;
    g.add(cap);
    group.add(g);
    return { g, speed: 4.2 };
  }

  function makeHeli() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 10), new THREE.MeshLambertMaterial({ color: 0x22303e }));
    body.scale.set(1, 0.8, 2.1);
    g.add(body);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 4.5, 6), new THREE.MeshLambertMaterial({ color: 0x22303e }));
    tail.rotation.x = Math.PI / 2;
    tail.position.z = -3.6;
    g.add(tail);
    const rotor = new THREE.Mesh(new THREE.BoxGeometry(11, 0.12, 0.7), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    rotor.position.y = 1.5;
    rotor.name = 'rotor';
    g.add(rotor);
    const tailRotor = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.4, 0.6), new THREE.MeshLambertMaterial({ color: 0x111111 }));
    tailRotor.position.set(0.5, 0.6, -5.4);
    g.add(tailRotor);
    // Searchlight cone and the bright pool it throws on the street.
    const coneGeo = new THREE.ConeGeometry(7, 30, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = -15;
    cone.rotation.x = Math.PI;
    g.add(cone);
    heliLight = new THREE.SpotLight(0xfff2b0, 60, 60, 0.32, 0.5, 1.2);
    g.add(heliLight);
    heliLight.position.set(0, -1, 0);
    heliPool = new THREE.Mesh(new THREE.CircleGeometry(6.5, 20), new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.28 }));
    heliPool.rotation.x = -Math.PI / 2;
    group.add(heliPool);
    group.add(g);
    return { g, rotor, cone, angle: 0 };
  }

  function makeRoadblock(at) {
    const rb = new THREE.Group();
    for (const off of [-4, 4]) {
      const c = buildCarMesh(0xf2f2f2, 'sedan', true);
      c.position.set(at.x + off, 0.4, at.z);
      c.rotation.y = Math.PI / 2;
      rb.add(c);
    }
    const cop1 = makeFootCop();
    cop1.g.position.set(at.x - 1, 0.7, at.z + 3);
    rb.add(cop1.g);
    const cop2 = makeFootCop();
    cop2.g.position.set(at.x + 2, 0.7, at.z - 3);
    rb.add(cop2.g);
    group.add(rb);
    return rb;
  }

  function setWanted(level, playerPos) {
    const wantCruisers = level === 0 ? 0 : level === 1 ? 1 : level === 2 ? 2 : level === 3 ? 3 : 4;
    while (cruisers.length < wantCruisers) {
      const c = makeCruiser();
      const a = Math.random() * Math.PI * 2;
      c.mesh.position.set(playerPos.x + Math.cos(a) * 40, 0.4, playerPos.z + Math.sin(a) * 40);
      cruisers.push(c);
    }
    while (cruisers.length > wantCruisers) {
      const c = cruisers.pop();
      group.remove(c.mesh);
    }
    const wantFoot = level >= 2 ? Math.min(3, level - 1) : 0;
    while (footCops.length < wantFoot) footCops.push(makeFootCop());
    while (footCops.length > wantFoot) {
      const f = footCops.pop();
      group.remove(f.g);
    }
    if (level >= 4 && !heli) heli = makeHeli();
    if (level < 4 && heli) {
      group.remove(heli.g);
      if (heliPool) group.remove(heliPool);
      heli = null;
      heliPool = null;
    }
    if (level >= 3 && !roadblock) roadblock = makeRoadblock({ x: playerPos.x + 30, z: playerPos.z });
    if (level < 3 && roadblock) {
      group.remove(roadblock);
      roadblock = null;
    }
  }

  return {
    cruisers, footCops,
    get heli() { return heli; },
    get roadblock() { return roadblock; },
    setWanted,
    update(dt, t, playerPos, wanted) {
      flash += dt;
      const phase = Math.floor(flash * 6) % 2 === 0;
      for (const c of cruisers) {
        const red = c.mesh.getObjectByName('lightRed');
        const blue = c.mesh.getObjectByName('lightBlue');
        if (red) red.visible = phase;
        if (blue) blue.visible = !phase;
        const dx = playerPos.x - c.mesh.position.x;
        const dz = playerPos.z - c.mesh.position.z;
        const dist = Math.hypot(dx, dz) || 1;
        const speed = 15 + wanted * 2.5;
        c.heading = Math.atan2(dx, dz);
        c.mesh.rotation.y = c.heading;
        if (dist > 6) {
          c.mesh.position.x += (dx / dist) * speed * dt;
          c.mesh.position.z += (dz / dist) * speed * dt;
        }
      }
      for (const f of footCops) {
        const dx = playerPos.x - f.g.position.x;
        const dz = playerPos.z - f.g.position.z;
        const dist = Math.hypot(dx, dz) || 1;
        if (dist > 1.6) {
          f.g.position.x += (dx / dist) * f.speed * dt;
          f.g.position.z += (dz / dist) * f.speed * dt;
          f.g.rotation.y = Math.atan2(dx, dz);
        }
      }
      if (heli) {
        heli.angle += dt * 0.5;
        const hx = playerPos.x + Math.cos(heli.angle) * 16;
        const hz = playerPos.z + Math.sin(heli.angle) * 16;
        heli.g.position.set(hx, 34 + Math.sin(t * 0.7) * 1.5, hz);
        heli.g.rotation.y = Math.atan2(playerPos.x - hx, playerPos.z - hz);
        heli.rotor.rotation.y += dt * 22;
        if (heliLight) heliLight.target.position.set(playerPos.x - hx, -34, playerPos.z - hz);
        if (heliPool) heliPool.position.set(playerPos.x, 0.85, playerPos.z);
      }
    },
  };
}
