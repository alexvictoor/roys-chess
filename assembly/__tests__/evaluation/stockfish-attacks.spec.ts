import { BLACK, WHITE } from "../../bitboard";
import { attackOnceMask, attackTwiceMask } from "../../evaluation/stockfish-attacks";
import { parseFEN } from "../../fen-parser";

describe("Stockfish attacks", () => {
  it("should find all squares attacked", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/3NB3/PPPPPPPP/R2K1BNR w KQkq - 0 1"
    );

    const whiteMask = attackOnceMask(board, WHITE);
    const blackMask = attackOnceMask(board, BLACK);
    expect(!!(whiteMask & (1 << 48))).toBe(true);
    expect(!!(whiteMask & (1 << 40))).toBe(false);
    expect(!!(blackMask & (1 << 48))).toBe(true);
    expect(!!(blackMask & (1 << 40))).toBe(true);
    expect(!!(blackMask & (1 << 59))).toBe(true);
  });
  it("should find all squares attacked twice", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/3NB3/PPPPPPPP/R2K1BNR w KQkq - 0 1"
    );

    const whiteMask = attackTwiceMask(board, WHITE);
    const blackMask = attackTwiceMask(board, BLACK);
    expect(!!(whiteMask & (1 << 48))).toBe(false);
    expect(!!(whiteMask & (1 << 40))).toBe(false);
    expect(!!(blackMask & (1 << 48))).toBe(false);
    expect(!!(blackMask & (1 << 40))).toBe(true);
  });

});
