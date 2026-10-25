import {
  BitBoard,
  decodeCaptureFlag,
  decodeDestPiece,
  decodeSrcPiece,
  opponent,
  toNotation,
} from "./bitboard";
import { generatePseudoLegalMoves } from "./engine";
import { openingBookData } from "./generated-opening-book";
import { history } from "./history";
import { MAX_PLY, moveStackForPly } from "./move-stack";
import { sortMoves } from "./move-ordering";
import { findMoveInOpeningBook } from "./opening-book";
import { evaluateQuiescence, MATE_SCORE, resetQuiescenceNodes, setQuiescenceFeatures } from "./quiescence-evaluation";
import { evaluate } from "./static-evaluation";
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

// ---------------------------------------------------------------------------
// Search parameters
// ---------------------------------------------------------------------------
const INFINITY_SCORE: i16 = 32000;
export const MATE_BOUND: i16 = MATE_SCORE - 2 * <i16>MAX_PLY; // |score| above this is a mate

let NULL_MOVE_FLAG = true;
let LMR_FLAG = true;
let FUTILITY_FLAG = true;
let CHECK_EXTENSION_FLAG = true;

/** Toggle search features (bit 0 null move, 1 LMR, 2 futility, 3 check extension). */
export function setSearchFeatures(mask: i32): void {
  NULL_MOVE_FLAG = (mask & 1) != 0;
  LMR_FLAG = (mask & 2) != 0;
  FUTILITY_FLAG = (mask & 4) != 0;
  CHECK_EXTENSION_FLAG = (mask & 8) != 0;
  setQuiescenceFeatures((mask & 16) != 0, (mask & 32) != 0);
}

// futility margins by remaining depth (index 0 unused)
const FUTILITY_MARGINS = StaticArray.fromArray<i16>([0, 120, 300, 500]);
const LMR_FULL_DEPTH_MOVES: i32 = 3; // moves searched at full depth before reducing
const NODES_BETWEEN_CLOCK_CHECKS: u64 = 2047; // mask, power of two - 1

// ---------------------------------------------------------------------------
// Search state
// ---------------------------------------------------------------------------
let transpositionTable: TranspositionTable = new TranspositionTable(1);
let nodeVisited: u32 = 0;
let startTimestamp: i64 = 0;
let TIMEOUT_IN_MS: i64 = 20000;
let abortSearch: boolean = false;
let completedDepth: i8 = 0;
let totalNodes: u64 = 0;
let lastSearchDepth: i8 = 0;
let lastSearchScore: i16 = 0;

export function setSearchTimeout(ms: i64): void {
  TIMEOUT_IN_MS = ms;
}
export function getTotalNodes(): u64 {
  return totalNodes;
}
export function getLastSearchDepth(): i8 {
  return lastSearchDepth;
}
export function getLastSearchScore(): i16 {
  return lastSearchScore;
}

export function reset(): void {
  transpositionTable.reset();
  history.resetHistory();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
@inline
function checkClock(): void {
  if ((totalNodes & NODES_BETWEEN_CLOCK_CHECKS) == 0 && completedDepth >= 1) {
    if (Date.now() - startTimestamp > TIMEOUT_IN_MS) {
      abortSearch = true;
    }
  }
}

/** Mate scores are stored relative to the node, searched relative to the root. */
@inline
function scoreToTranspositionTable(score: i16, ply: i8): i16 {
  if (score >= MATE_BOUND) {
    return score + ply;
  }
  if (score <= -MATE_BOUND) {
    return score - ply;
  }
  return score;
}
@inline
function scoreFromTranspositionTable(score: i16, ply: i8): i16 {
  if (score >= MATE_BOUND) {
    return score - ply;
  }
  if (score <= -MATE_BOUND) {
    return score + ply;
  }
  return score;
}

@inline
function hasNonPawnMaterial(board: BitBoard, player: i8): boolean {
  return !!(
    board.getKnightMask(player) |
    board.getBishopMask(player) |
    board.getRookMask(player) |
    board.getQueenMask(player)
  );
}

/** Draw by repetition (2-fold within the search, including game history) or 50 moves rule. */
function isDrawByRule(board: BitBoard): boolean {
  const clock = <i32>board.getHalfMoveClock();
  if (clock >= 100) {
    return true;
  }
  if (clock < 4) {
    return false;
  }
  const hash = board.hashCode();
  const hashHistory = board.hashHistory;
  let index = hashHistory.length - 2;
  let limit = hashHistory.length - clock;
  if (limit < 0) {
    limit = 0;
  }
  while (index >= limit) {
    if (unchecked(hashHistory[index]) == hash) {
      return true;
    }
    index -= 2;
  }
  return false;
}

@inline
function isPromotion(move: u32): boolean {
  return decodeSrcPiece(move) != decodeDestPiece(move);
}

// ---------------------------------------------------------------------------
// Main search: principal variation search with a shared implementation for
// PV nodes (open window) and zero window nodes (beta == alpha + 1).
// ---------------------------------------------------------------------------
export function search(
  player: i8,
  playerInCheck: boolean,
  board: BitBoard,
  depth: i8,
  alpha: i16,
  beta: i16,
  ply: i8,
  nullMoveAllowed: boolean
): i16 {
  if (abortSearch) {
    return 0;
  }
  nodeVisited++;
  totalNodes++;
  checkClock();

  // computed in i32: (beta - alpha) can exceed the i16 range near the root
  const pvNode = <i32>beta - <i32>alpha > 1;

  if (CHECK_EXTENSION_FLAG && playerInCheck) {
    depth++;
  }

  if (depth <= 0) {
    return evaluateQuiescence(player, board, alpha, beta, 0, ply);
  }

  if (ply >= <i8>(MAX_PLY - 2)) {
    return evaluate(player, board);
  }

  if (ply > 0 && isDrawByRule(board)) {
    return 0;
  }

  // mate distance pruning
  const mateAlpha: i16 = -MATE_SCORE + ply;
  const mateBeta: i16 = MATE_SCORE - ply - 1;
  if (alpha < mateAlpha) {
    alpha = mateAlpha;
  }
  if (beta > mateBeta) {
    beta = mateBeta;
  }
  if (alpha >= beta) {
    return alpha;
  }

  // transposition table probe
  const transpositionEntry = transpositionTable.getEntry(board);
  let hashMove: u32 = 0;
  if (transpositionEntry != 0) {
    hashMove = decodeMoveFromEntry(transpositionEntry);
    if (decodeDepthFromEntry(transpositionEntry) >= depth) {
      const scoreType = decodeScoreTypeFromEntry(transpositionEntry);
      const transpositionScore = scoreFromTranspositionTable(
        decodeScoreFromEntry(transpositionEntry),
        ply
      );
      if (scoreType === EXACT_SCORE) {
        return transpositionScore;
      }
      if (!pvNode) {
        if (scoreType === ALPHA_SCORE && transpositionScore <= alpha) {
          return transpositionScore;
        }
        if (scoreType === BETA_SCORE && transpositionScore >= beta) {
          return transpositionScore;
        }
      }
    }
  }

  const opponentPlayer = opponent(player);
  let staticEvaluation: i16 = 0;
  const needStaticEvaluation = !playerInCheck && (!pvNode || depth <= 3);
  if (needStaticEvaluation) {
    staticEvaluation = evaluate(player, board);
  }

  // null move pruning: if passing still fails high, the position is too good
  if (
    NULL_MOVE_FLAG &&
    !pvNode &&
    !playerInCheck &&
    nullMoveAllowed &&
    depth >= 2 &&
    staticEvaluation >= beta &&
    hasNonPawnMaterial(board, player)
  ) {
    const reduction: i8 = depth > 6 ? 3 : 2;
    board.doNullMove();
    const nullMoveScore = -search(
      opponentPlayer,
      false,
      board,
      depth - 1 - reduction,
      -beta,
      -beta + 1,
      ply + 1,
      false
    );
    board.undoNullMove();
    if (abortSearch) {
      return 0;
    }
    if (nullMoveScore >= beta) {
      // do not trust mate scores coming out of a null move
      return nullMoveScore >= MATE_BOUND ? beta : nullMoveScore;
    }
  }

  // futility pruning: near the horizon, quiet moves cannot recover a big deficit
  let futilityPruning = false;
  let futilityScore: i16 = 0;
  if (FUTILITY_FLAG && !pvNode && !playerInCheck && depth <= 3) {
    futilityScore = staticEvaluation + unchecked(FUTILITY_MARGINS[depth]);
    futilityPruning = futilityScore <= alpha;
  }

  const stack = moveStackForPly(ply);
  generatePseudoLegalMoves(stack, board, player);
  sortMoves(board, player, ply, stack, hashMove);

  let bestScore: i16 = -INFINITY_SCORE;
  let bestMove: u32 = 0;
  let alphaUpdated: i16 = alpha;
  let legalMoves: i32 = 0;
  const newDepth: i8 = depth - 1;

  for (let index = 0; index < stack.count; index++) {
    const move = stack.at(index);
    board.do(move);
    if (isInCheck(player, board)) {
      board.undo();
      continue;
    }
    legalMoves++;
    const isQuiet = !decodeCaptureFlag(move) && !isPromotion(move);
    const givesCheck = isInCheck(opponentPlayer, board);

    if (futilityPruning && isQuiet && !givesCheck && legalMoves > 1) {
      board.undo();
      if (futilityScore > bestScore) {
        bestScore = futilityScore;
      }
      continue;
    }

    let score: i16;
    if (legalMoves == 1) {
      score = -search(
        opponentPlayer,
        givesCheck,
        board,
        newDepth,
        -beta,
        -alphaUpdated,
        ply + 1,
        true
      );
    } else {
      // late move reductions for quiet, non-checking moves ordered late
      let reduction: i8 = 0;
      if (
        LMR_FLAG &&
        depth >= 3 &&
        isQuiet &&
        !givesCheck &&
        !playerInCheck &&
        legalMoves > LMR_FULL_DEPTH_MOVES &&
        !history.isKiller(ply, move)
      ) {
        reduction = legalMoves > 8 && depth >= 5 ? 2 : 1;
      }
      score = -search(
        opponentPlayer,
        givesCheck,
        board,
        newDepth - reduction,
        -alphaUpdated - 1,
        -alphaUpdated,
        ply + 1,
        true
      );
      if (!abortSearch && reduction > 0 && score > alphaUpdated) {
        // the reduced search failed high: verify at full depth
        score = -search(
          opponentPlayer,
          givesCheck,
          board,
          newDepth,
          -alphaUpdated - 1,
          -alphaUpdated,
          ply + 1,
          true
        );
      }
      if (!abortSearch && pvNode && score > alphaUpdated && score < beta) {
        // new best move in a PV node: search it with the full window
        score = -search(
          opponentPlayer,
          givesCheck,
          board,
          newDepth,
          -beta,
          -alphaUpdated,
          ply + 1,
          true
        );
      }
    }
    board.undo();
    if (abortSearch) {
      return 0;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
      if (score > alphaUpdated) {
        alphaUpdated = score;
        if (score >= beta) {
          if (isQuiet) {
            history.recordCutOffMove(player, ply, depth, move);
          }
          transpositionTable.record(
            board,
            move,
            scoreToTranspositionTable(score, ply),
            BETA_SCORE,
            depth
          );
          return score;
        }
      }
    }
  }

  if (legalMoves == 0) {
    // checkmate or stalemate
    return playerInCheck ? -MATE_SCORE + ply : 0;
  }

  transpositionTable.record(
    board,
    bestMove,
    scoreToTranspositionTable(bestScore, ply),
    alphaUpdated > alpha ? EXACT_SCORE : ALPHA_SCORE,
    depth
  );
  return bestScore;
}

// ---------------------------------------------------------------------------
// Root: iterative deepening
// ---------------------------------------------------------------------------
export function chooseBestMove(player: i8, board: BitBoard, maxDepth: i8): u64 {
  history.ageHistory();
  transpositionTable.newSearch();

  const bookMove = findMoveInOpeningBook(openingBookData, board);
  if (bookMove != 0) {
    return <u64>bookMove;
  }

  startTimestamp = Date.now();
  abortSearch = false;
  completedDepth = 0;
  totalNodes = 0;
  lastSearchDepth = 0;
  lastSearchScore = 0;
  resetQuiescenceNodes();

  const opponentPlayer = opponent(player);
  const stack = moveStackForPly(0);
  generatePseudoLegalMoves(stack, board, player);

  let bestMove: u32 = 0;
  let bestScore: i16 = 0;

  for (let depth: i8 = 1; depth <= maxDepth; depth++) {
    nodeVisited = 0;
    const startIterationTimestamp = Date.now();
    sortMoves(board, player, 0, stack, bestMove);

    let alpha: i16 = -INFINITY_SCORE;
    const beta: i16 = INFINITY_SCORE;
    let iterationBestMove: u32 = 0;
    let iterationBestScore: i16 = -INFINITY_SCORE;
    let firstMove: u32 = 0;
    let legalMoves: i32 = 0;

    for (let index = 0; index < stack.count; index++) {
      const move = stack.at(index);
      board.do(move);
      if (isInCheck(player, board)) {
        board.undo();
        continue;
      }
      legalMoves++;
      const givesCheck = isInCheck(opponentPlayer, board);
      let score: i16;
      if (legalMoves == 1) {
        firstMove = move;
        score = -search(opponentPlayer, givesCheck, board, depth - 1, -beta, -alpha, 1, true);
      } else {
        score = -search(opponentPlayer, givesCheck, board, depth - 1, -alpha - 1, -alpha, 1, true);
        if (!abortSearch && score > alpha) {
          score = -search(opponentPlayer, givesCheck, board, depth - 1, -beta, -alpha, 1, true);
        }
      }
      board.undo();
      if (abortSearch) {
        break;
      }
      if (score > iterationBestScore) {
        iterationBestScore = score;
        iterationBestMove = move;
        if (score > alpha) {
          alpha = score;
        }
      }
    }

    if (abortSearch) {
      // partial iteration: a later move that beat the previous best move at
      // this depth is still a sound improvement
      if (iterationBestMove != 0 && iterationBestMove != firstMove) {
        bestMove = iterationBestMove;
        bestScore = iterationBestScore;
      }
      break;
    }

    bestMove = iterationBestMove;
    bestScore = iterationBestScore;
    completedDepth = depth;
    transpositionTable.record(board, bestMove, scoreToTranspositionTable(bestScore, 0), EXACT_SCORE, depth);

    const iterationDuration = Date.now() - startIterationTimestamp;
    trace(
      "depth " +
        depth.toString() +
        " " +
        nodeVisited.toString() +
        " " +
        iterationDuration.toString() +
        "ms " +
        toNotation(bestMove) +
        " " +
        bestScore.toString()
    );

    if (bestScore >= MATE_BOUND && depth >= <i8>(MATE_SCORE - bestScore)) {
      // the mate is fully resolved, deeper search cannot improve it
      break;
    }
  }

  lastSearchDepth = completedDepth;
  lastSearchScore = bestScore;
  return <u64>bestMove + ((<u64>completedDepth) << 32);
}

export function analyseBestMove(board: BitBoard, maxDepth: i8): u32[] {
  const moves: u32[] = [];
  let entry: u64 = 0;
  let depth: i8 = 0;
  do {
    entry = transpositionTable.getEntry(board);
    if (entry != 0) {
      const move = decodeMoveFromEntry(entry);
      if (move == 0) {
        break;
      }
      moves.push(move);
      board.do(move);
    }
    depth++;
  } while (entry != 0 && depth < maxDepth);

  for (let index = 0; index < moves.length; index++) {
    board.undo();
  }

  return moves;
}
