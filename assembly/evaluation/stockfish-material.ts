import { BitBoard } from "../bitboard";

export function nonPawnMaterial(board: BitBoard, player: i8): i16 {
  const bonus: i16[] = [0, 0, 781, 781, 825, 825, 1276, 1276, 2538, 2538];
  let result: i16 = 0;
  for (let piece = 2; piece < 10; piece += 2) {
    const pieceMask = unchecked(board.bits[piece + player]);

    result += <i16>popcnt(pieceMask) * unchecked(bonus[piece + player]);
  }
  return result;
}
