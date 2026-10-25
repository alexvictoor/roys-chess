import { chooseBestMove, reset } from "../../alpha-beta-evaluation";
import { BLACK, encodeMove, ROOK } from "../../bitboard";
import { parseFEN } from "../../fen-parser";

// Fix 18 (audit S7), part 2: the search never compared a node with the game
// history, so a lost side could not steer into a repetition.
describe("Fix 18b: a lost side steers into a repetition", () => {
  it("picks the only move that repeats a position of the game", () => {
    // black is a queen down; Rh7-g7 would repeat an earlier position
    const board = parseFEN("7k/7r/8/8/8/8/8/K2Q1R2 b - - 10 40");
    const repeating = encodeMove(ROOK + BLACK, 55, ROOK + BLACK, 54);
    board.do(repeating);
    const repeatedHash = board.hashCode();
    board.undo();
    board.hashHistory.push(repeatedHash);
    reset();

    const move = <u32>(chooseBestMove(BLACK, board, 5) & 0xffffffff);

    expect(move).toBe(repeating);
  });
});
