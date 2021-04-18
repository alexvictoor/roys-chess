import { decodeCapturedPiece, decodeSrcPiece } from "./bitboard";

const SCORES: i8[] = [1, 1, 3, 3, 4, 4, 5, 5, 9, 9, 10, 10];

export function score(capture: u64): i8 {
  return (
    unchecked(SCORES[decodeCapturedPiece(capture)]) -
    unchecked(SCORES[decodeSrcPiece(capture)])
  );
}

function encodeScore(capture: u64, score: i8): u64 {
  return capture | ((<u64>score) << 54);
}
function decodeScore(capture: u64): i8 {
  return <i8>(capture >> 54);
}

export function sortCaptures(captures: u64[]): void {
  for (let index = 0; index < captures.length; index++) {
    const capture = unchecked(captures[index]);
    const scoredCapture = encodeScore(capture, score(capture));
    unchecked((captures[index] = scoredCapture));
  }
  // in place insertion sort
  for (let i = 1; i < captures.length; i++) {
    const capture = unchecked(captures[i]);
    const score = decodeScore(capture);
    let j = i - 1;
    while (j >= 0) {
      const otherCapture = unchecked(captures[j]);
      if (decodeScore(otherCapture) >= score) {
        break;
      }
      unchecked((captures[j + 1] = otherCapture));
      j--;
    }
    unchecked((captures[j + 1] = capture));
  }
}
