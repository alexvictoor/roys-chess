import { BitBoard } from "./bitboard";
import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { playerStatus } from "./player-status";

const CASTLING_NO_MORE = {
  WhiteKingSide: false,
  WhiteQueenSide: false,
  BlackKingSide: false,
  BlackQueenSide: false,
};
const pieceListBoardFactory = (pieces) =>
  new PieceListBoard(pieces, 0, CASTLING_NO_MORE);
const bitBoardFactory = (pieces) =>
  BitBoard.buildFromPieces(pieces, 0, CASTLING_NO_MORE);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", bitBoardFactory],
];
factories.forEach(([name, createBoard]) => {
  describe(`Player status with ${name}`, () => {
    it("should be check when king is under attack", () => {
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
      const status = playerStatus("White", board);
      // then
      expect(status).toBe("Check");
    });
    it("should be checkmate when king is under attack and ther is no way out", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackQueen: PieceOnBoard = {
        position: { x: 6, y: 6 },
        piece: "Queen",
        color: "Black",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 5, y: 5 },
        piece: "King",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackKing, blackQueen]);
      // when
      const status = playerStatus("White", board);
      // then
      expect(status).toBe("Checkmate");
    });
    it("should be stalemate when king is no under attack but there is no possible move", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackRook: PieceOnBoard = {
        position: { x: 6, y: 6 },
        piece: "Rook",
        color: "Black",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 5, y: 5 },
        piece: "King",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackKing, blackRook]);
      // when
      const status = playerStatus("White", board);
      // then
      expect(status).toBe("Draw");
    });
    it("should be draw after 50 moves without any capture or pawn moved", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: "King",
        color: "White",
      };
      let whiteQueen: PieceOnBoard = {
        position: { x: 0, y: 5 },
        piece: "Queen",
        color: "White",
      };
      const whitePawn1: PieceOnBoard = {
        position: { x: 0, y: 6 },
        piece: "Pawn",
        color: "White",
      };
      const whitePawn2: PieceOnBoard = {
        position: { x: 1, y: 6 },
        piece: "Pawn",
        color: "White",
      };

      const blackKing: PieceOnBoard = {
        position: { x: 7, y: 0 },
        piece: "King",
        color: "Black",
      };
      let blackQueen: PieceOnBoard = {
        position: { x: 7, y: 2 },
        piece: "Queen",
        color: "Black",
      };
      const blackPawn1: PieceOnBoard = {
        position: { x: 7, y: 1 },
        piece: "Pawn",
        color: "Black",
      };
      const blackPawn2: PieceOnBoard = {
        position: { x: 6, y: 1 },
        piece: "Pawn",
        color: "Black",
      };
      let board = createBoard([
        whiteKing,
        blackKing,
        whitePawn1,
        whitePawn2,
        whiteQueen,
        blackPawn1,
        blackPawn2,
        blackQueen,
      ]);
      for (let index = 1; index <= 50; index++) {
        board = board.move(whiteQueen, { x: index % 8, y: 5 });
        whiteQueen = {
          ...whiteQueen,
          position: { x: index % 8, y: 5 },
        };
        board = board.move(blackQueen, {
          x: (((7 - index) % 8) + 8) % 8,
          y: 2,
        });
        blackQueen = {
          ...blackQueen,
          position: { x: (((7 - index) % 8) + 8) % 8, y: 2 },
        };
      }
      // when
      const status = playerStatus("White", board);
      // then
      expect(status).toBe("Draw");
    });
  });
});
