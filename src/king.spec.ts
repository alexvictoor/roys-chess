import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { isInCheck, kingPseudoLegalMoves } from "./king";
import { BitBoard } from "./bitboard";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`King with ${name}`, () => {
    it("should move one square on all directions", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 2, y: 2 },
        piece: "King",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = kingPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 1, y: 1 });
      expect(positions).toContainEqual({ x: 2, y: 1 });
      expect(positions).toContainEqual({ x: 3, y: 1 });
      expect(positions).toContainEqual({ x: 1, y: 2 });
      expect(positions).toContainEqual({ x: 3, y: 2 });
      expect(positions).toContainEqual({ x: 1, y: 3 });
      expect(positions).toContainEqual({ x: 2, y: 3 });
      expect(positions).toContainEqual({ x: 3, y: 3 });
      expect(positions).toHaveLength(8);
    });

    it("should not capture friendly pieces", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "King",
        color: "White",
      };
      const board = createBoard([
        piece,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 4, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 4 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 4 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 4, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
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
        piece: "King",
        color: "Black",
      };
      const board = createBoard([
        king,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 4, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 3 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 4 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 4 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 4, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 5 },
        },
      ]);
      // when
      const positions = kingPseudoLegalMoves(board, king);
      // then
      expect(positions.filter((p) => !!p.capturedPiece)).toHaveLength(8);
    });

    // TODO
    // https://www.kidchess.com/wp_support_content/instruction/castling.htm

    it("should be checked when under attack by opponent rook", () => {
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
    it("should be checked when under attack by opponent bishop", () => {
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
    it("should be checked when under attack by opponent queen", () => {
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
    it("should be checked when under attack by opponent knight", () => {
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
    it("should be checked when under attack by opponent king", () => {
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
    it("should be checked when under attack by opponent pawn", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackPawn: PieceOnBoard = {
        position: { x: 2, y: 6 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackPawn]);
      // when
      const check = isInCheck("White", board);
      // then
      expect(check).toBe(true);
    });
  });
});
