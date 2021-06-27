import { BitBoard, BLACK, WHITE } from "../bitboard";
import { knightMovesFromCache } from "../knight-move-generation";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "../sliding-pieces-move-generation";

export function bishopXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  return !!(bishopMoves(boardMask, pos) & targetMask);
}

export function rookXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  return !!(rookMoves(boardMask, pos) & targetMask);
}

export function queenAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  const boardMask = board.getAllPiecesMask();
  return !!(queenMoves(boardMask, pos) & targetMask);
}

export function knightAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  //const targetMask = <u64>(1 << target);
  return !!(knightMovesFromCache(pos) & targetMask);
}
