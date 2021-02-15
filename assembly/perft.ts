import { initialBoard } from "./bitboard";
import { Board, opponent, WHITE } from "./chess";
import { legalMoves } from "./engine";

export function perft(
  depth: i8,
  board: Board = initialBoard,
  player: i8 = WHITE
): i32 {
  const moves = legalMoves(player, board);
  if (depth === 1 || moves.length === 0) {
    return moves.length;
  }
  let result: i32 = 0;
  const opponentPlayer = opponent(player);
  for (let index = 0; index < moves.length; index++) {
    const m = moves[index];
    result += perft(depth - 1, m.board, opponentPlayer);
  }
  return result;
}
