import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { castlingMoves } from "./castling";
import { BitBoard } from "./bitboard";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`Castling with ${name}`, () => {
    it("should be possible for white on king side", () => {
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
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(1);
      const kingSideCastlingMove = moves[0];
      expect(kingSideCastlingMove.pieceOnBoard).toStrictEqual(whiteKing);
      expect(kingSideCastlingMove.to).toStrictEqual({ x: 6, y: 7 });
      expect(kingSideCastlingMove.board.getAt({ x: 5, y: 7 })).toEqual(
        expect.objectContaining({ piece: "Rook" })
      );
    });
    it("should be possible for white on king and queen sides", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };

      const board = createBoard([whiteKing, blackKing, whiteRook1, whiteRook2]);
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(2);
    });
    it("should be possible for black on king side", () => {
      // given
      const blackKing: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: "King",
        color: "Black",
      };
      const blackRook: PieceOnBoard = {
        position: { x: 7, y: 0 },
        piece: "Rook",
        color: "Black",
      };
      const whiteKing: PieceOnBoard = {
        position: { x: 2, y: 7 },
        piece: "King",
        color: "White",
      };

      const board = createBoard([whiteKing, blackKing, blackRook]);
      // when
      const moves = castlingMoves("Black", board);
      // then
      expect(moves).toHaveLength(1);
      const kingSideCastlingMove = moves[0];
      expect(kingSideCastlingMove.pieceOnBoard).toStrictEqual(blackKing);
      expect(kingSideCastlingMove.to).toStrictEqual({ x: 6, y: 0 });
      expect(kingSideCastlingMove.board.getAt({ x: 5, y: 0 })).toEqual(
        expect.objectContaining({ piece: "Rook" })
      );
    });
    it("should be possible for white on queen side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook: PieceOnBoard = {
        position: { x: 0, y: 7 },
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
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(1);
      const queenSideCastlingMove = moves[0];
      expect(queenSideCastlingMove.pieceOnBoard).toStrictEqual(whiteKing);
      expect(queenSideCastlingMove.to).toStrictEqual({ x: 2, y: 7 });
      expect(queenSideCastlingMove.board.getAt({ x: 2, y: 7 })).toEqual(
        expect.objectContaining({ piece: "King" })
      );
      expect(queenSideCastlingMove.board.getAt({ x: 3, y: 7 })).toEqual(
        expect.objectContaining({ piece: "Rook" })
      );
    });
    it("should be possible for black on queen side", () => {
      // given
      const blackKing: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: "King",
        color: "Black",
      };
      const blackRook: PieceOnBoard = {
        position: { x: 0, y: 0 },
        piece: "Rook",
        color: "Black",
      };
      const whiteKing: PieceOnBoard = {
        position: { x: 2, y: 7 },
        piece: "King",
        color: "White",
      };

      const board = createBoard([whiteKing, blackKing, blackRook]);
      // when
      const moves = castlingMoves("Black", board);
      // then
      expect(moves).toHaveLength(1);
      const queenSideCastlingMove = moves[0];
      expect(queenSideCastlingMove.pieceOnBoard).toStrictEqual(blackKing);
      expect(queenSideCastlingMove.to).toStrictEqual({ x: 2, y: 0 });
      expect(queenSideCastlingMove.board.getAt({ x: 2, y: 0 })).toEqual(
        expect.objectContaining({ piece: "King" })
      );
      expect(queenSideCastlingMove.board.getAt({ x: 3, y: 0 })).toEqual(
        expect.objectContaining({ piece: "Rook" })
      );
    });

    it("should not be possible when king is in check", () => {
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
      const blackRook: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: "Rook",
        color: "Black",
      };

      const board = createBoard([whiteKing, whiteRook, blackKing, blackRook]);
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(0);
    });

    it("should not be possible when king goes into check", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };
      const blackRook1: PieceOnBoard = {
        position: { x: 6, y: 0 },
        piece: "Rook",
        color: "Black",
      };
      const blackRook2: PieceOnBoard = {
        position: { x: 2, y: 1 },
        piece: "Rook",
        color: "Black",
      };

      const board = createBoard([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
        blackRook1,
        blackRook2,
      ]);
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when king goes through check", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };
      const blackRook1: PieceOnBoard = {
        position: { x: 5, y: 0 },
        piece: "Rook",
        color: "Black",
      };
      const blackRook2: PieceOnBoard = {
        position: { x: 3, y: 1 },
        piece: "Rook",
        color: "Black",
      };

      const board = createBoard([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
        blackRook1,
        blackRook2,
      ]);
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when there are pieces between the king and rooks", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteKnight1: PieceOnBoard = {
        position: { x: 1, y: 7 },
        piece: "Knight",
        color: "White",
      };

      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteKnight2: PieceOnBoard = {
        position: { x: 6, y: 7 },
        piece: "Knight",
        color: "White",
      };

      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };

      const board = createBoard([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
        whiteKnight1,
        whiteKnight2,
      ]);
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when king has moved", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };

      const board = createBoard([whiteKing, whiteRook1, whiteRook2, blackKing])
        .move(whiteKing, { x: 4, y: 6 })
        .move(blackKing, { x: 3, y: 0 })
        .move(
          {
            position: { x: 4, y: 6 },
            piece: "King",
            color: "White",
          },
          { x: 4, y: 7 }
        );
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when rook has moved on queen side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };

      const board = createBoard([whiteKing, whiteRook1, whiteRook2, blackKing])
        .move(whiteRook1, { x: 0, y: 6 })
        .move(blackKing, { x: 3, y: 0 })
        .move(
          {
            position: { x: 0, y: 6 },
            piece: "Rook",
            color: "White",
          },
          { x: 0, y: 7 }
        );
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(1);
    });
    it("should not be possible when rook has moved on king side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "Rook",
        color: "White",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: "King",
        color: "Black",
      };

      const board = createBoard([whiteKing, whiteRook1, whiteRook2, blackKing])
        .move(whiteRook2, { x: 7, y: 6 })
        .move(blackKing, { x: 3, y: 0 })
        .move(
          {
            position: { x: 7, y: 6 },
            piece: "Rook",
            color: "White",
          },
          { x: 7, y: 7 }
        );
      // when
      const moves = castlingMoves("White", board);
      // then
      expect(moves).toHaveLength(1);
    });
  });
});
