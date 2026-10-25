// Move-quality safety net: the engine picks a move per position under a fixed time budget,
// Stockfish scores that move against its own best move -> centipawn loss.
// usage: node bench/move-quality.js [--wasm path] [--time 1000] [--depth 30] [--sf-depth 18] [--json out.json]
const fs = require("fs");
const { loadEngine } = require("./engine");
const { Stockfish, toCp } = require("./stockfish");
const { BENCH } = require("./positions");
const { arg, fmt, mean } = require("./util");

(async () => {
  const wasmPath = arg("--wasm");
  const timeMs = Number(arg("--time", 1000));
  const depth = Number(arg("--depth", 30));
  const sfDepth = Number(arg("--sf-depth", 18));
  const only = arg("--only");
  const engine = loadEngine(wasmPath || undefined);
  const sf = new Stockfish();
  await sf.ready();

  const rows = [];
  for (const p of BENCH) {
    if (only && !p.name.startsWith(only)) continue;
    const r = engine.search(p.fen, { depth, timeMs });
    const legal = await sf.legalMoves(p.fen);
    if (!legal.includes(r.uci)) {
      console.log(`${p.name.padEnd(10)} ILLEGAL MOVE ${r.uci}`);
      rows.push({ name: p.name, uci: r.uci, illegal: true, cpLoss: 1000 });
      continue;
    }
    await sf.newGame();
    const best = await sf.analyse(p.fen, { depth: sfDepth });
    await sf.newGame();
    const ours = await sf.analyse(p.fen, { depth: sfDepth, searchmoves: [r.uci] });
    const cpLoss = Math.max(0, Math.min(1000, toCp(best.score) - toCp(ours.score)));
    const isBest = r.uci === best.bestmove || cpLoss === 0;
    rows.push({ name: p.name, uci: r.uci, best: best.bestmove, depth: r.depth, nodes: r.nodes + r.qnodes, timeMs: r.timeMs, cpLoss, isBest });
    console.log(`${p.name.padEnd(10)} engine ${r.uci.padEnd(6)} d${String(r.depth).padStart(2)} ${fmt(r.timeMs).padStart(6)}ms | sf best ${best.bestmove.padEnd(6)} | cp loss ${String(cpLoss).padStart(4)} ${isBest ? "BEST" : cpLoss >= 200 ? "BLUNDER" : cpLoss >= 50 ? "mistake" : ""}`);
  }
  const losses = rows.map((r) => r.cpLoss);
  const summary = {
    wasm: engine.path, timeMs, positions: rows.length,
    bestMoves: rows.filter((r) => r.isBest).length,
    blunders: rows.filter((r) => r.cpLoss >= 200).length,
    illegal: rows.filter((r) => r.illegal).length,
    meanCpLoss: Math.round(mean(losses)),
    medianCpLoss: losses.slice().sort((a, b) => a - b)[Math.floor(losses.length / 2)],
    meanDepth: mean(rows.map((r) => r.depth || 0)).toFixed(1),
  };
  console.log(`\nSUMMARY: ${summary.bestMoves}/${summary.positions} best moves, ${summary.blunders} blunders (>=200cp), ${summary.illegal} illegal, mean cp loss ${summary.meanCpLoss}, median ${summary.medianCpLoss}, mean depth ${summary.meanDepth}`);
  if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify({ summary, rows }, null, 2));
  sf.quit();
})();
