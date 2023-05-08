import {
  BitBoard,
  firstColMask,
  firstRowMask,
  lastColMask,
  leftBorderMask,
  MaskIterator,
  opponent,
  rightBorderMask,
  WHITE,
} from "../bitboard";
import { attackOnceMask, attackTwiceMask } from "./stockfish-attacks";

export function candidatePassedMask(board: BitBoard, player: i8): u64 {
  const pawnsMask = board.getPawnMask(player);
  const opponentPlayer = opponent(player);
  const opponentPawnsMask = board.getPawnMask(opponentPlayer);
  let resultMask: u64 = 0;
  for (let col: u64 = 0; col < 8; col++) {
    const colMask = firstColMask << col;
    const leftColMask = col == 0 ? 0 : firstColMask << (col - 1);
    const rightColMask = col == 7 ? 0 : firstColMask << (col + 1);
    const colPawnMask = colMask & pawnsMask;
    const leftOpponentColPawnMask = leftColMask & opponentPawnsMask;
    const rightOpponentColPawnMask = rightColMask & opponentPawnsMask;
    const opponentColPawnMask = colMask & opponentPawnsMask;

    if (colPawnMask != 0) {
      const pawnPos =
        player === WHITE ? <i8>clz(colPawnMask) : <i8>ctz(colPawnMask);
      const pawnMask =
        player === WHITE ? (<u64>1) << (63 - pawnPos) : (<u64>1) << pawnPos;
      const y = pawnPos >> 3;
      const opponentPawnPos =
        player === WHITE
          ? <i8>clz(opponentColPawnMask)
          : <i8>ctz(opponentColPawnMask);
      const ty1 = opponentPawnPos === 64 ? 8 : opponentPawnPos >> 3;
      const leftOpponentPawnPos =
        player === WHITE
          ? <i8>clz(leftOpponentColPawnMask)
          : <i8>ctz(leftOpponentColPawnMask);
      const rightOpponentPawnPos =
        player === WHITE
          ? <i8>clz(rightOpponentColPawnMask)
          : <i8>ctz(rightOpponentColPawnMask);
      const leftRightOpponentPawnPos = <i8>(
        Math.min(leftOpponentPawnPos, rightOpponentPawnPos)
      );
      const ty2 =
        leftRightOpponentPawnPos === 64 ? 8 : leftRightOpponentPawnPos >> 3;

      //if (ty1 == 8 && ty2 >= square.y - 1) return 1;
      if (ty1 === 8 && ty2 >= y - 1) {
        resultMask |= pawnMask;
        continue;
      }
      //if (ty2 < square.y - 2 || ty1 < square.y - 1) return 0;
      if (ty2 < y - 2 || ty1 < y - 1) {
        continue;
      }
      //if (ty2 >= square.y && ty1 == square.y - 1 && square.y < 4) {
      if (ty2 >= y && ty1 == y - 1 && y < 4) {
        if (col > 1) {
          const neighborMask = pawnMask >> 9;
          const opponentNeighborsMask = (pawnMask >> 1) | (pawnMask << 6);
          if (
            neighborMask & pawnsMask &&
            (opponentNeighborsMask & opponentPawnsMask) === 0
          ) {
            resultMask |= pawnMask;
            continue;
          }
        }
        if (col < 6) {
          const neighborMask = pawnMask >> 7;
          const opponentNeighborsMask = (pawnMask << 1) | (pawnMask << 10);
          if (
            neighborMask & pawnsMask &&
            (opponentNeighborsMask & opponentPawnsMask) === 0
          ) {
            resultMask |= pawnMask;
            continue;
          }
        }
      }

      const nextRowMask = player === WHITE ? pawnMask << 8 : pawnMask >> 8;
      if (popcnt(nextRowMask & opponentPawnsMask) > 0) {
        continue;
      }

      const phalanxMask =
        ((pawnMask >> 1) & rightBorderMask) |
        ((pawnMask << 1) & leftBorderMask);
      const phalanx = popcnt(phalanxMask & pawnsMask);
      const leverPushMask =
        player === WHITE
          ? ((pawnMask << 15) & rightBorderMask) |
            ((pawnMask << 17) & leftBorderMask)
          : ((pawnMask >> 15) & leftBorderMask) |
            ((pawnMask >> 17) & rightBorderMask);
      const leverPush = popcnt(leverPushMask & opponentPawnsMask);
      if (phalanx >= leverPush) {
        resultMask |= pawnMask;
      }
    }
  }
  return resultMask;
}

export function passedLeverageMask(board: BitBoard, player: i8): u64 {
  const currentCandidatePassedMask = candidatePassedMask(board, player);
  const opponentPlayer = opponent(player);
  const opponentPawnsMask = board.getPawnMask(opponentPlayer);

  const candidatePassedWithoutOpponentPasserMask =
    currentCandidatePassedMask &
    ~(player === WHITE ? opponentPawnsMask >> 8 : opponentPawnsMask << 8);

  const attackMask = attackOnceMask(board, player);
  const opponentAttackLessThanTwiceMask = ~(
    attackTwiceMask(board, opponentPlayer) &
    ~attackOnceMask(board, opponentPlayer)
  );

  const attacksMask =
    ~board.getPlayerPiecesMask(opponentPlayer) &
    (attackMask | opponentAttackLessThanTwiceMask);
  const pawnMask =
    player === WHITE
      ? board.getPawnMask(player) << 8
      : board.getPawnMask(player) >> 8;
  const mask =
    ((attacksMask << 1) & (pawnMask << 1) & leftBorderMask) |
    ((attacksMask >> 1) & (pawnMask >> 1) & rightBorderMask);

  return (
    candidatePassedWithoutOpponentPasserMask |
    (currentCandidatePassedMask & mask)
  );
}

const whitePassedRanksArray = new StaticArray<i16>(8);
const blackPassedRanksArray = new StaticArray<i16>(8);
export function passedRanks(board: BitBoard, player: i8): StaticArray<i16> {
  let mask = passedLeverageMask(board, player);
  if (player === WHITE) {
    for (let y = 0; y < 8; y++) {
      let countForRank: i16 = 0;
      for (let x = 0; x < 8; x++) {
        if (mask & 1) {
          countForRank++;
        }
        mask = mask >> 1;
      }
      whitePassedRanksArray[y] = countForRank;
    }
    return whitePassedRanksArray;
  }

  for (let y = 0; y < 8; y++) {
    let countForRank: i16 = 0;
    for (let x = 0; x < 8; x++) {
      if (mask & 1) {
        countForRank++;
      }
      mask = mask >> 1;
    }
    blackPassedRanksArray[7 - y] = countForRank;
  }
  return blackPassedRanksArray;
}

const whiteRankMask = ~(
  firstRowMask |
  (firstRowMask << 8) |
  (firstRowMask << 16)
);
const blackRankMask = ~(
  (firstRowMask << 40) |
  (firstRowMask << 48) |
  (firstRowMask << 56)
);

const positions = new MaskIterator();

export function passedBlockBonus(board: BitBoard, player: i8): i16 {
  let mask = passedLeverageMask(board, player);
  mask = player == WHITE ? mask & whiteRankMask : mask & blackRankMask;

  const allBlockerPiecesMask =
    player == WHITE
      ? board.getAllPiecesMask() >> 8
      : board.getAllPiecesMask() << 8;
  mask = mask & ~allBlockerPiecesMask;
  const attackMask = attackOnceMask(board, player);
  const opponentPlayer = opponent(player);
  const opponentAttackMask = attackOnceMask(board, opponentPlayer);
  const rookMask = board.getRookMask(player);
  const opponentRookMask = board.getRookMask(opponentPlayer);
  const queenMask = board.getQueenMask(player);
  const opponentQueenMask = board.getQueenMask(opponentPlayer);

  let result = <i16>0;

  positions.reset(mask);
  while (positions.hasNext()) {
    const position = positions.next();
    const aheadPawnMask =
      (player == WHITE
        ? ~(((<u64>1) << position) - 1)
        : ((<u64>1) << position) - 1) &
      (firstColMask << (position & 7));
    const behindPawnMask = ~aheadPawnMask & (firstColMask << (position & 7));
    const aheadLeftPawnMask = (aheadPawnMask >> 1) & rightBorderMask;
    const aheadRightPawnMask = (aheadPawnMask << 1) & leftBorderMask;
    //const defended = !!(aheadPawnMask & attackMask);
    const aheadOffset = player == WHITE ? 8 : -8;
    const defended1 =
      !!(((<u64>1) << (position + aheadOffset)) & attackMask) ||
      !!((rookMask | queenMask) & behindPawnMask);
    const unsafe1 =
      !!(((<u64>1) << (position + aheadOffset)) & opponentAttackMask) ||
      !!((opponentRookMask | opponentQueenMask) & behindPawnMask);
    const unsafe =
      !!(aheadPawnMask & opponentAttackMask) ||
      !!((opponentRookMask | opponentQueenMask) & behindPawnMask);
    const wunsafe =
      !!(aheadLeftPawnMask & opponentAttackMask) ||
      !!(aheadRightPawnMask & opponentAttackMask);
    const r =
      player == WHITE ? <i16>(position >> 3) : <i16>((63 - position) >> 3);
    const w = r > 2 ? <i16>5 * r - <i16>13 : <i16>0;
    const k =
      (!unsafe && !wunsafe
        ? <i16>35
        : !unsafe
        ? <i16>20
        : !unsafe1
        ? <i16>9
        : <i16>0) + (defended1 ? <i16>5 : <i16>0);

    result += w * k;
  }
  return result;
}

export function passedFileBonus(board: BitBoard, player: i8): i16 {
  const passedLeverage = passedLeverageMask(board, player);
  let result = <u64>0;
  for (let col: u64 = 1; col < 4; col++) {
    result += popcnt(passedLeverage & (firstColMask << col)) * col;
    result += popcnt(passedLeverage & (lastColMask >> col)) * col;
  }
  return <i16>result;
}

const mgPassedRankScores = StaticArray.fromArray<i16>([
  0, 10, 17, 15, 62, 168, 276,
]);
export function passedMg(board: BitBoard, player: i8): i16 {
  if (passedLeverageMask(board, player) == 0) {
    return 0;
  }
  let result: i16 = 0;
  const ranks = passedRanks(board, player);
  for (let index: i8 = 1; index < 7; index++) {
    result += ranks[index] * mgPassedRankScores[index];
  }
  result += passedBlockBonus(board, player);
  result -= 11 * passedFileBonus(board, player);
  return result;
}
