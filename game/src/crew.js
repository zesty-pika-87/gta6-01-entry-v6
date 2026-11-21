// Crew and respect for Costa Palma: Mira the driver, Lio the mechanic and
// Kiki the lookout — their cards on the HUD and the respect ladder that
// turns jobs into rank.
import { CREW, RANKS, rankFor } from './config.js';

export function createCrew() {
  return {
    members: CREW.map((c) => ({ ...c, ready: true, cooldown: 0 })),
    respect: 290,
    rank() { return rankFor(this.respect); },
    nextRank() {
      for (const r of RANKS) if (r.at > this.respect) return r;
      return null;
    },
    addRespect(n) {
      this.respect = Math.min(2600, this.respect + n);
    },
    useSkill(i, game) {
      const m = this.members[i];
      if (!m || !m.ready) return false;
      m.ready = false;
      m.cooldown = 25;
      if (m.name === 'MIRA') {
        game.wanted = Math.max(0, game.wanted - 1);
        game.feed.push('MIRA · SWAP PLATES — wanted down');
      } else if (m.name === 'LIO') {
        if (game.player.car) game.player.car.condition = 100;
        game.player.hp = Math.min(100, game.player.hp + 20);
        game.feed.push('LIO · QUICK FIX — car patched, +20 HP');
      } else {
        game.revealTimer = 12;
        game.feed.push('KIKI · EYES OUT — threats marked 12s');
      }
      return true;
    },
    update(dt) {
      for (const m of this.members) {
        if (!m.ready) {
          m.cooldown -= dt;
          if (m.cooldown <= 0) m.ready = true;
        }
      }
    },
  };
}
