import { BitBoard } from "../bitboard";
import {
  BISHOP,
  BLACK,
  KING,
  KNIGHT,
  PAWN,
  PieceOnBoard,
  QUEEN,
  ROOK,
  WHITE,
} from "../chess";

describe("Bit Board", () => {
  it("should keep track of kings", () => {
    // given
    const whiteKing: PieceOnBoard = {
      color: WHITE,
      piece: KING,
      position: { x: 3, y: 4 },
    };
    const blackKing: PieceOnBoard = {
      color: BLACK,
      piece: KING,
      position: { x: 1, y: 1 },
    };
    // when
    const board = BitBoard.buildFromPieces([whiteKing, blackKing]);
    // then
    expect(board.getKing(WHITE)).toStrictEqual({
      color: WHITE,
      piece: KING,
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any pawn", () => {
    // given
    const pawn: PieceOnBoard = {
      color: BLACK,
      piece: PAWN,
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([pawn]);
    // then
    expect(board.getAt(pawn.position)).toStrictEqual({
      color: BLACK,
      piece: PAWN,
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any rook", () => {
    // given
    const piece: PieceOnBoard = {
      color: BLACK,
      piece: ROOK,
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toStrictEqual({
      color: BLACK,
      piece: ROOK,
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any bishop", () => {
    // given
    const piece: PieceOnBoard = {
      color: BLACK,
      piece: BISHOP,
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toStrictEqual({
      color: BLACK,
      piece: BISHOP,
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any knight", () => {
    // given
    const piece: PieceOnBoard = {
      color: BLACK,
      piece: KNIGHT,
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toStrictEqual({
      color: BLACK,
      piece: KNIGHT,
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of queens", () => {
    // given
    const piece: PieceOnBoard = {
      color: BLACK,
      piece: QUEEN,
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toStrictEqual({
      color: BLACK,
      piece: QUEEN,
      position: { x: 3, y: 4 },
    });
  });
  it("should move a piece and keep all other pieces", () => {
    // given
    const whitePawn: PieceOnBoard = {
      color: WHITE,
      piece: PAWN,
      position: { x: 1, y: 0 },
    };
    const whiteRook: PieceOnBoard = {
      color: WHITE,
      piece: ROOK,
      position: { x: 0, y: 0 },
    };
    const blackRook: PieceOnBoard = {
      color: BLACK,
      piece: ROOK,
      position: { x: 0, y: 7 },
    };
    const board = BitBoard.buildFromPieces([whitePawn, whiteRook, blackRook]);
    // when
    const updatedBoard = board.move(whiteRook, {
      x: 0,
      y: 7,
      promoteTo: -1,
      captureEnPassant: null,
      capturedPiece: -1,
    });
    // then
    expect(updatedBoard.getAt({ x: 0, y: 7 })).toStrictEqual({
      color: WHITE,
      piece: ROOK,
      position: { x: 0, y: 7 },
    });
    expect(updatedBoard.getAt({ x: 1, y: 0 })).toStrictEqual({
      color: WHITE,
      piece: PAWN,
      position: { x: 1, y: 0 },
    });
  });

  it("should compare boards", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 4, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const whitePawn: PieceOnBoard = {
      position: { x: 7, y: 1 },
      piece: PAWN,
      color: WHITE,
    };
    const blackKing: PieceOnBoard = {
      position: { x: 2, y: 0 },
      piece: KING,
      color: BLACK,
    };

    const board = BitBoard.buildFromPieces([whiteKing, blackKing, whitePawn]);
    // when
    const updatedBoard = board.move(whitePawn, {
      x: 7,
      y: 0,
      promoteTo: QUEEN,
      captureEnPassant: null,
      capturedPiece: -1,
    });
    const updatedBoard2 = board.move(whitePawn, {
      x: 7,
      y: 0,
      promoteTo: QUEEN,
      captureEnPassant: null,
      capturedPiece: -1,
    });
    // then
    expect(updatedBoard.equals(board)).toBe(false);
    expect(updatedBoard.equals(updatedBoard2)).toBe(true);
  });
});
