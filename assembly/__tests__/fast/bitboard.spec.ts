import {
  BitBoard,
  BLACK,
  getPositionsFromMask,
  maskString,
  PAWN,
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
    board.putPiece(PAWN, WHITE, 24);
    board.putPiece(PAWN, BLACK, 25);
    // when
    const action: u64 =
      (<u64>(PAWN + BLACK)) |
      (25 << 4) |
      ((<u64>(PAWN + BLACK)) << 10) |
      (16 << 14) |
      ((<u64>(PAWN + WHITE)) << 20) |
      (24 << 24);

    const updatedBoard = board.execute(action);
    // then
    expect(updatedBoard.getAllPiecesMask()).toBe(1 << 16);
    expect(updatedBoard.getPlayerPiecesMask(WHITE)).toBe(0);
    expect(updatedBoard.getPlayerPiecesMask(BLACK)).toBe(1 << 16);
    expect(updatedBoard.getPawnMask(BLACK)).toBe(1 << 16);
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
});
