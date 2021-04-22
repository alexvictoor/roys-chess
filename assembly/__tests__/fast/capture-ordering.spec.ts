import {
  BISHOP,
  BLACK,
  encodeCapture,
  KNIGHT,
  maskString,
  PAWN,
  QUEEN,
  WHITE,
} from "../../fast/bitboard";
import { score, sortCaptures } from "../../fast/capture-ordering";

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
    expect(score(highValueCaptureAction)).toBeGreaterThan(
      score(lowValueCaptureAction)
    );
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
    const captures: u32[] = [
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
});
