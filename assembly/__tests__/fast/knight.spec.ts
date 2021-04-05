import {
  BitBoard,
  BLACK,
  KNIGHT,
  PAWN,
  QUEEN,
  WHITE,
} from "../../fast/bitboard";
import { getKnightMoves } from "../../fast/knight";
import { addKnightPseudoLegalCaptures } from "../../fast/knight-move-generation";

describe(`Knight move generation`, () => {
  it("should get knight moves from the center of the board", () => {
    // given
    const position: i8 = 36;
    // when
    const moves = getKnightMoves(position);
    // then
    expect(moves).toBe(
      (1 << 46) |
        (1 << 53) |
        (1 << 51) |
        (1 << 42) |
        (1 << 26) |
        (1 << 19) |
        (1 << 21) |
        (1 << 30)
    );
  });

  it("should get knight moves from bottom left corner", () => {
    // given
    const position: i8 = 0;
    // when
    const moves = getKnightMoves(position);
    // then
    expect(moves).toBe((1 << 17) + (1 << 10));
  });

  it("should get knight moves from top left corner", () => {
    // given
    const position: i8 = 56;
    // when
    const moves = getKnightMoves(position);
    // then
    expect(moves).toBe((1 << 50) + (1 << 41));
  });

  it("should get knight moves from top right", () => {
    // given
    const position: i8 = 55;
    // when
    const moves = getKnightMoves(position);
    // then
    expect(moves).toBe((1 << 61) + (1 << 45) + (1 << 38));
  });

  it("should get knight moves from bottom right corner", () => {
    // given
    const position: i8 = 7;
    // when
    const moves = getKnightMoves(position);
    // then
    expect(moves).toBe((1 << 13) + (1 << 22));
  });

  it("should get knight moves from left border", () => {
    // given
    const position: i8 = 16;
    // when
    const moves = getKnightMoves(position);
    // then
    expect(moves).toBe((1 << 1) + (1 << 10) + (1 << 26) + (1 << 33));
  });
});
