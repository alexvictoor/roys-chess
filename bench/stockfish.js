// Minimal UCI client for the stockfish CLI.
const { spawn } = require("child_process");
const readline = require("readline");

class Stockfish {
  constructor({ binary = process.env.STOCKFISH || "stockfish", threads = 1, hash = 256 } = {}) {
    this.proc = spawn(binary, [], { stdio: ["pipe", "pipe", "inherit"] });
    this.rl = readline.createInterface({ input: this.proc.stdout });
    this.waiters = [];
    this.rl.on("line", (line) => {
      for (const w of this.waiters) w(line);
    });
    this.send("uci");
    this.send(`setoption name Threads value ${threads}`);
    this.send(`setoption name Hash value ${hash}`);
  }

  send(cmd) {
    this.proc.stdin.write(cmd + "\n");
  }

  /** Collect lines until `done(line)` returns true; resolves with all lines. */
  collect(done) {
    return new Promise((resolve) => {
      const lines = [];
      const w = (line) => {
        lines.push(line);
        if (done(line)) {
          this.waiters = this.waiters.filter((x) => x !== w);
          resolve(lines);
        }
      };
      this.waiters.push(w);
    });
  }

  async ready() {
    this.send("isready");
    await this.collect((l) => l === "readyok");
  }

  async newGame() {
    this.send("ucinewgame");
    await this.ready();
  }

  async perft(fen, depth) {
    this.send(`position fen ${fen}`);
    this.send(`go perft ${depth}`);
    const lines = await this.collect((l) => l.startsWith("Nodes searched"));
    const total = Number(lines[lines.length - 1].split(":")[1].trim());
    const divide = {};
    for (const l of lines) {
      const m = /^([a-h][1-8][a-h][1-8][nbrq]?): (\d+)$/.exec(l);
      if (m) divide[m[1]] = Number(m[2]);
    }
    return { total, divide };
  }

  /**
   * Analyse a position. Returns { bestmove, score: {cp|mate}, pv, depth }.
   * `moves` optional list of UCI moves already played from fen.
   */
  async analyse(fen, { depth, movetime, searchmoves, moves = [] } = {}) {
    const pos = `position fen ${fen}` + (moves.length ? ` moves ${moves.join(" ")}` : "");
    this.send(pos);
    let go = "go";
    if (depth) go += ` depth ${depth}`;
    if (movetime) go += ` movetime ${movetime}`;
    if (searchmoves && searchmoves.length) go += ` searchmoves ${searchmoves.join(" ")}`;
    this.send(go);
    const lines = await this.collect((l) => l.startsWith("bestmove"));
    let last = null;
    for (const l of lines) {
      if (l.startsWith("info") && / score /.test(l) && !/ lowerbound| upperbound/.test(l)) {
        const cp = /score cp (-?\d+)/.exec(l);
        const mate = /score mate (-?\d+)/.exec(l);
        const d = /depth (\d+)/.exec(l);
        const pv = /\bpv (.*)$/.exec(l);
        last = {
          depth: d ? Number(d[1]) : 0,
          score: cp ? { cp: Number(cp[1]) } : { mate: Number(mate[1]) },
          pv: pv ? pv[1].split(" ") : [],
        };
      }
    }
    const bm = /bestmove (\S+)/.exec(lines[lines.length - 1]);
    return { bestmove: bm ? bm[1] : "(none)", ...(last || { depth: 0, score: { cp: 0 }, pv: [] }) };
  }

  /** Legal moves of a position via perft 1. */
  async legalMoves(fen) {
    const { divide } = await this.perft(fen, 1);
    return Object.keys(divide);
  }

  /** FEN after playing moves (uses the `d` debug command). */
  async fenAfter(fen, moves) {
    this.send(`position fen ${fen}` + (moves.length ? ` moves ${moves.join(" ")}` : ""));
    this.send("d");
    const lines = await this.collect((l) => l.startsWith("Checkers:"));
    const f = lines.find((l) => l.startsWith("Fen:"));
    return f.slice(4).trim();
  }

  quit() {
    this.send("quit");
    this.proc.stdin.end();
  }
}

/** Convert a Stockfish score object to a centipawn number (mates clipped). */
function toCp(score) {
  if (score.cp !== undefined) return score.cp;
  const m = score.mate;
  return m > 0 ? 10000 - m : -10000 - m;
}

module.exports = { Stockfish, toCp };
