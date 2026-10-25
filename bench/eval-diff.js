// Differential test: static evaluation (and optional perft) of two wasm builds must be identical.
// usage: node bench/eval-diff.js --a build/optimized.wasm --b baseline.wasm [--positions bench/random-positions.txt] [--perft 2]
const fs = require("fs");
const { loadEngine } = require("./engine");
const { arg } = require("./util");

const A = loadEngine(arg("--a"));
const B = loadEngine(arg("--b"));
const perftDepth = Number(arg("--perft", 0));
const fens = fs.readFileSync(arg("--positions", "bench/random-positions.txt"), "utf8").trim().split("\n");
let evalDiffs = 0, perftDiffs = 0;
const t = { a: 0, b: 0 };
for (const fen of fens) {
  let s = process.hrtime.bigint(); const ea = A.evaluate(fen); t.a += Number(process.hrtime.bigint() - s);
  s = process.hrtime.bigint(); const eb = B.evaluate(fen); t.b += Number(process.hrtime.bigint() - s);
  if (ea !== eb) { evalDiffs++; if (evalDiffs <= 10) console.log(`EVAL DIFF ${fen}  a=${ea} b=${eb}`); }
  if (perftDepth) {
    const pa = A.perft(fen, perftDepth), pb = B.perft(fen, perftDepth);
    if (pa !== pb) { perftDiffs++; if (perftDiffs <= 10) console.log(`PERFT DIFF ${fen}  a=${pa} b=${pb}`); }
  }
}
console.log(`${fens.length} positions: ${evalDiffs} eval diffs, ${perftDiffs} perft diffs. eval time a=${(t.a / 1e6).toFixed(0)}ms b=${(t.b / 1e6).toFixed(0)}ms`);
process.exit(evalDiffs + perftDiffs ? 1 : 0);
