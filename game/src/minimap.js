// Minimap for Costa Palma: a round 2D canvas that draws the road grid,
// the turf colours of each district, the mission blip, police dots and the
// player arrow — plus the N compass mark.
import { CONFIG } from './config.js';

export function createMinimap(canvas) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const half = CONFIG.citySize / 2 + 40;

  function toMap(x, z) {
    return [(x / half) * (size / 2) + size / 2, (z / half) * (size / 2) + size / 2];
  }

  return {
    draw(game) {
      const s = size;
      ctx.clearRect(0, 0, s, s);
      ctx.save();
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#20242e';
      ctx.fillRect(0, 0, s, s);
      // District turf washes.
      for (const d of game.turf) {
        const [dx, dy] = toMap(d.cx, d.cz);
        ctx.fillStyle = d.owner === 'PALMA' ? 'rgba(63,174,106,0.35)' : d.owner === 'FLINT' ? 'rgba(216,74,74,0.35)' : 'rgba(138,143,152,0.25)';
        ctx.beginPath();
        ctx.arc(dx, dy, 34, 0, Math.PI * 2);
        ctx.fill();
      }
      // Roads.
      ctx.strokeStyle = '#4a4f5c';
      ctx.lineWidth = 5;
      for (let i = -3; i <= 3; i++) {
        const c = (i * CONFIG.roadGap) / half * (s / 2) + s / 2;
        ctx.beginPath(); ctx.moveTo(c, 0); ctx.lineTo(c, s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, c); ctx.lineTo(s, c); ctx.stroke();
      }
      // Sea on the west edge.
      ctx.fillStyle = 'rgba(46,127,158,0.8)';
      ctx.fillRect(0, 0, 14, s);
      // Mission target blip.
      const m = game.missions.state;
      if (m.target && game.mode === 'play') {
        const [tx, ty] = toMap(m.target.x, m.target.z);
        ctx.fillStyle = '#ffd94a';
        ctx.beginPath();
        ctx.arc(tx, ty, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14101c';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      // Police dots.
      ctx.fillStyle = '#5aa2ff';
      for (const c of game.police.cruisers) {
        const [px, py] = toMap(c.mesh.position.x, c.mesh.position.z);
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
      }
      if (game.police.heli) {
        const [hx, hy] = toMap(game.police.heli.g.position.x, game.police.heli.g.position.z);
        ctx.fillStyle = '#ff5da2';
        ctx.beginPath(); ctx.arc(hx, hy, 5, 0, Math.PI * 2); ctx.fill();
      }
      // Player arrow.
      const [px, py] = toMap(game.player.pos.x, game.player.pos.z);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(game.player.heading);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(6, 7);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      ctx.restore();
      // Ring + N.
      ctx.strokeStyle = '#e8e4da';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s / 2, s / 2, s / 2 - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', s / 2, 16);
    },
  };
}
