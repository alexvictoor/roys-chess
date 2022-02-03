import { BitBoard, BLACK, firstRowMask, leftBorderMask, MaskIterator, opponent, rightBorderMask, WHITE } from "../bitboard";
import { pawnAttacksOnLeft, pawnAttacksOnRight } from "../pawn";
import { bishopMoves, rookMoves } from "../sliding-pieces-move-generation";
import {
  queenAttack,
  rookXRayAttack,
  bishopXRayAttack,
  knightAttack,
  queenAttackMask,
  rookXRayAttackMask,
  bishopXRayAttackMask,
  knightAttackMask,
} from "./stockfish-attacks";

const kingRingCache = new StaticArray<u64>(64);
function initKingRingCache(): void {
  for (let y: i8 = 1; y < 7; y++) {
    for (let x: i8 = 1; x < 7; x++) {
      const index: u64 = ((<u64>y) << 3) + <u64>x;
      const mask =
        ((<u64>1) << index) |
        ((<u64>1) << (index - 1)) |
        ((<u64>1) << (index + 1)) |
        ((<u64>1) << (index - 8)) |
        ((<u64>1) << (index - 9)) |
        ((<u64>1) << (index - 7)) |
        ((<u64>1) << (index + 8)) |
        ((<u64>1) << (index + 9)) |
        ((<u64>1) << (index + 7));
      kingRingCache[<i8>index] = mask;
    }
  }
  for (let y: i8 = 1; y < 7; y++) {
    const borderLeftIndex = y << 3;
    const borderRightIndex = (y << 3) + 7;
    kingRingCache[borderLeftIndex] = kingRingCache[borderLeftIndex + 1];
    kingRingCache[borderRightIndex] = kingRingCache[borderRightIndex - 1];
  }
  for (let x: i8 = 1; x < 7; x++) {
    const borderBottomIndex = x;
    const borderTopIndex = 56 + x;
    kingRingCache[borderBottomIndex] = kingRingCache[borderBottomIndex + 8];
    kingRingCache[borderTopIndex] = kingRingCache[borderTopIndex - 8];
  }

  // corners
  kingRingCache[0] = kingRingCache[9];
  kingRingCache[7] = kingRingCache[14];
  kingRingCache[56] = kingRingCache[49];
  kingRingCache[63] = kingRingCache[54];
}
initKingRingCache();

const kingNeighborsCache = new StaticArray<u64>(64);
function initKingNeighborsCache(): void {
  for (let y: i8 = 0; y < 8; y++) {
    for (let x: i8 = 0; x < 8; x++) {
      const index: u64 = ((<u64>y) << 3) + <u64>x;
      const mask = ((<u64>1) << (index - 1)) |
        ((<u64>1) << (index + 1)) |
        ((<u64>1) << (index - 8)) |
        ((<u64>1) << (index - 9)) |
        ((<u64>1) << (index - 7)) |
        ((<u64>1) << (index + 8)) |
        ((<u64>1) << (index + 9)) |
        ((<u64>1) << (index + 7));
      kingNeighborsCache[<i8>index] = mask;
    }
  }
  for (let y: i8 = 0; y < 8; y++) {
    const borderLeftIndex = y << 3;
    const borderRightIndex = (y << 3) + 7;
    kingNeighborsCache[borderLeftIndex] &= rightBorderMask;
    kingNeighborsCache[borderRightIndex] &= leftBorderMask;
  }
  for (let x: i8 = 0; x < 8; x++) {
    const borderBottomIndex = x;
    const borderTopIndex = 56 + x;
    kingNeighborsCache[borderBottomIndex] &= ~(firstRowMask << 56);
    kingNeighborsCache[borderTopIndex] &= ~firstRowMask;
  }
}
initKingNeighborsCache();

function kingRingMask(board: BitBoard, player: i8, full: boolean): u64 {
  const pawnMask = board.getPawnMask(player);
  const defendedTwiceByPawns =
    pawnAttacksOnLeft(player, pawnMask) & pawnAttacksOnRight(player, pawnMask);
  const kingPos = <i8>ctz(board.getKingMask(player));
  if (full) {
    return kingRingCache[kingPos];
  }
  return kingRingCache[kingPos] & ~defendedTwiceByPawns;
}

export function isInKingRing(
  board: BitBoard,
  player: i8,
  pos: i8,
  full: boolean
): boolean {
  const kingRing = kingRingMask(board, player, full);
  return !!(kingRing & (1 << pos));
}
const positions = new MaskIterator();
export function kingAttackersCount(board: BitBoard, player: i8): i16 {
  const kingRing = kingRingMask(board, opponent(player), false);
  const queenMask = board.getQueenMask(player);
  const rookMask = board.getRookMask(player);
  const bishopMask = board.getBishopMask(player);
  const knightMask = board.getKnightMask(player);
  const pawnMask = board.getPawnMask(player);
  let count: i16 = 0;
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (queenAttack(board, player, pos, kingRing)) {
      count++;
    }
  }
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (rookXRayAttack(board, player, pos, kingRing)) {
      count++;
    }
  }
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (bishopXRayAttack(board, player, pos, kingRing)) {
      count++;
    }
  }
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (knightAttack(board, player, pos, kingRing)) {
      count++;
    }
  }

  count += <i16>popcnt(pawnAttacksOnLeft(player, pawnMask) & kingRing);
  count += <i16>popcnt(pawnAttacksOnRight(player, pawnMask) & kingRing);

  return count;
}

export function rooksOnKingRing(board: BitBoard, player: i8): i16 {
  const kingRing = kingRingMask(board, opponent(player), false);
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  let result: i16 = 0;
  while (positions.hasNext()) {
    const pos = positions.next();
    if (
      rookMoves(0, pos) & kingRing &&
      !rookXRayAttack(board, player, pos, kingRing)
    ) {
      result++;
    }
  }
  return result;
}
export function bishopsOnKingRing(board: BitBoard, player: i8): i16 {
  const kingRing = kingRingMask(board, opponent(player), false);
  const bishopMask = board.getBishopMask(player);
  const pawnMask = board.getPawnMask(WHITE) | board.getPawnMask(BLACK);
  positions.reset(bishopMask);
  let result: i16 = 0;
  while (positions.hasNext()) {
    const pos = positions.next();
    if (!bishopXRayAttack(board, player, pos, kingRing) && (bishopMoves(pawnMask, pos) & kingRing)) {
      result++;
    }
  }
  return result;
}


export function kingAttackersWeight(board: BitBoard, player: i8): i16 {
  const kingRing = kingRingMask(board, opponent(player), false);
  const queenMask = board.getQueenMask(player);
  const rookMask = board.getRookMask(player);
  const bishopMask = board.getBishopMask(player);
  const knightMask = board.getKnightMask(player);
  let weight: i16 = 0;
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (queenAttack(board, player, pos, kingRing)) {
      weight += 10;
    }
  }
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (rookXRayAttack(board, player, pos, kingRing)) {
      weight += 44;
    }
  }
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (bishopXRayAttack(board, player, pos, kingRing)) {
      weight += 52;
    }
  }
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    if (knightAttack(board, player, pos, kingRing)) {
      weight += 81;
    }
  }


  return weight;
}

export function kingAttacks(board: BitBoard, player: i8): i16 {
  const opponentKingPos = <i8>ctz(board.getKingMask(opponent(player)));
  const opponentKingNeighbors = kingNeighborsCache[opponentKingPos];
  const queenMask = board.getQueenMask(player);
  const rookMask = board.getRookMask(player);
  const bishopMask = board.getBishopMask(player);
  const knightMask = board.getKnightMask(player);
  let attacks: i16 = 0;
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>popcnt(queenAttackMask(board, player, pos, opponentKingNeighbors));
  }
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>popcnt(rookXRayAttackMask(board, player, pos, opponentKingNeighbors));
  }
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>popcnt(bishopXRayAttackMask(board, player, pos, opponentKingNeighbors));
  }
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>popcnt(knightAttackMask(board, player, pos, opponentKingNeighbors));
  }

  return attacks;
}