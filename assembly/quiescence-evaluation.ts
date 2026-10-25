import { BitBoard, decodeCaptureFlag, opponent } from "./bitboard";
import { generatePseudoLegalCaptures, generatePseudoLegalMoves, removeCheckedBoardFrom } from "./engine";
import { quiescenceStackForPly } from "./move-stack";
import { sortCaptures, sortMoves } from "./move-ordering";
import { evaluate } from "./static-evaluation";
import { staticExchangeEvaluation } from "./static-exchange-evaluation";
import { isInCheck } from "./status";

const DELTA_PRUNING_THRESHOLD: i16 = 1000; // queen + pawn value
const MAX_QUIESCENCE_PLY: i32 = 48;

export const MATE_SCORE: i16 = 30000;

let EVASIONS_FLAG = true;
let SEE_PRUNING_FLAG = true;
export function setQuiescenceFeatures(evasions: boolean, seePruning: boolean): void {
  EVASIONS_FLAG = evasions;
  SEE_PRUNING_FLAG = seePruning;
}

let quiescenceNodes: u64 = 0;
export function getQuiescenceNodes(): u64 {
  return quiescenceNodes;
}
export function resetQuiescenceNodes(): void {
  quiescenceNodes = 0;
}

/**
 * Quiescence search: resolve captures (and check evasions) so that the static
 * evaluation is only taken on quiet positions.
 * `rootPly` is the distance from the root of the main search, used to score
 * mates; `ply` is the depth inside the quiescence search itself.
 */
export function evaluateQuiescence(
  player: i8,
  board: BitBoard,
  alpha: i16 = -MATE_SCORE,
  beta: i16 = MATE_SCORE,
  ply: i32 = 0,
  rootPly: i32 = 0
): i16 {
  quiescenceNodes++;

  const inCheck = isInCheck(player, board);
  if (EVASIONS_FLAG && inCheck && ply < MAX_QUIESCENCE_PLY) {
    return evaluateEvasions(player, board, alpha, beta, ply, rootPly);
  }

  const staticEvaluation = evaluate(player, board);
  if (staticEvaluation >= beta) {
    // stand pat: the side to move can already refuse to capture
    return beta;
  }
  if (staticEvaluation + DELTA_PRUNING_THRESHOLD < alpha) {
    // no capture can raise alpha
    return alpha;
  }
  let alphaUpdated: i16 = alpha;
  if (alpha < staticEvaluation) {
    alphaUpdated = staticEvaluation;
  }
  if (ply >= MAX_QUIESCENCE_PLY) {
    return alphaUpdated;
  }

  const stack = quiescenceStackForPly(ply);
  generatePseudoLegalCaptures(stack, board, player);
  sortCaptures(stack);
  const opponentPlayer = opponent(player);
  for (let index = 0; index < stack.count; index++) {
    const capture = stack.at(index);
    if (SEE_PRUNING_FLAG && staticExchangeEvaluation(board, player, capture) < 0) {
      // losing capture, not worth exploring
      continue;
    }
    board.do(capture);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const score = -evaluateQuiescence(
      opponentPlayer,
      board,
      -beta,
      -alphaUpdated,
      ply + 1,
      rootPly + 1
    );
    board.undo();
    if (score >= beta) {
      return beta;
    }
    if (score > alphaUpdated) {
      alphaUpdated = score;
    }
  }
  return alphaUpdated;
}

function evaluateEvasions(
  player: i8,
  board: BitBoard,
  alpha: i16,
  beta: i16,
  ply: i32,
  rootPly: i32
): i16 {
  const stack = quiescenceStackForPly(ply);
  generatePseudoLegalMoves(stack, board, player);
  sortMoves(board, player, 0, stack, 0);
  const opponentPlayer = opponent(player);
  let bestScore: i16 = -MATE_SCORE + <i16>rootPly; // checkmate unless a legal move exists
  let alphaUpdated: i16 = alpha;
  for (let index = 0; index < stack.count; index++) {
    const move = stack.at(index);
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const score = -evaluateQuiescence(
      opponentPlayer,
      board,
      -beta,
      -alphaUpdated,
      ply + 1,
      rootPly + 1
    );
    board.undo();
    if (score >= beta) {
      return beta;
    }
    if (score > bestScore) {
      bestScore = score;
      if (score > alphaUpdated) {
        alphaUpdated = score;
      }
    }
  }
  return bestScore;
}

/** Allocating helpers kept for tests. */
export function pseudoLegalCaptures(board: BitBoard, player: i8): StaticArray<u32> {
  const stack = quiescenceStackForPly(MAX_QUIESCENCE_PLY + 1);
  generatePseudoLegalCaptures(stack, board, player);
  return stack.flush();
}

export function legalCaptures(board: BitBoard, player: i8): BitBoard[] {
  const stack = quiescenceStackForPly(MAX_QUIESCENCE_PLY + 1);
  generatePseudoLegalCaptures(stack, board, player);
  sortCaptures(stack);
  const moves = stack.flush();
  return removeCheckedBoardFrom(moves, board, player);
}
