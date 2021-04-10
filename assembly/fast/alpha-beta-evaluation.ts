import { BitBoard, opponent } from "./bitboard";
import { legalMoves } from "./engine";
import { evaluateQuiescence } from "./quiescence-evaluation";

export function evaluatePosition(
  player: i8,
  board: BitBoard,
  depth: i8,
  alpha: i32 = i32.MIN_VALUE >> 1,
  beta: i32 = i32.MAX_VALUE >> 1
): i32 {
  //log("coucou");
  if (depth === 0) {
    //log("quiqui " + board.toString());
    return evaluateQuiescence(player, board, alpha, beta);
  }
  const moves = legalMoves(board, player);
  let alphaUpdated: i32 = alpha;
  //log("moves " + moves.length.toString());
  for (let index = 0; index < moves.length; index++) {
    const score = -evaluatePosition(
      opponent(player),
      unchecked(moves[index]),
      depth - 1,
      -beta,
      -alphaUpdated
    );
    if (score >= beta) {
      // pruning
      return beta;
    }
    if (score > alphaUpdated) {
      alphaUpdated = score;
    }
  }
  return alphaUpdated;
}

export function chooseBestMove(player: i8, board: BitBoard, depth: i8): u64 {
  const moves = legalMoves(board, player);
  let alpha: i32 = i32.MIN_VALUE >> 1;
  let bestBoard = moves[0];
  const opponentPlayer = opponent(player);
  for (let index = 0; index < moves.length; index++) {
    const score = -evaluatePosition(
      opponentPlayer,
      unchecked(moves[index]),
      depth,
      i32.MIN_VALUE >> 1,
      -alpha
    );
    if (score > alpha) {
      alpha = score;
      bestBoard = moves[index];
    }
  }
  return bestBoard.getPreviousMove();
}
