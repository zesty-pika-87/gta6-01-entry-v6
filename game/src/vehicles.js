// Vehicles for Costa Palma: the car models everyone shares (player cars,
// traffic, police cruisers) and the arcade handling of the player's car.
import * as THREE from 'three';
import { CAR_DEFS } from './config.js';

export function buildCarMesh(color, type, isPolice) {
  const car = new THREE.Group();
  const bodyColor = isPolice ? 0xf2f2f2 : color;
  const bodyMat = new THREE.MeshLambertMaterial({ color: bodyColor });
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x4a7a9e });
  const darkMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
  const long = type === 'van' ? 5.6 : 4.4;
  const wide = type === 'van' ? 2.3 : 2.0;
  const body = new THREE.Mesh(new THREE.BoxGeometry(wide, 0.85, long), bodyMat);
  body.position.y = 0.75;
  body.castShadow = true;
  car.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(wide * 0.85, 0.7, type === 'van' ? 3.4 : 2.1), glassMat);
  cabin.position.set(0, 1.5, type === 'van' ? 0.2 : -0.25);
  cabin.castShadow = true;
  car.add(cabin);
  if (type === 'sport') {
    const spoiler = new THREE.Mesh(new THREE.BoxGeometry(wide * 0.9, 0.12, 0.5), darkMat);
    spoiler.position.set(0, 1.35, -long / 2 + 0.25);
    car.add(spoiler);
  }
  if (type === 'taxi') {
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.5), new THREE.MeshBasicMaterial({ color: 0xffe14a }));
    sign.position.set(0, 2.05, 0);
    car.add(sign);
  }
  if (isPolice) {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(wide + 0.05, 0.3, long * 0.7), new THREE.MeshLambertMaterial({ color: 0x1a2a4a }));
    stripe.position.y = 0.85;
    car.add(stripe);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.25, 0.5), darkMat);
    bar.position.set(0, 1.95, -0.2);
    car.add(bar);
    const red = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.4), new THREE.MeshBasicMaterial({ color: 0xff2222 }));
    red.position.set(-0.3, 2.1, -0.2);
    red.name = 'lightRed';
    car.add(red);
    const blue = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.22, 0.4), new THREE.MeshBasicMaterial({ color: 0x2266ff }));
    blue.position.set(0.3, 2.1, -0.2);
    blue.name = 'lightBlue';
    car.add(blue);
  }
  const wheelGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.35, 10);
  wheelGeo.rotateZ(Math.PI / 2);
  for (const [wx, wz] of [[-wide / 2, long / 2 - 0.9], [wide / 2, long / 2 - 0.9], [-wide / 2, -long / 2 + 0.9], [wide / 2, -long / 2 + 0.9]]) {
    const wheel = new THREE.Mesh(wheelGeo, darkMat);
    wheel.position.set(wx, 0.42, wz);
    car.add(wheel);
  }
  const headA = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.2, 0.1), new THREE.MeshBasicMaterial({ color: 0xfff2b0 }));
  headA.position.set(-0.6, 0.8, long / 2 + 0.02);
  car.add(headA);
  const headB = headA.clone();
  headB.position.x = 0.6;
  car.add(headB);
  // Taillights: a bright red strip so the car reads from behind in a chase.
  const tailMat = new THREE.MeshBasicMaterial({ color: 0xff2a1e });
  const tailA = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.18, 0.08), tailMat);
  tailA.position.set(-0.6, 0.85, -long / 2 - 0.02);
  car.add(tailA);
  const tailB = tailA.clone();
  tailB.position.x = 0.6;
  car.add(tailB);
  return car;
}

export function createPlayerCar(scene, def) {
  const mesh = buildCarMesh(def.color, def.type, false);
  scene.add(mesh);
  return {
    mesh,
    def,
    speed: 0,
    heading: 0,
    condition: 100,
    pos: mesh.position,
    update(dt, input, game) {
      const axis = input.axis();
      const forward = axis.y;
      const steer = axis.x;
      const top = def.top;
      if (forward > 0) this.speed += 26 * dt * forward;
      else if (forward < 0) this.speed -= (this.speed > 0 ? 34 : 16) * dt;
      else this.speed *= Math.max(0, 1 - 1.6 * dt);
      if (this.speed > top) this.speed = top;
      if (this.speed < -16) this.speed = -16;
      const moving = Math.abs(this.speed) > 0.5;
      if (moving) {
        this.heading -= steer * 2.1 * dt * Math.sign(this.speed) * Math.min(1, Math.abs(this.speed) / 12);
      }
      const dx = Math.sin(this.heading) * this.speed * dt;
      const dz = Math.cos(this.heading) * this.speed * dt;
      this.pos.x = Math.max(-195, Math.min(195, this.pos.x + dx));
      this.pos.z = Math.max(-195, Math.min(195, this.pos.z + dz));
      this.mesh.rotation.y = this.heading;
      this.mesh.position.y = 0.4 + Math.sin(performance.now() * 0.02) * 0.01 * Math.abs(this.speed) / 20;
      // Drift dust and a little body roll when turning hard at speed.
      if (moving && Math.abs(steer) > 0.5 && Math.abs(this.speed) > 22) {
        this.mesh.rotation.z = -steer * 0.06;
        if (game.particles && Math.random() < 0.5) {
          game.particles.dust(this.pos, 1);
        }
        if (game.chainTimer > 0 && game.feed) game.feedDrift = true;
      } else {
        this.mesh.rotation.z *= 0.9;
      }
      game.stats.distanceKm += (Math.abs(this.speed) * dt) / 1000;
      return this.speed;
    },
  };
}

export function randomCarDef(rng) {
  return CAR_DEFS[rng.int(0, CAR_DEFS.length - 1)];
}
