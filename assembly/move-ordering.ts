import {
  BitBoard,
  decodeCapturedPiece,
  decodeCaptureFlag,
  decodeSrcPiece,
  toNotation,
} from "./bitboard";
import { history } from "./history";
import { staticExchangeEvaluation } from "./static-exchange-evaluation";

//const SCORES: i8[] = [1, 1, 3, 3, 4, 4, 5, 5, 9, 9, 10, 10];
const SCORES: i8[] = [1, 3, 4, 5, 9, 10];

const captureScores = new StaticArray<i16>(256);
for (let i = 0; i < SCORES.length; i++) {
  for (let j = 0; j < SCORES.length; j++) {
    captureScores[(i << 3) + j] = (SCORES[i] - SCORES[j]) * <i16>100; // + <i16>4096;
  }
}

export function captureScore(capture: u32): i16 {
  const srcPiece: i8 = decodeSrcPiece(capture) >> 1;
  const capturedPiece: i8 = decodeCapturedPiece(capture) >> 1;
  return unchecked(captureScores[(capturedPiece << 3) + srcPiece]);
}

export function score(player: i8, ply: i8, action: u32, bestMove: u32): i16 {
  if (action == bestMove) {
    return i16.MAX_VALUE;
  }

  const isCapture: i8 = decodeCaptureFlag(action);
  if (isCapture) {
    //return 4 * staticExchangeEvaluation(board, player, action);

    //return staticExchangeEvaluation(board, player, action);
    return captureScore(action);
  }
  return history.getMoveScore(player, ply, action);
}

const scores: StaticArray<i16> = new StaticArray<i16>(256);
export function sortMoves(
  player: i8,
  ply: i8,
  moves: StaticArray<u32>,
  bestMove: u32
): void {
  for (let index = 0; index < moves.length; index++) {
    const move = unchecked(moves[index]);
    unchecked((scores[index] = score(player, ply, move, bestMove)));
  }
  // in place insertion sort
  for (let i = 1; i < moves.length; i++) {
    const move = unchecked(moves[i]);
    const score = unchecked(scores[i]);
    let j = i - 1;
    while (j >= 0) {
      const otherMove = unchecked(moves[j]);
      const otherScore = unchecked(scores[j]);
      if (otherScore >= score) {
        break;
      }
      unchecked((moves[j + 1] = otherMove));
      unchecked((scores[j + 1] = otherScore));
      j--;
    }
    unchecked((moves[j + 1] = move));
    unchecked((scores[j + 1] = score));
  }
}
