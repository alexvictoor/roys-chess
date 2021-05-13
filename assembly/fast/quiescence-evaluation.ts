import { BitBoard, opponent } from "./bitboard";
import { sortCaptures } from "./capture-ordering";
import { canMove, removeCheckedBoardFrom } from "./engine";
import { addKingPseudoLegalCaptures } from "./king-move-generation";
import { addKnightPseudoLegalCaptures } from "./knight-move-generation";
import { addPawnPseudoLegalCaptures } from "./pawn";
import {
  addBishopPseudoLegalCaptures,
  addQueenPseudoLegalCaptures,
  addRookPseudoLegalCaptures,
} from "./sliding-pieces-move-generation";
import { evaluate } from "./static-evaluation";
import { isInCheck } from "./status";

const DELTA_PRUNING_THRESHOLD: i16 = 1000; // queen + pawn value

export function evaluateQuiescence(
  player: i8,
  board: BitBoard,
  alpha: i16 = i16.MIN_VALUE,
  beta: i16 = i16.MAX_VALUE,
  ply: i32 = 0
): i16 {
  /*log(player);
  log(board.toFEN());
  log(alpha);
  log(beta);*/

  // cannot move ?
  // checked ?
  if (!canMove(board, player)) {
    if (isInCheck(player, board)) {
      return -10000;
    }
    return 0;
  }

  const staticEvaluation = evaluate(player, board);
  let alphaUpdated: i16 = alpha;
  if (staticEvaluation >= beta) {
    // null move rule, if we go further score
    // might still increase
    return beta;
  }

  if (staticEvaluation + DELTA_PRUNING_THRESHOLD < alpha) {
    // no chance to raise alpha
    return alpha;
  }

  if (alpha < staticEvaluation) {
    alphaUpdated = staticEvaluation;
  }

  /*if (ply > 4) {
    return alphaUpdated;
  }*/

  const captureMoves = pseudoLegalCaptures(board, player);
  sortCaptures(captureMoves);
  for (let index = 0; index < captureMoves.length; index++) {
    const capture = unchecked(captureMoves[index]);
    board.do(capture);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const score = -evaluateQuiescence(
      opponent(player),
      board,
      -beta,
      -alphaUpdated,
      ply + 1
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

export function pseudoLegalCaptures(board: BitBoard, player: i8): u32[] {
  const moves: u32[] = [];
  addPawnPseudoLegalCaptures(moves, board, player);
  addKnightPseudoLegalCaptures(moves, board, player);
  addBishopPseudoLegalCaptures(moves, board, player);
  addRookPseudoLegalCaptures(moves, board, player);
  addQueenPseudoLegalCaptures(moves, board, player);
  addKingPseudoLegalCaptures(moves, board, player);
  return moves;
}

export function legalCaptures(board: BitBoard, player: i8): BitBoard[] {
  const moves: u32[] = pseudoLegalCaptures(board, player);
  sortCaptures(moves);

  return removeCheckedBoardFrom(moves, board, player);
}
