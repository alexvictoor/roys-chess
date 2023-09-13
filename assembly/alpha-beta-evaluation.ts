import {
  BitBoard,
  decodeCaptureFlag,
  opponent,
  PAWN,
  QUEEN,
  ROOK,
  toNotation,
} from "./bitboard";
import { pseudoLegalMoves } from "./engine";
import { openingBookData } from "./generated-opening-book";
import { history } from "./history";
import { sortMoves } from "./move-ordering";
import { findMoveInOpeningBook } from "./opening-book";
import { evaluateQuiescence } from "./quiescence-evaluation";
import { evaluate, isPastStartGame, PIECE_VALUES } from "./static-evaluation";
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
let nodeVisited: u32 = 0;
let startTimestamp: i64 = 0;

const FUTILITY_FLAG = true;
const LMR_FLAG = true;
const NULL_FLAG = true;
const NULL_MOVE_MAX_REDUCTION: i8 = 4;
const NULL_MOVE_MIN_REDUCTION: i8 = 3;
const NULL_MOVE_REDUCTION: i8 = 4;

const TIMEOUT_IN_MS: i64 = 20000;
const TIMEOUT_SCORE = (i16.MIN_VALUE >> 2) + 42;

export function reset(): void {
  transpositionTable.reset() 
}

export function principalVariationSearch(
  player: i8,
  playerInCheck: boolean,
  board: BitBoard,
  depth: i8,
  alpha: i16 = i16.MIN_VALUE >> 1,
  beta: i16 = i16.MAX_VALUE >> 1,
  ply: i8 = 2,
  afterNullMove: boolean = false
): i16 {
  if (
    /*(nodeVisited & 16383) == 0 &&*/
    Date.now() - startTimestamp > TIMEOUT_IN_MS
  ) {
    return TIMEOUT_SCORE;
  }

  nodeVisited++;

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


  //trace("moves " + moves.map<string>((m) => toNotation(m)).join(" , "));


  //const playerInCheck = isInCheck(player, board);

  const nullMovePossible =
    !playerInCheck && !afterNullMove && NULL_FLAG;
  if (nullMovePossible) {
    board.doNullMove();

    const reduction =
      depth > 6 ? NULL_MOVE_MAX_REDUCTION : NULL_MOVE_MIN_REDUCTION;
    const nullMoveScore = -zeroWindowSearch(
      opponent(player),
      board,
      depth - reduction,
      -alpha,
      ply + 1
    );
    board.undoNullMove();
    if (nullMoveScore == -TIMEOUT_SCORE) {
      return TIMEOUT_SCORE;
    }
    if (nullMoveScore >= beta) {
      if (!isPastStartGame(board)) {
        // cutoff in case of fail-high
        return nullMoveScore;
      }
      // reduce the depth in case of fail-high
      depth -= NULL_MOVE_REDUCTION;
      afterNullMove = true;
      if (depth <= 0) {
        return evaluateQuiescence(player, board, alpha, beta);
      }
    }
  }

  let futilityPruningPossible: boolean =
    depth < 4 && !playerInCheck && FUTILITY_FLAG;
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
  let alphaUpdated: i16 = alpha;
  let bestScore: i16 = i16.MIN_VALUE >> 1;
  const hashMove = decodeMoveFromEntry(transpositionEntry);
  let bestMove: u32 = scoreType === EXACT_SCORE ? hashMove : 0;
  const moves = pseudoLegalMoves(board, player);
  sortMoves(board, player, ply, moves, hashMove);
  for (let index = 0; index < moves.length; index++) {
    const move = unchecked(moves[index]);
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    const isCapture = decodeCaptureFlag(move);
    const isOpponentInCheck = isInCheck(opponent(player), board);
    const swapOffValue = staticExchangeEvaluation(board, player, move);

    const depthNeeded =
      lateMoveReductionPossible && swapOffValue < 0 ? depth - 2 : depth - 1;

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
      fullyEvaluatedMoves > 4 &&
      LMR_FLAG
    ) {
      const reducedDepthScore = -zeroWindowSearch(
        opponent(player),
        board,
        depthNeeded - 1,
        -alphaUpdated,
        ply + 1,
      );

      if (reducedDepthScore == -TIMEOUT_SCORE) {
        board.undo();
        return TIMEOUT_SCORE;
      }

      if (reducedDepthScore <= alpha) {
        board.undo();
        continue;
      }
    }

    let score: i16;
    if (alphaUpdated > alpha) {
      score = -zeroWindowSearch(
        opponent(player),
        board,
        depth - 1,
        -alphaUpdated,
        ply + 1
      );
      if (score > alphaUpdated) {
        // search again
        score = -principalVariationSearch(
          opponent(player),
          isOpponentInCheck,
          board,
          depth - 1,
          -beta,
          -alphaUpdated,
          ply + 1,
          afterNullMove
        );
      }
    } else {
      score = -principalVariationSearch(
        opponent(player),
        isOpponentInCheck,
        board,
        depth - 1,
        -beta,
        -alphaUpdated,
        ply + 1,
        afterNullMove
      );
    }

    /*if (isCapture) {
      trace(
        "capture " +
          toNotation(move) +
          " " +
          score.toString() +
          " " +
          alphaUpdated.toString() +
          " " +
          h.toString()
      );
    } else {
      trace(
        "move " +
          toNotation(move) +
          " " +
          score.toString() +
          " " +
          alphaUpdated.toString() +
          " " +
          h.toString()
      );
    }*/
    board.undo();
    if (score == -TIMEOUT_SCORE) {
      return TIMEOUT_SCORE;
    }
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
  return bestScore;
}


export function zeroWindowSearch(
  player: i8,
  board: BitBoard,
  depth: i8,
  beta: i16,
  ply: i8,
): i16 {

  const alpha = beta - 1;

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


  for (let index = 0; index < moves.length; index++) {
    const move = unchecked(moves[index]);
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }

    const score = -zeroWindowSearch(
      opponent(player),
      board,
      depth - 1,
      -alpha,
      ply + 1,
    );

    board.undo();


    if (score >= beta) {
      return beta;
    }
  }

  return alpha;
}

export function chooseBestMove(player: i8, board: BitBoard, maxDepth: i8): u64 {
  history.resetHistory();
  //transpositionTable.reset();

  const bookMove = findMoveInOpeningBook(openingBookData, board);
  
  if (bookMove != 0) {
    return <u64>bookMove;
  }

  startTimestamp = Date.now();
  nodeVisited = 0;

  let bestMove: u32 = 0;
  const opponentPlayer = opponent(player);
  const moves = pseudoLegalMoves(board, player);

  for (let depth: i8 = 1; depth <= maxDepth; depth++) {
    let alpha: i16 = i16.MIN_VALUE >> 1;
    nodeVisited = 0;
    const startIterationTimestamp = Date.now();

    sortMoves(board, player, 1, moves, bestMove);

    let iterationBestMove: u32 = bestMove;
    for (let index = 0; index < moves.length; index++) {
      const move = unchecked(moves[index]);
      board.do(move);
      if (isInCheck(player, board)) {
        board.undo();
        continue;
      }
      const isOpponentInCheck = isInCheck(opponent(player), board);
      const score = -principalVariationSearch(
        opponentPlayer,
        isOpponentInCheck,
        board,
        depth,
        i16.MIN_VALUE >> 1,
        -alpha,
        2
      );
      board.undo();
      if (score == -TIMEOUT_SCORE && depth > 1) {
        trace(
          toNotation(move) +
            " " +
            score.toString() +
            " " +
            TIMEOUT_SCORE.toString()
        );
        return <u64>bestMove + ((<u64>depth) << 32);
      }
      if (score > alpha) {
        alpha = score;
        iterationBestMove = move;
      }
    }
    bestMove = iterationBestMove;
    const iterationDuration = Date.now() - startIterationTimestamp;
    trace(
      "depth " +
        depth.toString() +
        " " +
        nodeVisited.toString() +
        " " +
        iterationDuration.toString() +
        "ms " +
        toNotation(bestMove)
    );
  }

  return <u64>bestMove + ((<u64>maxDepth) << 32);
}

export function analyseBestMove(board: BitBoard, maxDepth: i8): u32[] {
  const moves: u32[] = [];
  let entry: u64 = 0;
  let depth: i8 = 0;
  do {
    entry = transpositionTable.getEntry(board);
    if (entry != 0) {
      const move = decodeMoveFromEntry(entry);
      moves.push(move);
      board.do(move);
    }
    depth++;
  } while (entry != 0 && depth < maxDepth);

  for (let index: i8 = 0; index < moves.length; index++) {
    board.undo();
  }

  return moves;
}
