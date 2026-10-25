import {
  BitBoard,
  decodeCapturedPiece,
  decodeCaptureFlag,
  decodeDestPiece,
  decodeSrcPiece,
} from "./bitboard";
import { history } from "./history";
import { MoveStack } from "./move-stack";

// Piece "values" for MVV-LVA (indexed by piece type: P N B R Q K)
const SCORES: i8[] = [1, 3, 4, 5, 9, 10];

const CAPTURE_BASE: i16 = 20000;
const PROMOTION_BASE: i16 = 19000;

const captureScores = new StaticArray<i16>(64);
for (let i = 0; i < SCORES.length; i++) {
  for (let j = 0; j < SCORES.length; j++) {
    // expected material swing (victim - attacker), offset above every quiet move
    captureScores[(i << 3) + j] = CAPTURE_BASE + (<i16>SCORES[i] - <i16>SCORES[j]) * 100;
  }
}

/** MVV-LVA score of a capture (higher = search first). */
@inline
export function captureScore(capture: u32): i16 {
  const srcPiece: i8 = decodeSrcPiece(capture) >> 1;
  const capturedPiece: i8 = decodeCapturedPiece(capture) >> 1;
  return unchecked(captureScores[(capturedPiece << 3) + srcPiece]);
}

export function score(board: BitBoard, player: i8, ply: i8, action: u32, hashMove: u32): i16 {
  if (action == hashMove) {
    return i16.MAX_VALUE;
  }
  const isCapture: i8 = decodeCaptureFlag(action);
  if (isCapture) {
    return captureScore(action);
  }
  const srcPiece = decodeSrcPiece(action);
  const dstPiece = decodeDestPiece(action);
  if (srcPiece != dstPiece) {
    // quiet promotion
    return PROMOTION_BASE + <i16>(dstPiece >> 1) * 100;
  }
  return history.getMoveScore(player, ply, action);
}

const scores: StaticArray<i16> = new StaticArray<i16>(256);

/** Sort the moves of `stack` in place, best first (insertion sort). */
export function sortMoves(
  board: BitBoard,
  player: i8,
  ply: i8,
  stack: MoveStack,
  hashMove: u32
): void {
  const count = stack.count;
  for (let index = 0; index < count; index++) {
    unchecked((scores[index] = score(board, player, ply, stack.at(index), hashMove)));
  }
  for (let i = 1; i < count; i++) {
    const move = stack.at(i);
    const moveScore = unchecked(scores[i]);
    let j = i - 1;
    while (j >= 0) {
      const otherScore = unchecked(scores[j]);
      if (otherScore >= moveScore) {
        break;
      }
      stack.set(j + 1, stack.at(j));
      unchecked((scores[j + 1] = otherScore));
      j--;
    }
    stack.set(j + 1, move);
    unchecked((scores[j + 1] = moveScore));
  }
}

/** Sort captures in place by MVV-LVA. */
export function sortCaptures(stack: MoveStack): void {
  const count = stack.count;
  for (let index = 0; index < count; index++) {
    unchecked((scores[index] = captureScore(stack.at(index))));
  }
  for (let i = 1; i < count; i++) {
    const move = stack.at(i);
    const moveScore = unchecked(scores[i]);
    let j = i - 1;
    while (j >= 0) {
      const otherScore = unchecked(scores[j]);
      if (otherScore >= moveScore) {
        break;
      }
      stack.set(j + 1, stack.at(j));
      unchecked((scores[j + 1] = otherScore));
      j--;
    }
    stack.set(j + 1, move);
    unchecked((scores[j + 1] = moveScore));
  }
}
