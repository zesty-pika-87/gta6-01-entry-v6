// Weapon slots for Costa Palma: the five slots the HUD draws, their ammo
// and which one is live. Selection is 1–5 on the keyboard.
import { WEAPONS } from './config.js';

export function createWeapons() {
  const slots = WEAPONS.map((w) => ({ ...w }));
  let selected = 1;

  return {
    slots,
    get selected() { return selected; },
    select(i) {
      if (i >= 0 && i < slots.length && !slots[i].locked) selected = i;
    },
    current() { return slots[selected]; },
    cycle() {
      let next = selected;
      for (let k = 0; k < slots.length; k++) {
        next = (next + 1) % slots.length;
        if (!slots[next].locked) break;
      }
      selected = next;
    },
  };
}
