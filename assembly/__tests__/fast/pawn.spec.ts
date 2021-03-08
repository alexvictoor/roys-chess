import {
  BISHOP,
  BitBoard,
  BLACK,
  encodeCapture,
  encodeMove,
  KNIGHT,
  PAWN,
  QUEEN,
  ROOK,
  WHITE,
} from "../../fast/bitboard";
import { addPawnPseudoLegalMoves } from "../../fast/pawn";

describe(`Pawn move generation`, () => {
  it("should get pawn move one square forward when nothing is in the way", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, BLACK, 16);
    board.putPiece(PAWN, BLACK, 24);
    // when
    const moves: u64[] = [];
    addPawnPseudoLegalMoves(moves, board, BLACK);
    // then
    expect(moves).toHaveLength(1);
    expect(moves).toContain(encodeMove(PAWN + BLACK, 16, PAWN + BLACK, 8));
  });

  it("should get no pawn move when there is a piece in the way", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 16);
    board.putPiece(PAWN, BLACK, 24);
    // when
    const moves: u64[] = [];
    addPawnPseudoLegalMoves(moves, board, BLACK);
    // then
    expect(moves).toHaveLength(0);
  });

  it("should capture on the side", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 8);
    board.putPiece(PAWN, WHITE, 9);
    board.putPiece(PAWN, WHITE, 10);
    board.putPiece(PAWN, BLACK, 17);
    // when
    const moves: u64[] = [];
    addPawnPseudoLegalMoves(moves, board, BLACK);
    // then
    expect(moves).toHaveLength(2);
  });

  it("should get pawn promotions when pawns reach last row", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 16);
    board.putPiece(PAWN, BLACK, 8);
    // when
    const moves: u64[] = [];
    addPawnPseudoLegalMoves(moves, board, BLACK);
    // then
    expect(moves).toHaveLength(4);
    expect(moves).toContain(encodeMove(PAWN + BLACK, 8, QUEEN + BLACK, 0));
    expect(moves).toContain(encodeMove(PAWN + BLACK, 8, ROOK + BLACK, 0));
    expect(moves).toContain(encodeMove(PAWN + BLACK, 8, BISHOP + BLACK, 0));
    expect(moves).toContain(encodeMove(PAWN + BLACK, 8, KNIGHT + BLACK, 0));
  });
  it("should get pawn promotions when pawns captures on last row", () => {
    // given
    const board = new BitBoard();
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, WHITE, 1);
    board.putPiece(PAWN, BLACK, 8);
    // when
    const moves: u64[] = [];
    addPawnPseudoLegalMoves(moves, board, BLACK);
    // then
    expect(moves).toHaveLength(4);
    expect(moves).toContain(
      encodeCapture(PAWN + BLACK, 8, QUEEN + BLACK, 1, ROOK + WHITE, 1)
    );
    expect(moves).toContain(
      encodeCapture(PAWN + BLACK, 8, ROOK + BLACK, 1, ROOK + WHITE, 1)
    );
    expect(moves).toContain(
      encodeCapture(PAWN + BLACK, 8, BISHOP + BLACK, 1, ROOK + WHITE, 1)
    );
    expect(moves).toContain(
      encodeCapture(PAWN + BLACK, 8, KNIGHT + BLACK, 1, ROOK + WHITE, 1)
    );
  });

  xit("should get pawn move one or two squares forward from initial position", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 8);
    // when
    const moves: u64[] = [];
    addPawnPseudoLegalMoves(moves, board, WHITE);
    // then
    expect(moves).toHaveLength(2);
  });
  it("should get pawn capture en passant", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 8);
    board.putPiece(PAWN, BLACK, 25);
    const whiteMoves: u64[] = [];
    addPawnPseudoLegalMoves(whiteMoves, board, WHITE);
    // when pawn moves 2 squares forward
    const boardAfterPawnMove = board.execute(whiteMoves[1]);
    // then
    const blackMoves: u64[] = [];
    addPawnPseudoLegalMoves(blackMoves, boardAfterPawnMove, BLACK);
    expect(blackMoves).toHaveLength(2);
  });
});
