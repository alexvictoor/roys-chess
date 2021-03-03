import {
  BISHOP,
  BitBoard,
  BLACK,
  KING,
  KNIGHT,
  maskString,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { bishopAttacks, rookAttacks } from "../../fast/magic";
import {
  bishopMoves,
  bishopPseudoLegalMoves,
  rookPseudoLegalMoves,
  rookMoves,
  bishopLegalMoves,
} from "../../fast/sliding-pieces-move-generation";
import { isInCheck } from "../../fast/status";

describe(`Rook magic move generation`, () => {
  it("should get rook moves", () => {
    // given
    const board: u64 = (1 << 2) + (1 << 9);
    const position: i8 = 10;
    // when
    const moves = rookMoves(board, position);
    // then
    expect(rookMoves(board, position)).toBe(rookAttacks(position, board));
  });
  it("should get rook moves on border", () => {
    // given
    const board: u64 = 1 + (1 << 8);
    const position: i8 = 0;
    // when
    const moves = rookMoves(board, position);
    // then
    expect(rookMoves(board, position)).toBe(rookAttacks(position, board));
  });
  it("should get rook pseudo legal moves", () => {
    // given
    const board = new BitBoard();
    const whiteRookPosition: i8 = 0;
    board.putPiece(ROOK, WHITE, whiteRookPosition);
    // when
    const moves = rookPseudoLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(14);
  });
  it("should get rook pseudo legal moves when there is a piece in the way", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 8;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteRookPosition: i8 = 0;
    board.putPiece(ROOK, WHITE, whiteRookPosition);
    // when
    const moves = rookPseudoLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(7);
  });
  it("should get rook pseudo legal moves when there is a capture", () => {
    // given
    const board = new BitBoard();
    const blackKnightPosition: i8 = 8;
    board.putPiece(KNIGHT, BLACK, blackKnightPosition);
    const whiteRookPosition: i8 = 0;
    board.putPiece(ROOK, WHITE, whiteRookPosition);
    const whiteKnightPosition: i8 = 1;
    board.putPiece(KNIGHT, WHITE, whiteKnightPosition);
    // when
    const moves = rookPseudoLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(1);
    expect(board.execute(moves[0]).getKnightMask(BLACK)).toBe(0);
  });
});

describe(`Bishop magic move generation`, () => {
  it("should get bishop moves", () => {
    // given
    const position: i8 = 19;
    const board: u64 = (1 << 26) + (1 << 28);
    // when
    const moves = bishopMoves(board, position);
    // then
    expect(moves).toBe(bishopAttacks(position, board));
  });
  it("should get bishop pseudo legal moves", () => {
    // given
    const board = new BitBoard();
    const whiteBishopPosition: i8 = 0;
    board.putPiece(BISHOP, WHITE, whiteBishopPosition);
    // when
    const moves = bishopPseudoLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(7);
  });
  it("should get bishop pseudo legal moves when there is a piece in the way", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 9;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteBishopPosition: i8 = 0;
    board.putPiece(BISHOP, WHITE, whiteBishopPosition);
    // when
    const moves = bishopPseudoLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(0);
  });
  it("should get bishop pseudo legal moves when there is a capture", () => {
    // given
    const board = new BitBoard();
    const blackKnightPosition: i8 = 9;
    board.putPiece(KNIGHT, BLACK, blackKnightPosition);
    const whiteBishopPosition: i8 = 0;
    board.putPiece(BISHOP, WHITE, whiteBishopPosition);
    // when
    const moves = bishopPseudoLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(1);
    expect(board.execute(moves[0]).getKnightMask(BLACK)).toBe(0);
  });

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
    log(maskString(board.getAllPiecesMask()));
    const moves = bishopLegalMoves(board, WHITE);
    // then
    expect(moves).toHaveLength(0);
  });
  it("should get bishop legal moves WWW", () => {
    // given
    const board = new BitBoard();
    const whiteKingPosition: i8 = 1;
    board.putPiece(KING, WHITE, whiteKingPosition);
    const whiteBishopPosition: i8 = 10;
    board.putPiece(BISHOP, WHITE, whiteBishopPosition);
    const blackKingPosition: i8 = 58;
    board.putPiece(KING, BLACK, blackKingPosition);
    const blackRookPosition: i8 = 41;
    board.putPiece(ROOK, BLACK, blackRookPosition);
    // when
    log(maskString(board.getAllPiecesMask()));
    // then
    expect(isInCheck(WHITE, board)).toBe(true);
  });
});
