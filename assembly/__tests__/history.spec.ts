import { WHITE } from "../bitboard";
import { BLACK, encodeMove, ROOK } from "../bitboard";
import { History } from "../history";

const h = new History();

describe("Score from history", () => {
  beforeEach(function () {
    h.resetHistory();
  });
  it("should be 0 when move has not been recorded", () => {
    const move = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);
    const otherMove = encodeMove(ROOK + BLACK, 0, ROOK + BLACK, 1);
    h.recordPlayedMove(BLACK, 1, otherMove);
    h.recordCutOffMove(BLACK, 1, 4, otherMove);
    expect(h.getMoveScore(WHITE, 1, move)).toBe(0);
  });
  it("should be greather than 0 when move has been recorded has a cut off", () => {
    // given
    const move = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);
    // when
    h.recordPlayedMove(WHITE, 1, move);
    h.recordCutOffMove(WHITE, 1, 4, move);
    expect(h.getMoveScore(WHITE, 1, move)).toBeGreaterThan(0);
  });
  it("should be greather than 0 when move has been recorded deeper has a cut off", () => {
    // given
    const move = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);
    const deeperMove = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 2);
    // when
    h.recordPlayedMove(WHITE, 1, move);
    h.recordCutOffMove(WHITE, 1, 4, move);
    h.recordPlayedMove(WHITE, 2, deeperMove);
    h.recordCutOffMove(WHITE, 2, 4, deeperMove);
    expect(h.getMoveScore(WHITE, 1, deeperMove)).toBeGreaterThan(
      h.getMoveScore(WHITE, 1, move)
    );
  });
  it("should be greather when move hasa greater cut off probability", () => {
    // given
    const goodMove = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1);
    const betterMove = encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 2);
    // when
    h.recordCutOffMove(WHITE, 1, 4, goodMove);
    h.recordCutOffMove(WHITE, 2, 4, betterMove);
    h.recordPlayedMove(WHITE, 1, goodMove);
    h.recordPlayedMove(WHITE, 2, betterMove);
    h.recordPlayedMove(WHITE, 1, goodMove);
    expect(h.getMoveScore(WHITE, 1, betterMove)).toBeGreaterThan(
      h.getMoveScore(WHITE, 1, goodMove)
    );
  });
});
