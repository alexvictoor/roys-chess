import { BitBoard } from "./bitboard";
import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { rookPseudoLegalMoves } from "./rook";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`Rook with ${name}`, () => {
    it("should move horizontaly and verticaly", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 2, y: 2 },
        piece: "Rook",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = rookPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 1, y: 2 });
      expect(positions).toContainEqual({ x: 7, y: 2 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 7 });
    });

    it("should capture but not jump over an opponent piece", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 2, y: 2 },
        piece: "Rook",
        color: "White",
      };
      const board = createBoard([
        piece,
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 1, y: 2 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 6, y: 2 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 2, y: 1 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 2, y: 6 },
        },
      ]);
      // when
      const positions = rookPseudoLegalMoves(board, piece);
      // then
      expect(positions).not.toContainEqual({ x: 0, y: 2 });
      expect(positions).toContainEqual({
        x: 1,
        y: 2,
        capturedPiece: "Pawn",
      });
      expect(positions).not.toContainEqual({ x: 7, y: 2 });
      expect(positions).toContainEqual({
        x: 6,
        y: 2,
        capturedPiece: "Pawn",
      });
      expect(positions).not.toContainEqual({ x: 2, y: 0 });
      expect(positions).toContainEqual({
        x: 2,
        y: 1,
        capturedPiece: "Pawn",
      });
      expect(positions).not.toContainEqual({ x: 2, y: 7 });
      expect(positions).toContainEqual({
        x: 2,
        y: 6,
        capturedPiece: "Pawn",
      });
    });
    it("should not capture friendly pieces", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 2, y: 2 },
        piece: "Rook",
        color: "White",
      };
      const board = createBoard([
        piece,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 1, y: 2 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 6, y: 2 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 2, y: 1 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 2, y: 6 },
        },
      ]);
      // when
      const positions = rookPseudoLegalMoves(board, piece);
      // then
      expect(positions).not.toContainEqual({ x: 1, y: 2 });
      expect(positions).not.toContainEqual({ x: 6, y: 2 });
      expect(positions).not.toContainEqual({ x: 2, y: 1 });
      expect(positions).not.toContainEqual({ x: 2, y: 6 });
    });
  });
});
