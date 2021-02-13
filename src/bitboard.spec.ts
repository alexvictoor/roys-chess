import { BitBoard } from "./bitboard";
import { PieceOnBoard } from "./chess";

describe("Bit Board", () => {
  it("should keep track of kings", () => {
    // given
    const whiteKing: PieceOnBoard = {
      color: "White",
      piece: "King",
      position: { x: 3, y: 4 },
    };
    const blackKing: PieceOnBoard = {
      color: "Black",
      piece: "King",
      position: { x: 1, y: 1 },
    };
    // when
    const board = BitBoard.buildFromPieces([whiteKing, blackKing]);
    // then
    expect(board.getKing("White")).toEqual({
      color: "White",
      piece: "King",
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any pawn", () => {
    // given
    const pawn: PieceOnBoard = {
      color: "Black",
      piece: "Pawn",
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([pawn]);
    // then
    expect(board.getAt(pawn.position)).toEqual({
      color: "Black",
      piece: "Pawn",
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any rook", () => {
    // given
    const piece: PieceOnBoard = {
      color: "Black",
      piece: "Rook",
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toEqual({
      color: "Black",
      piece: "Rook",
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any bishop", () => {
    // given
    const piece: PieceOnBoard = {
      color: "Black",
      piece: "Bishop",
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toEqual({
      color: "Black",
      piece: "Bishop",
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of any knight", () => {
    // given
    const piece: PieceOnBoard = {
      color: "Black",
      piece: "Knight",
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toEqual({
      color: "Black",
      piece: "Knight",
      position: { x: 3, y: 4 },
    });
  });
  it("should keep track of queens", () => {
    // given
    const piece: PieceOnBoard = {
      color: "Black",
      piece: "Queen",
      position: { x: 3, y: 4 },
    };
    // when
    const board = BitBoard.buildFromPieces([piece]);
    // then
    expect(board.getAt(piece.position)).toEqual({
      color: "Black",
      piece: "Queen",
      position: { x: 3, y: 4 },
    });
  });
  it("should move a piece and keep all other pieces", () => {
    // given
    const whitePawn: PieceOnBoard = {
      color: "White",
      piece: "Pawn",
      position: { x: 1, y: 0 },
    };
    const whiteRook: PieceOnBoard = {
      color: "White",
      piece: "Rook",
      position: { x: 0, y: 0 },
    };
    const blackRook: PieceOnBoard = {
      color: "Black",
      piece: "Rook",
      position: { x: 0, y: 7 },
    };
    const board = BitBoard.buildFromPieces([whitePawn, whiteRook, blackRook]);
    // when
    const updatedBoard = board.move(whiteRook, { x: 0, y: 7 });
    // then
    expect(updatedBoard.getAt({ x: 0, y: 7 })).toEqual({
      color: "White",
      piece: "Rook",
      position: { x: 0, y: 7 },
    });
    expect(updatedBoard.getAt({ x: 1, y: 0 })).toEqual({
      color: "White",
      piece: "Pawn",
      position: { x: 1, y: 0 },
    });
  });

  it("should compare boards", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 4, y: 7 },
      piece: "King",
      color: "White",
    };
    const whitePawn: PieceOnBoard = {
      position: { x: 7, y: 1 },
      piece: "Pawn",
      color: "White",
    };
    const blackKing: PieceOnBoard = {
      position: { x: 2, y: 0 },
      piece: "King",
      color: "Black",
    };

    const board = BitBoard.buildFromPieces([whiteKing, blackKing, whitePawn]);
    // when
    const updatedBoard = board.move(whitePawn, {
      x: 7,
      y: 0,
      promoteTo: "Queen",
    });
    const updatedBoard2 = board.move(whitePawn, {
      x: 7,
      y: 0,
      promoteTo: "Queen",
    });
    // then
    expect(updatedBoard.equals(board)).toBe(false);
    expect(updatedBoard.equals(updatedBoard2)).toBe(true);
  });
});
