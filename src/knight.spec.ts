import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { knightPseudoLegalMoves } from "./knight";
import { BitBoard } from "./bitboard";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`Knight with ${name}`, () => {
    it("should move 2 squares in one direction then turn 90 degres and move one square", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 3, y: 4 },
        piece: "Knight",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = knightPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 1, y: 3 });
      expect(positions).toContainEqual({ x: 1, y: 5 });
      expect(positions).toContainEqual({ x: 5, y: 3 });
      expect(positions).toContainEqual({ x: 5, y: 5 });
      expect(positions).toContainEqual({ x: 2, y: 2 });
      expect(positions).toContainEqual({ x: 4, y: 2 });
      expect(positions).toContainEqual({ x: 2, y: 6 });
      expect(positions).toContainEqual({ x: 4, y: 6 });
    });
    it("should not move outside the board", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 0, y: 0 },
        piece: "Knight",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = knightPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 2, y: 1 });
      expect(positions).toContainEqual({ x: 1, y: 2 });
      expect(positions).toHaveLength(2);
    });
    it("should not move outside the board (starting from bottom right)", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Knight",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = knightPseudoLegalMoves(board, piece);
      // then
      expect(positions).toHaveLength(2);
    });

    it("should not capture friendly pieces", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "Knight",
        color: "White",
      };
      const board = createBoard([
        piece,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 2 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 2, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 2, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 6 },
        },

        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 2 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 6, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 6, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
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
        piece: "Knight",
        color: "White",
      };
      const board = createBoard([
        piece,
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 3, y: 2 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 2, y: 3 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 2, y: 5 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 3, y: 6 },
        },

        {
          color: "Black",
          piece: "Pawn",
          position: { x: 5, y: 2 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 6, y: 3 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 6, y: 5 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 5, y: 6 },
        },
      ]);
      // when
      const positions = knightPseudoLegalMoves(board, piece);
      // then
      expect(positions.filter((p) => p.capturedPiece !== "Pawn")).toHaveLength(
        0
      );
    });
  });
});
