import { bishopPseudoLegalMoves } from "./bishop";
import { BitBoard } from "./bitboard";
import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`Bishop with ${name}`, () => {
    it("should move on diagonals", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 3, y: 4 },
        piece: "Bishop",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = bishopPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 0, y: 1 });
      expect(positions).toContainEqual({ x: 6, y: 7 });
      expect(positions).not.toContainEqual({ x: 7, y: 8 });
      expect(positions).toContainEqual({ x: 2, y: 5 });
    });

    it("should capture but not jump over an opponent pieces", () => {
      // given
      const bishop: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "Bishop",
        color: "White",
      };
      const board = createBoard([
        bishop,
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 2, y: 2 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 6, y: 2 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 6, y: 6 },
        },
        {
          color: "Black",
          piece: "Pawn",
          position: { x: 2, y: 6 },
        },
      ]);
      // when
      const positions = bishopPseudoLegalMoves(board, bishop);
      // then
      expect(positions).not.toContainEqual({ x: 1, y: 1 });
      expect(positions).toContainEqual({ x: 2, y: 2, capturedPiece: "Pawn" });
      expect(positions).not.toContainEqual({ x: 7, y: 1 });
      expect(positions).toContainEqual({ x: 6, y: 2, capturedPiece: "Pawn" });
      expect(positions).not.toContainEqual({ x: 1, y: 7 });
      expect(positions).toContainEqual({ x: 2, y: 6, capturedPiece: "Pawn" });
      expect(positions).not.toContainEqual({ x: 7, y: 7 });
      expect(positions).toContainEqual({ x: 6, y: 6, capturedPiece: "Pawn" });
    });

    it("should not capture friendly pieces", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "Bishop",
        color: "White",
      };
      const board = createBoard([
        piece,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 2, y: 2 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 6, y: 2 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 6, y: 6 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 2, y: 6 },
        },
      ]);
      // when
      const positions = bishopPseudoLegalMoves(board, piece);
      // then
      expect(positions).not.toContainEqual({ x: 2, y: 2 });
      expect(positions).not.toContainEqual({ x: 6, y: 2 });
      expect(positions).not.toContainEqual({ x: 6, y: 6 });
      expect(positions).not.toContainEqual({ x: 2, y: 6 });
    });
  });
});
