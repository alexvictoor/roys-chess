import { BLACK, maskString, WHITE } from "../../bitboard";
import { attackMask, attackOnceMask, attackTwiceMask, hangingMask, kingThreatMask, pawnPushThreatMask, threatSafePawnMask, weakEnemiesMask } from "../../evaluation/stockfish-attacks";
import { mobility, mobilityArea, mobilityMg } from "../../evaluation/stockfish-mobility";
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

  it("should detect weak enemies", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );

    const whiteMask = weakEnemiesMask(board, WHITE);
    const blackMask = weakEnemiesMask(board, BLACK);
    expect(whiteMask).toBe(1 << 46);
    expect(blackMask).toBe((1 << 24) | (1 << 55) | (1 << 58));
  });
  it("should detect hanging pieces when pieces are not defended", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );

    const whiteMask = hangingMask(board, WHITE);
    const blackMask = hangingMask(board, BLACK);
    expect(whiteMask).toBe(1 << 46);
    expect(blackMask).toBe((1 << 24));
  });
  it("should detect hanging pieces when pieces are attacked twice", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKB1R w KQkq - 2 3"
    );

    const blackMask = hangingMask(board, BLACK);

    expect(blackMask).toBe((1 << 24 | 1 << 58));
  });

  it("should detect pieces threat by king", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/2np2P1/3P4/p1P4B/P1P1p1PP/4P3/RN1QK2R w KQkq - 2 3"
    );

    const whiteMask = kingThreatMask(board, WHITE);
    const blackMask = kingThreatMask(board, BLACK);

    expect(whiteMask).toBe(0);
    expect(blackMask).toBe((1 << 52));
  });
  it("should detect pawn push threats", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P4B/P1P1p1PP/4P3/RN1QK2R b KQkq - 0 3"
    );

    const whiteMask = pawnPushThreatMask(board, WHITE);
    //const blackMask = pawnPushThreatMask(board, BLACK);

    expect(whiteMask).toBe(1 << 37);
    //expect(blackMask).toBe(0);
  });
  it("should detect pawn push threats when pawn will attack after moving 2 square ahead from initial position", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P4B/P1P1p2P/4P1P1/RN1QK2R w KQkq - 2 3"
    );

    const whiteMask = pawnPushThreatMask(board, WHITE);
    const blackMask = pawnPushThreatMask(board, BLACK);

    expect(whiteMask).toBe(1 << 37);
    expect(blackMask).toBe(0);
  });
  it("should detect pawn push threats when pawn will attack after moving 2 square ahead from initial position (bis)", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P2p1B/P1P4P/3P2P1/RN1QK2R b KQkq - 0 4"
    );

    const whiteMask = pawnPushThreatMask(board, WHITE);
    const blackMask = pawnPushThreatMask(board, BLACK);

    expect(whiteMask).toBe(1 << 37);
    expect(blackMask).toBe(0);
  });
//rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P2p1B/P1P4P/3P2P1/RN1QK2R b KQkq - 0 4


  //rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P3PB/P1P1p2P/4P3/RN1QK2R b KQkq - 0 4
  it("should detect threats by safe pawns", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp1N1pp/3p2P1/3P1n2/p1P3PB/P1P1p2P/4P3/RN1QK2R b KQkq - 0 4"
    );

    const whiteMask = threatSafePawnMask(board, WHITE);
    const blackMask = threatSafePawnMask(board, BLACK);

    log(maskString(whiteMask));

    expect(whiteMask).toBe(1 << 37);
    expect(blackMask).toBe(0);
  });

 
});
