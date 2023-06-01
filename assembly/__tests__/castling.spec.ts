import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeMove,
  KING,
  ROOK,
  WHITE,
} from "../bitboard";
import { addCastlingMoves } from "../castling";
import { parseFEN } from "../fen-parser";
import { MoveStack } from "../move-stack";

describe("Castling", () => {
  it("should be possible for white on king side", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 7);
    board.putPiece(KING, BLACK, 60);

    // when
    const moves = new MoveStack();
    addCastlingMoves(moves, board, WHITE);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(1);
    const boardAfterCastling = board.execute(moveArray[0]);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, board, WHITE);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(1);
    const boardAfterCastling = board.execute(moveArray[0]);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, board, BLACK);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(2);
    const boardAfterKingSideCastling = board.execute(moveArray[0]);
    expect(boardAfterKingSideCastling.getKingMask(BLACK)).toBe(1 << 62);
    expect(boardAfterKingSideCastling.getRookMask(BLACK)).toBe(
      (1 << 61) | (1 << 56)
    );
  });
  it("should be possible for black on queen side when king side rook has moved", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, BLACK, 56);
    board.putPiece(ROOK, BLACK, 63);
    board.putPiece(KING, BLACK, 60);
    const board2 = board.execute(
      encodeMove(BLACK + ROOK, 63, BLACK + ROOK, 62)
    );

    // when
    const moves = new MoveStack();
    addCastlingMoves(moves, board2, BLACK);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(1);
  });

  it("should be possible for black on queen side", () => {
    // given
    const board = parseFEN(
      "r3k2r/pb3p2/5npp/n2p4/1p1PPB2/6P1/P2N1PBP/R3K2R b KQkq -"
    );
    const board2 = board.execute(
      encodeMove(ROOK + BLACK, 63, ROOK + BLACK, 55)
    );
    const board3 = board2.execute(encodeMove(ROOK + WHITE, 0, ROOK + WHITE, 1));

    // when
    const moves = new MoveStack();
    addCastlingMoves(moves, board3, BLACK);

    // then
    log(board3.toString());
    expect(board2.queenSideCastlingRight(BLACK)).toBe(true);
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(1);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, boardAfterKingMoves, WHITE);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(0);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, boardAfterKingMoves, BLACK);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(0);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, boardAfterKingMoves, WHITE);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(0);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, board, BLACK);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(0);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, board, BLACK);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(0);
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
    const moves = new MoveStack();
    addCastlingMoves(moves, board, BLACK);

    // then
    const moveArray = moves.flush();
    expect(moveArray).toHaveLength(0);
  });
});
