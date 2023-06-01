import { BitBoard, opponent } from "./bitboard";
import { sortCaptures } from "./capture-ordering";
import { canMove, removeCheckedBoardFrom } from "./engine";
import { addKingPseudoLegalCaptures } from "./king-move-generation";
import { addKnightPseudoLegalCaptures } from "./knight-move-generation";
import { MoveStack } from "./move-stack";
import { addPawnPseudoLegalCaptures } from "./pawn";
import {
  addBishopPseudoLegalCaptures,
  addQueenPseudoLegalCaptures,
  addRookPseudoLegalCaptures,
} from "./sliding-pieces-move-generation";
import { evaluate } from "./static-evaluation";
import { staticExchangeEvaluation } from "./static-exchange-evaluation";
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
      return -30000;
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

    const swapOffValue = staticExchangeEvaluation(board, player, capture);
    if (swapOffValue < 0) {
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

const moveStack = new MoveStack();
export function pseudoLegalCaptures(board: BitBoard, player: i8): StaticArray<u32> {
  addPawnPseudoLegalCaptures(moveStack, board, player);
  addKnightPseudoLegalCaptures(moveStack, board, player);
  addBishopPseudoLegalCaptures(moveStack, board, player);
  addRookPseudoLegalCaptures(moveStack, board, player);
  addQueenPseudoLegalCaptures(moveStack, board, player);
  addKingPseudoLegalCaptures(moveStack, board, player);
  return moveStack.flush();
}

export function legalCaptures(board: BitBoard, player: i8): BitBoard[] {
  const moves: StaticArray<u32> = pseudoLegalCaptures(board, player);
  sortCaptures(moves);

  return removeCheckedBoardFrom(moves, board, player);
}
