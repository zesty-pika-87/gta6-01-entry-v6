// Costa Palma — tuning, districts, missions, crew, weapons and names.
// Every name here is original to this city; nothing is borrowed from a
// commercial game. One job: hold the numbers the other modules read.
export const CONFIG = {
  title: 'COSTA PALMA',
  citySize: 340,
  roadGap: 46,
  walkSpeed: 7,
  runSpeed: 11,
  carAccel: 26,
  carTopSpeed: 58,
  carReverse: 16,
  carTurn: 2.1,
  gravity: 30,
  clockStartHour: 18.7,
  clockRate: 0.9,
  maxWanted: 5,
  chainWindow: 6,
  medallionTotal: 12,
};

export const DISTRICTS = [
  { id: 'plaza', name: 'PALMA PLAZA', sub: 'Fountain Square', owner: 'PALMA', control: 82, color: '#3fae6a', cx: -60, cz: -60, accent: '#f2b544' },
  { id: 'marina', name: 'MARINA ROW', sub: 'Yachts & the old pier', owner: 'PALMA', control: 65, color: '#3fae6a', cx: 70, cz: -60, accent: '#39c2d7' },
  { id: 'beach', name: 'SOLTERRA STRAND', sub: 'Beach road & palms', owner: 'PALMA', control: 71, color: '#3fae6a', cx: -60, cz: 70, accent: '#f28c4a' },
  { id: 'neon', name: 'NEON STRIP', sub: 'Clubs & late lights', owner: 'FLINT', control: 58, color: '#d84a4a', cx: 70, cz: 70, accent: '#ff5da2' },
  { id: 'docks', name: 'HARBOUR DOCKS', sub: 'Containers & cranes', owner: 'FLINT', control: 63, color: '#d84a4a', cx: 140, cz: -10, accent: '#f2c14e' },
  { id: 'oldtown', name: 'OLD TOWN', sub: 'Tile roofs & alleys', owner: 'NEUTRAL', control: 50, color: '#8a8f98', cx: -140, cz: 10, accent: '#e8d8a8' },
];

export const TURF_WAR_DISTRICT = 'neon';

export const MISSIONS = [
  { n: 1, name: 'FIRST KEY', giver: 'NADIA CRUZ', pay: 350, night: false, brief: 'Steal any car on the street and bring it to Palma Plaza.', objective: 'Steal a car — deliver it to the plaza', target: [-60, -60] },
  { n: 2, name: "THE BROKER'S ERRAND", giver: 'SILAS THE BROKER', pay: 500, night: false, brief: 'Pick up the package at the harbour and run it to the garage. Stay clean.', objective: 'Collect the package at the docks', target: [140, -10] },
  { n: 3, name: "OLD TOMAS'S DEBT", giver: 'OLD TOMAS', pay: 650, night: false, brief: 'Three of Flint\u2019s collectors wait at the docks. Settle the debt, fists first.', objective: 'Deal with the collectors 0/3', target: [140, -10] },
  { n: 4, name: 'HOT WHEELS', giver: 'LENA MAR', pay: 800, night: false, brief: 'A red Comet races the beach road. Take it. Its owner will object.', objective: 'Steal the red Comet on the beach road', target: [-60, 70] },
  { n: 5, name: 'DOCKSIDE DOUBLE-CROSS', giver: 'SILAS THE BROKER', pay: 950, night: false, brief: 'It was a trap. Four armed thugs in the marina containers. Get out shooting.', objective: 'Survive the ambush 0/4', target: [70, -60] },
  { n: 6, name: 'NEON RUN', giver: 'LENA MAR', pay: 1100, night: true, brief: 'Night race down the Neon Strip against three rivals. Six gates. Win it.', objective: 'Win the night race — gates 0/6', target: [70, 70] },
  { n: 7, name: 'STORM WARNING', giver: 'NADIA CRUZ', pay: 1400, night: false, brief: 'Flint called in every cruiser in Costa Palma. Break the roadblock. Reach the garage.', objective: 'Break through the roadblock — reach the garage', target: [-60, -60] },
  { n: 8, name: 'THE PALMA JOB', giver: 'NADIA CRUZ', pay: 2500, night: true, brief: 'The finale. Crack Flint\u2019s warehouse safe at the marina, then outrun the heli.', objective: 'Crack the warehouse safe, then escape', target: [70, -60] },
];

export const CREW = [
  { name: 'MIRA', role: 'DRIVER', skill: 'SWAP PLATES', key: 'Z', color: '#39c2d7' },
  { name: 'LIO', role: 'MECHANIC', skill: 'QUICK FIX', key: 'X', color: '#f2b544' },
  { name: 'KIKI', role: 'LOOKOUT', skill: 'EYES OUT', key: 'C', color: '#ff5da2' },
];

export const WEAPONS = [
  { name: 'FISTS', ammo: Infinity, icon: 'F' },
  { name: 'P9', ammo: 84, icon: 'P' },
  { name: 'SMG', ammo: 30, reserve: 90, icon: 'S' },
  { name: 'AR-9', ammo: 18, icon: 'A' },
  { name: 'RPG', ammo: 0, locked: true, icon: 'R' },
];

export const RANKS = [
  { at: 0, name: 'ROOKIE' },
  { at: 150, name: 'HUSTLER' },
  { at: 400, name: 'STREET BOSS' },
  { at: 800, name: 'FIXER' },
  { at: 1400, name: 'KINGPIN' },
  { at: 2200, name: 'LEGEND OF THE COAST' },
];

export const CAR_DEFS = [
  { name: 'COMET', color: 0xe8452c, type: 'sport', top: 62 },
  { name: 'VELOZ GT', color: 0xf28c2e, type: 'sport', top: 58 },
  { name: 'PALMA SEDAN', color: 0x3f6fb5, type: 'sedan', top: 48 },
  { name: 'TAXI CAB', color: 0xf2c14e, type: 'taxi', top: 46 },
  { name: 'HARBOUR VAN', color: 0x7a8894, type: 'van', top: 42 },
  { name: 'MARINA COUPE', color: 0x39c2d7, type: 'coupe', top: 54 },
];

export const RADIO = [
  { station: 'LUMEN FM 98.6', track: 'NEON TIDELINE', dj: 'DJ MARLA' },
  { station: 'PALMA GOLD 101.2', track: 'SALT AIR SERENADE', dj: 'DJ RICO' },
  { station: 'TIDE FM 94.4', track: 'CAUSEWAY NIGHTS', dj: 'DJ SOL' },
];

export const SHOP_SIGNS = [
  'MANGO & RYE', 'PALMA', 'SOL BAR', 'NEON', 'MARINA', 'TIDE & CO',
  'CAFE LUNA', 'CORAL TACOS', 'PIER 9', 'GULLWING', 'SUNSET GROCER', 'BODEGA SOL',
];

export const DISPATCH_NAMES = ['PIER 5', 'AIR ONE', 'TIDE 37', 'CORAL-48', 'MARLIN-3', 'KITE-1', 'REEF 12', 'SURF 9'];
export const DISPATCH_ROLES = ['PURSIT', 'RAMMING', 'FLANKING', 'SPOTLIGHT', 'ROADBLOCK', 'FOOT CHASE', 'SHORE WATCH', 'MARKSMAN'];

export function districtAt(x, z) {
  let best = DISTRICTS[0];
  let bd = Infinity;
  for (const d of DISTRICTS) {
    const dd = (x - d.cx) * (x - d.cx) + (z - d.cz) * (z - d.cz);
    if (dd < bd) { bd = dd; best = d; }
  }
  return best;
}

export function rankFor(respect) {
  let r = RANKS[0];
  for (const cand of RANKS) if (respect >= cand.at) r = cand;
  return r;
}

export function fmtMoney(n) {
  return '$' + Math.floor(n).toLocaleString('en-US');
}

export function fmtClock(hour) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour % 1) * 60);
  return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
}

export function daypart(hour) {
  if (hour >= 5 && hour < 10) return 'MORNING';
  if (hour >= 10 && hour < 16) return 'MIDDAY';
  if (hour >= 16 && hour < 19.5) return 'GOLDEN HOUR';
  if (hour >= 19.5 && hour < 21) return 'DUSK';
  return 'NIGHT';
}
