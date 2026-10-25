// Speed benchmark: time-to-depth and nodes/sec on fixed positions.
// usage: node bench/speed.js [--wasm path] [--depth 6] [--timeout 60000] [--json out.json]
const fs = require("fs");
const { loadEngine } = require("./engine");
const { BENCH } = require("./positions");
const { arg, fmt } = require("./util");

const wasmPath = arg("--wasm");
const depth = Number(arg("--depth", 6));
const timeout = Number(arg("--timeout", 60000));
const only = arg("--only");
const engine = loadEngine(wasmPath || undefined);

let totalNodes = 0, totalQ = 0, totalMs = 0;
const rows = [];
for (const p of BENCH) {
  if (only && !p.name.startsWith(only)) continue;
  const r = engine.search(p.fen, { depth, timeMs: timeout });
  totalNodes += r.nodes; totalQ += r.qnodes; totalMs += r.timeMs;
  const nps = r.timeMs ? Math.round(((r.nodes + r.qnodes) / r.timeMs) * 1000) : 0;
  rows.push({ name: p.name, ...r, nps });
  console.log(`${p.name.padEnd(10)} d${String(r.depth).padStart(2)} ${r.uci.padEnd(6)} score ${String(r.score).padStart(6)}  nodes ${fmt(r.nodes).padStart(11)}  qnodes ${fmt(r.qnodes).padStart(11)}  ${fmt(r.timeMs).padStart(7)} ms  ${fmt(nps).padStart(9)} n/s`);
}
const nps = Math.round(((totalNodes + totalQ) / totalMs) * 1000);
console.log(`\nTOTAL depth ${depth}: nodes ${fmt(totalNodes)}  qnodes ${fmt(totalQ)}  time ${fmt(totalMs)} ms  ${fmt(nps)} nodes/s`);
if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify({ wasm: engine.path, depth, rows, totalNodes, totalQ, totalMs, nps }, null, 2));
