import {
  BitBoard,
  decodeCapturedPiece,
  decodeCaptureFlag,
  decodeDestPiece,
  decodeFromPosition,
  decodeToPosition,
  opponent,
} from "./bitboard";
import { kingMoves } from "./king-move-generation";
import { knightMovesFromCache } from "./knight-move-generation";
import { pawnAttacks } from "./pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "./sliding-pieces-move-generation";

// absolute piece values by piece code (white/black share the same value)
const SEE_VALUES = StaticArray.fromArray<i16>([
  100, 100, 320, 320, 330, 330, 500, 500, 900, 900, 20000, 20000,
]);

function attackingPawns(
  positionMask: u64,
  player: i8,
  board: BitBoard,
  blockerMask: u64
): u64 {
  const opponentPlayer = opponent(player);
  const pawnMask = board.getPawnMask(player);
  return pawnAttacks(opponentPlayer, positionMask) & pawnMask & blockerMask;
}
function attackingKnights(
  position: i8,
  player: i8,
  board: BitBoard,
  blockerMask: u64
): u64 {
  const knightMask = board.getKnightMask(player);
  return knightMask & knightMovesFromCache(position) & blockerMask;
}
function attackingBishops(
  position: i8,
  player: i8,
  board: BitBoard,
  blockerMask: u64
): u64 {
  const bishopMask = board.getBishopMask(player);
  return bishopMask & bishopMoves(blockerMask, position) & blockerMask;
}
function attackingRooks(
  position: i8,
  player: i8,
  board: BitBoard,
  blockerMask: u64
): u64 {
  const rookMask = board.getRookMask(player);
  return rookMask & rookMoves(blockerMask, position) & blockerMask;
}
function attackingQueens(
  position: i8,
  player: i8,
  board: BitBoard,
  blockerMask: u64
): u64 {
  const queenMask = board.getQueenMask(player);
  return queenMask & queenMoves(blockerMask, position) & blockerMask;
}
function attackingKings(position: i8, player: i8, board: BitBoard, blockerMask: u64): u64 {
  const kingMask = board.getKingMask(player);
  return kingMask & kingMoves(position) & blockerMask;
}

/**
 * Least valuable piece of `player` attacking `position`, considering only the
 * pieces still present in `blockerMask` (removed pieces reveal x-ray attacks).
 */
export function findSmallerAttackerPosition(
  board: BitBoard,
  player: i8,
  position: i8,
  blockerMask: u64
): i8 {
  const positionMask = (<u64>1) << position;
  const pawns = attackingPawns(positionMask, player, board, blockerMask);
  if (!!pawns) {
    return <i8>ctz(pawns);
  }
  const knights = attackingKnights(position, player, board, blockerMask);
  if (!!knights) {
    return <i8>ctz(knights);
  }
  const bishops = attackingBishops(position, player, board, blockerMask);
  if (!!bishops) {
    return <i8>ctz(bishops);
  }
  const rooks = attackingRooks(position, player, board, blockerMask);
  if (!!rooks) {
    return <i8>ctz(rooks);
  }
  const queens = attackingQueens(position, player, board, blockerMask);
  if (!!queens) {
    return <i8>ctz(queens);
  }
  const kings = attackingKings(position, player, board, blockerMask);
  if (!!kings) {
    return <i8>ctz(kings);
  }
  return -1;
}

const gains = new StaticArray<i16>(40);

/**
 * Static exchange evaluation of `move` (which has NOT been played yet), from
 * the point of view of `player`: material won (>0) or lost (<0) on the target
 * square after the best sequence of recaptures. Classic swap algorithm.
 */
export function staticExchangeEvaluation(
  board: BitBoard,
  player: i8,
  move: u32
): i16 {
  const fromPosition = decodeFromPosition(move);
  const targetPosition = decodeToPosition(move);
  let blockerMask = board.getAllPiecesMask() & ~((<u64>1) << fromPosition);

  let depth: i32 = 0;
  unchecked(gains[0] = decodeCaptureFlag(move) ? SEE_VALUES[decodeCapturedPiece(move)] : 0);
  let attackerValue: i16 = unchecked(SEE_VALUES[decodeDestPiece(move)]);
  let side = opponent(player);

  while (true) {
    const attackerPosition = findSmallerAttackerPosition(
      board,
      side,
      targetPosition,
      blockerMask
    );
    if (attackerPosition < 0 || depth >= 38) {
      break;
    }
    depth++;
    // speculative store: what this capture gains if the sequence stops here
    unchecked(gains[depth] = attackerValue - gains[depth - 1]);
    if (attackerValue >= 20000) {
      // a king cannot be captured: the previous capturer stays
      depth--;
      break;
    }
    attackerValue = unchecked(SEE_VALUES[board.getPieceAt(attackerPosition)]);
    blockerMask &= ~((<u64>1) << attackerPosition);
    side = opponent(side);
  }
  while (depth > 0) {
    const a = -unchecked(gains[depth - 1]);
    const b = unchecked(gains[depth]);
    unchecked(gains[depth - 1] = -(a > b ? a : b));
    depth--;
  }
  return unchecked(gains[0]);
}
