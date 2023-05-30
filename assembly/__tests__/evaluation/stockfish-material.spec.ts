import {
  BitBoard,
  BLACK,
  firstColMask,
  firstRowMask,
  opponent,
  WHITE,
} from "../../bitboard";
import {
  attackByPawnsMask,
  attackMask,
} from "../../evaluation/stockfish-attacks";
import { resetCache } from "../../evaluation/stockfish-cache";
import { nonPawnMaterial } from "../../evaluation/stockfish-material";
import { parseFEN } from "../../fen-parser";


describe("Stockfish material evaluation", () => {

  beforeEach(() => {
    resetCache();
  });
  
  it("should evaluate value of non-pawn material", () => {
    let board = parseFEN(
      "r1bqkbnr/4pppp/P4p2/p7/4P3/3P4/P3PPPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(nonPawnMaterial(board, WHITE)).toBe(<i16>8302);
    expect(nonPawnMaterial(board, BLACK)).toBe(<i16>7521);
  });
});
