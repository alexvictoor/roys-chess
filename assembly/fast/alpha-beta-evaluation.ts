import { BitBoard, decodeCaptureFlag, opponent } from "./bitboard";
import { legalMoves, pseudoLegalMoves } from "./engine";
import { history } from "./history";
import { sortMoves } from "./move-ordering";
import { evaluateQuiescence } from "./quiescence-evaluation";
import { isInCheck } from "./status";

export function evaluatePosition(
  player: i8,
  board: BitBoard,
  depth: i8,
  alpha: i32 = i32.MIN_VALUE >> 1,
  beta: i32 = i32.MAX_VALUE >> 1,
  ply: i8 = 2
): i32 {
  if (depth == 0) {
    return evaluateQuiescence(player, board, alpha, beta);
  }
  //const moves = legalMoves(board, player);
  const moves = pseudoLegalMoves(board, player);
  sortMoves(player, ply, moves);
  let alphaUpdated: i32 = alpha;
  while (moves.length > 0) {
    const move = moves.pop();
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const score = -evaluatePosition(
      opponent(player),
      board,
      depth - 1,
      -beta,
      -alphaUpdated,
      ply + 1
    );
    board.undo();
    const isCapture = decodeCaptureFlag(move);
    if (!isCapture) {
      history.recordPlayedMove(player, ply, move);
    }
    // if (!capture) history.recordMovePlayed(player,ply, move)
    if (score >= beta) {
      // pruning
      // TODO record cutoff
      // if (!capture) history.recordCutoff(player,ply, move)
      if (!isCapture) {
        history.recordCutOffMove(player, ply, move);
      }
      return beta;
    }
    if (score > alphaUpdated) {
      alphaUpdated = score;
    }
  }
  return alphaUpdated;
}

export function chooseBestMove(player: i8, board: BitBoard, depth: i8): u64 {
  history.resetHistory();
  const moves = pseudoLegalMoves(board, player);
  sortMoves(player, 1, moves);
  let alpha: i32 = i32.MIN_VALUE >> 1;
  let bestMove: u64 = 0;
  const opponentPlayer = opponent(player);
  while (moves.length > 0) {
    const move = moves.pop();
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const score = -evaluatePosition(
      opponentPlayer,
      board,
      depth,
      i32.MIN_VALUE >> 1,
      -alpha,
      2
    );
    board.undo();
    if (score > alpha) {
      alpha = score;
      bestMove = move;
    }
  }
  return bestMove;
}
