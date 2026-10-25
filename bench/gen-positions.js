// Generate a deterministic set of random-but-plausible positions (for eval/perft differential tests).
// Random playouts from the BENCH positions using Stockfish legal move lists; seeded PRNG.
// usage: node bench/gen-positions.js [--count 1500] [--out bench/random-positions.txt]
const fs = require("fs");
const { Stockfish } = require("./stockfish");
const { BENCH, PERFT } = require("./positions");
const { arg } = require("./util");

function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

(async () => {
  const count = Number(arg("--count", 1500));
  const out = arg("--out", "bench/random-positions.txt");
  const rand = rng(20260927);
  const sf = new Stockfish();
  await sf.ready();
  const seeds = [...PERFT, ...BENCH];
  const seen = new Set();
  const fens = [];
  while (fens.length < count) {
    const seed = seeds[Math.floor(rand() * seeds.length)];
    let fen = seed.fen;
    const plies = 1 + Math.floor(rand() * 12);
    const moves = [];
    for (let i = 0; i < plies; i++) {
      const legal = await sf.legalMoves(fen);
      if (!legal.length) break;
      const m = legal[Math.floor(rand() * legal.length)];
      moves.push(m);
      fen = await sf.fenAfter(fen, [m]);
      if (!seen.has(fen)) { seen.add(fen); fens.push(fen); }
      if (fens.length >= count) break;
    }
  }
  fs.writeFileSync(out, fens.join("\n") + "\n");
  console.log(`wrote ${fens.length} positions to ${out}`);
  sf.quit();
})();
