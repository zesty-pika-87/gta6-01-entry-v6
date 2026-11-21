// Feel for Costa Palma: the close chase camera that makes the car fill
// the frame, the speed FOV kick, screen shake and hit-stop — the camera
// work that turns driving into a chase.
import * as THREE from 'three';

export function createFeel(camera) {
  let shakeAmt = 0;
  let trauma = 0;

  return {
    addShake(n) { trauma = Math.min(1, trauma + n); },
    update(dt, game) {
      trauma = Math.max(0, trauma - dt * 1.6);
      shakeAmt = trauma * trauma;
      const p = game.player.pos;
      const heading = game.player.heading;
      const inCar = !!game.player.car;
      const speed = inCar ? Math.abs(game.player.car.speed) : Math.abs(game.player.speedKmh || 0) / 3.6;
      // Close chase: low and tight behind the car, a little higher on foot.
      const back = inCar ? 7.5 : 5.5;
      const height = inCar ? 3.0 : 2.8;
      const tx = p.x - Math.sin(heading) * back;
      const tz = p.z - Math.cos(heading) * back;
      const lx = p.x + Math.sin(heading) * (inCar ? 7 : 3);
      const lz = p.z + Math.cos(heading) * (inCar ? 7 : 3);
      const k = 1 - Math.pow(0.001, dt);
      camera.position.x += (tx - camera.position.x) * k;
      camera.position.y += (height - camera.position.y) * k;
      camera.position.z += (tz - camera.position.z) * k;
      if (shakeAmt > 0) {
        camera.position.x += (Math.random() - 0.5) * shakeAmt * 0.9;
        camera.position.y += (Math.random() - 0.5) * shakeAmt * 0.6;
      }
      camera.lookAt(lx, 1.6, lz);
      const targetFov = 62 + Math.min(16, speed * 0.45);
      if (Math.abs(camera.fov - targetFov) > 0.1) {
        camera.fov += (targetFov - camera.fov) * Math.min(1, dt * 3);
        camera.updateProjectionMatrix();
      }
    },
    snapTo(game) {
      const p = game.player.pos;
      const heading = game.player.heading;
      const back = game.player.car ? 7.5 : 5.5;
      camera.position.set(p.x - Math.sin(heading) * back, game.player.car ? 3.0 : 2.8, p.z - Math.cos(heading) * back);
      camera.lookAt(p.x + Math.sin(heading) * 7, 1.6, p.z + Math.cos(heading) * 7);
    },
  };
}
