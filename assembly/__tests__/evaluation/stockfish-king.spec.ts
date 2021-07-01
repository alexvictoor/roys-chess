import { BitBoard, BLACK, WHITE } from "../../bitboard";
import {
  bishopsOnKingRing,
  isInKingRing,
  kingAttackersCount,
  rooksOnKingRing,
} from "../../evaluation/stockfish-king";
import { parseFEN } from "../../fen-parser";

describe("Stockfish king evaluation", () => {
  it("should evaluate king ring", () => {
    const board = parseFEN(
      "3q4/1ppppppp/1bnrkn2/p2r2R1/3NP3/2BR4/PPP1PPPP/2KQ2N1 b KQkq - 1 3"
    );
    //log(maskString(kingRingCache[61]));
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
});
