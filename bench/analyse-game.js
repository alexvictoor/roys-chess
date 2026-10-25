// Per-move centipawn loss of a game (UCI move list) using Stockfish.
// usage: node bench/analyse-game.js --moves "e2e4 e7e5 ..." [--fen START] [--sf-depth 14] [--min-loss 100]
const { Stockfish, toCp } = require("./stockfish");
const { arg } = require("./util");
const START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

async function analyseGame(sf, fen, moves, sfDepth, minLoss, log) {
  const rows = [];
  let cur = fen;
  for (let i = 0; i < moves.length; i++) {
    const side = cur.split(" ")[1];
    const best = await sf.analyse(cur, { depth: sfDepth });
    const played = await sf.analyse(cur, { depth: sfDepth, searchmoves: [moves[i]] });
    const loss = Math.max(0, toCp(best.score) - toCp(played.score));
    rows.push({ ply: i + 1, side, move: moves[i], best: best.bestmove, loss, fen: cur });
    if (loss >= minLoss && log) log(`ply ${i + 1} ${side} played ${moves[i]} (best ${best.bestmove}, loss ${loss})  ${cur}`);
    cur = await sf.fenAfter(cur, [moves[i]]);
  }
  return rows;
}

if (require.main === module) {
  (async () => {
    const sf = new Stockfish();
    await sf.ready();
    const moves = arg("--moves").trim().split(/\s+/);
    const rows = await analyseGame(sf, arg("--fen", START), moves, Number(arg("--sf-depth", 14)), Number(arg("--min-loss", 100)), console.log);
    const w = rows.filter((r) => r.side === "w"), b = rows.filter((r) => r.side === "b");
    const mean = (xs) => (xs.reduce((a, r) => a + r.loss, 0) / (xs.length || 1)).toFixed(0);
    console.log(`white mean loss ${mean(w)}cp, black mean loss ${mean(b)}cp`);
    sf.quit();
  })();
}
module.exports = { analyseGame };
