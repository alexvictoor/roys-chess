import { BitBoard } from "../bitboard";
import {
  BISHOP,
  BLACK,
  KING,
  KNIGHT,
  MoveOutcome,
  PAWN,
  PieceOnBoard,
  QUEEN,
  ROOK,
  WHITE,
} from "../chess";
import { pawnPseudoLegalMoves } from "../pawn";

describe(`Pawn`, () => {
  it("should be able to move forward if the square is empty", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: PAWN,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = pawnPseudoLegalMoves(board, piece);
    // then
    expect(positions).toHaveLength(1);
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 4,
      y: 5,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
  });
  it("should not be able to move forward if the square is not empty", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: PAWN,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([
      piece,
      {
        color: WHITE,
        piece: PAWN,
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
      piece: PAWN,
      color: BLACK,
    };
    const pawn: PieceOnBoard = {
      color: WHITE,
      piece: PAWN,
      position: { x: 0, y: 6 },
    };
    const pawn2: PieceOnBoard = {
      color: WHITE,
      piece: PAWN,
      position: { x: 0, y: 5 },
    };
    const board = BitBoard.buildFromPieces([piece, pawn, pawn2]);
    // when
    const positions = pawnPseudoLegalMoves(board, pawn);
    // then
    expect(positions).toHaveLength(0);
  });

  it("should be able to capture a piece on the side", () => {
    // given
    const blackPawn: PieceOnBoard = {
      position: { x: 4, y: 4 },
      piece: PAWN,
      color: BLACK,
    };
    const whitePawnOnTheLeft: PieceOnBoard = {
      color: WHITE,
      piece: PAWN,
      position: { x: 3, y: 5 },
    };
    const whitePawnOnTheRight: PieceOnBoard = {
      color: WHITE,
      piece: PAWN,
      position: { x: 5, y: 5 },
    };
    const board = BitBoard.buildFromPieces([
      blackPawn,
      whitePawnOnTheLeft,
      whitePawnOnTheRight,
    ]);
    // when
    const positions = pawnPseudoLegalMoves(board, blackPawn);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 4,
      y: 5,
      capturedPiece: -1,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 5,
      y: 5,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 3,
      y: 5,
      capturedPiece: PAWN,
      captureEnPassant: null,
      promoteTo: -1,
    });
  });

  it("should promote pawn to queen, rook, bishop or knight when pawn reach last row", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 4, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const whitePawn: PieceOnBoard = {
      position: { x: 7, y: 1 },
      piece: PAWN,
      color: WHITE,
    };
    const blackKing: PieceOnBoard = {
      position: { x: 2, y: 0 },
      piece: KING,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whiteKing, blackKing, whitePawn]);
    // when
    const positions = pawnPseudoLegalMoves(board, whitePawn);
    // then
    const promotions: i8[] = positions.map<i8>((p) => p.promoteTo);
    expect(promotions).toContainEqual(QUEEN);
    expect(promotions).toContainEqual(ROOK);
    expect(promotions).toContainEqual(BISHOP);
    expect(promotions).toContainEqual(KNIGHT);
  });

  it("should promote pawn to queen, rook, bishop or knight when pawn captures a piece on last row (on the left)", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 4, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const whitePawn: PieceOnBoard = {
      position: { x: 7, y: 1 },
      piece: PAWN,
      color: WHITE,
    };
    const blackRook: PieceOnBoard = {
      position: { x: 6, y: 0 },
      piece: ROOK,
      color: BLACK,
    };
    const blackKing: PieceOnBoard = {
      position: { x: 7, y: 0 },
      piece: KING,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([
      whiteKing,
      blackKing,
      whitePawn,
      blackRook,
    ]);
    // when
    const positions = pawnPseudoLegalMoves(board, whitePawn);
    // then
    const promotionsWhileCapturing: i8[] = positions
      .filter((p) => p.capturedPiece === ROOK)
      .map<i8>((p) => p.promoteTo);
    expect(promotionsWhileCapturing).toContainEqual(QUEEN);
    expect(promotionsWhileCapturing).toContainEqual(ROOK);
    expect(promotionsWhileCapturing).toContainEqual(BISHOP);
    expect(promotionsWhileCapturing).toContainEqual(KNIGHT);
  });
  it("should promote pawn to queen, rook, bishop or knight when pawn captures a piece on last row (on the right)", () => {
    // given
    const whiteKing: PieceOnBoard = {
      position: { x: 4, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const whitePawn: PieceOnBoard = {
      position: { x: 6, y: 1 },
      piece: PAWN,
      color: WHITE,
    };
    const blackRook: PieceOnBoard = {
      position: { x: 7, y: 0 },
      piece: ROOK,
      color: BLACK,
    };
    const blackKing: PieceOnBoard = {
      position: { x: 6, y: 0 },
      piece: KING,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([
      whiteKing,
      blackKing,
      whitePawn,
      blackRook,
    ]);
    // when
    const positions = pawnPseudoLegalMoves(board, whitePawn);
    // then
    const promotionsWhileCapturing: i8[] = positions
      .filter((p) => p.capturedPiece === ROOK)
      .map<i8>((p) => p.promoteTo);
    expect(promotionsWhileCapturing).toContainEqual(QUEEN);
    expect(promotionsWhileCapturing).toContainEqual(ROOK);
    expect(promotionsWhileCapturing).toContainEqual(BISHOP);
    expect(promotionsWhileCapturing).toContainEqual(KNIGHT);
  });

  it("should be able to advance two squares from its initial position (black pawn)", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 1 },
      piece: PAWN,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = pawnPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 4,
      y: 3,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
  });
  it("should be able to advance two squares from its initial position (white pawn)", () => {
    // given
    const piece: PieceOnBoard = {
      position: { x: 4, y: 6 },
      piece: PAWN,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([piece]);
    // when
    const positions = pawnPseudoLegalMoves(board, piece);
    // then
    expect(positions).toContainEqual(<MoveOutcome>{
      x: 4,
      y: 4,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
  });

  it("should not be able to advance two squares when there is a piece in the way", () => {
    // given
    const pawn: PieceOnBoard = {
      position: { x: 4, y: 6 },
      piece: PAWN,
      color: WHITE,
    };
    const knight: PieceOnBoard = {
      position: { x: 4, y: 5 },
      piece: KNIGHT,
      color: WHITE,
    };
    const board = BitBoard.buildFromPieces([pawn, knight]);
    // when
    const positions = pawnPseudoLegalMoves(board, pawn);
    // then
    expect(positions).not.toContainEqual(<MoveOutcome>{
      x: 4,
      y: 4,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
  });

  it("should be able to capture 'en passant' opponent pawn when this pawn has advanced two squared just before", () => {
    // given
    const whitePawn: PieceOnBoard = {
      position: { x: 0, y: 6 },
      piece: PAWN,
      color: WHITE,
    };
    const blackPawn: PieceOnBoard = {
      position: { x: 1, y: 4 },
      piece: PAWN,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([whitePawn, blackPawn]);
    // when
    const board2 = board.move(whitePawn, {
      x: 0,
      y: 4,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
    const blackMoves = pawnPseudoLegalMoves(board2, blackPawn);
    // then
    expect(blackMoves).toContainEqual(<MoveOutcome>{
      x: 0,
      y: 5,
      captureEnPassant: {
        position: {
          x: 0,
          y: 4,
        },
        piece: PAWN,
        color: WHITE,
      },
      capturedPiece: PAWN,
      promoteTo: -1,
    });
  });
  it("should not be able to capture 'en passant' opponent pawn when this pawn has advanced two squared before previous move", () => {
    // given
    const whitePawn: PieceOnBoard = {
      position: { x: 1, y: 6 },
      piece: PAWN,
      color: WHITE,
    };
    const whiteKing: PieceOnBoard = {
      position: { x: 4, y: 7 },
      piece: KING,
      color: WHITE,
    };
    const blackPawn: PieceOnBoard = {
      position: { x: 2, y: 4 },
      piece: PAWN,
      color: BLACK,
    };
    const blackKing: PieceOnBoard = {
      position: { x: 4, y: 0 },
      piece: KING,
      color: BLACK,
    };
    const board = BitBoard.buildFromPieces([
      whitePawn,
      blackPawn,
      whiteKing,
      blackKing,
    ]);
    // when
    const board2 = board.move(whitePawn, {
      x: 1,
      y: 4,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
    const board3 = board2.move(blackKing, {
      x: 3,
      y: 0,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
    const board4 = board3.move(whiteKing, {
      x: 3,
      y: 7,
      capturedPiece: -1,
      promoteTo: -1,
      captureEnPassant: null,
    });
    const blackMoves = pawnPseudoLegalMoves(board4, blackPawn);
    // then
    expect(blackMoves).not.toContainEqual(<MoveOutcome>{
      x: 1,
      y: 5,
      capturedPiece: PAWN,
      promoteTo: -1,
      captureEnPassant: {
        position: { x: 1, y: 4 },
        piece: PAWN,
        color: WHITE,
      },
    });
  });
});
