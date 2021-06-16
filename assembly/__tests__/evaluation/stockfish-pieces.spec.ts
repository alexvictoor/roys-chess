import { BLACK, WHITE } from "../../bitboard";
import { pawnAttacksSpan } from "../../evaluation/stockfish-pieces";
import { parseFEN } from "../../fen-parser";

describe("Stockfish pieces evaluation", () => {
  it("should evaluate pawn attacks span", () => {
    const board = parseFEN(
      "rnbqk1nr/pp1p1p1p/2pPpb2/4P1p1/2P1P3/5P2/P2N2PP/R1BQKBNR w KQkq g6 0 2"
    );
    expect(pawnAttacksSpan(board, WHITE, 0)).toBe(1);
    expect(pawnAttacksSpan(board, BLACK, 0)).toBe(0);
  });
});
