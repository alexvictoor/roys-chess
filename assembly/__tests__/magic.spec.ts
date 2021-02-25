import {
  findAllRookMagicNumbers,
  findMagicForRookAt,
  maskString,
  rookAttacks,
  rookBlockerMask,
  rookMaskAt,
} from "../magic";

describe(`Rook masks`, () => {
  it("should get bits on horizontal & verticla lines", () => {
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
describe(`Rook attacks`, () => {
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

describe(`Rook blocker mask generated`, () => {
  it("should be inside original mask", () => {
    // given
    const squareIndex: i8 = 0;
    const mask = rookMaskAt(squareIndex);
    // when
    const maskIndex: i8 = 5;
    const blockerMask = rookBlockerMask(mask, maskIndex);
    // then
    expect(blockerMask).not.toBe(mask);
    expect(blockerMask | mask).toBe(mask);
  });
});

describe(`Rook magic finder`, () => {
  it("should find a magic number", () => {
    // given
    const squareIndex: i8 = 0;
    // when
    const magic = findMagicForRookAt(squareIndex);
    // then
    log(maskString(magic));
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
