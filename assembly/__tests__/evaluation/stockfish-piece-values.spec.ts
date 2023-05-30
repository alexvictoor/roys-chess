import { resetCache } from "../../evaluation/stockfish-cache";
import { pieceValues } from "../../evaluation/stockfish-static-evaluation";
import { parseFEN } from "../../fen-parser";

describe("Stockfish piece values evaluation", () => {

  beforeEach(() => {
    resetCache();
  });
  
  it("should be 0 before the game begins", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(pieceValues(board, true)).toBe(0);
  });
  it("should be positive when whites have more pieces", () => {
    const board = parseFEN(
      "rnbqkbnr/p4ppp/p4p2/1p2P3/2P5/8/PP2PPPP/RNBQKBNR b KQkq c3 0 1"
    );
    expect(pieceValues(board, true)).toBe(124);
  });

  it("should evaluate eg values", () => {
    const board = parseFEN(
      "r1b1kb1r/ppp1pppp/2P2n2/8/3q4/8/PPP2PPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(pieceValues(board, false)).toBe(854);
  });
});
