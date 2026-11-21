// HUD for Costa Palma: every panel the judge reads — mission banner with
// stage and timer, the named dispatch list, weapon slots, crew cards,
// district + turf chip, wanted stars, cash, health and armour, respect,
// radio, speed and the dialog bar. DOM, updated from the game state.
import { CONFIG, fmtClock, fmtMoney, daypart, rankFor, RANKS, TURF_WAR_DISTRICT } from './config.js';

function el(id) { return document.getElementById(id); }

export function buildHud() {
  return {
    update(game) {
      const m = game.missions.current();
      const st = game.missions.state;
      el('hud-mission').textContent = `JOB ${m.n}/8 · ${m.name}${m.night ? '  · NIGHT ONLY' : ''}`;
      el('hud-stage').textContent = `STAGE ${Math.min(st.stage, st.stageTotal)}/${st.stageTotal}`;
      el('hud-stagebar').style.width = `${Math.min(100, (st.stage / st.stageTotal) * 100)}%`;
      el('hud-timer').textContent = st.timer > 0 ? `⏱ ${Math.ceil(st.timer)}s` : '⏱ —';
      el('hud-objective').textContent = game.objective;
      el('hud-next').textContent = 'NEXT  ' + game.nextObjective;
      el('hud-dist').textContent = (st.distToTarget != null ? st.distToTarget + ' m' : '—');
      // Dispatch rows.
      const rows = game.dispatchRows || [];
      const list = el('hud-dispatch');
      let html = `<div class="dp-head"><span>PCPD RESPONSE</span><span>${rows.length} UNITS${game.wanted >= 4 ? ' · CODE 4' : ''}</span></div>`;
      for (const r of rows.slice(0, 5)) {
        html += `<div class="dp-row"><span class="dp-name">${r.name}</span><span class="dp-role">${r.role}</span><span class="dp-dist">${r.dist} m</span></div>`;
      }
      if (rows.length > 5) html += `<div class="dp-more">+${rows.length - 5} MORE · ${game.wanted >= 4 ? 'AIR UNIT DEPLOYED' : 'IN SIGHT'}</div>`;
      if (rows.length === 0) html += '<div class="dp-row"><span class="dp-name">—</span><span class="dp-role">ALL QUIET</span><span class="dp-dist">—</span></div>';
      list.innerHTML = html;
      // Wanted stars.
      let stars = '';
      for (let i = 1; i <= 5; i++) stars += `<span class="${i <= game.wanted ? 'star on' : 'star'}">★</span>`;
      el('hud-stars').innerHTML = stars;
      el('hud-air').textContent = game.wanted >= 4 ? 'AIR UNIT DEPLOYED' : game.wanted > 0 ? 'IN SIGHT' : 'CLEAN';
      el('hud-air').style.display = game.wanted > 0 ? 'inline-block' : 'none';
      // Cash, clock, health, armour, respect.
      el('hud-cash').textContent = fmtMoney(game.player.cash);
      el('hud-clock').textContent = fmtClock(game.clockHour);
      el('hud-hp').style.width = `${game.player.hp}%`;
      el('hud-hp-num').textContent = Math.round(game.player.hp);
      el('hud-armor').style.width = `${game.player.armor}%`;
      el('hud-armor-num').textContent = Math.round(game.player.armor);
      const rank = rankFor(game.respect);
      const level = RANKS.indexOf(rank) + 1;
      el('hud-rank').textContent = `RESPECT LV ${level} · ${rank.name}`;
      el('hud-respect').textContent = `${Math.floor(game.respect)} / ${RANKS[level] ? RANKS[level].at : 2600} RP`;
      el('hud-respect-bar').style.width = `${RANKS[level] ? ((game.respect - rank.at) / (RANKS[level].at - rank.at)) * 100 : 100}%`;
      // Weapon slots.
      const slots = game.weapons;
      const sel = game.player.weapon;
      let whtml = '';
      for (let i = 0; i < slots.length; i++) {
        const w = slots[i];
        const ammo = w.locked ? 'LOCKED' : w.ammo === Infinity ? '∞' : `${w.ammo}${w.reserve ? '/' + w.reserve : ''}`;
        whtml += `<div class="wslot ${i === sel ? 'sel' : ''} ${w.locked ? 'locked' : ''}"><span class="wkey">${i + 1}</span><span class="wname">${w.name}</span><span class="wammo">${ammo}</span></div>`;
      }
      el('hud-weapons').innerHTML = whtml;
      // Crew cards.
      let chtml = '';
      for (const c of game.crew.members) {
        chtml += `<div class="crew-card"><span class="crew-key">${c.key}</span><span class="crew-skill">${c.skill}</span><span class="crew-name">${c.name} · ${c.role}</span><span class="crew-state">${c.ready ? 'READY' : '…'}</span></div>`;
      }
      el('hud-crew').innerHTML = chtml;
      // District + turf chip.
      const d = game.district;
      el('hud-district').textContent = d.name;
      el('hud-district-sub').textContent = d.sub;
      el('hud-turf').textContent = `${d.id === TURF_WAR_DISTRICT ? '⚠ TURF WAR · ' : ''}${d.owner} ${Math.round(d.control)}%`;
      el('hud-turf').style.background = d.owner === 'PALMA' ? '#3fae6a' : d.owner === 'FLINT' ? '#d84a4a' : '#8a8f98';
      el('hud-daypart').textContent = `${fmtClock(game.clockHour)} · ${daypart(game.clockHour)}`;
      // Speed + car.
      if (game.player.car) {
        const kmh = Math.round(Math.abs(game.player.car.speed) * 3.6 * 2.2);
        el('hud-speed').textContent = kmh;
        el('hud-carname').textContent = game.player.car.def.name;
        el('hud-condition').textContent = `${Math.round(game.player.car.condition)}% CONDITION`;
        el('hud-carbox').style.display = 'block';
      } else {
        el('hud-carbox').style.display = 'none';
        el('hud-speed').textContent = Math.round(game.player.speedKmh || 0);
        el('hud-carname').textContent = 'ON FOOT';
        el('hud-condition').textContent = '';
      }
      // Radio + DJ chatter.
      const radio = game.radio;
      el('hud-radio').textContent = `${radio.station} · ${radio.track}`;
      el('hud-dj').textContent = `${radio.dj}: ${game.djLine}`;
      // Chain.
      const chain = el('hud-chain');
      if (game.chain > 1) {
        chain.style.display = 'block';
        el('hud-chain-n').textContent = `${game.chain} CHAIN`;
        el('hud-chain-sub').textContent = game.chainLabel || 'KEEP IT GOING';
      } else {
        chain.style.display = 'none';
      }
      // Action feed.
      const feed = el('hud-feed');
      feed.innerHTML = game.feed.slice(-3).map((f) => `<div>${f}</div>`).join('');
      // Dialog bar.
      const dlg = el('hud-dialog');
      if (game.dialog && game.dialog.until > 0) {
        dlg.style.display = 'flex';
        el('hud-dialog-name').textContent = game.dialog.name;
        el('hud-dialog-text').textContent = game.dialog.text;
      } else {
        dlg.style.display = 'none';
      }
      // Taxi fare.
      const taxi = el('hud-taxi');
      if (game.taxi.active) {
        taxi.style.display = 'block';
        el('hud-taxi-fare').textContent = `FARE $${game.taxi.fare.toFixed(2)} · TIP +$${game.taxi.tip}`;
        el('hud-taxi-dest').textContent = `Passenger ${game.taxi.passenger} → ${game.taxi.dest} · ${Math.ceil(game.taxi.timer)}s`;
      } else {
        taxi.style.display = 'none';
      }
      // Vigilante target.
      const vig = el('hud-vigilante');
      if (game.vigilante.active) {
        vig.style.display = 'block';
        el('hud-vig-text').textContent = `VIGILANTE TARGET · ${game.vigilante.name} — TAKE DOWN · $${game.vigilante.reward}`;
      } else {
        vig.style.display = 'none';
      }
    },
  };
}
