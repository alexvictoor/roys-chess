import { Board, PieceOnBoard } from "./chess";
import { PieceListBoard } from "./piece-list-board";
import { pawnPseudoLegalMoves } from "./pawn";
import { BitBoard } from "./bitboard";

const pieceListBoardFactory = (pieces) => new PieceListBoard(pieces);
const factories: [string, (pieces: PieceOnBoard[]) => Board][] = [
  ["piece list based board", pieceListBoardFactory],
  ["bit board", BitBoard.buildFromPieces],
];
factories.forEach(([name, createBoard]) => {
  describe(`Pawn with ${name}`, () => {
    it("should be able to move forward if the square is empty", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([piece]);
      // when
      const positions = pawnPseudoLegalMoves(board, piece);
      // then
      expect(positions).toHaveLength(1);
      expect(positions).toContainEqual({ x: 4, y: 5 });
    });
    it("should not be able to move forward if the square is not empty", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([
        piece,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 4, y: 5 },
        },
      ]);
      // when
      const positions = pawnPseudoLegalMoves(board, piece);
      // then
      expect(positions).toHaveLength(0);
    });
    it("should not be able to capture a piece when it is far away", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 7, y: 4 },
        piece: "Pawn",
        color: "Black",
      };
      const pawn: PieceOnBoard = {
        color: "White",
        piece: "Pawn",
        position: { x: 0, y: 6 },
      };
      const pawn2: PieceOnBoard = {
        color: "White",
        piece: "Pawn",
        position: { x: 0, y: 5 },
      };
      const board = createBoard([piece, pawn, pawn2]);
      // when
      const positions = pawnPseudoLegalMoves(board, pawn);
      // then
      expect(positions).toHaveLength(0);
    });

    it("should be able to capture a piece on the side", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 4 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([
        piece,
        {
          color: "White",
          piece: "Pawn",
          position: { x: 5, y: 5 },
        },
        {
          color: "White",
          piece: "Pawn",
          position: { x: 3, y: 5 },
        },
      ]);
      // when
      const positions = pawnPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 4, y: 5 });
      expect(positions).toContainEqual({ x: 5, y: 5, capturedPiece: "Pawn" });
      expect(positions).toContainEqual({ x: 3, y: 5, capturedPiece: "Pawn" });
    });

    it("should promote pawn to queen, rook, bishop or knight when pawn reach last row", () => {
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
      const board = createBoard([whiteKing, blackKing, whitePawn]);
      // when
      const positions = pawnPseudoLegalMoves(board, whitePawn);
      // then
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Queen" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Rook" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Bishop" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Knight" })
      );
    });

    it("should promote pawn to queen, rook, bishop or knight when pawn captures a piece on last row (on the left)", () => {
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
      const blackRook: PieceOnBoard = {
        position: { x: 6, y: 0 },
        piece: "Rook",
        color: "Black",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 7, y: 0 },
        piece: "King",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackKing, whitePawn, blackRook]);
      // when
      const positions = pawnPseudoLegalMoves(board, whitePawn);
      // then
      expect(positions).toContainEqual(
        expect.objectContaining({ capturedPiece: "Rook", promoteTo: "Queen" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ capturedPiece: "Rook", promoteTo: "Rook" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ capturedPiece: "Rook", promoteTo: "Bishop" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ capturedPiece: "Rook", promoteTo: "Knight" })
      );
    });
    it("should promote pawn to queen, rook, bishop or knight when pawn captures a piece on last row (on the right)", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const whitePawn: PieceOnBoard = {
        position: { x: 6, y: 1 },
        piece: "Pawn",
        color: "White",
      };
      const blackRook: PieceOnBoard = {
        position: { x: 7, y: 0 },
        piece: "Rook",
        color: "Black",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 6, y: 0 },
        piece: "King",
        color: "Black",
      };
      const board = createBoard([whiteKing, blackKing, whitePawn, blackRook]);
      // when
      const positions = pawnPseudoLegalMoves(board, whitePawn);
      // then
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Queen" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Rook" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Bishop" })
      );
      expect(positions).toContainEqual(
        expect.objectContaining({ promoteTo: "Knight" })
      );
    });

    it("should be able to advance two squares from its initial position (black pawn)", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 1 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([piece]);
      // when
      const positions = pawnPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 4, y: 3 });
    });
    it("should be able to advance two squares from its initial position (white pawn)", () => {
      // given
      const piece: PieceOnBoard = {
        position: { x: 4, y: 6 },
        piece: "Pawn",
        color: "White",
      };
      const board = createBoard([piece]);
      // when
      const positions = pawnPseudoLegalMoves(board, piece);
      // then
      expect(positions).toContainEqual({ x: 4, y: 4 });
    });

    it("should not be able to advance two squares when there is a piece in the way", () => {
      // given
      const pawn: PieceOnBoard = {
        position: { x: 4, y: 6 },
        piece: "Pawn",
        color: "White",
      };
      const knight: PieceOnBoard = {
        position: { x: 4, y: 5 },
        piece: "Knight",
        color: "White",
      };
      const board = createBoard([pawn, knight]);
      // when
      const positions = pawnPseudoLegalMoves(board, pawn);
      // then
      expect(positions).not.toContainEqual({ x: 4, y: 4 });
    });

    it("should be able to capture 'en passant' opponent pawn when this pawn has advanced two squared just before", () => {
      // given
      const whitePawn: PieceOnBoard = {
        position: { x: 0, y: 6 },
        piece: "Pawn",
        color: "White",
      };
      const blackPawn: PieceOnBoard = {
        position: { x: 1, y: 4 },
        piece: "Pawn",
        color: "Black",
      };
      const board = createBoard([whitePawn, blackPawn]);
      // when
      const board2 = board.move(whitePawn, { x: 0, y: 4 });
      const blackMoves = pawnPseudoLegalMoves(board2, blackPawn);
      // then
      expect(blackMoves).toContainEqual({
        x: 0,
        y: 5,
        captureEnPassant: {
          position: {
            x: 0,
            y: 4,
          },
          piece: "Pawn",
          color: "White",
        },
      });
    });
    it("should not be able to capture 'en passant' opponent pawn when this pawn has advanced two squared before previous move", () => {
      // given
      const whitePawn: PieceOnBoard = {
        position: { x: 1, y: 6 },
        piece: "Pawn",
        color: "White",
      };
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: "King",
        color: "White",
      };
      const blackPawn: PieceOnBoard = {
        position: { x: 2, y: 4 },
        piece: "Pawn",
        color: "Black",
      };
      const blackKing: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: "King",
        color: "Black",
      };
      const board = createBoard([whitePawn, blackPawn, whiteKing, blackKing]);
      // when
      const board2 = board.move(whitePawn, { x: 1, y: 4 });
      const board3 = board2.move(blackKing, { x: 3, y: 0 });
      const board4 = board3.move(whiteKing, { x: 3, y: 7 });
      const blackMoves = pawnPseudoLegalMoves(board4, blackPawn);
      // then
      expect(blackMoves).not.toContainEqual({ x: 1, y: 5 });
    });
  });
});
