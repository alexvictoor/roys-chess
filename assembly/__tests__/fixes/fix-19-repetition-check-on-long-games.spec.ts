import { WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { isDraw } from "../../status";

// Fix 19 (audit B1): isDrawByRepetition indexed the hash history with an i8,
// so a game longer than 127 plies read the array at a negative index.
describe("Fix 19: repetition detection works past 127 plies", () => {
  it("finds a threefold repetition at the end of a 140 ply history", () => {
    const board = parseFEN("4k3/8/8/8/8/8/8/4K2R w - - 99 90");
    const current = board.hashCode();
    for (let i = 0; i < 140; i++) {
      board.hashHistory.push(<u64>(i + 1) * 0x9e3779b97f4a7c15);
    }
    board.hashHistory[135] = current;
    board.hashHistory[137] = current;

    expect(isDraw(WHITE, board)).toBe(true);
  });
});
