import { BitBoard, opponent } from "./bitboard";
import { legalMoves } from "./engine";

export function perft(depth: i8, board: BitBoard, player: i8): u64 {
  const boards = legalMoves(board, player);
  if (depth === 1 || boards.length === 0) {
    return boards.length;
  }
  let result: u64 = 0;
  for (let index = 0; index < boards.length; index++) {
    const b = boards[index];
    result += perft(depth - 1, b, opponent(player));
  }
  return result;
}
