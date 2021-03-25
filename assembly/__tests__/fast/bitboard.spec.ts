import {
  BitBoard,
  BLACK,
  encodeCapture,
  encodeCastling,
  encodeMove,
  getPositionsFromMask,
  KING,
  PAWN,
  ROOK,
  toNotation,
  WHITE,
} from "../../fast/bitboard";

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
    board.putPiece(KING, WHITE, 40);
    board.putPiece(PAWN, BLACK, 48);

    // when
    const action = encodeCapture(
      KING + WHITE,
      40,
      KING + WHITE,
      48,
      PAWN + BLACK
    );
    const updatedBoard = board.execute(action);
    // then
    expect(updatedBoard.getAllPiecesMask()).toBe(1 << 48);
    expect(updatedBoard.getPlayerPiecesMask(WHITE)).toBe(1 << 48);
    expect(updatedBoard.getPlayerPiecesMask(BLACK)).toBe(0);
  });
});

describe(`Postions from masks`, () => {
  it("should extract positions from mask", () => {
    // given
    const mask: u64 =
      (1 << 9) +
      (1 << 18) +
      (1 << 27) +
      (1 << 36) +
      (1 << 45) +
      (1 << 54) +
      (1 << 63);
    // when
    const positions = getPositionsFromMask(mask);
    //then
    expect(positions).toHaveLength(7);
    expect(positions).toContain(9);
    expect(positions).toContain(18);
    expect(positions).toContain(27);
    expect(positions).toContain(36);
    expect(positions).toContain(45);
    expect(positions).toContain(54);
    expect(positions).toContain(63);
  });
  it("should extract last position", () => {
    // given
    const mask: u64 = 1 << 63;
    // when
    const positions = getPositionsFromMask(mask);
    //then
    expect(positions).toHaveLength(1);
    expect(positions).toContain(63);
  });
});

describe(`Previous actions`, () => {
  it("should provide the previous action code", () => {
    const move = encodeMove(WHITE + PAWN, 8, WHITE + PAWN, 16);
    expect(toNotation(move)).toBe("a2-a3");
  });
  it("should provide the code of the king side castling that has just been done", () => {
    const castling = encodeCastling(KING + WHITE, 4, 6, ROOK + WHITE, 7, 5);
    expect(toNotation(castling)).toBe("O-O");
  });
  it("should provide the code of the queen side castling that has just been done", () => {
    const castling = encodeCastling(KING + WHITE, 4, 2, ROOK + WHITE, 0, 3);
    expect(toNotation(castling)).toBe("O-O-O");
  });
});
