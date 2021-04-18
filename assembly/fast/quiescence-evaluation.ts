import {
  BitBoard,
  decodeCapturedPiece,
  decodeSrcPiece,
  opponent,
} from "./bitboard";
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
import { evaluate, PIECE_VALUES } from "./static-evaluation";
import { isInCheck } from "./status";

export function evaluateQuiescence(
  player: i8,
  board: BitBoard,
  alpha: i32 = i32.MIN_VALUE,
  beta: i32 = i32.MAX_VALUE,
  ply: i32 = 0
): i32 {
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
  let alphaUpdated: i32 = alpha;
  if (staticEvaluation >= beta) {
    // null move rule, if we go further score
    // might still increase
    return beta;
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

export function pseudoLegalCaptures(board: BitBoard, player: i8): u64[] {
  const moves: u64[] = [];
  addPawnPseudoLegalCaptures(moves, board, player);
  addKnightPseudoLegalCaptures(moves, board, player);
  addBishopPseudoLegalCaptures(moves, board, player);
  addRookPseudoLegalCaptures(moves, board, player);
  addQueenPseudoLegalCaptures(moves, board, player);
  addKingPseudoLegalCaptures(moves, board, player);
  return moves;
}

export function legalCaptures(board: BitBoard, player: i8): BitBoard[] {
  const moves: u64[] = pseudoLegalCaptures(board, player);
  sortCaptures(moves);

  return removeCheckedBoardFrom(
    moves, //.sort(compareCaptures_MVV_LVA),
    board,
    player
  );
}
/*
export function compareCaptures_MVV_LVA(
  firstCapture: u64,
  secondCapture: u64
): i32 {
  return scoreCapture(firstCapture) - scoreCapture(secondCapture);
}*/
