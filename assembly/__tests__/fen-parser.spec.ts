import {
  BISHOP,
  BLACK,
  KING,
  KNIGHT,
  maskString,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../bitboard";
import { parseFEN } from "../fen-parser";

describe("FEN parser", () => {
  it("should parse piece positions", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    // when
    const board = parseFEN(fen);
    // then
    expect(board.getPieceAt(56)).toBe(ROOK + BLACK);
    expect(board.getPieceAt(57)).toBe(KNIGHT + BLACK);
    expect(board.getPieceAt(58)).toBe(BISHOP + BLACK);
    expect(board.getPieceAt(59)).toBe(QUEEN + BLACK);
    expect(board.getPieceAt(60)).toBe(KING + BLACK);
    expect(board.getPieceAt(61)).toBe(BISHOP + BLACK);
    expect(board.getPieceAt(62)).toBe(KNIGHT + BLACK);
    expect(board.getPieceAt(63)).toBe(ROOK + BLACK);
    expect(board.getPieceAt(48)).toBe(PAWN + BLACK);
    log(board.toString());
  });

  it("should parse position of a piece alone on its row", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1";
    // when
    const board = parseFEN(fen);
    // then
    log(maskString(board.getAllPiecesMask()));
    expect(board.getPieceAt(28)).toBe(PAWN + WHITE);
  });

  it("should parse castling rights", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KkQq e3 0 1";
    // when
    const board = parseFEN(fen);
    // then
    expect(board.kingSideCastlingRight(WHITE)).toBe(true);
    expect(board.kingSideCastlingRight(BLACK)).toBe(true);
    expect(board.queenSideCastlingRight(WHITE)).toBe(true);
    expect(board.queenSideCastlingRight(BLACK)).toBe(true);
  });

  it("should not crash", () => {
    // given
    const fen = "8/R3Bkp1/5p2/3Pp3/2r4P/5PK1/8/8 w - - 3 45";
    // when
    const board = parseFEN(fen);
    // then
  });
});

describe("FEN genrator", () => {
  it("should generate a FEN string equal to FEN string used to instantiate board", () => {
    // given
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b Kk e3 7 1";
    // when
    const board = parseFEN(fen);
    // then
    expect(board.toFEN()).toBe("rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR");
  });
});
