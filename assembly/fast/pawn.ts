import { leftBorderMask, rightBorderMask } from "./bitboard";

export function pawnAttacks(player: i8, pawnMask: u64): u64 {
  return player
    ? ((pawnMask >> 7) & leftBorderMask) | ((pawnMask >> 9) & rightBorderMask)
    : ((pawnMask << 7) & rightBorderMask) | ((pawnMask << 9) & leftBorderMask);
}
