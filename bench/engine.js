// Thin wrapper around the AssemblyScript wasm build.
const fs = require("fs");
const path = require("path");
const loader = require("@assemblyscript/loader");

const DEFAULT_WASM = path.join(__dirname, "..", "build", "optimized.wasm");

function loadEngine(wasmPath = DEFAULT_WASM, { quiet = true } = {}) {
  // the loader decodes trace() strings itself when no env.trace is supplied
  const imports = quiet ? { env: { trace: () => {} } } : {};
  const wasm = loader.instantiateSync(fs.readFileSync(wasmPath), imports);
  const { exports } = wasm;
  const str = (ptr) => exports.__getString(ptr);
  const newStr = (s) => exports.__newString(s);

  return {
    path: wasmPath,
    exports,
    /** search a FEN; returns { uci, move, depth, score, nodes, qnodes, timeMs } */
    search(fen, { depth = 20, timeMs = 1000 } = {}) {
      return JSON.parse(str(exports.searchFen(newStr(fen), depth, timeMs)));
    },
    /** principal variation of the last search of this FEN (UCI moves) */
    pv(fen, maxDepth = 12) {
      return exports.principalVariation ? str(exports.principalVariation(newStr(fen), maxDepth)) : "";
    },
    /** bit mask: 1 null move, 2 LMR, 4 futility, 8 check extension (default all on) */
    features(mask) {
      if (exports.configureSearch) exports.configureSearch(mask);
    },
    perft(fen, depth) {
      return exports.perftFen(newStr(fen), depth);
    },
    evaluate(fen) {
      return exports.evaluateFen(newStr(fen));
    },
    /** stateful game (for matches) */
    newGame(fen) {
      const game = new exports.BenchGame(newStr(fen));
      return {
        think(opts = {}) {
          const { depth = 20, timeMs = 1000 } = opts;
          return JSON.parse(str(game.think(depth, timeMs)));
        },
        play(uci) {
          game.play(newStr(uci));
        },
        status() {
          return str(game.status());
        },
        fen() {
          return str(game.fen());
        },
      };
    },
  };
}

module.exports = { loadEngine, DEFAULT_WASM };
