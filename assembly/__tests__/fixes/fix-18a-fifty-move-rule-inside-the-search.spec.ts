import {
  chooseBestMove,
  getLastSearchScore,
  MATE_BOUND,
  reset,
} from "../../alpha-beta-evaluation";
import { WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 18 (audit S7), part 1: the search ignored the half-move clock, so a
// mate that cannot be delivered before the 50-move rule was still scored as
// a win.
describe("Fix 18a: the fifty-move rule is seen inside the search", () => {
  it("scores the mate in two when the clock is fresh", () => {
    reset();
    chooseBestMove(WHITE, parseFEN("4k3/8/4K3/8/8/8/8/4Q3 w - - 0 1"), 6);

    expect(getLastSearchScore()).toBeGreaterThan(MATE_BOUND);
  });

  it("scores a draw when the opponent's next move reaches the hundredth half-move", () => {
    reset();
    chooseBestMove(WHITE, parseFEN("4k3/8/4K3/8/8/8/8/4Q3 w - - 98 1"), 6);

    expect(getLastSearchScore()).toBe(0);
  });
});
