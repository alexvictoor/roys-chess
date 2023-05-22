import { BLACK, CLOCK, encodeCapture, PAWN, QUEEN, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { endGameEvaluation, mainEvaluation, scaleFactor } from "../../evaluation/stockfish-static-evaluation";

describe("Stockfish main evaluation", () => {
  it("should be 0 when the game begins", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(mainEvaluation(WHITE, board)).toBe(28);
  });
  it("should be positive when player do not loose material after capture", () => {
    const board = parseFEN("7k/p7/1p6/2Q5/8/8/8/2R4K b - - 0 1");
    expect(mainEvaluation(WHITE, board)).toBeGreaterThan(0);
  });


  xit("should evaluate end game score", () => {
    const board = parseFEN("8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15");
    expect(endGameEvaluation(board)).toBe(4887);
  });

  it("should compute scale factor", () => {
    const board = parseFEN("8/Q3P3/3BkPN1/3pp3/n4p2/2P1p3/8/5RK1 b kq - 0 15");
    expect(scaleFactor(board, WHITE)).toBe(40);
  });
  it("should compute scale factor bis", () => {
    const board = parseFEN("8/Q3P3/b3k1p1/1P1qp3/n1p5/8/8/5RK1 w kq - 1 16");
    expect(scaleFactor(board, BLACK)).toBe(57);
  });

  it("should evaluate score", () => {
    const board = parseFEN("8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15");
    board.bits[CLOCK] = 18;
    expect(mainEvaluation(WHITE, board)).toBe(3366); //3368
  });
  it("should evaluate score", () => {
    const board = parseFEN("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2");
    board.bits[CLOCK] = 0;
    expect(mainEvaluation(WHITE, board)).toBe(3366); //3368
  });
});
