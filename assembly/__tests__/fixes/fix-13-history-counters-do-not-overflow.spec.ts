import { encodeMove, ROOK, WHITE } from "../../bitboard";
import { History } from "../../history";

// Fix 13 (audit S2): cut-off counters were i16 and incremented by 1 << ply,
// so a cut-off at ply 15 or many cut-offs turned the score negative.
const h = new History();
const move = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);

describe("Fix 13: history scores never overflow", () => {
  it("a move that cut off at ply 15 keeps a positive score", () => {
    h.resetHistory();
    h.recordPlayedMove(WHITE, 15, move);
    h.recordCutOffMove(WHITE, 15, 4, move);

    expect(h.getMoveScore(WHITE, 0, move)).toBeGreaterThan(0);
  });

  it("a move that cut off hundreds of times keeps a positive score", () => {
    h.resetHistory();
    for (let i = 0; i < 600; i++) {
      h.recordPlayedMove(WHITE, 6, move);
      h.recordCutOffMove(WHITE, 6, 8, move);
    }

    expect(h.getMoveScore(WHITE, 0, move)).toBeGreaterThan(0);
  });
});
