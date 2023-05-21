import {
  BISHOP,
  BitBoard,
  BLACK,
  firstColMask,
  firstRowMask,
  KNIGHT,
  leftBorderMask,
  MaskIterator,
  maskString,
  opponent,
  QUEEN,
  rightBorderMask,
  ROOK,
  WHITE,
} from "../bitboard";
import { pawnAttacksOnLeft, pawnAttacksOnRight } from "../pawn";
import {
  bishopMoves,
  queenMoves,
  rookMoves,
} from "../sliding-pieces-move-generation";
import {
  attackByBishopsMask,
  attackByKingsMask,
  attackByKnightsMask,
  attackByPawnsMask,
  attackByQueensMask,
  attackByRooksMask,
  attackMask,
  attackOnceMask,
  attackTwiceMask,
  bishopXRayAttack,
  bishopXRayAttackMask,
  knightAttack,
  knightAttackMask,
  queenAttack,
  queenAttackMask,
  rookXRayAttack,
  rookXRayAttackMask,
} from "./stockfish-attacks";
import { blockersForKingMask } from "./stockfish-blocker-king";
import { mobilityFor } from "./stockfish-mobility";
import { kingDistance } from "./stockfish-pieces";

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
      const mask =
        ((<u64>1) << (index - 1)) |
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

export function kingRingMask(board: BitBoard, player: i8, full: boolean): u64 {
  const kingPos = <i8>ctz(board.getKingMask(player));
  if (full) {
    return kingRingCache[kingPos];
  }
  const pawnMask = board.getPawnMask(player);
  const defendedTwiceByPawns =
    pawnAttacksOnLeft(player, pawnMask) & pawnAttacksOnRight(player, pawnMask);
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
const positions2 = new MaskIterator();
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
    if (
      !bishopXRayAttack(board, player, pos, kingRing) &&
      bishopMoves(pawnMask, pos) & kingRing
    ) {
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
    attacks += <i16>(
      popcnt(queenAttackMask(board, player, pos, opponentKingNeighbors))
    );
  }
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>(
      popcnt(rookXRayAttackMask(board, player, pos, opponentKingNeighbors))
    );
  }
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>(
      popcnt(bishopXRayAttackMask(board, player, pos, opponentKingNeighbors))
    );
  }
  positions.reset(knightMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    attacks += <i16>(
      popcnt(knightAttackMask(board, player, pos, opponentKingNeighbors))
    );
  }

  return attacks;
}

export function weakSquaresMask(board: BitBoard, player: i8): u64 {
  const opponentPlayer = opponent(player);

  let defenseMask: u64 = attackByPawnsMask(board, opponentPlayer);
  defenseMask |= attackByKnightsMask(board, opponentPlayer);
  defenseMask |= attackByBishopsMask(board, opponentPlayer);
  defenseMask |= attackByRooksMask(board, opponentPlayer);
  defenseMask |=
    attackByQueensMask(board, opponentPlayer) &
    attackByKingsMask(board, opponentPlayer);

  return attackMask(board, player, false) & ~defenseMask;
}

export function weakSquaresCount(board: BitBoard, player: i8): i16 {
  //const opponentPlayer = opponent(player);

  /*let defenseMask: u64 = attackByPawnsMask(board, opponentPlayer);
  defenseMask |= attackByKnightsMask(board, opponentPlayer);
  defenseMask |= attackByBishopsMask(board, opponentPlayer);
  defenseMask |= attackByRooksMask(board, opponentPlayer);
  defenseMask |=
    attackByQueensMask(board, opponentPlayer) &
    attackByKingsMask(board, opponentPlayer);*/

  return <i16>popcnt(weakSquaresMask(board, player));
}

export function weakBonus(board: BitBoard, player: i8): i16 {
  return <i16>(
    popcnt(
      weakSquaresMask(board, player) &
        kingRingMask(board, opponent(player), false)
    )
  );
}

export function possibleChecksMask(
  board: BitBoard,
  player: i8,
  checkType: i8
): u64 {
  const opponentPlayer = opponent(player);

  const queenMask = board.getQueenMask(player);
  const opponentKingMask = board.getKingMask(opponentPlayer);
  const allPiecesMask = board.getAllPiecesMask();
  const allPiecesMaskButOpponentQueen =
    board.getAllPiecesMask() ^ board.getQueenMask(opponentPlayer);
  let kingAttacksMask: u64 = 0;
  let ignoredAttacksMask: u64 = 0;

  positions.reset(attackByRooksMask(board, player));
  while (positions.hasNext()) {
    const pos = positions.next();
    if (rookMoves(allPiecesMaskButOpponentQueen, pos) & opponentKingMask) {
      if (checkType === ROOK) {
        kingAttacksMask |= 1 << pos;
      } else {
        ignoredAttacksMask |= 1 << pos;
      }
    }
  }
  if (checkType === ROOK) {
    return kingAttacksMask;
  }

  positions.reset(queenMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    const queenPossibleMoves = queenMoves(allPiecesMask, pos);
    positions2.reset(queenPossibleMoves);
    while (positions2.hasNext()) {
      const pos2 = positions2.next();
      if (
        queenMoves(allPiecesMaskButOpponentQueen, pos2) &
        opponentKingMask &
        ~ignoredAttacksMask
      ) {
        if (checkType === QUEEN) {
          kingAttacksMask |= 1 << pos2;
        } else {
          ignoredAttacksMask |= 1 << pos2;
        }
      }
    }
  }

  if (checkType === QUEEN) {
    return kingAttacksMask;
  }

  positions.reset(attackByBishopsMask(board, player));
  while (positions.hasNext()) {
    const pos = positions.next();
    if (
      bishopMoves(allPiecesMaskButOpponentQueen, pos) &
      opponentKingMask &
      ~ignoredAttacksMask
    ) {
      if (checkType === BISHOP) {
        kingAttacksMask |= 1 << pos;
      } else {
        ignoredAttacksMask |= 1 << pos;
      }
    }
  }

  if (checkType === BISHOP) {
    return kingAttacksMask;
  }

  positions.reset(attackByKnightsMask(board, player));
  while (positions.hasNext()) {
    const pos = positions.next();
    if (
      knightAttackMask(board, player, pos, opponentKingMask) &
      ~ignoredAttacksMask
    ) {
      if (checkType === KNIGHT) {
        kingAttacksMask |= 1 << pos;
      } else {
        ignoredAttacksMask |= 1 << pos;
      }
    }
  }

  return kingAttacksMask;
}

export function safeChecksMask(
  board: BitBoard,
  player: i8,
  checkType: i8
): u64 {
  const checks = possibleChecksMask(board, player, checkType);

  return (
    checks &
    ((weakSquaresMask(board, player) & attackTwiceMask(board, player)) |
      ~attackOnceMask(board, opponent(player))) &
    ~board.getPlayerPiecesMask(player)
  );
}

function unsafeChecksMaskByTypeOld(
  board: BitBoard,
  player: i8,
  checkType: i8
): u64 {
  const checks = possibleChecksMask(board, player, checkType);

  return (
    checks &
    ~(
      (weakSquaresMask(board, player) & attackTwiceMask(board, player)) |
      ~attackOnceMask(board, opponent(player))
    )
  );
}
export function unsafeChecksMaskByType(
  board: BitBoard,
  player: i8,
  checkType: i8
): u64 {
  const checks = possibleChecksMask(board, player, checkType);

  return checks & ~safeChecksMask(board, player, checkType);
}

export function unsafeChecksMask(board: BitBoard, player: i8): u64 {
  return (
    unsafeChecksMaskByType(board, player, KNIGHT) |
    unsafeChecksMaskByType(board, player, BISHOP) |
    unsafeChecksMaskByType(board, player, ROOK)
  );
}

export function isInCheckBySlidingPieces(
  board: BitBoard,
  player: i8,
  noDefenderMask: u64
): boolean {
  const opponentPlayer = opponent(player);
  const kingMask = board.getKingMask(player);
  const kingPos = <i8>ctz(kingMask);
  const allPiecesMask = board.getAllPiecesMask() & ~noDefenderMask;
  const potentialAttackersMask =
    queenMoves(allPiecesMask, kingPos) &
    board.getPlayerPiecesMask(opponentPlayer);

  const opponentQueenMask =
    board.getQueenMask(opponentPlayer) & potentialAttackersMask;
  if (opponentQueenMask) {
    return true;
  }

  const rookMask = board.getRookMask(opponentPlayer) & potentialAttackersMask;
  positions.reset(rookMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    const moves = rookMoves(allPiecesMask, pos);
    if (moves & kingMask) {
      return true;
    }
  }
  const bishopMask = board.getBishopMask(player) & potentialAttackersMask;
  positions.reset(bishopMask);
  while (positions.hasNext()) {
    const pos = positions.next();
    const moves = bishopMoves(allPiecesMask, pos);
    if (moves & kingMask) {
      return true;
    }
  }

  return false;
}

const flankColumns: u64[] = [
  firstColMask | (firstColMask << 1) | (firstColMask << 2),
  firstColMask |
    (firstColMask << 1) |
    (firstColMask << 2) |
    (firstColMask << 3),
  firstColMask |
    (firstColMask << 1) |
    (firstColMask << 2) |
    (firstColMask << 3),
  (firstColMask << 2) |
    (firstColMask << 3) |
    (firstColMask << 4) |
    (firstColMask << 5),
  (firstColMask << 2) |
    (firstColMask << 3) |
    (firstColMask << 4) |
    (firstColMask << 5),
  (firstColMask << 4) |
    (firstColMask << 5) |
    (firstColMask << 6) |
    (firstColMask << 7),
  (firstColMask << 4) |
    (firstColMask << 5) |
    (firstColMask << 6) |
    (firstColMask << 7),
  (firstColMask << 5) | (firstColMask << 6) | (firstColMask << 7),
];

export function flankAttack(board: BitBoard, player: i8): i16 {
  const ignoredRows =
    player == WHITE
      ? firstRowMask | (firstRowMask << 8) | (firstRowMask << 16)
      : (firstRowMask << 40) | (firstRowMask << 48) | (firstRowMask << 56);

  const opponentPlayer = opponent(player);
  const opponentKingMask = board.getKingMask(opponentPlayer);
  const opponentKingPos = <i8>ctz(opponentKingMask);
  const opponentKingCol = opponentKingPos % 8;
  const flank = unchecked(flankColumns[opponentKingCol]) & ~ignoredRows;
  const twiceMask = attackTwiceMask(board, player) & flank;
  const onceMask = attackOnceMask(board, player) & ~twiceMask & flank;

  return <i16>((popcnt(twiceMask) << 1) + popcnt(onceMask));
}

export function flankDefense(board: BitBoard, player: i8): i16 {
  const ignoredRows =
    player == WHITE
      ? firstRowMask | (firstRowMask << 8) | (firstRowMask << 16)
      : (firstRowMask << 40) | (firstRowMask << 48) | (firstRowMask << 56);

  const opponentPlayer = opponent(player);
  const opponentKingMask = board.getKingMask(opponentPlayer);
  const opponentKingPos = <i8>ctz(opponentKingMask);
  const opponentKingCol = opponentKingPos % 8;
  const flank = unchecked(flankColumns[opponentKingCol]) & ~ignoredRows;
  const onceMask = attackOnceMask(board, opponentPlayer) & flank;

  return <i16>popcnt(onceMask);
}

export function knightDefender(board: BitBoard, player: i8): i16 {
  return <i16>(
    popcnt(
      attackByKnightsMask(board, player) & attackByKingsMask(board, player)
    )
  );
}

const unblockedStorm: i16[][] = [
  [85, -289, -166, 97, 50, 45, 50],
  [46, -25, 122, 45, 37, -10, 20],
  [-6, 51, 168, 34, -2, -22, -14],
  [-15, -11, 101, 4, 11, -15, -29],
];
const blockedStorm: i16[][] = [
  [0, 0, 76, -10, -7, -4, -1],
  [0, 0, 78, 15, 10, 6, 2],
];

const xFactors: i16[] = [2, 3, 4, 3, 3, 4, 3, 2];

const lastRowMask = firstRowMask << 56;

export function stormSquareBad(board: BitBoard, player: i8): i16 {
  const opponentPlayer = opponent(player);
  const playerPawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);

  const pawnDefenseMask =
    player == WHITE
      ? ((playerPawnMask << 7) & rightBorderMask) |
        ((playerPawnMask << 9) & leftBorderMask)
      : ((playerPawnMask >> 7) & leftBorderMask) |
        ((playerPawnMask >> 9) & rightBorderMask);

  const usMask = opponentPawnMask & ~pawnDefenseMask;
  const themMask = playerPawnMask;

  let v: i16 = 0;

  let yMask: u64 = 0;

  if (player == WHITE) {
    for (let y = 0; y < 8; y++) {
      yMask |= firstRowMask << (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(clz(usMask & colMask & yMask) >> 3) % 8;
        const them = <i8>(clz(themMask & colMask & yMask) >> 3) % 8;
        if (us > 0 && them == us + 1) {
          v += blockedStorm[0][them] * xFactors[x];
        } else {
          const f = x > 3 ? 7 - x : x;
          v += unblockedStorm[f][them] * xFactors[x];
        }
      }
    }
  } else {
    for (let y = 0; y < 8; y++) {
      yMask |= lastRowMask >> (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(ctz(usMask & colMask & yMask) >> 3) % 8;
        const them = <i8>(ctz(themMask & colMask & yMask) >> 3) % 8;
        if (us > 0 && them == us + 1) {
          v += blockedStorm[0][them] * xFactors[x];
        } else {
          const f = x > 3 ? 7 - x : x;
          v += unblockedStorm[f][them] * xFactors[x];
        }
      }
    }
  }

  return v;
}

const whiteStormSquareArray = new StaticArray<i16>(64);
const blackStormSquareArray = new StaticArray<i16>(64);
const tempStormSquareArray = new StaticArray<i16>(64);

function aggregateSquares(
  raw: StaticArray<i16>,
  result: StaticArray<i16>
): StaticArray<i16> {
  for (let i = 1; i < 63; i++) {
    result[i] = raw[i - 1] + raw[i] + raw[i + 1];
  }
  for (let i = 0; i < 64; i += 8) {
    result[i] = result[i + 1];
    result[i + 7] = result[i + 6];
  }
  return result;
}

export function stormSquare(board: BitBoard, player: i8): StaticArray<i16> {
  const opponentPlayer = opponent(player);
  const playerPawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);

  const pawnDefenseMask =
    player == WHITE
      ? ((playerPawnMask << 7) & rightBorderMask) |
        ((playerPawnMask << 9) & leftBorderMask)
      : ((playerPawnMask >> 7) & leftBorderMask) |
        ((playerPawnMask >> 9) & rightBorderMask);

  const usMask = opponentPawnMask & ~pawnDefenseMask;
  const themMask = playerPawnMask;

  let v: i16 = 0;

  let yMask: u64 = 0;

  let result: StaticArray<i16>;

  if (player == WHITE) {
    for (let y = 0; y < 8; y++) {
      yMask |= firstRowMask << (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(clz(usMask & colMask & yMask) >> 3) % 8;
        const them = <i8>(clz(themMask & colMask & yMask) >> 3) % 8;
        if (us > 0 && them == us + 1) {
          tempStormSquareArray[(y << 3) + x] = blockedStorm[0][them];
        } else {
          const f = x > 3 ? 7 - x : x;
          tempStormSquareArray[(y << 3) + x] = unblockedStorm[f][them];
        }
      }
    }

    result = aggregateSquares(tempStormSquareArray, whiteStormSquareArray);
  } else {
    for (let y: i8 = 7; y >= 0; y--) {
      yMask |= firstRowMask << (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(ctz(usMask & colMask & yMask) >> 3) % 8;
        const them = <i8>(ctz(themMask & colMask & yMask) >> 3) % 8;
        if (us > 0 && them == us + 1) {
          tempStormSquareArray[(y << 3) + x] = blockedStorm[0][them];
        } else {
          const f = x > 3 ? 7 - x : x;
          tempStormSquareArray[(y << 3) + x] = unblockedStorm[f][them];
        }
      }
    }
    result = aggregateSquares(tempStormSquareArray, blackStormSquareArray);
  }

  return result;
}

const weakness: i16[][] = [
  [-6, 81, 93, 58, 39, 18, 25],
  [-43, 61, 35, -49, -29, -11, -63],
  [-10, 75, 23, -2, 32, 3, -45],
  [-39, -13, -29, -52, -48, -67, -166],
];

export function strengthSquareBad(board: BitBoard, player: i8): i16 {
  const opponentPlayer = opponent(player);
  const playerPawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);

  const pawnDefenseMask =
    player == WHITE
      ? ((playerPawnMask << 7) & rightBorderMask) |
        ((playerPawnMask << 9) & leftBorderMask)
      : ((playerPawnMask >> 7) & leftBorderMask) |
        ((playerPawnMask >> 9) & rightBorderMask);

  const usMask = opponentPawnMask & ~pawnDefenseMask;

  let v: i16 = 5 * 64;

  let yMask: u64 = 0;

  if (player == WHITE) {
    for (let y = 0; y < 8; y++) {
      yMask |= firstRowMask << (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(clz(usMask & colMask & yMask) >> 3) % 8;
        const f = x > 3 ? 7 - x : x;
        v += weakness[f][us] * xFactors[x];
      }
    }
  } else {
    for (let y = 0; y < 8; y++) {
      yMask |= lastRowMask >> (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(ctz(usMask & colMask & yMask) >> 3) % 8;
        const f = x > 3 ? 7 - x : x;
        v += weakness[f][us] * xFactors[x];
      }
    }
  }

  return v;
}

const whiteStrengthSquareArray = new StaticArray<i16>(64);
const blackStrengthSquareArray = new StaticArray<i16>(64);
const tempStrengthSquareArray = new StaticArray<i16>(64);

export function strengthSquare(board: BitBoard, player: i8): StaticArray<i16> {
  const opponentPlayer = opponent(player);
  const playerPawnMask = board.getPawnMask(player);
  const opponentPawnMask = board.getPawnMask(opponentPlayer);

  const pawnDefenseMask =
    player == WHITE
      ? ((playerPawnMask << 7) & rightBorderMask) |
        ((playerPawnMask << 9) & leftBorderMask)
      : ((playerPawnMask >> 7) & leftBorderMask) |
        ((playerPawnMask >> 9) & rightBorderMask);

  const usMask = opponentPawnMask & ~pawnDefenseMask;

  let yMask: u64 = 0;

  let result: StaticArray<i16>;

  if (player == WHITE) {
    for (let y = 0; y < 8; y++) {
      yMask |= firstRowMask << (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(clz(usMask & colMask & yMask) >> 3) % 8;
        const f = x > 3 ? 7 - x : x;
        tempStrengthSquareArray[(y << 3) + x] = weakness[f][us];
      }
    }
    result = aggregateSquares(
      tempStrengthSquareArray,
      whiteStrengthSquareArray
    );
  } else {
    for (let y: i8 = 7; y >= 0; y--) {
      yMask |= firstRowMask << (y << 3);
      for (let x = 0; x < 8; x++) {
        const colMask = firstColMask << x;
        const us = <i8>(ctz(usMask & colMask & yMask) >> 3) % 8;
        const f = x > 3 ? 7 - x : x;
        tempStrengthSquareArray[(y << 3) + x] = weakness[f][us];
      }
    }
    result = aggregateSquares(
      tempStrengthSquareArray,
      blackStrengthSquareArray
    );
  }
  for (let i = 0; i < 64; i++) {
    result[i] += 5;
  }

  return result;
}

const shelterStormAndStrengthResult = new StaticArray<i16>(2);
export function shelterStormAndStrength(
  board: BitBoard,
  player: i8
): StaticArray<i16> {
  let w: i16 = 0;
  let s: i16 = 1024;
  const strengthSquares = strengthSquare(board, player);
  const stormSquares = stormSquare(board, player);
  const opponentPlayer = opponent(player);
  const opponentkingPos = <i8>ctz(board.getKingMask(opponentPlayer));
  let w1 = strengthSquares[opponentkingPos];
  let s1 = stormSquares[opponentkingPos];
  if (s1 - w1 < s - w) {
    s = s1;
    w = w1;
  }
  const opponentKingRow: i8 = player == WHITE ? 56 : 0;
  if (board.kingSideCastlingRight(opponentPlayer)) {
    const kingSideCastlingPos = opponentKingRow + 6;
    w1 = strengthSquares[kingSideCastlingPos];
    s1 = stormSquares[kingSideCastlingPos];
    if (s1 - w1 < s - w) {
      s = s1;
      w = w1;
    }
  }
  if (board.queenSideCastlingRight(opponentPlayer)) {
    const queenSideCastlingPos = opponentKingRow + 2;
    w1 = strengthSquares[queenSideCastlingPos];
    s1 = stormSquares[queenSideCastlingPos];
    if (s1 - w1 < s - w) {
      s = s1;
      w = w1;
    }
  }
  shelterStormAndStrengthResult[0] = s;
  shelterStormAndStrengthResult[1] = w;
  return shelterStormAndStrengthResult;
}

export function kingDanger(board: BitBoard, player: i8): i16 {
  const count: i16 = kingAttackersCount(board, player);
  const weight: i16 = kingAttackersWeight(board, player);
  const attacks: i16 = kingAttacks(board, player);
  const weak: i16 = weakBonus(board, player);
  //log(maskString(unsafeChecksMask(board, player)))
  const unsafeChecks: i16 = <i16>popcnt(unsafeChecksMask(board, player)); // unsafeChecksMask
  const blockersForKing: i16 = <i16>popcnt(blockersForKingMask(board, player)); // blockersForKingMask
  const kingFlankAttack: i16 = flankAttack(board, player);
  const kingFlankDefense: i16 = flankDefense(board, player);
  const noQueen: i16 = !board.getQueenMask(player) ? 1 : 0;
  const stormAndStrength = shelterStormAndStrength(board, player);
  /*log(
    "count " +
      count.toString() +
      "\nweight " +
      weight.toString() +
      "\nattacks " +
      attacks.toString() +
      "\nweak " +
      weak.toString() +
      "\nunsafeChecks " +
      unsafeChecks.toString() +
      "\nblockersForKing " +
      blockersForKing.toString() +
      "\nkingFlankAttack " +
      kingFlankAttack.toString() +
      "\nkingFlankDefense " +
      kingFlankDefense.toString() +
      "\nnoQueen " +
      noQueen.toString() +
      "\nmobility " +
      mobilityFor(board, player, true).toString() +
      "\nplayer " +
      player.toString()
  );*/

  const v: i16 =
    count * weight +
    69 * attacks +
    185 * weak -
    100 * (knightDefender(board, opponent(player)) > 0 ? 1 : 0) + //  (knight_defender(colorflip(board, player)) > 0)
    148 * unsafeChecks +
    98 * blockersForKing -
    4 * kingFlankDefense +
    ((3 * kingFlankAttack * kingFlankAttack) >> 3) -
    873 * noQueen -
    ((3 * (stormAndStrength[1] - stormAndStrength[0])) >> 2) +
    mobilityFor(board, player, true) - mobilityFor(board,  opponent(player), true) +
    37 +
    safeCheckQueen(board, player) +
    safeCheckRook(board, player) +
    safeCheckBishop(board, player) +
    safeCheckKnight(board, player);
  if (v > 100) return v;
  return 0;
}

function safeCheckKnight(board: BitBoard, player: i8): i16 {
  const checks = <i16>popcnt(safeChecksMask(board, player, KNIGHT));
  return checks > 1 ? 1283 : checks * 792;
}
function safeCheckBishop(board: BitBoard, player: i8): i16 {
  const checks = <i16>popcnt(safeChecksMask(board, player, BISHOP));
  return checks > 1 ? 967 : checks * 645;
}
function safeCheckRook(board: BitBoard, player: i8): i16 {
  const checks = <i16>popcnt(safeChecksMask(board, player, ROOK));
  return checks > 1 ? 1897 : checks * 1084;
}
function safeCheckQueen(board: BitBoard, player: i8): i16 {
  const checks = <i16>popcnt(safeChecksMask(board, player, QUEEN));
  return checks > 1 ? 1119 : checks * 772;
}

const flankMasks = new StaticArray<u64>(8);
function initFlankMasks(): void {
  flankMasks[0] = firstColMask | (firstColMask << 1) | (firstColMask << 2);
  flankMasks[1] =
    firstColMask |
    (firstColMask << 1) |
    (firstColMask << 2) |
    (firstColMask << 3);
  flankMasks[2] =
    firstColMask |
    (firstColMask << 1) |
    (firstColMask << 2) |
    (firstColMask << 3);
  flankMasks[3] =
    (firstColMask << 2) |
    (firstColMask << 3) |
    (firstColMask << 4) |
    (firstColMask << 5);
  flankMasks[4] =
    (firstColMask << 2) |
    (firstColMask << 3) |
    (firstColMask << 4) |
    (firstColMask << 5);
  flankMasks[5] =
    (firstColMask << 4) |
    (firstColMask << 5) |
    (firstColMask << 6) |
    (firstColMask << 7);
  flankMasks[6] =
    (firstColMask << 4) |
    (firstColMask << 5) |
    (firstColMask << 6) |
    (firstColMask << 7);
  flankMasks[7] =
    (firstColMask << 5) | (firstColMask << 6) | (firstColMask << 7);
}
initFlankMasks();
export function pawnlessFlank(board: BitBoard, player: i8): boolean {
  const kingMask = board.getKingMask(opponent(player));
  const kingPosition = <i8>(ctz(kingMask) & 7);
  return (
    popcnt(
      flankMasks[kingPosition] &
        (board.getPawnMask(player) | board.getPawnMask(opponent(player)))
    ) == 0
  );
}

export function kingMg(board: BitBoard, player: i8): i16 {
  let result: i16 = 0;
  const kd = kingDanger(board, player);
  const stormAndStrength = shelterStormAndStrength(board, player);
  result -= stormAndStrength[1];
  result += stormAndStrength[0];
  result += <i16>((<i32>kd * <i32>kd) >> 12);
  result += flankAttack(board, player) << 3;
  if (pawnlessFlank(board, player)) {
    result += 17;
  }

  /*log(
    "player " + (player == WHITE ? 'WHITE' : 'BLACK') +
    "kd " +
      kd.toString() +
      "\nshelter_strength " +
      stormAndStrength[1].toString() +
      "\nshelter_storm " +
      stormAndStrength[0].toString() 
      + "\nflankAttack " +
      flankAttack(board, player).toString()
      + "\npawnlessFlank " +
      pawnlessFlank(board, player).toString()
      + "\n(kd * kd) >> 12 " +
     ((kd * kd) >> 12).toString()
  );*/
  return result;
}

export function kingEg(board: BitBoard, player: i8): i16 {
  let result: i16 = 0;
  result -= kingPawnDistance(board, player) << 4;
  // TODO end game shelter...
  if (pawnlessFlank(board, player)) {
    result += 95;
  }
  result += kingDanger(board, player) >> 4;
  return result;
}

export function kingPawnDistance(board: BitBoard, player: i8): i16 {
  const kingMask = board.getKingMask(player);
  const kingPosition = <i8>ctz(kingMask);

  const kingPosX: i8 = kingPosition % 8;
  const kingPosY: i8 = kingPosition >> 3;

  let distance: i16 = 6;
  positions.reset(board.getPawnMask(player));
  while (positions.hasNext()) {
    const pawnPos = positions.next();
    const pawnPosX: i8 = pawnPos % 8;
    const pawnPosY: i8 = pawnPos >> 3;
    distance = <i16>Math.min(distance, <i16>Math.max(Math.abs(pawnPosX - kingPosX), Math.abs(pawnPosY - kingPosY)))
  }
  return distance;
}
