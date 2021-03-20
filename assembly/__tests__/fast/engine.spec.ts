import {
  BISHOP,
  BitBoard,
  BLACK,
  KING,
  KNIGHT,
  maskString,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { legalMoves } from "../../fast/engine";

describe(`Engine move generation`, () => {
  it("should get bishop legal moves", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 1;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteBishopPosition: i8 = 9;
    board.putPiece(BISHOP, WHITE, whiteBishopPosition);
    const blackKingPosition: i8 = 58;
    board.putPiece(KING, BLACK, blackKingPosition);
    const blackRookPosition: i8 = 41;
    board.putPiece(ROOK, BLACK, blackRookPosition);
    // when
    const moves = legalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(4);
  });

  it("should get rook legal moves", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 1;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteRookPosition: i8 = 10;
    board.putPiece(ROOK, WHITE, whiteRookPosition);
    const blackKingPosition: i8 = 63;
    board.putPiece(KING, BLACK, blackKingPosition);
    const blackKnightPosition: i8 = 16;
    board.putPiece(KNIGHT, BLACK, blackKnightPosition);
    // when
    const moves = legalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(4);
  });

  it("should get knight legal moves", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 1;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteRookPosition: i8 = 10;
    board.putPiece(KNIGHT, WHITE, whiteRookPosition);
    const blackKingPosition: i8 = 63;
    board.putPiece(KING, BLACK, blackKingPosition);
    const blackKnightPosition: i8 = 16;
    board.putPiece(KNIGHT, BLACK, blackKnightPosition);
    // when
    const moves = legalMoves(board, WHITE);
    log(maskString(board.getAllPiecesMask()));
    // then
    expect(moves).toHaveLength(5);
  });

  it("should get queen legal moves", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 1;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteQueenPosition: i8 = 18;
    board.putPiece(QUEEN, WHITE, whiteQueenPosition);
    const blackKingPosition: i8 = 62;
    board.putPiece(KING, BLACK, blackKingPosition);
    const blackKnightPosition: i8 = 16;
    board.putPiece(KNIGHT, BLACK, blackKnightPosition);
    const blackRookPosition: i8 = 15;
    board.putPiece(ROOK, BLACK, blackRookPosition);
    // when
    const moves = legalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(3);
  });

  it("should get castling moves", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
    log(board.toString());
    // when
    const moves = legalMoves(board, BLACK);

    // then
    expect(moves).toHaveLength(26);
  });

  it("should not allow castling when king goes into check", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
    board.putPiece(BISHOP, WHITE, 46);
    // when
    const moves = legalMoves(board, BLACK);

    // then
    expect(moves).toHaveLength(4);
  });
});
