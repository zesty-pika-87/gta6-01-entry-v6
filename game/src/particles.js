// Particle pool for Costa Palma: one THREE.Points cloud, reused for dust,
// sparks, smoke, muzzle flashes and explosions — no allocation per burst.
import * as THREE from 'three';

export function createParticles(scene, max) {
  const count = max || 420;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const life = new Float32Array(count);
  const maxLife = new Float32Array(count);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({ size: 0.9, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  let cursor = 0;
  const color = new THREE.Color();

  function spawn(x, y, z, vx, vy, vz, ttl, hex) {
    const i = cursor;
    cursor = (cursor + 1) % count;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    vel[i * 3] = vx;
    vel[i * 3 + 1] = vy;
    vel[i * 3 + 2] = vz;
    life[i] = ttl;
    maxLife[i] = ttl;
    color.setHex(hex);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  return {
    burst(pos, n, hex, speed, up) {
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2;
        const s = (0.3 + Math.random() * 0.7) * (speed || 6);
        spawn(pos.x, pos.y + Math.random(), pos.z, Math.cos(a) * s, (up || 3) * Math.random(), Math.sin(a) * s, 0.5 + Math.random() * 0.7, hex);
      }
    },
    dust(pos, n) {
      for (let k = 0; k < n; k++) {
        spawn(pos.x + (Math.random() - 0.5) * 2, pos.y + 0.2, pos.z + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 0.6 + Math.random(), (Math.random() - 0.5) * 2, 0.8 + Math.random() * 0.5, 0xcbb98a);
      }
    },
    smoke(pos, n) {
      for (let k = 0; k < n; k++) {
        spawn(pos.x, pos.y + 0.6, pos.z, (Math.random() - 0.5) * 1.2, 1.5 + Math.random() * 1.5, (Math.random() - 0.5) * 1.2, 1.2 + Math.random(), 0x666666);
      }
    },
    update(dt) {
      for (let i = 0; i < count; i++) {
        if (life[i] <= 0) {
          positions[i * 3 + 1] = -100;
          continue;
        }
        life[i] -= dt;
        positions[i * 3] += vel[i * 3] * dt;
        positions[i * 3 + 1] += vel[i * 3 + 1] * dt;
        positions[i * 3 + 2] += vel[i * 3 + 2] * dt;
        vel[i * 3 + 1] -= 2.5 * dt;
        const f = Math.max(0, life[i] / maxLife[i]);
        colors[i * 3] *= 0.985 + f * 0.01;
        colors[i * 3 + 1] *= 0.985 + f * 0.01;
        colors[i * 3 + 2] *= 0.985 + f * 0.01;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    },
  };
}
