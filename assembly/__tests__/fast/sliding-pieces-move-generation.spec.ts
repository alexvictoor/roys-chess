import { BISHOP, BitBoard, KING, maskString, WHITE } from "../../fast/bitboard";
import { bishopAttacks, rookAttacks } from "../../fast/magic";
import {
  bishopMoves,
  bishopPseudoLegalMoves,
  rookMoves,
} from "../../fast/sliding-pieces-move-generation";

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
});
