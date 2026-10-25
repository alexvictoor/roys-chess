import { reset, search } from "../../alpha-beta-evaluation";
import { parseFEN } from "../../fen-parser";
import { isInCheck } from "../../status";

// Fix 1: pvNode was computed as `beta - alpha > 1` in i16. With the root
// window (-32000, 32000) the subtraction wrapped to -1536 and the whole
// principal variation was searched as if it were a zero window.
const positions: string[] = [
  "r2q1rk1/pp2bppp/2n1pn2/3p4/3P4/2NBPN2/PP3PPP/R2QK2R w KQ - 0 10",
  "2r3k1/pp3ppp/4p3/3nP3/3P4/2PB4/P4PPP/4R1K1 w - - 0 1",
  "r1bq1rk1/pp2ppbp/2np1np1/8/2PNP3/2N1B3/PP2BPPP/R2QK2R w KQ - 0 9",
];

function searchWithWindow(fen: string, alpha: i16, beta: i16): i16 {
  const board = parseFEN(fen);
  const player = board.currentPlayer;
  reset();
  return search(player, isInCheck(player, board), board, 4, alpha, beta, 0, true);
}

describe("Fix 1: a full-width window is treated as a PV node", () => {
  it("returns the same score for any window wider than every non-mate score", () => {
    for (let index = 0; index < positions.length; index++) {
      const wide = searchWithWindow(positions[index], -32000, 32000);
      const narrower = searchWithWindow(positions[index], -15000, 15000);
      expect(wide).toBe(narrower, positions[index]);
    }
  });
});
