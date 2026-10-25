// A/B match: two wasm builds play each other from a set of openings at a fixed time per move.
// Also usable as engine vs Stockfish (limited strength) with --vs-stockfish <elo>.
// usage: node bench/match.js --a build/optimized.wasm --b baseline.wasm [--time 500] [--games 10] [--max-plies 200]
//        node bench/match.js --a build/optimized.wasm --vs-stockfish 1400 [--time 500] [--games 10]
const fs = require("fs");
const { loadEngine } = require("./engine");
const { Stockfish } = require("./stockfish");
const { arg, fmt } = require("./util");

// Short balanced opening lines (UCI) so games are varied and out of book.
const OPENINGS = [
  ["e2e4", "e7e5", "g1f3", "b8c6", "f1b5", "a7a6"],
  ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6"],
  ["e2e4", "c7c5", "g1f3", "d7d6", "d2d4", "c5d4"],
  ["c2c4", "e7e5", "b1c3", "g8f6", "g2g3", "d7d5"],
  ["e2e4", "e7e6", "d2d4", "d7d5", "b1c3", "g8f6"],
  ["d2d4", "g8f6", "c2c4", "g7g6", "b1c3", "f8g7"],
  ["e2e4", "c7c6", "d2d4", "d7d5", "e4e5", "c8f5"],
  ["g1f3", "d7d5", "g2g3", "g8f6", "f1g2", "c7c6"],
  ["e2e4", "e7e5", "g1f3", "g8f6", "f3e5", "d7d6"],
  ["d2d4", "d7d5", "c2c4", "c7c6", "g1f3", "g8f6"],
];
const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

async function playGame({ white, black, opening, timeMs, maxPlies, sf, log }) {
  const moves = [...opening];
  const games = { w: white.newGame(START), b: black.newGame(START) };
  for (const m of opening) { games.w.play(m); games.b.play(m); }
  let status = games.w.status();
  let ply = opening.length;
  const stats = { w: { nodes: 0, ms: 0, depth: 0, n: 0 }, b: { nodes: 0, ms: 0, depth: 0, n: 0 } };
  while (!status && ply < maxPlies) {
    const side = ply % 2 === 0 ? "w" : "b";
    const r = await games[side].think({ timeMs, depth: 40 });
    // legality guard via stockfish (keeps the match honest if a build generates a bad move)
    const legal = await sf.legalMoves(games[side].fen());
    if (!legal.includes(r.uci)) {
      log(`  illegal move ${r.uci} by ${side} at ply ${ply}: ${games[side].fen()}`);
      return { result: side === "w" ? "0-1" : "1-0", reason: "illegal", moves, stats };
    }
    moves.push(r.uci);
    games.w.play(r.uci); games.b.play(r.uci);
    const s = stats[side]; s.nodes += r.nodes + r.qnodes; s.ms += r.timeMs; s.depth += r.depth; s.n++;
    ply++;
    status = games.w.status();
  }
  let result = "1/2-1/2", reason = status || "max plies";
  if (status === "CHECK_MATE") result = ply % 2 === 0 ? "0-1" : "1-0";
  else if (!status) {
    // adjudicate by stockfish eval
    const a = await sf.analyse(START, { depth: 15, moves });
    const cp = a.score.cp !== undefined ? a.score.cp : (a.score.mate > 0 ? 10000 : -10000);
    const whiteCp = ply % 2 === 0 ? cp : -cp;
    if (whiteCp > 300) result = "1-0"; else if (whiteCp < -300) result = "0-1";
    reason = `adjudicated ${whiteCp}cp`;
  }
  return { result, reason, moves, stats };
}

(async () => {
  const aPath = arg("--a"), bPath = arg("--b");
  const timeMs = Number(arg("--time", 500));
  const nGames = Number(arg("--games", 10));
  const maxPlies = Number(arg("--max-plies", 200));
  const A = loadEngine(aPath);
  const B = bPath ? loadEngine(bPath) : null;
  const sf = new Stockfish();
  await sf.ready();
  const log = (s) => console.log(s);
  const score = { A: 0, B: 0, draws: 0 };
  const agg = { A: { nodes: 0, ms: 0, depth: 0, n: 0 }, B: { nodes: 0, ms: 0, depth: 0, n: 0 } };
  const games = [];
  for (let g = 0; g < nGames; g++) {
    const opening = OPENINGS[g % OPENINGS.length];
    const aIsWhite = g % 2 === 0;
    const white = aIsWhite ? A : B, black = aIsWhite ? B : A;
    const r = await playGame({ white, black, opening, timeMs, maxPlies, sf, log });
    const aRes = r.result === "1/2-1/2" ? "draw" : (r.result === "1-0") === aIsWhite ? "A" : "B";
    if (aRes === "draw") score.draws++; else score[aRes]++;
    const sa = aIsWhite ? r.stats.w : r.stats.b, sb = aIsWhite ? r.stats.b : r.stats.w;
    for (const [k, s] of [["A", sa], ["B", sb]]) { agg[k].nodes += s.nodes; agg[k].ms += s.ms; agg[k].depth += s.depth; agg[k].n += s.n; }
    games.push({ game: g + 1, aIsWhite, ...r });
    log(`game ${g + 1}: A as ${aIsWhite ? "white" : "black"} -> ${r.result} (${r.reason}, ${r.moves.length} plies)  A: d${(sa.depth / (sa.n || 1)).toFixed(1)} ${fmt(Math.round(sa.nodes / (sa.ms || 1) * 1000))}n/s  B: d${(sb.depth / (sb.n || 1)).toFixed(1)} ${fmt(Math.round(sb.nodes / (sb.ms || 1) * 1000))}n/s`);
  }
  const pts = score.A + score.draws / 2, n = nGames;
  const p = pts / n;
  const elo = p > 0 && p < 1 ? Math.round(-400 * Math.log10(1 / p - 1)) : (p >= 1 ? Infinity : -Infinity);
  console.log(`\nRESULT A vs B: +${score.A} -${score.B} =${score.draws}  score ${(p * 100).toFixed(1)}%  elo diff ~${elo}`);
  console.log(`A: avg depth ${(agg.A.depth / (agg.A.n || 1)).toFixed(2)}  ${fmt(Math.round(agg.A.nodes / (agg.A.ms || 1) * 1000))} n/s   B: avg depth ${(agg.B.depth / (agg.B.n || 1)).toFixed(2)}  ${fmt(Math.round(agg.B.nodes / (agg.B.ms || 1) * 1000))} n/s`);
  if (arg("--json")) fs.writeFileSync(arg("--json"), JSON.stringify({ a: aPath, b: bPath, timeMs, score, elo, agg, games }, null, 2));
  sf.quit();
})();
