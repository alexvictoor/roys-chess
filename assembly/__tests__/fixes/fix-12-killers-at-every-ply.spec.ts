import { encodeMove, KNIGHT, WHITE } from "../../bitboard";
import { History } from "../../history";

// Fix 12 (audit S1): the killer arrays had 12 slots but are indexed by ply.
// Deeper searches wrote past the arrays through unchecked().
const h = new History();
const MAX_PLY = 128;

function first(ply: i32): u32 {
  return encodeMove(KNIGHT + WHITE, <i8>(ply & 63), KNIGHT + WHITE, <i8>((ply + 17) & 63));
}
function second(ply: i32): u32 {
  return encodeMove(KNIGHT + WHITE, <i8>(ply & 63), KNIGHT + WHITE, <i8>((ply + 10) & 63));
}
const never = encodeMove(KNIGHT + WHITE, 0, KNIGHT + WHITE, 63);

describe("Fix 12: killer moves are kept at every ply of the search", () => {
  it("ranks the two most recent cut-off moves of each ply above an unknown move", () => {
    h.resetHistory();
    for (let ply = 0; ply < MAX_PLY; ply++) {
      h.recordPlayedMove(WHITE, <i8>ply, first(ply));
      h.recordCutOffMove(WHITE, <i8>ply, 4, first(ply));
      h.recordPlayedMove(WHITE, <i8>ply, second(ply));
      h.recordCutOffMove(WHITE, <i8>ply, 4, second(ply));
    }

    for (let ply = 0; ply < MAX_PLY; ply++) {
      const primary = h.getMoveScore(WHITE, <i8>ply, second(ply));
      const secondary = h.getMoveScore(WHITE, <i8>ply, first(ply));
      const unknown = h.getMoveScore(WHITE, <i8>ply, never);
      expect(primary).toBeGreaterThan(secondary, "ply " + ply.toString() + " primary killer");
      expect(secondary).toBeGreaterThan(unknown, "ply " + ply.toString() + " secondary killer");
    }
  });
});
