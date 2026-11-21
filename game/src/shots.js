// Screenshot staging for Costa Palma: four deterministic moments built
// from the real game state — a golden-hour chase, a night-market fight,
// the turf board and the victory screen. Same seed, same frame.
import { MISSIONS } from './config.js';

function placeCruisers(game, spots) {
  game.police.setWanted(0, game.player.pos);
  game.police.setWanted(game.wanted, game.player.pos);
  spots.forEach((s, i) => {
    const c = game.police.cruisers[i];
    if (!c) return;
    c.mesh.position.set(s[0], 0.4, s[1]);
    c.mesh.rotation.y = s[2] || 0;
  });
}

export function stageShot(game, name) {
  const g = game;
  g.mode = 'play';
  if (name === 'cover') {
    g.clockHour = 18.7;
    g.wanted = 4;
    g.player.cash = 3240;
    g.player.hp = 78;
    g.player.armor = 55;
    g.respect = 290;
    g.chain = 9;
    g.chainTimer = 6;
    g.chainLabel = 'KEEP IT GOING';
    g.missions.start(6);
    g.missions.state.stage = 4;
    g.missions.state.stageTotal = 5;
    g.missions.state.timer = 87;
    g.objective = 'Break through the roadblock — reach the garage';
    g.nextObjective = 'Reach the garage in one piece';
    g.dialog = { name: 'NADIA CRUZ', text: 'Flint called in every cruiser in Costa Palma. Roadblocks on the roads, rain on the way. Get to the garage — and do not stop for anyone.', until: 99 };
    g.enterCar('COMET', 0, 18, 0.15);
    const car = g.player.car;
    g.player.pos.copy(car.pos);
    g.player.heading = car.heading;
    // Traffic ahead on the same road, so the chase reads as a chase.
    const ahead = [[-2, 44], [3, 58], [-3, 72], [2, 88], [-1, 104]];
    g.traffic.cars.forEach((tc, i) => {
      if (i < ahead.length) {
        tc.pos.set(ahead[i][0], 0.4, ahead[i][1]);
        tc.mesh.position.copy(tc.pos);
        tc.mesh.rotation.y = 0;
        tc.loop = [new (tc.pos.constructor)(ahead[i][0], 0.4, ahead[i][1] + 60)];
        tc.wp = 0;
      }
    });
    placeCruisers(g, [[-8, 34, 0.1], [10, 30, -0.2], [-16, 8, 0.4], [14, 2, -0.3]]);
    g.police.setWanted(4, g.player.pos);
    g.feed.push('NEAR MISS +$150');
    g.feed.push('DRIFT x3');
    g.feed.push('AIR UNIT DEPLOYED');
    g.districtOverride = 'marina';
    return 'play';
  }
  if (name === 'street') {
    g.clockHour = 21.4;
    g.wanted = 2;
    g.player.cash = 7270;
    g.player.hp = 95;
    g.player.armor = 27;
    g.respect = 640;
    g.missions.start(5);
    g.missions.state.stage = 2;
    g.missions.state.stageTotal = 3;
    g.missions.state.timer = 142;
    g.objective = 'Take out the Kerono Boys 1/5';
    g.nextObjective = 'Melt away';
    g.dialog = { name: 'NADIA CRUZ', text: 'Two down the left aisle! I\u2019ve got the stall side, you take the street.', until: 99 };
    g.player.pos.set(-52, 0.7, -40);
    g.player.heading = -2.76;
    g.player.car = null;
    g.playerMesh.visible = true;
    g.playerMesh.position.copy(g.player.pos);
    g.playerMesh.rotation.y = g.player.heading;
    // Crowd the market: walkers around the player on foot.
    g.peds.walkers.forEach((w, i) => {
      const spots = [[-56, -46], [-48, -48], [-58, -54], [-46, -56], [-62, -50], [-54, -60], [-66, -58], [-50, -62]];
      if (i < spots.length) {
        w.g.position.set(spots[i][0], 0.7, spots[i][1]);
        w.along = spots[i][1];
      }
    });
    g.taxi.active = true;
    g.taxi.fare = 12.5;
    g.taxi.tip = 5;
    g.taxi.passenger = 'MARA';
    g.taxi.dest = 'NEON STRIP';
    g.taxi.timer = 48;
    const t1 = g.combat.spawnThug(-54, -54, true);
    t1.hp = 0;
    g.scene.remove(t1.g);
    g.combat.spawnThug(-48, -58, true);
    g.combat.spawnThug(-62, -58, false);
    g.police.setWanted(2, g.player.pos);
    g.feed.push('VIGILANTE TARGET · KERONO BOY — TAKE DOWN');
    g.feed.push('FARE $12.50 · TIP +$5');
    g.districtOverride = 'plaza';
    return 'play';
  }
  if (name === 'board') {
    g.mode = 'board';
    g.clockHour = 18.7;
    g.missions.start(6);
    g.missions.state.doneCount = 6;
    g.missions.state.stage = 3;
    g.player.cash = 4860;
    g.respect = 1120;
    g.stats.carsStolen = 41;
    g.stats.copsEscaped = 12;
    g.stats.distanceKm = 48.2;
    g.stats.takenOut = 23;
    g.stats.medallions = 5;
    g.fillBoard();
    return 'board';
  }
  // victory
  g.mode = 'victory';
  g.missions.state.doneCount = 8;
  g.missions.state.index = 7;
  g.player.cash = 9120;
  g.respect = 2350;
  g.stats.earned = 8250;
  g.stats.bestChain = 14;
  g.stats.carsStolen = 58;
  g.stats.copsEscaped = 21;
  g.stats.distanceKm = 96.4;
  g.stats.takenOut = 41;
  g.stats.medallions = 9;
  g.fillVictory();
  return 'victory';
}
