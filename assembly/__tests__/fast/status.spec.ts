import {
  BISHOP,
  BitBoard,
  BLACK,
  KING,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { isInCheck } from "../../fast/status";

describe(`Status`, () => {
  it("should be checked when attacked by opponent rook", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    const blackRookPosition1: i8 = 20;
    board.putPiece(ROOK, BLACK, blackRookPosition1);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });

  it("should be checked when attacked by opponent rooks", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    const blackRookPosition0: i8 = 13;
    board.putPiece(ROOK, BLACK, blackRookPosition0);
    const blackRookPosition1: i8 = 19;
    board.putPiece(ROOK, BLACK, blackRookPosition1);
    const blackRookPosition2: i8 = 20;
    board.putPiece(ROOK, BLACK, blackRookPosition2);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });

  it("should not be checked when not attacked by opponent rook", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    const blackRookPosition1: i8 = 19;
    board.putPiece(ROOK, BLACK, blackRookPosition1);
    // then
    expect(isInCheck(WHITE, board)).toBe(false);
  });

  it("should be checked when attacked by opponent bishop", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 45;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    board.putPiece(BISHOP, BLACK, 61);
    board.putPiece(BISHOP, BLACK, 62);
    board.putPiece(BISHOP, BLACK, 63);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });

  it("should be checked when attacked by opponent queen", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    board.putPiece(QUEEN, BLACK, 34);
    board.putPiece(QUEEN, BLACK, 26);
    board.putPiece(QUEEN, BLACK, 36);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });

  it("should be checked when attacked by opponent king", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    const blackKingPosition: i8 = 5;
    board.putPiece(KING, BLACK, blackKingPosition);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });

  it("should be checked when attacked by opponent knight", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    board.putPiece(KNIGHT, BLACK, 0);
    board.putPiece(KNIGHT, BLACK, 1);
    board.putPiece(KNIGHT, BLACK, 14);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });
  it("should be checked when attacked by opponent pawn", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 4;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    const blackPawnPosition: i8 = 13;
    board.putPiece(PAWN, BLACK, blackPawnPosition);
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });
  it("should not be checked when not attacked by opponent pawn", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 7;
    board.putPiece(KING, WHITE, whiteKingPosition);
    // when
    const blackPawnPosition: i8 = 16;
    board.putPiece(PAWN, BLACK, blackPawnPosition);
    // then
    expect(isInCheck(WHITE, board)).toBe(false);
  });

  it("should be checked when attacked by opponent white pawn", () => {
    // given
    const board = new BitBoard();
    const blackKingPosition: i8 = 36;
    board.putPiece(KING, BLACK, blackKingPosition);
    // when
    const whitePawnPosition: i8 = 27;
    board.putPiece(PAWN, WHITE, whitePawnPosition);
    // then
    expect(isInCheck(BLACK, board)).toBe(true);
  });

  it("should not be checked when not attacked by opponent white pawn", () => {
    // given
    const board = new BitBoard();
    const blackKingPosition: i8 = 56;
    board.putPiece(KING, BLACK, blackKingPosition);
    // when
    const whitePawnPosition: i8 = 47;
    board.putPiece(PAWN, WHITE, whitePawnPosition);
    // then
    expect(isInCheck(BLACK, board)).toBe(false);
  });
});
