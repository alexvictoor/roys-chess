// Move-generation safety net: compare engine perft with Stockfish perft (and known values).
// usage: node bench/perft-check.js [--wasm path] [--max-depth 4]
const { loadEngine } = require("./engine");
const { Stockfish } = require("./stockfish");
const { PERFT } = require("./positions");
const { arg } = require("./util");

(async () => {
  const wasmPath = arg("--wasm");
  const maxDepth = Number(arg("--max-depth", 4));
  const engine = loadEngine(wasmPath || undefined);
  const sf = new Stockfish();
  await sf.ready();
  let failures = 0;
  let totalNodes = 0;
  const t0 = Date.now();
  for (const p of PERFT) {
    for (const d of Object.keys(p.depths).map(Number)) {
      if (d > maxDepth) continue;
      const start = Date.now();
      const ours = engine.perft(p.fen, d);
      const ms = Date.now() - start;
      totalNodes += ours;
      const { total: theirs } = await sf.perft(p.fen, d);
      const ok = ours === theirs && theirs === p.depths[d];
      if (!ok) failures++;
      console.log(`${ok ? "OK  " : "FAIL"} ${p.name.padEnd(12)} depth ${d}  engine=${ours}  stockfish=${theirs}  (${ms} ms)`);
      if (!ok) {
        // divide to point at the offending root move
        const { divide } = await sf.perft(p.fen, d);
        console.log("   stockfish divide:", JSON.stringify(divide));
      }
    }
  }
  const elapsed = (Date.now() - t0) / 1000;
  console.log(`\n${failures === 0 ? "ALL PERFT OK" : failures + " PERFT FAILURES"}  (${totalNodes} nodes)`);
  sf.quit();
  process.exit(failures ? 1 : 0);
})();
