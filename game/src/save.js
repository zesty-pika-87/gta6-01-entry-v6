// Save slots for Costa Palma: cash, missions, garage, turf, respect and
// career stats in localStorage, with a safe default when nothing is stored.
export const SAVE_KEY = 'costa-palma-save-v6';

export function defaultSave() {
  return {
    cash: 1240,
    respect: 290,
    missionsDone: 0,
    medallions: 0,
    garage: ['COMET'],
    bestChain: 9,
    stats: { carsStolen: 41, copsEscaped: 12, distanceKm: 48.2, takenOut: 23, taxiFares: 6, vigilante: 3 },
    turf: { plaza: 82, marina: 65, beach: 71, neon: 42, docks: 37, oldtown: 50 },
    slot: 1,
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const data = JSON.parse(raw);
    const base = defaultSave();
    return { ...base, ...data, stats: { ...base.stats, ...(data.stats || {}) }, turf: { ...base.turf, ...(data.turf || {}) } };
  } catch (err) {
    return defaultSave();
  }
}

export function writeSave(game) {
  try {
    const data = {
      cash: Math.floor(game.player.cash),
      respect: Math.floor(game.respect),
      missionsDone: game.mission.doneCount,
      medallions: game.stats.medallions,
      garage: game.garage.slice(),
      bestChain: game.stats.bestChain,
      stats: { ...game.stats },
      turf: {},
      slot: 1,
    };
    for (const d of game.turf) data.turf[d.id] = Math.round(d.control);
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
}
