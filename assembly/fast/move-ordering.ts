import {
  decodeCapturedPiece,
  decodeCaptureFlag,
  decodeSrcPiece,
} from "./bitboard";
import { history } from "./history";

//const SCORES: i8[] = [1, 1, 3, 3, 4, 4, 5, 5, 9, 9, 10, 10];
const SCORES: i8[] = [1, 3, 4, 5, 9, 10];

const captureScores = new StaticArray<u32>(256);
for (let i = 0; i < SCORES.length; i++) {
  for (let j = 0; j < SCORES.length; j++) {
    captureScores[(i << 3) + j] = (SCORES[i] - SCORES[j]) * 100 + 4096;
  }
}

export function score(player: i8, ply: i8, action: u64): u32 {
  const isCapture: i8 = decodeCaptureFlag(action);

  if (isCapture) {
    const srcPiece: i8 = decodeSrcPiece(action);
    const capturedPiece: i8 = decodeCapturedPiece(action);
    //return unchecked(SCORES[capturedPiece]) - unchecked(SCORES[srcPiece]);
    return unchecked(captureScores[(capturedPiece << 2) + (srcPiece >> 1)]);
  }
  //return 0;
  return history.getMoveScore(player, ply, action);
}
// @ts-ignore
@inline
function encodeScore(action: u64, score: u32): u64 {
  return action | ((<u64>score) << 32);
}
// @ts-ignore
@inline
function decodeScore(action: u64): u32 {
  return <i8>(action >> 32);
}

export function sortMoves(player: i8, ply: i8, moves: u64[]): void {
  for (let index = 0; index < moves.length; index++) {
    const move = unchecked(moves[index]);
    const scoredMove = encodeScore(move, score(player, ply, move));
    unchecked((moves[index] = scoredMove));
  }
  // in place insertion sort
  for (let i = 1; i < moves.length; i++) {
    const move = unchecked(moves[i]);
    const score = decodeScore(move);
    let j = i - 1;
    while (j >= 0) {
      const otherMove = unchecked(moves[j]);
      if (decodeScore(otherMove) >= score) {
        break;
      }
      unchecked((moves[j + 1] = otherMove));
      j--;
    }
    unchecked((moves[j + 1] = move));
  }
}
