import {
  chooseBestMove,
  getLastSearchScore,
  reset,
} from "../../alpha-beta-evaluation";
import { BLACK, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { MATE_SCORE } from "../../quiescence-evaluation";

// Fix 17 (audit S6): every mate was clipped to the root window (16383) and
// mate scores were stored in the transposition table without ply adjustment,
// so the engine could not tell a mate in one from a mate in nine.
describe("Fix 17: mate scores say how far the mate is", () => {
  it("a mate in one scores MATE_SCORE - 1", () => {
    reset();
    chooseBestMove(WHITE, parseFEN("6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1"), 4);

    expect(getLastSearchScore()).toBe(MATE_SCORE - 1);
  });

  it("a mate in two scores MATE_SCORE - 3", () => {
    reset();
    chooseBestMove(WHITE, parseFEN("4k3/8/4K3/8/8/8/8/4Q3 w - - 0 1"), 6);

    expect(getLastSearchScore()).toBe(MATE_SCORE - 3);
  });

  it("the distance survives a round trip through the transposition table", () => {
    reset();
    const board = parseFEN("4k3/8/4K3/8/8/8/8/4Q3 w - - 0 1");
    chooseBestMove(WHITE, board, 6);
    chooseBestMove(WHITE, board, 6);

    expect(getLastSearchScore()).toBe(MATE_SCORE - 3);
  });

  it("the side about to be mated scores -(MATE_SCORE - 2)", () => {
    reset();
    chooseBestMove(BLACK, parseFEN("4k3/8/4K3/4Q3/8/8/8/8 b - - 0 1"), 6);

    expect(getLastSearchScore()).toBe(-(MATE_SCORE - 2));
  });
});
