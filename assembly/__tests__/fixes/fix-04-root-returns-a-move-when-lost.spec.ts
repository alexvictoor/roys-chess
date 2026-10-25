import { chooseBestMove } from "../../alpha-beta-evaluation";
import { BLACK } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { isInCheck } from "../../status";

// Fix 4 (audit S17): when every root move loses to a forced mate, the root
// used to return move 0, which the UI displayed as a1-a1.
describe("Fix 4: the root always returns a legal move", () => {
  it("returns a playable move when every move loses to a forced mate", () => {
    const board = parseFEN("8/1k1Q3K/4R3/8/8/3P4/8/8 b - - 0 1");

    const move = <u32>(chooseBestMove(BLACK, board, 4) & 0xffffffff);

    expect(move).not.toBe(0);
    board.do(move);
    expect(isInCheck(BLACK, board)).toBe(false);
  });
});
