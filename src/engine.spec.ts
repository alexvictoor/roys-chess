import { PieceListBoard } from "./piece-list-board";
import { Board, equalPositions, PieceOnBoard } from "./chess";
import { legalMoves } from "./engine";
import { BitBoard } from "./bitboard";
import { isInCheck } from "./king";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`Engine with ${name}`, () => {
    it("should detect check for player king when under attack by opponent rook", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackRook: PieceOnBoard = {
        position: { x: 3, y: 3 },
        piece: "Rook",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackRook]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });
    it("should detect check for player king when under attack by opponent bishop", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 5, y: 5 },
        piece: "Bishop",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackBishop]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });
    it("should detect check for player king when under attack by opponent queen", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 5, y: 7 },
        piece: "Queen",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackBishop]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });
    it("should detect check for player king when under attack by opponent knight", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 5, y: 6 },
        piece: "Knight",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackBishop]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });
    it("should detect check for player king when under attack by opponent king", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 3, y: 6 },
        piece: "King",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackBishop]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });
    it("should detect check for player king when under attack by opponent pawn", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackBishop: PieceOnBoard = {
        position: { x: 2, y: 6 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackBishop]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });

    it("should detect legal moves", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteQueen: PieceOnBoard = {
        position: { x: 3, y: 6 },
        piece: "Queen",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };
      const blackQueen: PieceOnBoard = {
        position: { x: 3, y: 0 },
        piece: "Queen",
        color: "Black",
      };
      const blackRook: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "Black",
      };
      const board = createBoard([
        whiteKing,
        whiteQueen,
        blackKing,
        blackQueen,
        blackRook,
      ]);
      // when
      const moves = legalMoves("White", board);
      // then
      expect(moves.some((m) => m.pieceOnBoard.piece === "Queen")).toBe(false);
      expect(moves).toHaveLength(2);
    });

    it("should detect castling has a legal move", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };

      const board = createBoard([whiteKing, blackKing, whiteRook]);
      // when
      const moves = legalMoves("White", board);
      // then
      expect(
        moves.filter(
          (m) =>
            m.pieceOnBoard.piece === "King" &&
            equalPositions(m.to, { x: 6, y: 7 })
        )
      ).toHaveLength(1);
    });
  });
});
