import { BitBoard, BLACK, CLOCK, encodeCapture, PAWN, QUEEN, WHITE } from "../../bitboard";
import { parseFEN } from "../../fen-parser";
import { endGameEvaluation, mainEvaluation, scaleFactor } from "../../evaluation/stockfish-static-evaluation";
import { resetCache } from "../../evaluation/stockfish-cache";

describe("Stockfish stress evaluation", () => {
  
  beforeEach(() => {
    resetCache();
  });
  
  
  it("should evaluate score", () => {
    const board1 = parseFEN("8/Q5pp/3BkPN1/4p2P/n4p2/8/P7/5RK1 w kq - 18 15");
    const board2 = parseFEN("rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2");
    const boards: BitBoard[] = [board1, board2];
    for (let index: i32 = 0; index < 500; index++) {
      const board = unchecked(boards[index & 1]);
      mainEvaluation(WHITE, board);
    }
  });
});
