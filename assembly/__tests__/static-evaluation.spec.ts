import { evaluate } from "../static-evaluation";
import { parseFEN } from "../fen-parser";
import { BitBoard, BLACK, KING, PAWN, QUEEN, ROOK, WHITE } from "../bitboard";

describe("Static evaluation", () => {

  it("should be positive when white wins", () => {
    const fen = "rnb1kbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const board = parseFEN(fen);
    expect(evaluate(WHITE, board)).toBeGreaterThan(0);
  });

  it("should be negative for white when black wins", () => {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R2QKBNR w KQkq - 0 1";
    const board = parseFEN(fen);
    expect(evaluate(WHITE, board)).toBeLessThan(0);
  });
  xit("should be very low when player is checkmate", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 49);
    board.putPiece(PAWN, WHITE, 42);
    board.putPiece(QUEEN, WHITE, 60);
    // when
    // then
    expect(evaluate(BLACK, board)).toBe(<i16>-100000);
  });
  xit("should be 0 when game is draw", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 49);
    board.putPiece(PAWN, WHITE, 42);
    // when
    // then
    expect(evaluate(BLACK, board)).toBe(0);
  });
});
