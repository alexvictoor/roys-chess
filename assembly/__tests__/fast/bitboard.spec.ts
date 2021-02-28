import { BitBoard, BLACK, PAWN, WHITE } from "../../fast/bitboard";

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
});
