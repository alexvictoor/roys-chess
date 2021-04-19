import { BitBoard } from "../bitboard";
import {
  BLACK,
  Board,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  ROOK,
  WHITE,
} from "../chess";
import { rookPseudoLegalMoves } from "../rook";

describe("Rook", () => {
  it("should move horizontaly and verticaly", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 2, y: 2 },
      piece: ROOK,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = rookPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 7,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 0,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 7,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
  });

  it("should capture but not jump over an opponent piece", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 2, y: 2 },
      piece: ROOK,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 1, y: 2 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 6, y: 2 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 2, y: 1 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 2, y: 6 },
      },
    ]);
    // when
    const positions = rookPseudoLegalMoves(board, piece);
    // then
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 0,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 2,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 7,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 6,
      y: 2,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 2,
      y: 0,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 1,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 2,
      y: 7,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 6,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
  });
  it("should not capture friendly pieces", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 2, y: 2 },
      piece: ROOK,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 1, y: 2 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 6, y: 2 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 2, y: 1 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 2, y: 6 },
      },
    ]);
    // when
    const positions = rookPseudoLegalMoves(board, piece);
    // then
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 1,
      y: 2,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 6,
      y: 2,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 2,
      y: 1,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 2,
      y: 6,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
  });
});
