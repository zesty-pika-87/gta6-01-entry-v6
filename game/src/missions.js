// Missions for Costa Palma: the eight story jobs, their stages, targets,
// timers and payouts — plus the turf shifts and side-job hooks each finish
// can trigger. The state machine is small on purpose: one active job.
import { MISSIONS } from './config.js';

export function createMissions(game) {
  const state = {
    index: 0,
    stage: 1,
    stageTotal: 4,
    kills: 0,
    killsNeeded: 0,
    timer: 0,
    active: true,
    doneCount: 0,
    target: null,
  };

  function current() {
    return MISSIONS[state.index];
  }

  function start(index) {
    state.index = index;
    state.stage = 1;
    state.kills = 0;
    const m = MISSIONS[index];
    state.stageTotal = m.n === 6 ? 6 : 4;
    state.killsNeeded = m.n === 3 ? 3 : m.n === 5 ? 4 : 0;
    state.timer = m.n === 6 ? 150 : m.n === 7 ? 120 : 0;
    state.target = { x: m.target[0], z: m.target[1] };
    state.active = true;
    game.dialog = { name: m.giver, text: m.brief, until: 7 };
    game.objective = m.objective;
    game.nextObjective = nextFor(m);
    game.hudDirty = true;
  }

  function nextFor(m) {
    if (m.n === 1) return 'Lose the heat, then meet Nadia';
    if (m.n === 2) return 'Deliver the package to the garage';
    if (m.n === 3) return 'Bring the debt money home';
    if (m.n === 4) return 'Park the Comet in the garage';
    if (m.n === 5) return 'Break out of the marina';
    if (m.n === 6) return 'Hold first place to the finish';
    if (m.n === 7) return 'Reach the garage in one piece';
    return 'Costa Palma is yours';
  }

  function complete() {
    const m = MISSIONS[state.index];
    const nightBonus = m.night ? 1.25 : 1;
    const pay = Math.round(m.pay * nightBonus);
    game.player.cash += pay;
    game.stats.earned = (game.stats.earned || 0) + pay;
    game.respect += 120 + state.index * 30;
    state.doneCount += 1;
    game.feed.push(`JOB DONE · ${m.name} +$${pay}`);
    game.audio.missionDone();
    // Finishing a job in a district pushes its turf toward PALMA.
    const d = game.district;
    if (d) {
      d.control = Math.min(95, d.control + 6);
      if (d.owner !== 'PALMA') d.owner = 'PALMA';
    }
    game.saveSoon = true;
    if (state.doneCount >= MISSIONS.length) {
      game.mode = 'victory';
      game.victoryAt = performance.now();
      if (game.fillVictory) game.fillVictory();
      return true;
    }
    start(Math.min(state.index + 1, MISSIONS.length - 1));
    return true;
  }

  function fail(reason) {
    game.dialog = { name: 'NADIA CRUZ', text: reason + ' Try it again — the job is still open.', until: 6 };
    game.feed.push('JOB FAILED · ' + reason);
    start(state.index);
  }

  function update(dt) {
    if (!state.active || game.mode !== 'play') return;
    if (state.timer > 0) {
      state.timer -= dt;
      if (state.timer <= 0) {
        fail('Out of time.');
        return;
      }
    }
    const m = current();
    const p = game.player.pos;
    const dx = state.target.x - p.x;
    const dz = state.target.z - p.z;
    const dist = Math.hypot(dx, dz);
    state.distToTarget = Math.round(dist);
    if (state.killsNeeded > 0) {
      if (state.kills >= state.killsNeeded && dist < 14) complete();
      return;
    }
    if (m.n === 6) {
      if (dist < 14) {
        state.stage += 1;
        if (state.stage > state.stageTotal) { complete(); return; }
        state.target = { x: state.target.x + (Math.random() - 0.5) * 60, z: state.target.z + (Math.random() - 0.5) * 60 };
        game.objective = `Win the night race — gates ${state.stage - 1}/6`;
      }
      return;
    }
    if (dist < 12) {
      state.stage += 1;
      if (state.stage > 2 && m.n !== 1) { complete(); return; }
      if (m.n === 1 && game.player.car) { complete(); return; }
      if (m.n === 1 && !game.player.car) {
        game.objective = 'Steal a car first — then drive to the plaza';
        state.target = { x: p.x + 20, z: p.z };
        state.stage = 1;
      }
    }
  }

  return { state, current, start, complete, fail, update };
}
