import { BitBoard, opponent } from "./bitboard";
import { legalMoves, pseudoLegalMoves } from "./engine";
import { isInCheck } from "./status";

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

export function perft2(depth: i8, board: BitBoard, player: i8): u64 {
  const moves = pseudoLegalMoves(board, player);
  if (moves.length === 0) {
    return 0;
  }
  if (depth === 1) {
    let count = 0;
    for (let index = 0; index < moves.length; index++) {
      board.do(unchecked(moves[index]));
      if (!isInCheck(player, board)) {
        count++;
      }
      board.undo();
    }
    return count;
  }
  let result: u64 = 0;
  const d = depth - 1;
  const opponentPlayer = opponent(player);
  for (let index = 0; index < moves.length; index++) {
    board.do(unchecked(moves[index]));
    if (!isInCheck(player, board)) {
      result += perft2(d, board, opponentPlayer);
    }
    board.undo();
  }
  return result;
}
