import { resetCache } from "../../evaluation/stockfish-cache";
import { imbalanceTotal } from "../../evaluation/stockfish-static-evaluation";
import { parseFEN } from "../../fen-parser";

describe("Stockfish imbalance evaluation", () => {

  beforeEach(() => {
    resetCache();
  });
  
  it("should evaluate imbalance correction", () => {
    const board = parseFEN(
      "r1bqkb1r/ppp1pppp/2P2n2/8/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 4"
    );
    expect(imbalanceTotal(board)).toBe(201);
    
  });
  it("should evaluate imbalance correction without bishop pairs", () => {
    const board = parseFEN(
      "r1bqkb1r/ppp1pppp/2P2n2/8/3P4/8/PPP2PPP/RNBQK1NR b KQkq - 0 4"
    );
    expect(imbalanceTotal(board)).toBe(35);
    
  });

});
