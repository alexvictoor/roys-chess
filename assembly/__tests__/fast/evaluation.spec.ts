import { evaluate } from "../../fast/evaluation";
import { parseFEN } from "../../fast/fen-parser";

describe(`Evaluation`, () => {
  it("should be 0 when the game begins", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const initialBoard = parseFEN(fen);
    expect(evaluate(initialBoard)).toBe(0);
  });

  it("should be positive when white wins", () => {
    const fen = "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const board = parseFEN(fen);
    expect(evaluate(board)).toBeGreaterThan(0);
  });

  it("should be negative when black wins", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R2QKBNR w KQkq - 0 1";
    const board = parseFEN(fen);
    expect(evaluate(board)).toBeLessThan(0);
  });
});
