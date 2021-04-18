import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeMove,
  KING,
  KNIGHT,
  maskString,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { isCheckMate, isDraw, isInCheck } from "../../fast/status";

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

  it("should be draw after 50 moves without any capture or pawn moved", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 6);
    board.putPiece(ROOK, BLACK, 63);
    // when
    for (let i = 0; i < 25; i++) {
      //log(boardUpdated.getHalfMoveClock());

      board.do(encodeMove(WHITE + ROOK, 6, WHITE + ROOK, 5));
      board.do(encodeMove(BLACK + ROOK, 63, BLACK + ROOK, 62));
      board.do(encodeMove(WHITE + ROOK, 5, WHITE + ROOK, 6));
      board.do(encodeMove(BLACK + ROOK, 62, BLACK + ROOK, 63));
    }
    // then
    expect(isDraw(WHITE, board)).toBe(true);
  });

  it("should not be draw after 50 moves with a pawn move", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 6);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(PAWN, WHITE, 8);
    board.putPiece(PAWN, BLACK, 48);
    // when
    for (let i = 0; i < 24; i++) {
      board.do(encodeMove(WHITE + ROOK, 6, WHITE + ROOK, 5));
      board.do(encodeMove(BLACK + ROOK, 63, BLACK + ROOK, 62));
      board.do(encodeMove(WHITE + ROOK, 5, WHITE + ROOK, 6));
      board.do(encodeMove(BLACK + ROOK, 62, BLACK + ROOK, 63));
    }
    board.do(encodeMove(WHITE + PAWN, 8, WHITE + PAWN, 16));
    board.do(encodeMove(BLACK + PAWN, 48, BLACK + PAWN, 40));
    board.do(encodeMove(WHITE + PAWN, 16, WHITE + PAWN, 24));
    board.do(encodeMove(BLACK + PAWN, 40, BLACK + PAWN, 32));

    // then
    expect(isDraw(WHITE, board)).toBe(false);
  });
  it("should be draw when current player cannot move any piece", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 49);
    board.putPiece(PAWN, WHITE, 42);
    // when
    // then
    expect(isDraw(BLACK, board)).toBe(true);
  });
  it("should be checkmate", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 49);
    board.putPiece(PAWN, WHITE, 42);
    board.putPiece(QUEEN, WHITE, 60);
    // when
    // then
    expect(isCheckMate(BLACK, board)).toBe(true);
  });

  it("should be draw on the third board repetition", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 5);
    board.putPiece(KING, BLACK, 56);
    board.putPiece(ROOK, WHITE, 6);
    board.putPiece(ROOK, BLACK, 63);
    // when
    board.do(encodeMove(WHITE + ROOK, 6, WHITE + ROOK, 5));
    board.do(encodeMove(BLACK + ROOK, 63, BLACK + ROOK, 62));
    board.do(encodeMove(WHITE + ROOK, 5, WHITE + ROOK, 6));
    board.do(encodeMove(BLACK + ROOK, 62, BLACK + ROOK, 63));
    board.do(encodeMove(WHITE + ROOK, 6, WHITE + ROOK, 5));
    board.do(encodeMove(BLACK + ROOK, 63, BLACK + ROOK, 62));
    board.do(encodeMove(WHITE + ROOK, 5, WHITE + ROOK, 6));
    board.do(encodeMove(BLACK + ROOK, 62, BLACK + ROOK, 63));
    board.do(encodeMove(WHITE + ROOK, 6, WHITE + ROOK, 5));
    board.do(encodeMove(BLACK + ROOK, 63, BLACK + ROOK, 62));
    board.do(encodeMove(WHITE + ROOK, 5, WHITE + ROOK, 6));
    board.do(encodeMove(BLACK + ROOK, 62, BLACK + ROOK, 63));
    // then
    expect(isDraw(WHITE, board)).toBe(true);
  });
});
