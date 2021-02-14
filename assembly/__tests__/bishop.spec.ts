import { bishopPseudoLegalMoves } from "../bishop";
import { BitBoard } from "../bitboard";
import {
  BISHOP,
  BLACK,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  WHITE,
} from "../chess";

describe(`Bishop`, () => {
  it("should move on diagonals", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 3, y: 4 },
      piece: BISHOP,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = bishopPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 0,
      y: 1,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 6,
      y: 7,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 7,
      y: 8,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 5,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
  });

  it("should capture but not jump over an opponent pieces", () => {
    // given
    const bishop: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: BISHOP,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      bishop,
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 2, y: 2 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 6, y: 2 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 6, y: 6 },
      },
      {
        color: BLACK,
        piece: PAWN,
        position: { x: 2, y: 6 },
      },
    ]);
    // when
    const positions = bishopPseudoLegalMoves(board, bishop);
    // then
    expect(positions).not.toContainEqual(<MoveOutcome>{ x: 1, y: 1 });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 2,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{ x: 7, y: 1 });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 6,
      y: 2,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{ x: 1, y: 7 });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 6,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).not.toContainEqual(<MoveOutcome>{ x: 7, y: 7 });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 6,
      y: 6,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
  });

  it("should not capture friendly pieces", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: BISHOP,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 2, y: 2 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 6, y: 2 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 6, y: 6 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 2, y: 6 },
      },
    ]);
    // when
    const positions = bishopPseudoLegalMoves(board, piece);
    // then
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 2,
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
      x: 6,
      y: 6,
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
