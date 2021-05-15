import { BitBoard } from "./bitboard";
import { addCastlingMoves } from "./castling";
import { addKingPseudoLegalMoves } from "./king-move-generation";
import { addKnightPseudoLegalMoves } from "./knight-move-generation";
import { addPawnPseudoLegalMoves } from "./pawn";
import {
  addBishopPseudoLegalMoves,
  addQueenPseudoLegalMoves,
  addRookPseudoLegalMoves,
} from "./sliding-pieces-move-generation";
import { isInCheck } from "./status";

export function removeCheckedBoardFrom(
  moves: u32[],
  board: BitBoard,
  player: i8
): BitBoard[] {
  const result: BitBoard[] = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const nextBoard = board.execute(move);
    if (!isInCheck(player, nextBoard)) {
      result.push(nextBoard);
    }
  }
  return result;
}

export function pseudoLegalMoves(board: BitBoard, player: i8): u32[] {
  const moves: u32[] = [];
  addCastlingMoves(moves, board, player);
  addPawnPseudoLegalMoves(moves, board, player);
  addKnightPseudoLegalMoves(moves, board, player);
  addBishopPseudoLegalMoves(moves, board, player);
  addRookPseudoLegalMoves(moves, board, player);
  addQueenPseudoLegalMoves(moves, board, player);
  addKingPseudoLegalMoves(moves, board, player);

  return moves;
}

function hasLegalMove(moves: u32[], board: BitBoard, player: i8): boolean {
  while (moves.length > 0) {
    const move: u32 = moves.pop();
    board.do(move);
    if (!isInCheck(player, board)) {
      board.undo();
      return true;
    }
    board.undo();
  }
  return false;
}

export function canMove(board: BitBoard, player: i8): boolean {
  const moves: u32[] = [];
  addPawnPseudoLegalMoves(moves, board, player);
  if (hasLegalMove(moves, board, player)) {
    return true;
  }
  addKnightPseudoLegalMoves(moves, board, player);
  if (hasLegalMove(moves, board, player)) {
    return true;
  }
  addBishopPseudoLegalMoves(moves, board, player);
  if (hasLegalMove(moves, board, player)) {
    return true;
  }
  addRookPseudoLegalMoves(moves, board, player);
  if (hasLegalMove(moves, board, player)) {
    return true;
  }
  addQueenPseudoLegalMoves(moves, board, player);
  if (hasLegalMove(moves, board, player)) {
    return true;
  }
  addKingPseudoLegalMoves(moves, board, player);
  if (hasLegalMove(moves, board, player)) {
    return true;
  }

  return false;
}

export function legalMoves(board: BitBoard, player: i8): BitBoard[] {
  const moves: u32[] = pseudoLegalMoves(board, player);

  return removeCheckedBoardFrom(moves, board, player);
}
