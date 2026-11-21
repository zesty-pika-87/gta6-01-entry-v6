// Boot and the one loop for Costa Palma: title, play, board, map, pause,
// victory, busted and wasted — plus the wiring that turns every system
// (traffic, police, missions, combat, turf, side jobs) into one game.
// ?shot=cover|street|board|victory&seed=N stages a screenshot scene.
import * as THREE from 'three';
import { CONFIG, DISTRICTS, MISSIONS, CAR_DEFS, RADIO, districtAt, fmtMoney } from './config.js';
import { makeRng } from './random.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createMusic } from './music.js';
import { createParticles } from './particles.js';
import { loadSave, writeSave } from './save.js';
import { buildWorld } from './world.js';
import { buildBuildings } from './buildings.js';
import { createTraffic } from './traffic.js';
import { createPedestrians } from './pedestrians.js';
import { createPolice } from './police.js';
import { buildDispatch, dispatchUnitsFor } from './dispatch.js';
import { createMissions } from './missions.js';
import { createCombat } from './combat.js';
import { createWeapons } from './weapons.js';
import { createCrew } from './crew.js';
import { createPlayerCar, buildCarMesh } from './vehicles.js';
import { createMinimap } from './minimap.js';
import { buildHud } from './hud.js';
import { createFeel } from './feel.js';
import { createRenderer } from './render.js';
import { stageShot } from './shots.js';
import { INTRO_LINES } from './story.js';

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : 20261121;
const rng = makeRng(seed);

const canvas = document.getElementById('game');
const render = createRenderer(canvas);
const { scene, camera } = render;
const audio = createAudio();
const music = createMusic(audio);
const particles = createParticles(scene, 420);
const input = createInput();
const feel = createFeel(camera);
const hud = buildHud();
const minimap = createMinimap(document.getElementById('minimap'));
const saved = loadSave();

const world = buildWorld(scene, rng, CONFIG.clockStartHour);
const buildings = buildBuildings(scene, world.blocks, rng);
const traffic = createTraffic(scene, rng, 9);
const peds = createPedestrians(scene, rng, 14);
const police = createPolice(scene, rng);

// The player on foot: a teal-shirted figure with a dark cap.
const playerMesh = new THREE.Group();
const pBody = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.46, 1.15, 8), new THREE.MeshLambertMaterial({ color: 0x2e8a7a }));
pBody.position.y = 1.05;
playerMesh.add(pBody);
const pHead = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshLambertMaterial({ color: 0xe8b98a }));
pHead.position.y = 1.9;
playerMesh.add(pHead);
const pCap = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.14, 8), new THREE.MeshLambertMaterial({ color: 0xd8382c }));
pCap.position.y = 2.12;
playerMesh.add(pCap);
scene.add(playerMesh);

// Sun medallions: twelve gold discs hidden around the city.
const medallions = [];
const medMat = new THREE.MeshLambertMaterial({ color: 0xffd94a, emissive: 0xffd94a, emissiveIntensity: 0.6 });
for (let i = 0; i < CONFIG.medallionTotal; i++) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.18, 12), medMat);
  const spot = world.blocks[rng.int(0, world.blocks.length - 1)];
  m.position.set(spot.cx + rng.range(-8, 8), 1.4, spot.cz + rng.range(-8, 8));
  m.rotation.x = Math.PI / 2;
  scene.add(m);
  medallions.push({ mesh: m, taken: false });
}

const weaponSys = createWeapons();
const crew = createCrew();

const game = {
  scene, camera, particles, audio, playerMesh,
  mode: 'title',
  clockHour: CONFIG.clockStartHour,
  player: {
    pos: new THREE.Vector3(-40, 0.7, -30),
    heading: 0.6,
    hp: 100, armor: 50, cash: saved.cash,
    car: null, weapon: 1, speedKmh: 0,
  },
  wanted: 0,
  wantedQuiet: 0,
  chain: 0, chainTimer: 0, chainLabel: '',
  respect: saved.respect,
  garage: saved.garage.slice(),
  stats: { ...saved.stats, medallions: saved.medallions, bestChain: saved.bestChain, earned: 0 },
  turf: DISTRICTS.map((d) => ({ ...d, control: saved.turf[d.id] ?? d.control })),
  district: DISTRICTS[0],
  districtOverride: null,
  feed: ['WELCOME TO COSTA PALMA'],
  dialog: null,
  objective: '',
  nextObjective: '',
  radio: RADIO[0],
  djLine: 'traffic is thick on the causeway — take the beach road instead.',
  djTimer: 0,
  taxi: { active: false, fare: 0, tip: 0, passenger: '', dest: '', timer: 0, target: null },
  vigilante: { active: false, name: '', reward: 0, target: null },
  revealTimer: 0,
  saveSoon: false,
  victoryAt: 0,
  bustedTimer: 0,
  dispatchRows: [],
  tracer: null,
  hudDirty: true,
  missions: null,
  police, traffic, peds,
  weapons: weaponSys.slots,
  weaponSys, crew,
  shake(n) { feel.addShake(n); },
  addChain(n, label) {
    this.chain += n;
    this.chainTimer = CONFIG.chainWindow;
    this.chainLabel = label || 'KEEP IT GOING';
    if (this.chain > this.stats.bestChain) this.stats.bestChain = this.chain;
  },
  wasted() {
    if (this.mode !== 'play') return;
    this.mode = 'wasted';
    this.player.cash = Math.max(0, this.player.cash - 200);
    document.getElementById('over-title').textContent = 'WASTED';
    document.getElementById('over-text').textContent = 'The coast is patient. It will wait for your comeback. -$200 hospital bill.';
    document.getElementById('over-screen').style.display = 'flex';
    audio.siren(false);
  },
  busted() {
    if (this.mode !== 'play') return;
    this.mode = 'busted';
    this.player.cash = Math.max(0, this.player.cash - 250);
    document.getElementById('over-title').textContent = 'BUSTED';
    document.getElementById('over-text').textContent = 'The PCPD hauled you in. Bail posted, cash lighter, pride intact. -$250.';
    document.getElementById('over-screen').style.display = 'flex';
    audio.siren(false);
  },
  enterCar(defName, x, z, heading) {
    const def = CAR_DEFS.find((d) => d.name === defName) || CAR_DEFS[0];
    const car = createPlayerCar(scene, def);
    car.pos.set(x, 0.4, z);
    car.heading = heading;
    car.mesh.position.set(x, 0.4, z);
    car.mesh.rotation.y = heading;
    this.player.car = car;
    playerMesh.visible = false;
    return car;
  },
};

game.missions = createMissions(game);
game.combat = createCombat(game);

function respawn() {
  document.getElementById('over-screen').style.display = 'none';
  game.player.hp = 100;
  game.player.armor = 50;
  game.wanted = 0;
  police.setWanted(0, game.player.pos);
  game.player.pos.set(-60, 0.7, -50);
  game.player.heading = 0.6;
  if (game.player.car) {
    scene.remove(game.player.car.mesh);
    game.player.car = null;
  }
  playerMesh.visible = true;
  game.mode = 'play';
}

function startPlay(fresh) {
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('victory-screen').style.display = 'none';
  document.getElementById('over-screen').style.display = 'none';
  if (fresh) {
    game.player.cash = 1240;
    game.respect = 290;
    game.missions.start(0);
    game.stats = { carsStolen: 0, copsEscaped: 0, distanceKm: 0, takenOut: 0, taxiFares: 0, vigilante: 0, medallions: 0, bestChain: 0, earned: 0 };
  }
  game.mode = 'play';
  audio.unlock();
  music.start();
  game.dialog = { name: 'NADIA CRUZ', text: INTRO_LINES[0].replace('NADIA CRUZ: ', ''), until: 7 };
}

function fillBoard() {
  const m = game.missions;
  const list = document.getElementById('board-missions');
  let html = '';
  MISSIONS.forEach((mis, i) => {
    const done = i < m.state.doneCount;
    const active = i === m.state.index;
    html += `<div class="b-mission ${active ? 'active' : ''} ${done ? 'done' : ''}"><span class="b-mn">${mis.n}</span><span class="b-mname">${mis.name}${mis.night ? ' · NIGHT ONLY' : ''}</span><span class="b-mpay">$${mis.pay}</span><span class="b-mstate">${done ? 'DONE ★' : active ? 'ACTIVE' : 'LOCKED'}</span></div>`;
  });
  list.innerHTML = html;
  const turf = document.getElementById('board-turf');
  let thtml = '';
  let palmaCount = 0;
  let palmaPct = 0;
  for (const d of game.turf) {
    if (d.owner === 'PALMA') { palmaCount += 1; palmaPct += d.control; }
    thtml += `<div class="b-turf-row"><span class="b-turf-dot" style="background:${d.owner === 'PALMA' ? '#3fae6a' : d.owner === 'FLINT' ? '#d84a4a' : '#8a8f98'}"></span><span>${d.name}</span><span>${d.owner} ${Math.round(d.control)}%${d.id === 'neon' ? ' ⚠ TURF WAR' : ''}</span></div>`;
  }
  turf.innerHTML = thtml + `<div class="b-turf-sum">TURF ${palmaCount}/6 districts · ${palmaCount ? Math.round(palmaPct / palmaCount) : 0}% PALMA control</div>`;
  document.getElementById('board-stats').innerHTML =
    `Missions ${game.missions.state.doneCount}/8 · Cash ${fmtMoney(game.player.cash)} · Best CHAIN ${game.stats.bestChain}<br>` +
    `Cars stolen ${game.stats.carsStolen} · Cops escaped ${game.stats.copsEscaped} · Distance ${game.stats.distanceKm.toFixed(1)} km<br>` +
    `Taken out ${game.stats.takenOut} · Medallions ${game.stats.medallions}/12 · Taxi fares ${game.stats.taxiFares} · Vigilante ${game.stats.vigilante}`;
  document.getElementById('board-side').innerHTML =
    `<div class="b-side-row">🚕 TAXI — fare + tip, passenger runs across town · ${game.stats.taxiFares} done</div>` +
    `<div class="b-side-row">🎯 VIGILANTE — take down wanted targets · ${game.stats.vigilante} done · press V to start</div>` +
    `<div class="b-side-row">🏁 STREET RACE — beach road, vs 3 rivals · $200 a win</div>` +
    `<div class="b-side-row">🌙 NIGHT ONLY — jobs 6 & 8 pay +25% after dark</div>`;
  document.getElementById('board-saves').textContent = 'SAVE SLOT 1 · ' + fmtMoney(game.player.cash) + ' · ' + game.missions.state.doneCount + '/8 jobs';
}
game.fillBoard = fillBoard;

function fillVictory() {
  document.getElementById('vic-stats').innerHTML =
    `Missions 8/8 · Cash ${fmtMoney(game.player.cash)} · Total earned ${fmtMoney(game.stats.earned || 8250)}<br>` +
    `Best CHAIN ${game.stats.bestChain} · Cars owned ${game.garage.length} · Rank LEGEND OF THE COAST<br>` +
    `Turf PALMA ${game.turf.filter((d) => d.owner === 'PALMA').length}/6 · Taxi fares ${game.stats.taxiFares} · Vigilante ${game.stats.vigilante} · Medallions ${game.stats.medallions}/12`;
  document.getElementById('victory-screen').style.display = 'flex';
}
game.fillVictory = fillVictory;

function stealCar() {
  const near = traffic.nearest(game.player.pos, 5);
  if (!near) {
    game.feed.push('NO CAR CLOSE ENOUGH — walk to traffic');
    return;
  }
  const def = near.def;
  scene.remove(near.mesh);
  traffic.cars.splice(traffic.cars.indexOf(near), 1);
  game.enterCar(def.name, near.mesh.position.x, near.mesh.position.z, game.player.heading);
  game.stats.carsStolen += 1;
  game.wanted = Math.max(game.wanted, 1);
  game.wantedQuiet = 0;
  game.addChain(1, 'VEHICLE STOLEN');
  game.feed.push(`VEHICLE STOLEN · ${def.name} — a witness called the PCPD`);
  audio.honk();
  if (!game.garage.includes(def.name)) game.garage.push(def.name);
}

function exitCar() {
  const car = game.player.car;
  if (!car) return;
  game.player.pos.set(car.pos.x + 3, 0.7, car.pos.z + 2);
  game.player.heading = car.heading;
  game.player.car = null;
  playerMesh.visible = true;
  playerMesh.position.copy(game.player.pos);
}

function startTaxi() {
  const d = DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)];
  game.taxi = { active: true, fare: 4.5, tip: 0, passenger: 'MARA', dest: d.name, timer: 75, target: { x: d.cx, z: d.cz } };
  game.feed.push(`TAXI JOB · take ${game.taxi.passenger} to ${d.name}`);
}

function startVigilante() {
  const x = game.player.pos.x + 30;
  const z = game.player.pos.z - 20;
  game.combat.spawnThug(x, z, true);
  game.vigilante = { active: true, name: 'KERONO BOY', reward: 300, target: { x, z } };
  game.feed.push('VIGILANTE TARGET · KERONO BOY — TAKE DOWN · $300');
}

function update(dt, t) {
  // Clock always runs; the sky follows it.
  game.clockHour += dt * 0.02;
  if (game.clockHour >= 24) game.clockHour -= 24;
  render.setHour(game.clockHour);
  world.setHour(game.clockHour);
  world.update(dt, t);
  buildings.update(dt, t);
  game.djTimer -= dt;
  if (game.djTimer <= 0) {
    game.djTimer = 9;
    game.djLine = [
      'traffic is thick on the causeway — take the beach road instead.',
      'Flint\u2019s boys are all over the Neon Strip tonight. Eyes open.',
      'golden hour over the marina, and the tide is coming in with it.',
      'if you see a red Comet, that\u2019s Lena\u2019s. Do not scratch it. Actually — scratch it.',
    ][Math.floor(Math.random() * 4)];
  }
  if (game.mode !== 'play') return;

  const axis = input.axis();
  if (game.player.car) {
    const car = game.player.car;
    car.update(dt, input, game);
    game.player.pos.copy(car.pos);
    game.player.heading = car.heading;
    game.player.speedKmh = Math.abs(car.speed) * 3.6 * 2.2;
    audio.setEngine(Math.abs(car.speed) / car.def.top, true);
    if (game.taxi.active && game.taxi.target) {
      game.taxi.fare += Math.abs(car.speed) * dt * 0.06;
      game.taxi.timer -= dt;
      const dd = Math.hypot(game.taxi.target.x - car.pos.x, game.taxi.target.z - car.pos.z);
      if (dd < 12) {
        const pay = Math.round(game.taxi.fare) + 5;
        game.player.cash += pay;
        game.stats.taxiFares += 1;
        game.feed.push(`TAXI DONE · FARE $${game.taxi.fare.toFixed(2)} · TIP +$5 · +$${pay}`);
        game.taxi.active = false;
      } else if (game.taxi.timer <= 0) {
        game.feed.push('TAXI LOST · passenger walked away');
        game.taxi.active = false;
      }
    }
  } else {
    const speed = (input.down('ShiftLeft') ? CONFIG.runSpeed : CONFIG.walkSpeed);
    if (axis.x !== 0) game.player.heading -= axis.x * 2.4 * dt;
    if (axis.y !== 0) {
      const step = axis.y * speed * dt;
      game.player.pos.x += Math.sin(game.player.heading) * step;
      game.player.pos.z += Math.cos(game.player.heading) * step;
      game.player.pos.x = Math.max(-195, Math.min(195, game.player.pos.x));
      game.player.pos.z = Math.max(-195, Math.min(195, game.player.pos.z));
      game.player.speedKmh = speed * 3.6;
      if (Math.random() < dt * 2) audio.step();
    } else {
      game.player.speedKmh = 0;
    }
    playerMesh.position.copy(game.player.pos);
    playerMesh.rotation.y = game.player.heading;
    audio.setEngine(0, false);
  }

  // Medallions.
  for (const med of medallions) {
    if (med.taken) continue;
    med.mesh.rotation.y += dt * 2;
    if (Math.hypot(med.mesh.position.x - game.player.pos.x, med.mesh.position.z - game.player.pos.z) < 2.4) {
      med.taken = true;
      scene.remove(med.mesh);
      game.stats.medallions += 1;
      game.player.cash += 100;
      audio.coin();
      game.feed.push(`SUN MEDALLION ${game.stats.medallions}/12 +$100`);
    }
  }

  // Wanted: quiet time decays it; hiding near the garage clears it.
  const nearCops = police.cruisers.length > 0;
  if (game.wanted > 0) {
    game.wantedQuiet += dt;
    if (game.wantedQuiet > 22 && !nearCops) {
      game.wanted -= 1;
      game.wantedQuiet = 0;
      game.stats.copsEscaped += 1;
      game.feed.push('YOU LOST THEM · wanted down');
    }
  }
  police.setWanted(game.wanted, game.player.pos);
  police.update(dt, t, game.player.pos, game.wanted);
  audio.siren(game.wanted >= 2);

  // Busted: a foot cop pins you down.
  let copClose = false;
  for (const f of police.footCops) {
    if (Math.hypot(f.g.position.x - game.player.pos.x, f.g.position.z - game.player.pos.z) < 1.8 && !game.player.car) copClose = true;
  }
  if (copClose && game.wanted > 0) {
    game.bustedTimer += dt;
    if (game.bustedTimer > 1.5) { game.bustedTimer = 0; game.busted(); return; }
  } else {
    game.bustedTimer = 0;
  }

  traffic.update(dt, game.player.pos);
  peds.update(dt, t);
  game.combat.update(dt);
  game.missions.update(dt);
  crew.update(dt);

  // Chain timer: bank the bonus when it runs out clean.
  if (game.chain > 0) {
    game.chainTimer -= dt;
    if (game.chainTimer <= 0) {
      const bonus = game.chain * 15;
      game.player.cash += bonus;
      game.feed.push(`${game.chain} CHAIN BANKED +$${bonus}`);
      game.chain = 0;
    }
  }

  if (game.dialog && game.dialog.until > 0) game.dialog.until -= dt;
  if (game.saveSoon) {
    game.saveSoon = false;
    writeSave(game);
  }

  // Dispatch rows for the HUD.
  game.dispatchRows = buildDispatch(dispatchUnitsFor(game.wanted, police, game.player.pos), game.player.pos);
  const here = districtAt(game.player.pos.x, game.player.pos.z);
  game.district = game.districtOverride
    ? game.turf.find((d) => d.id === game.districtOverride) || game.turf.find((d) => d.id === here.id)
    : game.turf.find((d) => d.id === here.id);

  // Tracer from the last shot.
  if (game.tracer) {
    render.addTracer(game.tracer.from, game.tracer.to);
    game.tracer = null;
  }
  particles.update(dt);
  feel.update(dt, game);
  minimap.draw(game);
  hud.update(game);
}

function handleKeys() {
  if (input.wasPressed('KeyE') && game.mode === 'play') {
    if (game.player.car) exitCar();
    else stealCar();
  }
  if (input.wasPressed('KeyF') && game.mode === 'play') game.combat.punch();
  if (input.down('Space') && game.mode === 'play') game.combat.shoot();
  if (input.wasPressed('KeyH') && game.mode === 'play') audio.honk();
  if (input.wasPressed('KeyT') && game.mode === 'play') {
    if (!game.taxi.active) startTaxi();
  }
  if (input.wasPressed('KeyV') && game.mode === 'play') {
    if (!game.vigilante.active) startVigilante();
  }
  if (input.wasPressed('KeyR') && game.mode === 'play') {
    const i = (RADIO.indexOf(game.radio) + 1) % RADIO.length;
    game.radio = RADIO[i];
  }
  if (input.wasPressed('Digit1')) { game.player.weapon = 0; }
  if (input.wasPressed('Digit2')) { game.player.weapon = 1; }
  if (input.wasPressed('Digit3')) { game.player.weapon = 2; }
  if (input.wasPressed('Digit4')) { game.player.weapon = 3; }
  if (input.wasPressed('KeyZ')) crew.useSkill(0, game);
  if (input.wasPressed('KeyX')) crew.useSkill(1, game);
  if (input.wasPressed('KeyC')) crew.useSkill(2, game);
  if (input.wasPressed('Tab') && (game.mode === 'play' || game.mode === 'board')) {
    if (game.mode === 'play') {
      game.mode = 'board';
      fillBoard();
      document.getElementById('board-screen').style.display = 'flex';
    } else {
      game.mode = 'play';
      document.getElementById('board-screen').style.display = 'none';
    }
  }
  if (input.wasPressed('KeyM') && (game.mode === 'play' || game.mode === 'map')) {
    if (game.mode === 'play') {
      game.mode = 'map';
      document.getElementById('map-screen').style.display = 'flex';
      document.getElementById('map-canvas').getContext('2d');
      minimap.draw(game);
    } else {
      game.mode = 'play';
      document.getElementById('map-screen').style.display = 'none';
    }
  }
  if (input.wasPressed('KeyP')) {
    if (game.mode === 'play') {
      game.mode = 'pause';
      document.getElementById('pause-screen').style.display = 'flex';
    } else if (game.mode === 'pause') {
      game.mode = 'play';
      document.getElementById('pause-screen').style.display = 'none';
    }
  }
  if (input.wasPressed('Enter') && game.mode === 'title') startPlay(false);
}

// Buttons on the overlays.
document.getElementById('btn-continue').addEventListener('click', () => startPlay(false));
document.getElementById('btn-new').addEventListener('click', () => startPlay(true));
document.getElementById('btn-resume').addEventListener('click', () => {
  game.mode = 'play';
  document.getElementById('pause-screen').style.display = 'none';
});
document.getElementById('btn-board-close').addEventListener('click', () => {
  game.mode = 'play';
  document.getElementById('board-screen').style.display = 'none';
});
document.getElementById('btn-map-close').addEventListener('click', () => {
  game.mode = 'play';
  document.getElementById('map-screen').style.display = 'none';
});
document.getElementById('btn-again').addEventListener('click', () => startPlay(true));
document.getElementById('btn-cruise').addEventListener('click', () => {
  document.getElementById('victory-screen').style.display = 'none';
  game.mode = 'play';
});
document.getElementById('btn-respawn').addEventListener('click', respawn);

game.missions.start(0);
game.objective = game.missions.current().objective;
game.nextObjective = 'Lose the heat, then meet Nadia';
game.dialog = { name: 'NADIA CRUZ', text: 'Welcome to Costa Palma. Eight jobs stand between you and the coast.', until: 8 };

let last = performance.now();
let painted = 0;

function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  const t = now / 1000;
  if (shotName) {
    // Staged shot: settle the camera, paint twice, signal readiness.
    feel.snapTo(game);
    render.render(dt);
    hud.update(game);
    minimap.draw(game);
    painted += 1;
    if (painted >= 3) window.__shotReady = true;
    return;
  }
  handleKeys();
  update(dt, t);
  render.render(dt);
  input.endFrame();
}

if (shotName) {
  const mode = stageShot(game, shotName);
  game.mode = mode;
  // The title screen never shows in a staged shot.
  document.getElementById('title-screen').style.display = 'none';
  document.getElementById('pause-screen').style.display = 'none';
  document.getElementById('map-screen').style.display = 'none';
  document.getElementById('over-screen').style.display = 'none';
  feel.snapTo(game);
  render.setHour(game.clockHour);
  world.setHour(game.clockHour);
  world.update(0.01, 1);
  police.update(0.01, 1, game.player.pos, game.wanted);
  if (shotName === 'cover') {
    // Stage the set pieces where the camera can see them: the heli high
    // ahead-left with its spotlight, and the roadblock across the road.
    if (police.heli) {
      police.heli.g.position.set(-2, 22, 62);
      police.heli.g.rotation.y = 0.4;
    }
    if (police.roadblock) police.roadblock.position.set(-30, 0, 30);
  }
  game.dispatchRows = buildDispatch(dispatchUnitsFor(game.wanted, police, game.player.pos), game.player.pos);
  const here = districtAt(game.player.pos.x, game.player.pos.z);
  game.district = game.districtOverride
    ? game.turf.find((d) => d.id === game.districtOverride) || game.turf.find((d) => d.id === here.id)
    : game.turf.find((d) => d.id === here.id);
  if (mode === 'board') {
    document.getElementById('board-screen').style.display = 'flex';
  }
  if (mode === 'victory') {
    document.getElementById('victory-screen').style.display = 'flex';
  }
  hud.update(game);
  minimap.draw(game);
  requestAnimationFrame(frame);
} else {
  requestAnimationFrame(frame);
}
