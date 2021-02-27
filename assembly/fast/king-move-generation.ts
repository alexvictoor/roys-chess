import { getKingMoves } from "./king";

const kingMoveCache: StaticArray<u64> = new StaticArray<u64>(64);
function initKingMoveCache() {
  for (let position: i8 = 0; position < 64; position++) {
    kingMoveCache[position] = getKingMoves(position);
  }
}
initKingMoveCache();

export function getKingPseudoLegalMoves(board: u64, pos: i8): u64 {
  return kingMoveCache[pos];
}
