import { BitBoard, opponent } from "./bitboard";
import { legalCaptures } from "./engine";
import { evaluate } from "./static-evaluation";

export function evaluateQuiescence(
  player: i8,
  board: BitBoard,
  alpha: i32 = i32.MIN_VALUE,
  beta: i32 = i32.MAX_VALUE
): i32 {
  const staticEvaluation = evaluate(player, board);
  let alphaUpdated: i32 = alpha;
  if (staticEvaluation >= beta) {
    // null move rule, if we go further score
    // might still increase
    return beta;
  }
  if (alpha < staticEvaluation) {
    alphaUpdated = staticEvaluation;
  }
  const captures = legalCaptures(board, player);
  for (let index = 0; index < captures.length; index++) {
    const boardAfterCapture = captures[index];
    const score = -evaluateQuiescence(
      opponent(player),
      boardAfterCapture,
      -beta,
      -alphaUpdated
    );
    if (score >= beta) {
      return beta;
    }
    if (score > alphaUpdated) {
      alphaUpdated = score;
    }
  }
  return alphaUpdated;
}
