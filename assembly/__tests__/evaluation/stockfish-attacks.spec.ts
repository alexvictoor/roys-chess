import { BLACK, maskString, WHITE } from "../../bitboard";
import { attackByBishopsMask, attackByRooksMask, attackOnceMask, attackTwiceMask, queenAttackMask, rookXRayAttackMask } from "../../evaluation/stockfish-attacks";
import { parseFEN } from "../../fen-parser";

describe("Stockfish attacks", () => {
  it("should compute bishop attacks", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1q1p1N1/pQP1p3/3b4/1Nn2P2/P4PPP/1RRr1BK1 w kq - 18 15"
    );

    const mask = attackByBishopsMask(board, WHITE);
    expect(mask).toBe(0);
  });

  it("should compute rook attacks", () => {
    const board = parseFEN(
      "2n1k1n1/2q2ppp/P1rBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 b kq - 17 14"
    );

    const mask = attackByRooksMask(board, BLACK);
    expect(mask).toBe(0);
  });

  it("should compute queen attacks", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );

    const mask = queenAttackMask(board, BLACK, 42, ~0);
    expect(popcnt(mask)).toBe(3);
  });
 
  it("should compute queen attacks bis", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pRP1p3/3b4/1Nn2P2/PB3PPP/3Q1RK1 b kq - 17 14"
    );

    const mask = queenAttackMask(board, BLACK, 42, ~0);
    expect(popcnt(mask)).toBe(14);
  });
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
