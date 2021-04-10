import {
  BitBoard,
  decodeCapturedPiece,
  decodeSrcPiece,
  opponent,
} from "./bitboard";
import { removeCheckedBoardFrom } from "./engine";
import { addKingPseudoLegalCaptures } from "./king-move-generation";
import { addKnightPseudoLegalCaptures } from "./knight-move-generation";
import { addPawnPseudoLegalCaptures } from "./pawn";
import {
  addBishopPseudoLegalCaptures,
  addQueenPseudoLegalCaptures,
  addRookPseudoLegalCaptures,
} from "./sliding-pieces-move-generation";
import { evaluate, PIECE_VALUES } from "./static-evaluation";

let counter: u64 = 0;

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
    const boardAfterCapture = unchecked(captures[index]);
    const score = -evaluateQuiescence(
      opponent(player),
      boardAfterCapture,
      -beta,
      -alphaUpdated,
      ply + 1
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

export function legalCaptures(board: BitBoard, player: i8): BitBoard[] {
  const moves: u64[] = [];

  addPawnPseudoLegalCaptures(moves, board, player);
  addKnightPseudoLegalCaptures(moves, board, player);
  addBishopPseudoLegalCaptures(moves, board, player);
  addRookPseudoLegalCaptures(moves, board, player);
  addQueenPseudoLegalCaptures(moves, board, player);
  addKingPseudoLegalCaptures(moves, board, player);

  return removeCheckedBoardFrom(
    moves, //.sort(compareCaptures_MVV_LVA),
    board,
    player
  );
}

function evaluateCapture(capture: u64): i32 {
  return (
    unchecked(PIECE_VALUES[decodeCapturedPiece(capture)]) +
    unchecked(PIECE_VALUES[decodeSrcPiece(capture)])
  );
}
export function compareCaptures_MVV_LVA(
  firstCapture: u64,
  secondCapture: u64
): i32 {
  return evaluateCapture(firstCapture) - evaluateCapture(secondCapture);
}
