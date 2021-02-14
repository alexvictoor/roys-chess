import { kingPseudoLegalMoves } from "../king";
import {
  BLACK,
  Board,
  KING,
  KNIGHT,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  WHITE,
} from "../chess";
import { BitBoard } from "../bitboard";

describe(`King`, () => {
  it("should move one square on all directions", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 2, y: 2 },
      piece: KING,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = kingPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 1,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 1,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 3,
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
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 3,
      y: 2,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 1,
      y: 3,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 2,
      y: 3,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 3,
      y: 3,
      captureEnPassant: null,
      capturedPiece: -1,
      promoteTo: -1,
    });
    expect(positions).toHaveLength(8);
  });

  it("should not capture friendly pieces", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: KING,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 4, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 4 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 4 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 5 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 4, y: 5 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 5 },
      },
    ]);
    // when
    const positions = kingPseudoLegalMoves(board, piece);
    // then
    expect(positions).toHaveLength(0);
  });
  it("should capture opponent pieces", () => {
    // given
    const king: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: KING,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([
      king,
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 4, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 3 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 4 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 4 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 3, y: 5 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 4, y: 5 },
      },
      {
        color: WHITE,
        piece: PAWN,
        position: { x: 5, y: 5 },
      },
    ]);
    // when
    const positions = kingPseudoLegalMoves(board, king);
    // then
    expect(positions.filter((p) => p.capturedPiece === PAWN)).toHaveLength(8);
  });

  // TODO
  // https://www.kidchess.com/wp_support_content/instruction/castling.htm
  /*
    it("should be checked when under attack by opponent rook", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const blackRook: PieceOnBoard = {
        position: { x: 3, y: 3 },
        piece: "Rook",
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([whiteKing, blackRook]);
      // when
      const check = isInCheck(WHITE, board);
      // then
      expect(check).toBe(true);
    });
    it("should be checked when under attack by opponent bishop", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 5, y: 5 },
        piece: "Bishop",
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
      // when
      const check = isInCheck(WHITE, board);
      // then
      expect(check).toBe(true);
    });
    it("should be checked when under attack by opponent queen", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 5, y: 7 },
        piece: "Queen",
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
      // when
      const check = isInCheck(WHITE, board);
      // then
      expect(check).toBe(true);
    });
    it("should be checked when under attack by opponent knight", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 5, y: 6 },
        piece: "Knight",
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
      // when
      const check = isInCheck(WHITE, board);
      // then
      expect(check).toBe(true);
    });
    it("should be checked when under attack by opponent king", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 3, y: 6 },
        piece: KING,
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
      // when
      const check = isInCheck(WHITE, board);
      // then
      expect(check).toBe(true);
    });
    it("should be checked when under attack by opponent pawn", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const blackPawn: PieceOnBoard = {
        position: { x: 2, y: 6 },
        piece: PAWN,
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([whiteKing, blackPawn]);
      // when
      const check = isInCheck(WHITE, board);
      // then
      expect(check).toBe(true);
    });*/
});
