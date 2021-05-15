import { leftBorderMask, rightBorderMask } from "./bitboard";

export function getKingMoves(pos: i8): u64 {
  const position: u64 = 1 << pos;
  const moves: u64 =
    ((position >> 1) & rightBorderMask) +
    ((position << 1) & leftBorderMask) +
    ((position << 7) & rightBorderMask) +
    (position << 8) +
    ((position << 9) & leftBorderMask) +
    ((position >> 7) & leftBorderMask) +
    (position >> 8) +
    ((position >> 9) & rightBorderMask);
  return moves;
}
