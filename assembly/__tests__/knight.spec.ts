import {
  BLACK,
  Board,
  KNIGHT,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  WHITE,
} from "../chess";
import { knightPseudoLegalMoves } from "../knight";
import { BitBoard } from "../bitboard";

describe(`Knight`, () => {
  it("should move 2 squares in one direction then turn 90 degres and move one square", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 3, y: 4 },
      piece: KNIGHT,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = knightPseudoLegalMoves(board, piece);
    // then

    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 3,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 5,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 5,
      y: 3,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 5,
      y: 5,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 4,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 6,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 4,
      y: 6,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
  });
  it("should not move outside the board", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 0, y: 0 },
      piece: KNIGHT,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = knightPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 1,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toHaveLength(2);
  });
  it("should not move outside the board (starting from bottom right)", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 7, y: 7 },
      piece: KNIGHT,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = knightPseudoLegalMoves(board, piece);
    // then
    expect(positions).toHaveLength(2);
  });

  it("should not capture friendly pieces", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: KNIGHT,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 2 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 2, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 2, y: 5 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 6 },
      },

      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 2 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 6, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 6, y: 5 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 6 },
      },
    ]);
    // when
    const positions = knightPseudoLegalMoves(board, piece);
    // then
    expect(positions).toHaveLength(0);
  });
  it("should capture opponent pieces", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: KNIGHT,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 3, y: 2 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 2, y: 3 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 2, y: 5 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 3, y: 6 },
      },

      {
        color: BLACK,
        piece: PAWN,
        position: { x: 5, y: 2 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 6, y: 3 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 6, y: 5 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 5, y: 6 },
      },
    ]);
    // when
    const positions = knightPseudoLegalMoves(board, piece);
    // then
    expect(positions.filter((p) => p.capturedPiece !== PAWN)).toHaveLength(0);
  });
});
