import {
  BISHOP,
  BitBoard,
  BLACK,
  decodeCapturedPiece,
  decodeSrcPiece,
  encodeCapture,
  encodeMove,
  encodePawnDoubleMove,
  KING,
  KNIGHT,
  MaskIterator,
  PAWN,
  ROOK,
  toNotation,
  WHITE,
} from "../../fast/bitboard";
import { parseFEN } from "../../fast/fen-parser";

describe(`Bit Board`, () => {
  it("should put piece on board", () => {
    // given
    const board = new BitBoard();
    // when
    board.putPiece(PAWN, WHITE, 42);
    // then
    expect(board.getAllPiecesMask()).toBe(1 << 42);
    expect(board.getPlayerPiecesMask(WHITE)).toBe(1 << 42);
    expect(board.getPlayerPiecesMask(BLACK)).toBe(0);
  });
  it("should move piece on board", () => {
    // given
    const board = new BitBoard();
    board.putPiece(PAWN, WHITE, 42);
    // when
    const action: u64 =
      (<u64>(PAWN + WHITE)) |
      (42 << 4) |
      ((<u64>(PAWN + WHITE)) << 10) |
      (43 << 14);

    const updatedBoard = board.execute(action);
    // then
    expect(updatedBoard.getAllPiecesMask()).toBe(1 << 43);
    expect(updatedBoard.getPlayerPiecesMask(WHITE)).toBe(1 << 43);
    expect(updatedBoard.getPawnMask(WHITE)).toBe(1 << 43);
  });
  it("should capture piece on board", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, BLACK, 40);
    board.putPiece(PAWN, WHITE, 48);

    // when
    const action = encodeCapture(
      KING + BLACK,
      40,
      KING + BLACK,
      48,
      PAWN + WHITE
    );
    const updatedBoard = board.execute(action);
    // then
    expect(updatedBoard.getAllPiecesMask()).toBe(1 << 48);
    expect(updatedBoard.getPlayerPiecesMask(BLACK)).toBe(1 << 48);
    expect(updatedBoard.getPlayerPiecesMask(WHITE)).toBe(0);
  });
});

describe(`Bit Board hash`, () => {
  it("should be different for two boards", () => {
    // given
    const board1 = new BitBoard();
    board1.putPiece(KING, WHITE, 42);
    board1.putPiece(KING, BLACK, 38);
    board1.putPiece(PAWN, BLACK, 17);
    board1.putPiece(ROOK, WHITE, 23);
    const board2 = new BitBoard();
    board1.putPiece(KING, WHITE, 42);
    board1.putPiece(KING, BLACK, 38);
    board1.putPiece(PAWN, BLACK, 17);
    board1.putPiece(ROOK, WHITE, 22);
    // when
    const hash1 = board1.hashCode();
    const hash2 = board2.hashCode();
    // then
    expect(hash1).not.toBe(hash2);
  });

  it("should be different for two boards (bis)", () => {
    // given
    const board1 = new BitBoard();
    board1.putPiece(KING, WHITE, 42);
    const hash1 = board1.hashCode();
    const board2 = board1.execute(
      encodeMove(KING + WHITE, 42, KING + WHITE, 43)
    );
    // when
    const hash2 = board2.hashCode();
    // then
    expect(hash1).not.toBe(hash2);
  });
  it("should be equal for two equivalent boards built differently", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 42);

    const board1 = board
      .execute(encodeMove(KING + WHITE, 42, KING + WHITE, 43))
      .execute(encodeMove(KING + WHITE, 43, KING + WHITE, 42));
    const board2 = board1
      .execute(encodeMove(KING + WHITE, 42, KING + WHITE, 43))
      .execute(encodeMove(KING + WHITE, 43, KING + WHITE, 42));
    // when
    const hash1 = board1.hashCode();
    const hash2 = board2.hashCode();
    // then
    expect(hash1).toBe(hash2);
    expect(board1.equals(board2)).toBe(true);
  });
});

describe(`Mask iterator`, () => {
  it("should iterate through positions", () => {
    // given
    const mask: u64 =
      (1 << 9) +
      (1 << 18) +
      (1 << 27) +
      (1 << 36) +
      (1 << 45) +
      (1 << 54) +
      (1 << 63);
    const it = new MaskIterator();
    // when
    it.reset(mask);
    //then
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(9);
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(18);
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(27);
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(36);
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(45);
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(54);
    expect(it.hasNext()).toBe(true);
    expect(it.next()).toBe(63);
    expect(it.hasNext()).toBe(false);
  });
  it("should iterate to last position", () => {
    // given
    const mask: u64 = 1 << 63;
    const it = new MaskIterator();
    // when
    it.reset(mask);
    //then
    expect(it.next()).toBe(63);
    expect(it.hasNext()).toBe(false);
  });
});

describe(`Previous actions`, () => {
  it("should provide the previous action code", () => {
    const move = encodeMove(WHITE + PAWN, 8, WHITE + PAWN, 16);
    expect(toNotation(move)).toBe("a2-a3");
  });
  it("should provide the code of the king side castling that has just been done", () => {
    const castling = encodeMove(KING + WHITE, 4, KING + WHITE, 6);
    expect(toNotation(castling)).toBe("O-O");
  });
  it("should provide the code of the queen side castling that has just been done", () => {
    const castling = encodeMove(KING + WHITE, 4, KING + WHITE, 2);
    expect(toNotation(castling)).toBe("O-O-O");
  });
});

describe("Action encoding", () => {
  it("should decode moved piece and captured piece", () => {
    // given
    const captureAction = encodeCapture(
      PAWN + BLACK,
      8,
      BISHOP + BLACK,
      1,
      ROOK + WHITE,
      1
    );
    // when
    const srcPiece = decodeSrcPiece(captureAction);
    const capturedPiece = decodeCapturedPiece(captureAction);
    // then
    expect(srcPiece).toBe(PAWN + BLACK);
    expect(capturedPiece).toBe(ROOK + WHITE);
  });
});

describe("Action do/undo", () => {
  it("should move piece on board", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 42);
    // when
    const action: u64 = encodeMove(WHITE + KING, 42, WHITE + KING, 43);
    board.do(action);
    // then
    expect(board.getAllPiecesMask()).toBe(1 << 43);
    expect(board.getPlayerPiecesMask(WHITE)).toBe(1 << 43);
    expect(board.getKingMask(WHITE)).toBe(1 << 43);
    expect(board.getHalfMoveClock()).toBe(1);
  });

  it("should get the original board when a move is undone", () => {
    // given
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    const move = encodeMove(WHITE + PAWN, 8, WHITE + PAWN, 16);
    board.do(move);
    // when
    board.undo();
    // then
    expect(board.toFEN()).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
  });
  it("should get the original board when a pawn double move is undone", () => {
    // given
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    const move = encodePawnDoubleMove(WHITE + PAWN, 8, 24);
    board.do(move);
    // when
    board.undo();
    // then
    expect(board.toFEN()).toBe("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR");
    expect(board.getEnPassantFile()).toBe(-1);
  });
  it("should get back en passant file when an action is undone", () => {
    // given
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    board.do(encodePawnDoubleMove(WHITE + PAWN, 8, 24));
    board.do(encodePawnDoubleMove(BLACK + PAWN, 49, 33));
    // when
    board.undo();
    // then
    expect(board.getEnPassantFile()).toBe(0);
  });
  it("should undo a capture", () => {
    // given
    const board = parseFEN(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    );
    board.do(encodePawnDoubleMove(WHITE + PAWN, 8, 24));
    board.do(encodePawnDoubleMove(BLACK + PAWN, 49, 33));
    board.do(encodePawnDoubleMove(WHITE + KNIGHT, 1, 18));
    board.do(encodePawnDoubleMove(BLACK + KNIGHT, 57, 42));
    const fenBeforeCapture = board.toFEN();
    const clockBefore = board.getHalfMoveClock();
    // when
    board.do(
      encodeCapture(WHITE + PAWN, 24, WHITE + PAWN, 33, BLACK + PAWN, 33)
    );
    board.undo();
    // then
    expect(board.toFEN()).toBe(fenBeforeCapture);
    expect(board.getHalfMoveClock()).toBe(clockBefore);
  });

  it("should undo a castling", () => {
    // given
    const board = new BitBoard();
    board.putPiece(KING, WHITE, 4);
    board.putPiece(ROOK, WHITE, 0);
    board.putPiece(ROOK, WHITE, 7);
    board.putPiece(KING, BLACK, 60);
    const fenBeforeCastling = board.toFEN();
    // when
    board.do(encodeMove(KING + WHITE, 4, KING + WHITE, 6));
    board.undo();
    // then
    expect(board.toFEN()).toBe(fenBeforeCastling);
    expect(board.queenSideCastlingRight(WHITE)).toBe(true);
    expect(board.kingSideCastlingRight(WHITE)).toBe(true);
  });
});
