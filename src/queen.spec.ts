import { BitBoard } from "./bitboard";
import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { queenPseudoLegalMoves } from "./queen";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];

factories.forEach(([name, createBoard]) => {
  describe(`Queen with ${name}`, () => {
    it("should move as rooks and bishops", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 2, y: 2 },
        piece: "Queen",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = queenPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 1, y: 2 });
      expect(positions).toContainEqual({ x: 7, y: 2 });
      expect(positions).toContainEqual({ x: 2, y: 0 });
      expect(positions).toContainEqual({ x: 2, y: 7 });
      expect(positions).toContainEqual({ x: 1, y: 1 }); // bishop position
    });
  });
});
