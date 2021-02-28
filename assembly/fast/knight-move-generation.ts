import { getKnightMoves } from "./knight";

const knightMoveCache: StaticArray<u64> = new StaticArray<u64>(64);
function initKnightMoveCache(): void {
  for (let position: i8 = 0; position < 64; position++) {
    knightMoveCache[position] = getKnightMoves(position);
  }
}
initKnightMoveCache();

export function knightMoves(board: u64, pos: i8): u64 {
  return knightMoveCache[pos];
}
