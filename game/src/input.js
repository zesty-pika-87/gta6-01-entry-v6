// Keyboard input for Costa Palma: held keys plus one-frame pressed edges,
// so E to enter a car or F to punch fires once per tap, not once per frame.
export function createInput() {
  const held = new Set();
  const pressed = new Set();
  const codeOf = (e) => e.code;

  function onDown(e) {
    if (e.repeat) return;
    held.add(codeOf(e));
    pressed.add(codeOf(e));
    if (['Space', 'Tab', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
  }
  function onUp(e) {
    held.delete(codeOf(e));
  }
  function onBlur() {
    held.clear();
    pressed.clear();
  }
  window.addEventListener('keydown', onDown);
  window.addEventListener('keyup', onUp);
  window.addEventListener('blur', onBlur);

  return {
    held,
    down(code) { return held.has(code); },
    wasPressed(code) { return pressed.has(code); },
    axis() {
      let x = 0;
      let y = 0;
      if (held.has('KeyA') || held.has('ArrowLeft')) x -= 1;
      if (held.has('KeyD') || held.has('ArrowRight')) x += 1;
      if (held.has('KeyW') || held.has('ArrowUp')) y += 1;
      if (held.has('KeyS') || held.has('ArrowDown')) y -= 1;
      return { x, y };
    },
    endFrame() { pressed.clear(); },
    dispose() {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', onBlur);
    },
  };
}
