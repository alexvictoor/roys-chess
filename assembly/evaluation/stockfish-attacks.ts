import { BitBoard, BLACK, firstColMask, firstRowMask, MaskIterator, maskString, opponent, WHITE } from "../bitboard";
import { kingMoves } from "../king-move-generation";
import { knightMovesFromCache } from "../knight-move-generation";
import { pawnAttacks, pawnAttacksOnLeft, pawnAttacksOnRight } from "../pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "../sliding-pieces-move-generation";
import { blockersForKingMask } from "./stockfish-blocker-king";


export function pinnedDirection(kingPos: i8, pos: i8): i32 {
  const kingX = kingPos & 7;
  const kingY = kingPos >> 3;
  const x = pos & 7;
  const y = pos >> 3;
  if (kingY == y) {
    return 1;
  } 
  if (kingX == x) {
    return 3;
  }
  if ((x > kingX) == (y > kingY)) {
    return 4;
  }
  return 2;
}

const pinnedDirectionCache: StaticArray<u64> = new StaticArray<u64>(256);
export function initPinnedDirectionCache(): void {
  for (let position: i8 = 0; position < 64; position++) {
    pinnedDirectionCache[position] = firstRowMask << (position & ~7);
  }
  let x: i8 = 0;
  
  for (let index: i8 = 0; index < 8; index++) {
    let mask: u64 = 0;
    for (let y: i8 = index, x: i8 = 0; y >= 0; y--, x++) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = index, x: i8 = 0; y >= 0; y--, x++) {
      pinnedDirectionCache[64 + (y << 3) + x] = mask;
    }
    mask = 0;
    for (let y: i8 = 7, x: i8 = index; x < 8; y--, x++) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = 7, x: i8 = index; x < 8; y--, x++) {
      pinnedDirectionCache[64 + (y << 3) + x] = mask;
    }
    mask = 0;
    for (let y: i8 = 7 - index, x: i8 = 7; y >= 0; y--, x--) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = 7 - index, x: i8 = 7; y >= 0; y--, x--) {
      pinnedDirectionCache[192 + (y << 3) + x] = mask;
    }
    mask = 0;
    for (let y: i8 = 7, x: i8 = 7 - index; x >= 0; y--, x--) {
      mask |= 1 << ((<u64>y << 3) + <u64>x);
    }
    for (let y: i8 = 7, x: i8 = 7 - index; x >= 0; y--, x--) {
      pinnedDirectionCache[192 + (y << 3) + x] = mask;
    }
  }  

  for (let position: i8 = 0; position < 64; position++) {
    pinnedDirectionCache[position + 128] = firstColMask << (position & 7);
  }
}
initPinnedDirectionCache();

export function pinnedDirectionMask(kingPos: i8, pos: i8): u64 {
  return pinnedDirectionCache[(pinnedDirection(kingPos, pos) - 1) * 64 + pos];
}



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
  let resultMask: u64 = 0;
  const knightMask = board.getKnightMask(player);
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= knightAttackMask(board, player, position, ~0);
  }
  return resultMask;
}

export function attackByBishopsMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const bishopMask = board.getBishopMask(player);
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= bishopXRayAttackMask(board, player, position, ~0);
  }
  return resultMask;
}

export function attackByRooksMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const rookMask = board.getRookMask(player);
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= rookXRayAttackMask(board, player, position, ~0);
  }
  return resultMask;
}
export function attackByQueensMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const queenMask = board.getQueenMask(player);
  positions.reset(queenMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= queenAttackMask(board, player, position, ~0);
  }
  return resultMask;
}
export function attackByKingsMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = 0;
  const kingMask = board.getKingMask(player);
  positions.reset(kingMask);
  while (positions.hasNext()) {
    const position = positions.next();
    resultMask |= kingMoves(position);
  }
  return resultMask;
}

export function attackByPawnsMask(board: BitBoard, player: i8): u64 {
  return pawnAttacks(player, board.getPawnMask(player));
}

export function attackOnceMask(board: BitBoard, player: i8): u64 {
  let resultMask: u64 = attackByPawnsMask(board, player);
  resultMask |= attackByKnightsMask(board, player);
  resultMask |= attackByBishopsMask(board, player);
  resultMask |= attackByRooksMask(board, player);
  resultMask |= attackByQueensMask(board, player);
  resultMask |= attackByKingsMask(board, player);

  return resultMask;
}
export function attackTwiceMask(board: BitBoard, player: i8): u64 {
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
