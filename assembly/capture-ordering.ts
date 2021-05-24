import { decodeCapturedPiece, decodeSrcPiece } from "./bitboard";
import { captureScore } from "./move-ordering";
/*
const SCORES: i8[] = [1, 1, 3, 3, 4, 4, 5, 5, 9, 9, 10, 10];

export function score(capture: u32): i8 {
  return (
    unchecked(SCORES[decodeCapturedPiece(capture)]) -
    unchecked(SCORES[decodeSrcPiece(capture)])
  );
}
*/
function encodeScore(capture: u64, score: i8): u64 {
  return capture | ((<u64>score) << 54);
}
function decodeScore(capture: u64): i8 {
  return <i8>(capture >> 54);
}

const scores: StaticArray<u32> = new StaticArray<u32>(256);
export function sortCaptures(captures: u32[]): void {
  for (let index = 0; index < captures.length; index++) {
    const capture = unchecked(captures[index]);
    unchecked((scores[index] = captureScore(capture)));
  }
  // in place insertion sort
  for (let i = 1; i < captures.length; i++) {
    const capture = unchecked(captures[i]);
    const score = unchecked(scores[i]);
    let j = i - 1;
    while (j >= 0) {
      const otherCapture = unchecked(captures[j]);
      const otherScore = unchecked(scores[j]);
      if (otherScore >= score) {
        break;
      }
      unchecked((captures[j + 1] = otherCapture));
      unchecked((scores[j + 1] = otherScore));
      j--;
    }
    unchecked((captures[j + 1] = capture));
    unchecked((scores[j + 1] = score));
  }
}
