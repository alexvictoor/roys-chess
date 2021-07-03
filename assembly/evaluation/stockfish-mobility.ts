import {
  BISHOP,
  BitBoard,
  BLACK,
  firstColMask,
  firstRowMask,
  KING,
  KNIGHT,
  leftBorderMask,
  maskString,
  PAWN,
  QUEEN,
  rightBorderMask,
  ROOK,
  WHITE,
} from "../bitboard";
import { bishopXRayAttack, bishopXRayAttackMask, knightAttack, knightAttackMask, queenAttack, queenAttackMask, rookXRayAttack, rookXRayAttackMask } from "./stockfish-attacks";

export function mobilityAreaMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = ~(<u64>0);
  resultMask &= ~board.getKingMask(player);
  resultMask &= ~board.getQueenMask(player);

  const allMask = board.getAllPiecesMask();
  if (player === WHITE) {
    const blockedPawnMask =
      board.getPawnMask(WHITE) &
      ((firstRowMask << 8) | (firstRowMask << 16) | (allMask >> 8));
    resultMask &= ~blockedPawnMask;
    const opponentPawnMask = board.getPawnMask(BLACK);
    const opponentPawnDefenseMask =
      ((opponentPawnMask >> 7) & leftBorderMask) |
      ((opponentPawnMask >> 9) & rightBorderMask);
    resultMask &= ~opponentPawnDefenseMask;
  } else {
    const blockedPawnMask =
      board.getPawnMask(BLACK) &
      ((firstRowMask << 40) | (firstRowMask << 48) | (allMask << 8));
    resultMask &= ~blockedPawnMask;
    const opponentPawnMask = board.getPawnMask(WHITE);
    const opponentPawnDefenseMask =
      ((opponentPawnMask << 7) & rightBorderMask) |
      ((opponentPawnMask << 9) & leftBorderMask);
    resultMask &= ~opponentPawnDefenseMask;
  }
  return resultMask;
}

export function mobilityArea(
  board: BitBoard,
  player: i8,
  position: i8
): boolean {
  const positionMask = (<u64>1) << position;
  return !!(mobilityAreaMask(board, player) & positionMask);
}

export function mobility(
  board: BitBoard,
  player: i8,
  position: i8
): i16 {

  const piece = board.getPieceAt(position);
  if ((piece === PAWN + player) || (piece === KING + player)) {
    return 0;
  }
  const mobilityMask = mobilityAreaMask(board, player);
  const queenMask = board.getQueenMask(player);
  if (piece === KNIGHT + player) {
    return <i16>popcnt(knightAttackMask(board, player, position, mobilityMask & ~queenMask));
  }
  if (piece === BISHOP + player) {
    return <i16>popcnt(bishopXRayAttackMask(board, player, position, mobilityMask & ~queenMask));
  }
  if (piece === ROOK + player) {
    return <i16>popcnt(rookXRayAttackMask(board, player, position, mobilityMask));
  }
  if (piece === QUEEN + player) {
    return <i16>popcnt(queenAttackMask(board, player, position, mobilityMask));
  }
  return 0;
}
