import {
  chooseBestMove,
  getLastSearchDepth,
  reset,
  setSearchTimeout,
} from "../../alpha-beta-evaluation";
import { WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 3 (audit S4, S5, S8): the clock was only read in PV nodes and the
// timeout was a magic score. A 1 s budget could take 15 s. The clock is now
// checked every 2048 nodes in every node type and stops the search by a flag.
const fen = "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 10";

describe("Fix 3: the search stops within its time budget", () => {
  it("a 150 ms budget on a 40 ply request returns in well under a second", () => {
    setSearchTimeout(150);
    reset();
    const start = Date.now();

    const move = <u32>(chooseBestMove(WHITE, parseFEN(fen), 40) & 0xffffffff);

    const elapsed = Date.now() - start;
    setSearchTimeout(20000);
    expect(move).not.toBe(0);
    expect(getLastSearchDepth()).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(1000);
  });
});
