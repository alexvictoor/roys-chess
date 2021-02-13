import { PieceListBoard } from "./piece-list-board";
import { PieceOnBoard } from "./chess";

describe("Board", () => {
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
    const board = new PieceListBoard([whitePawn, whiteRook]);
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

  it("should promote pawn to whatever when prawn reach last row", () => {
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

    const board = new PieceListBoard([whiteKing, blackKing, whitePawn]);
    // when
    const updatedBoard = board.move(whitePawn, {
      x: 7,
      y: 0,
      promoteTo: "Knight",
    });
    // then
    expect(updatedBoard.getAt({ x: 7, y: 0 })).toEqual({
      color: "White",
      piece: "Knight",
      position: { x: 7, y: 0 },
    });
  });
});
