import { leftBorderMask, rightBorderMask } from "./bitboard";

const doubleRightBorderMask = ~((~rightBorderMask >> 1) | ~rightBorderMask);
const doubleLeftBorderMask = ~((~leftBorderMask << 1) | ~leftBorderMask);

export function getKnightMoves(position: i8): u64 {
  const pos: u64 = 1 << position;
  return (
    ((pos << 10) & doubleLeftBorderMask) +
    ((pos << 17) & leftBorderMask) +
    ((pos << 15) & rightBorderMask) +
    ((pos << 6) & doubleRightBorderMask) +
    ((pos >> 10) & doubleRightBorderMask) +
    ((pos >> 17) & rightBorderMask) +
    ((pos >> 15) & leftBorderMask) +
    ((pos >> 6) & doubleLeftBorderMask)
  );
}
