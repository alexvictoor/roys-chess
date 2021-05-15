import { maskString } from "../bitboard";
import {
  bishopAttacks,
  bishopMaskAt,
  findAllRookMagicNumbers,
  findMagicForPieceAt,
  rookAttacks,
  generateBlockerMask,
  rookMaskAt,
  findAllBishopMagicNumbers,
} from "../magic";

describe("Rook masks", () => {
  it("should get bits on horizontal & vertical lines", () => {
    // given
    const squareIndex: i8 = 0;
    // when
    const mask = rookMaskAt(squareIndex);
    // then
    expect(mask).toBe(
      (1 << 1) +
        (1 << 2) +
        (1 << 3) +
        (1 << 4) +
        (1 << 5) +
        (1 << 6) +
        (1 << 8) +
        (1 << 16) +
        (1 << 24) +
        (1 << 32) +
        (1 << 40) +
        (1 << 48)
    );
  });
});
describe("Rook attacks", () => {
  it("should be blocked on vertical and horizontal lines", () => {
    // given
    const squareIndex: i8 = 0;
    const blockerMask: u64 = (1 << 1) + (1 << 8);
    // when
    const attacks = rookAttacks(squareIndex, blockerMask);
    // then
    expect(attacks).toBe((1 << 1) + (1 << 8));
  });
});

describe("Bishop masks", () => {
  it("should get bits on verticals", () => {
    // given
    const squareIndex: i8 = 0;
    // when
    const mask = bishopMaskAt(squareIndex);
    // then
    expect(mask).toBe(
      (1 << 9) + (1 << 18) + (1 << 27) + (1 << 36) + (1 << 45) + (1 << 54)
    );
  });
});
describe("Bishop attacks", () => {
  it("should be blocked on both verticals", () => {
    // given
    const squareIndex: i8 = 19;
    const blockerMask: u64 = (1 << 26) + (1 << 28);
    // when
    const attacks = bishopAttacks(squareIndex, blockerMask);
    // then
    expect(attacks).toBe(
      (1 << 1) + (1 << 5) + (1 << 10) + (1 << 12) + (1 << 26) + (1 << 28)
    );
  });
});

describe("Rook blocker mask generated", () => {
  it("should be inside original mask", () => {
    // given
    const squareIndex: i8 = 0;
    const mask = rookMaskAt(squareIndex);
    // when
    const maskIndex: i8 = 5;
    const blockerMask = generateBlockerMask(mask, maskIndex);
    // then
    expect(blockerMask).not.toBe(mask);
    expect(blockerMask | mask).toBe(mask);
  });
});

describe("Rook magic finder", () => {
  it("should find a magic number", () => {
    // given
    const squareIndex: i8 = 0;
    // when
    const magic = findMagicForPieceAt(squareIndex, false);
    // then
    expect(magic).not.toBe(0);
  });
  xit("should find all magic numbers", () => {
    // given
    // when
    const magics = findAllRookMagicNumbers();
    // then
    expect(magics.slice(0).some((m) => m === 0)).toBe(false);
  });
});

describe("Bishop magic finder", () => {
  it("should find a magic number", () => {
    // given
    const squareIndex: i8 = 0;
    // when
    const magic = findMagicForPieceAt(squareIndex, true);
    // then
    expect(magic).not.toBe(0);
  });
  xit("should find all magic numbers", () => {
    // given
    // when
    const magics = findAllBishopMagicNumbers();
    // then
    expect(magics.slice(0).some((m) => m === 0)).toBe(false);
  });
});
