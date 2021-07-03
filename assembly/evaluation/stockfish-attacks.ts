import { BitBoard, BLACK, WHITE } from "../bitboard";
import { knightMovesFromCache } from "../knight-move-generation";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "../sliding-pieces-move-generation";

export function bishopXRayAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  return (bishopMoves(boardMask, pos) & targetMask);
}
export function bishopXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  
  return !!(bishopXRayAttackMask(board, player, pos, targetMask));
}

export function rookXRayAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  return (rookMoves(boardMask, pos) & targetMask);
}
export function rookXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  return !!rookXRayAttackMask(board, player, pos, targetMask);
}

export function queenAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const boardMask = board.getAllPiecesMask();
  return (queenMoves(boardMask, pos) & targetMask);
}
export function queenAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  const boardMask = board.getAllPiecesMask();
  return !!(queenAttackMask(board, player, pos, targetMask));
}

export function knightAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  return (knightMovesFromCache(pos) & targetMask);
}
export function knightAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  //const targetMask = <u64>(1 << target);
  return !!knightAttackMask(board, player, pos, targetMask);
}
