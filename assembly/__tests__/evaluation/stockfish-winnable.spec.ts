import { winnable } from "../../evaluation/stockfish-winnable";
import { parseFEN } from "../../fen-parser";

describe("Stockfish winnable evaluation", () => {
  it("should evaluate winnable correction", () => {
    const board = parseFEN(
      "r4bnr/3p2pp/b3K1pq/n2P4/k3P1p1/8/3PPPPP/RNBQ1BNR w KQ - 5 5"
    );
    expect(winnable(board)).toBe(97);
    
  });

});
