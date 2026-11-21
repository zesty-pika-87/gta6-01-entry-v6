// Renderer for Costa Palma: the WebGL renderer, golden-hour sun, warm fog
// and tone mapping — plus the tracer lines gunfire draws in the air.
import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xe8a05c, 120, 620);

  const camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 4, -12);

  const sun = new THREE.DirectionalLight(0xffc46b, 2.6);
  sun.position.set(140, 90, 160);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -160;
  sun.shadow.camera.right = 160;
  sun.shadow.camera.top = 160;
  sun.shadow.camera.bottom = -160;
  sun.shadow.camera.far = 600;
  scene.add(sun);
  const hemi = new THREE.HemisphereLight(0x9ab8e8, 0x8a6a4a, 0.9);
  scene.add(hemi);
  const amber = new THREE.PointLight(0xff9e57, 30, 90, 1.6);
  amber.position.set(-60, 12, -60);
  scene.add(amber);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resize);

  // Tracer lines: one THREE.Line per shot, fading fast.
  const tracers = [];
  function addTracer(from, to) {
    const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffe14a, transparent: true, opacity: 0.95 }));
    scene.add(line);
    tracers.push({ line, ttl: 0.09 });
  }

  return {
    renderer, scene, camera, sun, hemi,
    setHour(hour) {
      if (hour >= 19.5 || hour < 5) {
        sun.color.setHex(0x8a7fd8);
        sun.intensity = 1.4;
        scene.fog.color.setHex(0x3a2a5e);
        hemi.intensity = 0.65;
      } else if (hour >= 16) {
        sun.color.setHex(0xffc46b);
        sun.intensity = 2.6;
        scene.fog.color.setHex(0xe8a05c);
        hemi.intensity = 0.9;
      } else {
        sun.color.setHex(0xfff2cc);
        sun.intensity = 2.9;
        scene.fog.color.setHex(0xbfd8e8);
        hemi.intensity = 1.1;
      }
    },
    addTracer,
    render(dt) {
      for (let i = tracers.length - 1; i >= 0; i--) {
        const t = tracers[i];
        t.ttl -= dt;
        t.line.material.opacity = Math.max(0, t.ttl / 0.09);
        if (t.ttl <= 0) {
          scene.remove(t.line);
          t.line.geometry.dispose();
          tracers.splice(i, 1);
        }
      }
      renderer.render(scene, camera);
    },
  };
}
