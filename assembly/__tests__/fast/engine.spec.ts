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
import { legalMoves } from "../../fast/engine";
import { parseFEN } from "../../fast/fen-parser";
import { legalCaptures } from "../../fast/quiescence-evaluation";

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

  it("should get pawns legal moves", () => {
    // given
    const initialFEN =
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    const board = parseFEN(initialFEN);
    // when
    const moves = legalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(20);
  });

  it("should get castling moves", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
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

describe(`Engine captures`, () => {
  it("should get king captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, BLACK, 12);
    board.putPiece(KING, WHITE, 4);
    // when
    const captures = legalCaptures(board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(captures[0].getPawnMask(BLACK)).toBe(0);
  });
  it("should get knight captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(QUEEN, BLACK, 53);
    board.putPiece(PAWN, WHITE, 37);
    board.putPiece(KNIGHT, WHITE, 43);
    // when
    const captures = legalCaptures(board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(captures[0].getQueenMask(BLACK)).toBe(0);
  });
  it("should capture on the side", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 23);
    board.putPiece(PAWN, BLACK, 30);
    // when
    const captures = legalCaptures(board, WHITE);
    // then
    expect(captures).toHaveLength(1);
  });
  it("should get rook captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 8);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(KNIGHT, WHITE, 3);
    // when
    const captures = legalCaptures(board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(captures[0].getKnightMask(BLACK)).toBe(0);
  });

  it("should get bishop captures", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 54);
    board.putPiece(BISHOP, WHITE, 36);
    board.putPiece(KNIGHT, WHITE, 43);
    // when
    const captures = legalCaptures(board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(captures[0].getKnightMask(BLACK)).toBe(0);
  });

  it("should get queen captures in diagonals", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KNIGHT, BLACK, 54);
    board.putPiece(QUEEN, WHITE, 36);
    board.putPiece(KNIGHT, WHITE, 43);
    // when
    const captures = legalCaptures(board, WHITE);
    // then
    expect(captures).toHaveLength(1);
    expect(captures[0].getKnightMask(BLACK)).toBe(0);
  });
});
