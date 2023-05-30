import { BitBoard, BLACK, MaskIterator, opponent, WHITE } from "../bitboard";
import { kingMoves } from "../king-move-generation";
import { knightMovesFromCache } from "../knight-move-generation";
import { pawnAttacks, pawnAttacksOnLeft, pawnAttacksOnRight } from "../pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves
} from "../sliding-pieces-move-generation";
import { blockersForKingMask } from "./stockfish-blocker-king";
import { ATTACK_BY_BISHOPS_MASK_KEY, ATTACK_BY_KINGS_MASK_KEY, ATTACK_BY_KNIGHTS_MASK_KEY, ATTACK_BY_QUEENS_MASK_KEY, ATTACK_BY_ROOKS_MASK_KEY, ATTACK_ONCE_MASK_KEY, ATTACK_TWICE_MASK_KEY, getValueFromCacheU64, isInCache, setValueInCacheU64 } from "./stockfish-cache";
import { pinnedDirectionMask } from "./stockfish-pinned-direction";

export function bishopXRayAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask;
  if (blockersForKingMask(board, opponent(player)) & (1 << pos)) {
    const kingMask = board.getKingMask(player);
    const kingPos = <i8>ctz(kingMask);
    const directionMask = pinnedDirectionMask(kingPos, pos);
    return bishopMoves(boardMask, pos) & targetMask & directionMask;
  }
  return bishopMoves(boardMask, pos) & targetMask;
}
export function bishopXRayAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  return !!bishopXRayAttackMask(board, player, pos, targetMask);
}

export function rookXRayAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  const queensMask = board.getQueenMask(BLACK) | board.getQueenMask(WHITE);
  const boardMask = board.getAllPiecesMask() ^ queensMask ^ board.getRookMask(player);

  if (blockersForKingMask(board, opponent(player)) & (1 << pos)) {
    const kingMask = board.getKingMask(player);
    const kingPos = <i8>ctz(kingMask);
    const directionMask = pinnedDirectionMask(kingPos, pos);
    return rookMoves(boardMask, pos) & targetMask & directionMask;
  }

  return rookMoves(boardMask, pos) & targetMask;
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
  if (blockersForKingMask(board, opponent(player)) & (1 << pos)) {
    const kingMask = board.getKingMask(player);
    const kingPos = <i8>ctz(kingMask);
    const directionMask = pinnedDirectionMask(kingPos, pos);
    return queenMoves(boardMask, pos) & targetMask & directionMask;
  }
  return queenMoves(boardMask, pos) & targetMask;
}
export function queenAttack(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): boolean {
  
  return !!queenAttackMask(board, player, pos, targetMask);
}

export function knightAttackMask(
  board: BitBoard,
  player: i8,
  pos: i8,
  targetMask: u64
): u64 {
  return knightMovesFromCache(pos) & targetMask;
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

const positions = new MaskIterator();

export function attackByKnightsMask(board: BitBoard, player: i8): u64 {

  if (isInCache(ATTACK_BY_KNIGHTS_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_BY_KNIGHTS_MASK_KEY, player);
  }

  let resultMask: u64 = 0;
  const knightMask = board.getKnightMask(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= knightAttackMask(board, player, position, ~0);
  }

  setValueInCacheU64(ATTACK_BY_KNIGHTS_MASK_KEY, player, resultMask);

  return resultMask;
}

export function attackByBishopsMask(board: BitBoard, player: i8): u64 {

  if (isInCache(ATTACK_BY_BISHOPS_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_BY_BISHOPS_MASK_KEY, player);
  }

  let resultMask: u64 = 0;
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= bishopXRayAttackMask(board, player, position, ~0);
  }

  setValueInCacheU64(ATTACK_BY_BISHOPS_MASK_KEY, player, resultMask);

  return resultMask;
}

export function attackByRooksMask(board: BitBoard, player: i8): u64 {

  if (isInCache(ATTACK_BY_ROOKS_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_BY_ROOKS_MASK_KEY, player);
  }

  let resultMask: u64 = 0;
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= rookXRayAttackMask(board, player, position, ~0);
  }

  setValueInCacheU64(ATTACK_BY_ROOKS_MASK_KEY, player, resultMask);

  return resultMask;
}
export function attackByQueensMask(board: BitBoard, player: i8): u64 {

  if (isInCache(ATTACK_BY_QUEENS_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_BY_QUEENS_MASK_KEY, player);
  }

  let resultMask: u64 = 0;
  const queenMask = board.getQueenMask(player);
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= queenAttackMask(board, player, position, ~0);
  }

  setValueInCacheU64(ATTACK_BY_QUEENS_MASK_KEY, player, resultMask);

  return resultMask;
}
export function attackByKingsMask(board: BitBoard, player: i8): u64 {

  if (isInCache(ATTACK_BY_KINGS_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_BY_KINGS_MASK_KEY, player);
  }

  let resultMask: u64 = 0;
  const kingMask = board.getKingMask(player);
  positions.reset(kingMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= kingMoves(position);
  }

  setValueInCacheU64(ATTACK_BY_KINGS_MASK_KEY, player, resultMask);

  return resultMask;
}

export function attackByPawnsMask(board: BitBoard, player: i8): u64 {
  return pawnAttacks(player, board.getPawnMask(player));
}

export function attackOnceMask(board: BitBoard, player: i8): u64 {
  
  if (isInCache(ATTACK_ONCE_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_ONCE_MASK_KEY, player);
  }

  let resultMask: u64 = attackByPawnsMask(board, player);
  resultMask |= attackByKnightsMask(board, player);
  resultMask |= attackByBishopsMask(board, player);
  resultMask |= attackByRooksMask(board, player);
  resultMask |= attackByQueensMask(board, player);
  resultMask |= attackByKingsMask(board, player);

  setValueInCacheU64(ATTACK_ONCE_MASK_KEY, player, resultMask);
  
  return resultMask;
}
export function attackTwiceMask(board: BitBoard, player: i8): u64 {

  if (isInCache(ATTACK_TWICE_MASK_KEY, player)) {
    return getValueFromCacheU64(ATTACK_TWICE_MASK_KEY, player);
  }

  let onceMask: u64 = pawnAttacks(player, board.getPawnMask(player));
  let twiceMask: u64 =
    pawnAttacksOnLeft(player, board.getPawnMask(player)) &
    pawnAttacksOnRight(player, board.getPawnMask(player));
  const knightMask = board.getKnightMask(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = knightAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = bishopXRayAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = rookXRayAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const queenMask = board.getQueenMask(player);
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = queenAttackMask(board, player, position, ~0);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }
  const kingMask = board.getKingMask(player);
  positions.reset(kingMask);
  while (positions.hasNext()) {
    const position = positions.next();
    const mask = kingMoves(position);
    twiceMask |= onceMask & mask;
    onceMask |= mask;
  }

  setValueInCacheU64(ATTACK_TWICE_MASK_KEY, player, twiceMask);

  return twiceMask;
}
export function attackMask(
  board: BitBoard,
  player: i8,
  atLeastTwice: boolean
): u64 {
  return atLeastTwice
    ? attackTwiceMask(board, player)
    : attackOnceMask(board, player);
}
