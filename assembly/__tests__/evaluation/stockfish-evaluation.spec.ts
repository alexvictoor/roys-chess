import { BLACK, encodeCapture, PAWN, QUEEN, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { mainEvaluation } from "../../evaluation/stockfish-static-evaluation";

describe("Stockfish main evaluation", () => {
  it("should be 0 when the game begins", () => {
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    expect(mainEvaluation(board)).toBe(0);
  });
  xit("should be positive when player do not loose material after capture", () => {
    const board = parseFEN("7k/p7/1p6/2Q5/8/8/8/2R4K b - - 0 1");
    expect(mainEvaluation(board)).toBeGreaterThan(0);
  });
  xit("should be negative when player could loose a queen", () => {
    const board = parseFEN(
      "r1bqkb1r/ppp1pppp/2P2n2/8/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 4"
    );
    const queenCapture = encodeCapture(
      BLACK + QUEEN,
      59,
      BLACK + QUEEN,
      27,
      WHITE + PAWN,
      27
    );
    expect(mainEvaluation(board)).toBeLessThan(600);
  });
});
