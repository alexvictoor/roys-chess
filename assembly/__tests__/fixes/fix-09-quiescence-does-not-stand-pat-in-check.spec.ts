import { BLACK } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { evaluateQuiescence } from "../../quiescence-evaluation";

// Fix 9 (audit S9): the quiescence search stood pat even when the side to
// move was in check, so a queen about to be lost after the only evasions was
// never seen. In check, every evasion is now searched.
describe("Fix 9: quiescence searches evasions when in check", () => {
  it("sees that the checked side loses its queen after the evasion", () => {
    // black is in check from a8; after Kg7/Kh7 the g3 pawn takes the queen
    const board = parseFEN("R5k1/5p2/8/8/7q/6P1/8/6K1 b - - 0 1");

    expect(evaluateQuiescence(BLACK, board, -30000, 30000)).toBeLessThan(0);
  });
});
