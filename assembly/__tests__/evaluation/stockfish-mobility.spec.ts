import { BLACK, maskString, WHITE } from "../../bitboard";
import {
  bishopMobilityBonus,
  knightMobilityBonus,
  mobility,
  mobilityArea,
  mobilityAreaMask,
  mobilityFor,
  mobilityMg,
  queenMobilityBonus,
  rookMobilityBonus,
} from "../../evaluation/stockfish-mobility";
import { parseFEN } from "../../fen-parser";

describe("Stockfish mobility evaluation", () => {
  it("should evaluate mobility areas", () => {
    const board = parseFEN(
      "rnbqkbnr/pp1ppppp/8/2p2P2/2P5/8/PP1PP1PP/RNBQKBNR w KQkq c6 0 2"
    );
    expect(mobilityArea(board, WHITE, 0)).toBe(true);
    expect(mobilityArea(board, WHITE, 3)).toBe(false);
    expect(mobilityArea(board, WHITE, 4)).toBe(false);
    expect(mobilityArea(board, WHITE, 10)).toBe(true);
    expect(mobilityArea(board, WHITE, 15)).toBe(false);
    expect(mobilityArea(board, WHITE, 24)).toBe(true);
    expect(mobilityArea(board, WHITE, 25)).toBe(false);
    expect(mobilityArea(board, WHITE, 37)).toBe(true);
    expect(mobilityArea(board, WHITE, 26)).toBe(false);
    expect(mobilityArea(board, BLACK, 34)).toBe(false);
  });

  it("should evaluate mobility areas bis", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b2P1/1Nn3P1/PB3RPP/3R2K1 b kq - 17 14"
    );
    log(maskString(mobilityAreaMask(board, WHITE)));
    expect(mobilityArea(board, WHITE, 13)).toBe(false);
  });

  it("should evaluate mobility", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/3NB3/PPPPPPPP/R2K1BNR w KQkq - 0 1"
    );
    expect(mobility(board, WHITE, 19)).toBe(6);
    expect(mobility(board, WHITE, 0)).toBe(2);
    expect(mobility(board, WHITE, 6)).toBe(2);
    expect(mobility(board, WHITE, 7)).toBe(1);
    expect(mobility(board, WHITE, 20)).toBe(5);
    expect(mobility(board, BLACK, 57)).toBe(2);
    expect(mobility(board, BLACK, 59)).toBe(1);
  });
  xit("should evaluate mobility bis", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );
    expect(mobility(board, BLACK, 42)).toBe(2);

  });

  it("should evaluate mobility at middle game", () => {
    const board = parseFEN(
      "rnbqkb1r/ppp3pp/2np2P1/3P4/p1P3B1/P1P1p1PP/4P3/RN1QKBNR b KQkq - 1 2"
    );

    expect(mobilityFor(board, WHITE, true) - mobilityFor(board, BLACK, true)).toBe(-45);
  });

  it("should evaluate mobility at middle game bis", () => {
    const board = parseFEN(
      "2n1k1n1/5ppp/P1qBp1N1/pQP1p3/3b4/1Nn2P2/PB3PPP/3R1RK1 w kq - 16 14"
    );

    expect(mobilityFor(board, WHITE, true) - mobilityFor(board, BLACK, true)).toBe(170);
  });
});
