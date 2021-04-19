import { BitBoard } from "../bitboard";
import {
  BISHOP,
  BLACK,
  equalPositions,
  KING,
  KNIGHT,
  PAWN,
  PieceOnBoard,
  QUEEN,
  ROOK,
  WHITE,
} from "../chess";
import { castlingMoves, isInCheck, legalMoves } from "../engine";

describe("Engine", () => {
  it("should be checked when under attack by opponent rook", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackRook: PieceOnBoard = {
      position: { x: 3, y: 3 },
      piece: ROOK,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackRook]);
    // when
    const check = isInCheck(WHITE, board);
    // then
    expect(check).toBe(true);
  });
  it("should be checked when under attack by opponent bishop", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackBishop: PieceOnBoard = {
      position: { x: 5, y: 5 },
      piece: BISHOP,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
    // when
    const check = isInCheck(WHITE, board);
    // then
    expect(check).toBe(true);
  });
  it("should be checked when under attack by opponent queen", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackBishop: PieceOnBoard = {
      position: { x: 5, y: 7 },
      piece: QUEEN,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
    // when
    const check = isInCheck(WHITE, board);
    // then
    expect(check).toBe(true);
  });
  it("should be checked when under attack by opponent knight", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackBishop: PieceOnBoard = {
      position: { x: 5, y: 6 },
      piece: KNIGHT,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
    // when
    const check = isInCheck(WHITE, board);
    // then
    expect(check).toBe(true);
  });
  it("should be checked when under attack by opponent king", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackBishop: PieceOnBoard = {
      position: { x: 3, y: 6 },
      piece: KING,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackBishop]);
    // when
    const check = isInCheck(WHITE, board);
    // then
    expect(check).toBe(true);
  });
  it("should be checked when under attack by opponent pawn", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 3, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackPawn: PieceOnBoard = {
      position: { x: 2, y: 6 },
      piece: PAWN,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackPawn]);
    // when
    const check = isInCheck(WHITE, board);
    // then
    expect(check).toBe(true);
  });

  describe("Castling", () => {
    it("should be possible for white on king side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([whiteKing, blackKing, whiteRook]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(1);
      const kingSideCastlingMove = moves[0];
      expect(kingSideCastlingMove.pieceOnBoard).toStrictEqual(whiteKing);
      expect(kingSideCastlingMove.to).toStrictEqual({
        x: 6,
        y: 7,
        captureEnPassant: null,
        capturedPiece: -1,
        promoteTo: -1,
      });
      expect(kingSideCastlingMove.board.getAt({ x: 5, y: 7 })).not.toBeNull();
      expect(kingSideCastlingMove.board.pieceAt({ x: 5, y: 7 })).toBe(ROOK);
    });
    it("should be possible for white on king and queen sides", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        blackKing,
        whiteRook1,
        whiteRook2,
      ]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(2);
    });
    it("should be possible for black on king side", () => {
      // given
      const blackKing: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: KING,
        color: BLACK,
      };
      const blackRook: PieceOnBoard = {
        position: { x: 7, y: 0 },
        piece: ROOK,
        color: BLACK,
      };
      const whiteKing: PieceOnBoard = {
        position: { x: 2, y: 7 },
        piece: KING,
        color: WHITE,
      };

      const board = BitBoard.buildFromPieces([whiteKing, blackKing, blackRook]);
      // when
      const moves = castlingMoves(BLACK, board);
      // then
      expect(moves).toHaveLength(1);
      const kingSideCastlingMove = moves[0];
      expect(kingSideCastlingMove.pieceOnBoard).toStrictEqual(blackKing);
      expect(kingSideCastlingMove.to).toStrictEqual({
        x: 6,
        y: 0,
        captureEnPassant: null,
        capturedPiece: -1,
        promoteTo: -1,
      });
      expect(kingSideCastlingMove.board.pieceAt({ x: 5, y: 0 })).toBe(ROOK);
    });
    it("should be possible for white on queen side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([whiteKing, blackKing, whiteRook]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(1);
      const queenSideCastlingMove = moves[0];
      expect(queenSideCastlingMove.pieceOnBoard).toStrictEqual(whiteKing);
      expect(queenSideCastlingMove.to).toStrictEqual({
        x: 2,
        y: 7,
        captureEnPassant: null,
        capturedPiece: -1,
        promoteTo: -1,
      });
      expect(queenSideCastlingMove.board.pieceAt({ x: 2, y: 7 })).toBe(KING);
      expect(queenSideCastlingMove.board.pieceAt({ x: 3, y: 7 })).toBe(ROOK);
    });
    it("should be possible for black on queen side", () => {
      // given
      const blackKing: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: KING,
        color: BLACK,
      };
      const blackRook: PieceOnBoard = {
        position: { x: 0, y: 0 },
        piece: ROOK,
        color: BLACK,
      };
      const whiteKing: PieceOnBoard = {
        position: { x: 2, y: 7 },
        piece: KING,
        color: WHITE,
      };

      const board = BitBoard.buildFromPieces([whiteKing, blackKing, blackRook]);
      // when
      const moves = castlingMoves(BLACK, board);
      // then
      expect(moves).toHaveLength(1);
      const queenSideCastlingMove = moves[0];
      expect(queenSideCastlingMove.pieceOnBoard).toStrictEqual(blackKing);
      expect(queenSideCastlingMove.to).toStrictEqual({
        x: 2,
        y: 0,
        captureEnPassant: null,
        capturedPiece: -1,
        promoteTo: -1,
      });
      expect(queenSideCastlingMove.board.pieceAt({ x: 2, y: 0 })).toBe(KING);
      expect(queenSideCastlingMove.board.pieceAt({ x: 3, y: 0 })).toBe(ROOK);
    });

    it("should not be possible when king is in check", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };
      const blackRook: PieceOnBoard = {
        position: { x: 4, y: 0 },
        piece: ROOK,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook,
        blackKing,
        blackRook,
      ]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(0);
    });

    it("should not be possible when king goes into check", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };
      const blackRook1: PieceOnBoard = {
        position: { x: 6, y: 0 },
        piece: ROOK,
        color: BLACK,
      };
      const blackRook2: PieceOnBoard = {
        position: { x: 2, y: 1 },
        piece: ROOK,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
        blackRook1,
        blackRook2,
      ]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when king goes through check", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };
      const blackRook1: PieceOnBoard = {
        position: { x: 5, y: 0 },
        piece: ROOK,
        color: BLACK,
      };
      const blackRook2: PieceOnBoard = {
        position: { x: 3, y: 1 },
        piece: ROOK,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
        blackRook1,
        blackRook2,
      ]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when there are pieces between the king and rooks", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteKnight1: PieceOnBoard = {
        position: { x: 1, y: 7 },
        piece: KNIGHT,
        color: WHITE,
      };

      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteKnight2: PieceOnBoard = {
        position: { x: 6, y: 7 },
        piece: KNIGHT,
        color: WHITE,
      };

      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
        whiteKnight1,
        whiteKnight2,
      ]);
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when king has moved", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
      ])
        .move(whiteKing, {
          x: 4,
          y: 6,
          captureEnPassant: null,
          capturedPiece: -1,
          promoteTo: -1,
        })
        .move(blackKing, {
          x: 3,
          y: 0,
          captureEnPassant: null,
          capturedPiece: -1,
          promoteTo: -1,
        })
        .move(
          {
            position: { x: 4, y: 6 },
            piece: KING,
            color: WHITE,
          },
          {
            x: 4,
            y: 7,
            captureEnPassant: null,
            capturedPiece: -1,
            promoteTo: -1,
          }
        );
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(0);
    });
    it("should not be possible when rook has moved on queen side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
      ])
        .move(whiteRook1, {
          x: 0,
          y: 6,
          captureEnPassant: null,
          capturedPiece: -1,
          promoteTo: -1,
        })
        .move(blackKing, {
          x: 3,
          y: 0,
          captureEnPassant: null,
          capturedPiece: -1,
          promoteTo: -1,
        })
        .move(
          {
            position: { x: 0, y: 6 },
            piece: ROOK,
            color: WHITE,
          },
          {
            x: 0,
            y: 7,
            captureEnPassant: null,
            capturedPiece: -1,
            promoteTo: -1,
          }
        );
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(1);
    });
    it("should not be possible when rook has moved on king side", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook1: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const whiteRook2: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteRook1,
        whiteRook2,
        blackKing,
      ])
        .move(whiteRook2, {
          x: 7,
          y: 6,
          captureEnPassant: null,
          capturedPiece: -1,
          promoteTo: -1,
        })
        .move(blackKing, {
          x: 3,
          y: 0,
          captureEnPassant: null,
          capturedPiece: -1,
          promoteTo: -1,
        })
        .move(
          {
            position: { x: 7, y: 6 },
            piece: ROOK,
            color: WHITE,
          },
          {
            x: 7,
            y: 7,
            captureEnPassant: null,
            capturedPiece: -1,
            promoteTo: -1,
          }
        );
      // when
      const moves = castlingMoves(WHITE, board);
      // then
      expect(moves).toHaveLength(1);
    });
  });

  describe("Legal moves", () => {
    it("should detect legal moves", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 3, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteQueen: PieceOnBoard = {
        position: { x: 3, y: 6 },
        piece: QUEEN,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };
      const blackQueen: PieceOnBoard = {
        position: { x: 3, y: 0 },
        piece: QUEEN,
        color: BLACK,
      };
      const blackRook: PieceOnBoard = {
        position: { x: 0, y: 7 },
        piece: ROOK,
        color: BLACK,
      };
      const board = BitBoard.buildFromPieces([
        whiteKing,
        whiteQueen,
        blackKing,
        blackQueen,
        blackRook,
      ]);
      // when
      const moves = legalMoves(WHITE, board);
      // then
      expect(moves.some((m) => m.pieceOnBoard.piece === QUEEN)).toBe(false);
      expect(moves).toHaveLength(2);
    });

    it("should detect castling has a legal move", () => {
      // given
      const whiteKing: PieceOnBoard = {
        position: { x: 4, y: 7 },
        piece: KING,
        color: WHITE,
      };
      const whiteRook: PieceOnBoard = {
        position: { x: 7, y: 7 },
        piece: ROOK,
        color: WHITE,
      };
      const blackKing: PieceOnBoard = {
        position: { x: 2, y: 0 },
        piece: KING,
        color: BLACK,
      };

      const board = BitBoard.buildFromPieces([whiteKing, blackKing, whiteRook]);
      // when
      const moves = legalMoves(WHITE, board);
      // then
      expect(
        moves.filter(
          (m) =>
            m.pieceOnBoard.piece === KING &&
            equalPositions(m.to, { x: 6, y: 7 })
        )
      ).toHaveLength(1);
    });
  });
});
