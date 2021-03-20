import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCastling,
  encodeMove,
  KING,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { isInCheck } from "../../fast/status";

export function addCastlingMoves(
  moves: u64[],
  board: BitBoard,
  player: i8
): void {
  if (isInCheck(player, board)) {
    return;
  }
  const rookMask = board.getRookMask(player);
  const allPiecesMask = board.getAllPiecesMask();
  const lane: i8 = player === WHITE ? 0 : 56;
  const queenSideRook = rookMask & (1 << lane);
  const kingSideRook = rookMask & (1 << (lane + 7));
  const isKingSidePathClear = !((allPiecesMask >> (lane + 5)) & 3);
  const isQueenSidePathClear = !((allPiecesMask >> (lane + 1)) & 7);
  if (
    board.kingSideCastlingRight(player) &&
    kingSideRook &&
    isKingSidePathClear
  ) {
    const intermediateBoard = board.execute(
      encodeMove(KING + player, 4 + lane, KING + player, 5 + lane)
    );
    if (!isInCheck(player, intermediateBoard)) {
      moves.push(
        encodeCastling(
          KING + player,
          4 + lane,
          6 + lane,
          ROOK + player,
          7 + lane,
          5 + lane
        )
      );
    }
  }
  if (
    board.queenSideCastlingRight(player) &&
    queenSideRook &&
    isQueenSidePathClear
  ) {
    const intermediateBoard = board.execute(
      encodeMove(KING + player, 4 + lane, KING + player, 3 + lane)
    );
    if (!isInCheck(player, intermediateBoard)) {
      moves.push(
        encodeCastling(
          KING + player,
          4 + lane,
          2 + lane,
          ROOK + player,
          0 + lane,
          3 + lane
        )
      );
    }
  }
}

describe(`Castling`, () => {
  it("should be possible for white on king side", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 7);
    board.putPiece(KING, BLACK, 60);

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, WHITE);

    // then
    expect(moves).toHaveLength(1);
    const boardAfterCastling = board.execute(moves[0]);
    expect(boardAfterCastling.getKingMask(WHITE)).toBe(1 << 6);
    expect(boardAfterCastling.getRookMask(WHITE)).toBe(1 << 5);
  });
  it("should be possible for white on queen side", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(KING, BLACK, 60);

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, WHITE);

    // then
    expect(moves).toHaveLength(1);
    const boardAfterCastling = board.execute(moves[0]);
    expect(boardAfterCastling.getKingMask(WHITE)).toBe(1 << 2);
    expect(boardAfterCastling.getRookMask(WHITE)).toBe(1 << 3);
  });
  it("should be possible for black on both sides", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, BLACK);

    // then
    expect(moves).toHaveLength(2);
    const boardAfterKingSideCastling = board.execute(moves[0]);
    expect(boardAfterKingSideCastling.getKingMask(BLACK)).toBe(1 << 62);
    expect(boardAfterKingSideCastling.getRookMask(BLACK)).toBe(
      (1 << 61) | (1 << 56)
    );
  });

  it("should not be possible when white king has moved", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, WHITE, 7);
    board.putPiece(KING, BLACK, 60);
    const boardAfterKingMoves = board
      .execute(encodeMove(KING + WHITE, 4, KING + WHITE, 12))
      .execute(encodeMove(KING + WHITE, 12, KING + WHITE, 4));

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, boardAfterKingMoves, WHITE);

    // then
    expect(moves).toHaveLength(0);
  });

  it("should not be possible when black king has moved", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, WHITE, 7);
    board.putPiece(KING, BLACK, 60);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    const boardAfterKingMoves = board
      .execute(encodeMove(KING + BLACK, 60, KING + BLACK, 52))
      .execute(encodeMove(KING + BLACK, 52, KING + BLACK, 60));

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, boardAfterKingMoves, BLACK);

    // then
    expect(moves).toHaveLength(0);
  });

  it("should not be possible when white rook has moved", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, WHITE, 7);
    board.putPiece(KING, BLACK, 60);
    const boardAfterKingMoves = board
      .execute(encodeMove(ROOK + WHITE, 7, ROOK + WHITE, 15))
      .execute(encodeMove(ROOK + WHITE, 15, ROOK + WHITE, 7))
      .execute(encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 8))
      .execute(encodeMove(ROOK + WHITE, 8, ROOK + WHITE, 0));

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, boardAfterKingMoves, WHITE);

    // then
    expect(moves).toHaveLength(0);
  });

  it("should not be possible when there are pieces between the king and rooks", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(BISHOP, BLACK, 57);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(BISHOP, BLACK, 62);
    board.putPiece(KING, BLACK, 60);

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, BLACK);

    // then
    expect(moves).toHaveLength(0);
  });
  it("should not be possible when king is in check", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
    board.putPiece(BISHOP, WHITE, 51);

    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, BLACK);

    // then
    expect(moves).toHaveLength(0);
  });

  it("should not be possible when king goes through check", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
    board.putPiece(BISHOP, WHITE, 52);
    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, BLACK);

    // then
    expect(moves).toHaveLength(0);
  });

  xit("[implemented by the engine] should not be possible when king goes into check", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
    board.putPiece(BISHOP, WHITE, 46);
    log(board.toString());
    // when
    const moves: u64[] = [];
    addCastlingMoves(moves, board, BLACK);

    // then
    expect(moves).toHaveLength(0);
  });
});
