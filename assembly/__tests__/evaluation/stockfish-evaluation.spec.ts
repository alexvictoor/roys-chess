import { BLACK, encodeCapture, PAWN, QUEEN, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { mainEvaluation } from "../../evaluation/stockfish-static-evaluation";

describe("Stockfish main evaluation", () => {
  it("should be 0 when the game begins", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(mainEvaluation(board)).toBe(0);
  });
  it("should be positive when player do not loose material after capture", () => {
    const board = parseFEN("7k/p7/1p6/2Q5/8/8/8/2R4K b - - 0 1");
    expect(mainEvaluation(board)).toBeGreaterThan(0);
  });
  
});
