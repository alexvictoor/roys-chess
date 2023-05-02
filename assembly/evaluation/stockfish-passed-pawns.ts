import {
  BitBoard,
  firstColMask,
  leftBorderMask,
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
  const opponentAttackLessThanTwiceMask = ~(attackTwiceMask(board, opponentPlayer) & ~attackOnceMask(board, opponentPlayer));

  const attacksMask = ~board.getPlayerPiecesMask(opponentPlayer) & (attackMask | opponentAttackLessThanTwiceMask);
  const pawnMask = (player === WHITE) ? (board.getPawnMask(player) << 8) : (board.getPawnMask(player) >> 8)
  const mask = ((attacksMask << 1) & (pawnMask << 1) & leftBorderMask) | ((attacksMask >> 1) & (pawnMask >> 1) & rightBorderMask);

  return candidatePassedWithoutOpponentPasserMask | (currentCandidatePassedMask & mask);
}
