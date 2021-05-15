import { BitBoard, BLACK, KING, maskString, PAWN, WHITE } from "../bitboard";
import { getKingMoves } from "../king";
import { addKingPseudoLegalCaptures } from "../king-move-generation";

describe("King move generation", () => {
  it("should get king moves from the center of the board", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 36;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe(
      (1 << 35) +
        (1 << 37) +
        (1 << 27) +
        (1 << 28) +
        (1 << 29) +
        (1 << 43) +
        (1 << 44) +
        (1 << 45)
    );
  });

  it("should get king moves from bottom left corner", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 0;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe(2 + (1 << 8) + (1 << 9));
  });
  it("should get king moves from top left corner", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 56;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe((1 << 57) + (1 << 49) + (1 << 48));
  });
  it("should get king moves from top right", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 55;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe(
      (1 << 63) + (1 << 62) + (1 << 54) + (1 << 46) + (1 << 47)
    );
  });
  it("should get king moves from bottom right corner", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 7;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe((1 << 6) + (1 << 14) + (1 << 15));
  });
  it("should get king moves from left border", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 16;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe((1 << 8) + (1 << 24) + (1 << 25) + (1 << 17) + (1 << 9));
  });
  it("should get king moves from right border", () => {
    // given
    const board: u64 = 0;
    const position: i8 = 23;
    // when
    const moves = getKingMoves(position);
    // then
    expect(moves).toBe(
      (1 << 15) + (1 << 31) + (1 << 30) + (1 << 22) + (1 << 14)
    );
  });
});
