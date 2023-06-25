import {
  BISHOP,
  BLACK,
  encodeCapture,
  KNIGHT,
  maskString,
  PAWN,
  QUEEN,
  WHITE,
} from "../bitboard";
import { sortCaptures } from "../capture-ordering";
import { captureScore, sortMoves } from "../move-ordering";

describe('"Most valuable victim, least valuable attacker" capture comparison', () => {
  it("should score captures", () => {
    const lowValueCaptureAction = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      BISHOP + BLACK,
      1
    );
    const highValueCaptureAction = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      QUEEN + BLACK,
      1
    );
    //log(captureScore(highValueCaptureAction));
    //log(captureScore(lowValueCaptureAction));
    expect(captureScore(highValueCaptureAction)).toBeGreaterThan(
      captureScore(lowValueCaptureAction)
    );
  });
  it("should score captures the same way for black & white", () => {
    const whiteCapture = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      BISHOP + BLACK,
      1
    );
    const blackCapture = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      BISHOP + BLACK,
      1
    );

    expect(captureScore(whiteCapture)).toBe(captureScore(blackCapture));
  });

  it("should sort captures, high value first", () => {
    // given
    const lowValueCapture = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      BISHOP + BLACK,
      1
    );
    const mediumValueCapture = encodeCapture(
      PAWN + WHITE,
      8,
      PAWN + WHITE,
      17,
      KNIGHT + BLACK,
      17
    );
    const highValueCapture = encodeCapture(
      BISHOP + WHITE,
      8,
      BISHOP + WHITE,
      1,
      QUEEN + BLACK,
      1
    );
    const highestValueCapture = encodeCapture(
      PAWN + WHITE,
      8,
      PAWN + WHITE,
      17,
      QUEEN + BLACK,
      17
    );
    const captures: StaticArray<u32> = [
      lowValueCapture,
      highestValueCapture,
      mediumValueCapture,
      highValueCapture,
    ];
    // when
    sortCaptures(captures);
    // then
    const mask: u64 = ((<u64>1) << 54) - 1;
    expect(captures[0] & mask).toBe(highestValueCapture);
    expect(captures[1] & mask).toBe(highValueCapture);
    expect(captures[2] & mask).toBe(mediumValueCapture);
    expect(captures[3] & mask).toBe(lowValueCapture);
  });

  it("should sort captures, high value first (bis)", () => {
    /*// given
    const lowValueCapture = encodeCapture(
      BISHOP + BLACK,
      8,
      BISHOP + BLACK,
      1,
      BISHOP + WHITE,
      1
    );
    const mediumValueCapture = encodeCapture(
      PAWN + BLACK,
      8,
      PAWN + BLACK,
      17,
      KNIGHT + WHITE,
      17
    );
    const highValueCapture = encodeCapture(
      BISHOP + BLACK,
      8,
      BISHOP + BLACK,
      1,
      QUEEN + WHITE,
      1
    );
    const highestValueCapture = encodeCapture(
      PAWN + BLACK,
      8,
      PAWN + BLACK,
      17,
      QUEEN + WHITE,
      17
    );
    const captures: StaticArray<u32> = [
      lowValueCapture,
      highestValueCapture,
      mediumValueCapture,
      highValueCapture,
    ];
    // when
    sortMoves(BLACK, 42, captures, 0);
    // then
    const mask: u64 = ((<u64>1) << 54) - 1;
    expect(captures[0] & mask).toBe(highestValueCapture);
    expect(captures[1] & mask).toBe(highValueCapture);
    expect(captures[2] & mask).toBe(mediumValueCapture);
    expect(captures[3] & mask).toBe(lowValueCapture);*/
  });
});
