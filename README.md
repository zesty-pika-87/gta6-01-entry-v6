# Costa Palma

[![gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01)
[![rank](https://make.fun/badge/gta6-01/zesty-pika-87/gta6-01-entry-v6/rank.svg)](https://make.fun/bounty/gta6-01)
[![reward](https://make.fun/badge/gta6-01/zesty-pika-87/gta6-01-entry-v6/reward.svg)](https://make.fun/bounty/gta6-01)

An open-world crime game for the [gta6-01 bounty](https://make.fun/bounty/gta6-01): explore the sun-soaked coastal city of Costa Palma on foot and by car, steal cars, outrun the PCPD, run eight story jobs for Nadia Cruz, win the turf war against Dario Flint's crew, drive taxis, hunt vigilante targets, and own the coast.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

## Controls

- **WASD** — move / drive · **E** — enter or steal a car · **F** — punch · **SPACE** — shoot
- **H** — horn · **T** — taxi job · **V** — vigilante target · **R** — change radio station
- **1–4** — weapons · **Z / X / C** — crew skills (Mira, Lio, Kiki)
- **M** — city map · **TAB** — mission board & turf map · **P** — pause

## What's inside

- **A complete open world**: six districts (Palma Plaza, Marina Row, Solterra Strand, Neon Strip, Harbour Docks, Old Town), beach, sea, pier ferris wheel, lighthouse, harbour cranes, golden-hour sun and a day-night clock.
- **Traffic and pedestrians**: AI cars in six models (including yellow taxis) and crowds on the sidewalks.
- **Wanted and police**: a 1–5 star ladder, named dispatch units with roles and live distances, pursuing cruisers with flashing light bars, foot cops, roadblocks and a helicopter with a searchlight cone.
- **Missions and story**: eight named jobs with dialogue, stages, timers and payouts, plus a finale heist and a victory screen with full career stats.
- **Depth**: a turf war (districts change hands), taxi fares with tips, vigilante takedowns, two NIGHT ONLY jobs that pay +25%, twelve hidden Sun Medallions, a street race, a crew with skills, respect ranks, a garage and localStorage saves.
- **Feel and polish**: close chase camera, speed FOV kick, screen shake, hit-stop, drift dust, muzzle tracers, explosions, procedural WebAudio engine / siren / gunfire sounds and an original coastal synth soundtrack with a DJ who talks.

## Tech

Three.js 0.187.0 vendored as a single self-contained `game/vendor/three.min.js` (no imports). No network requests: the game runs fully offline from its own files.

## License

MIT — see [LICENSE](LICENSE).
