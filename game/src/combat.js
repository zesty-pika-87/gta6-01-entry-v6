// Combat for Costa Palma: fists, gunfire, thugs who fight back, pickups
// and the busted / wasted screens. Hits are cone checks, not raycasts —
// fast, forgiving, and honest at 60 frames a second.
import * as THREE from 'three';

export function createCombat(game) {
  const thugs = [];
  const pickups = [];
  let punchCooldown = 0;
  let shootCooldown = 0;
  let hitStop = 0;

  function spawnThug(x, z, armed) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 1.15, 8), new THREE.MeshLambertMaterial({ color: 0x8a2a2a }));
    body.position.y = 1.05;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshLambertMaterial({ color: 0xd8a06a }));
    head.position.y = 1.9;
    g.add(head);
    const barBg = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.18), new THREE.MeshBasicMaterial({ color: 0x222222 }));
    barBg.position.y = 2.5;
    g.add(barBg);
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.12), new THREE.MeshBasicMaterial({ color: 0xff4444 }));
    bar.position.set(0, 2.5, 0.01);
    g.add(bar);
    g.position.set(x, 0.7, z);
    game.scene.add(g);
    const thug = { g, bar, hp: 100, armed: !!armed, attackTimer: 1 + Math.random() };
    thugs.push(thug);
    return thug;
  }

  function spawnPickup(x, z, kind) {
    const color = kind === 'health' ? 0x3fae6a : kind === 'ammo' ? 0xf2c14e : 0x39c2d7;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: 0.5 }));
    mesh.position.set(x, 1.2, z);
    mesh.rotation.y = Math.PI / 4;
    game.scene.add(mesh);
    pickups.push({ mesh, kind, spin: 0 });
  }

  function nearestThug(maxDist, maxAngle) {
    const p = game.player.pos;
    const heading = game.player.heading;
    let best = null;
    let bd = maxDist;
    for (const t of thugs) {
      if (t.hp <= 0) continue;
      const dx = t.g.position.x - p.x;
      const dz = t.g.position.z - p.z;
      const d = Math.hypot(dx, dz);
      if (d > bd) continue;
      const ang = Math.atan2(dx, dz);
      let diff = Math.abs(ang - heading);
      if (diff > Math.PI) diff = Math.PI * 2 - diff;
      if (diff > maxAngle) continue;
      bd = d;
      best = t;
    }
    return best;
  }

  function punch() {
    if (punchCooldown > 0 || game.player.car) return;
    punchCooldown = 0.45;
    game.audio.punch();
    const t = nearestThug(3.2, 1.1);
    if (t) {
      t.hp -= 34;
      hitStop = 0.06;
      game.particles.burst(t.g.position, 8, 0xffd98a, 5, 3);
      game.addChain(1, 'PUNCH');
      if (t.hp <= 0) killThug(t);
    }
  }

  function shoot() {
    if (shootCooldown > 0 || game.player.car) return;
    const slot = game.weapons[game.player.weapon];
    if (!slot || slot.locked) return;
    if (slot.ammo !== Infinity && slot.ammo <= 0) {
      game.feed.push('CLICK — OUT OF AMMO');
      shootCooldown = 0.4;
      return;
    }
    shootCooldown = slot.name === 'SMG' ? 0.14 : 0.32;
    if (slot.ammo !== Infinity) slot.ammo -= 1;
    game.audio.shot();
    const t = nearestThug(42, 0.5);
    const p = game.player.pos;
    const from = new THREE.Vector3(p.x, 1.6, p.z);
    const dir = new THREE.Vector3(Math.sin(game.player.heading), 0, Math.cos(game.player.heading));
    const to = from.clone().add(dir.multiplyScalar(t ? Math.hypot(t.g.position.x - p.x, t.g.position.z - p.z) : 38));
    game.tracer = { from, to, ttl: 0.09 };
    if (t) {
      t.hp -= slot.name === 'SMG' ? 22 : 45;
      game.particles.burst(t.g.position, 10, 0xffe14a, 6, 4);
      game.addChain(1, 'SHOT');
      if (t.hp <= 0) killThug(t);
    }
  }

  function killThug(t) {
    t.hp = 0;
    game.scene.remove(t.g);
    const i = thugs.indexOf(t);
    if (i >= 0) thugs.splice(i, 1);
    game.stats.takenOut += 1;
    game.player.cash += 25;
    game.feed.push('THUG DOWN +$25');
    game.particles.burst(t.g.position, 16, 0xff6a5e, 7, 5);
    game.audio.explosion();
    game.missions.state.kills += 1;
    game.shake(0.35);
    if (Math.random() < 0.5) spawnPickup(t.g.position.x + 2, t.g.position.z, Math.random() < 0.5 ? 'health' : 'ammo');
  }

  function update(dt) {
    if (hitStop > 0) {
      hitStop -= dt;
      return;
    }
    punchCooldown = Math.max(0, punchCooldown - dt);
    shootCooldown = Math.max(0, shootCooldown - dt);
    const p = game.player.pos;
    for (const t of [...thugs]) {
      const dx = p.x - t.g.position.x;
      const dz = p.z - t.g.position.z;
      const dist = Math.hypot(dx, dz);
      t.bar.scale.x = Math.max(0.01, t.hp / 100);
      t.bar.position.x = -(1 - t.hp / 100) * 0.75;
      t.bar.lookAt(game.camera.position);
      if (dist > 2.2) {
        t.g.position.x += (dx / dist) * 3.4 * dt;
        t.g.position.z += (dz / dist) * 3.4 * dt;
        t.g.rotation.y = Math.atan2(dx, dz);
      } else {
        t.attackTimer -= dt;
        if (t.attackTimer <= 0) {
          t.attackTimer = 1.1;
          game.player.hp = Math.max(0, game.player.hp - (t.armed ? 12 : 7));
          game.audio.punch();
          game.shake(0.25);
          if (game.player.hp <= 0) game.wasted();
        }
      }
    }
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pk = pickups[i];
      pk.spin += dt;
      pk.mesh.rotation.y = pk.spin;
      pk.mesh.position.y = 1.2 + Math.sin(pk.spin * 2) * 0.15;
      if (Math.hypot(pk.mesh.position.x - p.x, pk.mesh.position.z - p.z) < 2.2) {
        if (pk.kind === 'health') game.player.hp = Math.min(100, game.player.hp + 25);
        else if (pk.kind === 'ammo') {
          const slot = game.weapons[game.player.weapon];
          if (slot && slot.ammo !== Infinity) slot.ammo += 24;
        } else game.player.cash += 50;
        game.audio.pickup();
        game.feed.push('PICKUP · ' + pk.kind.toUpperCase());
        game.scene.remove(pk.mesh);
        pickups.splice(i, 1);
      }
    }
  }

  return { thugs, pickups, spawnThug, spawnPickup, punch, shoot, update };
}
