import { BISHOP, BitBoard, BLACK, KNIGHT, maskString, QUEEN, ROOK, WHITE } from "../../bitboard";
import {
  bishopsOnKingRing,
  blockersForKingMask,
  isInKingRing,
  kingAttackersCount,
  kingAttackersWeight,
  kingAttacks,
  possibleChecksMask,
  rooksOnKingRing,
  safeChecksMask,
  unsafeChecksMask,
  weakSquaresMask,
} from "../../evaluation/stockfish-king";
import { parseFEN } from "../../fen-parser";

describe("Stockfish king evaluation", () => {
  it("should evaluate king ring", () => {
    const board = parseFEN(
      "3q4/1ppppppp/1bnrkn2/p2r2R1/3NP3/2BR4/PPP1PPPP/2KQ2N1 b KQkq - 1 3"
    );
    expect(isInKingRing(board, WHITE, 1, true)).toBe(true);
    expect(isInKingRing(board, WHITE, 18, true)).toBe(true);
    expect(isInKingRing(board, WHITE, 19, true)).toBe(true);
    expect(isInKingRing(board, WHITE, 19, false)).toBe(false);
  });
  it("should evaluate king attackers count", () => {
    const board = parseFEN(
      "2r5/1ppppppp/R1n1kn2/p2r2b1/2N1Pq2/2BR4/PPPQPPPP/2K3N1 b KQkq - 0 4"
    );
    //log(maskString(kingRingCache[61]));
    expect(kingAttackersCount(board, BLACK)).toBe(2);
    expect(kingAttackersCount(board, WHITE)).toBe(5);
  });
  // 2r5/1ppppppp/R1n1kn2/pr4b1/2N1PqQ1/2B1R3/PPP1PPPP/2K3N1 b KQkq - 0 4
  it("should count rooks on king ring", () => {
    const board = parseFEN(
      "2r5/1ppppppp/R1n1kn2/pr4b1/2N1PqQ1/2B1R3/PPP1PPPP/2K3N1 b KQkq - 0 4"
    );
    //log(maskString(kingRingCache[61]));
    expect(rooksOnKingRing(board, BLACK)).toBe(1);
    expect(rooksOnKingRing(board, WHITE)).toBe(1);
  });
  it("should count bishops on king ring", () => {
    const board = parseFEN(
      "2r5/1ppp1ppp/R3kn2/pr2q1b1/2N1pnQ1/1B1PP3/PPPR1PPP/2K3N1 b KQkq - 0 4"
    );
    //log(maskString(kingRingCache[61]));
    expect(bishopsOnKingRing(board, BLACK)).toBe(0);
    expect(bishopsOnKingRing(board, WHITE)).toBe(1);
  });

  it("should evaluate king attackers weight", () => {
    const board = parseFEN(
      "1nb1kbn1/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    //log(maskString(kingRingCache[61]));
    expect(kingAttackersWeight(board, BLACK)).toBe(81);
    expect(kingAttackersWeight(board, WHITE)).toBe(62);
  });
  it("should evaluate king attacks", () => {
    const board = parseFEN(
      "1nb1kbn1/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    //log(maskString(kingRingCache[61]));
    expect(kingAttacks(board, BLACK)).toBe(1);
    expect(kingAttacks(board, WHITE)).toBe(3);
  });

  it("should evaluate weak squares mask", () => {
    const board = parseFEN(
      "1nb1kbn1/5ppp/5p2/p3p3/PQB3n1/3P1P2/PB2P1PP/RN2K1NR b KQkq - 1 6"
    );
    expect(weakSquaresMask(board, BLACK) & (1 << 13)).not.toBe(0);
    expect(weakSquaresMask(board, BLACK) & (1 << 12)).toBe(0);

  });

  it("should evaluate possible checks", () => {
    const board = parseFEN(
      "1nb1kbn1/3q1ppp/P4p2/p3p3/1QB3n1/1N1P1P2/PB2P1PP/R3K1NR b KQkq - 3 7"
    );
    expect(possibleChecksMask(board, BLACK, BISHOP) & (1 << 25)).not.toBe(0);
    expect(possibleChecksMask(board, BLACK, BISHOP) & ~(1 << 25)).toBe(0);
    expect(possibleChecksMask(board, WHITE, QUEEN) & (1 << 24)).not.toBe(0);
  });

  it("should evaluate safe checks", () => {
    const board = parseFEN(
      "1nb1k1n1/3q1ppp/P4p2/p3p1bN/1QB5/1N1PnP2/PB2P1PP/2R1K2R b kq - 7 9"
    );
    expect(safeChecksMask(board, WHITE, BISHOP)).toBe((1 << 33));
    expect(safeChecksMask(board, WHITE, KNIGHT)).toBe((1 << 54));

    const board2 = parseFEN("1nb1k1n1/3q1ppp/P4p2/p3p1bN/2B5/1NQPnP2/PB2P1PP/2R1K2R b kq - 7 9");
    expect(safeChecksMask(board2, WHITE, BISHOP)).toBe(0);
    
    const board3 = parseFEN("1nb1k1n1/3q1ppp/P4p2/p1PNp1bN/2Q5/4nP2/PB1BP1PP/2R1K2R b kq - 7 9");
    expect(safeChecksMask(board3, WHITE, QUEEN)).toBe(0);
  });

  it("should evaluate unsafe checks", () => {
    const board = parseFEN(
      "1nb1k1n1/3q1ppp/P4p2/p1P1p1bN/2BQ4/1N2nP2/PB2P1PP/2R1K2R b kq - 9 10"
    );
    expect(unsafeChecksMask(board, WHITE)).toBe((1 << 33) | (1 << 45) | (1 << 53));
  });

  it("should evaluate blockers for kings", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(blockersForKingMask(board, WHITE)).toBe(1 << 42);
    expect(blockersForKingMask(board, BLACK)).toBe(1 << 13);
  });
});
