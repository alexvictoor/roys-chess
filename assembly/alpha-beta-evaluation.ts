import {
  BitBoard,
  decodeCaptureFlag,
  opponent,
  PAWN,
  QUEEN,
  ROOK,
} from "./bitboard";
import { pseudoLegalMoves } from "./engine";
import { history } from "./history";
import { sortMoves } from "./move-ordering";
import { evaluateQuiescence } from "./quiescence-evaluation";
import {
  evaluate,
  isPastMiddleGame,
  isPastStartGame,
  PIECE_VALUES,
} from "./static-evaluation";
import { staticExchangeEvaluation } from "./static-exchange-evaluation";
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

const NULL_MOVE_MAX_REDUCTION: i8 = 4;
const NULL_MOVE_MIN_REDUCTION: i8 = 3;
const NULL_MOVE_REDUCTION: i8 = 4;

export function evaluatePosition(
  player: i8,
  playerInCheck: boolean,
  board: BitBoard,
  depth: i8,
  alpha: i16 = i16.MIN_VALUE >> 1,
  beta: i16 = i16.MAX_VALUE >> 1,
  ply: i8 = 2,
  afterNullMove: boolean = false
): i16 {
  if (depth <= 0) {
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
  sortMoves(board, player, ply, moves, bestMove);
  let alphaUpdated: i16 = alpha;
  let bestScore: i16 = i16.MIN_VALUE >> 1;

  //const playerInCheck = isInCheck(player, board);
  const inPVSearch = beta - alpha > 1;

  const nullMovePossible = !playerInCheck && !afterNullMove && inPVSearch;
  if (nullMovePossible) {
    board.doNullMove();

    const reduction =
      depth > 6 ? NULL_MOVE_MAX_REDUCTION : NULL_MOVE_MIN_REDUCTION;
    const nullMoveScore = -evaluatePosition(
      opponent(player),
      false,
      board,
      depth - reduction,
      -beta,
      -beta + 1,
      ply + 1,
      false
    );
    board.undoNullMove();
    if (nullMoveScore >= beta) {
      if (!isPastStartGame(board)) {
        // cutoff in case of fail-high
        return nullMoveScore;
      }
      // reduce the depth in case of fail-high
      depth -= NULL_MOVE_REDUCTION;
      if (depth <= 0) {
        return evaluateQuiescence(player, board, alpha, beta);
      }
      return nullMoveScore;
    }
  }

  let futilityPruningPossible = depth < 4 && !playerInCheck && inPVSearch;
  let futilityScore: i16 = i16.MIN_VALUE >> 1;
  if (futilityPruningPossible) {
    const staticEvaluation = evaluate(player, board);
    futilityScore = staticEvaluation;
    if (depth === 1) {
      futilityScore += unchecked(PIECE_VALUES[PAWN]);
    } else if (depth === 2) {
      futilityScore += unchecked(PIECE_VALUES[ROOK]);
    } else {
      futilityScore += unchecked(PIECE_VALUES[QUEEN]);
    }
    futilityPruningPossible = futilityScore <= alpha;
  }
  let lateMoveReductionPossible = depth > 2 && !playerInCheck;

  let fullyEvaluatedMoves: i8 = 0;
  while (moves.length > 0) {
    const move = moves.pop();
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const isCapture = decodeCaptureFlag(move);
    const isOpponentInCheck = isInCheck(opponent(player), board);
    const staticExchangeEvaluationScore = staticExchangeEvaluation(
      board,
      player,
      move
    );

    const depthNeeded =
      lateMoveReductionPossible && staticExchangeEvaluationScore < 0
        ? depth - 2
        : depth - 1;

    if (futilityPruningPossible && !isCapture && !isOpponentInCheck) {
      if (bestScore < futilityScore) {
        bestScore = futilityScore;
      }
      board.undo();
      continue;
    }

    if (
      lateMoveReductionPossible &&
      !isCapture &&
      !isOpponentInCheck &&
      fullyEvaluatedMoves > 4
    ) {
      const reducedDepthScore = -evaluatePosition(
        opponent(player),
        isOpponentInCheck,
        board,
        depthNeeded - 1,
        -alphaUpdated - 1,
        -alphaUpdated,
        ply + 1,
        false
      );
      if (reducedDepthScore <= alpha) {
        board.undo();
        continue;
      }
    }

    const score = -evaluatePosition(
      opponent(player),
      isOpponentInCheck,
      board,
      depthNeeded,
      -beta,
      -alphaUpdated,
      ply + 1,
      false
    );
    board.undo();
    fullyEvaluatedMoves++;
    if (!isCapture) {
      history.recordPlayedMove(player, ply, move);
    }
    // if (!capture) history.recordMovePlayed(player,ply, move)
    if (score >= beta) {
      // pruning
      // TODO record cutoff
      // if (!capture) history.recordCutoff(player,ply, move)
      if (!isCapture) {
        history.recordCutOffMove(player, ply, depth, move);
      }
      // TODO record score   beta  / lower bound ?
      if (inPVSearch) {
        transpositionTable.record(board, move, beta, BETA_SCORE, depth);
      }
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
  if (bestMove > 0 && inPVSearch) {
    const scoreType = alphaUpdated != alpha ? EXACT_SCORE : ALPHA_SCORE;
    transpositionTable.record(board, bestMove, bestScore, scoreType, depth);
  }
  return alphaUpdated;
}

export function chooseBestMove(player: i8, board: BitBoard, maxDepth: i8): u64 {
  history.resetHistory();
  transpositionTable.reset();

  const startTimestamp = Date.now();

  let bestMove: u32 = 0;
  const opponentPlayer = opponent(player);
  let alpha: i16 = i16.MIN_VALUE >> 2;

  for (let depth: i8 = 1; depth <= maxDepth; depth++) {
    const startIterationTimestamp = Date.now();
    const transpositionEntry = transpositionTable.getEntry(board);
    bestMove = decodeMoveFromEntry(transpositionEntry);
    const moves = pseudoLegalMoves(board, player);
    sortMoves(board, player, 1, moves, bestMove);
    while (moves.length > 0) {
      const move = moves.pop();
      board.do(move);
      if (isInCheck(player, board)) {
        board.undo();
        continue;
      }
      const isOpponentInCheck = isInCheck(opponent(player), board);
      const score = -evaluatePosition(
        opponentPlayer,
        isOpponentInCheck,
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
    const totalDuration = Date.now() - startTimestamp;
    if (/*(iterationDuration > 3000 && depth > 5) ||*/ totalDuration > 10000) {
      return <u64>bestMove + ((<u64>depth) << 32);
    }
  }
  return <u64>bestMove + ((<u64>maxDepth) << 32);
}

export function analyseBestMove(board: BitBoard): u32[] {
  const moves: u32[] = [];
  let entry: u64 = 0;
  do {
    entry = transpositionTable.getEntry(board);
    //log("entry " + entry.toString());
    if (entry != 0) {
      const move = decodeMoveFromEntry(entry);
      /*log(
        decodeScoreTypeFromEntry(entry).toString() +
          " " +
          decodeDepthFromEntry(entry).toString()
      );*/
      //log(decodeDepthFromEntry(entry));
      moves.push(move);
      board.do(move);
    }
  } while (entry != 0);

  for (let index: i8 = 0; index < moves.length; index++) {
    board.undo();
  }

  return moves;
}
