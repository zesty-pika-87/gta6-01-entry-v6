// Story for Costa Palma: the people of the city, their voices and the
// rank ladder the player climbs — the words the dialog bar speaks.
export const CHARACTERS = {
  NADIA: {
    name: 'NADIA CRUZ',
    role: 'THE FIXER · YOUR CONTACT',
    color: '#ffd98a',
    lines: [
      'Flint thinks this coast is his. Prove him wrong, one job at a time.',
      'The garage is yours when the job is done. No questions, no receipts.',
      'You drive like the tide is chasing you. Good. It is.',
    ],
  },
  SILAS: {
    name: 'SILAS THE BROKER',
    role: 'THE BROKER · HARBOUR DEALS',
    color: '#9ad7ff',
    lines: [
      'Packages move, money moves. You move fastest of all, I hear.',
      'No names on the manifest. There never are.',
    ],
  },
  TOMAS: {
    name: 'OLD TOMAS',
    role: 'THE FISHERMAN · OWES FLINT',
    color: '#c9b8a0',
    lines: [
      'Forty years on this water and Flint still sends boys for my catch.',
      'You remind me of me, before the tide turned.',
    ],
  },
  LENA: {
    name: 'LENA MAR',
    role: 'THE RACER · BEACH ROAD QUEEN',
    color: '#ff9ecf',
    lines: [
      'You want the Comet? Take it from the road, not from me.',
      'Night race. Six gates. Don\u2019t bring a slow car to a fast night.',
    ],
  },
  DARIO: {
    name: 'DARIO FLINT',
    role: 'THE ANTAGONIST · FLINT CREW',
    color: '#ff6a5e',
    lines: [
      'Costa Palma answers to me. It always has.',
      'Every cruiser in this city has my number on speed dial.',
    ],
  },
};

export const INTRO_LINES = [
  'NADIA CRUZ: Welcome to Costa Palma. Eight jobs stand between you and the coast.',
  'The Flint crew owns the Neon Strip. Your crew owns the rest — take it back.',
  'Steal a car, keep the chain going, and never let the wanted stars catch you.',
];

export const VICTORY_LINES = [
  'COSTA PALMA IS YOURS',
  'Eight jobs. One coast. Zero debts left to Flint.',
  'Nadia pours two glasses at the marina. The tide finally answers to you.',
];

export const BUSTED_LINES = [
  'BUSTED — the PCPD hauled you in. Bail posted, cash lighter, pride intact.',
  'WASTED — the coast is patient. It will wait for your comeback.',
];

export function randomLine(character, rng) {
  const lines = CHARACTERS[character].lines;
  return lines[Math.floor(rng() * lines.length)];
}
