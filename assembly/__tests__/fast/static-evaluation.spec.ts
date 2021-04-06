import { evaluate } from "../../fast/static-evaluation";
import { parseFEN } from "../../fast/fen-parser";
import { BLACK, WHITE } from "../../fast/bitboard";

describe(`Static evaluation`, () => {
  it("should be 0 when the game begins", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const initialBoard = parseFEN(fen);
    expect(evaluate(BLACK, initialBoard)).toBe(0);
  });

  it("should be positive when white wins", () => {
    const fen = "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const board = parseFEN(fen);
    expect(evaluate(WHITE, board)).toBeGreaterThan(0);
  });

  it("should be negative for white when black wins", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R2QKBNR w KQkq - 0 1";
    const board = parseFEN(fen);
    expect(evaluate(WHITE, board)).toBeLessThan(0);
  });
});
