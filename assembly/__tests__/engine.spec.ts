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
import { isInCheck } from "../engine";

describe(`Engine`, () => {
  it("should be checked when under attack by opponent rook", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackRook: PieceOnBoard = {
      position: { x: 3, y: 3 },
      piece: ROOK,
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
      piece: BISHOP,
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
      piece: QUEEN,
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
      piece: KNIGHT,
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
  });
});
