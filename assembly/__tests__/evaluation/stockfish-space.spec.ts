import {
  BLACK, WHITE
} from "../../bitboard";
import { resetCache } from "../../evaluation/stockfish-cache";
import { space, spaceArea } from "../../evaluation/stockfish-space";
import { parseFEN } from "../../fen-parser";

describe("Stockfish space area evaluation", () => {

  beforeEach(() => {
    resetCache();
  });
  
  it("should count safe squares for minor peaces on central files", () => {
    const board = parseFEN(
      "rnbqkbnr/4pppp/p4p2/pP6/4P3/3P4/P3PPPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(spaceArea(board, BLACK)).toBe(<i16>6);
    expect(spaceArea(board, WHITE)).toBe(<i16>10);
  });
});

describe("Stockfish space evaluation", () => {

  beforeEach(() => {
    resetCache();
  });

  it("should be 0 when there is not enough non pawn material", () => {
    const board = parseFEN(
      "1nb1kbn1/4pppp/p4p2/pP6/4P3/3P4/P3PPPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(space(board, BLACK)).toBe(<i16>0);
    expect(space(board, WHITE)).toBe(<i16>0);
  });
  it("should be greather than 0 when there is enough non pawn material without blocked pawns", () => {
    const board = parseFEN(
      "1nbnkbn1/4pppp/5p2/pP6/8/3P4/P3PPPP/RNBQKBNR w KQkq - 0 5"
    );
    expect(space(board, BLACK)).toBe(<i16>40);
    expect(space(board, WHITE)).toBe(<i16>90);
  });
  it("should be greather than 0 when there is enough non pawn material with blocked pawns", () => {
    const board = parseFEN(
      "1nbnkbn1/5ppp/5p2/p3p3/P7/3P1P2/P3P1PP/RNBQKBNR w KQkq e6 0 6"
    );
    expect(space(board, BLACK)).toBe(<i16>99);
    expect(space(board, WHITE)).toBe(<i16>126);
  });
});

