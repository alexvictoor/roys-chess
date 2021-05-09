import { BitBoard, decodeCaptureFlag, opponent } from "./bitboard";
import { pseudoLegalMoves } from "./engine";
import { history } from "./history";
import { sortMoves } from "./move-ordering";
import { evaluateQuiescence } from "./quiescence-evaluation";
import { isInCheck } from "./status";
import {
  ALPHA_SCORE,
  BETA_SCORE,
  decodeDepthFromEntry,
  decodeMoveFromEntry,
  decodeScoreFromEntry,
  decodeScoreTypeFromEntry,
  EXACT_SCORE,
  TranspositionTable,
} from "./transposition-table";

let transpositionTable: TranspositionTable = new TranspositionTable(1);

export function evaluatePosition(
  player: i8,
  board: BitBoard,
  depth: i8,
  alpha: i16 = i16.MIN_VALUE >> 1,
  beta: i16 = i16.MAX_VALUE >> 1,
  ply: i8 = 2
): i16 {
  if (depth == 0) {
    return evaluateQuiescence(player, board, alpha, beta);
  }

  const transpositionEntry = transpositionTable.getEntry(board);
  const scoreType = decodeScoreTypeFromEntry(transpositionEntry);
  const transpositionDepth = decodeDepthFromEntry(transpositionEntry);
  if (transpositionDepth >= depth) {
    if (scoreType === EXACT_SCORE) {
      return decodeScoreFromEntry(transpositionEntry);
    }
    const score = decodeScoreFromEntry(transpositionEntry);
    if (scoreType === ALPHA_SCORE && score <= alpha) {
      return alpha;
    }
    if (scoreType === BETA_SCORE && score >= beta) {
      return beta;
    }
  }

  let bestMove: u32 =
    scoreType === EXACT_SCORE ? decodeMoveFromEntry(transpositionEntry) : 0;
  const moves = pseudoLegalMoves(board, player);
  sortMoves(player, ply, moves, bestMove);
  let alphaUpdated: i16 = alpha;
  let bestScore: i16 = i16.MIN_VALUE >> 1;

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
      // TODO record score   beta  / lower bound ?
      transpositionTable.record(board, move, beta, BETA_SCORE, depth);
      return beta;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
      if (score > alphaUpdated) {
        // upper bound ?
        alphaUpdated = score;
      }
    }
  }
  // TODO pv ? record alphaUpdated pv si updated sinon alpha
  if (bestMove > 0) {
    const scoreType = alphaUpdated != alpha ? EXACT_SCORE : ALPHA_SCORE;
    transpositionTable.record(board, bestMove, bestScore, scoreType, depth);
  }
  return alphaUpdated;
}

export function chooseBestMove(player: i8, board: BitBoard, maxDepth: i8): u32 {
  history.resetHistory();
  transpositionTable.reset();

  let alpha: i16 = i16.MIN_VALUE >> 1;
  let bestMove: u32 = 0;
  const opponentPlayer = opponent(player);

  for (let depth: i8 = 1; depth <= maxDepth; depth++) {
    const startIterationTimestamp = Date.now();
    const transpositionEntry = transpositionTable.getEntry(board);
    bestMove = decodeMoveFromEntry(transpositionEntry);
    const moves = pseudoLegalMoves(board, player);
    sortMoves(player, 1, moves, bestMove);
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
        i16.MIN_VALUE >> 1,
        -alpha,
        2
      );
      board.undo();
      if (score > alpha) {
        alpha = score;
        bestMove = move;
      }
    }
    transpositionTable.record(board, bestMove, alpha, EXACT_SCORE, depth);
    const iterationDuration = Date.now() - startIterationTimestamp;
    if (iterationDuration > 3000 && depth > 5) {
      return bestMove;
    }
  }
  return bestMove;
}
