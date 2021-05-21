import {
  BitBoard,
  decodeCapturedPiece,
  decodeCaptureFlag,
  decodeSrcPiece,
  decodeToPosition,
  opponent,
  WHITE,
} from "./bitboard";
import { kingMoves } from "./king-move-generation";
import { knightMovesFromCache } from "./knight-move-generation";
import { pawnAttacks } from "./pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "./sliding-pieces-move-generation";
import { PIECE_VALUES } from "./static-evaluation";

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
function attackingKings(position: i8, player: i8, board: BitBoard): u64 {
  const kingMask = board.getKingMask(player);
  return kingMask & kingMoves(position);
}

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
  const kings = attackingKings(position, player, board);
  if (!!kings) {
    return <i8>ctz(kings);
  }
  return -1;
}

export function staticExchangeEvaluation(
  board: BitBoard,
  player: i8,
  move: u32
): i16 {
  const scoreFactor: i16 = player === WHITE ? -1 : 1;
  const isCapture = decodeCaptureFlag(move);
  let score: i16 = isCapture
    ? unchecked(PIECE_VALUES[decodeCapturedPiece(move)]) * scoreFactor
    : 0;
  let blockerMask =
    board.getAllPiecesMask() & ~((<u64>1) << decodeToPosition(move));
  const opponentPlayer = opponent(player);
  const targetPosition = decodeToPosition(move);
  let previousAttackerCaptureScore =
    unchecked(PIECE_VALUES[decodeSrcPiece(move)]) * -scoreFactor;
  do {
    const opponentPosition = findSmallerAttackerPosition(
      board,
      opponentPlayer,
      targetPosition,
      blockerMask
    );
    if (opponentPosition < 0) {
      return score;
    }
    score -= previousAttackerCaptureScore;
    previousAttackerCaptureScore =
      board.getPieceAt(opponentPosition) * scoreFactor;

    if (score + previousAttackerCaptureScore < 0) {
      return score;
    }

    blockerMask &= ~((<u64>1) << opponentPosition);

    const position = findSmallerAttackerPosition(
      board,
      player,
      targetPosition,
      blockerMask
    );
    if (position < 0) {
      return score;
    }
    score += previousAttackerCaptureScore * -scoreFactor;
    previousAttackerCaptureScore = board.getPieceAt(position);
    if (score - previousAttackerCaptureScore > 0) {
      return score;
    }

    blockerMask &= ~((<u64>1) << position);
  } while (true);

  return 0;
}
