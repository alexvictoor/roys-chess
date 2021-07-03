import { BLACK, WHITE } from "../../bitboard";
import { mobility, mobilityArea } from "../../evaluation/stockfish-mobility";
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
 
});
